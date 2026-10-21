/* Dữ liệu thị trường thật (GAS.md II.E — nguồn API công khai KHÔNG chính thức, chốt 20/10):
     - VPS bgapidatafeed  : giá khớp / tham chiếu cổ phiếu (gần realtime)
     - DNSE chart-api     : điểm chỉ số (nến ngày), nến 5 phút chỉ số (diễn biến trong phiên),
                            nến ngày cổ phiếu (biểu đồ 3 tháng)
   ⚠️ VPS CHẬP CHỜN khi gọi từ máy chủ Cloudflare (đo 20/10: colo SIN treo, HKG lúc được lúc
   không; endpoint chỉ số getlistindexdetail treo hẳn) dù gọi từ máy thường vẫn chạy. DNSE luôn
   trả ~0,2–0,5s. Nên: chỉ số lấy từ DNSE; giá cổ phiếu thử VPS (timeout 3s), lỗi thì lấy DNSE
   (nến ngày: giá = nến cuối, tham chiếu = nến kế cuối). Mọi lần gọi đều có timeout.
   Nguồn không cam kết, có thể đổi / chặn bất cứ lúc nào -> mỗi phần lưu bản gần nhất vào D1
   (market_snapshots), nguồn lỗi thì trả bản cũ kèm stale = true, website ghi "Cập nhật lúc HH:mm".
   Danh sách mã lấy từ /assets/market-symbols.json (build sinh từ data/settings.json). */

const VPS = "https://bgapidatafeed.vps.com.vn";
const DNSE = "https://services.entrade.com.vn/chart-api/v2/ohlcs";
// Mã chỉ số trên site (settings.indices[].code) -> mã của 2 nguồn. Chỉ số khác không hỗ trợ.
const INDEX_MAP = {
  "VN-Index": { dnse: "VNINDEX" },
  VN30: { dnse: "VN30" },
  HNX: { dnse: "HNX" },
  UPCoM: { dnse: "UPCOM" },
};
const FETCH_TIMEOUT_MS = 8000;
const HISTORY_DAYS = 100; // ~65 phiên -> biểu đồ 3 tháng

/** 9:00–15:00 thứ 2–6 giờ Việt Nam (UTC+7). */
function isTradingHours(now = new Date()) {
  const vn = new Date(now.getTime() + 7 * 3600 * 1000);
  const day = vn.getUTCDay();
  const mins = vn.getUTCHours() * 60 + vn.getUTCMinutes();
  return day >= 1 && day <= 5 && mins >= 9 * 60 && mins <= 15 * 60 + 5;
}

async function getJson(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const res = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "Mozilla/5.0 (dautucungvu.com)" },
    signal: AbortSignal.timeout(timeoutMs), // nguồn treo -> lỗi nhanh, dùng nguồn khác / bản lưu D1
  });
  if (!res.ok) throw new Error(url.split("?")[0] + " -> " + res.status);
  return res.json();
}

const num = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));
const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;

/** Giá cổ phiếu từ VPS (gần realtime, có giá tham chiếu chuẩn của sàn). */
async function vpsStocks(codes) {
  const stocks = await getJson(VPS + "/getliststockdata/" + codes.join(","), 3000);
  return stocks.map((s) => {
    const ref = num(s.r);
    const last = num(s.lastPrice) > 0 ? num(s.lastPrice) : ref; // chưa khớp lệnh nào -> giá tham chiếu
    return { code: s.sym, price: last, ref, change: ref ? round(((last - ref) / ref) * 100, 2) : 0, volume: num(s.lot) || 0, source: "vps" };
  });
}

/** Dự phòng: giá từ nến ngày DNSE (nến cuối = phiên hiện tại / gần nhất, kế cuối = phiên trước). */
async function dnseStocks(codes, to) {
  return Promise.all(codes.map(async (code) => {
    const d = await getJson(`${DNSE}/stock?from=${to - 10 * 86400}&to=${to}&symbol=${code}&resolution=1D`);
    const c = (d.c || []).map(Number), v = d.v || [];
    if (c.length < 2) return null;
    const price = round(c[c.length - 1], 2), ref = round(c[c.length - 2], 2);
    return { code, price, ref, change: round(((price - ref) / ref) * 100, 2), volume: Number(v[v.length - 1]) || 0, source: "dnse" };
  })).then((list) => list.filter(Boolean));
}

async function fetchQuotes(symbols) {
  const to = Math.floor(Date.now() / 1000);
  const [tickers, indexBars] = await Promise.all([
    symbols.tickers.length
      ? vpsStocks(symbols.tickers).catch((err) => {
          console.warn("market: VPS lỗi, dùng DNSE", String(err));
          return dnseStocks(symbols.tickers, to);
        })
      : [],
    // Nến ngày 10 ngày gần nhất: nến cuối = phiên hiện tại / gần nhất, nến kế cuối = phiên trước
    Promise.all(symbols.indices.map((c) => fetchBars("index", INDEX_MAP[c].dnse, "1D", to - 10 * 86400, to))),
  ]);
  const indices = symbols.indices.map((code, i) => {
    const c = indexBars[i];
    if (c.length < 2) return { code };
    const value = c[c.length - 1], prev = c[c.length - 2];
    return { code, value, change: round(value - prev, 2) };
  });
  return { tickers, indices };
}

async function fetchBars(kind, symbol, resolution, fromSec, toSec) {
  const d = await getJson(`${DNSE}/${kind}?from=${fromSec}&to=${toSec}&symbol=${symbol}&resolution=${resolution}`);
  return (d.c || []).map((v) => round(Number(v), 2));
}

async function fetchIntraday(symbols) {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 3 * 86400; // đủ để luôn có phiên gần nhất (cả sáng thứ 2)
  const out = {};
  await Promise.all(symbols.indices.map(async (code) => {
    const d = await getJson(`${DNSE}/index?from=${from}&to=${to}&symbol=${INDEX_MAP[code].dnse}&resolution=5`);
    // Chỉ giữ nến của NGÀY giao dịch cuối cùng (giờ Việt Nam)
    const day = (t) => new Date((t + 7 * 3600) * 1000).toISOString().slice(0, 10);
    const t = d.t || [];
    const last = t.length ? day(t[t.length - 1]) : "";
    out[code] = (d.c || []).filter((_, i) => day(t[i]) === last).map((v) => round(Number(v), 2));
  }));
  return out;
}

async function fetchHistory(symbols) {
  const to = Math.floor(Date.now() / 1000);
  const from = to - HISTORY_DAYS * 86400;
  const out = {};
  await Promise.all(symbols.tickers.map(async (code) => {
    out[code] = await fetchBars("stock", code, "1D", from, to);
  }));
  return out;
}

/** Lấy 1 phần từ D1 nếu còn mới VÀ cùng danh sách mã (sig), không thì gọi nguồn; nguồn lỗi ->
 * bản cũ + stale. D1 lưu {sig, data}: CMS thêm / bớt mã -> sig đổi -> lấy lại ngay, không phải
 * chờ hết hạn (history 6 giờ: mã mới thêm từng trống biểu đồ tới 6 giờ). */
async function part(env, key, maxAgeMs, sig, fetcher) {
  const row = await env.DB.prepare("SELECT data, fetched_at FROM market_snapshots WHERE key = ?").bind(key).first();
  const saved = row ? JSON.parse(row.data) : null;
  const age = row ? Date.now() - Date.parse(row.fetched_at) : Infinity;
  if (saved && saved.sig === sig && age < maxAgeMs) return { data: saved.data, at: row.fetched_at, stale: false };
  try {
    const data = await fetcher();
    const at = new Date().toISOString();
    await env.DB.prepare(
      "INSERT INTO market_snapshots (key, data, fetched_at) VALUES (?1, ?2, ?3) ON CONFLICT(key) DO UPDATE SET data = ?2, fetched_at = ?3"
    ).bind(key, JSON.stringify({ sig, data }), at).run();
    return { data, at, stale: false };
  } catch (err) {
    console.warn("market: nguồn lỗi", key, String(err));
    // Bản lưu trước khi đổi định dạng {sig, data} (không có sig) vẫn dùng được làm dự phòng
    if (saved) return { data: "sig" in saved ? saved.data : saved, at: row.fetched_at, stale: true };
    throw err;
  }
}

async function loadSymbols(env) {
  const res = await env.ASSETS.fetch("https://assets.local/assets/market-symbols.json");
  if (!res.ok) throw new Error("thiếu market-symbols.json");
  const s = await res.json();
  return {
    tickers: (s.tickers || []).filter((c) => /^[A-Z0-9]{2,10}$/.test(c)),
    indices: (s.indices || []).filter((c) => INDEX_MAP[c]),
  };
}

async function buildMarket(env) {
  const symbols = await loadSymbols(env);
  const live = isTradingHours();
  const minute = 60 * 1000;
  const sig = symbols.tickers.join(",") + "|" + symbols.indices.join(",");
  const [quotes, intraday, history] = await Promise.all([
    part(env, "quotes", live ? 30 * 1000 : 5 * minute, sig, () => fetchQuotes(symbols)),
    part(env, "intraday", live ? 2 * minute : 30 * minute, sig, () => fetchIntraday(symbols)),
    part(env, "history", 6 * 60 * minute, sig, () => fetchHistory(symbols)),
  ]);
  const ti = quotes.data.tickers.reduce((m, t) => ((m[t.code] = t), m), {});
  return {
    updated_at: quotes.at,
    live,
    stale: quotes.stale || intraday.stale || history.stale,
    indices: quotes.data.indices.map((i) => ({ ...i, intraday: intraday.data[i.code] || [] })),
    tickers: symbols.tickers.filter((c) => ti[c]).map((c) => ({ ...ti[c], history: history.data[c] || [] })),
  };
}

/** GET /api/market — cache ở edge (30s trong phiên, 5 phút ngoài phiên) để nhiều người xem
 * cùng lúc không gọi nguồn ngoài lặp lại. */
export async function handleMarket(request, env, ctx) {
  const cache = caches.default;
  const key = new Request(new URL("/api/market", request.url).toString(), { method: "GET" });
  const hit = await cache.match(key);
  if (hit) return hit;
  const body = await buildMarket(env);
  const res = new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=" + (body.live ? 30 : 300),
    },
  });
  ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}

/* ---------- Biểu đồ nến 1 mã (trang Tin tức, khi bấm mã) ----------
   GET /api/market/chart/<MÃ>/<5m|1D|1W|1M>. Chỉ tải khi người xem bấm mã (không gộp vào
   /api/market: toàn bộ lịch sử mọi mã quá nặng). Nguồn DNSE: nến ngày có từ 2012 (giá đã điều
   chỉnh cổ tức / chia tách), nến 5 phút ~1 tháng. DNSE không có nến tháng, nến tuần chỉ từ 2021
   -> tuần / tháng tự gộp từ nến ngày. Mỗi mã lưu D1 2 bản: chart:<MÃ>:1D (toàn bộ nến ngày),
   chart:<MÃ>:5m. Thời gian trả về theo giờ Việt Nam: ngày "YYYY-MM-DD"; nến 5 phút là số giây
   đã cộng 7 giờ (thư viện biểu đồ hiển thị theo UTC). */
const CHART_TF = ["5m", "1D", "1W", "1M"];
const VN = 7 * 3600;
const vnDate = (sec) => new Date((sec + VN) * 1000).toISOString().slice(0, 10);

async function dnseOhlc(code, resolution, fromSec) {
  const d = await getJson(`${DNSE}/stock?from=${fromSec}&to=${Math.floor(Date.now() / 1000)}&symbol=${code}&resolution=${resolution}`);
  const t = d.t || [];
  return { t, o: (d.o || []).map(Number), h: (d.h || []).map(Number), l: (d.l || []).map(Number), c: (d.c || []).map(Number), v: (d.v || []).map(Number) };
}

/** Gộp nến ngày (t = "YYYY-MM-DD") theo khoá kỳ (tuần: ngày thứ Hai, tháng: ngày 01). */
function groupBars(d, keyOf) {
  const out = { t: [], o: [], h: [], l: [], c: [], v: [] };
  d.t.forEach((day, i) => {
    const k = keyOf(day), n = out.t.length - 1;
    if (n >= 0 && out.t[n] === k) {
      out.h[n] = Math.max(out.h[n], d.h[i]);
      out.l[n] = Math.min(out.l[n], d.l[i]);
      out.c[n] = d.c[i];
      out.v[n] += d.v[i];
    } else {
      out.t.push(k); out.o.push(d.o[i]); out.h.push(d.h[i]); out.l.push(d.l[i]); out.c.push(d.c[i]); out.v.push(d.v[i]);
    }
  });
  return out;
}
const mondayOf = (day) => {
  const d = new Date(day + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
};

function chart5m(env, code, live) {
  return part(env, "chart:" + code + ":5m", live ? 60 * 1000 : 30 * 60 * 1000, "v1", async () => {
    const d = await dnseOhlc(code, "5", Math.floor(Date.now() / 1000) - 31 * 86400);
    return { ...d, t: d.t.map((s) => s + VN) };
  });
}

function chart1D(env, code, live) {
  return part(env, "chart:" + code + ":1D", live ? 2 * 60 * 1000 : 30 * 60 * 1000, "v1", async () => {
    const d = await dnseOhlc(code, "1D", 0);
    // Mỗi ngày 1 nến (DNSE có thể trả giờ khác nhau trong ngày) — giữ nến sau cùng của ngày
    const out = { t: [], o: [], h: [], l: [], c: [], v: [] };
    d.t.forEach((s, i) => {
      const day = vnDate(s), n = out.t.length - 1;
      const at = n >= 0 && out.t[n] === day ? n : out.t.push(day) - 1;
      out.o[at] = d.o[i]; out.h[at] = d.h[i]; out.l[at] = d.l[i]; out.c[at] = d.c[i]; out.v[at] = d.v[i];
    });
    return out;
  });
}

async function buildChart(env, code, tf) {
  const live = isTradingHours();
  if (tf === "5m") {
    const p = await chart5m(env, code, live);
    return { code, tf, live, updated_at: p.at, stale: p.stale, ...p.data };
  }
  const [p, p5] = await Promise.all([chart1D(env, code, live), chart5m(env, code, live).catch(() => null)]);
  // DNSE chỉ có nến ngày của phiên hôm nay sau khi đóng cửa -> gộp nến 5 phút các ngày mới hơn
  // nến ngày cuối (đã đối chiếu 20/10: gộp 5 phút khớp đúng O/H/L/C/V nến ngày DNSE)
  const daily = { t: p.data.t.slice(), o: p.data.o.slice(), h: p.data.h.slice(), l: p.data.l.slice(), c: p.data.c.slice(), v: p.data.v.slice() };
  if (p5) {
    const last = daily.t[daily.t.length - 1] || "";
    const extra = groupBars({ ...p5.data, t: p5.data.t.map((s) => new Date(s * 1000).toISOString().slice(0, 10)) }, (d) => d);
    extra.t.forEach((day, i) => {
      if (day <= last) return;
      daily.t.push(day); daily.o.push(extra.o[i]); daily.h.push(extra.h[i]); daily.l.push(extra.l[i]); daily.c.push(extra.c[i]); daily.v.push(extra.v[i]);
    });
  }
  const data = tf === "1W" ? groupBars(daily, mondayOf) : tf === "1M" ? groupBars(daily, (d) => d.slice(0, 8) + "01") : daily;
  const at = p5 && p5.at > p.at ? p5.at : p.at;
  return { code, tf, live, updated_at: at, stale: p.stale || !!(p5 && p5.stale), ...data };
}

/** GET /api/market/chart/<MÃ>/<khung> — cache edge 60s trong phiên / 10 phút ngoài phiên. */
export async function handleChart(request, env, ctx, code, tf) {
  const symbols = await loadSymbols(env);
  if (!symbols.tickers.includes(code) || !CHART_TF.includes(tf)) {
    return new Response(JSON.stringify({ error: "Không có biểu đồ cho mã / khung này" }), { status: 404, headers: { "content-type": "application/json; charset=utf-8" } });
  }
  const cache = caches.default;
  const key = new Request(new URL(`/api/market/chart/${code}/${tf}`, request.url).toString(), { method: "GET" });
  const hit = await cache.match(key);
  if (hit) return hit;
  const body = await buildChart(env, code, tf);
  const res = new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=" + (body.live ? 60 : 600),
    },
  });
  ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}

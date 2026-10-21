/* Trang tin tức: lọc theo mã cổ phiếu, chủ đề hoặc từ khóa; mới nhất lên đầu */
(function () {
  const { icon, fmt, norm, Charts, store, toast, escapeHtml, newsItem, newsSorted, tagLabel, newsUrl, url, Market } = UI;
  const D = APP_DATA;
  const PAGE = 6;
  const FKEY = "dtcv-follow";

  // Trạng thái lấy từ trang tĩnh: /tin-tuc/<mã viết thường>/ hoặc /tin-tuc/<chủ đề>/
  const page = document.body.dataset;
  const state = {
    ticker: D.tickers.some((t) => t.code === page.ticker) ? page.ticker : "",
    tag: D.newsTags.some((t) => t.id === page.tag) ? page.tag : "",
    q: "",
  };
  let limit = PAGE;
  let follows = store.get(FKEY, []);

  const $ = (s) => document.querySelector(s);
  const listEl = $("[data-ticker-list]");
  const topicsEl = $("[data-topics]");
  const quoteEl = $("[data-quote]");
  const chartEl = $("[data-chart]");
  const titleEl = $("[data-news-title]");
  const countEl = $("[data-news-count]");
  const chipsEl = $("[data-active-filters]");
  const newsEl = $("[data-news-list]");
  const moreWrap = $("[data-load-more-wrap]");
  const followBtn = $("[data-follow]");
  const input = document.getElementById("news-search");
  const sugEl = document.getElementById("news-suggest");

  /* ----- Banner decoration ----- */
  const art = $("[data-banner-art]");
  if (art) {
    art.innerHTML = Charts.candles(Charts.ohlc(46, "news-banner", 100, 0.05, 0.02), { w: 1200, h: 220, up: "#38bdf8", down: "#1e5bd8", ma: false });
    art.style.opacity = ".22";
    art.style.maskImage = "linear-gradient(90deg, transparent 20%, #000 80%)";
    art.style.webkitMaskImage = art.style.maskImage;
  }

  /* ----- Lọc ----- */
  // Một bài khớp từ khóa nếu tiêu đề, tóm tắt, mã, tên công ty hoặc chủ đề có chứa từ khóa đó
  function matchesQuery(n, q) {
    if (!q) return true;
    const hay = [n.title, n.excerpt]
      .concat(n.tags.map((t) => {
        const tk = D.tickers.find((x) => x.code === t);
        if (tk) return tk.code + " " + tk.name;
        const tg = D.newsTags.find((x) => x.id === t);
        return tg ? tg.label + " " + tg.keys.join(" ") : t;
      }))
      .join(" ");
    return norm(hay).includes(norm(q));
  }
  function filtered(s) {
    const f = s || state;
    return newsSorted(D.news.filter((n) => (!f.ticker || n.tags.includes(f.ticker)) && (!f.tag || n.tags.includes(f.tag)) && matchesQuery(n, f.q)));
  }

  /* ----- Chủ đề trong banner ----- */
  function renderTopics() {
    topicsEl.innerHTML =
      '<button type="button" class="topic" data-topic="" aria-pressed="' + !state.tag + '">Tất cả</button>' +
      D.newsTags.map((t) => '<button type="button" class="topic" data-topic="' + t.id + '" aria-pressed="' + (state.tag === t.id) + '">' + t.label + "</button>").join("");
  }

  /* ----- Danh sách mã bên trái ----- */
  function renderTickers() {
    const items = [{ code: "", label: "Toàn thị trường" }].concat(D.tickers.map((t) => ({ code: t.code, label: t.code, t })));
    listEl.innerHTML = items
      .map((x) => {
        const cnt = filtered({ ticker: x.code, tag: state.tag, q: state.q }).length;
        return (
          '<li><button type="button" data-ticker="' + x.code + '" aria-pressed="' + (x.code === state.ticker) + '">' +
          "<b>" + (x.t ? '<i style="background:' + x.t.color + '"></i>' : "") + x.label + (follows.includes(x.code) ? ' <span title="Đang theo dõi" style="color:var(--gold-500)">★</span>' : "") + "</b>" +
          '<span class="cnt">' + cnt + "</span>" +
          (x.t ? '<span class="chg num ' + fmt.cls(x.t.change) + '">' + fmt.price(x.t.price) + " " + fmt.pct(x.t.change) + "</span>" : "") +
          "</button></li>"
        );
      })
      .join("");
  }

  /* ----- Thẻ giá khi đang lọc theo mã ----- */
  function renderQuote() {
    const t = D.tickers.find((x) => x.code === state.ticker);
    quoteEl.hidden = !t;
    followBtn.hidden = !t;
    if (!t) return;
    const diff = t.price - t.ref;
    quoteEl.innerHTML =
      '<div class="quote-logo" style="background:' + t.color + '">' + t.code + "</div>" +
      "<div><h3>" + t.code + ' <span class="badge badge--soft">' + t.sector + '</span></h3><p class="co">' + t.name + "</p>" +
      '<div class="quote-price"><strong class="num">' + fmt.price(t.price) + '</strong><span class="num ' + fmt.cls(t.change) + '">' + fmt.pct(t.change) + (isFinite(diff) ? " (" + (diff >= 0 ? "+" : "") + fmt.int(Math.round(diff * 1000)) + ")" : "") + "</span></div></div>";
    const on = follows.includes(t.code);
    followBtn.setAttribute("aria-pressed", on);
    followBtn.innerHTML = icon(on ? "check" : "plus") + "<span>" + (on ? "Đang theo dõi" : "Theo dõi " + t.code) + "</span>";
  }

  /* ----- Biểu đồ nến khi đang lọc theo mã: 5 phút (~1 tháng) / ngày / tuần / tháng (toàn bộ
     lịch sử từ 2012), khối lượng + MA20 / MA50. Dữ liệu /api/market/chart/<MÃ>/<khung> chỉ tải khi
     bấm mã; thư viện TradingView Lightweight Charts (tự host, giấy phép Apache 2.0 — giữ logo
     TradingView theo điều kiện giấy phép) cũng chỉ tải khi cần. ----- */
  const TFS = [
    { id: "5m", label: "5 phút", show: 150 },
    { id: "1D", label: "Ngày", show: 130 },
    { id: "1W", label: "Tuần", show: 110 },
    { id: "1M", label: "Tháng", show: 0 }, // 0 = vừa khung toàn bộ lịch sử
  ];
  const MAS = [{ n: 20, color: "#f08a1c" }, { n: 50, color: "#7c3aed" }];
  const UP = "#16a34a", DOWN = "#e0393e";
  const chartState = { code: "", tf: "1D", chart: null, candle: null, vol: null, ma: [], bars: [], req: 0 };
  const chartCache = {}; // "MÃ/khung" -> {at, data}: bấm qua lại giữa các khung không tải lại
  let libPromise = null;

  function loadLib() {
    if (window.LightweightCharts) return Promise.resolve();
    libPromise = libPromise || new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = url("vendor/lightweight-charts/lightweight-charts.standalone.production.js");
      s.onload = resolve;
      s.onerror = () => { libPromise = null; reject(new Error("không tải được thư viện biểu đồ")); };
      document.head.appendChild(s);
    });
    return libPromise;
  }

  function fetchChart(code, tf, fresh) {
    const k = code + "/" + tf, c = chartCache[k];
    if (!fresh && c && Date.now() - c.at < 60000) return Promise.resolve(c.data);
    return fetch(url("api/market/chart/" + code + "/" + tf), { headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then((d) => ((chartCache[k] = { at: Date.now(), data: d }), d));
  }

  function chartShell() {
    chartEl.innerHTML =
      '<div class="chart-head"><div class="tabs" role="tablist" aria-label="Khung thời gian mỗi nến">' +
      TFS.map((f) => '<button type="button" class="tab" role="tab" data-tf="' + f.id + '" aria-selected="' + (f.id === chartState.tf) + '">' + f.label + "</button>").join("") +
      '</div><button type="button" class="link-more" data-chart-all>Xem toàn bộ</button></div>' +
      '<div class="chart-legend num" data-chart-legend></div>' +
      '<div class="chart-box" data-chart-box><p class="chart-msg" data-chart-msg>Đang tải biểu đồ…</p></div>' +
      '<p class="data-note chart-note" data-chart-note></p>';
  }

  function createChart() {
    const LC = window.LightweightCharts;
    const box = chartEl.querySelector("[data-chart-box]");
    const chart = LC.createChart(box, {
      autoSize: true,
      layout: { background: { color: "#ffffff" }, textColor: "#3b4860", fontFamily: getComputedStyle(document.body).fontFamily, fontSize: 12, attributionLogo: true },
      grid: { vertLines: { color: "#eef2f7" }, horzLines: { color: "#eef2f7" } },
      rightPriceScale: { borderColor: "#e2e8f1", scaleMargins: { top: 0.08, bottom: 0.06 } },
      // minBarSpacing nhỏ để "Xem toàn bộ" vừa cả ~3.600 nến ngày từ 2012 (mặc định 0,5px/nến)
      timeScale: { borderColor: "#e2e8f1", rightOffset: 4, minBarSpacing: 0.05 },
      crosshair: { mode: LC.CrosshairMode.Normal },
      localization: { locale: "vi-VN", dateFormat: "dd/MM/yyyy" },
    });
    chartState.chart = chart;
    const priceFormat = { type: "custom", formatter: fmt.index, minMove: 0.01 };
    chartState.candle = chart.addSeries(LC.CandlestickSeries, { priceFormat, upColor: UP, downColor: DOWN, wickUpColor: UP, wickDownColor: DOWN, borderVisible: false });
    // Khối lượng ở ô riêng bên dưới (ô 1) — chung trục giá thì trục hiện cả số âm ở vùng khối lượng
    chartState.vol = chart.addSeries(LC.HistogramSeries, { priceFormat: { type: "custom", formatter: volShort, minMove: 1 }, lastValueVisible: false, priceLineVisible: false }, 1);
    chart.panes()[0].setStretchFactor(0.78);
    chart.panes()[1].setStretchFactor(0.22);
    chartState.ma = MAS.map((m) => chart.addSeries(LC.LineSeries, { color: m.color, lineWidth: 1, priceFormat, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false }));
    chart.subscribeCrosshairMove((p) => renderLegend(p && p.time !== undefined ? chartState.bars.findIndex((b) => b.time === p.time) : -1));
  }

  // Trục khối lượng: 1.250.000 -> "1,25 tr", 3.400 -> "3,4 N"
  function volShort(v) {
    const a = Math.abs(v);
    const f = (x, u) => Number(x.toFixed(x < 10 ? 2 : x < 100 ? 1 : 0)).toLocaleString("vi-VN") + " " + u;
    return a >= 1e9 ? f(v / 1e9, "tỷ") : a >= 1e6 ? f(v / 1e6, "tr") : a >= 1e3 ? f(v / 1e3, "N") : String(Math.round(v));
  }

  // Trung bình giá đóng cửa n nến gần nhất (chỉ từ nến thứ n trở đi)
  function sma(bars, n) {
    const out = [];
    let sum = 0;
    bars.forEach((b, i) => {
      sum += b.close;
      if (i >= n) sum -= bars[i - n].close;
      if (i >= n - 1) out.push({ time: b.time, value: sum / n });
    });
    return out;
  }

  function renderLegend(i) {
    const el = chartEl.querySelector("[data-chart-legend]");
    const bars = chartState.bars;
    if (!el || !bars.length) return;
    if (i < 0) i = bars.length - 1;
    const b = bars[i];
    const when = typeof b.time === "number"
      ? new Date(b.time * 1000).toISOString().replace(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2}).*/, "$3/$2/$1 $4")
      : fmt.date(b.time);
    const cls = b.close >= b.open ? "up" : "down";
    const ma = MAS.map((m, j) => {
      const v = i >= m.n - 1 ? chartState.maData[j][i - m.n + 1].value : NaN;
      return '<span style="color:' + m.color + '">MA' + m.n + " " + fmt.index(v) + "</span>";
    }).join("");
    el.innerHTML =
      "<b>" + chartState.code + "</b><span>" + when + "</span>" +
      '<span>Mở <b class="' + cls + '">' + fmt.index(b.open) + '</b></span><span>Cao <b class="' + cls + '">' + fmt.index(b.high) + "</b></span>" +
      '<span>Thấp <b class="' + cls + '">' + fmt.index(b.low) + '</b></span><span>Đóng <b class="' + cls + '">' + fmt.index(b.close) + "</b></span>" +
      "<span>KL <b>" + fmt.int(chartState.vols[i]) + "</b></span>" + ma;
  }

  function showRange(all) {
    const ts = chartState.chart.timeScale();
    const f = TFS.find((x) => x.id === chartState.tf);
    const n = chartState.bars.length;
    if (all || !f.show || n <= f.show) ts.fitContent();
    else ts.setVisibleLogicalRange({ from: n - f.show, to: n + 4 });
  }

  function setChartMsg(text) {
    const m = chartEl.querySelector("[data-chart-msg]");
    if (m) { m.textContent = text; m.hidden = !text; }
  }

  // keep = giữ nguyên vùng đang xem (làm mới định kỳ trong phiên)
  function loadChart(keep, fresh) {
    const { code, tf } = chartState;
    const req = ++chartState.req;
    if (!keep) setChartMsg("Đang tải biểu đồ…");
    return Promise.all([loadLib(), fetchChart(code, tf, fresh)])
      .then(([, d]) => {
        if (req !== chartState.req) return; // người xem đã bấm mã / khung khác
        if (!chartState.chart) createChart();
        const bars = d.t.map((t, i) => ({ time: t, open: d.o[i], high: d.h[i], low: d.l[i], close: d.c[i] }));
        const range = keep ? chartState.chart.timeScale().getVisibleLogicalRange() : null;
        chartState.bars = bars;
        chartState.vols = d.v;
        chartState.maData = MAS.map((m) => sma(bars, m.n));
        chartState.candle.setData(bars);
        chartState.vol.setData(bars.map((b, i) => ({ time: b.time, value: d.v[i], color: b.close >= b.open ? "rgba(22,163,74,.45)" : "rgba(224,57,62,.45)" })));
        chartState.ma.forEach((s, j) => s.setData(chartState.maData[j]));
        chartState.chart.applyOptions({ timeScale: { timeVisible: tf === "5m", secondsVisible: false } });
        if (range) chartState.chart.timeScale().setVisibleLogicalRange(range);
        else showRange(false);
        renderLegend(-1);
        setChartMsg(bars.length ? "" : "Chưa có dữ liệu cho khung này");
        const hm = new Date(d.updated_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });
        chartEl.querySelector("[data-chart-note]").innerHTML =
          icon("info") + "Giá nghìn đồng, đã điều chỉnh cổ tức / chia tách. Cập nhật lúc " + hm + (d.stale ? " (chưa lấy được số mới)" : "") + ". Kéo để xem lịch sử, cuộn hoặc chụm 2 ngón để phóng to.";
      })
      .catch((e) => {
        if (req !== chartState.req) return;
        console.warn("[chart]", e);
        if (!keep) setChartMsg("Chưa tải được biểu đồ, vui lòng thử lại sau.");
      });
  }

  function renderChart() {
    chartEl.hidden = !state.ticker;
    if (!state.ticker || state.ticker === chartState.code) return;
    chartState.code = state.ticker;
    if (!chartEl.firstChild) chartShell();
    loadChart(false);
  }

  chartEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tf]");
    if (b && b.dataset.tf !== chartState.tf) {
      chartState.tf = b.dataset.tf;
      chartEl.querySelectorAll("[data-tf]").forEach((x) => x.setAttribute("aria-selected", x === b));
      loadChart(false);
    }
    if (e.target.closest("[data-chart-all]") && chartState.chart) showRange(true);
  });
  // Trong giờ giao dịch: làm mới nến mỗi 60s (giữ vùng đang xem)
  setInterval(() => {
    if (chartState.chart && !chartEl.hidden && Market.live && document.visibilityState === "visible") loadChart(true, true);
  }, 60000);

  /* ----- Tiêu đề, bộ lọc đang áp dụng, danh sách bài ----- */
  function renderNews() {
    const list = filtered();
    const parts = [];
    if (state.ticker) parts.push({ k: "ticker", label: state.ticker });
    if (state.tag) parts.push({ k: "tag", label: tagLabel(state.tag) });
    if (state.q) parts.push({ k: "q", label: "“" + state.q + "”" });

    titleEl.textContent = state.ticker ? "Tin tức liên quan đến " + state.ticker : state.tag ? tagLabel(state.tag) : state.q ? "Kết quả tìm kiếm" : "Tất cả tin tức";
    countEl.textContent = list.length + " bài viết, mới nhất trước";
    chipsEl.innerHTML = parts.length
      ? parts.map((p) => '<button type="button" class="filter-chip" data-clear="' + p.k + '" aria-label="Bỏ lọc ' + escapeHtml(p.label) + '">' + escapeHtml(p.label) + icon("x") + "</button>").join("") +
        (parts.length > 1 ? '<button type="button" class="link-more" data-clear="all">Xóa tất cả</button>' : "")
      : "";

    if (!list.length) {
      newsEl.innerHTML =
        '<div class="empty-state">' + icon("newspaper") + "<h3>Chưa có bài viết phù hợp</h3>" +
        "<p>Thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác.</p>" +
        '<button class="btn btn--outline" type="button" data-clear="all">Xem tất cả tin tức</button></div>';
      moreWrap.hidden = true;
      return;
    }
    newsEl.innerHTML = list.slice(0, limit).map(newsItem).join("");
    moreWrap.hidden = list.length <= limit;
  }

  function apply(patch, opts) {
    Object.assign(state, patch);
    limit = PAGE;
    renderTopics();
    renderTickers();
    renderQuote();
    renderChart();
    renderNews();
    // Địa chỉ là trang tĩnh của mã (ưu tiên) hoặc chủ đề đang lọc; từ khóa không đưa lên URL
    const href = newsUrl(state.ticker || state.tag);
    if (href !== location.pathname || location.hash) history.replaceState(null, "", href);
    if (opts && opts.scroll) titleEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ----- Ô tìm kiếm + gợi ý (combobox) ----- */
  let options = [];
  let active = -1;
  function suggestions(q) {
    const nq = norm(q);
    const tags = D.newsTags.filter((t) => !nq || norm(t.label).includes(nq) || t.keys.some((k) => k.includes(nq) || nq.includes(k)));
    const tks = D.tickers.filter((t) => !nq || t.code.toLowerCase().startsWith(nq) || norm(t.name).includes(nq)).slice(0, nq ? 6 : 8);
    const out = [];
    if (tags.length) out.push({ group: "Chủ đề" }, ...tags.map((t) => ({ type: "tag", value: t.id, main: t.label, sub: D.news.filter((n) => n.tags.includes(t.id)).length + " bài" })));
    if (tks.length) out.push({ group: "Mã cổ phiếu" }, ...tks.map((t) => ({ type: "ticker", value: t.code, main: t.code, sub: t.name })));
    if (nq) out.push({ group: "Từ khóa" }, { type: "q", value: q.trim(), main: "Tìm bài viết có “" + q.trim() + "”", sub: "" });
    return out;
  }
  function openSuggest() {
    const items = suggestions(input.value);
    options = items.filter((x) => x.type);
    active = input.value.trim() ? 0 : -1;
    let i = -1;
    sugEl.innerHTML = items
      .map((x) => {
        if (x.group) return '<div class="suggest-group" role="presentation">' + x.group + "</div>";
        i++;
        return '<button type="button" role="option" id="sg-' + i + '" data-sg="' + i + '" aria-selected="' + (i === active) + '"><b>' + escapeHtml(x.main) + "</b><span>" + escapeHtml(x.sub) + "</span></button>";
      })
      .join("");
    sugEl.hidden = false;
    input.setAttribute("aria-expanded", "true");
    input.setAttribute("aria-activedescendant", active >= 0 ? "sg-" + active : "");
  }
  function closeSuggest() {
    sugEl.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }
  function moveActive(d) {
    if (!options.length) return;
    active = (active + d + options.length) % options.length;
    sugEl.querySelectorAll("[data-sg]").forEach((b) => b.setAttribute("aria-selected", +b.dataset.sg === active));
    input.setAttribute("aria-activedescendant", "sg-" + active);
    sugEl.querySelector("#sg-" + active).scrollIntoView({ block: "nearest" });
  }
  function choose(o) {
    closeSuggest();
    input.value = "";
    if (o.type === "tag") apply({ tag: o.value, q: "" }, { scroll: true });
    else if (o.type === "ticker") apply({ ticker: o.value, q: "" }, { scroll: true });
    else apply({ q: o.value }, { scroll: true });
  }

  input.addEventListener("focus", openSuggest);
  input.addEventListener("input", openSuggest);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); sugEl.hidden ? openSuggest() : moveActive(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
    else if (e.key === "Escape") closeSuggest();
    else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && options[active]) choose(options[active]);
      else if (input.value.trim()) choose({ type: "q", value: input.value.trim() });
    }
  });
  sugEl.addEventListener("mousedown", (e) => e.preventDefault()); // giữ focus ở ô nhập khi bấm gợi ý
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#tim-ma")) closeSuggest();
    const sg = e.target.closest("[data-sg]");
    if (sg) return choose(options[+sg.dataset.sg]);
    const tp = e.target.closest("[data-topic]");
    if (tp) return apply({ tag: tp.dataset.topic === state.tag ? "" : tp.dataset.topic });
    const tk = e.target.closest("[data-ticker]");
    if (tk) return apply({ ticker: tk.dataset.ticker }, { scroll: window.matchMedia("(max-width: 960px)").matches });
    const cl = e.target.closest("[data-clear]");
    if (cl) {
      const k = cl.dataset.clear;
      apply(k === "all" ? { ticker: "", tag: "", q: "" } : { [k]: "" });
    }
  });

  $("[data-load-more]").addEventListener("click", () => {
    limit += PAGE;
    renderNews();
  });

  followBtn.addEventListener("click", () => {
    const code = state.ticker;
    const on = follows.includes(code);
    follows = on ? follows.filter((c) => c !== code) : follows.concat(code);
    store.set(FKEY, follows);
    toast(on ? "Đã bỏ theo dõi " + code : "Đã theo dõi " + code + ". Tin mới sẽ xuất hiện trong trang Tổng quan.");
    renderQuote();
    renderTickers();
  });

  document.addEventListener("auth:change", renderNews);
  // Giá thật về (hoặc làm mới) -> vẽ lại cột mã + thẻ giá
  document.addEventListener("market:update", () => {
    renderTickers();
    renderQuote();
  });

  const focusSearch = location.hash === "#tim-ma";
  apply({});
  if (focusSearch) input.focus();
})();

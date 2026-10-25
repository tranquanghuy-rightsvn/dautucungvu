/* =========================================================
   Shared UI: icons, formatting, auth, header/footer,
   modal, toast, chart + illustration generators.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- URL ----------
     Mỗi trang là slug/index.html, link luôn dạng /slug/ (có dấu / cuối).
     Gốc site suy ra từ vị trí file này (assets/js/ui.js), nên link đúng
     dù trang ở cấp thư mục nào hay site đặt trong thư mục con. */
  const ROOT = new URL("../../", document.currentScript.src);
  const IS_FILE = location.protocol === "file:";
  function url(path) {
    const u = new URL(path || "", ROOT);
    // file:// không tự mở index.html của thư mục
    if (IS_FILE && u.pathname.endsWith("/")) u.pathname += "index.html";
    return IS_FILE ? u.href : u.pathname + u.search + u.hash;
  }

  /* ---------- Icons (24x24, stroke) ---------- */
  const P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z" fill="currentColor"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
    news: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.5 2.4 3.5 5.5"/>',
    expert: '<circle cx="12" cy="7" r="4"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/><path d="m12 13 1.5 3-1.5 2-1.5-2z"/>',
    barChart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8S10.5 3 8 3.5 7 8 12 8zM12 8s1.5-5 4-4.5S17 8 12 8z"/>',
    crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="currentColor" stroke-linejoin="round"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor" stroke="none"/>',
    starLine: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M8 13h8M8 17h5"/>',
    trendingUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    pie: '<path d="M12 3v9h9A9 9 0 1 1 12 3z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    newspaper: '<path d="M4 5h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v10a2 2 0 0 1-2 2M8 9h5M8 13h5M8 17h3"/>',
    message: '<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z" fill="currentColor" stroke="none"/>',
    youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="currentColor" stroke="none"/><path d="m10 9 5 3-5 3z" fill="#06142e" stroke="none"/>',
    telegram: '<path d="M21 4 3 11l6 2 2 6 3-4 5 4z" fill="currentColor" stroke="none"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  };

  function icon(name, extra) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
      (extra ? " " + extra : "") +
      ">" +
      (P[name] || "") +
      "</svg>"
    );
  }

  /* ---------- Format helpers (vi-VN) ---------- */
  const nf2 = new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nf0 = new Intl.NumberFormat("vi-VN");
  // Số thị trường có thể chưa tải xong (/api/market) -> hiện "—" thay vì NaN
  const ok = (v) => typeof v === "number" && isFinite(v);
  const fmt = {
    price: (v) => (ok(v) ? nf0.format(Math.round(v * 1000)) : "—"), // 24.8 -> "24.800"
    index: (v) => (ok(v) ? nf2.format(v) : "—"),
    pct: (v) => (ok(v) ? (v > 0 ? "+" : "") + nf2.format(v) + "%" : "—"),
    change: (v) => (ok(v) ? (v > 0 ? "+" : "") + nf2.format(v) : "—"),
    cls: (v) => (v > 0 ? "up" : v < 0 ? "down" : "flat"),
    int: (v) => nf0.format(v),
    vnd: (v) => nf0.format(v) + "đ", // 68000 -> "68.000đ"
    // số phút -> "45 phút" / "1,5 giờ"
    duration: (m) => (m >= 60 ? String(Math.round(m / 6) / 10).replace(".", ",") + " giờ" : m + " phút"),
    // "2026-10-15 14:32" -> "15/10/2026 14:32"
    date: (s, withTime) => {
      const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}:\d{2}))?/);
      if (!m) return String(s);
      return m[3] + "/" + m[2] + "/" + m[1] + (withTime !== false && m[4] ? " " + m[4] : "");
    },
  };

  // Bỏ dấu tiếng Việt để tìm kiếm: "Hòa Phát" -> "hoa phat"
  function norm(s) {
    return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().trim();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  /* ---------- Storage (safe) ---------- */
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* storage blocked — ignore */
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    },
  };

  /* ---------- Gọi API của website (/api/*) ---------- */
  // Lỗi -> Error có .status và lời nhắn tiếng Việt từ máy chủ.
  function api(path, opts) {
    const o = opts || {};
    const init = { method: o.method || (o.body ? "POST" : "GET"), credentials: "same-origin", headers: { accept: "application/json" } };
    if (o.body) {
      init.headers["content-type"] = "application/json";
      init.body = JSON.stringify(o.body);
    }
    return fetch(url("api/" + path), init).then((r) =>
      r.json().catch(() => ({})).then((data) => {
        if (r.ok) return data;
        const err = new Error(data.error || "Có lỗi xảy ra (mã " + r.status + "), thử lại sau.");
        err.status = r.status;
        throw err;
      })
    );
  }

  /* ---------- Tài khoản (thật — GAS.md VI) ----------
     Máy chủ giữ phiên đăng nhập bằng cookie HttpOnly; trình duyệt chỉ cache bản sao /api/me để
     vẽ nhanh lần đầu. Đây KHÔNG phải nơi phân quyền thật — nội dung trả phí / video do máy chủ
     kiểm quyền rồi mới trả. */
  const ME_KEY = "dtcv-me";
  store.remove("dtcv-user"); // tài khoản giả lập của bản demo cũ
  let ME = store.get(ME_KEY, null);
  const auth = {
    user() {
      return ME;
    },
    set(u) {
      const changed = JSON.stringify(u || null) !== JSON.stringify(ME || null);
      ME = u || null;
      ME ? store.set(ME_KEY, ME) : store.remove(ME_KEY);
      if (changed) document.dispatchEvent(new CustomEvent("auth:change", { detail: ME }));
      return ME;
    },
    refresh() {
      if (IS_FILE) return Promise.resolve(ME);
      return api("me").then((r) => auth.set(r.user)).catch((e) => console.warn("[auth] không tải được tài khoản:", e));
    },
    login(email, password, turnstile) {
      return api("auth/login", { body: { email, password, turnstile } }).then((r) => auth.set(r.user));
    },
    register(data) {
      return api("auth/register", { body: data }).then((r) => auth.set(r.user));
    },
    logout() {
      return api("auth/logout", { body: {} }).catch(() => {}).then(() => auth.set(null));
    },
  };

  /* ---------- Phân quyền ----------
     Vai trò: guest < user < member < vip.
     member = hội viên còn hạn; vip = tài khoản mở / chuyển ID 50 triệu (không giới hạn). */
  const RANK = { public: 0, guest: 0, user: 1, member: 2, vip: 3 };
  const access = {
    memberActive(u) {
      return !!(u && u.memberUntil && new Date(u.memberUntil + "T23:59:59") >= new Date());
    },
    memberExpired(u) {
      return !!(u && u.memberUntil && !this.memberActive(u));
    },
    role(u) {
      if (u === undefined) u = auth.user();
      if (!u) return "guest";
      if (u.vip) return "vip";
      return this.memberActive(u) ? "member" : "user";
    },
    can(level, u) {
      return RANK[this.role(u)] >= (RANK[level || "public"] || 0);
    },
    ownsCourse(c, u) {
      if (u === undefined) u = auth.user();
      if (!c.price) return this.can(c.access || "public", u);
      return !!(u && (u.vip || (u.courses || []).includes(c.id)));
    },
    canLesson(c, lesson, u) {
      return !!lesson.preview || this.ownsCourse(c, u);
    },
    label: { public: "", user: "Cần đăng nhập", member: "Hội viên", vip: "Tài khoản 50tr" },
    roleName: { guest: "Khách", user: "Thành viên", member: "Hội viên", vip: "Tài khoản Đầu tư cùng Vũ" },
  };

  function initials(name) {
    const parts = String(name).trim().split(/\s+/);
    return ((parts[0] || "")[0] || "").toUpperCase() + ((parts.length > 1 ? parts[parts.length - 1][0] : "") || "").toUpperCase();
  }

  /* ---------- Seeded random ---------- */
  function rng(seed) {
    let a = typeof seed === "number" ? seed : hash(String(seed));
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /* ---------- Charts ---------- */
  const Charts = {
    walk(n, seed, start, vol, drift) {
      const r = rng(seed);
      const out = [start];
      for (let i = 1; i < n; i++) {
        out.push(Math.max(start * 0.4, out[i - 1] * (1 + (r() - 0.5) * vol + drift)));
      }
      return out;
    },
    ohlc(n, seed, start, vol, drift) {
      const r = rng(seed);
      const out = [];
      let prev = start;
      for (let i = 0; i < n; i++) {
        const o = prev;
        const c = o * (1 + (r() - 0.46 + drift) * vol);
        const h = Math.max(o, c) * (1 + r() * vol * 0.5);
        const l = Math.min(o, c) * (1 - r() * vol * 0.5);
        out.push({ o, h, l, c });
        prev = c;
      }
      return out;
    },
    _scale(values, h, pad) {
      const min = Math.min.apply(null, values);
      const max = Math.max.apply(null, values);
      const span = max - min || 1;
      return (v) => pad + (h - pad * 2) * (1 - (v - min) / span);
    },
    linePath(data, w, h, pad) {
      const y = this._scale(data, h, pad || 4);
      const step = w / (data.length - 1);
      return data.map((v, i) => (i ? "L" : "M") + (i * step).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
    },
    spark(data, opts) {
      const o = Object.assign({ w: 120, h: 36, color: "#16a34a", fill: true, stroke: 2 }, opts);
      const id = "sg" + Math.random().toString(36).slice(2, 8);
      const line = this.linePath(data, o.w, o.h, o.stroke + 1);
      const area = line + " L" + o.w + " " + o.h + " L0 " + o.h + " Z";
      return (
        '<svg viewBox="0 0 ' + o.w + " " + o.h + '" preserveAspectRatio="none" aria-hidden="true">' +
        (o.fill
          ? '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + o.color + '" stop-opacity=".28"/><stop offset="1" stop-color="' + o.color + '" stop-opacity="0"/></linearGradient></defs><path d="' + area + '" fill="url(#' + id + ')"/>'
          : "") +
        '<path d="' + line + '" fill="none" stroke="' + o.color + '" stroke-width="' + o.stroke + '" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>'
      );
    },
    /* Area chart with y gridlines + x labels (dashboard) */
    area(data, opts) {
      const o = Object.assign({ w: 640, h: 220, color: "#16a34a", labels: [] }, opts);
      const padL = 0, padR = 7, padB = 22, padT = 8; // padR: chừa chỗ cho chấm điểm cuối
      const ch = o.h - padB;
      const min = Math.min.apply(null, data), max = Math.max.apply(null, data);
      const span = max - min || 1;
      const y = (v) => padT + (ch - padT * 2) * (1 - (v - min) / span);
      const step = (o.w - padL - padR) / (data.length - 1);
      const pts = data.map((v, i) => [padL + i * step, y(v)]);
      const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
      const area = line + " L" + (o.w - padR) + " " + ch + " L" + padL + " " + ch + " Z";
      let grid = "";
      for (let g = 0; g <= 3; g++) {
        const gy = padT + ((ch - padT * 2) / 3) * g;
        grid += '<line x1="0" x2="' + o.w + '" y1="' + gy.toFixed(1) + '" y2="' + gy.toFixed(1) + '" stroke="#e2e8f1" stroke-dasharray="3 4"/>';
      }
      let xl = "";
      o.labels.forEach((lb, i) => {
        const x = (o.w / (o.labels.length - 1)) * i;
        const anchor = i === 0 ? "start" : i === o.labels.length - 1 ? "end" : "middle";
        xl += '<text x="' + x.toFixed(1) + '" y="' + (o.h - 4) + '" text-anchor="' + anchor + '" font-size="11" fill="#64718a">' + lb + "</text>";
      });
      const last = pts[pts.length - 1];
      return (
        '<svg viewBox="0 0 ' + o.w + " " + o.h + '" role="img" aria-label="' + (o.label || "Biểu đồ") + '">' +
        '<defs><linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + o.color + '" stop-opacity=".25"/><stop offset="1" stop-color="' + o.color + '" stop-opacity="0"/></linearGradient></defs>' +
        grid +
        '<path d="' + area + '" fill="url(#areaG)"/>' +
        '<path d="' + line + '" fill="none" stroke="' + o.color + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="4.5" fill="#fff" stroke="' + o.color + '" stroke-width="2.5"/>' +
        xl +
        "</svg>"
      );
    },
    /* Candlestick SVG; animate=true staggers candles in */
    candles(bars, opts) {
      const o = Object.assign({ w: 600, h: 300, up: "#22c55e", down: "#ef4444", gap: 0.35, animate: false, ma: true }, opts);
      const vals = [];
      bars.forEach((b) => vals.push(b.h, b.l));
      const y = this._scale(vals, o.h, 10);
      const cw = o.w / bars.length;
      const bw = Math.max(2, cw * (1 - o.gap));
      let g = "";
      bars.forEach((b, i) => {
        const x = i * cw + cw / 2;
        const up = b.c >= b.o;
        const col = up ? o.up : o.down;
        const top = y(Math.max(b.o, b.c));
        const bh = Math.max(1.5, Math.abs(y(b.o) - y(b.c)));
        const delay = o.animate ? ' style="animation-delay:' + (i * 28) + 'ms"' : "";
        g +=
          '<g class="cdl"' + delay + '><line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + y(b.h).toFixed(1) + '" y2="' + y(b.l).toFixed(1) + '" stroke="' + col + '" stroke-width="1.4"/>' +
          '<rect x="' + (x - bw / 2).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="1" fill="' + col + '"/></g>';
      });
      let ma = "";
      if (o.ma) {
        const closes = bars.map((b) => b.c);
        const k = 6;
        const pts = closes.map((_, i) => {
          const s = closes.slice(Math.max(0, i - k + 1), i + 1);
          return s.reduce((a, b) => a + b, 0) / s.length;
        });
        const d = pts.map((v, i) => (i ? "L" : "M") + (i * cw + cw / 2).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
        ma = '<path class="ma-line" d="' + d + '" fill="none" stroke="#f6c64a" stroke-width="2" stroke-linejoin="round" opacity=".9"/>';
      }
      return '<svg viewBox="0 0 ' + o.w + " " + o.h + '" preserveAspectRatio="none" aria-hidden="true">' + g + ma + "</svg>";
    },
  };

  /* ---------- Illustrations (thumbnails) ---------- */
  const Art = {
    thumb(type, seed, accent) {
      const r = rng(seed || type);
      const W = 320, H = 180;
      const svg = (defs, body) =>
        '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' + defs + "</defs>" + body + "</svg>";
      const uid = "a" + Math.floor(r() * 1e8);

      if (type === "candles" || type === "chart") {
        const bars = Charts.ohlc(type === "chart" ? 28 : 24, seed, 100, 0.06, 0.02);
        const inner = Charts.candles(bars, { w: W, h: H - 30, ma: true }).replace(/^<svg[^>]*>|<\/svg>$/g, "");
        let grid = "";
        for (let i = 1; i < 5; i++) grid += '<line x1="0" x2="' + W + '" y1="' + i * 36 + '" y2="' + i * 36 + '" stroke="#ffffff" stroke-opacity=".06"/>';
        return svg(
          '<linearGradient id="' + uid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b2b5e"/><stop offset="1" stop-color="#03101f"/></linearGradient>',
          '<rect width="' + W + '" height="' + H + '" fill="url(#' + uid + ')"/>' + grid + '<g transform="translate(0 18)">' + inner + "</g>"
        );
      }

      if (type === "bars") {
        let b = "";
        for (let i = 0; i < 9; i++) {
          const h = 30 + i * 10 + r() * 30;
          b += '<rect x="' + (28 + i * 31) + '" y="' + (H - 20 - h) + '" width="20" height="' + h + '" rx="3" fill="' + (i % 3 === 2 ? "#f6c64a" : "#3b82f6") + '" opacity="' + (0.55 + i * 0.05) + '"/>';
        }
        return svg(
          '<linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#0a2352"/></linearGradient>',
          '<rect width="' + W + '" height="' + H + '" fill="url(#' + uid + ')"/>' + b +
            '<path d="M20 120 L90 96 L150 104 L220 62 L300 40" fill="none" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/>'
        );
      }

      if (type === "pie") {
        return svg(
          '<linearGradient id="' + uid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#064e3b"/><stop offset="1" stop-color="#0a2352"/></linearGradient>',
          '<rect width="' + W + '" height="' + H + '" fill="url(#' + uid + ')"/>' +
            '<g transform="translate(110 90)" fill="none" stroke-width="26">' +
            '<circle r="52" stroke="#16a34a" stroke-dasharray="130 400"/>' +
            '<circle r="52" stroke="#f6c64a" stroke-dasharray="80 400" stroke-dashoffset="-134"/>' +
            '<circle r="52" stroke="#3b82f6" stroke-dasharray="70 400" stroke-dashoffset="-218"/>' +
            '<circle r="52" stroke="#a78bfa" stroke-dasharray="40 400" stroke-dashoffset="-292"/></g>' +
            '<g fill="#fff" opacity=".85"><rect x="200" y="58" width="80" height="8" rx="4"/><rect x="200" y="82" width="60" height="8" rx="4" opacity=".7"/><rect x="200" y="106" width="70" height="8" rx="4" opacity=".55"/></g>'
        );
      }

      // Skylines
      const palettes = {
        "skyline-sunset": ["#f59e0b", "#ef4444", "#6d28d9", "#1e1b4b"],
        "skyline-night": ["#0b1d45", "#13306b", "#1e40af", "#020617"],
        towers: ["#bfdbfe", "#60a5fa", "#1e3a8a", "#0f172a"],
        building: ["#dbeafe", "#93c5fd", "#1e3a8a", "#0f172a"],
        "building-2": ["#e0f2fe", "#7dd3fc", "#0c4a6e", "#0f172a"],
      };
      const pal = palettes[type] || palettes["skyline-night"];
      let sky =
        '<linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pal[2] + '"/><stop offset=".55" stop-color="' + pal[1] + '"/><stop offset="1" stop-color="' + pal[0] + '"/></linearGradient>';
      if (type === "skyline-sunset") {
        sky = '<linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c1d95"/><stop offset=".5" stop-color="#ef4444"/><stop offset="1" stop-color="#fbbf24"/></linearGradient>';
      }
      if (type === "skyline-night") {
        sky = '<linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020617"/><stop offset="1" stop-color="#1e3a8a"/></linearGradient>';
      }
      let body = '<rect width="' + W + '" height="' + H + '" fill="url(#' + uid + ')"/>';
      const dark = pal[3];

      if (type === "building" || type === "building-2") {
        // One featured tower with branded sign + neighbours
        const bx = type === "building" ? 90 : 120;
        body += '<rect x="0" y="120" width="' + W + '" height="60" fill="' + dark + '" opacity=".25"/>';
        body += '<rect x="' + (bx + 120) + '" y="70" width="70" height="110" fill="#334155"/>';
        body += '<rect x="' + (bx - 70) + '" y="90" width="60" height="90" fill="#475569"/>';
        body += '<rect x="' + bx + '" y="22" width="110" height="158" fill="#1e3a8a"/>';
        for (let row = 0; row < 11; row++) {
          for (let col = 0; col < 6; col++) {
            body += '<rect x="' + (bx + 8 + col * 17) + '" y="' + (50 + row * 12) + '" width="12" height="7" fill="#bfdbfe" opacity="' + (0.35 + r() * 0.5).toFixed(2) + '"/>';
          }
        }
        body += '<rect x="' + (bx + 14) + '" y="28" width="82" height="16" rx="2" fill="#fff"/>';
        body += '<rect x="' + (bx + 20) + '" y="32" width="10" height="8" fill="' + (accent || "#e0393e") + '"/>';
        body += '<rect x="' + (bx + 34) + '" y="33" width="54" height="6" rx="1" fill="' + (accent || "#1e3a8a") + '" opacity=".8"/>';
        return svg(sky, body);
      }

      // generic skyline
      if (type === "skyline-sunset") body += '<circle cx="230" cy="92" r="30" fill="#fde68a" opacity=".8"/>';
      let x = -10;
      const layers = [
        { op: 0.45, minH: 50, maxH: 110, col: pal[2] },
        { op: 1, minH: 40, maxH: 140, col: dark },
      ];
      layers.forEach((L, li) => {
        x = -10 + li * 8;
        while (x < W) {
          const w = 18 + r() * 26;
          const h = L.minH + r() * (L.maxH - L.minH);
          body += '<rect x="' + x.toFixed(1) + '" y="' + (H - h).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + L.col + '" opacity="' + L.op + '"/>';
          if (li === 1 && (type === "skyline-night" || type === "towers")) {
            for (let wy = H - h + 8; wy < H - 6; wy += 9) {
              for (let wx = x + 4; wx < x + w - 5; wx += 7) {
                if (r() > 0.55) body += '<rect x="' + wx.toFixed(1) + '" y="' + wy.toFixed(1) + '" width="3" height="4" fill="' + (type === "towers" ? "#93c5fd" : "#fcd34d") + '" opacity=".8"/>';
              }
            }
          }
          if (r() > 0.7) body += '<rect x="' + (x + w / 2 - 1).toFixed(1) + '" y="' + (H - h - 14).toFixed(1) + '" width="2" height="14" fill="' + L.col + '" opacity="' + L.op + '"/>';
          x += w + 2;
        }
      });
      if (type === "skyline-night") {
        body += '<path d="M0 70 L60 62 L110 74 L170 44 L230 52 L320 18" fill="none" stroke="#22c55e" stroke-width="2.5" opacity=".85"/>';
      }
      return svg(sky, body);
    },
  };

  /* ---------- Layout: header / footer / drawer / modal ---------- */
  const NAV = [
    { id: "home", href: url(""), label: "Trang chủ" },
    { id: "courses", href: url("khoa-hoc/"), label: "Khóa học" },
    { id: "account", href: url("mo-tai-khoan/"), label: "Mở tài khoản" },
    { id: "news", href: url("tin-tuc/"), label: "Tin tức" },
    { id: "premium", href: url("premium/"), label: "Hội viên", premium: true },
    { id: "contact", href: url("lien-he/"), label: "Liên hệ" },
  ];

  function navLinks(page) {
    return NAV.map(
      (n) =>
        '<li><a href="' + n.href + '"' + (n.id === page ? ' aria-current="page"' : "") + (n.premium ? ' class="nav-premium"' : "") + ">" + (n.premium ? icon("crown") : "") + n.label + "</a></li>"
    ).join("");
  }

  function headerActions() {
    const u = auth.user();
    const search = '<a class="icon-btn hide-mobile" href="' + url("tin-tuc/") + '#tim-ma" aria-label="Tìm mã cổ phiếu">' + icon("search") + "</a>";
    const burger = '<button class="icon-btn nav-toggle" type="button" aria-label="Mở menu" aria-controls="site-drawer" aria-expanded="false" data-drawer-open>' + icon("menu") + "</button>";
    if (!u) {
      return (
        search +
        '<button class="btn btn--ghost-light hide-mobile" type="button" data-login>Đăng nhập</button>' +
        '<a class="btn btn--green" href="' + url("mo-tai-khoan/") + '">Mở tài khoản</a>' +
        burger
      );
    }
    return (
      search +
      '<div class="user-chip hide-mobile"><button type="button" aria-haspopup="menu" aria-expanded="false" data-user-menu>' +
      '<span class="avatar">' + escapeHtml(initials(u.name)) + "</span><span>" + escapeHtml(u.name) + "</span>" + icon("chevronDown") +
      "</button>" +
      '<div class="dropdown" role="menu" hidden>' +
      '<a role="menuitem" href="' + url("dashboard/") + '">' + icon("home") + "Tổng quan</a>" +
      '<a role="menuitem" href="' + courseFilterUrl("mine") + '">' + icon("book") + "Khóa học của tôi</a>" +
      '<a role="menuitem" href="' + url("premium/") + '">' + icon("crown") + "Gói hội viên</a><hr>" +
      '<button role="menuitem" type="button" data-logout>' + icon("logout") + "Đăng xuất</button>" +
      "</div></div>" +
      burger
    );
  }

  function renderHeader() {
    const el = document.querySelector("[data-site-header]");
    if (!el) return;
    const page = document.body.dataset.page;
    el.className = "site-header";
    el.innerHTML =
      '<div class="container">' +
      '<a class="brand" href="' + url("") + '" aria-label="Đầu tư cùng Vũ, về trang chủ"><img src="' + brandImg() + '" alt="" class="brand-photo" width="42" height="42">' +
      '<span><span class="brand-name">ĐẦU TƯ CÙNG VŨ</span><span class="brand-tag">Đầu tư thông minh, tài chính vững vàng</span></span></a>' +
      '<nav class="main-nav" aria-label="Điều hướng chính"><ul>' + navLinks(page) + "</ul></nav>" +
      '<div class="header-actions">' + headerActions() + "</div></div>";
    renderDrawer(page);
  }

  function renderDrawer(page) {
    let d = document.getElementById("site-drawer");
    if (!d) {
      d = document.createElement("div");
      d.id = "site-drawer";
      d.className = "drawer";
      d.setAttribute("aria-hidden", "true");
      document.body.appendChild(d);
    }
    const u = auth.user();
    d.innerHTML =
      '<div class="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">' +
      '<div class="drawer-head"><a class="brand" href="' + url("") + '"><img src="' + brandImg() + '" alt="" class="brand-photo" width="36" height="36"><span class="brand-name">ĐẦU TƯ CÙNG VŨ</span></a>' +
      '<button class="icon-btn" type="button" aria-label="Đóng menu" data-drawer-close>' + icon("x") + "</button></div>" +
      "<nav aria-label='Menu di động'>" +
      NAV.map((n) => '<a href="' + n.href + '"' + (n.id === page ? ' aria-current="page"' : "") + ">" + n.label + icon("chevronRight", 'width="18" height="18"') + "</a>").join("") +
      (u ? '<a href="' + url("dashboard/") + '"' + (page === "dashboard" ? ' aria-current="page"' : "") + ">Tổng quan của tôi" + icon("chevronRight", 'width="18" height="18"') + "</a>" : "") +
      "</nav>" +
      '<div class="drawer-actions">' +
      (u
        ? '<button class="btn btn--ghost-light" type="button" data-logout>Đăng xuất (' + escapeHtml(u.name) + ")</button>"
        : '<button class="btn btn--ghost-light" type="button" data-login>Đăng nhập</button><a class="btn btn--green" href="' + url("mo-tai-khoan/") + '">Mở tài khoản</a>') +
      "</div></div>";
  }

  function renderFooter() {
    const el = document.querySelector("[data-site-footer]");
    if (!el) return;
    el.className = "site-footer";
    const C = APP_DATA.site.contact;
    el.innerHTML =
      '<div class="container"><div class="footer-top">' +
      '<div class="footer-about"><a class="brand" href="' + url("") + '"><img src="' + brandImg() + '" alt="" class="brand-photo" width="42" height="42"><span><span class="brand-name" style="color:#fff">ĐẦU TƯ CÙNG VŨ</span><span class="brand-tag" style="display:block">Đầu tư thông minh, tài chính vững vàng</span></span></a>' +
      "<p>Nền tảng học đầu tư chứng khoán cho người Việt: từ kiến thức nền tảng đến phương pháp phân tích, cùng tin tức thị trường cập nhật mỗi ngày.</p>" +
      '<div class="socials"><a href="' + C.youtube + '" aria-label="YouTube">' + icon("youtube") + '</a><a href="' + C.facebook + '" aria-label="Facebook">' + icon("facebook") + '</a><a href="' + C.telegram + '" aria-label="Telegram">' + icon("telegram") + "</a></div></div>" +
      '<div><h2>Học tập</h2><ul><li><a href="' + url("khoa-hoc/") + '">Tất cả khóa học</a></li><li><a href="' + courseFilterUrl("free") + '">Khóa học miễn phí</a></li><li><a href="' + url("premium/") + '">Gói hội viên</a></li></ul></div>' +
      '<div><h2>Thị trường</h2><ul><li><a href="' + url("tin-tuc/") + '">Tin tức chứng khoán</a></li><li><a href="' + newsUrl("nhan-dinh") + '">Nhận định thị trường</a></li><li><a href="' + url("mo-tai-khoan/") + '">Mở tài khoản / chuyển ID</a></li></ul></div>' +
      '<div><h2>Liên hệ</h2><ul><li><a href="' + C.zalo + '" target="_blank" rel="noopener">Zalo: ' + escapeHtml(C.phone) + '</a></li><li><a href="tel:' + C.phone.replace(/\s/g, "") + '">Gọi ' + escapeHtml(C.phone) + "</a></li><li><a href=\"" + url("dieu-khoan-su-dung/") + "\">Điều khoản sử dụng</a></li><li><a href=\"" + url("chinh-sach-bao-mat/") + "\">Chính sách bảo mật</a></li></ul></div>" +
      "</div>" +
      '<div class="footer-bottom"><span>© 2026 Đầu tư cùng Vũ</span><p>Nội dung trên website chỉ nhằm mục đích giáo dục và tham khảo, không phải khuyến nghị mua bán chứng khoán. Số liệu thị trường lấy từ nguồn công khai, có thể chậm hoặc chưa chính xác.</p></div>' +
      "</div>";
  }

  /* ---------- Thị trường: dữ liệu thật từ /api/market (GAS.md II.E) ----------
     Gộp vào APP_DATA.indices / tickers (value, change, intraday / price, change %, history) rồi
     bắn sự kiện "market:update" để từng trang tự vẽ lại. Trong giờ giao dịch làm mới mỗi 60s
     khi trang đang mở. Lỗi mạng -> giữ số cũ (hoặc "—"), không làm hỏng trang. */
  const Market = { ready: false, updatedAt: null, stale: false, live: false };
  function marketNote() {
    if (!Market.ready) return "Đang tải dữ liệu...";
    const d = new Date(Market.updatedAt);
    const hm = isNaN(d) ? "" : d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });
    return "Cập nhật lúc " + hm + (Market.stale ? " (chưa lấy được số mới)" : "");
  }
  function applyMarket(m) {
    const ix = {}, tk = {};
    (m.indices || []).forEach((i) => (ix[i.code] = i));
    (m.tickers || []).forEach((t) => (tk[t.code] = t));
    APP_DATA.indices.forEach((i) => Object.assign(i, ix[i.code] || {}));
    APP_DATA.tickers.forEach((t) => Object.assign(t, tk[t.code] || {}));
    Object.assign(Market, { ready: true, updatedAt: m.updated_at, stale: !!m.stale, live: !!m.live });
    renderMarketStrip();
    document.dispatchEvent(new CustomEvent("market:update"));
  }
  function loadMarket() {
    if (IS_FILE) return Promise.resolve();
    return fetch(url("api/market"), { headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then(applyMarket)
      .catch((e) => console.warn("[market] không tải được dữ liệu thị trường:", e));
  }
  function startMarket() {
    if (!window.APP_DATA || !APP_DATA.indices) return;
    loadMarket();
    setInterval(() => {
      if (Market.live && document.visibilityState === "visible") loadMarket();
    }, 60000);
  }

  function renderMarketStrip() {
    const el = document.querySelector("[data-market-strip]");
    if (!el || !window.APP_DATA) return;
    el.className = "market-strip";
    el.innerHTML =
      '<div class="container">' +
      APP_DATA.indices
        .map(
          (i) =>
            '<span class="mk"><b>' + i.code + '</b><span class="num">' + fmt.index(i.value) + "</span>" +
            '<span class="num ' + fmt.cls(i.change) + '"><span class="abs">' + fmt.change(i.change) + ' </span><span class="pct">' + fmt.pct((i.change / (i.value - i.change)) * 100) + "</span></span></span>"
        )
        .join("") +
      '<span class="demo-note">' + marketNote() + "</span></div>";
  }

  /* ---------- Hộp Đăng nhập / Đăng ký / Quên mật khẩu (Turnstile chống bot) ---------- */
  const TURNSTILE_SITE_KEY = "0x4AAAAAAFdoZBmQ_HkuKLVd"; // khóa CÔNG KHAI (GAS.md X)
  let turnstileLoading = null;
  const tsWidgets = {};
  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve();
    if (!turnstileLoading) {
      turnstileLoading = new Promise((resolve, reject) => {
        const sc = document.createElement("script");
        sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        sc.async = true;
        sc.onload = resolve;
        sc.onerror = () => reject(new Error("Không tải được bước xác nhận chống robot"));
        document.head.appendChild(sc);
      });
    }
    return turnstileLoading;
  }
  function mountTurnstile(form) {
    const box = form.querySelector("[data-ts]");
    if (!box || box.dataset.ready) return;
    box.dataset.ready = "1";
    loadTurnstile()
      .then(() => {
        tsWidgets[form.dataset.authForm] = window.turnstile.render(box, { sitekey: TURNSTILE_SITE_KEY, language: "vi", size: "flexible" });
      })
      .catch((e) => console.warn("[turnstile]", e));
  }
  function turnstileToken(form) {
    const id = tsWidgets[form.dataset.authForm];
    return id !== undefined && window.turnstile ? window.turnstile.getResponse(id) || "" : "";
  }
  function resetTurnstile(form) {
    const id = tsWidgets[form.dataset.authForm];
    if (id !== undefined && window.turnstile) window.turnstile.reset(id);
  }

  function field(id, label, attrs) {
    return '<div class="field"><label for="' + id + '">' + label + '</label><input class="input" id="' + id + '" ' + attrs + '><span class="field-error" aria-live="polite"></span></div>';
  }
  function ensureLoginModal() {
    let m = document.getElementById("login-modal");
    if (m) return m;
    m = document.createElement("div");
    m.id = "login-modal";
    m.className = "modal";
    m.setAttribute("aria-hidden", "true");
    m.innerHTML =
      '<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="login-title">' +
      '<button class="icon-btn modal-close" type="button" aria-label="Đóng" data-modal-close>' + icon("x") + "</button>" +
      '<h2 id="login-title">Tài khoản</h2>' +
      '<div class="tabs tabs--line auth-tabs" role="tablist">' +
      '<button class="tab" type="button" role="tab" data-auth-tab="login" aria-selected="true">Đăng nhập</button>' +
      '<button class="tab" type="button" role="tab" data-auth-tab="register" aria-selected="false">Đăng ký</button>' +
      "</div>" +
      // Đăng nhập
      '<form novalidate data-auth-form="login">' +
      field("login-email", "Email", 'name="email" type="email" autocomplete="username" required') +
      field("login-pass", "Mật khẩu", 'name="password" type="password" autocomplete="current-password" required') +
      '<div data-ts class="ts-box"></div><p class="form-error" data-form-error aria-live="polite"></p>' +
      '<button class="btn btn--navy btn--lg btn--block" type="submit">Đăng nhập</button>' +
      '<p class="auth-alt"><button class="link-btn" type="button" data-auth-tab="forgot">Quên mật khẩu?</button></p>' +
      "</form>" +
      // Đăng ký
      '<form novalidate data-auth-form="register" hidden>' +
      field("reg-name", "Họ tên", 'name="name" autocomplete="name" required maxlength="80"') +
      field("reg-email", "Email", 'name="email" type="email" autocomplete="email" required') +
      field("reg-phone", "Số điện thoại / Zalo (không bắt buộc)", 'name="phone" type="tel" autocomplete="tel"') +
      field("reg-pass", "Mật khẩu (ít nhất 8 ký tự)", 'name="password" type="password" autocomplete="new-password" required minlength="8"') +
      '<div data-ts class="ts-box"></div><p class="form-error" data-form-error aria-live="polite"></p>' +
      '<button class="btn btn--green btn--lg btn--block" type="submit">Tạo tài khoản miễn phí</button>' +
      '<p class="auth-note">Sau khi đăng ký, kiểm tra email để xác minh tài khoản. Bấm tạo tài khoản là bạn đồng ý với <a href="' + url("dieu-khoan-su-dung/") + '" target="_blank">Điều khoản sử dụng</a> và <a href="' + url("chinh-sach-bao-mat/") + '" target="_blank">Chính sách bảo mật</a>.</p>' +
      "</form>" +
      // Quên mật khẩu
      '<form novalidate data-auth-form="forgot" hidden>' +
      "<p>Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu (hiệu lực 30 phút).</p>" +
      field("forgot-email", "Email", 'name="email" type="email" autocomplete="email" required') +
      '<div data-ts class="ts-box"></div><p class="form-error" data-form-error aria-live="polite"></p>' +
      '<button class="btn btn--navy btn--lg btn--block" type="submit">Gửi liên kết đặt lại</button>' +
      '<p class="auth-alt"><button class="link-btn" type="button" data-auth-tab="login">← Quay lại đăng nhập</button></p>' +
      "</form>" +
      "</div>";
    document.body.appendChild(m);
    return m;
  }
  function showAuthTab(name) {
    const m = ensureLoginModal();
    m.querySelectorAll("[data-auth-form]").forEach((f) => (f.hidden = f.dataset.authForm !== name));
    m.querySelectorAll(".auth-tabs [data-auth-tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.authTab === name ? "true" : "false"));
    document.getElementById("login-title").textContent = name === "register" ? "Tạo tài khoản" : name === "forgot" ? "Quên mật khẩu" : "Đăng nhập";
    const f = m.querySelector('[data-auth-form="' + name + '"]');
    mountTurnstile(f);
    const first = f.querySelector("input");
    setTimeout(() => first && first.focus(), 50);
  }

  let lastFocus = null;
  function openModal(m) {
    lastFocus = document.activeElement;
    m.classList.add("is-open");
    m.setAttribute("aria-hidden", "false");
    const first = m.querySelector("input, button:not(.modal-close)");
    setTimeout(() => first && first.focus(), 50);
  }
  function closeModal(m) {
    m.classList.remove("is-open");
    m.setAttribute("aria-hidden", "true");
    if (lastFocus) lastFocus.focus();
  }
  function openLogin(tab) {
    closeDrawer();
    openModal(ensureLoginModal());
    showAuthTab(tab || "login");
  }

  function setFieldError(input, msg) {
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    const err = input.parentElement.querySelector(".field-error");
    if (err) err.textContent = msg || "";
  }

  function formError(form, msg) {
    const el = form.querySelector("[data-form-error]");
    if (el) el.textContent = msg || "";
  }
  function setBusy(form, busy) {
    const b = form.querySelector('button[type="submit"]');
    if (b) {
      b.disabled = busy;
      b.classList.toggle("is-loading", busy);
    }
  }

  function handleAuthSubmit(form) {
    const kind = form.dataset.authForm;
    const v = (n) => (form[n] ? form[n].value.trim() : "");
    let ok = true;
    const need = (n, cond, msg) => {
      if (!form[n]) return;
      if (!cond) { setFieldError(form[n], msg); ok = false; } else setFieldError(form[n], "");
    };
    need("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email")), "Nhập email hợp lệ.");
    if (kind !== "forgot") need("password", form.password.value.length >= (kind === "register" ? 8 : 1), kind === "register" ? "Mật khẩu cần ít nhất 8 ký tự." : "Nhập mật khẩu.");
    if (kind === "register") {
      need("name", v("name").length >= 2, "Nhập họ tên.");
      // SĐT không bắt buộc (khách không thích bị ép) — chỉ kiểm tra khi có nhập
      need("phone", !v("phone") || /^\+?\d{9,15}$/.test(v("phone").replace(/[\s.-]/g, "")), "Số điện thoại / Zalo không hợp lệ.");
    }
    if (!ok) return;
    formError(form, "");
    setBusy(form, true);
    const ts = turnstileToken(form);
    let job;
    if (kind === "login") job = auth.login(v("email"), form.password.value, ts).then((u) => finishAuth("Chào " + u.name + "!"));
    else if (kind === "register") {
      job = auth.register({ name: v("name"), email: v("email"), phone: v("phone"), password: form.password.value, turnstile: ts })
        .then(() => finishAuth("Đã tạo tài khoản. Kiểm tra email " + v("email") + " để xác minh."));
    } else {
      job = api("auth/forgot", { body: { email: v("email"), turnstile: ts } }).then((r) => {
        form.innerHTML = '<p class="auth-done">' + icon("checkCircle") + escapeHtml(r.message) + '</p><p class="auth-alt"><button class="link-btn" type="button" data-auth-tab="login">← Quay lại đăng nhập</button></p>';
      });
    }
    job.catch((e) => {
      formError(form, e.message);
      resetTurnstile(form);
    }).finally(() => setBusy(form, false));
  }

  function finishAuth(message) {
    const m = document.getElementById("login-modal");
    if (m) {
      closeModal(m);
      m.remove(); // vẽ lại sạch lần sau (xoá mật khẩu đã gõ, widget chống robot dùng 1 lần)
      Object.keys(tsWidgets).forEach((k) => delete tsWidgets[k]);
    }
    toast(message);
  }

  /* Dải nhắc xác minh email (đăng nhập rồi nhưng chưa bấm link trong email) */
  function renderVerifyBar() {
    let bar = document.getElementById("verify-bar");
    const u = auth.user();
    if (!u || u.verified) {
      if (bar) bar.remove();
      return;
    }
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "verify-bar";
      bar.className = "verify-bar";
      const header = document.querySelector("[data-site-header]");
      header && header.insertAdjacentElement("afterend", bar);
    }
    bar.innerHTML = '<div class="container">' + icon("info") + "<span>Kiểm tra hộp thư <b>" + escapeHtml(u.email) +
      "</b> và bấm liên kết để xác minh tài khoản (cần để mua gói / khóa học).</span>" +
      '<button class="btn btn--outline btn--sm" type="button" data-resend-verify>Gửi lại email</button></div>';
  }

  /* ---------- Drawer ---------- */
  function openDrawer() {
    const d = document.getElementById("site-drawer");
    if (!d) return;
    d.classList.add("is-open");
    d.setAttribute("aria-hidden", "false");
    document.querySelectorAll("[data-drawer-open]").forEach((b) => b.setAttribute("aria-expanded", "true"));
    const c = d.querySelector("[data-drawer-close]");
    c && c.focus();
  }
  function closeDrawer() {
    const d = document.getElementById("site-drawer");
    if (!d || !d.classList.contains("is-open")) return;
    d.classList.remove("is-open");
    d.setAttribute("aria-hidden", "true");
    document.querySelectorAll("[data-drawer-open]").forEach((b) => b.setAttribute("aria-expanded", "false"));
  }

  /* ---------- Toast ---------- */
  // kind: "lock" (nội dung bị khóa), "info" (thông tin/không tìm thấy); mặc định là thành công
  const TOAST_ICON = { lock: "lock", info: "info" };
  function toast(msg, kind) {
    let region = document.querySelector(".toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    const t = document.createElement("div");
    t.className = "toast" + (TOAST_ICON[kind] ? " toast--" + kind : "");
    t.innerHTML = icon(TOAST_ICON[kind] || "checkCircle") + "<span>" + escapeHtml(msg) + "</span>";
    region.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  /* ---------- Tabs helper ---------- */
  // Wires a [role=tablist]; onChange(value) receives the selected tab's data-value.
  function tabs(list, onChange) {
    const items = Array.from(list.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      items.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      onChange && onChange(tab.dataset.value, tab);
    }
    items.forEach((t, i) => {
      t.tabIndex = t.getAttribute("aria-selected") === "true" ? 0 : -1;
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        let n = null;
        if (e.key === "ArrowRight") n = items[(i + 1) % items.length];
        if (e.key === "ArrowLeft") n = items[(i - 1 + items.length) % items.length];
        if (e.key === "Home") n = items[0];
        if (e.key === "End") n = items[items.length - 1];
        if (n) {
          e.preventDefault();
          select(n, true);
        }
      });
    });
    return { select: (value) => { const t = items.find((x) => x.dataset.value === value); t && select(t); } };
  }

  /* ---------- Shared components ---------- */
  // Logo / avatar thương hiệu: ảnh trong Cài đặt (CMS), mặc định ảnh gốc
  function brandImg() {
    const im = window.APP_DATA && APP_DATA.site.images;
    return url((im && im.brand) || "assets/img/vu-128.jpg");
  }
  // Ảnh bìa khóa (CMS); khóa chưa có ảnh thì vẽ hình minh hoạ như cũ
  function courseThumb(c) {
    const src = c.cover || c.thumb;
    return src ? '<img src="' + url(src) + '" alt="' + escapeHtml(c.title) + '" loading="lazy">' : Art.thumb(c.art, c.id);
  }
  function priceTag(c) {
    return c.price ? '<span class="price">' + fmt.vnd(c.price) + "</span>" : '<span class="price price--free">Miễn phí</span>';
  }
  function courseCard(c) {
    const mins = c.lessons.reduce((a, l) => a + (l.m || 0), 0);
    return (
      '<article class="course-card">' +
      '<div class="course-thumb">' + courseThumb(c) + '<span class="course-kind">' + icon("play") + c.lessons.length + " video</span></div>" +
      '<div class="course-body"><h3><a href="' + courseUrl(c) + '">' + escapeHtml(c.title) + "</a></h3>" +
      '<div class="course-meta"><span>' + icon("clock") + fmt.duration(mins) + "</span>" + priceTag(c) + "</div></div></article>"
    );
  }

  const isTicker = (tag) => APP_DATA.tickers.some((t) => t.code === tag);
  function tagLabel(tag) {
    const t = APP_DATA.newsTags.find((x) => x.id === tag);
    return t ? t.label : tag;
  }
  // Bài mới nhất lên đầu
  function newsSorted(list) {
    return (list || APP_DATA.news).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  function accessBadge(level) {
    if (!level || level === "public") return "";
    return '<span class="access-badge access-badge--' + level + '">' + icon(level === "user" ? "user" : level === "vip" ? "shield" : "crown") + access.label[level] + "</span>";
  }
  /* Mọi trạng thái đều là một trang tĩnh /.../slug/ (sinh bởi scripts/seo.py), không dùng ?params */
  // Ảnh bìa do CMS tải lên; bài chưa có ảnh thì vẽ hình minh hoạ như cũ
  function newsThumb(n) {
    if (n.cover) return '<img src="' + url(n.cover) + '" alt="' + escapeHtml(n.title) + '" loading="lazy">';
    const tk = APP_DATA.tickers.find((t) => n.tags.includes(t.code));
    return Art.thumb(n.art, "n" + n.id, tk && tk.color);
  }
  function articleUrl(n) {
    return url("bai-viet/" + n.slug + "/");
  }
  // Bài 1 là trang khóa học, từ bài 2: /khoa-hoc/<id>/bai-<n>/
  // Bài 1 ở trang khóa; bài sau: /khoa-hoc/<id>/<slug-bài>/ (slug bất biến — GAS.md II.B)
  function courseUrl(c, lessonIdx) {
    const course = typeof c === "string" ? APP_DATA.courses.find((x) => x.id === c) : c;
    const lesson = lessonIdx && course && course.lessons[lessonIdx];
    return url("khoa-hoc/" + (course ? course.id : c) + "/" + (lesson && lesson.slug ? lesson.slug + "/" : ""));
  }
  const COURSE_FILTER_SLUG = { all: "", free: "mien-phi/", paid: "co-phi/", mine: "cua-toi/" };
  function courseFilterUrl(f) {
    return url("khoa-hoc/" + (COURSE_FILTER_SLUG[f] || ""));
  }
  // Mã cổ phiếu viết thường (/tin-tuc/mbb/) hoặc id chủ đề (/tin-tuc/co-tuc/)
  function newsUrl(tagOrTicker) {
    return url("tin-tuc/" + (tagOrTicker ? tagOrTicker.toLowerCase() + "/" : ""));
  }
  // Gói hội viên: /thanh-toan/goi-3-thang/, khóa học: /thanh-toan/<id>/
  function payUrl(o) {
    return url("thanh-toan/" + (o.course ? (o.course.id || o.course) + "/" : "goi-" + o.months + "-thang/"));
  }
  function newsItem(n) {
    return (
      '<article class="news-item">' +
      '<div class="news-thumb">' + newsThumb(n) + "</div>" +
      '<div><h3><a href="' + articleUrl(n) + '">' + escapeHtml(n.title) + "</a></h3>" +
      '<p class="news-date"><time datetime="' + n.date.replace(" ", "T") + '">' + fmt.date(n.date) + "</time>" + accessBadge(n.access) + "</p>" +
      '<p class="news-excerpt">' + escapeHtml(n.excerpt) + "</p>" +
      '<p class="news-tags">' + n.tags.map((t) => '<span class="' + (isTicker(t) ? "ticker-tag" : "badge badge--soft") + '">' + escapeHtml(tagLabel(t)) + "</span>").join("") + "</p>" +
      "</div></article>"
    );
  }

  // Video YouTube: nhận link hoặc mã video. Chỉ tải iframe khi bấm phát.
  function youtubeId(v) {
    const m = String(v || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : /^[\w-]{11}$/.test(v || "") ? v : "";
  }
  /* src = "mp4": video bài học lưu ở kho riêng, máy chủ kiểm quyền rồi mới phát (GAS.md II.C) —
     cần opts {course, lesson} (id khóa + slug bài). Còn lại: link / mã YouTube. */
  function video(src, title, opts) {
    if (src === "mp4" && opts) {
      return (
        '<div class="video"><video controls playsinline preload="metadata" controlslist="nodownload" data-lesson-video ' +
        'src="/api/video/' + encodeURIComponent(opts.course) + "/" + encodeURIComponent(opts.lesson) + '" aria-label="Video: ' + escapeHtml(title || "") + '"></video></div>'
      );
    }
    const id = youtubeId(src);
    if (!id) {
      return '<div class="video video--empty">' + icon("play") + "<p><b>" + escapeHtml(title || "Video") + "</b><span>Video sẽ được cập nhật sớm.</span></p></div>";
    }
    return (
      '<div class="video"><button type="button" data-yt-play="' + id + '" aria-label="Phát video: ' + escapeHtml(title || "") + '">' +
      '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy">' +
      '<span class="video-play">' + icon("play") + "</span></button></div>"
    );
  }

  // Nút liên hệ Zalo / gọi điện lấy từ data.js
  function contactButtons() {
    const C = APP_DATA.site.contact;
    return (
      '<a class="btn btn--blue" href="' + C.zalo + '" target="_blank" rel="noopener">' + icon("message") + "Nhắn Zalo</a>" +
      '<a class="btn btn--outline" href="tel:' + C.phone.replace(/\s/g, "") + '">' + icon("phone") + escapeHtml(C.phone) + "</a>"
    );
  }

  /* Hộp mời mở khóa, nội dung tùy quyền còn thiếu.
     need: "user" | "member" | "vip" | "course"; opts.course khi need = "course". */
  function gate(need, opts) {
    const o = opts || {};
    const u = auth.user();
    const S = APP_DATA.site;
    const login = u ? "" : '<button class="btn btn--navy btn--sm" type="button" data-login>Đăng nhập</button>';
    const openAcc = '<a class="btn btn--outline btn--sm" href="' + url("mo-tai-khoan/") + '">Mở tài khoản / chuyển ID</a>';
    let title, text, actions;
    if (need === "user") {
      title = "Đăng nhập để xem tiếp";
      text = "Nội dung này dành cho thành viên đã đăng nhập. Đăng ký tài khoản hoàn toàn miễn phí.";
      actions = '<button class="btn btn--navy btn--sm" type="button" data-login>Đăng nhập</button>';
    } else if (need === "course") {
      const c = o.course;
      title = "Bài học thuộc khóa “" + c.title + "”";
      text = "Mua khóa học để xem toàn bộ " + c.lessons.length + " video, hoặc mở tài khoản / chuyển ID về Đầu tư cùng Vũ với vốn từ " + S.minCapital + " để học miễn phí toàn bộ khóa học.";
      actions = '<a class="btn btn--gold btn--sm" href="' + payUrl({ course: c }) + '">Mua khóa học · ' + fmt.vnd(c.price) + "</a>" + openAcc + login;
    } else if (need === "vip") {
      title = "Dành riêng cho tài khoản Đầu tư cùng Vũ";
      text = S.offerTitle + " " + S.offerText;
      actions = '<a class="btn btn--gold btn--sm" href="' + url("mo-tai-khoan/") + '">Mở tài khoản / chuyển ID</a>' + login;
    } else {
      const expired = access.memberExpired(u);
      title = expired ? "Gói hội viên của bạn đã hết hạn" : "Nội dung dành cho hội viên";
      text = (expired ? "Gói hết hạn ngày " + fmt.date(u.memberUntil) + ". Gia hạn để xem tiếp. " : "Đăng ký hội viên từ " + fmt.vnd(S.membership.pricePerMonth) + "/tháng, ") +
        "hoặc mở tài khoản / chuyển ID về Đầu tư cùng Vũ với vốn từ " + S.minCapital + " để xem miễn phí, không giới hạn.";
      actions = '<a class="btn btn--gold btn--sm" href="' + url("premium/") + '">' + (expired ? "Gia hạn hội viên" : "Đăng ký hội viên") + "</a>" + openAcc + login;
    }
    return '<div class="lock-box" tabindex="-1">' + icon("lock") + "<h3>" + escapeHtml(title) + "</h3><p>" + escapeHtml(text) + '</p><div class="row">' + actions + "</div></div>";
  }

  /* ---------- Global events ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target;
    const a = IS_FILE && t.closest("a[href]");
    if (a && a.protocol === "file:" && a.pathname.endsWith("/") && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      const u = new URL(a.href);
      u.pathname += "index.html";
      location.href = u.href;
      return;
    }
    const lg = t.closest("[data-login]");
    if (lg) {
      e.preventDefault();
      openLogin(lg.dataset.login || "login");
      return;
    }
    const tab = t.closest("[data-auth-tab]");
    if (tab) {
      showAuthTab(tab.dataset.authTab);
      return;
    }
    if (t.closest("[data-logout]")) {
      closeDrawer();
      auth.logout().then(() => toast("Bạn đã đăng xuất."));
      return;
    }
    const rv = t.closest("[data-resend-verify]");
    if (rv) {
      rv.disabled = true;
      api("auth/resend-verify", { body: {} })
        .then((r) => toast(r.already ? "Email đã được xác minh." : "Đã gửi lại email xác minh."))
        .catch((err) => toast(err.message, "info"))
        .finally(() => (rv.disabled = false));
      return;
    }
    const cp = t.closest("[data-copy]");
    if (cp) {
      const val = cp.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(val) : Promise.reject())
        .then(() => toast("Đã sao chép: " + val))
        .catch(() => toast("Không sao chép được, hãy chọn và copy thủ công.", "info"));
      return;
    }
    const yt = t.closest("[data-yt-play]");
    if (yt) {
      const id = yt.dataset.ytPlay;
      yt.outerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="' + escapeHtml(yt.getAttribute("aria-label") || "Video") + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      return;
    }
    if (t.closest("[data-drawer-open]")) {
      openDrawer();
      return;
    }
    if (t.closest("[data-drawer-close]") || t.classList.contains("drawer")) {
      closeDrawer();
      return;
    }
    if (t.closest("[data-modal-close]") || t.classList.contains("modal")) {
      const m = t.closest(".modal");
      m && closeModal(m);
      return;
    }
    const um = t.closest("[data-user-menu]");
    document.querySelectorAll(".user-chip .dropdown").forEach((dd) => {
      const btn = dd.parentElement.querySelector("[data-user-menu]");
      const open = um === btn && dd.hidden;
      if (!dd.contains(t)) {
        dd.hidden = !open;
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      }
    });
  });

  document.addEventListener("submit", (e) => {
    if (e.target.matches("[data-auth-form]")) {
      e.preventDefault();
      handleAuthSubmit(e.target);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeDrawer();
    document.querySelectorAll(".modal.is-open").forEach(closeModal);
    document.querySelectorAll(".user-chip .dropdown").forEach((dd) => {
      if (!dd.hidden) {
        dd.hidden = true;
        dd.parentElement.querySelector("[data-user-menu]").focus();
      }
    });
  });

  document.addEventListener("auth:change", () => {
    renderHeader();
    renderVerifyBar();
  });

  /* ---------- Boot ---------- */
  function boot() {
    renderHeader();
    renderFooter();
    renderMarketStrip();
    startMarket();
    renderVerifyBar();
    auth.refresh(); // đồng bộ phiên đăng nhập thật; đổi thì bắn auth:change để trang vẽ lại
    // Static [data-icon] placeholders in page markup
    document.querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = icon(el.dataset.icon);
    });
    // Câu ưu đãi / slogan lấy từ data.js để chỉ cần sửa một chỗ
    const S = APP_DATA.site;
    document.querySelectorAll("[data-offer-title]").forEach((el) => (el.textContent = S.offerTitle));
    document.querySelectorAll("[data-offer-text]").forEach((el) => (el.textContent = S.offerText));
    document.querySelectorAll("[data-slogan]").forEach((el) => (el.textContent = S.slogan));
    // Trang Liên hệ: SĐT / Zalo theo Cài đặt CMS (HTML có sẵn số để bot đọc)
    document.querySelectorAll("[data-contact-tel]").forEach((el) => {
      el.href = "tel:" + S.contact.phone.replace(/\s/g, "");
      if (!el.classList.contains("btn")) el.textContent = S.contact.phone;
    });
    document.querySelectorAll("[data-contact-zalo]").forEach((el) => (el.href = S.contact.zalo));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // Video bài học không phát được (hết phiên đăng nhập, chưa có quyền, mất mạng): báo rõ thay vì khung đen
  document.addEventListener("error", (e) => {
    const v = e.target;
    if (!(v instanceof HTMLVideoElement) || !v.hasAttribute("data-lesson-video")) return;
    const box = v.parentElement;
    box.classList.add("video--empty");
    box.innerHTML = icon("info") + "<p><b>Chưa phát được video</b><span>Hãy tải lại trang. Nếu vẫn lỗi, đăng nhập lại hoặc liên hệ Vũ qua Zalo " + escapeHtml(APP_DATA.site.contact.phone) + ".</span></p>";
    auth.refresh();
  }, true);

  window.UI = { url, api, icon, fmt, norm, escapeHtml, store, auth, access, initials, rng, Charts, Art, toast, tabs, openLogin, setFieldError, courseCard, courseThumb, priceTag, newsItem, newsSorted, tagLabel, isTicker, accessBadge, Market, marketNote, newsThumb, articleUrl, courseUrl, courseFilterUrl, newsUrl, payUrl, video, youtubeId, gate, contactButtons };
})();

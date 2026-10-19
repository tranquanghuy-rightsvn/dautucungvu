/* Trang tin tức: lọc theo mã cổ phiếu, chủ đề hoặc từ khóa; mới nhất lên đầu */
(function () {
  const { icon, fmt, norm, Charts, store, toast, escapeHtml, newsItem, newsSorted, tagLabel, newsUrl } = UI;
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
    const color = t.change >= 0 ? "#16a34a" : "#e0393e";
    const diff = t.price - t.price / (1 + t.change / 100);
    quoteEl.innerHTML =
      '<div class="quote-logo" style="background:' + t.color + '">' + t.code + "</div>" +
      "<div><h3>" + t.code + ' <span class="badge badge--soft">' + t.sector + '</span></h3><p class="co">' + t.name + "</p>" +
      '<div class="quote-price"><strong class="num">' + fmt.price(t.price) + '</strong><span class="num ' + fmt.cls(t.change) + '">' + fmt.pct(t.change) + " (" + (diff >= 0 ? "+" : "") + fmt.int(Math.round(diff * 1000)) + ")</span></div></div>" +
      '<div class="quote-spark" aria-label="Diễn biến giá 3 tháng (minh họa)">' + Charts.spark(Charts.walk(60, t.code, t.price, 0.03, t.change / 1500), { w: 300, h: 64, color }) + "</div>";
    const on = follows.includes(t.code);
    followBtn.setAttribute("aria-pressed", on);
    followBtn.innerHTML = icon(on ? "check" : "plus") + "<span>" + (on ? "Đang theo dõi" : "Theo dõi " + t.code) + "</span>";
  }

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

  const focusSearch = location.hash === "#tim-ma";
  apply({});
  if (focusSearch) input.focus();
})();

/* Trang chủ */
(function () {
  const { rng, courseCard, newsSorted, escapeHtml, url, icon, fmt, accessBadge, articleUrl, Art } = UI;
  const D = APP_DATA;

  /* ----- Hero skyline (decorative) ----- */
  function skyline() {
    const W = 1440, H = 260, r = rng("hero-sky");
    let s = '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMax slice" aria-hidden="true">';
    [{ c: "#123a7a", op: 0.5, min: 60, max: 200 }, { c: "#06142e", op: 1, min: 40, max: 150 }].forEach((L, li) => {
      let x = li * 14 - 20;
      while (x < W) {
        const w = 26 + r() * 46, h = L.min + r() * (L.max - L.min);
        s += '<rect x="' + x.toFixed(0) + '" y="' + (H - h).toFixed(0) + '" width="' + w.toFixed(0) + '" height="' + h.toFixed(0) + '" fill="' + L.c + '" opacity="' + L.op + '"/>';
        if (li === 1) {
          for (let wy = H - h + 10; wy < H - 8; wy += 14) {
            for (let wx = x + 6; wx < x + w - 6; wx += 10) {
              if (r() > 0.82) s += '<rect x="' + wx.toFixed(0) + '" y="' + wy.toFixed(0) + '" width="4" height="6" fill="#f6c64a" opacity=".55"/>';
            }
          }
        }
        x += w + 3;
      }
    });
    return s + "</svg>";
  }
  const sky = document.querySelector("[data-hero-skyline]");
  if (sky) sky.innerHTML = skyline();

  /* ----- Khóa học: khóa miễn phí trước, tối đa 4 ----- */
  const fc = document.querySelector("[data-featured-courses]");
  if (fc) fc.innerHTML = D.courses.slice().sort((a, b) => (a.price ? 1 : 0) - (b.price ? 1 : 0)).slice(0, 4).map(courseCard).join("");

  /* ----- Tin tức: bài mới nhất làm tin chính, các bài kế tiếp ở danh sách bên cạnh ----- */
  const TOPICS = [{ id: "", label: "Mới nhất" }].concat(D.newsTags.filter((t) => ["thi-truong", "nhan-dinh", "doanh-nghiep", "vi-mo", "quoc-te"].includes(t.id)));
  const tabList = document.querySelector("[data-home-news-tabs]");
  const newsEl = document.querySelector("[data-home-news]");
  const moreLink = document.querySelector("[data-news-more]");

  function renderNews(topic) {
    const list = newsSorted(topic ? D.news.filter((n) => n.tags.includes(topic)) : D.news);
    moreLink.href = url("tin-tuc/") + (topic ? "?chu-de=" + topic : "");
    if (!list.length) {
      newsEl.innerHTML = '<p class="empty-state">Chưa có bài viết trong mục này.</p>';
      return;
    }
    const [lead, ...rest] = list;
    const tk = D.tickers.find((t) => lead.tags.includes(t.code));
    newsEl.innerHTML =
      '<article class="panel news-feature">' +
      '<div class="news-thumb">' + Art.thumb(lead.art, "n" + lead.id, tk && tk.color) + "</div>" +
      '<div><p class="news-date"><span class="badge badge--green">Mới nhất</span>' + accessBadge(lead.access) + "</p>" +
      '<h3><a href="' + articleUrl(lead) + '">' + escapeHtml(lead.title) + "</a></h3>" +
      '<p class="news-excerpt">' + escapeHtml(lead.excerpt) + '</p><p class="news-date"><time>' + fmt.date(lead.date) + "</time></p></div></article>" +
      '<ul class="panel headline-list">' +
      (rest.length
        ? rest
            .slice(0, 5)
            .map((n) => '<li><a href="' + articleUrl(n) + '"><span class="hl-ico">' + icon(n.access === "public" ? "newspaper" : "lock") + "</span><span>" + escapeHtml(n.title) + "<time>" + fmt.date(n.date) + "</time></span></a></li>")
            .join("")
        : '<li class="hl-empty">Bài tiếp theo sẽ hiện ở đây.</li>') +
      "</ul>";
  }

  if (tabList && newsEl) {
    tabList.innerHTML = TOPICS.map((t, i) => '<button class="tab" role="tab" aria-selected="' + (i === 0) + '" aria-controls="home-news-panel" data-value="' + t.id + '">' + (t.id === "nhan-dinh" ? "Nhận định" : t.label) + "</button>").join("");
    UI.tabs(tabList, renderNews);
    renderNews("");
  }
})();

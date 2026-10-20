/* Trang đọc bài viết, áp dụng quyền xem theo trường "access" của bài */
(function () {
  const { icon, fmt, escapeHtml, url, access, gate, Art, newsSorted, tagLabel, isTicker, accessBadge, articleUrl } = UI;
  const D = APP_DATA;
  // Mỗi bài là một trang tĩnh bai-viet/<slug>/index.html, slug ghi ở <body data-slug>
  const slug = document.body.dataset.slug;
  const n = D.news.find((x) => x.slug === slug) || newsSorted()[0];
  const el = document.querySelector("[data-article]");
  // Thân bài build sẵn trong HTML (nội dung soạn trong CMS, có định dạng + ảnh) — giữ lại khi vẽ
  // lại trang. Bài trả phí chỉ có tóm tắt ở đây (thân bài nằm ở máy chủ, GAS.md II.A.3).
  const prebuilt = el.querySelector("[data-article-body]");
  const bodyHtml = prebuilt ? prebuilt.innerHTML : "";
  // Bài trả phí: thân bài lấy từ máy chủ (/api/content/<slug>), máy chủ tự kiểm quyền.
  // null = chưa tải; "" = đang tải / lỗi; còn lại = HTML thân bài.
  let paidHtml = null;
  let paidFor = null;
  function loadPaid() {
    const who = (UI.auth.user() || {}).email || "";
    if (paidFor === who) return;
    paidFor = who;
    paidHtml = "";
    UI.api("content/" + n.slug)
      .then((r) => (paidHtml = r.content_html || "<p>(Bài chưa có nội dung đầy đủ.)</p>"))
      .catch((e) => {
        paidHtml = null;
        // Phiên trên máy đã cũ (máy chủ báo chưa đăng nhập / không đủ quyền) -> đồng bộ lại
        if (e.status === 401 || e.status === 403) UI.auth.refresh();
        else UI.toast(e.message, "info");
      })
      .then(render);
  }

  // Bài chưa có nội dung đầy đủ thì dựng đoạn minh họa từ phần tóm tắt
  function paragraphs() {
    if (n.body && n.body.length) return n.body;
    return [
      n.excerpt,
      "Diễn biến này phản ánh xu hướng chung của nhóm ngành trong những phiên gần đây. Nhà đầu tư nên theo dõi thêm thanh khoản, dòng tiền khối ngoại và các mốc công bố thông tin sắp tới trước khi ra quyết định.",
      "Ở góc nhìn trung hạn, yếu tố quan trọng nhất vẫn là chất lượng lợi nhuận và khả năng duy trì tăng trưởng. Đầu tư cùng Vũ sẽ tiếp tục cập nhật khi có số liệu mới.",
    ];
  }

  function tagLink(t) {
    const href = UI.newsUrl(t);
    return '<a class="' + (isTicker(t) ? "ticker-tag" : "badge badge--soft") + '" href="' + href + '">' + escapeHtml(tagLabel(t)) + "</a>";
  }

  function render() {
    document.title = n.title + " | Đầu tư cùng Vũ";
    const can = access.can(n.access);
    if (can && n.access !== "public" && paidHtml === null) setTimeout(loadPaid, 0);
    const ps = paragraphs();
    const firstTopic = n.tags.find((t) => !isTicker(t));
    el.innerHTML =
      '<nav class="crumbs" aria-label="Đường dẫn"><a href="' + url("tin-tuc/") + '">Tin tức</a>' +
      (firstTopic ? icon("chevronRight") + '<a href="' + UI.newsUrl(firstTopic) + '">' + escapeHtml(tagLabel(firstTopic)) + "</a>" : "") + "</nav>" +
      "<h1>" + escapeHtml(n.title) + "</h1>" +
      '<p class="article-meta"><time datetime="' + n.date.replace(" ", "T") + '">' + fmt.date(n.date) + "</time>" + accessBadge(n.access) + "</p>" +
      '<div class="article-tags">' + n.tags.map(tagLink).join("") + "</div>" +
      '<div class="article-cover">' + UI.newsThumb(n) + "</div>" +
      (can && n.access !== "public"
        ? paidHtml
          ? '<div class="article-body" data-article-body>' + paidHtml + "</div>"
          : '<div class="article-body is-teaser" data-article-body>' + bodyHtml + '</div><p class="data-note">' + icon("clock") + "Đang tải nội dung đầy đủ...</p>"
        : can
        ? '<div class="article-body" data-article-body>' + (bodyHtml || ps.map((p) => "<p>" + escapeHtml(p) + "</p>").join("")) + "</div>"
        : '<div class="article-body is-teaser" data-article-body><p>' + escapeHtml(ps[0]) + "</p></div>" + gate(n.access)) +
      '<p class="article-note">' + icon("info") + "<span>Nội dung chỉ nhằm mục đích tham khảo, không phải khuyến nghị mua bán chứng khoán.</span></p>";

    const related = newsSorted(D.news.filter((x) => x.id !== n.id && x.tags.some((t) => n.tags.includes(t)))).slice(0, 5);
    document.querySelector("[data-related]").innerHTML = related.length
      ? related.map((x) => '<li><a href="' + articleUrl(x) + '"><span class="hl-ico">' + icon(access.can(x.access) ? "newspaper" : "lock") + "</span><span>" + escapeHtml(x.title) + "<time>" + fmt.date(x.date) + "</time></span></a></li>").join("")
      : '<li class="hl-empty">Chưa có bài liên quan.</li>';
  }

  document.addEventListener("auth:change", render);
  render();
})();

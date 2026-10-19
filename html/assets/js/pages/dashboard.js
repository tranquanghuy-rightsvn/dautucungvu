/* Dashboard (sau khi đăng nhập) */
(function () {
  const { icon, fmt, Charts, Art, store, auth, escapeHtml, url, access, newsSorted, articleUrl, courseThumb } = UI;
  const D = APP_DATA;
  const root = document.querySelector("[data-dashboard]");
  let indexSel = 0;

  const SIDE = [
    { href: url("dashboard/"), icon: "home", label: "Tổng quan", current: true },
    { href: url("khoa-hoc/?loc=mine"), icon: "book", label: "Khóa học của tôi" },
    { href: url("tin-tuc/"), icon: "newspaper", label: "Tin tức theo dõi" },
    { href: "#danh-muc", icon: "briefcase", label: "Danh mục quan tâm" },
    { href: url("premium/"), icon: "crown", label: "Gói hội viên" },
    { href: url("mo-tai-khoan/"), icon: "user", label: "Mở tài khoản / chuyển ID" },
  ];

  function gate() {
    root.innerHTML =
      '<div class="gate"><div class="panel panel-pad">' + icon("lock") +
      "<h1>Đăng nhập để xem trang tổng quan</h1>" +
      "<p>Theo dõi tiến độ học, danh mục cổ phiếu quan tâm và tin tức của bạn ở cùng một nơi.</p>" +
      '<div class="actions"><button class="btn btn--navy btn--lg" type="button" data-login>Đăng nhập</button>' +
      '<button class="btn btn--outline" type="button" data-demo-login="vip">Xem bằng tài khoản demo</button></div></div></div>';
  }

  function greeting() {
    const h = new Date().getHours();
    return h < 11 ? "Chào buổi sáng" : h < 14 ? "Chào buổi trưa" : h < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  }

  function render(user) {
    let progress = store.get("dtcv-progress", {});
    if (!progress || Array.isArray(progress)) progress = {};
    const follows = store.get("dtcv-follow", []);
    const orders = store.get("dtcv-orders", []).filter((o) => o.status === "pending");
    const role = access.role(user);
    const myCourses = D.courses.filter((c) => access.ownsCourse(c, user));
    const totalLessons = myCourses.reduce((a, c) => a + c.lessons.length, 0);
    const doneLessons = myCourses.reduce((a, c) => a + (progress[c.id] || []).length, 0);
    // Học tiếp: khóa đang học dở gần nhất, nếu chưa có thì khóa đầu tiên xem được
    const cur = myCourses.find((c) => (progress[c.id] || []).length && progress[c.id].length < c.lessons.length) || myCourses[0] || D.courses[0];
    const curDone = progress[cur.id] || [];
    const nextIdx = Math.max(0, cur.lessons.findIndex((l, i) => !curDone.includes(i)));
    const nextLesson = cur.lessons[nextIdx];
    const watch = (follows.length ? follows : ["MBB", "FPT", "VNM", "REE", "SSI"]).map((c) => D.tickers.find((t) => t.code === c)).filter(Boolean);
    const feed = newsSorted(D.news.filter((n) => n.tags.some((t) => watch.some((w) => w.code === t)))).concat(newsSorted(D.news.filter((n) => !n.tags.some((t) => watch.some((w) => w.code === t))))).slice(0, 4);
    const tier = {
      vip: { cls: "", ico: "shield", b: "TÀI KHOẢN 50TR", small: "Xem toàn bộ, không giới hạn" },
      member: { cls: "", ico: "crown", b: "HỘI VIÊN", small: "Hết hạn " + fmt.date(user.memberUntil || "") },
      user: { cls: " tier--free", ico: "starLine", b: access.memberExpired(user) ? "Hội viên đã hết hạn" : "Thành viên", small: access.memberExpired(user) ? "Gia hạn hội viên" : "Nâng cấp hội viên" },
    }[role];

    root.innerHTML =
      '<div class="app">' +
      '<aside class="app-side" aria-label="Menu tài khoản"><nav><ul>' +
      SIDE.map((s) => '<li><a href="' + s.href + '"' + (s.current ? ' aria-current="page"' : "") + ">" + icon(s.icon) + s.label + "</a></li>").join("") +
      "</ul></nav>" +
      (role === "user"
        ? '<div class="side-premium"><b>' + icon("crown") + "Xem toàn bộ nội dung</b><p>Đăng ký hội viên từ " + fmt.vnd(D.site.membership.pricePerMonth) + "/tháng, hoặc mở / chuyển tài khoản 50 triệu về Vũ để xem miễn phí.</p></div>"
        : '<div class="side-premium"><b>' + icon("crown") + access.roleName[role] + "</b><p>Nhận định thị trường hôm nay đã sẵn sàng.</p></div>") +
      "</aside>" +
      '<div class="app-main">' +
      // Welcome
      '<div class="welcome"><div><h1>' + greeting() + ", " + escapeHtml(user.name) + "</h1><p>Chúc bạn một ngày giao dịch hiệu quả.</p></div>" +
      '<a class="tier' + tier.cls + '" href="' + url("premium/") + '">' + icon(tier.ico) + "<div><b>" + tier.b + "</b><small>" + tier.small + "</small></div></a>" +
      "</div>" +
      // Đơn thanh toán đang chờ Vũ xác nhận
      (orders.length
        ? '<div class="pending-orders panel">' + icon("clock") + "<div><b>" + orders.length + " đơn đang chờ xác nhận</b><span>" + orders.map((o) => escapeHtml(o.code + " · " + o.title + " · " + fmt.vnd(o.amount))).join("<br>") + "</span></div>" +
          '<a class="btn btn--outline btn--sm" href="' + D.site.contact.zalo + '" target="_blank" rel="noopener">Nhắn Zalo</a></div>'
        : "") +
      // KPIs
      '<div class="kpis">' +
      '<div class="panel kpi"><div class="kpi-label"><span style="background:var(--green-50);color:var(--green-500)">' + icon("book") + "</span>Bài học đã hoàn thành</div>" +
      "<strong>" + doneLessons + "/" + totalLessons + "</strong><small>Trong " + myCourses.length + " khóa học bạn xem được</small>" +
      '<div class="progress-track"><i style="width:' + (totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0) + '%"></i></div></div>' +
      '<div class="panel kpi"><div class="kpi-label"><span style="background:var(--gold-50);color:var(--gold-500)">' + icon("crown") + "</span>Quyền xem của bạn</div>" +
      "<strong>" + access.roleName[role] + "</strong><small>" +
      (role === "vip" ? "Toàn bộ khóa học và tin độc quyền" : role === "member" ? "Còn hạn tới " + fmt.date(user.memberUntil) : '<a href="' + url("premium/") + '">Xem các gói hội viên</a>') +
      "</small></div>" +
      '<div class="panel kpi"><div class="kpi-label"><span style="background:var(--blue-50);color:var(--blue-500)">' + icon("play") + "</span>Khóa học có phí đã sở hữu</div>" +
      "<strong>" + D.courses.filter((c) => c.price && access.ownsCourse(c, user)).length + "/" + D.courses.filter((c) => c.price).length + "</strong>" +
      '<small><a href="' + url("khoa-hoc/") + '?loc=paid">Xem khóa có phí</a></small></div>' +
      "</div>" +
      // Market + watchlist
      '<div class="dash-grid">' +
      '<section class="panel panel-pad" aria-labelledby="mk-title"><div class="card-title"><h2 id="mk-title">Thị trường hôm nay</h2><span class="data-note">' + icon("info") + "Dữ liệu minh họa</span></div>" +
      '<div class="index-tabs" role="tablist" aria-label="Chọn chỉ số">' +
      D.indices
        .map((ix, i) => {
          const pct = (ix.change / (ix.value - ix.change)) * 100;
          return '<button type="button" role="tab" aria-selected="' + (i === indexSel) + '" data-value="' + i + '"><small>' + ix.code + '</small><b class="num">' + fmt.index(ix.value) + '</b><span class="num ' + fmt.cls(ix.change) + '">' + fmt.change(ix.change) + " (" + fmt.pct(pct) + ")</span></button>";
        })
        .join("") +
      '</div><div class="dash-chart" data-dash-chart></div></section>' +
      '<section class="panel panel-pad" id="danh-muc" aria-labelledby="wl-title"><div class="card-title"><h2 id="wl-title">' + (follows.length ? "Cổ phiếu bạn theo dõi" : "Cổ phiếu được quan tâm") + '</h2><a class="link-more" href="' + url("tin-tuc/") + '">Thêm mã</a></div>' +
      '<table class="watch-table"><thead><tr><th scope="col">Mã</th><th scope="col">Giá</th><th scope="col" class="spark-cell"><span class="sr-only">Xu hướng</span></th><th scope="col">+/-</th></tr></thead><tbody>' +
      watch
        .map(
          (t) =>
            '<tr><td><a href="' + url("tin-tuc/") + '?ma=' + t.code + '">' + t.code + '</a></td><td class="num">' + fmt.price(t.price) + "</td>" +
            '<td class="spark-cell">' + Charts.spark(Charts.walk(24, t.code, t.price, 0.03, t.change / 1500), { w: 64, h: 22, color: t.change >= 0 ? "#16a34a" : "#e0393e", fill: false, stroke: 1.6 }) + "</td>" +
            '<td class="num ' + fmt.cls(t.change) + '">' + fmt.pct(t.change) + "</td></tr>"
        )
        .join("") +
      "</tbody></table>" +
      (follows.length ? "" : '<p class="data-note" style="margin-top:12px">' + icon("info") + "Bấm Theo dõi ở trang Tin tức để tạo danh sách của riêng bạn.</p>") +
      "</section></div>" +
      // Continue + news
      '<div class="dash-grid dash-grid--even">' +
      '<section class="panel panel-pad" aria-labelledby="ct-title"><div class="card-title"><h2 id="ct-title">Học tiếp</h2><a class="link-more" href="' + url("khoa-hoc/") + '?loc=mine">Khóa của tôi</a></div>' +
      '<div class="continue"><div class="course-thumb">' + courseThumb(cur) + "</div>" +
      "<div><small>" + escapeHtml(cur.title) + "</small><h3>Bài " + (nextIdx + 1) + ": " + escapeHtml(nextLesson.t) + "</h3>" +
      '<div class="progress"><div class="progress-track"><i style="width:' + Math.round((curDone.length / cur.lessons.length) * 100) + '%"></i></div><span class="progress-label">' + curDone.length + "/" + cur.lessons.length + " bài</span></div></div>" +
      '<a class="btn btn--green" href="' + url("khoa-hoc/") + "?khoa=" + cur.id + "&bai=" + (nextIdx + 1) + '">Tiếp tục học</a></div></section>' +
      '<section class="panel panel-pad" aria-labelledby="fn-title"><div class="card-title"><h2 id="fn-title">Tin nổi bật cho bạn</h2><a class="link-more" href="' + url("tin-tuc/") + '">Tất cả</a></div>' +
      '<ul class="mini-news">' +
      feed
        .map((n) => {
          const tk = D.tickers.find((t) => n.tags.includes(t.code));
          return '<li><a href="' + articleUrl(n) + '"><span class="thumb">' + Art.thumb(n.art, "n" + n.id, tk && tk.color) + "</span><span>" + (tk ? '<span class="ticker-tag">' + tk.code + "</span>" : "") + escapeHtml(n.title) + "<time>" + fmt.date(n.date) + "</time></span></a></li>";
        })
        .join("") +
      "</ul></section></div>" +
      "</div></div>";

    drawChart();
    UI.tabs(root.querySelector(".index-tabs"), (v) => {
      indexSel = +v;
      drawChart();
    });
  }

  function drawChart() {
    const ix = D.indices[indexSel];
    const open = ix.value - ix.change;
    const raw = Charts.walk(48, ix.code, open, 0.004, (ix.change / open) / 48);
    // Kéo đường để điểm đầu = giá mở cửa, điểm cuối = giá hiện tại
    const endFix = ix.value - raw[raw.length - 1];
    const data = raw.map((v, i) => v + (endFix * i) / (raw.length - 1));
    const labels = ["9:00", "10:00", "11:00", "13:00", "14:00", "14:45"];
    const el = root.querySelector("[data-dash-chart]");
    // Vẽ đúng bằng bề rộng thật để chữ trục giờ không bị thu nhỏ trên mobile
    const w = Math.round(el.clientWidth) || 640;
    const h = Math.round(Math.min(230, Math.max(170, w * 0.36)));
    el.innerHTML = Charts.area(data, { w, h, color: ix.change >= 0 ? "#16a34a" : "#e0393e", labels, label: "Diễn biến " + ix.code + " trong phiên" });
    if (!chartRO) {
      let lastW = w;
      chartRO = new ResizeObserver(() => {
        const cur = root.querySelector("[data-dash-chart]");
        if (cur && Math.round(cur.clientWidth) !== lastW) {
          lastW = Math.round(cur.clientWidth);
          drawChart();
        }
      });
    }
    chartRO.disconnect();
    chartRO.observe(el);
  }
  let chartRO = null;

  function boot() {
    const u = auth.user();
    if (u) render(u);
    else gate();
  }
  document.addEventListener("auth:change", boot);
  boot();
})();

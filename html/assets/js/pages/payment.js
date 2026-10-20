/* Trang thanh toán: gói hội viên (/thanh-toan/goi-<1|3|6|12>-thang/) hoặc khóa học (/thanh-toan/<id>/).
   Đơn tạo trên máy chủ (/api/orders — số tiền + mã nội dung do máy chủ quyết định), chuyển khoản
   VietQR theo đơn, Vũ xác nhận tay trong trang quản trị rồi hệ thống kích hoạt (GAS.md VI.2–VI.3). */
(function () {
  const { icon, fmt, escapeHtml, url, api, auth, access, contactButtons, toast, courseUrl, payUrl } = UI;
  const D = APP_DATA;
  const S = D.site;
  const P = S.payment;
  const page = document.body.dataset; // data-course / data-plan do scripts/build.py ghi
  const root = document.querySelector("[data-payment]");

  const course = D.courses.find((c) => c.id === page.course);
  let months = S.membership.months.includes(+page.plan) ? +page.plan : S.membership.months[0];
  const kind = course ? "course" : "member";
  const ref = () => (course ? course.id : String(months));
  let orders = null; // đơn của người dùng (null = chưa tải)
  let busy = false;

  const currentOrder = () =>
    (orders || []).find((o) => o.kind === kind && o.ref === ref() && (o.status === "pending" || (o.status === "confirmed" && recent(o.confirmed_at))));
  const recent = (iso) => iso && Date.now() - Date.parse(iso) < 7 * 864e5;

  function item() {
    return course
      ? { title: "Khóa học: " + course.title, amount: course.price, note: "Học không giới hạn thời gian sau khi kích hoạt." }
      : { title: "Gói hội viên " + months + " tháng", amount: S.membership.pricePerMonth * months, note: "Thời hạn " + months + " tháng, tính từ ngày Vũ kích hoạt (còn hạn thì cộng dồn). Hết hạn tài khoản tự về thành viên thường." };
  }

  function qr(amount, content) {
    if (P.qrImage) return '<img src="' + url(P.qrImage) + '" alt="Mã QR chuyển khoản tới ' + escapeHtml(P.accountName + " – " + P.bankName) + '" width="260" height="291" class="qr-photo">';
    if (P.bankId && P.accountNo) {
      const src = "https://img.vietqr.io/image/" + encodeURIComponent(P.bankId) + "-" + encodeURIComponent(P.accountNo) + "-compact2.png" +
        "?amount=" + amount + "&addInfo=" + encodeURIComponent(content) + "&accountName=" + encodeURIComponent(P.accountName);
      return '<img src="' + src + '" alt="Mã QR chuyển khoản ' + fmt.vnd(amount) + '" width="260" height="308" class="qr-photo">';
    }
    return '<div class="qr-missing">' + icon("info") + "<p><b>Chưa có thông tin tài khoản nhận tiền</b><span>Liên hệ Vũ qua Zalo để được hướng dẫn chuyển khoản.</span></p></div>";
  }

  function row(label, value, copy) {
    return '<div class="copy-row"><span>' + label + "</span><b>" + escapeHtml(value) + "</b>" +
      (copy ? '<button type="button" class="btn btn--outline btn--sm" data-copy="' + escapeHtml(copy) + '">Sao chép</button>' : "<i></i>") + "</div>";
  }

  function planPicker() {
    if (course) return "";
    return (
      '<fieldset class="plan-pick"><legend>Chọn thời hạn</legend><div>' +
      S.membership.months
        .map((m) =>
          '<label><input type="radio" name="months" value="' + m + '"' + (m === months ? " checked" : "") + ">" +
          "<span><b>" + m + " tháng</b><small>" + fmt.vnd(S.membership.pricePerMonth * m) + "</small></span></label>")
        .join("") +
      "</div></fieldset>"
    );
  }

  function summary() {
    const it = item();
    const u = auth.user();
    let status = "";
    if (course && access.ownsCourse(course)) status = '<p class="owned-note">' + icon("checkCircle") + "Bạn đã sở hữu khóa học này.</p>";
    if (!course && u && u.vip) status = '<p class="owned-note">' + icon("checkCircle") + "Tài khoản VIP đã được xem toàn bộ nội dung, không cần mua gói.</p>";
    if (!course && access.memberActive(u)) status = '<p class="owned-note owned-note--free">' + icon("info") + "Gói hội viên hiện tại còn hạn tới " + fmt.date(u.memberUntil) + " — mua thêm sẽ cộng dồn.</p>";
    return (
      '<aside class="panel panel-pad pay-summary"><h2>Đơn hàng</h2>' + planPicker() +
      '<div class="pay-line"><span>' + escapeHtml(it.title) + "</span><b>" + fmt.vnd(it.amount) + "</b></div>" +
      '<div class="pay-total"><span>Tổng thanh toán</span><b>' + fmt.vnd(it.amount) + "</b></div>" +
      '<p class="pay-note">' + escapeHtml(it.note) + "</p>" + status +
      '<p class="pay-alt">' + icon("gift") + "<span>Muốn xem miễn phí toàn bộ khóa học và tin độc quyền? " + escapeHtml(S.offerTitle) + " " + escapeHtml(S.offerText) + ' <a href="' + url("mo-tai-khoan/") + '">Xem cách làm</a></span></p>' +
      "</aside>"
    );
  }

  function panel(inner) {
    return '<div class="panel panel-pad pay-main">' + inner + "</div>";
  }

  function mainBox() {
    const u = auth.user();
    if (!u) {
      return panel("<h2>Đăng nhập để thanh toán</h2><p>Đơn hàng gắn với tài khoản của bạn để Vũ kích hoạt đúng người sau khi nhận tiền.</p>" +
        '<div class="row"><button class="btn btn--navy btn--lg" type="button" data-login>Đăng nhập</button>' +
        '<button class="btn btn--outline btn--lg" type="button" data-login="register">Tạo tài khoản miễn phí</button></div>');
    }
    if (!u.verified) {
      return panel("<h2>Xác minh email trước khi thanh toán</h2><p>Chúng tôi đã gửi liên kết xác minh tới <b>" + escapeHtml(u.email) +
        "</b>. Bấm liên kết đó rồi tải lại trang này. Không thấy email? Kiểm tra mục Spam / Quảng cáo.</p>" +
        '<button class="btn btn--outline" type="button" data-resend-verify>Gửi lại email xác minh</button>');
    }
    if ((course && access.ownsCourse(course)) || (!course && u.vip)) {
      return panel("<h2>Bạn đã có quyền xem</h2><p>Không cần thanh toán thêm.</p>" +
        '<a class="btn btn--navy" href="' + (course ? courseUrl(course) : url("tin-tuc/")) + '">' + (course ? "Vào học" : "Đọc tin") + "</a>");
    }
    if (orders === null) return panel('<p class="data-note">' + icon("clock") + "Đang tải đơn hàng...</p>");
    const o = currentOrder();
    if (o && o.status === "confirmed") {
      return panel('<div class="pay-done">' + icon("checkCircle") + "<h2>Đã kích hoạt " + escapeHtml(o.title) + "</h2>" +
        "<p>Đơn <b>" + escapeHtml(o.code) + "</b> đã được Vũ xác nhận.</p>" +
        '<a class="btn btn--navy" href="' + (course ? courseUrl(course) : url("tin-tuc/")) + '">' + (course ? "Vào học" : "Đọc tin hội viên") + "</a></div>");
    }
    if (!o) {
      const it = item();
      return panel("<h2>Chuyển khoản bằng mã QR</h2>" +
        "<p>Bấm nút bên dưới để tạo đơn và nhận mã QR (đã có sẵn số tiền + nội dung chuyển khoản). Đơn giữ trong 3 ngày.</p>" +
        '<button class="btn btn--gold btn--lg btn--block" type="button" data-create-order>Tạo mã QR thanh toán · ' + fmt.vnd(it.amount) + "</button>");
    }
    const reported = !!o.paid_reported_at;
    return panel(
      "<h2>Chuyển khoản bằng mã QR</h2>" +
      '<ol class="pay-steps"><li>Mở ứng dụng ngân hàng, quét mã QR bên dưới.</li><li>Kiểm tra đúng số tiền và <b>nội dung chuyển khoản</b>.</li><li>Chuyển xong, bấm “Tôi đã chuyển khoản”. Vũ xác nhận sẽ kích hoạt và gửi email báo bạn.</li></ol>' +
      '<div class="pay-qr">' + qr(o.amount, o.code) + '<div class="pay-bank">' +
      (P.bankName ? row("Ngân hàng", P.bankName) : "") +
      (P.accountNo ? row("Số tài khoản", P.accountNo, P.accountNo) : "") +
      (P.accountName ? row("Chủ tài khoản", P.accountName) : "") +
      row("Số tiền", fmt.vnd(o.amount), String(o.amount)) +
      row("Nội dung", o.code, o.code) +
      "</div></div>" +
      (reported
        ? '<div class="pay-done">' + icon("checkCircle") + "<h3>Đã báo chuyển khoản — chờ Vũ xác nhận</h3>" +
          "<p>Thường trong giờ làm việc. Muốn nhanh hơn, gửi ảnh biên lai qua Zalo.</p>" +
          '<div class="pay-contact">' + contactButtons() + "</div>" +
          '<a class="link-more" href="' + url("dashboard/") + '">Xem trạng thái đơn trong trang Tổng quan</a></div>'
        : '<button class="btn btn--green btn--lg btn--block" type="button" data-paid="' + escapeHtml(o.code) + '">Tôi đã chuyển khoản</button>') +
      '<p class="pay-help">' + icon("message") + "<span>Cần hỗ trợ? Liên hệ Vũ: " + escapeHtml(S.contact.phone) + " (Zalo)</span></p>"
    );
  }

  function render() {
    if (course && !course.price) {
      root.innerHTML = panel("<h2>Khóa học miễn phí</h2><p>“" + escapeHtml(course.title) + '” không cần thanh toán.</p><a class="btn btn--navy" href="' + courseUrl(course) + '">Vào học</a>');
      return;
    }
    root.innerHTML = mainBox() + summary();
  }

  function loadOrders() {
    const u = auth.user();
    if (!u || !u.verified) {
      orders = [];
      render();
      return;
    }
    api("orders")
      .then((r) => (orders = r.orders))
      .catch((e) => {
        orders = [];
        if (e.status === 401) auth.refresh();
        else toast(e.message, "info");
      })
      .then(render);
  }

  root.addEventListener("change", (e) => {
    if (e.target.name === "months") {
      months = +e.target.value;
      history.replaceState(null, "", payUrl({ months }));
      render();
    }
  });
  root.addEventListener("click", (e) => {
    const create = e.target.closest("[data-create-order]");
    const paid = e.target.closest("[data-paid]");
    if ((!create && !paid) || busy) return;
    busy = true;
    const btn = create || paid;
    btn.disabled = true;
    btn.classList.add("is-loading");
    const job = create
      ? api("orders", { body: course ? { kind: "course", course_id: course.id } : { kind: "member", months } })
      : api("orders/paid", { body: { code: paid.dataset.paid } }).then((r) => (toast("Đã báo chuyển khoản. Vũ sẽ xác nhận sớm."), r));
    job
      .then((r) => {
        orders = (orders || []).filter((o) => o.code !== r.order.code).concat(r.order);
        render();
        root.scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch((err) => toast(err.message, "info"))
      .finally(() => {
        busy = false;
        btn.disabled = false;
        btn.classList.remove("is-loading");
      });
  });
  document.addEventListener("auth:change", () => {
    orders = null;
    render();
    loadOrders();
  });
  render();
  loadOrders();
})();

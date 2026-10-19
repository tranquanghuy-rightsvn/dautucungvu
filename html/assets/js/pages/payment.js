/* Trang thanh toán: gói hội viên (/thanh-toan/goi-<1|3|6|12>-thang/) hoặc khóa học (/thanh-toan/<id>/)
   Thanh toán bằng chuyển khoản QR, Vũ xác nhận thủ công rồi kích hoạt. */
(function () {
  const { icon, fmt, escapeHtml, url, auth, access, store, contactButtons, toast, courseUrl, payUrl } = UI;
  const D = APP_DATA;
  const S = D.site;
  const P = S.payment;
  const page = document.body.dataset; // data-course / data-plan do scripts/seo.py ghi
  const root = document.querySelector("[data-payment]");

  const course = D.courses.find((c) => c.id === page.course);
  let months = S.membership.months.includes(+page.plan) ? +page.plan : S.membership.months[0];
  const kind = course ? "course" : "member";
  let submitted = null;

  // Mã đơn ngắn, cố định trong phiên để nội dung chuyển khoản không đổi khi tải lại
  function orderCode() {
    const key = "dtcv-order-code-" + (course ? course.id : "hv");
    let code = null;
    try { code = sessionStorage.getItem(key); } catch (e) {}
    if (!code) {
      code = Math.random().toString(36).slice(2, 7).toUpperCase();
      try { sessionStorage.setItem(key, code); } catch (e) {}
    }
    return "DTCV " + (course ? "KH" : "HV" + months) + " " + code;
  }

  function item() {
    return course
      ? { title: "Khóa học: " + course.title, amount: course.price, note: "Học không giới hạn thời gian sau khi kích hoạt." }
      : { title: "Gói hội viên " + months + " tháng", amount: S.membership.pricePerMonth * months, note: "Thời hạn " + months + " tháng, tính từ ngày Vũ kích hoạt. Hết hạn tài khoản tự về thành viên thường." };
  }

  function qr(amount, content) {
    if (P.qrImage) return '<img src="' + url(P.qrImage) + '" alt="Mã QR chuyển khoản tới ' + escapeHtml(P.accountName + " – " + P.bankName) + '" width="260" height="291" class="qr-photo">';
    if (P.bankId && P.accountNo) {
      const src = "https://img.vietqr.io/image/" + encodeURIComponent(P.bankId) + "-" + encodeURIComponent(P.accountNo) + "-compact2.png" +
        "?amount=" + amount + "&addInfo=" + encodeURIComponent(content) + "&accountName=" + encodeURIComponent(P.accountName);
      return '<img src="' + src + '" alt="Mã QR chuyển khoản ' + fmt.vnd(amount) + '" width="260" height="260">';
    }
    return '<div class="qr-missing">' + icon("info") + "<p><b>Chưa có thông tin tài khoản nhận tiền</b><span>Điền ngân hàng, số tài khoản hoặc ảnh QR trong assets/js/data.js (mục payment).</span></p></div>";
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
    if (!course && u && u.vip) status = '<p class="owned-note">' + icon("checkCircle") + "Tài khoản 50 triệu đã được xem toàn bộ nội dung, không cần mua gói.</p>";
    if (!course && access.memberActive(u)) status = '<p class="owned-note owned-note--free">' + icon("info") + "Gói hội viên hiện tại còn hạn tới " + fmt.date(u.memberUntil) + ".</p>";
    return (
      '<aside class="panel panel-pad pay-summary"><h2>Đơn hàng</h2>' + planPicker() +
      '<div class="pay-line"><span>' + escapeHtml(it.title) + "</span><b>" + fmt.vnd(it.amount) + "</b></div>" +
      '<div class="pay-total"><span>Tổng thanh toán</span><b>' + fmt.vnd(it.amount) + "</b></div>" +
      '<p class="pay-note">' + escapeHtml(it.note) + "</p>" + status +
      '<p class="pay-alt">' + icon("gift") + "<span>Muốn xem miễn phí toàn bộ khóa học và tin độc quyền? " + escapeHtml(S.offerTitle) + " " + escapeHtml(S.offerText) + ' <a href="' + url("mo-tai-khoan/") + '">Xem cách làm</a></span></p>' +
      "</aside>"
    );
  }

  function render() {
    const u = auth.user();
    const it = item();
    if (course && !course.price) {
      root.innerHTML = '<div class="panel panel-pad pay-main"><h2>Khóa học miễn phí</h2><p>“' + escapeHtml(course.title) + '” không cần thanh toán.</p><a class="btn btn--navy" href="' + courseUrl(course) + '">Vào học</a></div>';
      return;
    }
    let main;
    if (!u) {
      main =
        '<div class="panel panel-pad pay-main"><h2>Đăng nhập để thanh toán</h2>' +
        "<p>Đơn hàng cần gắn với tài khoản của bạn để Vũ kích hoạt đúng người sau khi nhận tiền.</p>" +
        '<button class="btn btn--navy btn--lg" type="button" data-login>Đăng nhập</button></div>';
    } else if (submitted) {
      main =
        '<div class="panel panel-pad pay-main pay-done">' + icon("checkCircle") +
        "<h2>Đã ghi nhận đơn " + escapeHtml(submitted.code) + "</h2>" +
        "<p>Vũ sẽ kiểm tra giao dịch và kích hoạt <b>" + escapeHtml(submitted.title) + "</b> cho tài khoản <b>" + escapeHtml(u.name) + "</b>. Để được kích hoạt nhanh, gửi ảnh biên lai chuyển khoản qua Zalo.</p>" +
        '<div class="pay-contact">' + contactButtons() + "</div>" +
        '<a class="link-more" href="' + url("dashboard/") + '">Xem trạng thái đơn trong trang Tổng quan</a></div>';
    } else {
      const code = orderCode();
      main =
        '<div class="panel panel-pad pay-main">' +
        "<h2>Chuyển khoản bằng mã QR</h2>" +
        '<ol class="pay-steps"><li>Mở ứng dụng ngân hàng, quét mã QR bên dưới.</li><li>Kiểm tra đúng số tiền và <b>nội dung chuyển khoản</b>.</li><li>Chuyển xong, bấm “Tôi đã chuyển khoản” và gửi biên lai qua Zalo.</li></ol>' +
        '<div class="pay-qr">' + qr(it.amount, code) + '<div class="pay-bank">' +
        (P.bankName ? row("Ngân hàng", P.bankName) : "") +
        (P.accountNo ? row("Số tài khoản", P.accountNo, P.accountNo) : "") +
        (P.accountName ? row("Chủ tài khoản", P.accountName) : "") +
        row("Số tiền", fmt.vnd(it.amount), String(it.amount)) +
        row("Nội dung", code, code) +
        "</div></div>" +
        '<button class="btn btn--green btn--lg btn--block" type="button" data-paid>Tôi đã chuyển khoản</button>' +
        '<p class="pay-help">' + icon("message") + "<span>Cần hỗ trợ? Liên hệ Vũ: " + escapeHtml(S.contact.phone) + ' (Zalo)</span></p></div>';
    }
    root.innerHTML = main + summary();
  }

  root.addEventListener("change", (e) => {
    if (e.target.name === "months") {
      months = +e.target.value;
      history.replaceState(null, "", payUrl({ months }));
      render();
    }
  });
  root.addEventListener("click", (e) => {
    if (!e.target.closest("[data-paid]")) return;
    const it = item();
    submitted = { code: orderCode(), title: it.title, amount: it.amount, kind, ref: course ? course.id : months, date: new Date().toISOString(), status: "pending" };
    store.set("dtcv-orders", store.get("dtcv-orders", []).concat(submitted));
    toast("Đã ghi nhận đơn " + submitted.code + ". Vũ sẽ xác nhận sớm.");
    render();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.addEventListener("auth:change", render);
  render();
})();

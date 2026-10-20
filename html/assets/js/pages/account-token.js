/* Trang mở từ link trong email: /tai-khoan/xac-minh-email/#<mã> và /tai-khoan/dat-lai-mat-khau/#<mã>.
   Mã nằm sau dấu # (không gửi lên máy chủ khi tải trang, không vào log) — đọc xong xoá khỏi thanh
   địa chỉ ngay, rồi gửi lên /api/auth/verify | reset (GAS.md VI.1). */
(function () {
  const { icon, escapeHtml, url, api, auth, toast } = UI;
  const box = document.querySelector("[data-token-box]");
  const kind = document.body.dataset.kind;
  const token = decodeURIComponent(location.hash.slice(1));
  if (token) history.replaceState(null, "", location.pathname);

  const done = (title, text, href, label) => {
    box.innerHTML = '<div class="auth-done">' + icon("checkCircle") + "<div><b>" + escapeHtml(title) + "</b><p>" + text + "</p></div></div>" +
      (href ? '<p style="margin-top:14px"><a class="btn btn--navy" href="' + href + '">' + escapeHtml(label) + "</a></p>" : "");
  };
  const fail = (msg) => {
    box.innerHTML = '<p class="form-error">' + escapeHtml(msg) + "</p>" +
      (kind === "dat-lai-mat-khau"
        ? '<button class="btn btn--navy" type="button" data-login="forgot">Gửi lại liên kết đặt lại mật khẩu</button>'
        : '<button class="btn btn--navy" type="button" data-resend-verify>Gửi lại email xác minh</button> <button class="btn btn--outline" type="button" data-login>Đăng nhập</button>');
  };

  if (!token) return fail("Liên kết không đầy đủ. Mở lại đúng liên kết trong email (bấm nút trong email thay vì copy một phần).");

  if (kind === "xac-minh-email") {
    box.innerHTML = '<p class="data-note">' + icon("clock") + "Đang xác minh...</p>";
    api("auth/verify", { body: { token } })
      .then((r) => {
        auth.refresh();
        done("Đã xác minh email " + r.email, "Bạn có thể mua gói hội viên / khóa học ngay bây giờ.", url("premium/"), "Xem gói hội viên");
      })
      .catch((e) => fail(e.message));
    return;
  }

  box.innerHTML =
    '<form data-reset-form novalidate>' +
    '<div class="field"><label for="rp-pass">Mật khẩu mới (ít nhất 8 ký tự)</label><input class="input" id="rp-pass" name="password" type="password" autocomplete="new-password" required minlength="8"></div>' +
    '<div class="field"><label for="rp-pass2">Nhập lại mật khẩu mới</label><input class="input" id="rp-pass2" name="password2" type="password" autocomplete="new-password" required minlength="8"></div>' +
    '<p class="form-error" data-form-error></p><button class="btn btn--navy btn--lg" type="submit">Đặt mật khẩu mới</button></form>';
  box.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const err = f.querySelector("[data-form-error]");
    if (f.password.value.length < 8) return (err.textContent = "Mật khẩu cần ít nhất 8 ký tự.");
    if (f.password.value !== f.password2.value) return (err.textContent = "Hai lần nhập mật khẩu chưa khớp.");
    const btn = f.querySelector("button");
    btn.disabled = true;
    api("auth/reset", { body: { token, password: f.password.value } })
      .then((r) => {
        auth.set(r.user);
        toast("Đã đặt mật khẩu mới và đăng nhập.");
        done("Đã đặt mật khẩu mới", "Bạn đã được đăng nhập. Các thiết bị khác đã bị đăng xuất.", url("dashboard/"), "Vào trang Tổng quan");
      })
      .catch((e2) => {
        btn.disabled = false;
        err.textContent = e2.message;
      });
  });
})();

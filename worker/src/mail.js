/* Email giao dịch (GAS.md VI.5) qua Cloudflare Email Service (binding EMAIL). Mỗi email có
   HTML + text, tiếng Việt, gửi từ MAIL_FROM, trả lời về MAIL_REPLY_TO. Chỉ email giao dịch —
   không gửi quảng cáo. Gửi lỗi -> log, KHÔNG làm hỏng thao tác chính (đăng ký, tạo đơn...). */

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
const vnDate = (ymd) => (ymd ? ymd.split("-").reverse().join("/") : "");

function layout({ title, lines, cta, foot }) {
  const html =
    '<!doctype html><html lang="vi"><body style="margin:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f1b33">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden">' +
    '<tr><td style="background:#06142e;padding:18px 24px;color:#e9ad22;font-weight:bold;font-size:18px">ĐẦU TƯ CÙNG VŨ</td></tr>' +
    '<tr><td style="padding:24px">' +
    '<h1 style="margin:0 0 14px;font-size:20px;line-height:1.4">' + esc(title) + "</h1>" +
    lines.map((l) => '<p style="margin:0 0 12px;font-size:15px;line-height:1.6">' + l + "</p>").join("") +
    (cta ? '<p style="margin:22px 0"><a href="' + esc(cta.url) + '" style="display:inline-block;background:#123a7a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold">' + esc(cta.label) + "</a></p>" +
      '<p style="margin:0 0 12px;font-size:12px;color:#64718a;word-break:break-all">Nếu nút không bấm được, mở đường link: ' + esc(cta.url) + "</p>" : "") +
    (foot ? '<p style="margin:18px 0 0;font-size:13px;color:#64718a;line-height:1.6">' + foot + "</p>" : "") +
    "</td></tr>" +
    '<tr><td style="padding:14px 24px;background:#f7f9fc;font-size:12px;color:#64718a">Email tự động từ dautucungvu.com — trả lời email này để liên hệ Vũ.</td></tr>' +
    "</table></td></tr></table></body></html>";
  const strip = (s) => String(s).replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const text =
    "ĐẦU TƯ CÙNG VŨ\n\n" + title + "\n\n" + lines.map(strip).join("\n\n") +
    (cta ? "\n\n" + cta.label + ": " + cta.url : "") + (foot ? "\n\n" + strip(foot) : "") +
    "\n\n—\nEmail tự động từ dautucungvu.com — trả lời email này để liên hệ Vũ.";
  return { html, text };
}

export async function sendMail(env, to, subject, content) {
  if (!env.EMAIL || !to) {
    console.warn("mail: chưa cấu hình EMAIL / thiếu người nhận, bỏ qua:", subject);
    return false;
  }
  try {
    await env.EMAIL.send({
      to,
      from: { email: env.MAIL_FROM || "thongbao@dautucungvu.com", name: "Đầu tư cùng Vũ" },
      ...(env.MAIL_REPLY_TO ? { replyTo: env.MAIL_REPLY_TO } : {}),
      subject,
      html: content.html,
      text: content.text,
    });
    return true;
  } catch (err) {
    console.error("mail: gửi lỗi", subject, to, String(err));
    return false;
  }
}

const site = (env) => env.SITE_URL || "https://dautucungvu.com";
const NOT_YOU = "Nếu không phải bạn thực hiện, bỏ qua email này hoặc trả lời để báo Vũ.";

export const mails = {
  verify: (env, u, token) => ["Xác minh email tài khoản Đầu tư cùng Vũ", layout({
    title: "Xác minh email của bạn",
    lines: ["Chào " + esc(u.name) + ",", "Bấm nút bên dưới để xác minh email và hoàn tất đăng ký. Liên kết có hiệu lực trong 24 giờ."],
    cta: { label: "Xác minh email", url: site(env) + "/tai-khoan/xac-minh-email/#" + token },
    foot: NOT_YOU,
  })],
  reset: (env, u, token) => ["Đặt lại mật khẩu Đầu tư cùng Vũ", layout({
    title: "Đặt lại mật khẩu",
    lines: ["Chào " + esc(u.name) + ",", "Bạn (hoặc quản trị viên theo yêu cầu của bạn) vừa yêu cầu đặt lại mật khẩu. Liên kết có hiệu lực trong 30 phút và chỉ dùng được 1 lần."],
    cta: { label: "Đặt mật khẩu mới", url: site(env) + "/tai-khoan/dat-lai-mat-khau/#" + token },
    foot: "Nếu không phải bạn yêu cầu, bỏ qua email này — mật khẩu hiện tại vẫn giữ nguyên.",
  })],
  passwordChanged: (env, u) => ["Mật khẩu tài khoản vừa được thay đổi", layout({
    title: "Mật khẩu của bạn vừa được thay đổi",
    lines: ["Chào " + esc(u.name) + ",", "Mật khẩu tài khoản " + esc(u.email) + " vừa được đổi. Các thiết bị khác đã được đăng xuất."],
    foot: "<b>Không phải bạn?</b> Trả lời email này hoặc nhắn Zalo cho Vũ ngay để khoá tài khoản.",
  })],
  orderCreated: (env, u, o, payPath, bank) => ["Đã nhận đơn " + o.code, layout({
    title: "Đã nhận đơn " + o.code,
    lines: [
      "Chào " + esc(u.name) + ",",
      "Đơn <b>" + esc(o.title) + "</b> — <b>" + vnd(o.amount) + "</b>.",
      "Chuyển khoản tới <b>" + esc(bank.bankName) + " " + esc(bank.accountNo) + "</b> (" + esc(bank.accountName) + ") với nội dung <b>" + esc(o.code) + "</b>. Vũ xác nhận xong sẽ kích hoạt và gửi email báo cho bạn.",
      "Đơn chờ thanh toán trong 3 ngày, quá hạn tự huỷ.",
    ],
    cta: { label: "Mở lại mã QR thanh toán", url: site(env) + payPath },
  })],
  activated: (env, u, o, memberUntil) => ["Đã kích hoạt: " + o.title, layout({
    title: "Đã kích hoạt " + o.title,
    lines: [
      "Chào " + esc(u.name) + ",",
      "Vũ đã xác nhận đơn <b>" + esc(o.code) + "</b>." + (memberUntil ? " Gói hội viên của bạn còn hạn tới hết ngày <b>" + vnDate(memberUntil) + "</b>." : " Bạn đã có thể vào học."),
    ],
    cta: memberUntil ? { label: "Xem tin hội viên", url: site(env) + "/tin-tuc/" } : { label: "Vào học", url: site(env) + "/khoa-hoc/cua-toi/" },
  })],
  vipGranted: (env, u) => ["Tài khoản của bạn đã được mở toàn bộ nội dung", layout({
    title: "Chào mừng thành viên VIP",
    lines: ["Chào " + esc(u.name) + ",", "Tài khoản " + esc(u.email) + " đã được mở xem toàn bộ khóa học và tin tức độc quyền, không giới hạn thời gian."],
    cta: { label: "Bắt đầu học", url: site(env) + "/khoa-hoc/" },
  })],
  remind: (env, u, days) => ["Gói hội viên còn " + days + " ngày", layout({
    title: "Gói hội viên còn " + days + " ngày",
    lines: ["Chào " + esc(u.name) + ",", "Gói hội viên của bạn hết hạn sau ngày <b>" + vnDate(u.member_until) + "</b>. Gia hạn để không bị gián đoạn nhận định và tin độc quyền."],
    cta: { label: "Gia hạn hội viên", url: site(env) + "/premium/" },
  })],
  expired: (env, u) => ["Gói hội viên đã hết hạn", layout({
    title: "Gói hội viên đã hết hạn",
    lines: ["Chào " + esc(u.name) + ",", "Gói hội viên của bạn đã hết hạn ngày " + vnDate(u.member_until) + ". Tài khoản đã về thành viên thường — bạn vẫn đọc được tin công khai và khóa miễn phí."],
    cta: { label: "Gia hạn hội viên", url: site(env) + "/premium/" },
  })],
  newOrderToAdmin: (env, u, o) => ["[Đơn mới] " + o.code + " — " + vnd(o.amount), layout({
    title: "Đơn mới chờ xác nhận: " + o.code,
    lines: [
      "<b>" + esc(o.title) + "</b> — <b>" + vnd(o.amount) + "</b>",
      "Người mua: " + esc(u.name) + " — " + esc(u.email) + (u.phone ? " — " + esc(u.phone) : ""),
      "Người mua báo đã chuyển khoản. Kiểm tra sao kê có nội dung <b>" + esc(o.code) + "</b> rồi bấm Xác nhận trong trang quản trị.",
    ],
    cta: env.CMS_URL ? { label: "Mở trang quản trị", url: env.CMS_URL } : null,
  })],
};

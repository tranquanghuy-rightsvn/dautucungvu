/* Đơn hàng + quyền xem (GAS.md VI.2–VI.4). Giá / danh sách khóa / quyền bài viết lấy từ
   /assets/catalog.json do build sinh từ data/ — KHÔNG tin số tiền gửi lên từ trình duyệt. */
import { HttpError } from "./http.js";
import { sendMail, mails } from "./mail.js";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bỏ I, O, 0, 1 cho dễ đọc khi chuyển khoản
const PENDING_DAYS = 3;
const RANK = { public: 0, user: 1, member: 2, vip: 3 };

export async function loadCatalog(env) {
  const res = await env.ASSETS.fetch("https://assets.local/assets/catalog.json");
  if (!res.ok) throw new Error("thiếu catalog.json");
  return res.json();
}

/** Ngày hôm nay theo giờ Việt Nam, 'YYYY-MM-DD'. */
export function todayVN(now = new Date()) {
  return new Date(now.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

export function addDays(ymd, n) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Cộng tháng theo lịch; ngày không tồn tại (31/02) -> lùi về cuối tháng. */
export function addMonths(ymd, n) {
  const [y, m, d] = ymd.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m - 1 + n, Math.min(d, last))).toISOString().slice(0, 10);
}

export const memberActive = (u) => !!(u && u.member_until && u.member_until >= todayVN());

export async function userCourseIds(env, userId) {
  const { results } = await env.DB.prepare("SELECT course_id FROM course_access WHERE user_id = ?").bind(userId).all();
  return results.map((r) => r.course_id);
}

/** Đúng cấu trúc user mà JS trên site đang dùng: {email, name, vip, memberUntil, courses[]}. */
export function publicUser(u, courses) {
  return {
    email: u.email,
    name: u.name,
    phone: u.phone,
    verified: !!u.email_verified_at,
    vip: !!u.vip,
    memberUntil: u.member_until || null,
    courses,
  };
}

/** Quyền đọc theo cấp (public < user < member < vip). VIP xem tất cả. */
export function canRead(level, u) {
  if (!level || level === "public") return true;
  if (!u) return false;
  const role = u.vip ? "vip" : memberActive(u) ? "member" : "user";
  return RANK[role] >= (RANK[level] || 0);
}

/** Quyền xem 1 bài học (GAS.md VI.4): bài "Học thử" -> tất cả; khóa miễn phí -> theo quyền xem của
 * khóa (public / user); khóa có phí -> đã mua khóa đó HOẶC VIP. course + lesson lấy từ catalog. */
export async function canWatch(env, course, lesson, u) {
  if (lesson.preview && course.price) return true;
  if (!course.price) return canRead(course.access || "public", u);
  if (!u) return false;
  return !!u.vip || (await userCourseIds(env, u.id)).includes(course.id);
}

/** Đơn chờ quá 3 ngày -> expired. Gọi khi đọc danh sách đơn và trong cron. */
export async function expirePending(env) {
  const cutoff = new Date(Date.now() - PENDING_DAYS * 86400 * 1000).toISOString();
  await env.DB.prepare("UPDATE orders SET status = 'expired' WHERE status = 'pending' AND created_at < ?").bind(cutoff).run();
}

export function payPath(o) {
  return o.kind === "member" ? `/thanh-toan/goi-${o.ref}-thang/` : `/thanh-toan/${o.ref}/`;
}

function newCode(kind, ref) {
  const rnd = [...crypto.getRandomValues(new Uint8Array(5))].map((b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
  return "DTCV " + (kind === "member" ? "HV" + ref : "KH") + " " + rnd;
}

/** Tạo đơn (hoặc trả lại đơn đang chờ cùng gói / khóa của người này). */
export async function createOrder(env, u, body) {
  if (!u.email_verified_at) throw new HttpError(403, "Vui lòng xác minh email trước khi tạo đơn (kiểm tra hộp thư của bạn)");
  const cat = await loadCatalog(env);
  let kind, ref, title, amount;
  if (body.kind === "member") {
    const months = Number(body.months);
    if (!cat.membership.months.includes(months)) throw new HttpError(400, "Gói hội viên không hợp lệ");
    if (u.vip) throw new HttpError(400, "Tài khoản VIP đã xem được toàn bộ nội dung, không cần mua gói");
    kind = "member"; ref = String(months);
    title = "Gói hội viên " + months + " tháng";
    amount = cat.membership.pricePerMonth * months;
  } else if (body.kind === "course") {
    const c = cat.courses.find((x) => x.id === body.course_id);
    if (!c || !c.price) throw new HttpError(400, "Khóa học không hợp lệ hoặc miễn phí");
    if (u.vip || (await userCourseIds(env, u.id)).includes(c.id)) throw new HttpError(400, "Bạn đã sở hữu khóa học này");
    kind = "course"; ref = c.id;
    title = "Khóa học: " + c.title;
    amount = c.price;
  } else {
    throw new HttpError(400, "Loại đơn không hợp lệ");
  }
  await expirePending(env);
  const existing = await env.DB.prepare(
    "SELECT * FROM orders WHERE user_id = ? AND kind = ? AND ref = ? AND status = 'pending' ORDER BY id DESC LIMIT 1"
  ).bind(u.id, kind, ref).first();
  if (existing && existing.amount === amount) return existing;

  for (let i = 0; i < 5; i++) {
    const code = newCode(kind, ref);
    try {
      const row = await env.DB.prepare(
        "INSERT INTO orders (code, user_id, kind, ref, title, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?) RETURNING *"
      ).bind(code, u.id, kind, ref, title, amount, new Date().toISOString()).first();
      const [subject, content] = mails.orderCreated(env, u, row, payPath(row), cat.payment);
      await sendMail(env, u.email, subject, content);
      return row;
    } catch (err) {
      if (!/UNIQUE/i.test(String(err))) throw err; // trùng mã (hiếm) -> sinh mã khác
    }
  }
  throw new HttpError(500, "Không tạo được mã đơn, thử lại");
}

export function publicOrder(o) {
  return {
    code: o.code, kind: o.kind, ref: o.ref, title: o.title, amount: o.amount, status: o.status,
    created_at: o.created_at, paid_reported_at: o.paid_reported_at, confirmed_at: o.confirmed_at, cancel_reason: o.cancel_reason,
  };
}

/** Kích hoạt quyền theo đơn: hội viên cộng tháng (từ hạn hiện tại nếu còn, không thì từ hôm nay);
 * khóa học -> course_access. Trả về user sau khi cập nhật. */
export async function grant(env, userId, kind, ref, orderId) {
  const u = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
  if (!u) throw new HttpError(404, "Không tìm thấy người dùng");
  if (kind === "member") {
    const months = Number(ref);
    if (!(months > 0 && months <= 60)) throw new HttpError(400, "Số tháng không hợp lệ");
    // Hạn tính TỪ LÚC XÁC NHẬN (GAS.md VI.3); còn hạn thì cộng dồn tiếp từ ngày sau hạn hiện tại.
    // start + N tháng - 1 ngày (vd bắt đầu 20/10, 1 tháng -> còn hạn tới hết 19/11)
    const start = memberActive(u) ? addDays(u.member_until, 1) : todayVN();
    const until = addDays(addMonths(start, months), -1);
    await env.DB.prepare("UPDATE users SET member_until = ? WHERE id = ?").bind(until, userId).run();
    u.member_until = until;
  } else if (kind === "course") {
    await env.DB.prepare(
      "INSERT INTO course_access (user_id, course_id, granted_at, order_id) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING"
    ).bind(userId, ref, new Date().toISOString(), orderId || null).run();
  } else {
    throw new HttpError(400, "Loại kích hoạt không hợp lệ");
  }
  return u;
}

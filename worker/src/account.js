/* API công khai cho người dùng website (GAS.md VI): /api/auth/*, /api/me, /api/orders,
   /api/content/<slug>. Mọi POST bắt buộc Content-Type JSON + Origin đúng site (chống CSRF,
   cùng cookie SameSite=Lax). */
import { json, HttpError } from "./http.js";
import {
  hashPassword, verifyPassword, checkPassword, normEmail, createSession, currentUser, destroySession,
  destroyOtherSessions, issueEmailToken, consumeEmailToken, rateLimit, isLimited, clearLimit, verifyTurnstile,
  sessionCookie,
} from "./auth.js";
import { sendMail, mails } from "./mail.js";
import { createOrder, publicOrder, publicUser, userCourseIds, canRead, loadCatalog, expirePending } from "./orders.js";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const LOGIN_FAIL_LIMIT = 5;
const LOGIN_LOCK_SEC = 15 * 60;

async function body(request) {
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object") throw new HttpError(400, "Dữ liệu gửi lên không hợp lệ");
  return b;
}

async function me(env, u) {
  return u ? publicUser(u, await userCourseIds(env, u.id)) : null;
}

async function sendVerify(env, u) {
  await rateLimit(env, "mail-verify:" + u.id, 5, 3600, "Đã gửi email xác minh quá nhiều lần");
  const token = await issueEmailToken(env, u.id, "verify", 24 * 60);
  const [subject, content] = mails.verify(env, u, token);
  await sendMail(env, u.email, subject, content);
}

export async function handleAccount(request, env, parts) {
  const method = request.method;
  const ip = request.headers.get("cf-connecting-ip") || "?";

  if (method === "POST") {
    const ct = request.headers.get("content-type") || "";
    const origin = request.headers.get("origin");
    if (!ct.includes("application/json")) throw new HttpError(415, "Cần gửi JSON");
    if (origin && origin !== (env.SITE_URL || "https://dautucungvu.com") && !/^http:\/\/localhost(:\d+)?$/.test(origin)) {
      throw new HttpError(403, "Nguồn yêu cầu không hợp lệ");
    }
  }

  // GET /api/me -> { user | null }
  if (parts[0] === "me" && method === "GET") {
    return json({ user: await me(env, await currentUser(request, env)) });
  }

  if (parts[0] === "auth" && method === "POST") {
    const action = parts[1];

    if (action === "register") {
      const b = await body(request);
      await verifyTurnstile(env, b.turnstile, request);
      await rateLimit(env, "register-ip:" + ip, 10, 3600, "Đăng ký quá nhiều lần từ mạng này");
      const email = normEmail(b.email);
      const name = String(b.name || "").trim();
      const phone = String(b.phone || "").replace(/[^\d+]/g, "");
      if (name.length < 2 || name.length > 80) throw new HttpError(400, "Vui lòng nhập họ tên");
      if (!/^\+?\d{9,15}$/.test(phone)) throw new HttpError(400, "Số điện thoại / Zalo không hợp lệ");
      checkPassword(b.password);
      const exists = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
      if (exists) throw new HttpError(409, "Email này đã có tài khoản — hãy đăng nhập hoặc dùng Quên mật khẩu");
      const u = await env.DB.prepare(
        "INSERT INTO users (email, name, phone, pass_hash, created_at) VALUES (?, ?, ?, ?, ?) RETURNING *"
      ).bind(email, name, phone, await hashPassword(b.password), new Date().toISOString()).first();
      await sendVerify(env, u);
      return json({ user: await me(env, u) }, 200, { "set-cookie": await createSession(env, u.id) });
    }

    if (action === "login") {
      const b = await body(request);
      await verifyTurnstile(env, b.turnstile, request);
      const email = normEmail(b.email);
      const failKey = "login-fail:" + email;
      const ipKey = "login-fail-ip:" + ip;
      if ((await isLimited(env, failKey, LOGIN_FAIL_LIMIT)) || (await isLimited(env, ipKey, LOGIN_FAIL_LIMIT * 4))) {
        throw new HttpError(429, "Nhập sai quá nhiều lần. Thử lại sau 15 phút hoặc dùng Quên mật khẩu.");
      }
      const u = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
      const ok = u && (await verifyPassword(String(b.password || ""), u.pass_hash));
      if (!ok) {
        await rateLimit(env, failKey, LOGIN_FAIL_LIMIT + 1, LOGIN_LOCK_SEC).catch(() => {});
        await rateLimit(env, ipKey, LOGIN_FAIL_LIMIT * 4 + 1, LOGIN_LOCK_SEC).catch(() => {});
        throw new HttpError(401, "Email hoặc mật khẩu không đúng");
      }
      if (u.locked) throw new HttpError(403, "Tài khoản đang bị khoá — liên hệ Vũ để được hỗ trợ");
      await clearLimit(env, failKey);
      return json({ user: await me(env, u) }, 200, { "set-cookie": await createSession(env, u.id) });
    }

    if (action === "logout") {
      await destroySession(request, env);
      return json({ ok: true }, 200, { "set-cookie": sessionCookie("", 0) });
    }

    if (action === "resend-verify") {
      const u = await currentUser(request, env);
      if (!u) throw new HttpError(401, "Vui lòng đăng nhập");
      if (u.email_verified_at) return json({ ok: true, already: true });
      await rateLimit(env, "mail-verify-min:" + u.id, 1, 60, "Vừa gửi xong, đợi 1 phút");
      await sendVerify(env, u);
      return json({ ok: true });
    }

    if (action === "verify") {
      const b = await body(request);
      const userId = await consumeEmailToken(env, String(b.token || ""), "verify");
      await env.DB.prepare("UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?")
        .bind(new Date().toISOString(), userId).run();
      const u = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
      return json({ ok: true, email: u.email });
    }

    if (action === "forgot") {
      const b = await body(request);
      await verifyTurnstile(env, b.turnstile, request);
      const email = normEmail(b.email);
      await rateLimit(env, "forgot-ip:" + ip, 10, 3600, "Yêu cầu quá nhiều lần");
      const u = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND locked = 0").bind(email).first();
      if (u) {
        // Giới hạn theo email nhưng KHÔNG báo lỗi ra ngoài (không lộ email nào đã đăng ký)
        const limited = (await isLimited(env, "mail-reset:" + u.id, 5)) || (await isLimited(env, "mail-reset-min:" + u.id, 1));
        if (!limited) {
          await rateLimit(env, "mail-reset:" + u.id, 5, 3600);
          await rateLimit(env, "mail-reset-min:" + u.id, 1, 60);
          const token = await issueEmailToken(env, u.id, "reset", 30);
          const [subject, content] = mails.reset(env, u, token);
          await sendMail(env, u.email, subject, content);
        }
      }
      return json({ ok: true, message: "Nếu email này đã đăng ký, chúng tôi đã gửi liên kết đặt lại mật khẩu." });
    }

    if (action === "reset") {
      const b = await body(request);
      checkPassword(b.password);
      const userId = await consumeEmailToken(env, String(b.token || ""), "reset");
      await env.DB.prepare("UPDATE users SET pass_hash = ?, email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?")
        .bind(await hashPassword(b.password), new Date().toISOString(), userId).run();
      await destroyOtherSessions(env, userId, null);
      const u = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
      const [subject, content] = mails.passwordChanged(env, u);
      await sendMail(env, u.email, subject, content);
      await clearLimit(env, "login-fail:" + u.email);
      return json({ user: await me(env, u) }, 200, { "set-cookie": await createSession(env, u.id) });
    }

    if (action === "change-password") {
      const u = await currentUser(request, env);
      if (!u) throw new HttpError(401, "Vui lòng đăng nhập");
      const b = await body(request);
      await rateLimit(env, "change-pass:" + u.id, 5, 900, "Thử quá nhiều lần");
      if (!(await verifyPassword(String(b.current || ""), u.pass_hash))) throw new HttpError(400, "Mật khẩu hiện tại không đúng");
      checkPassword(b.password);
      await env.DB.prepare("UPDATE users SET pass_hash = ? WHERE id = ?").bind(await hashPassword(b.password), u.id).run();
      await destroyOtherSessions(env, u.id, request);
      const [subject, content] = mails.passwordChanged(env, u);
      await sendMail(env, u.email, subject, content);
      return json({ ok: true });
    }
  }

  // ----- Đơn hàng của chính mình -----
  if (parts[0] === "orders") {
    const u = await currentUser(request, env);
    if (!u) throw new HttpError(401, "Vui lòng đăng nhập");
    if (parts.length === 1 && method === "GET") {
      await expirePending(env);
      const { results } = await env.DB.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 50").bind(u.id).all();
      return json({ orders: results.map(publicOrder) });
    }
    if (parts.length === 1 && method === "POST") {
      const b = await body(request);
      await rateLimit(env, "order-create:" + u.id, 20, 3600, "Tạo đơn quá nhiều lần");
      return json({ order: publicOrder(await createOrder(env, u, b)) });
    }
    // POST /api/orders/paid { code } -> người mua báo đã chuyển khoản, báo email cho Vũ (1 lần)
    if (parts[1] === "paid" && method === "POST") {
      const b = await body(request);
      const o = await env.DB.prepare("SELECT * FROM orders WHERE code = ? AND user_id = ?").bind(String(b.code || ""), u.id).first();
      if (!o) throw new HttpError(404, "Không tìm thấy đơn");
      if (o.status !== "pending") return json({ order: publicOrder(o) });
      if (!o.paid_reported_at) {
        await env.DB.prepare("UPDATE orders SET paid_reported_at = ? WHERE id = ?").bind(new Date().toISOString(), o.id).run();
        o.paid_reported_at = new Date().toISOString();
        const [subject, content] = mails.newOrderToAdmin(env, u, o);
        await sendMail(env, env.ORDER_NOTIFY_EMAIL, subject, content);
      }
      return json({ order: publicOrder(o) });
    }
  }

  // GET /api/content/<slug> — thân bài trả phí, CHỈ trả khi đủ quyền (GAS.md II.A.3)
  if (parts[0] === "content" && parts.length === 2 && method === "GET" && SLUG.test(parts[1])) {
    const cat = await loadCatalog(env);
    const level = cat.articles[parts[1]];
    if (!level) throw new HttpError(404, "Không tìm thấy bài viết");
    const u = await currentUser(request, env);
    if (!canRead(level, u)) throw new HttpError(u ? 403 : 401, "Bài viết dành cho " + (level === "vip" ? "tài khoản VIP" : level === "member" ? "hội viên" : "thành viên"));
    const row = await env.DB.prepare("SELECT content_html FROM article_bodies WHERE slug = ?").bind(parts[1]).first();
    return json({ content_html: row ? row.content_html : "" }, 200, { "cache-control": "private, no-store" });
  }

  return null; // không khớp route nào ở đây
}

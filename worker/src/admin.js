/* API admin cho CMS (GAS gọi qua UrlFetchApp, Bearer ADMIN_KEY — kiểm ở index.js):
   đơn hàng (xác nhận / huỷ / kích hoạt tay) và người dùng website (VIP, gia hạn, gửi link đặt
   lại mật khẩu, khoá). GAS.md VI.3, VI.6. Header X-Admin-Email = người thao tác (ghi vào đơn). */
import { json, HttpError } from "./http.js";
import { normEmail, issueEmailToken, destroyOtherSessions } from "./auth.js";
import { sendMail, mails } from "./mail.js";
import { expirePending, grant, userCourseIds, memberActive, todayVN } from "./orders.js";
import { backupD1 } from "./cron.js";

async function body(request) {
  return (await request.json().catch(() => null)) || {};
}

const ORDER_COLS = "o.id, o.code, o.kind, o.ref, o.title, o.amount, o.status, o.created_at, o.paid_reported_at, " +
  "o.confirmed_at, o.confirmed_by, o.cancelled_at, o.cancel_reason, u.id AS user_id, u.email, u.name, u.phone";

export async function handleAdmin(request, env, parts) {
  const method = request.method;
  const adminEmail = request.headers.get("x-admin-email") || "admin";

  // GET /api/admin/orders -> 500 đơn gần nhất (kèm người mua)
  if (parts[1] === "orders" && parts.length === 2 && method === "GET") {
    await expirePending(env);
    const { results } = await env.DB.prepare(`SELECT ${ORDER_COLS} FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.id DESC LIMIT 500`).all();
    return json({ orders: results });
  }

  // POST /api/admin/orders/<id>/confirm | cancel
  if (parts[1] === "orders" && parts.length === 4 && method === "POST") {
    const id = Number(parts[2]);
    const o = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first();
    if (!o) throw new HttpError(404, "Không tìm thấy đơn");
    if (parts[3] === "confirm") {
      if (o.status === "confirmed") throw new HttpError(400, "Đơn đã được xác nhận trước đó");
      if (o.status === "cancelled") throw new HttpError(400, "Đơn đã huỷ — tạo kích hoạt tay nếu cần");
      // Đơn "expired" (quá 3 ngày) vẫn cho xác nhận: người mua có thể chuyển khoản muộn
      const u = await grant(env, o.user_id, o.kind, o.ref, o.id);
      const now = new Date().toISOString();
      await env.DB.prepare("UPDATE orders SET status = 'confirmed', confirmed_at = ?, confirmed_by = ? WHERE id = ?").bind(now, adminEmail, id).run();
      const [subject, content] = mails.activated(env, u, o, o.kind === "member" ? u.member_until : null);
      await sendMail(env, u.email, subject, content);
      return json({ ok: true, member_until: u.member_until || null });
    }
    if (parts[3] === "cancel") {
      if (o.status === "confirmed") throw new HttpError(400, "Đơn đã xác nhận, không huỷ được (gỡ quyền trong tab Người dùng)");
      const b = await body(request);
      await env.DB.prepare("UPDATE orders SET status = 'cancelled', cancelled_at = ?, cancel_reason = ?, confirmed_by = ? WHERE id = ?")
        .bind(new Date().toISOString(), String(b.reason || "").slice(0, 200), adminEmail, id).run();
      return json({ ok: true });
    }
  }

  // POST /api/admin/grant { email, kind: member|course, months | course_id } — kích hoạt tay (không cần đơn)
  if (parts[1] === "grant" && method === "POST") {
    const b = await body(request);
    const u = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(normEmail(b.email)).first();
    if (!u) throw new HttpError(404, "Email này chưa có tài khoản trên website — người dùng cần đăng ký trước");
    const ref = b.kind === "member" ? String(Number(b.months)) : String(b.course_id || "");
    const title = b.kind === "member" ? "Kích hoạt tay: hội viên " + ref + " tháng" : "Kích hoạt tay: khóa " + ref;
    const order = await env.DB.prepare(
      "INSERT INTO orders (code, user_id, kind, ref, title, amount, status, created_at, confirmed_at, confirmed_by) VALUES (?, ?, ?, ?, ?, 0, 'confirmed', ?, ?, ?) RETURNING *"
    ).bind("TAY " + Date.now().toString(36).toUpperCase(), u.id, b.kind, ref, title, new Date().toISOString(), new Date().toISOString(), adminEmail).first();
    const updated = await grant(env, u.id, b.kind, ref, order.id);
    const [subject, content] = mails.activated(env, updated, order, b.kind === "member" ? updated.member_until : null);
    await sendMail(env, u.email, subject, content);
    return json({ ok: true, member_until: updated.member_until || null });
  }

  // GET /api/admin/users -> mọi người dùng (kèm khóa đã có, số đơn)
  if (parts[1] === "users" && parts.length === 2 && method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT u.id, u.email, u.name, u.phone, u.email_verified_at, u.vip, u.member_until, u.locked, u.created_at, " +
        "(SELECT group_concat(course_id) FROM course_access c WHERE c.user_id = u.id) AS courses, " +
        "(SELECT count(*) FROM orders o WHERE o.user_id = u.id AND o.status = 'confirmed') AS paid_orders " +
        "FROM users u ORDER BY u.id DESC LIMIT 2000"
    ).all();
    return json({ users: results.map((u) => ({ ...u, courses: u.courses ? u.courses.split(",") : [], member_active: memberActive(u) })) });
  }

  // POST /api/admin/users/<id>/<vip|extend|send-reset|lock|revoke-course>
  if (parts[1] === "users" && parts.length === 4 && method === "POST") {
    const id = Number(parts[2]);
    const u = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
    if (!u) throw new HttpError(404, "Không tìm thấy người dùng");
    const b = await body(request);
    if (parts[3] === "vip") {
      const on = b.on ? 1 : 0;
      await env.DB.prepare("UPDATE users SET vip = ? WHERE id = ?").bind(on, id).run();
      if (on && !u.vip) {
        const [subject, content] = mails.vipGranted(env, u);
        await sendMail(env, u.email, subject, content);
      }
      return json({ ok: true });
    }
    if (parts[3] === "extend") {
      const months = Number(b.months);
      if (!(months >= 1 && months <= 60)) throw new HttpError(400, "Số tháng không hợp lệ");
      const updated = await grant(env, id, "member", String(months), null);
      return json({ ok: true, member_until: updated.member_until });
    }
    if (parts[3] === "set-until") {
      // Sửa tay hạn hội viên (vd gỡ hội viên: để trống)
      const until = String(b.until || "");
      if (until && !/^\d{4}-\d{2}-\d{2}$/.test(until)) throw new HttpError(400, "Ngày không hợp lệ");
      await env.DB.prepare("UPDATE users SET member_until = ? WHERE id = ?").bind(until || null, id).run();
      return json({ ok: true });
    }
    if (parts[3] === "send-reset") {
      const token = await issueEmailToken(env, id, "reset", 30);
      const [subject, content] = mails.reset(env, u, token);
      const sent = await sendMail(env, u.email, subject, content);
      if (!sent) throw new HttpError(502, "Chưa gửi được email (kiểm tra cấu hình gửi email)");
      return json({ ok: true });
    }
    if (parts[3] === "lock") {
      const on = b.on ? 1 : 0;
      await env.DB.prepare("UPDATE users SET locked = ? WHERE id = ?").bind(on, id).run();
      if (on) await destroyOtherSessions(env, id, null); // đăng xuất mọi thiết bị
      return json({ ok: true });
    }
    if (parts[3] === "revoke-course") {
      await env.DB.prepare("DELETE FROM course_access WHERE user_id = ? AND course_id = ?").bind(id, String(b.course_id || "")).run();
      return json({ ok: true, courses: await userCourseIds(env, id) });
    }
  }

  // POST /api/admin/backup -> sao lưu ngay (ngoài lịch thứ Hai hằng tuần); GET -> danh sách bản sao lưu
  if (parts[1] === "backup" && parts.length === 2) {
    if (method === "POST") {
      await backupD1(env, todayVN());
      return json({ ok: true });
    }
    if (method === "GET") {
      const { objects } = await env.VIDEOS.list({ prefix: "backups/d1/" });
      return json({ backups: objects.map((o) => ({ key: o.key, size: o.size, uploaded: o.uploaded })) });
    }
  }

  // GET /api/admin/courses/<id>/sales -> số người đang có quyền khóa (chặn xoá khóa đã bán)
  if (parts[1] === "courses" && parts.length === 4 && parts[3] === "sales" && method === "GET") {
    const row = await env.DB.prepare("SELECT count(*) AS n FROM course_access WHERE course_id = ?").bind(parts[2]).first();
    return json({ owners: row ? row.n : 0 });
  }

  return null;
}

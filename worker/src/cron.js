/* Cron hằng ngày 08:00 giờ VN (01:00 UTC — wrangler.jsonc triggers): đơn chờ quá hạn ->
   expired; email nhắc gia hạn trước 7 và 1 ngày; email báo đã hết hạn (GAS.md VI.5).
   Cột users.reminded = '<member_until>:<7|1|0>' để mỗi mốc chỉ gửi 1 lần cho mỗi hạn.
   Thứ Hai: sao lưu dữ liệu D1 vào kho riêng (GAS.md "Sao lưu"). */
import { sendMail, mails } from "./mail.js";
import { expirePending, todayVN, addDays } from "./orders.js";

export async function runDaily(env) {
  await expirePending(env);
  const today = todayVN();
  const stages = [
    { until: addDays(today, 7), stage: "7", mail: (u) => mails.remind(env, u, 7) },
    { until: addDays(today, 1), stage: "1", mail: (u) => mails.remind(env, u, 1) },
    { until: addDays(today, -1), stage: "0", mail: (u) => mails.expired(env, u) },
  ];
  let sent = 0;
  for (const s of stages) {
    const { results } = await env.DB.prepare(
      "SELECT * FROM users WHERE vip = 0 AND locked = 0 AND member_until = ? AND (reminded IS NULL OR reminded != ?)"
    ).bind(s.until, s.until + ":" + s.stage).all();
    for (const u of results) {
      const [subject, content] = s.mail(u);
      if (await sendMail(env, u.email, subject, content)) sent++;
      await env.DB.prepare("UPDATE users SET reminded = ? WHERE id = ?").bind(s.until + ":" + s.stage, u.id).run();
    }
  }
  console.log("cron daily: đã gửi", sent, "email nhắc / hết hạn");
  if (new Date(Date.now() + 7 * 3600 * 1000).getUTCDay() === 1) await backupD1(env, today);
}

// Bảng cần giữ (bỏ sessions / email_tokens / rate_limits / market_snapshots: tạm thời, tự sinh lại)
const BACKUP_TABLES = ["users", "orders", "course_access", "article_bodies"];
const BACKUP_PREFIX = "backups/d1/";
const BACKUP_KEEP = 12; // ~3 tháng bản tuần; xa hơn nữa dùng bản tải về máy

/** Ghi toàn bộ các bảng chính thành 1 file JSON vào bucket private (cùng bucket video, thư mục
 * riêng — không ai ngoài admin đọc được). Khôi phục: GAS.md "Sao lưu". */
export async function backupD1(env, day) {
  const out = { created_at: new Date().toISOString(), tables: {} };
  for (const t of BACKUP_TABLES) out.tables[t] = (await env.DB.prepare(`SELECT * FROM ${t}`).all()).results;
  await env.VIDEOS.put(BACKUP_PREFIX + day + ".json", JSON.stringify(out), { httpMetadata: { contentType: "application/json" } });
  const { objects } = await env.VIDEOS.list({ prefix: BACKUP_PREFIX });
  const old = objects.map((o) => o.key).sort().slice(0, -BACKUP_KEEP);
  if (old.length) await env.VIDEOS.delete(old);
  console.log("cron: sao lưu D1", day, Object.entries(out.tables).map(([k, v]) => k + "=" + v.length).join(" "));
}

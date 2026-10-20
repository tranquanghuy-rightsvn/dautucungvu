/* Cron hằng ngày 08:00 giờ VN (01:00 UTC — wrangler.jsonc triggers): đơn chờ quá hạn ->
   expired; email nhắc gia hạn trước 7 và 1 ngày; email báo đã hết hạn (GAS.md VI.5).
   Cột users.reminded = '<member_until>:<7|1|0>' để mỗi mốc chỉ gửi 1 lần cho mỗi hạn. */
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
}

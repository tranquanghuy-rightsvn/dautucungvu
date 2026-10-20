/* Tài khoản người dùng website (GAS.md VI.1): mật khẩu PBKDF2-SHA256 + salt riêng, session
   cookie HttpOnly lưu D1 (chỉ lưu SHA-256 của token), Turnstile, giới hạn tần suất. */
import { HttpError } from "./http.js";

const enc = new TextEncoder();
const PBKDF2_ITER = 100000; // trần của WebCrypto trên Workers
const SESSION_DAYS = 30;
export const COOKIE = "dtcv_session";

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const b64url = (buf) => b64(buf).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export function randomToken(bytes = 32) {
  return b64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256(s) {
  const d = await crypto.subtle.digest("SHA-256", enc.encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function pbkdf2(password, salt, iter) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, key, 256);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${PBKDF2_ITER}$${b64(salt)}$${b64(await pbkdf2(password, salt, PBKDF2_ITER))}`;
}

export async function verifyPassword(password, stored) {
  const [alg, iter, salt, hash] = String(stored || "").split("$");
  if (alg !== "pbkdf2") return false;
  const got = new Uint8Array(await pbkdf2(password, unb64(salt), Number(iter)));
  const want = unb64(hash);
  if (got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got[i] ^ want[i];
  return diff === 0;
}

export function checkPassword(pw) {
  if (typeof pw !== "string" || pw.length < 8) throw new HttpError(400, "Mật khẩu cần ít nhất 8 ký tự");
  if (pw.length > 200) throw new HttpError(400, "Mật khẩu quá dài");
}

export function normEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) || e.length > 200) throw new HttpError(400, "Email không hợp lệ");
  return e;
}

const nowIso = () => new Date().toISOString();

// ----- Session -----

function readCookie(request, name) {
  const m = (request.headers.get("cookie") || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? m[1] : "";
}

export function sessionCookie(token, maxAgeSec) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

export async function createSession(env, userId) {
  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400 * 1000).toISOString();
  await env.DB.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256(token), userId, nowIso(), expires).run();
  return sessionCookie(token, SESSION_DAYS * 86400);
}

/** User đang đăng nhập (dòng users) hoặc null. Tài khoản bị khoá coi như chưa đăng nhập. */
export async function currentUser(request, env) {
  const token = readCookie(request, COOKIE);
  if (!token) return null;
  const row = await env.DB.prepare(
    "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? AND u.locked = 0"
  ).bind(await sha256(token), nowIso()).first();
  return row || null;
}

export async function destroySession(request, env) {
  const token = readCookie(request, COOKIE);
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
}

/** Đăng xuất mọi thiết bị (đổi / đặt lại mật khẩu, khoá tài khoản). Giữ lại phiên hiện tại nếu có. */
export async function destroyOtherSessions(env, userId, keepRequest) {
  const keep = keepRequest ? readCookie(keepRequest, COOKIE) : "";
  if (keep) {
    await env.DB.prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?").bind(userId, await sha256(keep)).run();
  } else {
    await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();
  }
}

// ----- Mã gửi qua email (xác minh / đặt lại mật khẩu) -----

export async function issueEmailToken(env, userId, kind, ttlMinutes) {
  const token = randomToken();
  // Mỗi người chỉ giữ 1 mã còn sống cho mỗi loại — gửi lại thì mã cũ hết hiệu lực
  await env.DB.prepare("DELETE FROM email_tokens WHERE user_id = ? AND kind = ?").bind(userId, kind).run();
  await env.DB.prepare("INSERT INTO email_tokens (token_hash, user_id, kind, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256(token), userId, kind, new Date(Date.now() + ttlMinutes * 60000).toISOString()).run();
  return token;
}

/** Đổi mã lấy user_id (dùng 1 lần). Sai / hết hạn / đã dùng -> HttpError 400. */
export async function consumeEmailToken(env, token, kind) {
  if (!token || token.length > 100) throw new HttpError(400, "Liên kết không hợp lệ");
  const hash = await sha256(token);
  const row = await env.DB.prepare("SELECT * FROM email_tokens WHERE token_hash = ? AND kind = ?").bind(hash, kind).first();
  if (!row || row.used_at || row.expires_at < nowIso()) throw new HttpError(400, "Liên kết đã hết hạn hoặc đã được dùng. Hãy yêu cầu gửi lại.");
  await env.DB.prepare("UPDATE email_tokens SET used_at = ? WHERE token_hash = ?").bind(nowIso(), hash).run();
  return row.user_id;
}

// ----- Giới hạn tần suất (D1) -----

/** Đếm 1 lần cho key; vượt `limit` trong `windowSec` -> throw 429 với lời nhắn `msg`. */
export async function rateLimit(env, key, limit, windowSec, msg) {
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?").bind(key).first();
  if (!row || row.reset_at <= now) {
    await env.DB.prepare(
      "INSERT INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2) ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = ?2"
    ).bind(key, now + windowSec).run();
    return;
  }
  if (row.count >= limit) {
    const mins = Math.max(1, Math.ceil((row.reset_at - now) / 60));
    throw new HttpError(429, (msg || "Thao tác quá nhiều lần") + `. Thử lại sau ${mins} phút.`);
  }
  await env.DB.prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?").bind(key).run();
}

export async function isLimited(env, key, limit) {
  const row = await env.DB.prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?").bind(key).first();
  return !!row && row.reset_at > Math.floor(Date.now() / 1000) && row.count >= limit;
}

export async function clearLimit(env, key) {
  await env.DB.prepare("DELETE FROM rate_limits WHERE key = ?").bind(key).run();
}

// ----- Turnstile -----

/** Chưa đặt secret TURNSTILE_SECRET thì bỏ qua (để chạy được trước khi tạo widget). */
export async function verifyTurnstile(env, token, request) {
  if (!env.TURNSTILE_SECRET) return;
  if (!token) throw new HttpError(400, "Vui lòng xác nhận bạn không phải robot");
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) form.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", body: form, signal: AbortSignal.timeout(8000),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new HttpError(400, "Xác nhận chống robot không hợp lệ, thử lại");
}

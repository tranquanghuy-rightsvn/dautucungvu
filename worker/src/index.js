/* Worker "dautucungvu" — GAS.md mục 0 và VIII.
   Trang tĩnh do Static Assets phục vụ trực tiếp (không chạy code này).
   Code này chỉ chạy cho /api/* (run_worker_first trong wrangler.jsonc). */
import { json, requireAdmin, HttpError } from "./http.js";
import { streamObject } from "./r2.js";
import { presignPut } from "./presign.js";
import { handleMarket } from "./market.js";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const videoKey = (course, lesson) => `courses/${course}/${lesson}.mp4`;

async function route(request, env, ctx) {
  const url = new URL(request.url);
  const parts = url.pathname.replace(/\/+$/, "").split("/").slice(2); // bỏ "", "api"
  const method = request.method;

  if (parts[0] === "health" && method === "GET") {
    return json({ ok: true, time: new Date().toISOString() });
  }

  // GET /api/market — chỉ số + giá cổ phiếu thật (GAS.md II.E)
  if (parts[0] === "market" && parts.length === 1 && method === "GET") {
    return handleMarket(request, env, ctx);
  }

  // ----- Admin (GAS CMS gọi qua UrlFetchApp, header Authorization: Bearer <ADMIN_KEY>) -----
  if (parts[0] === "admin") {
    requireAdmin(request, env);

    // POST /api/admin/videos/upload-url  { course_id, lesson_slug } -> { url, key, expires_in }
    if (parts[1] === "videos" && parts[2] === "upload-url" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      if (!SLUG.test(body.course_id || "") || !SLUG.test(body.lesson_slug || "")) {
        throw new HttpError(400, "course_id / lesson_slug không hợp lệ");
      }
      const key = videoKey(body.course_id, body.lesson_slug);
      const expiresIn = 3600;
      return json({ url: await presignPut(env, key, expiresIn), key, expires_in: expiresIn });
    }

    // GET /api/admin/ping — CMS kiểm tra kết nối + khóa
    if (parts[1] === "ping" && method === "GET") return json({ ok: true });

    // HEAD-like: GET /api/admin/videos/<course>/<lesson> -> { exists, size }
    // DELETE /api/admin/videos/<course>/<lesson>
    if (parts[1] === "videos" && parts.length === 4 && SLUG.test(parts[2]) && SLUG.test(parts[3])) {
      const key = videoKey(parts[2], parts[3]);
      if (method === "GET") {
        const obj = await env.VIDEOS.head(key);
        return json({ exists: !!obj, size: obj ? obj.size : 0 });
      }
      if (method === "DELETE") {
        await env.VIDEOS.delete(key);
        return json({ ok: true });
      }
    }

    // Thân bài trả phí (GAS.md II.A.3): GET / PUT { content_html } / DELETE /api/admin/articles/<slug>
    if (parts[1] === "articles" && parts.length === 3 && SLUG.test(parts[2])) {
      const slug = parts[2];
      if (method === "GET") {
        const row = await env.DB.prepare("SELECT content_html, updated_at FROM article_bodies WHERE slug = ?").bind(slug).first();
        return json(row ? { exists: true, ...row } : { exists: false, content_html: "" });
      }
      if (method === "PUT") {
        const body = await request.json().catch(() => null);
        if (!body || typeof body.content_html !== "string") throw new HttpError(400, "Thiếu content_html");
        await env.DB.prepare(
          "INSERT INTO article_bodies (slug, content_html, updated_at, updated_by) VALUES (?1, ?2, ?3, ?4) " +
            "ON CONFLICT(slug) DO UPDATE SET content_html = ?2, updated_at = ?3, updated_by = ?4"
        ).bind(slug, body.content_html, new Date().toISOString(), request.headers.get("x-admin-email") || null).run();
        return json({ ok: true });
      }
      if (method === "DELETE") {
        await env.DB.prepare("DELETE FROM article_bodies WHERE slug = ?").bind(slug).run();
        return json({ ok: true });
      }
    }
  }

  // ----- Route thử rủi ro GĐ1 (tắt bằng ENABLE_TEST_ROUTES = "0") -----
  if (parts[0] === "test" && env.ENABLE_TEST_ROUTES === "1") {
    // GET /api/test/video/<course>/<lesson> — phát MP4 từ R2 có Range, CHƯA kiểm quyền
    if (parts[1] === "video" && parts.length === 4 && method === "GET") {
      if (!SLUG.test(parts[2]) || !SLUG.test(parts[3])) throw new HttpError(400, "Đường dẫn không hợp lệ");
      return streamObject(env.VIDEOS, videoKey(parts[2], parts[3]), request);
    }

    // GET /api/test/presign-check — Worker tự ký link, PUT thử file nhỏ qua link đó, kiểm file vào
    // bucket, thử preflight CORS như trang GAS, rồi xoá. Chỉ trả kết quả, KHÔNG trả khóa / link.
    if (parts[1] === "presign-check" && method === "GET") {
      const key = videoKey("test", "presign-check");
      const url = await presignPut(env, key, 300);
      const put = await fetch(url, { method: "PUT", body: "ok " + Date.now(), headers: { "content-type": "video/mp4" } });
      const putBody = put.ok ? "" : (await put.text()).slice(0, 300);
      const stored = await env.VIDEOS.head(key);
      const preflight = await fetch(url, {
        method: "OPTIONS",
        headers: {
          origin: "https://n-test-0lu-script.googleusercontent.com",
          "access-control-request-method": "PUT",
          "access-control-request-headers": "content-type",
        },
      });
      await env.VIDEOS.delete(key);
      return json({
        put_status: put.status,
        put_error: putBody,
        stored_in_bucket: !!stored,
        cors_status: preflight.status,
        cors_allow_origin: preflight.headers.get("access-control-allow-origin"),
        cors_allow_methods: preflight.headers.get("access-control-allow-methods"),
      });
    }
  }

  throw new HttpError(404, "Không tìm thấy");
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    try {
      return await route(request, env, ctx);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err);
      return json({ error: "Lỗi máy chủ" }, 500);
    }
  },
};

/* Worker "dautucungvu" — GAS.md mục 0 và VIII.
   Trang tĩnh do Static Assets phục vụ trực tiếp (không chạy code này).
   Code này chỉ chạy cho /api/* (run_worker_first trong wrangler.jsonc). */
import { json, requireAdmin, HttpError } from "./http.js";
import { streamObject } from "./r2.js";
import { presignPut } from "./presign.js";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const videoKey = (course, lesson) => `courses/${course}/${lesson}.mp4`;

async function route(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.replace(/\/+$/, "").split("/").slice(2); // bỏ "", "api"
  const method = request.method;

  if (parts[0] === "health" && method === "GET") {
    return json({ ok: true, time: new Date().toISOString() });
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
  }

  // ----- Route thử rủi ro GĐ1 (tắt bằng ENABLE_TEST_ROUTES = "0") -----
  if (parts[0] === "test" && env.ENABLE_TEST_ROUTES === "1") {
    // GET /api/test/video/<course>/<lesson> — phát MP4 từ R2 có Range, CHƯA kiểm quyền
    if (parts[1] === "video" && parts.length === 4 && method === "GET") {
      if (!SLUG.test(parts[2]) || !SLUG.test(parts[3])) throw new HttpError(400, "Đường dẫn không hợp lệ");
      return streamObject(env.VIDEOS, videoKey(parts[2], parts[3]), request);
    }
  }

  throw new HttpError(404, "Không tìm thấy");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    try {
      return await route(request, env);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err);
      return json({ error: "Lỗi máy chủ" }, 500);
    }
  },
};

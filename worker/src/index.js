/* Worker "dautucungvu" — GAS.md mục 0 và VIII.
   Trang tĩnh do Static Assets phục vụ trực tiếp (không chạy code này).
   Code này chỉ chạy cho /api/* (run_worker_first trong wrangler.jsonc). */
import { json, requireAdmin, HttpError } from "./http.js";
import { streamObject } from "./r2.js";
import { presignPut } from "./presign.js";
import { handleMarket, handleChart } from "./market.js";
import { handleAccount } from "./account.js";
import { handleAdmin } from "./admin.js";
import { runDaily } from "./cron.js";
import { currentUser } from "./auth.js";
import { loadCatalog, canWatch } from "./orders.js";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const videoKey = (course, lesson) => `courses/${course}/${lesson}.mp4`;
// Video giới thiệu trên banner trang chủ (thay ảnh chân dung khi admin tải lên, GAS.md II.D)
const HERO_VIDEO_KEY = "site/hero.mp4";

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
  // GET /api/market/chart/<MÃ>/<5m|1D|1W|1M> — nến 1 mã cho biểu đồ trang Tin tức
  if (parts[0] === "market" && parts[1] === "chart" && parts.length === 4 && method === "GET") {
    return handleChart(request, env, ctx, parts[2].toUpperCase(), parts[3]);
  }

  // ----- Người dùng website: /api/me, /api/auth/*, /api/orders, /api/content/<slug> (GAS.md VI) -----
  if (["me", "auth", "orders", "content"].includes(parts[0])) {
    const res = await handleAccount(request, env, parts);
    if (res) return res;
  }

  // GET /api/video/<khóa>/<bài> — phát MP4 từ R2 (Range để tua), CHỈ khi đủ quyền (GAS.md II.C, VI.4)
  if (parts[0] === "video" && parts.length === 3 && method === "GET") {
    if (!SLUG.test(parts[1]) || !SLUG.test(parts[2])) throw new HttpError(400, "Đường dẫn không hợp lệ");
    const cat = await loadCatalog(env);
    const course = cat.courses.find((c) => c.id === parts[1]);
    const lesson = course && (course.lessons || []).find((l) => l.slug === parts[2]);
    if (!lesson) throw new HttpError(404, "Không tìm thấy bài học");
    const u = await currentUser(request, env);
    if (!(await canWatch(env, course, lesson, u))) {
      throw new HttpError(u ? 403 : 401, u ? "Bạn chưa có quyền xem bài học này" : "Vui lòng đăng nhập để xem");
    }
    return streamObject(env.VIDEOS, videoKey(parts[1], parts[2]), request);
  }

  // GET /api/site-video/hero/<phiên bản> — video giới thiệu trang chủ, CÔNG KHAI (không kiểm quyền).
  // <phiên bản> (settings.heroVideo.v) chỉ để đổi URL khi thay video, trình duyệt không giữ bản cũ.
  if (parts[0] === "site-video" && parts[1] === "hero" && parts.length === 3 && method === "GET") {
    return streamObject(env.VIDEOS, HERO_VIDEO_KEY, request);
  }

  // ----- Admin (GAS CMS gọi qua UrlFetchApp, header Authorization: Bearer <ADMIN_KEY>) -----
  if (parts[0] === "admin") {
    requireAdmin(request, env);
    const adminRes = await handleAdmin(request, env, parts);
    if (adminRes) return adminRes;

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

    // Video giới thiệu trang chủ: POST .../site-video/upload-url -> { url, key, expires_in } ·
    // GET .../site-video -> { exists, size } · DELETE .../site-video
    if (parts[1] === "site-video" && parts[2] === "upload-url" && parts.length === 3 && method === "POST") {
      const expiresIn = 3600;
      return json({ url: await presignPut(env, HERO_VIDEO_KEY, expiresIn), key: HERO_VIDEO_KEY, expires_in: expiresIn });
    }
    if (parts[1] === "site-video" && parts.length === 2) {
      if (method === "GET") {
        const obj = await env.VIDEOS.head(HERO_VIDEO_KEY);
        return json({ exists: !!obj, size: obj ? obj.size : 0 });
      }
      if (method === "DELETE") {
        await env.VIDEOS.delete(HERO_VIDEO_KEY);
        return json({ ok: true });
      }
    }

    // GET /api/admin/ping — CMS kiểm tra kết nối + khóa
    if (parts[1] === "ping" && method === "GET") return json({ ok: true });

    // DELETE /api/admin/videos/<course> — xoá mọi video của khóa (khi xoá khóa học)
    if (parts[1] === "videos" && parts.length === 3 && SLUG.test(parts[2]) && method === "DELETE") {
      let deleted = 0;
      let cursor;
      do {
        const page = await env.VIDEOS.list({ prefix: `courses/${parts[2]}/`, cursor });
        if (page.objects.length) await env.VIDEOS.delete(page.objects.map((o) => o.key));
        deleted += page.objects.length;
        cursor = page.truncated ? page.cursor : undefined;
      } while (cursor);
      return json({ ok: true, deleted });
    }

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

  // ----- Chẩn đoán nguồn dữ liệu thị trường (tắt mặc định; bật tạm bằng ENABLE_TEST_ROUTES = "1") -----
  if (parts[0] === "test" && env.ENABLE_TEST_ROUTES === "1") {
    // GET /api/test/market-sources — gọi thử từng nguồn dữ liệu thị trường TỪ máy chủ Cloudflare
    if (parts[1] === "market-sources" && method === "GET") {
      const now = Math.floor(Date.now() / 1000);
      const urls = {
        vps_stock: "https://bgapidatafeed.vps.com.vn/getliststockdata/MBB,SSI",
        vps_stock_11: "https://bgapidatafeed.vps.com.vn/getliststockdata/MBB,SSI,VCB,VNM,FPT,HPG,TCB,VIC,VHM,STB,REE",
        dnse_index_1d: `https://services.entrade.com.vn/chart-api/v2/ohlcs/index?from=${now - 10 * 86400}&to=${now}&symbol=VNINDEX&resolution=1D`,
        dnse_index: `https://services.entrade.com.vn/chart-api/v2/ohlcs/index?from=${now - 3 * 86400}&to=${now}&symbol=VNINDEX&resolution=5`,
        dnse_stock: `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock?from=${now - 100 * 86400}&to=${now}&symbol=MBB&resolution=1D`,
      };
      const out = { colo: request.cf && request.cf.colo };
      await Promise.all(Object.entries(urls).map(async ([k, u]) => {
        const t0 = Date.now();
        try {
          const r = await fetch(u, { headers: { accept: "application/json", "user-agent": "Mozilla/5.0 (dautucungvu.com)" }, signal: AbortSignal.timeout(8000) });
          const text = await r.text();
          out[k] = { status: r.status, ms: Date.now() - t0, head: text.slice(0, 80) };
        } catch (e) {
          out[k] = { error: String(e), ms: Date.now() - t0 };
        }
      }));
      return json(out);
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

  // Cron hằng ngày (wrangler.jsonc triggers.crons): hết hạn đơn chờ, email nhắc gia hạn
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDaily(env));
  },
};

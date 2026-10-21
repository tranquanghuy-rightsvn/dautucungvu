# GAS.md — Guideline + kế hoạch dự án "Đầu tư cùng Vũ"

> **File DUY NHẤT cần đọc để tiếp tục dự án ở phiên làm việc mới.** Chứa: bối cảnh, mọi quyết
> định đã chốt (kèm lý do), hiện trạng code, kế hoạch + tiến độ, quy ước làm việc.
> Theo playbook skill `free-cms-static-site-pipeline` (dự án mẫu xevip).
>
> Quy tắc với file này:
> - Đọc TOÀN BỘ trước khi viết/sửa code (cả `gas/`, `worker/`, `scripts/`, `html/`).
> - Mục **❓ CẦN CHỐT** = chưa có quyết định của chủ dự án → KHÔNG tự code theo phỏng đoán,
>   hỏi trước; chốt xong thì xoá dấu ❓ và ghi vào mục XIII (nhật ký quyết định).
> - Mâu thuẫn giữa 2 chỗ trong file → dừng lại hỏi, không tự chọn.
> - Code đổi 1 quyết định / tên field / tên biến → cập nhật file này trong CÙNG lượt sửa.
> - Xong 1 việc trong mục XII → tick `[x]` + ghi ngày.
>
> Cập nhật lần cuối: 20/10/2026 (GĐ1: deploy = Actions build + Workers Builds nối Git, không token).

---

## ★ ĐỌC ĐẦU TIÊN — cách tiếp tục ở phiên mới

1. Đọc hết file này (đặc biệt mục 0, XII, XIII, XIV).
2. Load skill `free-cms-static-site-pipeline` (thư mục
   `~/.claude/skills/free-cms-static-site-pipeline/`). Khi viết file GAS nào, đọc ĐÚNG file
   mẫu tương ứng ở `references/samples/xevip-gas/` (`Code.js`, `index.html`, `app.html`,
   `css.html`, `js.html`, `appsscript.json`) và `references/samples/xevip-html-admin/
   admin-index.html`, copy gần nguyên văn, chỉ đổi phần riêng của dự án. KHÔNG tự đổi cấu
   trúc/logic mẫu khi chưa có bằng chứng test thật là mẫu sai.
3. Phần Worker / Email / R2 / D1: load skill `cloudflare`, `wrangler`,
   `cloudflare-email-service`, `workers-best-practices` và tra docs Cloudflare (đừng dựa trí nhớ).
4. Xem mục XII → làm tiếp việc `[ ]` đầu tiên của giai đoạn đang dở. Mục A trong XII là việc
   chủ dự án phải làm — nếu bước tiếp theo bị chặn bởi mục đó thì hỏi chủ dự án.
5. `git status` + `git log --oneline -10` để biết thay đổi gần nhất.

**Chủ dự án**: huytq1 (giao tiếp tiếng Việt, xưng "tôi/bạn"). Website của khách tên **Vũ**
(Ngô Trường Vũ). Công nghệ **GAS CMS** là do chủ dự án tự sáng tạo — KHÔNG đề xuất thay bằng
Astro/Next/WordPress.

---

## 0. Phạm vi & kiến trúc

Website bán khóa học video + tin tức chứng khoán + gói hội viên, domain **https://dautucungvu.com**.

```
            ┌──────────────── ADMIN (root/admin/editor) ────────────────┐
            │ https://dautucungvu.com/admin/ (iframe) → web app GAS CMS  │
            └─────┬──────────────────────────────┬──────────────────────┘
 nội dung công khai│ (GitHub Contents API)         │ dữ liệu riêng tư + lệnh quản trị
                  ▼                               ▼ (UrlFetchApp + WORKER_ADMIN_KEY)
   GitHub PUBLIC: data/*.json             Cloudflare Worker /api/*  ── D1 (người dùng, session,
        │ Actions: scripts/build.py              ▲                       đơn, quyền, thân bài trả
        ▼ wrangler deploy                        │                       phí, khóa video)
   html/ (trang tĩnh /slug/) ── cùng 1 Worker ───┘ JS gọi API          ── R2 private (video MP4)
                                                                       ── Email Service (email)
```

| Mảnh | Vai trò | Ai dùng |
|---|---|---|
| **GAS CMS** (`gas/`, nhúng iframe tại `/admin/`) | Soạn bài viết, khóa học, cài đặt; duyệt đơn; quản lý người dùng site; xin link upload video | root / admin / editor |
| **GitHub repo PUBLIC** + Actions | `data/*.json` (CHỈ nội dung công khai) → `scripts/build.py` → `html/` → deploy | GAS ghi, CI đọc |
| **Cloudflare Worker** (`worker/`) | Phục vụ `html/` (Static Assets) + `/api/*`: tài khoản người dùng site, đơn hàng, quyền xem, nội dung trả phí, phát video, gửi email | Người dùng site, GAS |
| **D1** | Người dùng site, session, đơn hàng, quyền, thân bài trả phí, khóa video | Chỉ Worker |
| **R2** (bucket private) | File video bài học | Worker (phát); trình duyệt admin (upload qua presigned URL) |
| **Cloudflare Email Service** | Email gửi người dùng site + email báo đơn mới cho Vũ | Chỉ Worker |

Ranh giới cứng:
- **Repo là PUBLIC** → `data/` và `html/` KHÔNG BAO GIỜ chứa: thân bài trả phí, khóa/đường dẫn
  video, đơn hàng, thông tin người dùng, khóa bí mật. Những thứ đó chỉ ở D1 / R2 / Secrets.
- **GAS không lưu đơn hàng, không lưu người dùng site** — chỉ gọi API admin của Worker.
  Google Sheet chỉ giữ danh sách quản trị viên CMS.
- **Không webhook thanh toán** (không có tài khoản doanh nghiệp) → admin xác nhận đơn tay.
- **Không Telegram.** Mọi thông báo nội bộ đi qua email.
- **Không chặn tải video** — người có quyền vẫn tải/quay màn hình được, chấp nhận. Chỉ chặn
  người KHÔNG có quyền (Worker kiểm tra session). Không DRM, không watermark, không chặn chuột phải.

### 0.1 Quy tắc URL (bắt buộc cho MỌI trang, kể cả trang mới)
- Luôn `/slug/` = file `slug/index.html`. Link trong site LUÔN có dấu `/` cuối.
- KHÔNG `.html` trong URL, KHÔNG `/slug` (thiếu `/`), KHÔNG `?params`, KHÔNG dùng redirect để
  điều hướng. Mọi trạng thái (khóa, bài học, bộ lọc, chủ đề, mã CP, gói thanh toán) là 1 trang
  tĩnh riêng; JS đọc trạng thái từ `<body data-*>`, không đọc `location.search`. Khi người dùng
  đổi trạng thái trên trang, `history.replaceState` sang URL tĩnh tương ứng (có thật). Từ khóa
  tìm kiếm không đưa lên URL. Neo `#...` trong trang được phép.
- Worker giữ `html_handling` MẶC ĐỊNH (`auto-trailing-slash`) — KHÁC skill mục 7 (skill dùng
  `"none"` cho site URL `.html`; site này dùng thư mục, đặt `"none"` thì `/slug/` không tự phục
  vụ `index.html`). `not_found_handling = "404-page"` (`html/404.html`, mọi link trong file đó
  dùng đường dẫn tuyệt đối `/...` vì nó được trả ở mọi URL lạ).
- BẮT BUỘC `run_worker_first = ["/api/*"]` trong `wrangler.jsonc`: theo docs Cloudflare,
  có `not_found_handling` mà không có dòng này thì `/api/*` có thể nhận trang 404 thay vì chạy Worker.
- Gõ `/slug` (thiếu `/`) thì Cloudflare tự trả 307 sang `/slug/` — hành vi nền tảng, link nội bộ
  luôn có `/` nên không bao giờ gặp.

### 0.2 Quy tắc SEO (bắt buộc cho MỌI trang)
- Mỗi trang: `<title>`, meta description, robots, canonical tuyệt đối
  `https://dautucungvu.com/.../`, hreflang `vi-VN`, Open Graph + Twitter card (ảnh mặc định
  `https://dautucungvu.com/assets/img/vu.jpg` 640×640), JSON-LD `@graph` (Organization + WebSite
  + trang + BreadcrumbList; bài viết thêm `NewsArticle` với `isAccessibleForFree` /`hasPart`
  cho bài trả phí; khóa học thêm `Course` + `Offer` VND + `CourseInstance`; trang danh sách là
  `CollectionPage` + `ItemList`).
- `noindex, follow`: trang bài học (trùng nội dung trang khóa), "Khóa học của tôi", thanh toán,
  dashboard, mã CP chưa có bài, `/admin/`.
- `robots.txt` + `sitemap.xml` (chỉ trang index) do build sinh.
- Nội dung chính (H1, ngày, tóm tắt / thân bài công khai) có sẵn trong HTML để bot đọc không
  cần JS. Bài trả phí chỉ prerender tóm tắt.

---

## I. Đăng nhập CMS (quản trị viên)

1. Luồng: gửi OTP → xác nhận → vào Admin. Không mật khẩu, không dựa session Google.
2. Chỉ email có trong sheet `Users` (hoặc chủ script) mới được gửi OTP.
3. Chủ script (người deploy) LUÔN là `root` ngầm định, không cần dòng trong `Users`, không hiện
   trong UI. `requestOtp` phải tự cho phép `email === ownerEmail_()` (bẫy tự khoá — skill
   `gas-backend-patterns.md` mục 2). Email root của Vũ: chủ dự án bổ sung sau (thêm tay vào
   sheet `Users`, role `root`).
4. Phân quyền 3 cấp **`root > admin > editor`** (`ROLE_RANK = { editor: 1, admin: 2, root: 3 }`,
   biến thể "không viewer" của skill):

   | Việc | editor | admin | root |
   |---|:-:|:-:|:-:|
   | Bài viết: tạo / sửa / xoá, upload ảnh | ✓ | ✓ | ✓ |
   | Khóa học, bài học, upload video | | ✓ | ✓ |
   | Cài đặt site (mục II.D) | | ✓ | ✓ |
   | Đơn hàng: xác nhận / huỷ / kích hoạt tay | | ✓ | ✓ |
   | Người dùng site: xem, bật/tắt VIP, gia hạn tay, đặt lại mật khẩu, khoá | | ✓ | ✓ |
   | Quản trị viên: thêm/sửa/xoá **editor** | | ✓ | ✓ |
   | Quản trị viên: thêm/sửa/xoá **admin** | | | ✓ |

   - Dòng `root` chỉ sửa tay trong Sheet; CMS không hiển thị, không cho đụng.
   - Không ai tự sửa/xoá chính mình (chặn ở server: `if (email === me.email) throw`).
5. OTP 6 số, sống **10 phút**, cooldown **60 giây**, tối đa **5 lần** sai rồi phải xin mã mới.
   Token phiên **30 ngày**, lưu `localStorage`. Dọn token hết hạn trong `verifyOtp`
   (`purgeExpiredTokens_`), `logout` xoá token thật (skill mục 1b).
6. Mọi hàm server gọi `requireRole_(token, need)` — không tin việc ẩn nút.
7. OTP gửi bằng `MailApp` (quota 100 mail/ngày CHỈ dành cho OTP quản trị — mọi email khác đi
   qua Worker / Email Service).

---

## II. Nội dung

### II.A Bài viết (tin tức) — editor trở lên

1. Field có ô nhập:
   - **Tiêu đề** (bắt buộc).
   - **Slug** — tự sinh từ tiêu đề (bỏ dấu, `đ→d`, chữ thường, chỉ `a-z0-9-`); sửa được trước
     khi Lưu lần đầu; **bất biến** sau đó. URL: `/bai-viet/<slug>/`.
   - **Tóm tắt** (bắt buộc, ≤ 300 ký tự) — mô tả SEO, đoạn trong danh sách, đoạn xem trước của
     bài trả phí.
   - **Ngày giờ đăng** (`YYYY-MM-DD HH:mm`, giờ VN) — mặc định lúc tạo; sửa được.
   - **Chủ đề** — chọn nhiều, từ danh sách chủ đề tin (II.D). Server kiểm tra hợp lệ.
   - **Mã cổ phiếu** — chọn nhiều, từ danh sách mã (II.D). Server kiểm tra hợp lệ.
   - **Quyền xem**: `public` | `user` | `member` | `vip` (VI.4).
   - **Ảnh bìa** (bắt buộc).
   - **Nội dung**: TinyMCE tự host `html/vendor/tinymce/` (KHÔNG CDN — không tải được trong
     iframe GAS). Định dạng: H2/H3, đậm/nghiêng, link, danh sách, trích dẫn, bảng. **CÓ chèn
     ảnh trong nội dung** — nút `quickimage` mở thẳng file picker, dùng lại hàm upload ảnh.
2. Server tự suy ra: `seo_title = title + " | Đầu tư cùng Vũ"`, `cover_alt = title`, `updated_at`.
3. Nơi lưu:
   - Quyền `public`: toàn bộ (cả `content_html`) vào `data/news/<slug>.json`.
   - Quyền khác: `data/news/<slug>.json` CHỈ meta + tóm tắt; **thân bài gửi Worker**
     (`PUT /api/admin/articles/<slug>`) lưu D1. Đổi trả phí → `public`: chuyển thân bài về repo,
     xoá ở D1. Ngược lại: xoá thân bài khỏi repo, đẩy sang D1.
4. Danh sách trong Admin: GAS đọc `data/posts.json` qua GitHub Contents API (luôn mới nhất).
5. Ảnh: nén client (canvas) cạnh dài tối đa **1600px**, JPEG **0.85**, upload nền. Ảnh **riêng
   1-1** theo bài: `html/images/news/<slug>/cover.jpg`, `html/images/news/<slug>/NN.jpg`.
   Ảnh trong bài trả phí vẫn ở repo public (chấp nhận: chỉ là ảnh minh hoạ).

### II.B Khóa học & bài học — admin trở lên

1. Field khóa học:
   - **Tên khóa** (bắt buộc), **Slug/id** (tự sinh, bất biến) → `/khoa-hoc/<id>/`.
   - **Mô tả ngắn** (bắt buộc, ≤ 300 ký tự).
   - **Giá** (VNĐ, số nguyên; `0` = miễn phí).
   - **Quyền xem khi miễn phí**: `public` | `user` (chỉ khi giá = 0).
   - **Ảnh bìa** (upload, như ảnh bài viết) → `html/images/courses/<id>/cover.jpg`. Khóa chưa
     có ảnh thì hiển thị hình minh hoạ SVG hiện tại (field `art`) cho tới khi upload.
   - **Thứ tự hiển thị**, **Đang bán / Ẩn**.
2. Bài học (danh sách con trong form khóa, kéo thả sắp thứ tự):
   - **Tên bài** (bắt buộc), **Slug bài** (tự sinh, bất biến) → `/khoa-hoc/<id>/<slug-bài>/`.
     Bài đầu tiên hiển thị tại `/khoa-hoc/<id>/`. (Đã thay URL `bai-<n>` ngày 20/10 — số thứ tự
     đổi khi sắp xếp lại, slug thì không. Trang bài học `noindex`, `<body data-lesson="<số thứ tự>">`.)
   - **Thời lượng** (phút), **Học thử** (khóa có phí), **Video** (II.C).
3. Nơi lưu: `data/courses.json` (repo) chứa field công khai, KHÔNG chứa khóa video. Khóa video ở
   D1 theo `course_id + lesson_slug`.
4. Xoá khóa: chặn nếu đã có người mua (Worker trả số đơn `confirmed`) — chỉ cho Ẩn. Xoá bài học:
   xoá kèm video R2 (hỏi xác nhận).

### II.C Upload & phát video

1. Định dạng: **CHỈ MP4** (H.264 + AAC, nên 720p), ≤ **2GB/file** (chốt 20/10, không nhận .mov).
   Không chuyển mã server. CMS kiểm đuôi `.mp4` + MIME `video/mp4`, đọc thử file trong trình duyệt:
   không có hình (thường HEVC từ iPhone) → hỏi lại trước khi tải; lấy thời lượng điền số phút nếu bài
   chưa có.
2. Upload (chỉ bài học ĐÃ LƯU — slug bất biến là tên file): nút **Tải video / Thay / Xoá** ở cột
   Video của bảng bài học. GAS `getLessonVideoUploadUrl` → Worker `POST /api/admin/videos/upload-url`
   trả **presigned PUT URL R2** (1 giờ) → trình duyệt admin PUT thẳng lên R2 (XHR, hiện %) → GAS
   `setLessonVideo` kiểm R2 đã có file rồi ghi cờ `lesson.video = "mp4"` vào `data/courses.json`
   (commit ngay, không cần bấm Lưu khóa học). KHÔNG có bảng D1 cho video: khóa R2 suy ra từ
   `courses/<course_id>/<lesson_slug>.mp4`. Xoá video: R2 delete + cờ `""`. Xoá bài học (Lưu khóa) →
   xoá video của bài; xoá khóa → `DELETE /api/admin/videos/<course_id>` (mọi file của khóa).
   Video KHÔNG qua GAS/GitHub.
3. Bucket R2 cần CORS cho origin trang GAS (`https://*.googleusercontent.com`, method `PUT`).
   ⚠️ Rủi ro kỹ thuật — thử ở GĐ1 trước khi làm tiếp.
4. Phát: `<video controls playsinline preload="metadata" src="/api/video/<course_id>/<lesson_slug>">`
   (`UI.video("mp4", title, {course, lesson})`); Worker đọc `assets/catalog.json` (courses có `access`
   + `lessons[{slug, preview}]`), kiểm quyền (`canWatch` trong `orders.js`, VI.4) rồi stream từ R2,
   hỗ trợ `Range` (tua). Chưa đăng nhập → 401, không quyền → 403, bài không có → 404. Lỗi phát → hộp
   "Chưa phát được video". Vẽ lại trang (đánh dấu đã học…) giữ nguyên video đang phát.
5. Lý do chọn R2 (không YouTube / Stream / Drive / Vimeo): xem XIII.

### II.D Cài đặt site — admin trở lên

Lưu chung `data/settings.json`:
- Liên hệ: số điện thoại, link Zalo, YouTube, Facebook, Telegram (link mạng xã hội).
- `slogan`, `offerTitle`, `offerText`, `minCapital` ("50 triệu đồng").
- Gói hội viên: `pricePerMonth` (68.000), `months` ([1, 3, 6, 12]).
- Tài khoản nhận tiền: `bankId` (mã VietQR), `bankName`, `accountNo`, `accountName`
  (hiện: `TCB` / Techcombank / `4819939999` / `NGO TRUONG VU`).
- Video hướng dẫn mở tài khoản / chuyển ID (YouTube công khai, không phải video khóa học).
- Công ty CK (`brokers`): id, tên, ghi chú, màu, nền, `openUrl`, `refCode`, `transferUrl`,
  `transferCode`, `openVideo`, `transferVideo`.
- Chủ đề tin (`newsTags`): id (bất biến), label, keys (từ khóa tìm kiếm không dấu).
- Mã cổ phiếu (`tickers`): code, name, sector, color.
- **Ảnh site** (mọi ảnh trên website đều tùy biến được — quyết định 20/10): ảnh chân dung
  hero trang chủ (`hero`, hiện `assets/img/vu.jpg`), ảnh logo / avatar thương hiệu ở header,
  footer (`brand`, hiện `assets/img/vu-128.jpg`), favicon (`favicon`), ảnh chia sẻ mạng xã hội
  mặc định (`og`, dùng cho `og:image` các trang không có ảnh riêng). Lưu
  `html/images/site/<key>.jpg`; build đọc đường dẫn từ `settings.json` (`images.<key>`).
  Favicon tự resize vuông 128px; ảnh `og` khuyến nghị 1200×630. Ảnh bìa bài viết / khóa học
  vẫn quản lý trong form riêng (II.A, II.B).
- **Video giới thiệu trang chủ** (yêu cầu 21/10, tuỳ chọn — thay ảnh chân dung `hero` trên banner):
  CMS Cài đặt → Ảnh website → khung "Video giới thiệu trang chủ": Tải / Thay / Xoá video. Chỉ MP4,
  ≤ 2GB, kiểm tra như video bài học (II.C.1). Kho R2 khoá cố định `site/hero.mp4`; GAS
  `getHeroVideoUploadUrl` → Worker `POST /api/admin/site-video/upload-url` → trình duyệt PUT (%) →
  GAS `setHeroVideo(true, ảnh bìa)` kiểm `GET /api/admin/site-video`, ghi ảnh bìa
  `html/images/site/heroposter.jpg` (CMS cắt khung hình giây ~1 bằng canvas, rộng ≤ 1280) rồi ghi
  `settings.heroVideo = {v: "yyyyMMddHHmmss", poster, size}` — **áp dụng NGAY** (commit
  settings.json luôn, không chờ "Lưu cài đặt"; `saveSettings` giữ nguyên `heroVideo` vì gộp từ bản
  cũ). Xoá: `DELETE /api/admin/site-video` + bỏ `heroVideo` → trang chủ về ảnh.
  Build (`patch_hero_video`): có `heroVideo.v` → `<figure class="hero-portrait hero-portrait--video">`
  gồm dòng "Video giới thiệu về dautucungvu.com", khung 16:9 (`object-fit: contain`, video dọc bị
  viền), `<video src="/api/site-video/hero/<v>" poster preload="none" playsinline>` (không ảnh bìa →
  `preload="metadata"` + `#t=0.1`), nút play vàng tròn có vòng sáng; không có → dựng lại `<img>` từ
  `images.hero`. Phát: `home.js` bấm play → hiện điều khiển + phát; hết video → về nút play.
  Worker `GET /api/site-video/hero/<v>` CÔNG KHAI (không kiểm quyền), có Range; `<v>` chỉ để đổi URL.
- Chỉ số thị trường + giá cổ phiếu: KHÔNG nhập trong CMS — lấy API thật (II.E). CMS chỉ quản
  danh sách mã hiển thị (`tickers`) và chỉ số hiển thị (`indices`: VNINDEX, VN30, HNX, UPCOM…).

### II.E Dữ liệu thị trường (API thật — nguồn chốt 20/10: API công khai KHÔNG chính thức)

- Worker `GET /api/market` (`worker/src/market.js`) trả `{updated_at, live, stale, indices[{code,
  value, change, intraday[]}], tickers[{code, price, ref, change(%), volume, source, history[]}]}`.
  Giá cổ phiếu theo NGHÌN đồng (19.65 = 19.650đ), `change` của mã là %, của chỉ số là điểm.
- Nguồn: **VPS** `bgapidatafeed.vps.com.vn/getliststockdata/<mã,...>` (giá khớp + tham chiếu, timeout
  3s) và **DNSE** `services.entrade.com.vn/chart-api/v2/ohlcs/{index|stock}` (điểm chỉ số = nến
  ngày cuối, thay đổi = so nến kế cuối; nến 5 phút cho biểu đồ trong phiên; nến ngày 100 ngày cho
  biểu đồ 3 tháng). VPS lỗi -> giá cổ phiếu lấy từ DNSE (đã đối chiếu: khớp VPS). ⚠️ Nến ngày DNSE
  CHƯA có phiên đang chạy -> trong phiên giá = nến 5 phút cuối, tham chiếu = đóng cửa nến ngày cuối
  (sửa 21/10: trước đó VPS lỗi là site hiện giá hôm qua suốt phiên). Mã chỉ số hỗ trợ:
  VN-Index, VN30, HNX, UPCoM (bảng `INDEX_MAP`). TCBS bị chặn bot, KHÔNG dùng.
- ⚠️ Gọi từ máy chủ Cloudflare: VPS chập chờn (colo SIN treo, HKG lúc được lúc không; endpoint
  chỉ số `getlistindexdetail` treo hẳn) dù gọi từ máy thường vẫn chạy; DNSE ổn định. Kiểm nguồn:
  `GET /api/test/market-sources` (route chẩn đoán DUY NHẤT còn lại; chỉ chạy khi tạm đặt
  `ENABLE_TEST_ROUTES = "1"`, mặc định `"0"` từ GĐ6).
- KHÔNG dùng Cron: làm mới khi có người xem. Từng phần lưu D1 `market_snapshots` (quotes: 30s trong
  phiên / 5 phút ngoài phiên; intraday: 2 / 30 phút; history: 6 giờ), cả response cache edge
  (30s / 5 phút). Nguồn lỗi -> trả bản D1 gần nhất + `stale: true`. Mọi `fetch` có timeout.
  Mỗi bản D1 lưu kèm danh sách mã (`{sig, data}`): CMS thêm / bớt mã, chỉ số -> lấy lại ngay, không
  chờ hết hạn (sửa 21/10: trước đó mã mới thêm trống biểu đồ 3 tháng tới 6 giờ). Mã mới có giá +
  biểu đồ sau khi build/deploy xong + tối đa 5 phút cache edge.
- Danh sách mã: build sinh `html/assets/market-symbols.json` từ `settings.tickers` / `indices`.
- Site: `ui.js` tải `/api/market`, gộp vào `APP_DATA.indices/tickers`, bắn sự kiện `market:update`
  (news.js, dashboard.js vẽ lại), làm mới mỗi 60s trong giờ giao dịch; nhãn "Cập nhật lúc HH:mm"
  (thêm "(chưa lấy được số mới)" khi stale). Chưa có số -> hiện "—". `data/market-demo.json` đã xoá.
- **Biểu đồ nến khi bấm mã** (trang Tin tức, yêu cầu Vũ 21/10): `GET /api/market/chart/<MÃ>/<5m|1D|1W|1M>`
  (`handleChart` trong `market.js`; mã phải có trong `market-symbols.json`, khác -> 404). Trả
  `{code, tf, live, updated_at, stale, t[], o[], h[], l[], c[], v[]}`; `t` ngày "YYYY-MM-DD", nến 5
  phút là giây đã cộng 7 giờ (thư viện hiển thị UTC -> ra giờ VN). Nguồn DNSE: nến ngày TOÀN BỘ
  lịch sử (`from=0`, cổ phiếu có từ 20/03/2012, giá đã điều chỉnh), nến 5 phút 31 ngày. DNSE
  KHÔNG có nến tháng, nến tuần chỉ từ 2021 -> tuần (khoá = thứ Hai) / tháng tự gộp từ nến ngày.
  DNSE chưa có nến ngày của phiên đang chạy -> gộp nến 5 phút của các ngày mới hơn nến ngày cuối
  (đối chiếu 21/10: khớp đúng O/H/L/C/V). D1 2 bản / mã: `chart:<MÃ>:1D` (2 / 30 phút),
  `chart:<MÃ>:5m` (1 / 30 phút); cache edge 60s / 10 phút.
  Site (`news.js`): khung `[data-chart]` dưới thẻ giá, trên danh sách tin; nút 5 phút / Ngày /
  Tuần / Tháng + "Xem toàn bộ"; nến + khối lượng (ô riêng bên dưới) + MA20 (cam) / MA50 (tím);
  dòng chú thích O/H/L/C/KL/MA theo nến dưới con trỏ; trong phiên tự làm mới 60s, giữ vùng đang
  xem. Thư viện **TradingView Lightweight Charts 5.2.0** tự host `html/vendor/lightweight-charts/`
  (Apache 2.0 — giữ logo TradingView trên biểu đồ theo điều kiện giấy phép), chỉ tải khi bấm mã.
  Thẻ giá bỏ đường giá 3 tháng nhỏ (trùng biểu đồ lớn); Dashboard vẫn dùng `history` 3 tháng.

---

## III. Sửa nội dung
- Slug (bài, khóa, bài học, chủ đề) bất biến sau Lưu đầu — chặn CẢ server LẪN client (skill mục 10).
- Ảnh khi sửa dùng URL tuyệt đối `raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>`
  (skill mục 11).
- Form tái sử dụng Tạo/Sửa: reset mọi trạng thái disabled khi mở form tạo mới.
- Bài trả phí khi Sửa: GAS lấy thân bài từ Worker (`GET /api/admin/articles/<slug>`).

## IV. Xoá nội dung
- Bài viết: xoá `data/news/<slug>.json` + ảnh `html/images/news/<slug>/` + thân bài D1 (nếu có) +
  gỡ khỏi `data/posts.json` (ghi SAU CÙNG). Trang `html/bai-viet/<slug>/` do build tự dọn.
- Khóa / bài học: II.B.4. Luôn pop-up xác nhận (VII). Không thùng rác.

## V. Form công khai — Liên hệ
Không áp dụng (site không có form liên hệ; liên hệ qua Zalo / điện thoại).

## VI. Người dùng site, đơn hàng, quyền xem (Worker + D1)

Không chạy trên GAS. GAS chỉ là giao diện quản trị gọi API admin của Worker.

1. **Tài khoản**: email + mật khẩu (≥ 8 ký tự), họ tên, số điện thoại/Zalo.
   - Mật khẩu: PBKDF2-SHA256 (WebCrypto), salt riêng; không lưu bản gốc.
   - Session: cookie `HttpOnly; Secure; SameSite=Lax`, 30 ngày, lưu D1; xoá khi đăng xuất / đổi
     mật khẩu / đặt lại mật khẩu (đăng xuất mọi thiết bị).
   - **Xác minh email** bắt buộc trước khi tạo đơn (link 24 giờ). Chưa xác minh vẫn đăng nhập,
     xem nội dung `public` / `user`.
   - **Quên mật khẩu**: link 30 phút, dùng 1 lần. Form luôn trả lời chung "Nếu email tồn tại,
     chúng tôi đã gửi link".
   - Chống dò: sai 5 lần → khoá 15 phút theo email + IP. Gửi lại email xác minh/đặt lại:
     1 lần/phút, tối đa 5 lần/giờ. Turnstile ở đăng ký, đăng nhập, quên mật khẩu.
2. **Đơn hàng**: loại `member` (gói N tháng) | `course` (khóa có phí).
   - Trạng thái: `pending` → `confirmed` | `cancelled` | `expired` (pending quá **3 ngày**).
   - Mã nội dung chuyển khoản duy nhất: `DTCV HV<n> <5 ký tự>` | `DTCV KH <5 ký tự>`.
   - QR: VietQR theo đơn, có số tiền + nội dung
     (`https://img.vietqr.io/image/<bankId>-<accountNo>-compact2.png?amount=&addInfo=&accountName=`,
     ảnh 540×640, hiển thị 260×308).
   - Người mua bấm "Tôi đã chuyển khoản" → Worker gửi **email báo đơn mới** tới
     `ORDER_NOTIFY_EMAIL` (mã nội dung, số tiền, gói/khóa, email + SĐT người mua, link tab Đơn
     hàng trong CMS).
3. **Xác nhận đơn (CMS, admin+)**: lọc theo trạng thái / mã nội dung / email; nút **Xác nhận**,
   **Huỷ** (kèm lý do), **Kích hoạt tay** (không cần đơn). Gói tính hạn **từ lúc xác nhận**; còn
   hạn thì cộng dồn từ ngày hết hạn hiện tại.
4. **Quyền xem**:
   - `public`: tất cả. `user`: đã đăng nhập.
   - `member`: hội viên còn hạn HOẶC VIP.
   - `vip`: chỉ tài khoản đã mở / chuyển ID ≥ 50 triệu (admin bật tay).
   - Khóa có phí: đã mua khóa đó HOẶC VIP. Bài `Học thử`: tất cả.
   - Hội viên hết hạn tự về thành viên thường (so ngày khi kiểm tra, không cần job).
5. **Email người dùng** (Email Service, từ `thongbao@dautucungvu.com`, tên "Đầu tư cùng Vũ",
   reply-to = `MAIL_REPLY_TO`; mỗi email có HTML + text, tiếng Việt; chỉ email giao dịch, không
   gửi marketing): xác minh email · đặt lại mật khẩu · thông báo đổi mật khẩu/email · đã nhận đơn
   (kèm link mở lại QR) · đã kích hoạt · nhắc gia hạn trước 7 và 1 ngày (Cron Trigger hằng ngày)
   · đã hết hạn.
6. **Người dùng site trong CMS (admin+)**: tìm email/SĐT; xem gói, hạn, khóa đã mua, đơn; bật/tắt
   VIP; gia hạn tay; gửi link đặt lại / đặt mật khẩu tạm; khoá / mở khoá.

## VII. UX chung trong Admin
- 2 pop-up riêng: XÁC NHẬN (hỏi trước) và THÔNG BÁO kết quả (1 nút Đóng, không tự ẩn). Không
  `alert()`/`confirm()` native, không toast.
- Mọi nút async: disable + spinner, tự phục hồi kể cả khi lỗi.
- Lưu/Xoá xong: danh sách tự cập nhật ngay (skill mục 16).
- Chuyển tab chỉ là hiệu ứng giao diện, không tải lại dữ liệu.
- 1 lượt `boot` lấy đủ dữ liệu; lần sau hiện từ cache rồi làm mới nền; key cache mang hậu tố
  `CLIENT_BUILD` do server băm từ `app.html` + `js.html` (như xevip `clientBuild_()`).
- Giấu hạ tầng: không nhắc Apps Script / Sheet / Drive / GitHub / Cloudflare trong chữ hiển thị,
  thông báo lỗi, comment ở file gửi xuống trình duyệt (skill mục 19). Kiểm trước deploy:
  `grep -niE 'sheet|spreadsheet|drive|apps script|github|cloudflare' gas/*.html` phải rỗng.

## VIII. Kiến trúc lưu trữ (tên cố định)

**Google Sheet "Dau Tu Cung Vu CMS"** (tự tạo lần đầu): `Users`: `email`, `role`
(`root` | `admin` | `editor`).

**Repo** (`git@github-personal:tranquanghuy-rightsvn/dautucungvu.git`, PUBLIC, nhánh `master`)
— cấu trúc ĐÍCH (sau GĐ1):

| Đường dẫn | Nội dung |
|---|---|
| `data/posts.json` | Index mọi bài (meta) — **commit chốt** bài viết |
| `data/news/<slug>.json` | Meta + tóm tắt (+ `content_html` nếu `public`) |
| `data/courses.json` | Toàn bộ khóa + bài học công khai — **commit chốt** khóa học |
| `data/settings.json` | Cài đặt site (II.D) — **commit chốt** cài đặt |
| `data/market-demo.json` | Giá / chỉ số MINH HOẠ (không qua CMS) — xoá ở GĐ3 khi có `/api/market` |
| `html/` | Site tĩnh deploy (chỉ thứ được public) |
| `html/images/news/<slug>/…`, `html/images/courses/<id>/cover.jpg`, `html/images/site/<hero\|brand\|favicon\|og>.jpg` | Ảnh do CMS ghi |
| `html/assets/market-symbols.json` | **SINH** bởi build: danh sách mã + chỉ số cho Worker `/api/market` |
| `html/vendor/tinymce/` | TinyMCE tự host |
| `html/vendor/lightweight-charts/` | TradingView Lightweight Charts 5.2.0 (biểu đồ nến trang Tin tức) + LICENSE |
| `html/admin/index.html` | Trang nhúng iframe CMS (mẫu xevip) |
| `html/assets/js/data.js` | **SINH** bởi build từ `data/` (đúng cấu trúc `window.APP_DATA` cũ) — không sửa tay |
| `html/404.html` | Trang 404 (sửa tay) |
| `templates/article.html` | Khung trang bài viết (người sửa tay; build đọc) |
| `scripts/build.py` | Build `data/` → `html/`: `data.js`, khối SEO trang gốc, mọi trang con, `sitemap.xml`, `robots.txt`. Chỉ cần Python 3 |
| `wrangler.jsonc`, `package.json` | Cấu hình Worker + wrangler — ở GỐC repo (Workers Builds chạy `npx wrangler deploy` tại gốc) |
| `worker/` | `src/` (`index.js` router, `http.js`, `r2.js` phát video có Range, `presign.js` ký link upload R2 bằng WebCrypto — KHÔNG dùng thư viện ngoài), `migrations/` (D1), `r2-cors.json` |
| `docs/design/` | Ảnh thiết kế gốc (không deploy) |
| `.github/workflows/build.yml` | CI build `data/` → `html/` + commit (KHÔNG deploy) |
| `gas/` | **gitignore**, deploy bằng `clasp` |
| `GAS.md` | File này |

- **Deploy = GitHub Actions build + Cloudflare Workers Builds nối Git (quyết định 20/10 — KHÔNG
  dùng `CLOUDFLARE_API_TOKEN`).** Khác các dự án GAS khác trên máy (luatdong, countrytales,
  tretrucvn dùng Actions + `wrangler-action` + token); giống kiểu smart_report / smartcontent.
  1. `.github/workflows/build.yml` chạy khi đổi file index `data/posts.json`, `data/courses.json`,
     `data/settings.json`, `data/market-demo.json` (commit CHỐT của mọi thao tác CMS — skill
     `static-site-build.md` mục 5) hoặc `scripts/**`, `templates/**`. Nó `python3
     scripts/build.py` → commit `html/` ("CI: build html from data", LUÔN commit kể cả rỗng để
     làm tín hiệu deploy) → push (bị từ chối thì lấy bản mới build lại, tối đa 5 lần).
  2. Workers Builds (Worker `dautucungvu` → Settings → Build): root directory `/`, build command
     TRỐNG, deploy command `npx wrangler deploy`, **build watch paths**: include `html/*`,
     `worker/*`, `wrangler.jsonc`, `package.json`, `package-lock.json`; exclude `html/images/*`.
     Nhờ watch paths, commit trung gian của CMS (ảnh `html/images/*`, `data/**`) KHÔNG deploy —
     chỉ commit "CI: build" (đụng `html/`, hoặc rỗng: Cloudflare luôn build push 0 file) mới
     deploy → 1 thao tác Lưu = 1 lần deploy, không lộ trạng thái dở dang. Sửa tay `html/` /
     `worker/` rồi push thì Workers Builds deploy trực tiếp.
  3. Deploy tay (khi cần): `npx wrangler deploy` ở gốc repo.
- Độ trễ Lưu → lên site: ~1–3 phút. Đơn / quyền / video: tức thì (D1).

**D1** (migration ở `worker/migrations/`, đã áp remote 0001–0003): `article_bodies` (thân bài trả
phí), `market_snapshots`, `users` (email chữ thường, name, phone, pass_hash `pbkdf2$100000$salt$hash`,
email_verified_at, vip, member_until 'YYYY-MM-DD' giờ VN — còn hạn tới hết ngày đó, locked,
reminded), `sessions` (SHA-256 token, 30 ngày), `email_tokens` (verify 24h / reset 30 phút, 1 lần),
`orders` (code `DTCV HV<n> XXXXX` | `DTCV KH XXXXX` | `TAY …` kích hoạt tay; status pending /
confirmed / cancelled / expired; paid_reported_at, confirmed_by), `course_access`, `rate_limits`.
Video KHÔNG có bảng D1 (II.C.2).

**R2**: bucket `dautucungvu-videos` (private), khóa `courses/<course_id>/<lesson_slug>.mp4`; video
giới thiệu trang chủ `site/hero.mp4` (Worker phát công khai).

**API công khai Worker** (`worker/src/account.js`; POST bắt buộc `content-type: application/json` +
Origin đúng site — chống CSRF cùng cookie `dtcv_session` HttpOnly; Secure; SameSite=Lax):
`GET /api/me` · `POST /api/auth/register|login|logout|resend-verify|verify|forgot|reset|change-password`
(register/login/forgot qua Turnstile) · `GET|POST /api/orders` (xem / tạo — giá tính lại từ
`assets/catalog.json`, cần đã xác minh email, đơn pending cùng gói thì trả lại đơn cũ) ·
`POST /api/orders/paid {code}` (báo đã chuyển -> email Vũ 1 lần) · `GET /api/content/<slug>` ·
`GET /api/site-video/hero/<v>` · `GET /api/market` · `GET /api/market/chart/<MÃ>/<5m|1D|1W|1M>` · `GET /api/video/<khóa>/<bài>` (II.C.4). Link trong email: `/tai-khoan/xac-minh-email/#<mã>`,
`/tai-khoan/dat-lai-mat-khau/#<mã>` (mã sau `#`: không lên máy chủ / log; trang xoá khỏi URL ngay).

**API admin Worker** (`worker/src/admin.js` + `index.js`; GAS gọi qua `UrlFetchApp`, header
`Authorization: Bearer <WORKER_ADMIN_KEY>` + `X-Admin-Email`): `GET /ping` ·
`GET|PUT|DELETE /articles/<slug>` · `POST /videos/upload-url` · `GET|DELETE /videos/<course>/<lesson>` · `DELETE /videos/<course>` ·
`POST /site-video/upload-url` · `GET|DELETE /site-video` (video giới thiệu trang chủ) ·
`GET /orders` (500 gần nhất) · `POST /orders/<id>/confirm|cancel` · `POST /grant` (kích hoạt tay) ·
`GET /users` · `POST /users/<id>/vip|extend|set-until|send-reset|lock|revoke-course` ·
`GET /courses/<id>/sales` (số người sở hữu — chặn xoá khóa). Tiền tố đều là `/api/admin`.
Cron `0 1 * * *` (08:00 VN, `worker/src/cron.js`): hết hạn đơn chờ, email nhắc 7 / 1 ngày, báo hết hạn.

## IX. Checklist bug đã gặp ở dự án này
- (CMS, 20/10) F5 trang quản trị báo `ReferenceError: Cannot access 'ORDER_SORT' before
  initialization` → `bootApp()` chạy ĐỒNG BỘ ngay khi có boot cache (vẽ luôn bảng đơn hàng từ cache
  đơn), trong khi lời gọi nằm giữa `js.html`, trước các `const`/`let` khai báo bên dưới (TDZ). Chỉ lộ
  khi máy đã cache danh sách đơn. Vá: lời gọi khởi động đặt ở CUỐI `js.html` (CMS @9). Thêm hằng /
  biến toàn cục mới: không bao giờ đặt khởi động lên trên chúng.
  Rà toàn bộ (20/10): bản cũ còn 3 chỗ cùng loại (`ACCESS_LABELS`, `JUST_CHANGED`, `ORDER_STATUS`) —
  hết cùng lần vá. **Trước mỗi lần deploy CMS / site / Worker: `bash scripts/lint/check.sh`** (ESLint:
  gán lại const, biến không tồn tại, trùng khai báo; `scripts/lint/tdz.cjs`: lần theo chuỗi gọi hàm từ
  code chạy lúc nạp, báo const/let dùng trước khi khởi tạo — ESLint không bắt được). Cần eslint +
  acorn + globals ở `../node_modules` (thư mục cha của repo).
- (CMS, 20/10) Bỏ tab "Kiểm tra hệ thống" (danh sách cấu hình OK vô dụng với người dùng — chủ dự án);
  thay bằng tab **Sao lưu dữ liệu** (root). Hàm `systemCheck` đã xoá; Worker `/api/admin/ping` còn
  nhưng không ai gọi. CMS @10.
- (Phần site tĩnh) Chrome headless `--window-size=390` hiển thị bị cắt phải → do headless có bề
  rộng tối thiểu, KHÔNG phải lỗi CSS. Kiểm mobile bằng DevTools/Chrome MCP thật.
- (Worker, 20/10) `Content-Range: bytes NaN-NaN/...` khi phát video → `R2Object.range` LUÔN có
  đủ khóa `offset`/`length`/`suffix` (giá trị `undefined` nếu không dùng), nên `"suffix" in
  obj.range` luôn đúng. Cách né: kiểm `obj.range.suffix !== undefined` (đã sửa trong `r2.js`).
- (Deploy, 20/10) Sau mỗi lần push, `/api/*` bỗng trả 404 rỗng, trang tĩnh vẫn 200 → Workers
  Builds (Worker đã nối Git từ 19/10) tự deploy theo cấu hình MẶC ĐỊNH: lúc đó `wrangler.jsonc`
  nằm trong `worker/`, gốc repo không có config → Cloudflare tự cấu hình "chỉ static assets" (không
  code Worker, không D1/R2, compatibility date lạ) đè lên bản deploy tay. KHÔNG phải bị hack
  (GitHub check runs ghi "Cloudflare Workers and Pages: Workers Builds: dautucungvu" cho từng
  commit). Cách né: `wrangler.jsonc` + `package.json` ở GỐC repo, cấu hình Build như VIII.
  Kiểm nhanh sau deploy: `curl https://dautucungvu.com/api/health` phải 200;
  `gh api repos/tranquanghuy-rightsvn/dautucungvu/commits/<sha>/check-runs` xem build của commit.
- (Site, 20/10) Icon to "tổ bố" ở dải nhắc xác minh email / khung "đã xong": CSS gốc chỉ có
  `svg { max-width:100% }`, `UI.icon()` không gắn kích thước -> svg trong khối MỚI phình bằng cả
  khung. Mọi khối mới có icon PHẢI tự đặt `width/height` cho svg (core.css: `.verify-bar svg`,
  `.auth-done > svg`). Hộp đăng ký cao hơn màn hình điện thoại bị cắt mất nút: `.modal` cần
  `align-items:start; overflow-y:auto` + `.modal-card { margin-block:auto }`.
- (CMS, 20/10) Xác nhận đơn xong đơn "biến mất" -> tưởng bị xoá: tab Đơn hàng mặc định lọc "Chờ xác
  nhận", đơn đổi sang confirmed rời bộ lọc. Đơn KHÔNG bị xoá (Worker không có DELETE orders). Sửa
  (v6): mặc định "Tất cả" (chờ xác nhận lên đầu), ô lọc có đếm số đơn, đơn vừa xác nhận / huỷ vẫn
  hiện tại chỗ kèm "vừa xác nhận" (`JUST_CHANGED`).
- (CMS, 20/10) Hộp xác nhận dùng chung nút "Huỷ / Xoá" (từ mẫu) -> "Xác nhận đã nhận tiền?" mà nút
  là "Xoá": khó hiểu. `showConfirm(message, {ok, cancel, danger})` — chữ nút PHẢI nói đúng việc.
- (Thử API local, 20/10) cookie phiên có `Secure` -> curl KHÔNG gửi lại qua `http://localhost`
  (trình duyệt thì có) -> tưởng lỗi "Vui lòng đăng nhập". Chạy `npx wrangler dev --local-protocol
  https` + `curl -k`. Trong zsh, biến chứa nhiều tham số curl không tự tách -> viết script bash.
- (Máy dev, 20/10) `dig` trên máy này BỊ MẠNG CAN THIỆP: trả rỗng cả bản ghi A đang có, 8.8.8.8
  timeout -> từng kết luận nhầm "chưa có bản ghi email". Kiểm DNS bằng DoH:
  `curl -s -H "accept: application/dns-json" "https://cloudflare-dns.com/dns-query?name=<tên>&type=TXT"`.
- (GAS, 20/10) `clasp create` ghi đè `appsscript.json` mặc định -> phải khôi phục trước `push`.
- (GAS, 20/10) Lần Lưu đầu không có commit nào (kể cả ảnh bìa) dù CMS đọc được danh sách bài ->
  ghi vào kho thất bại; chủ dự án sửa cấu hình token xong thì chạy. Nghi: GitHub fine-grained
  token để Contents = Read-only (mặc định). Kiểm: token phải Contents **Read and write**, đúng repo.
- (GAS, 20/10) TinyMCE mặc định lưu tiếng Việt thành entity (`&acirc;`) -> thêm
  `entity_encoding: "raw"`.
- (Khác mẫu xevip, cố ý) `slugify_` / `slugify` thay ký tự lạ bằng `-` (xevip: xoá đi) để khớp
  slug 18 bài cũ ("16/10" -> "16-10"). 2 hàm server/client PHẢI giống nhau.

## X. Cấu hình (tên biến cố định)

**Project GAS** (tạo 20/10/2026 bằng `clasp create`, tài khoản Google dùng chung của chủ dự án):
- Script ID: `1jQeEdB1_IOMp8UjuqzGaJS6XLOur-LW8TCpu6FuITKvns_kLNc5QxV8S`
  (editor: https://script.google.com/d/1jQeEdB1_IOMp8UjuqzGaJS6XLOur-LW8TCpu6FuITKvns_kLNc5QxV8S/edit)
- Deployment ID (web app, GIỮ NGUYÊN — cập nhật bằng `npx @google/clasp push` rồi `npx @google/clasp update-deployment <id>`
  (clasp 3.x — tạo version mới cho ĐÚNG deployment này), KHÔNG `create-deployment` lần nữa): `AKfycbzN5CVc1MaIAm0FdOE6Ezd1Yud1Rki561DnuFbwwmNd6xlgap8yGlG8MeWmJeWmoaO8SQ`
- URL `/exec` (= `CMS_URL` trong `html/admin/index.html`):
  `https://script.google.com/macros/s/AKfycbzN5CVc1MaIAm0FdOE6Ezd1Yud1Rki561DnuFbwwmNd6xlgap8yGlG8MeWmJeWmoaO8SQ/exec`
- ⚠️ `clasp create` GHI ĐÈ `appsscript.json` bằng bản mặc định (timezone New York, mất khối
  `webapp`) — đã gặp 20/10; luôn kiểm lại file này trước `clasp push`.

**Script Properties (GAS)**: `GITHUB_TOKEN` (fine-grained, Contents RW repo `dautucungvu`),
`GITHUB_OWNER` = `tranquanghuy-rightsvn`, `GITHUB_REPO` = `dautucungvu`, `GITHUB_BRANCH` =
`master`, `WORKER_API_BASE` = `https://dautucungvu.com/api/admin`, `WORKER_ADMIN_KEY` (≥ 32 ký tự
ngẫu nhiên, TRÙNG secret `ADMIN_KEY` của Worker), `SPREADSHEET_ID` (code tự tạo, không điền).

**Worker** (`wrangler.jsonc` ở gốc repo, tên Worker `dautucungvu`, custom domain `dautucungvu.com`)
— secrets: `ADMIN_KEY`, `TURNSTILE_SECRET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
vars: `SITE_URL` = `https://dautucungvu.com`, `R2_BUCKET` = `dautucungvu-videos`, `R2_ACCOUNT_ID`
(32 ký tự hex), `ENABLE_TEST_ROUTES` = `"0"` (GĐ6 đã gỡ `/api/test/video` + `presign-check`; chỉ còn
`/api/test/market-sources`, bật tạm `"1"` khi cần chẩn đoán), `MAIL_FROM` = `thongbao@dautucungvu.com`, `MAIL_REPLY_TO` = `lienhe@dautucungvu.com` (cả hai
chuyển tiếp về Gmail Vũ), `ORDER_NOTIFY_EMAIL` = `truongvutienphuoc@gmail.com` (email Vũ, chốt 20/10), `CMS_URL` = `https://dautucungvu.com/admin/`,
`TURNSTILE_SITE_KEY` = `0x4AAAAAAFdoZBmQ_HkuKLVd` (công khai; cũng hard-code trong `html/assets/js/ui.js`).
Secret `TURNSTILE_SECRET` đã đặt 20/10 (chưa đặt thì Worker bỏ qua Turnstile).
bindings: `DB` (D1 `dautucungvu`), `VIDEOS` (R2), `EMAIL` (send_email), `ASSETS` (static assets).
Chạy local: `.dev.vars` ở gốc repo (gitignore) chứa `ADMIN_KEY=...` cho `wrangler dev`.

**GitHub Actions secrets**: KHÔNG cần (Actions chỉ build + commit bằng `GITHUB_TOKEN`; deploy do
Workers Builds, Cloudflare tự quản token build).

---

## XI. Hiện trạng code (20/10/2026, GĐ1–GĐ5 xong phần code — tiếp theo GĐ6 hoàn thiện)

Cấu trúc repo đã theo mục VIII (trừ `gas/`, `html/admin/`, `html/vendor/`, `worker/migrations/`
chưa có). Site vẫn là bản demo về chức năng:

- `data/` tách từ `data.js` cũ (đã kiểm: `window.APP_DATA` build ra giống hệt bản cũ ở cả 7 nhóm
  site/indices/tickers/courses/newsTags/news/brokers; `settings.json` có thêm `images`).
- `scripts/build.py` (trước là `html/scripts/seo.py`) sinh `html/assets/js/data.js` + 80 trang con
  + SEO + sitemap/robots. Trang gốc `html/<slug>/index.html` và `html/index.html` vẫn sửa tay
  (build chỉ thay khối `<!-- SEO -->`).
- Trang con hiện có: `bai-viet/<slug>/`, `khoa-hoc/<id>/[bai-<n>/]` (đổi sang slug bài ở GĐ3),
  `khoa-hoc/mien-phi|co-phi|cua-toi/`, `tin-tuc/<chủ-đề>/`, `tin-tuc/<mã-viết-thường>/`,
  `thanh-toan/goi-<n>-thang/`, `thanh-toan/<id-khóa>/`.
- `assets/js/ui.js`: auth THẬT qua `/api/me` (GĐ4; bỏ "dtcv-user" giả lập), `UI.api()`, hàm URL
  `url()`, `articleUrl(n)`, `courseUrl(c, lessonIdx)`, `courseFilterUrl(f)`, `newsUrl(x)`,
  `payUrl({course}|{months})`. `assets/js/pages/*.js` đọc trạng thái từ `document.body.dataset`.
- Thanh toán: đơn tạo trên máy chủ (D1), VietQR theo đơn (`settings.payment.qrImage = ""`);
  `assets/img/qr-code-card.jpg` là QR tĩnh dự phòng.
- `worker/`: ĐÃ DEPLOY lên https://dautucungvu.com (20/10). Đã chạy thử local (`wrangler dev`): trang tĩnh 200, `/khoa-hoc` → 307 `/khoa-hoc/`,
  URL lạ → 404 + `html/404.html`, `/api/health` OK, `/api/*` lạ → 404 JSON, admin sai khóa → 401,
  presigned PUT URL R2 sinh đúng định dạng, `/api/test/video/...` Range (đầu/giữa/suffix) đúng byte.
  D1 + R2 đã tạo. Deploy: Actions build + Workers Builds (đã chạy thật 20/10).
- Liên hệ trong `settings.json`: 0982277493 (chủ dự án sửa qua CMS 20/10).
- Chạy thử: `npx wrangler dev` ở gốc repo (hoặc `cd html && python3 -m http.server`).

## XII. Kế hoạch & tiến độ

### A. Việc chủ dự án cần làm / cung cấp (⏳ = chặn giai đoạn)
- [x] Ảnh bìa khóa học + mọi ảnh site: tùy biến được trong CMS (20/10).
- [x] Chỉ số / giá cổ phiếu: API thật (20/10).
- [x] Nguồn API thị trường: API công khai không chính thức (VPS + DNSE) (20/10).
- [ ] Email root của Vũ. ⏳ GĐ2
- [ ] `ORDER_NOTIFY_EMAIL` + `MAIL_REPLY_TO`. ⏳ GĐ4
- [ ] SĐT / Zalo thật, link YouTube / Facebook / Telegram. ⏳ GĐ3
- [ ] Link mở tài khoản, mã giới thiệu, mã môi giới từng công ty CK. ⏳ GĐ3
- [ ] Video bài học MP4 H.264 720p, ≤ 2GB/file — Vũ tự tải trong CMS (tab Khóa học → cột Video).
- [x] Cloudflare: thêm domain, đổi nameserver (20/10 — `dig NS @1.1.1.1` ra
      `clay.ns.cloudflare.com`, `simone.ns.cloudflare.com`). Gán custom domain vào Worker làm ở GĐ1.
- [ ] Cloudflare: tạo bucket R2 `dautucungvu-videos` (private). ⏳ GĐ1
- [x] ~~API token deploy cho GitHub Actions~~ — KHÔNG cần nữa (deploy qua Workers Builds, 20/10).
- [x] R2 API token (Account token, Object Read & Write, chỉ bucket `dautucungvu-videos`) + secret
      `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `ADMIN_KEY` đã đặt (20/10, `npx wrangler secret
      list` thấy đủ 3). Chủ dự án tự chạy trong Terminal riêng (KHÔNG qua `!` / chat): Terminal
      macOS cần quyền Desktop (System Settings → Privacy & Security → Files and Folders), hoặc chạy
      từ `~` với `--name dautucungvu`. ADMIN_KEY = `openssl rand -hex 32`, chủ dự án giữ (dùng lại
      cho Script Property `WORKER_ADMIN_KEY` ở GĐ2).
- [x] Máy local: `npx wrangler login` (20/10).
- [x] Địa chỉ email của site (20/10): Vũ đã xác nhận destination truongvutienphuoc@gmail.com
      (Email Routing, id c3a1c47872c44b5c8ad09dba286d656b). Rule chuyển tiếp (literal, to → forward
      về Gmail Vũ): `lienhe@dautucungvu.com` (id f207608415dc499b856fbd3c0749b81b) và
      `thongbao@dautucungvu.com` (id 994e6577122a410b81c7fe558f7f490e); catch-all TẮT. Thêm địa
      chỉ mới: `npx wrangler email routing rules create dautucungvu.com --name "<x> -> Vu"
      --match-type literal --match-field to --match-value <x>@dautucungvu.com --action-type forward
      --action-value truongvutienphuoc@gmail.com`. `wrangler.jsonc`: `MAIL_FROM` =
      `thongbao@dautucungvu.com`, `MAIL_REPLY_TO` = `lienhe@dautucungvu.com` (khách bấm Trả lời →
      về Gmail Vũ). Thử gửi: `npx wrangler email sending send --from thongbao@dautucungvu.com --to
      lienhe@dautucungvu.com --subject ... --text ...`. Lý do đổi: email vào thư rác dù
      SPF/DKIM/DMARC PASS (domain mới; địa chỉ gửi có thật + nhận được thư trả lời giúp uy tín).
- [ ] (Tuỳ chọn) Google Postmaster Tools cho dautucungvu.com: chủ dự án tự thêm TXT
      `google-site-verification=...` trong Cloudflare DNS (wrangler OAuth không có quyền ghi DNS).
- [x] Email Routing đã BẬT (20/10): domain gốc có MX route1/2/3.mx.cloudflare.net + SPF
      `v=spf1 include:_spf.mx.cloudflare.net ~all` + DKIM `cf2024-1._domainkey`. Chưa có rule
      chuyển tiếp: lienhe@, thongbao@ (xem trên).
- [x] Cloudflare: bật Email Sending cho `dautucungvu.com` (20/10, `npx wrangler email sending enable`).
      Zone tự có 6 bản ghi: 3 MX + SPF `cf-bounce.dautucungvu.com`, DKIM `cf-bounce._domainkey`,
      DMARC `_dmarc` `p=reject`. Trang Overview "Healthy", hạn mức **200 email/ngày** (domain mới).
      ⚠️ DMARC p=reject: sau này gửi mail @dautucungvu.com từ dịch vụ khác (Zoho, Google Workspace…)
      PHẢI thêm SPF/DKIM của dịch vụ đó, không thì bị chặn. Domain gốc không có MX (chưa nhận mail).
- [ ] Cloudflare: Turnstile widget cho `dautucungvu.com`. ⏳ GĐ4
- [x] Google: bật Apps Script API + `clasp login` (20/10, `@google/clasp` 3.4.1 qua `npx`; tài
      khoản Google dùng chung cho nhiều CMS khách — chủ script = root ngầm định của CMS này).
- [ ] GitHub: fine-grained token (Contents RW repo `dautucungvu`). ⏳ GĐ2
- [ ] 2FA cho Cloudflare, GitHub, Google.

### B. Giai đoạn (mỗi GĐ: chạy được trên production, test dữ liệu giả rồi dọn)

**GĐ1 — Hạ tầng & thử rủi ro (≈ 2–3 ngày)**
- [x] Tái cấu trúc repo theo VIII: `data/`, `templates/`, `scripts/build.py`, `docs/design/`;
      README/design/scripts ra khỏi `html/` (20/10).
- [x] `build.py` sinh `html/assets/js/data.js` từ `data/` (20/10, kiểm giống hệt bản cũ).
- [x] `wrangler.jsonc` + `worker/src/` + `html/404.html`; chạy thử local OK (20/10).
- [x] `.github/workflows/build.yml` — chỉ build + commit, deploy giao cho Workers Builds (20/10).
- [x] `wrangler.jsonc` + `package.json` ra gốc repo; bỏ `aws4fetch`, tự ký SigV4 bằng WebCrypto
      (đối chiếu chữ ký khớp `aws4fetch`) (20/10).
- [x] Chủ dự án cấu hình Workers Builds như VIII (20/10). Đã kiểm: push `75af958` → Workers Builds
      deploy bản đúng (compat `2026-10-01`, có D1 + R2, `/api/health` 200); Actions tạo commit rỗng
      "CI: build" `a42160f` → Workers Builds deploy tiếp OK. LƯU Ý root directory PHẢI là `/` (không
      phải `/html`): `/html` thì không thấy `wrangler.jsonc` → Cloudflare tự deploy kiểu chỉ static,
      mất API — đúng lỗi đã gặp.
- [x] `npx wrangler login` (20/10, tài khoản Cloudflare `web100.vn@gmail.com`, Account ID
      `975f2208a74d9e0b5048659725df1911`).
- [x] Tạo D1 `dautucungvu` (20/10, APAC, id `7ed75e1e-7173-48c9-99b4-2af6cfac1c55`), điền
      `database_id` + `R2_ACCOUNT_ID` vào `wrangler.jsonc`.
- [x] Chủ dự án bật R2 (20/10; sau khi bật cần chờ ~20 giây API mới nhận). Tạo bucket
      `dautucungvu-videos`, đặt CORS từ `worker/r2-cors.json` (20/10).
- [ ] Còn lại: `npx wrangler r2 bucket cors set dautucungvu-videos
      --file r2-cors.json`; đặt secret `ADMIN_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
- [x] Deploy lần đầu bằng `npx wrangler deploy` (tay, từ máy local), custom domain
      `dautucungvu.com` gán OK, `server: cloudflare`; `workers_dev` + `preview_urls` tắt;
      `html/.assetsignore` loại `.DS_Store` (20/10). Kiểm live: trang 200, `/khoa-hoc` 307,
      URL lạ 404 + trang 404, `/api/health` OK.
- [x] `www.dautucungvu.com` (20/10, chủ dự án cấu hình trên Cloudflare): 301 → `https://dautucungvu.com/<cùng đường dẫn>`.
- [x] Rủi ro 1 — phần server (20/10): `/api/test/presign-check` trên production: R2 nhận PUT qua
      link ký bằng `presign.js` (200, file vào bucket), preflight CORS với origin
      `https://n-test-0lu-script.googleusercontent.com` → 204, cho phép PUT.
- [ ] Rủi ro 1 — phần trình duyệt: upload file lớn THẬT từ trang GAS (iframe) — làm khi dựng CMS
      ở đầu GĐ2 (cần `clasp login`).
- [x] Thử rủi ro 2 trên production (20/10): MP4 720p 60s (`courses/test/video-720p.mp4`, file
      thử, xoá trước khi mở bán) qua `/api/test/video/test/video-720p` — full + Range đúng byte;
      Chrome: đọc metadata, tua tới 45s, phát tiếp OK.
- [ ] Rủi ro 2 trên máy chủ dự án (PC + Safari iOS): mở
      https://dautucungvu.com/api/test/video/test/video-720p, phát + tua — chủ dự án kiểm sau.
- Xong khi: sửa `data/` + push → site tự deploy; 2 rủi ro đã thử OK (hoặc ghi phương án thay vào đây).

**GĐ2 — CMS lõi + bài viết (≈ 3–4 ngày)**
- [x] `gas/` từ mẫu xevip: OTP, `root > admin > editor` (admin chỉ quản lý editor, root quản lý
      admin), boot cache, pop-up, spinner, giấu hạ tầng; `gas/` gitignore (20/10).
- [x] Tab Bài viết đủ II.A (TinyMCE 6.8.5 tự host `html/vendor/tinymce/`, nút chèn ảnh nhanh,
      chủ đề, mã CP, quyền xem, `entity_encoding: "raw"`) (20/10).
- [x] `html/admin/index.html` nhúng iframe + link thoát, `noindex` (meta + `html/_headers`
      X-Robots-Tag), robots.txt KHÔNG khai /admin/ (20/10).
- [x] 18 bài cũ đã ở `data/` từ GĐ1 (chưa có ảnh bìa -> site dùng hình SVG `art`; mở sửa trong CMS
      thì bắt buộc tải ảnh bìa).
- [x] Worker API admin thân bài trả phí `/api/admin/articles/<slug>` + D1 `article_bodies`
      (migration 0001 đã áp remote) (20/10).
- [x] Thử thật (20/10): bài `test-20-10` (public, ảnh bìa + 1 ảnh trong bài, tiêu đề có `"` và `/`):
      commit đúng thứ tự cover -> 01.jpg -> data/news -> posts.json -> CI build; 3 commit trung gian
      KHÔNG deploy, chỉ "CI: build" deploy (1 lần/thao tác); ảnh lưu `/images/news/<slug>/01.jpg`;
      trang live đúng (title, canonical, og:image = ảnh bìa, sitemap, ảnh bìa ở /tin-tuc/).
- [x] Bài TRẢ PHÍ `bai-tra-tien` (member) (20/10): thân bài chỉ ở D1 (`updated_by` =
      web100.vn@gmail.com), `data/news/*.json` + lịch sử git + HTML + data.js KHÔNG có; trang live chỉ
      tóm tắt + hộp khoá, JSON-LD `isAccessibleForFree: false`. Sửa thân bài -> chỉ D1 đổi, website
      không đổi (đúng thiết kế, hiện cho hội viên ở GĐ4).
- [x] Xoá 2 bài (20/10): xoá data/news + ảnh + thân bài D1 + gỡ khỏi posts.json; sau CI trang + ảnh
      404, sitemap sạch.
- [x] Tab Kiểm tra hệ thống OK (WORKER_ADMIN_KEY khớp ADMIN_KEY) + tải file MP4 ~18MB từ trang GAS
      lên R2 thành công (rủi ro 1 phần trình duyệt) (20/10, chủ dự án thử). File thử
      `courses/test/upload-check.mp4` còn trong R2 — xoá bằng nút "Xoá file thử".
- [ ] Còn thử khi tiện: file video LỚN (200MB+) từ trang GAS, F5 giữ đăng nhập trên Safari,
      thêm/xoá 1 editor.
- Xong khi: editor đăng / sửa / xoá bài → 1–3 phút lên site đúng URL + SEO.

**GĐ3 — Khóa học + cài đặt (≈ 3 ngày)**
- [x] Dữ liệu thị trường thật `/api/market` + site hiển thị (II.E) — chạy trên production 20/10
      (VN-Index 1.691,97; HPG 21.100 +2,68%); D1 migration 0002 đã áp remote.
- [x] Tab Khóa học (chưa video): tên, URL (bất biến), mô tả ≤300, giá, quyền xem khi miễn phí, thứ
      tự, Ẩn, ảnh bìa `html/images/courses/<id>/cover.jpg`, bài học (tên, URL bất biến khi đã lưu,
      phút, học thử, kéo lên/xuống, xoá) — `saveCourse`/`deleteCourse`/`uploadCourseCover`;
      id cấm trùng `mien-phi|co-phi|cua-toi`. Khóa Ẩn không lên site (build lọc) (20/10, CMS v3).
- [x] Tab Cài đặt: liên hệ, slogan/ưu đãi, gói hội viên, tài khoản nhận tiền, ảnh site (hero, logo,
      favicon, ảnh chia sẻ -> `html/images/site/<key>.jpg`), video hướng dẫn, công ty CK, chủ đề tin
      (id bất biến; đang được bài dùng thì cấm xoá), mã CP (đang được bài dùng thì cấm xoá), chỉ số
      — `saveSettings`/`uploadSiteImage` (20/10, CMS v3).
- [x] URL bài học `bai-<n>` -> `<slug-bài>`: data/courses.json đã thêm `slug` + `order`, build sinh
      trang + dọn thư mục cũ, `ui.js courseUrl` theo slug (20/10).
- [x] Ảnh site theo Cài đặt: build vá favicon mọi trang (đường dẫn tuyệt đối), ảnh hero trang chủ,
      og:image mặc định + logo JSON-LD; `ui.js brandImg()` cho logo header/footer (20/10).
- [ ] Chủ dự án thử trong CMS: sửa 1 khóa (tải ảnh bìa, thêm/xếp/xoá bài), tạo + xoá 1 khóa thử,
      lưu Cài đặt (đổi SĐT thật, thêm 1 mã CP), tải ảnh logo / favicon.
- [ ] TODO GĐ4: chặn xoá khóa đã có người mua (`deleteCourse`).
- Xong khi: mọi nội dung site sửa được trong CMS, không còn sửa tay file dữ liệu.

**GĐ4 — Tài khoản người dùng + đơn hàng + nội dung trả phí (≈ 5–6 ngày)**
- [x] Worker auth đủ VI.1 + Turnstile; migration 0003 (đã áp remote) (20/10).
- [x] Email Service: mọi mẫu VI.5 (`worker/src/mail.js`) + email báo đơn cho Vũ; Cron nhắc gia hạn (20/10).
- [x] Đơn hàng VietQR trên máy chủ (`payment.js` mới: nút "Tạo mã QR" -> đơn thật); tab Đơn hàng
      + Người dùng website trong CMS (v4); xoá khóa đã có người sở hữu bị chặn (20/10).
- [x] Thân bài trả phí GAS ↔ D1 (GĐ2) + trang bài gọi `/api/content/<slug>` khi đủ quyền (20/10).
- [x] Gỡ auth giả lập: `ui.js` dùng `/api/me` (cache `dtcv-me` chỉ để vẽ nhanh), hộp Đăng nhập /
      Đăng ký / Quên mật khẩu, dải nhắc xác minh email; dashboard: đơn thật + đổi mật khẩu (20/10).
- [x] Thử local bằng Chrome headless (CDP): đăng ký -> dải xác minh -> tạo đơn 204.000đ + QR ->
      báo chuyển -> admin xác nhận -> hội viên tới 19/01/2027 -> dashboard -> bài hội viên thấy thân
      bài -> đăng xuất bị khoá. Production: khách bị chặn content/orders, đăng ký thiếu Turnstile bị chặn.
- [ ] Chủ dự án thử THẬT trên production: đăng ký bằng email thật (nhận email xác minh), quên mật
      khẩu, tạo đơn + báo chuyển (Vũ nhận email báo đơn), xác nhận trong CMS tab Đơn hàng (người mua
      nhận email kích hoạt), bật VIP / gia hạn trong tab Người dùng website.
- Xong khi: repo / xem nguồn trang không còn nội dung trả phí; 1 đơn đi trọn vòng tạo → chuyển
  khoản → email báo → xác nhận → email kích hoạt → xem được.

**GĐ5 — Video (≈ 2–3 ngày)**
- [x] CMS tải video lên R2 kèm %, thay / xoá (CMS @7, 20/10).
- [x] Worker `/api/video/...` kiểm quyền + `Range`; trình phát `<video>` mặc định (20/10). Đã thử
      production: bài có phí chưa đăng nhập 401, bài học thử qua quyền, khóa miễn phí 200 + Range 206
      đúng byte (file thử đặt tạm rồi xoá). CHƯA thử: đăng nhập nhưng chưa mua → 403 (logic đơn giản).
- [x] Upload video thật từ CMS (chủ dự án, 20/10: bài nhap-mon-chung-khoan/chung-khoan-la-gi-vi-sao-nen-dau-tu)
      + xem trên Safari macOS OK.
- [ ] Còn: xem trên iPhone (Safari iOS); thử 1 file 200MB+.
- Xong khi: có quyền xem & tua được trên PC + điện thoại; không quyền → 403.

**GĐ6 — Hoàn thiện & bàn giao (≈ 2 ngày)**
- [x] Rà `gotchas-and-checklist.md` (20/10): không lộ tên hạ tầng trong file CMS / site; build
      idempotent; `CLIENT_BUILD` tự băm; footer bỏ câu "số liệu minh họa"; trang bài viết KHÔNG còn tự
      chèn 2 đoạn văn bịa khi bài thiếu nội dung (chỉ hiện tóm tắt).
- [x] Trang `/dieu-khoan-su-dung/` + `/chinh-sach-bao-mat/` (HTML tĩnh viết tay, head do build sinh,
      có trong sitemap; footer + form đăng ký có link "đồng ý điều khoản"). ⚠️ Mục **Hoàn tiền** (không
      hoàn sau kích hoạt, trừ lỗi phía site / chuyển thừa, báo trong 7 ngày) là bản nháp — CHỜ VŨ
      DUYỆT. Chính sách bảo mật nêu tên bên thứ ba (Cloudflare, VietQR, YouTube, Google Fonts) — trang
      công khai về dữ liệu cá nhân phải nói thật, khác quy tắc giấu hạ tầng trong CMS.
- [x] Gỡ route thử `/api/test/video`, `/api/test/presign-check`, phần "tải video thử" trong CMS;
      xoá R2 `courses/test/*.mp4`; `ENABLE_TEST_ROUTES` = `"0"` (20/10).
- [x] Sao lưu (20/10): (1) D1 Time Travel 30 ngày có sẵn (gói Paid) — `npx wrangler d1 time-travel
      restore dautucungvu --timestamp=<ISO>`; (2) Cron thứ Hai ghi `backups/d1/<ngày>.json` (bảng
      users, orders, course_access, article_bodies) vào bucket R2 private, giữ 12 bản; admin
      `POST|GET /api/admin/backup`, CMS tab **Sao lưu dữ liệu** (root) có nút Sao lưu ngay + danh sách;
      (3) tải về máy: `npx wrangler d1 export dautucungvu --remote --output <file>.sql` (có dữ liệu cá
      nhân — KHÔNG để trong repo); (4) `data/` + ảnh có lịch sử git; (5) video: Vũ giữ file gốc (R2
      không có bản sao). Khôi phục từ JSON: chưa có script, viết khi cần (INSERT theo từng bảng).
- [x] Hướng dẫn vận hành cho Vũ: tab **Hướng dẫn** trong CMS (mọi vai trò): duyệt đơn, VIP, hỗ
      trợ khách, đăng bài, khóa học + video (cách quay iPhone ra MP4), cài đặt, phân quyền, sao lưu.
      CMS @8.
- [x] Xoá 18 bài tin tức MẪU từ bản demo (20/10, chủ dự án yêu cầu): `data/news/` trống,
      `posts.json` = `[]`, build tự xoá `html/bai-viet/*`; D1 `article_bodies` vốn trống. Trang chủ /
      tin tức hiện "Chưa có bài viết", không lỗi JS.
- [ ] ⚠️ Còn dữ liệu mẫu chờ Vũ quyết: 5 khóa học (giá tự đặt, chưa có video) và dải số liệu trang
      chủ "100+ bài học video · 50+ tin tức mỗi ngày · 1.000+ nhà đầu tư" (con số chưa có thật).

Tổng ≈ 17–21 ngày làm việc, chưa tính thời gian chờ mục A.

**Chi phí dự kiến**: GAS / Sheets / GitHub public + Actions = 0đ · **Workers Paid $5/tháng là BẮT
BUỘC** (Email Sending chỉ có ở gói Paid; gói đã gồm 10 triệu request Worker, 3.000 email/tháng —
vượt $0.35/1.000 email, D1 25 tỷ row đọc / 50 triệu row ghi) · R2: 10GB đầu miễn phí, sau
~$0.015/GB/tháng, không tính băng thông xem. Gói Paid tính theo ACCOUNT, dùng chung cho mọi site
trong account. (Tra 20/10/2026 — kiểm lại trang giá Cloudflare trước khi báo khách.)

## XIII. Nhật ký quyết định (đã chốt với chủ dự án — KHÔNG đề xuất lại)

| Ngày | Quyết định | Lý do |
|---|---|---|
| 19/10 | URL luôn `/slug/` thư mục, không `.html`, không redirect | Yêu cầu chủ dự án, deploy Cloudflare |
| 19/10 | Không dùng `?params` ở bất kỳ đâu, mọi trạng thái là trang tĩnh | Yêu cầu chủ dự án ("nói 1 lần thôi") |
| 19/10 | Mọi trang có meta đầy đủ, canonical, JSON-LD; domain `https://dautucungvu.com` | Yêu cầu chủ dự án |
| 19/10 | Thanh toán VietQR theo từng đơn (tự điền số tiền + nội dung), TK Techcombank 4819939999 NGO TRUONG VU | QR tĩnh bắt người mua tự gõ tiền |
| 19/10 | Công nghệ: GAS CMS + site tĩnh + Cloudflare. KHÔNG Astro | GAS CMS là công nghệ của chủ dự án |
| 19/10 | Không webhook thanh toán; admin xác nhận đơn tay trong CMS | Không có tài khoản doanh nghiệp |
| 19/10 | Người dùng site đăng nhập email + mật khẩu, có xác minh email + tự đặt lại mật khẩu qua email | Muốn chuyên nghiệp; OTP GAS dính quota 100 mail/ngày |
| 19/10 | Báo đơn mới qua email, không Telegram | Yêu cầu chủ dự án |
| 19/10 | Repo GitHub PUBLIC | Chủ dự án chọn; Actions không giới hạn → mọi dữ liệu riêng phải ở D1/R2 |
| 19/10 | Quản trị 3 cấp root (Vũ) > admin > editor | Yêu cầu chủ dự án (theo guideline skill) |
| 19/10 | Video lưu R2 + Worker kiểm quyền; không YouTube, không Stream | Stream đắt; YouTube/Drive/Vimeo free không khoá được link |
| 19/10 | Chấp nhận người có quyền tải/quay video; không DRM/watermark | "Chặn thì nó quay màn hình cũng z" |
| 19/10 | CMS admin vẫn đăng nhập OTP (mẫu xevip) | Ít người, nằm trong quota MailApp |
| 20/10 | Mọi ảnh trên website tùy biến được trong CMS (ảnh bìa khóa upload; hero, logo, favicon, ảnh chia sẻ) | Yêu cầu chủ dự án |
| 20/10 | Chỉ số thị trường + giá cổ phiếu lấy API thật qua Worker | Yêu cầu chủ dự án |
| 20/10 | Nguồn dữ liệu thị trường: API công khai không chính thức (VPS + DNSE), không SSI FCData | Miễn phí; chấp nhận rủi ro nguồn đổi/chặn (có dự phòng D1) |
| 20/10 | Video: CHỈ nhận MP4 (H.264 + AAC), không .mov (chủ dự án chốt "mp4 làm đi") | .mov từ iPhone thường là HEVC, nhiều trình duyệt không phát |
| 20/10 | Video: không bảng D1, cờ `lesson.video = "mp4"` trong courses.json, khóa R2 suy từ slug | Slug bài bất biến; bớt 1 nơi lưu phải đồng bộ |
| 20/10 | Deploy: GitHub Actions build + commit `html/`, Cloudflare Workers Builds nối Git tự deploy; KHÔNG dùng `CLOUDFLARE_API_TOKEN`; KHÔNG build trên Cloudflare | Yêu cầu chủ dự án ("build github action rồi ánh xạ lên cloudflare"). RIÊNG dự án này (dự án đặc biệt) — KHÔNG đưa vào skill, các dự án GAS khác giữ cách cũ |

## XIV. Quy ước làm việc với chủ dự án
- Tiếng Việt, ngắn gọn; nói rõ đã kiểm chứng gì / chưa kiểm chứng gì.
- Làm xong 1 việc: commit (message tiếng Việt, kết thúc bằng dòng
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`) rồi **push `origin master`**.
- Test thật trước khi báo xong: chạy build, mở trang bằng Chrome headless/Chrome MCP, chụp màn
  hình kiểm tra; với trang cần đăng nhập thì giả lập session.
- Không sửa tay file sinh ra (trang con trong `html/`, `sitemap.xml`, `robots.txt`) — sửa nguồn
  rồi chạy build.
- Không thêm tính năng / field ngoài file này khi chưa hỏi.

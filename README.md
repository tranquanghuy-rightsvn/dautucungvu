# Đầu tư cùng Vũ — https://dautucungvu.com

Toàn bộ quyết định, kiến trúc, kế hoạch và tiến độ nằm trong **[GAS.md](GAS.md)**. Đọc file đó trước.

## Cấu trúc

```
data/                 NGUỒN DỮ LIỆU công khai (CMS ghi) — posts.json, news/<slug>.json,
                      courses.json, settings.json (giá / chỉ số KHÔNG ở đây — /api/market)
templates/            khung trang sinh tự động (article.html)
scripts/build.py      data/ -> html/ (data.js, trang con, SEO, sitemap, robots)
html/                 site tĩnh được deploy (chỉ thứ được public)
worker/               code Cloudflare Worker (src/), migrations D1, r2-cors.json
wrangler.jsonc        cấu hình Worker (ở GỐC repo — Workers Builds đọc ở đây)
docs/design/          ảnh thiết kế gốc (không deploy)
gas/                  CMS Google Apps Script (gitignore, deploy bằng clasp)
.github/workflows/    build.yml: build data/ -> html/, commit html/ (KHÔNG deploy)
```

## Lệnh

```bash
python3 scripts/build.py      # build html/ từ data/
npm install                   # lần đầu (chỉ có wrangler)
npx wrangler dev              # chạy site + API ở http://localhost:8787 (.dev.vars: ADMIN_KEY=...)
npx wrangler deploy           # deploy tay — bình thường Workers Builds tự deploy khi push
```

Deploy: GitHub Actions build + commit `html/` → Cloudflare Workers Builds (nối Git, không
token) thấy commit đụng `html/` / `worker/` là tự `npx wrangler deploy`. Chi tiết GAS.md VIII.

Không sửa tay: `html/assets/js/data.js`, các trang con trong `html/` (bai-viet/<slug>/,
khoa-hoc/<id>/..., tin-tuc/<...>/, thanh-toan/<...>/), `html/sitemap.xml`, `html/robots.txt` —
build ghi đè. Sửa dữ liệu trong `data/` (hoặc qua CMS), sửa giao diện ở trang gốc
`html/<slug>/index.html`, `templates/`, `html/assets/`.

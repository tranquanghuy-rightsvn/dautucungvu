# Đầu tư cùng Vũ — https://dautucungvu.com

Toàn bộ quyết định, kiến trúc, kế hoạch và tiến độ nằm trong **[GAS.md](GAS.md)**. Đọc file đó trước.

## Cấu trúc

```
data/                 NGUỒN DỮ LIỆU công khai (CMS ghi) — posts.json, news/<slug>.json,
                      courses.json, settings.json, market-demo.json (minh hoạ, bỏ ở GĐ3)
templates/            khung trang sinh tự động (article.html)
scripts/build.py      data/ -> html/ (data.js, trang con, SEO, sitemap, robots)
html/                 site tĩnh được deploy (chỉ thứ được public)
worker/               Cloudflare Worker: phục vụ html/ + API /api/*
docs/design/          ảnh thiết kế gốc (không deploy)
gas/                  CMS Google Apps Script (gitignore, deploy bằng clasp)
.github/workflows/    build + deploy khi data/ đổi
```

## Lệnh

```bash
python3 scripts/build.py              # build html/ từ data/
cd worker && npm install              # lần đầu
cd worker && npx wrangler dev         # chạy site + API ở http://localhost:8787
cd worker && npx wrangler deploy      # deploy tay (bình thường CI tự làm)
```

Không sửa tay: `html/assets/js/data.js`, các trang con trong `html/` (bai-viet/<slug>/,
khoa-hoc/<id>/..., tin-tuc/<...>/, thanh-toan/<...>/), `html/sitemap.xml`, `html/robots.txt` —
build ghi đè. Sửa dữ liệu trong `data/` (hoặc qua CMS), sửa giao diện ở trang gốc
`html/<slug>/index.html`, `templates/`, `html/assets/`.

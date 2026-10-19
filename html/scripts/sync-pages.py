#!/usr/bin/env python3
"""Sinh bản <slug>.html ở thư mục gốc từ <slug>/index.html.

Mỗi trang có 2 URL cùng hiển thị, không redirect qua lại:
  /tin-tuc/      -> tin-tuc/index.html   (bản gốc, sửa ở đây)
  /tin-tuc.html  -> tin-tuc.html         (bản sinh ra, đừng sửa tay)

Hai bản chỉ khác đường dẫn tương đối ("../assets/" -> "assets/").
Chạy lại sau mỗi lần sửa một trang:  python3 scripts/sync-pages.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ["khoa-hoc", "mo-tai-khoan", "tin-tuc", "bai-viet", "premium", "thanh-toan", "dashboard"]
NOTE = "<!-- Tự sinh từ {slug}/index.html bởi scripts/sync-pages.py. Đừng sửa trực tiếp file này. -->\n"

for slug in PAGES:
    html = (ROOT / slug / "index.html").read_text(encoding="utf-8")
    html = html.replace('="../"', '="./"')  # link về trang chủ
    html = re.sub(r'(href|src)="\.\./', r'\1="', html)
    # Báo cho công cụ tìm kiếm biết /slug/ là URL chính, tránh trùng nội dung
    html = html.replace("</title>", '</title>\n  <link rel="canonical" href="' + slug + '/">', 1)
    html = html.replace("<!doctype html>\n", "<!doctype html>\n" + NOTE.format(slug=slug), 1)
    (ROOT / (slug + ".html")).write_text(html, encoding="utf-8")
    print("đã sinh", slug + ".html")

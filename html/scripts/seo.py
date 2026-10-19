#!/usr/bin/env python3
"""Sinh khối SEO trong <head> của mỗi trang + robots.txt + sitemap.xml.

URL chuẩn của mỗi trang là /slug/ (file slug/index.html), không có
/slug.html hay /slug. Khối nằm giữa <!-- SEO --> ... <!-- /SEO -->, chạy
lại bao nhiêu lần cũng được:  python3 scripts/seo.py
Sửa tiêu đề / mô tả trong PAGES bên dưới, đừng sửa tay trong file HTML.
"""
import datetime
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://dautucungvu.com"
NAME = "Đầu tư cùng Vũ"
IMAGE = SITE + "/assets/img/vu.jpg"
LOGO = SITE + "/assets/img/vu-128.jpg"

# slug, title, description, loại trang schema.org, có index không
PAGES = [
    ("", "Đầu tư cùng Vũ | Học đầu tư chứng khoán từ con số 0",
     "Học đầu tư chứng khoán từ cơ bản đến nâng cao, đọc tin thị trường mỗi ngày và mở tài khoản chứng khoán nhanh chóng.",
     "WebPage", True),
    ("khoa-hoc", "Khóa học đầu tư chứng khoán | Đầu tư cùng Vũ",
     "Lộ trình 5 cấp độ: từ người mới bắt đầu đến tự xây dựng danh mục đầu tư.",
     "CollectionPage", True),
    ("mo-tai-khoan", "Mở tài khoản chứng khoán online | Đầu tư cùng Vũ",
     "Mở tài khoản chứng khoán online trong 5 phút với eKYC. Miễn phí giao dịch 15 ngày đầu và nhận trọn bộ khóa học.",
     "WebPage", True),
    ("tin-tuc", "Tin tức chứng khoán theo mã cổ phiếu | Đầu tư cùng Vũ",
     "Tin tức, phân tích kỹ thuật và phân tích cơ bản gắn với từng mã cổ phiếu bạn quan tâm.",
     "CollectionPage", True),
    ("bai-viet", "Bài viết | Đầu tư cùng Vũ",
     "Tin tức và nhận định thị trường chứng khoán từ Đầu tư cùng Vũ.",
     "WebPage", True),
    ("premium", "Gói hội viên | Đầu tư cùng Vũ",
     "Gói hội viên Đầu tư cùng Vũ: nhận định thị trường, bài viết độc quyền và video hội viên, từ 68.000đ/tháng.",
     "WebPage", True),
    ("thanh-toan", "Thanh toán | Đầu tư cùng Vũ",
     "Thanh toán gói hội viên và khóa học Đầu tư cùng Vũ bằng chuyển khoản QR.",
     "CheckoutPage", False),
    ("dashboard", "Tổng quan | Đầu tư cùng Vũ",
     "Trang tổng quan tài khoản thành viên Đầu tư cùng Vũ: khóa học, hội viên và đơn thanh toán.",
     "ProfilePage", False),
]


def page_url(slug):
    return SITE + "/" + (slug + "/" if slug else "")


def jsonld(slug, title, desc, kind):
    url = page_url(slug)
    org = {"@type": "Organization", "@id": SITE + "/#organization", "name": NAME,
           "url": SITE + "/", "logo": {"@type": "ImageObject", "url": LOGO}}
    website = {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/", "name": NAME,
               "inLanguage": "vi-VN", "publisher": {"@id": SITE + "/#organization"}}
    page = {"@type": kind, "@id": url + "#webpage", "url": url, "name": title,
            "description": desc, "inLanguage": "vi-VN",
            "isPartOf": {"@id": SITE + "/#website"},
            "primaryImageOfPage": {"@type": "ImageObject", "url": IMAGE}}
    graph = [org, website, page]
    if slug:
        page["breadcrumb"] = {"@id": url + "#breadcrumb"}
        graph.append({"@type": "BreadcrumbList", "@id": url + "#breadcrumb", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Trang chủ", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": title.split(" | ")[0], "item": url},
        ]})
    data = {"@context": "https://schema.org", "@graph": graph}
    return json.dumps(data, ensure_ascii=False, indent=2).replace("</", "<\\/")


def head_block(slug, title, desc, kind, index):
    url = page_url(slug)
    t, d = html.escape(title), html.escape(desc)
    lines = [
        "<!-- SEO (sinh bởi scripts/seo.py) -->",
        f"<title>{t}</title>",
        f'<meta name="description" content="{d}">',
        f'<meta name="robots" content="{"index, follow, max-image-preview:large" if index else "noindex, follow"}">',
        f'<link rel="canonical" href="{url}">',
        f'<link rel="alternate" hreflang="vi-VN" href="{url}">',
        f'<meta name="author" content="{NAME}">',
        f'<meta property="og:type" content="website">',
        f'<meta property="og:site_name" content="{NAME}">',
        f'<meta property="og:locale" content="vi_VN">',
        f'<meta property="og:title" content="{t}">',
        f'<meta property="og:description" content="{d}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{IMAGE}">',
        '<meta property="og:image:width" content="640">',
        '<meta property="og:image:height" content="640">',
        f'<meta property="og:image:alt" content="{NAME}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{t}">',
        f'<meta name="twitter:description" content="{d}">',
        f'<meta name="twitter:image" content="{IMAGE}">',
        '<script type="application/ld+json">',
        jsonld(slug, title, desc, kind),
        "</script>",
        "<!-- /SEO -->",
    ]
    return "\n".join("  " + l for l in lines)


for slug, title, desc, kind, index in PAGES:
    path = ROOT / slug / "index.html" if slug else ROOT / "index.html"
    src = path.read_text(encoding="utf-8")
    block = head_block(slug, title, desc, kind, index)
    if "<!-- SEO" in src:
        src = re.sub(r"  <!-- SEO.*?<!-- /SEO -->", lambda _: block, src, flags=re.S)
    else:
        # bỏ title/description cũ, chèn khối mới sau viewport
        src = re.sub(r"  <title>.*?</title>\n", "", src, count=1)
        src = re.sub(r'  <meta name="description"[^>]*>\n', "", src, count=1)
        src = re.sub(r'(<meta name="viewport"[^>]*>\n)', lambda m: m.group(1) + block + "\n", src, count=1)
    path.write_text(src, encoding="utf-8")
    print("SEO:", path.relative_to(ROOT))

today = datetime.date.today().isoformat()
urls = "".join(
    f"  <url>\n    <loc>{page_url(s)}</loc>\n    <lastmod>{today}</lastmod>\n"
    f"    <changefreq>{'daily' if s in ('', 'tin-tuc') else 'weekly'}</changefreq>\n"
    f"    <priority>{'1.0' if not s else '0.8'}</priority>\n  </url>\n"
    for s, _, _, _, index in PAGES if index and s != "bai-viet"  # bài viết mở theo ?id=, không có URL tĩnh
)
(ROOT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "</urlset>\n",
    encoding="utf-8")
(ROOT / "robots.txt").write_text(
    "User-agent: *\nAllow: /\n"
    "Disallow: /scripts/\nDisallow: /design-crops/\n\n"
    f"Sitemap: {SITE}/sitemap.xml\n", encoding="utf-8")
print("đã sinh sitemap.xml, robots.txt")

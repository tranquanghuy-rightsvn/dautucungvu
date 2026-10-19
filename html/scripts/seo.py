#!/usr/bin/env python3
"""Sinh khối SEO trong <head>, trang bài viết, robots.txt và sitemap.xml.

URL chuẩn: /slug/ (file slug/index.html), không có /slug.html, /slug hay ?id=.
  - Trang thường: khối SEO nằm giữa <!-- SEO --> ... <!-- /SEO -->.
  - Bài viết: mỗi bài trong news (assets/js/data.js) sinh ra
    bai-viet/<slug>/index.html từ scripts/article-template.html.
Chạy lại sau mỗi lần sửa trang / thêm bài:  python3 scripts/seo.py  (cần node)
Sửa tiêu đề / mô tả trang trong PAGES bên dưới, đừng sửa tay trong file HTML.
"""
import datetime
import html
import json
import pathlib
import re
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://dautucungvu.com"
NAME = "Đầu tư cùng Vũ"
IMAGE = SITE + "/assets/img/vu.jpg"
LOGO = SITE + "/assets/img/vu-128.jpg"
TEMPLATE = ROOT / "scripts" / "article-template.html"

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

ORG = {"@type": "Organization", "@id": SITE + "/#organization", "name": NAME,
       "url": SITE + "/", "logo": {"@type": "ImageObject", "url": LOGO}}
WEBSITE = {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/", "name": NAME,
           "inLanguage": "vi-VN", "publisher": {"@id": SITE + "/#organization"}}


def page_url(slug):
    return SITE + "/" + (slug + "/" if slug else "")


def breadcrumb(url, trail):
    return {"@type": "BreadcrumbList", "@id": url + "#breadcrumb", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": name, "item": item}
        for i, (name, item) in enumerate([("Trang chủ", SITE + "/")] + trail)]}


def webpage(url, title, desc, kind, crumbs):
    page = {"@type": kind, "@id": url + "#webpage", "url": url, "name": title,
            "description": desc, "inLanguage": "vi-VN",
            "isPartOf": {"@id": SITE + "/#website"},
            "primaryImageOfPage": {"@type": "ImageObject", "url": IMAGE}}
    if crumbs:
        page["breadcrumb"] = {"@id": url + "#breadcrumb"}
    return page


def dump(graph):
    data = {"@context": "https://schema.org", "@graph": graph}
    return json.dumps(data, ensure_ascii=False, indent=2).replace("</", "<\\/")


def head_block(url, title, desc, index, graph, og_type="website", extra=()):
    t, d = html.escape(title), html.escape(desc)
    lines = [
        "<!-- SEO (sinh bởi scripts/seo.py) -->",
        f"<title>{t}</title>",
        f'<meta name="description" content="{d}">',
        f'<meta name="robots" content="{"index, follow, max-image-preview:large" if index else "noindex, follow"}">',
        f'<link rel="canonical" href="{url}">',
        f'<link rel="alternate" hreflang="vi-VN" href="{url}">',
        f'<meta name="author" content="{NAME}">',
        f'<meta property="og:type" content="{og_type}">',
        f'<meta property="og:site_name" content="{NAME}">',
        '<meta property="og:locale" content="vi_VN">',
        f'<meta property="og:title" content="{t}">',
        f'<meta property="og:description" content="{d}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{IMAGE}">',
        '<meta property="og:image:width" content="640">',
        '<meta property="og:image:height" content="640">',
        f'<meta property="og:image:alt" content="{NAME}">',
        *extra,
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{t}">',
        f'<meta name="twitter:description" content="{d}">',
        f'<meta name="twitter:image" content="{IMAGE}">',
        '<script type="application/ld+json">',
        dump(graph),
        "</script>",
        "<!-- /SEO -->",
    ]
    return "\n".join("  " + l for l in lines)


def put_head(src, block):
    if "<!-- SEO" in src:
        return re.sub(r"  <!-- SEO.*?<!-- /SEO -->", lambda _: block, src, flags=re.S)
    # bỏ title/description cũ, chèn khối mới sau viewport
    src = re.sub(r"  <title>.*?</title>\n", "", src, count=1)
    src = re.sub(r'  <meta name="description"[^>]*>\n', "", src, count=1)
    return re.sub(r'(<meta name="viewport"[^>]*>\n)', lambda m: m.group(1) + block + "\n", src, count=1)


def load_data():
    js = "global.window={};require(%s);process.stdout.write(JSON.stringify(window.APP_DATA))"
    out = subprocess.run(["node", "-e", js % json.dumps(str(ROOT / "assets/js/data.js"))],
                         check=True, capture_output=True, text=True).stdout
    return json.loads(out)


# ---------- Trang thường ----------
sitemap = []
today = datetime.date.today().isoformat()
for slug, title, desc, kind, index in PAGES:
    url = page_url(slug)
    crumbs = [(title.split(" | ")[0], url)] if slug else []
    graph = [ORG, WEBSITE, webpage(url, title, desc, kind, crumbs)]
    if crumbs:
        graph.append(breadcrumb(url, crumbs))
    path = ROOT / slug / "index.html" if slug else ROOT / "index.html"
    path.write_text(put_head(path.read_text(encoding="utf-8"), head_block(url, title, desc, index, graph)), encoding="utf-8")
    print("SEO:", path.relative_to(ROOT))
    if index:
        sitemap.append((url, today, "daily" if slug in ("", "tin-tuc") else "weekly", "1.0" if not slug else "0.8"))

# ---------- Bài viết: bai-viet/<slug>/index.html ----------
data = load_data()
tag_labels = {t["id"]: t["label"] for t in data["newsTags"]}
slugs = [n.get("slug") for n in data["news"]]
bad = [n["id"] for n in data["news"] if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", n.get("slug") or "")]
dup = {s for s in slugs if slugs.count(s) > 1}
if bad or dup:
    raise SystemExit(f"slug bài viết sai (id {bad}) hoặc trùng ({sorted(dup)}), sửa trong assets/js/data.js")

template = TEMPLATE.read_text(encoding="utf-8").replace('="../', '="../../')
for n in data["news"]:
    url = page_url("bai-viet/" + n["slug"])
    title = n["title"] + " | " + NAME
    desc = n["excerpt"]
    published = n["date"].replace(" ", "T") + ":00+07:00"
    free = n["access"] == "public"
    topic = next((t for t in n["tags"] if t in tag_labels), None)
    crumbs = [("Tin tức", page_url("tin-tuc")), (n["title"], url)]
    article = {"@type": "NewsArticle", "@id": url + "#article", "headline": n["title"][:110],
               "description": desc, "image": [IMAGE], "datePublished": published,
               "dateModified": published, "inLanguage": "vi-VN",
               "author": {"@id": SITE + "/#organization"}, "publisher": {"@id": SITE + "/#organization"},
               "mainEntityOfPage": {"@id": url + "#webpage"},
               "keywords": [tag_labels.get(t, t) for t in n["tags"]],
               "isAccessibleForFree": free}
    if topic:
        article["articleSection"] = tag_labels[topic]
    if not free:
        article["hasPart"] = {"@type": "WebPageElement", "isAccessibleForFree": False,
                              "cssSelector": ".article-body"}
    graph = [ORG, WEBSITE, webpage(url, title, desc, "WebPage", crumbs), article, breadcrumb(url, crumbs)]
    extra = [f'<meta property="article:published_time" content="{published}">',
             f'<meta property="article:section" content="{html.escape(tag_labels.get(topic, "Tin tức"))}">',
             *(f'<meta property="article:tag" content="{html.escape(tag_labels.get(t, t))}">' for t in n["tags"])]
    src = put_head(template, head_block(url, title, desc, True, graph, "article", extra))
    # Nội dung có sẵn trong HTML cho công cụ tìm kiếm; article.js vẽ lại đầy đủ theo quyền xem
    paras = (n.get("body") or [n["excerpt"]]) if free else [n["excerpt"]]
    body = ('<nav class="crumbs" aria-label="Đường dẫn"><a href="../../tin-tuc/">Tin tức</a></nav>'
            f'<h1>{html.escape(n["title"])}</h1>'
            f'<p class="article-meta"><time datetime="{n["date"].replace(" ", "T")}">{n["date"][8:10]}/{n["date"][5:7]}/{n["date"][:4]}</time></p>'
            f'<div class="article-body{"" if free else " is-teaser"}">' + "".join(f"<p>{html.escape(p)}</p>" for p in paras) + "</div>")
    src = src.replace('<body data-page="news">', f'<body data-page="news" data-slug="{n["slug"]}">', 1)
    src = src.replace('<article class="article" data-article aria-live="polite"></article>',
                      f'<article class="article" data-article aria-live="polite">{body}</article>', 1)
    out = ROOT / "bai-viet" / n["slug"] / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(src, encoding="utf-8")
    sitemap.append((url, n["date"][:10], "monthly", "0.6"))
print("đã sinh", len(data["news"]), "bài viết trong bai-viet/")

# xoá trang của bài đã bị xoá / đổi slug
for d in (ROOT / "bai-viet").iterdir():
    if d.is_dir() and d.name not in slugs:
        shutil.rmtree(d)
        print("đã xoá bài cũ:", d.name)

# ---------- sitemap.xml, robots.txt ----------
(ROOT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url>\n    <loc>{u}</loc>\n    <lastmod>{m}</lastmod>\n"
              f"    <changefreq>{c}</changefreq>\n    <priority>{p}</priority>\n  </url>\n"
              for u, m, c, p in sitemap)
    + "</urlset>\n", encoding="utf-8")
(ROOT / "robots.txt").write_text(
    "User-agent: *\nAllow: /\n"
    "Disallow: /scripts/\nDisallow: /design-crops/\n\n"
    f"Sitemap: {SITE}/sitemap.xml\n", encoding="utf-8")
print("đã sinh sitemap.xml, robots.txt")

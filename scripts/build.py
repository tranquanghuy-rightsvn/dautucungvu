#!/usr/bin/env python3
"""Build site tĩnh html/ từ data/*.json (nguồn chân lý do CMS ghi) — xem GAS.md mục VIII.

URL chuẩn: /slug/ (file slug/index.html), không có /slug.html, /slug hay ?params.
  - html/assets/js/data.js: SINH từ data/ (CHỈ dữ liệu công khai), JS trên site đọc file này.
  - Trang thường: khối SEO nằm giữa <!-- SEO --> ... <!-- /SEO -->.
  - Sinh các trang tĩnh:
      bai-viet/<slug>/              mỗi bài (khung templates/article.html)
      khoa-hoc/<id>/[<slug-bài>/]   mỗi khóa (bài 1 ở trang khóa), mỗi bài học; khoa-hoc/mien-phi|co-phi|cua-toi/
      tin-tuc/<chủ đề>/, tin-tuc/<mã viết thường>/
      thanh-toan/goi-<n>-thang/, thanh-toan/<id khóa có phí>/
    JS đọc trạng thái từ <body data-*> của trang.
Chạy (từ gốc repo, chỉ cần Python 3, không dependency):  python3 scripts/build.py
Sửa tiêu đề / mô tả trang trong PAGES bên dưới, đừng sửa tay trong file HTML.
"""
import datetime
import html
import json
import pathlib
import re
import shutil

REPO = pathlib.Path(__file__).resolve().parent.parent
ROOT = REPO / "html"  # thư mục site được deploy
DATA = REPO / "data"
SITE = "https://dautucungvu.com"
NAME = "Đầu tư cùng Vũ"
# Ảnh site tuỳ biến trong CMS (Cài đặt -> Ảnh site, GAS.md II.D): og = ảnh chia sẻ mặc định,
# brand = logo (JSON-LD Organization), favicon, hero (ảnh chân dung trang chủ)
SITE_IMAGES = json.loads((DATA / "settings.json").read_text(encoding="utf-8")).get("images", {})
DEFAULT_OG = "assets/img/vu.jpg"  # ảnh gốc, biết kích thước 640x640
IMAGE = SITE + "/" + SITE_IMAGES.get("og", DEFAULT_OG)
LOGO = SITE + "/" + SITE_IMAGES.get("brand", "assets/img/vu-128.jpg")
TEMPLATE = REPO / "templates" / "article.html"

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
    ("tai-khoan/xac-minh-email", "Xác minh email | Đầu tư cùng Vũ",
     "Xác minh email tài khoản Đầu tư cùng Vũ.", "WebPage", False),
    ("tai-khoan/dat-lai-mat-khau", "Đặt lại mật khẩu | Đầu tư cùng Vũ",
     "Đặt lại mật khẩu tài khoản Đầu tư cùng Vũ.", "WebPage", False),
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


def head_block(url, title, desc, index, graph, og_type="website", extra=(), image=IMAGE):
    t, d = html.escape(title), html.escape(desc)
    # Ảnh mặc định (vu.jpg) biết kích thước 640x640; ảnh bìa bài viết thì không khai kích thước
    size = ['<meta property="og:image:width" content="640">',
            '<meta property="og:image:height" content="640">'] if image.endswith("/" + DEFAULT_OG) else []
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
        f'<meta property="og:image" content="{image}">',
        *size,
        f'<meta property="og:image:alt" content="{t if image != IMAGE else NAME}">',
        *extra,
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{t}">',
        f'<meta name="twitter:description" content="{d}">',
        f'<meta name="twitter:image" content="{image}">',
        '<script type="application/ld+json">',
        dump(graph),
        "</script>",
        "<!-- /SEO -->",
    ]
    return "\n".join("  " + l for l in lines)


def patch_images(src):
    """Favicon (mọi trang, đường dẫn tuyệt đối) + ảnh chân dung trang chủ theo Cài đặt."""
    fav = SITE_IMAGES.get("favicon")
    if fav:
        src = re.sub(r'<link rel="icon" href="[^"]*" type="image/[a-z+]+">',
                     f'<link rel="icon" href="/{fav}" type="image/jpeg">', src)
    hero = SITE_IMAGES.get("hero")
    if hero:
        src = re.sub(r'(<figure class="hero-portrait">\s*<img src=")[^"]*(")', lambda m: m.group(1) + hero + m.group(2), src)
    return src


def put_head(src, block):
    if "<!-- SEO" in src:
        return re.sub(r"  <!-- SEO.*?<!-- /SEO -->", lambda _: block, src, flags=re.S)
    # bỏ title/description cũ, chèn khối mới sau viewport
    src = re.sub(r"  <title>.*?</title>\n", "", src, count=1)
    src = re.sub(r'  <meta name="description"[^>]*>\n', "", src, count=1)
    return re.sub(r'(<meta name="viewport"[^>]*>\n)', lambda m: m.group(1) + block + "\n", src, count=1)


def read_json(rel):
    return json.loads((DATA / rel).read_text(encoding="utf-8"))


def load_data():
    """Gộp data/*.json thành đúng cấu trúc window.APP_DATA mà JS trên site đang dùng."""
    settings = read_json("settings.json")
    # Giá / chỉ số KHÔNG nằm trong data.js: trình duyệt tải số thật từ /api/market (GAS.md II.E)
    news = [read_json(f"news/{p['slug']}.json") for p in read_json("posts.json")]
    site = {k: v for k, v in settings.items() if k not in ("brokers", "newsTags", "indices", "tickers")}
    return {
        "site": site,
        "indices": settings["indices"],
        "tickers": settings["tickers"],
        # Khóa đang Ẩn (CMS) không lên site: không trang, không sitemap, không data.js
        "courses": [c for c in read_json("courses.json") if not c.get("hidden")],
        "newsTags": settings["newsTags"],
        "news": news,
        "brokers": settings["brokers"],
    }


def write_data_js(data):
    # Thân bài (content_html) đã có sẵn trong trang bai-viet/<slug>/ — không nhồi vào data.js
    # vốn được tải ở MỌI trang (danh sách tin chỉ cần meta + tóm tắt).
    data = {**data, "news": [{k: v for k, v in n.items() if k != "content_html"} for n in data["news"]]}
    js = ("/* TỰ SINH bởi scripts/build.py từ data/*.json — KHÔNG sửa tay, sửa trong CMS.\n"
          "   Chỉ chứa dữ liệu công khai (repo + site đều public). */\n"
          "window.APP_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
    (ROOT / "assets/js/data.js").write_text(js, encoding="utf-8")
    print("đã sinh assets/js/data.js")


data = load_data()
write_data_js(data)
# Danh mục giá + quyền xem cho Worker (tạo đơn, /api/content) — Worker KHÔNG tin số tiền từ
# trình duyệt mà tính lại từ file này (GAS.md VI.2). Chỉ chứa thông tin công khai.
(ROOT / "assets/catalog.json").write_text(json.dumps({
    "membership": data["site"]["membership"],
    "payment": {k: data["site"]["payment"].get(k, "") for k in ("bankId", "bankName", "accountNo", "accountName")},
    # access + bài học (slug, học thử) để Worker kiểm quyền phát video /api/video/<khóa>/<bài> (GAS.md II.C)
    "courses": [{"id": c["id"], "title": c["title"], "price": c["price"], "access": c.get("access") or "public",
                 "lessons": [{"slug": l["slug"], **({"preview": True} if l.get("preview") else {})} for l in c["lessons"]]}
                for c in data["courses"]],
    "articles": {n["slug"]: n["access"] for n in data["news"]},
}, ensure_ascii=False) + "\n", encoding="utf-8")
# Danh sách mã cho Worker /api/market (GAS.md II.E) — admin sửa mã / chỉ số trong Cài đặt là tự theo
(ROOT / "assets/market-symbols.json").write_text(json.dumps({
    "tickers": [t["code"] for t in data["tickers"]],
    "indices": [i["code"] for i in data["indices"]],
}, ensure_ascii=False) + "\n", encoding="utf-8")

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
    path.write_text(patch_images(put_head(path.read_text(encoding="utf-8"), head_block(url, title, desc, index, graph))), encoding="utf-8")
    print("SEO:", path.relative_to(ROOT))
    if index:
        sitemap.append((url, today, "daily" if slug in ("", "tin-tuc") else "weekly", "1.0" if not slug else "0.8"))

# ---------- Bài viết: bai-viet/<slug>/index.html ----------
tag_labels = {t["id"]: t["label"] for t in data["newsTags"]}
slugs = [n.get("slug") for n in data["news"]]
bad = [n["id"] for n in data["news"] if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", n.get("slug") or "")]
dup = {s for s in slugs if slugs.count(s) > 1}
if bad or dup:
    raise SystemExit(f"slug bài viết sai (id {bad}) hoặc trùng ({sorted(dup)}), sửa trong data/")

template = patch_images(TEMPLATE.read_text(encoding="utf-8").replace('="../', '="../../'))
for n in data["news"]:
    url = page_url("bai-viet/" + n["slug"])
    title = n["title"] + " | " + NAME
    desc = n["excerpt"]
    published = n["date"].replace(" ", "T") + ":00+07:00"
    free = n["access"] == "public"
    # Ảnh bìa do CMS tải lên (html/images/news/<slug>/cover.jpg); bài cũ chưa có thì dùng ảnh mặc định
    image = SITE + "/" + n["cover"] if n.get("cover") else IMAGE
    topic = next((t for t in n["tags"] if t in tag_labels), None)
    crumbs = [("Tin tức", page_url("tin-tuc")), (n["title"], url)]
    article = {"@type": "NewsArticle", "@id": url + "#article", "headline": n["title"][:110],
               "description": desc, "image": [image], "datePublished": published,
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
    src = put_head(template, head_block(url, title, desc, True, graph, "article", extra, image))
    # Nội dung có sẵn trong HTML (bot đọc được không cần JS). article.js GIỮ NGUYÊN khối
    # [data-article-body] này khi vẽ lại trang. Bài trả phí chỉ có tóm tắt — thân bài nằm ở
    # máy chủ, KHÔNG BAO GIỜ vào repo / HTML tĩnh (GAS.md mục 0, II.A.3).
    if free and n.get("content_html"):
        body_html = n["content_html"]
    else:
        paras = (n.get("body") or [n["excerpt"]]) if free else [n["excerpt"]]
        body_html = "".join(f"<p>{html.escape(p)}</p>" for p in paras)
    body = ('<nav class="crumbs" aria-label="Đường dẫn"><a href="../../tin-tuc/">Tin tức</a></nav>'
            f'<h1>{html.escape(n["title"])}</h1>'
            f'<p class="article-meta"><time datetime="{n["date"].replace(" ", "T")}">{n["date"][8:10]}/{n["date"][5:7]}/{n["date"][:4]}</time></p>'
            f'<div class="article-body{"" if free else " is-teaser"}" data-article-body>{body_html}</div>')
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

# ---------- Trang con: mỗi trạng thái (khóa, bài học, bộ lọc, chủ đề, mã CP, gói) là /.../slug/ ----------
def derive(base, out, title, desc, index, graph, attrs, h1=None, lead=None):
    """Sinh out/index.html từ base/index.html: sửa đường dẫn tương đối, <head>, <body data-*>, banner."""
    depth = out.count("/") + 1
    src = (ROOT / base / "index.html").read_text(encoding="utf-8").replace('="../', '="' + "../" * depth)
    src = put_head(src, head_block(page_url(out), title, desc, index, graph))
    data_attrs = "".join(f' data-{k}="{html.escape(str(v))}"' for k, v in attrs.items())
    src = re.sub(r"<body ([^>]*)>", lambda m: f"<body {m.group(1)}{data_attrs}>", src, count=1)
    if h1:
        src = re.sub(r"<h1>.*?</h1>(\s*)<p>.*?</p>",
                     lambda m: f"<h1>{html.escape(h1)}</h1>{m.group(1)}<p>{html.escape(lead or desc)}</p>", src, count=1, flags=re.S)
    path = ROOT / out / "index.html"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(src, encoding="utf-8")
    generated.setdefault(base, set()).add(out.split("/")[1])
    if index:
        sitemap.append((page_url(out), today, "weekly", "0.7"))


def collection(url, title, desc, crumbs, items):
    page = webpage(url, title, desc, "CollectionPage", crumbs)
    page["mainEntity"] = {"@type": "ItemList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "url": u, "name": name} for i, (u, name) in enumerate(items)]}
    return [ORG, WEBSITE, page, breadcrumb(url, crumbs)]


generated = {}
courses, news_sorted = data["courses"], sorted(data["news"], key=lambda n: n["date"], reverse=True)
COURSES = page_url("khoa-hoc")

for c in courses:
    url = page_url("khoa-hoc/" + c["id"])
    mins = sum(l.get("m") or 0 for l in c["lessons"])
    title, crumbs = f"Khóa học {c['title']} | {NAME}", [("Khóa học", COURSES), (c["title"], url)]
    course_ld = {"@type": "Course", "@id": url + "#course", "name": c["title"], "description": c["desc"],
                 "url": url, "inLanguage": "vi-VN", "provider": {"@id": SITE + "/#organization"},
                 "isAccessibleForFree": not c["price"],
                 "offers": {"@type": "Offer", "price": c["price"], "priceCurrency": "VND",
                            "category": "Paid" if c["price"] else "Free", "url": url,
                            "availability": "https://schema.org/InStock"},
                 "hasCourseInstance": {"@type": "CourseInstance", "courseMode": "Online",
                                       "courseWorkload": f"PT{mins}M"},
                 "syllabusSections": [{"@type": "Syllabus", "name": l["t"], **({"timeRequired": f"PT{l['m']}M"} if l.get("m") else {})}
                                      for l in c["lessons"]]}
    derive("khoa-hoc", "khoa-hoc/" + c["id"], title, c["desc"], True,
           [ORG, WEBSITE, webpage(url, title, c["desc"], "WebPage", crumbs), course_ld, breadcrumb(url, crumbs)],
           {"course": c["id"]}, c["title"], c["desc"])
    for i, l in enumerate(c["lessons"][1:], start=2):
        # URL bài học theo slug (bất biến), không theo số thứ tự (đổi khi sắp xếp lại) — GAS.md II.B
        out = f"khoa-hoc/{c['id']}/{l['slug']}"
        lurl = page_url(out)
        ltitle = f"Bài {i}: {l['t']} | {c['title']} | {NAME}"
        ldesc = f"Bài {i}/{len(c['lessons'])} của khóa {c['title']}: {l['t']}."
        lcrumbs = crumbs + [(f"Bài {i}: {l['t']}", lurl)]
        # Trang bài học trùng nội dung với trang khóa: không index, vẫn cho bot đi theo link
        derive("khoa-hoc", out, ltitle, ldesc, False,
               [ORG, WEBSITE, webpage(lurl, ltitle, ldesc, "WebPage", lcrumbs), breadcrumb(lurl, lcrumbs)],
               {"course": c["id"], "lesson": i}, c["title"], c["desc"])

for f, slug, label, index, keep in [("free", "mien-phi", "Khóa học đầu tư chứng khoán miễn phí", True, lambda c: not c["price"]),
                                    ("paid", "co-phi", "Khóa học đầu tư chứng khoán có phí", True, lambda c: c["price"]),
                                    ("mine", "cua-toi", "Khóa học của tôi", False, lambda c: False)]:
    url, title = page_url("khoa-hoc/" + slug), f"{label} | {NAME}"
    items = [c for c in courses if keep(c)]
    desc = (f"{label}: " + ", ".join(c["title"] for c in items) + ".") if items else "Khóa học bạn đã mua và tiến độ học tại Đầu tư cùng Vũ."
    derive("khoa-hoc", "khoa-hoc/" + slug, title, desc, index,
           collection(url, title, desc, [("Khóa học", COURSES), (label, url)],
                      [(page_url("khoa-hoc/" + c["id"]), c["title"]) for c in items]),
           {"filter": f}, label, desc)

NEWS = page_url("tin-tuc")
for kind, key, label, h1, title, desc in (
        [("tag", t["id"], t["label"], t["label"], f"{t['label']} | Tin tức chứng khoán | {NAME}",
          f"Tổng hợp tin {t['label'].lower()} mới nhất trên thị trường chứng khoán Việt Nam, cập nhật mỗi ngày tại {NAME}.")
         for t in data["newsTags"]] +
        [("ticker", t["code"], t["code"], f"Tin tức cổ phiếu {t['code']}", f"Tin tức cổ phiếu {t['code']} ({t['name']}) | {NAME}",
          f"Tin tức, kết quả kinh doanh, cổ tức và phân tích cổ phiếu {t['code']} – {t['name']}, mới nhất lên đầu.")
         for t in data["tickers"]]):
    out = "tin-tuc/" + key.lower()
    url = page_url(out)
    items = [(page_url("bai-viet/" + n["slug"]), n["title"]) for n in news_sorted if key in n["tags"]]
    # Mã chưa có bài nào thì không index (trang rỗng)
    derive("tin-tuc", out, title, desc, bool(items),
           collection(url, title, desc, [("Tin tức", NEWS), (label, url)], items),
           {kind: key}, h1, desc)

for m in data["site"]["membership"]["months"]:
    title = f"Thanh toán gói hội viên {m} tháng | {NAME}"
    desc = f"Thanh toán gói hội viên Đầu tư cùng Vũ {m} tháng bằng chuyển khoản QR."
    url = page_url(f"thanh-toan/goi-{m}-thang")
    derive("thanh-toan", f"thanh-toan/goi-{m}-thang", title, desc, False,
           [ORG, WEBSITE, webpage(url, title, desc, "CheckoutPage", [])], {"plan": m})
for c in courses:
    if not c["price"]:
        continue
    title = f"Thanh toán khóa học {c['title']} | {NAME}"
    desc = f"Thanh toán khóa học {c['title']} bằng chuyển khoản QR."
    url = page_url("thanh-toan/" + c["id"])
    derive("thanh-toan", "thanh-toan/" + c["id"], title, desc, False,
           [ORG, WEBSITE, webpage(url, title, desc, "CheckoutPage", [])], {"course": c["id"]})

# xoá trang con không còn trong dữ liệu (khóa / chủ đề / mã bị xoá hoặc đổi id)
for base, names in generated.items():
    for d in (ROOT / base).iterdir():
        if d.is_dir() and d.name not in names:
            shutil.rmtree(d)
            print("đã xoá trang cũ:", f"{base}/{d.name}")
for c in courses:  # bài học bị xoá / URL kiểu cũ bai-<n>
    keep = {l["slug"] for l in c["lessons"][1:]}
    for d in (ROOT / "khoa-hoc" / c["id"]).iterdir():
        if d.is_dir() and d.name not in keep:
            shutil.rmtree(d)
            print("đã xoá trang cũ:", f"khoa-hoc/{c['id']}/{d.name}")
print("đã sinh", sum(len(v) for v in generated.values()), "nhóm trang con trong", ", ".join(generated))

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
    # KHÔNG khai /admin/ ở đây: robots.txt công khai, khai ra là tự lộ đường dẫn quản trị, và
    # chặn crawl thì Google không đọc được noindex (skill static-site-build.md mục 6b).
    "Disallow: /api/\n\n"
    f"Sitemap: {SITE}/sitemap.xml\n", encoding="utf-8")
print("đã sinh sitemap.xml, robots.txt")

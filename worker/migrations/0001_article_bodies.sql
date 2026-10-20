-- Thân bài của bài viết TRẢ PHÍ (quyền user / member / vip). Bài public lưu thân bài trong repo
-- (data/news/<slug>.json); bài trả phí thì KHÔNG BAO GIỜ — chỉ ở đây (GAS.md mục 0, II.A.3).
CREATE TABLE article_bodies (
  slug TEXT PRIMARY KEY,
  content_html TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);

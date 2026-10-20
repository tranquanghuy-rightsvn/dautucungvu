-- Bản dữ liệu thị trường gần nhất theo từng phần (quotes / intraday / history) — dùng khi nguồn
-- ngoài lỗi (GAS.md II.E). data = JSON.
CREATE TABLE market_snapshots (
  key TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  fetched_at TEXT NOT NULL
);

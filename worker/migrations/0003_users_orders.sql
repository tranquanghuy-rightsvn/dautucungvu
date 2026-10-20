-- Tài khoản người dùng website, phiên đăng nhập, mã trong email, đơn hàng, quyền khóa học,
-- giới hạn tần suất (GAS.md mục VI). Giờ lưu ISO UTC; member_until là NGÀY (giờ VN) còn hạn.

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,              -- chữ thường
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  pass_hash TEXT NOT NULL,                 -- pbkdf2$<vòng>$<salt b64>$<hash b64>
  email_verified_at TEXT,
  vip INTEGER NOT NULL DEFAULT 0,          -- tài khoản mở / chuyển ID >= 50 triệu (admin bật tay)
  member_until TEXT,                       -- 'YYYY-MM-DD', hội viên còn hạn tới hết ngày này
  locked INTEGER NOT NULL DEFAULT 0,
  reminded TEXT,                           -- '<member_until>:<7|1|0>' đã gửi email nhắc nào
  created_at TEXT NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,             -- SHA-256 của token trong cookie (không lưu token gốc)
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

CREATE TABLE email_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,                      -- 'verify' | 'reset'
  expires_at TEXT NOT NULL,
  used_at TEXT
);
CREATE INDEX email_tokens_user ON email_tokens(user_id);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,               -- nội dung chuyển khoản, vd 'DTCV HV3 K7Q2M'
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,                      -- 'member' | 'course' | 'grant' (kích hoạt tay)
  ref TEXT NOT NULL,                       -- số tháng hoặc id khóa học
  title TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | confirmed | cancelled | expired
  created_at TEXT NOT NULL,
  paid_reported_at TEXT,                   -- người mua bấm "Tôi đã chuyển khoản"
  confirmed_at TEXT,
  confirmed_by TEXT,
  cancelled_at TEXT,
  cancel_reason TEXT
);
CREATE INDEX orders_user ON orders(user_id);
CREATE INDEX orders_status ON orders(status);

CREATE TABLE course_access (
  user_id INTEGER NOT NULL,
  course_id TEXT NOT NULL,
  granted_at TEXT NOT NULL,
  order_id INTEGER,
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL                -- epoch giây
);

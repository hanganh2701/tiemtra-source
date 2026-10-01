-- Bảng xếp hạng chung (Cloudflare D1). Chạy: npx wrangler d1 execute tiemtra-bxh --remote --file=schema.sql
CREATE TABLE IF NOT EXISTS diem (
  id   TEXT PRIMARY KEY,         -- sha256 của khoá bí mật trên máy người chơi (máy chủ không giữ khoá)
  ten  TEXT NOT NULL,            -- tên tiệm lúc đạt lãi cao nhất
  lai  INTEGER NOT NULL,         -- lãi tích luỹ cao nhất của tiệm (đồng)
  ngay INTEGER NOT NULL,         -- ngày trong game lúc đạt lãi đó
  sao  REAL NOT NULL,
  ban  TEXT,                     -- phiên bản game
  tao  INTEGER NOT NULL,         -- lần gửi đầu (ms)
  sua  INTEGER NOT NULL,         -- lần gửi gần nhất (ms)
  rn   INTEGER NOT NULL,         -- ngày game của lần gửi gần nhất (lượt đang chơi)
  rn0  INTEGER NOT NULL,         -- ngày game lúc bắt đầu theo dõi lượt đang chơi
  rt0  INTEGER NOT NULL,         -- thời điểm bắt đầu theo dõi lượt đang chơi (ms)
  an   INTEGER NOT NULL DEFAULT 0 -- chủ dự án ẩn dòng gian lận: UPDATE diem SET an = 1 WHERE ten = '...'
);
CREATE INDEX IF NOT EXISTS diem_lai ON diem(an, lai DESC);

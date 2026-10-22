-- didate: thiệp và câu trả lời. Chạy: npx wrangler d1 execute didate --remote --file=schema.sql
-- Thời gian là mili giây (Date.now()). Không lưu địa chỉ IP.

CREATE TABLE IF NOT EXISTS thiep (
  id TEXT PRIMARY KEY,                 -- 8 ký tự a-z 2-9, cũng là đường dẫn didate.meomeo.app/<id>
  khoa TEXT NOT NULL,                  -- sha256 của khoá quản lý (người tạo giữ khoá, máy chủ chỉ giữ sha256)
  mau TEXT NOT NULL,                   -- an | to-tinh | xin-loi | sinh-nhat
  du_lieu TEXT NOT NULL,               -- JSON thiệp đã làm sạch (public/chung.js, lamSach)
  anh TEXT,                            -- JSON chỗ để ảnh (kho-anh.js), không có ảnh thì NULL
  anh_ver INTEGER NOT NULL DEFAULT 0,  -- tăng mỗi lần đổi ảnh, nằm trong link ảnh để bộ đệm lấy ảnh mới
  tao_luc INTEGER NOT NULL,
  sua_luc INTEGER NOT NULL,
  het_han INTEGER NOT NULL,            -- tạo + 90 ngày; dọn hằng ngày bằng cron
  mo_dau INTEGER,                      -- người nhận mở lần đầu
  mo_cuoi INTEGER,
  so_lan_mo INTEGER NOT NULL DEFAULT 0,
  tra_loi TEXT,                        -- JSON câu trả lời mới nhất (public/chung.js, lamSachTraLoi)
  tra_loi_luc INTEGER,
  bao_cao INTEGER NOT NULL DEFAULT 0,  -- không dùng nữa: thiệp bỏ nút báo thiệp xấu (22/10/2026)
  bao_cao_ly_do TEXT,                  -- không dùng nữa
  an INTEGER NOT NULL DEFAULT 0        -- 1 = chủ dự án đã gỡ, trang báo không có thiệp
);
CREATE INDEX IF NOT EXISTS thiep_het_han ON thiep (het_han);

-- ảnh khi KHO_ANH = "d1" (chạy thử trên máy, hoặc thôi dùng Telegram)
CREATE TABLE IF NOT EXISTS anh_d1 (
  ma TEXT PRIMARY KEY,
  du_lieu BLOB NOT NULL,
  kieu TEXT NOT NULL
);

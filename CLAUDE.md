# Tiệm Trà Nhỏ

Game mở tiệm trà sữa chạy trên trình duyệt (PWA), tiếng Việt. Dự án sở thích, không kinh doanh; mọi thứ chạy trên máy người chơi.

Đọc [docs/KE-HOACH.md](docs/KE-HOACH.md) trước khi làm: có các quyết định đã chốt, quy ước, trạng thái từng mốc. Làm xong việc nào thì đánh dấu ở đó trong cùng commit. Viết thoại theo [docs/NHAN-VAT.md](docs/NHAN-VAT.md).

- `index.html` là trang giới thiệu (tự viết, không nạp code game). Game ở `choi.html`.
- Không bước build: `choi.html` nạp `data/*.js`, rồi `src/*.js`, rồi `game.js` (script thường, dùng chung biến toàn cục). Hàm trong `src/` chỉ được gọi lúc chơi, không gọi hàm của `game.js` lúc nạp file.
- Test: `npm test`. Chạy thử: `python3 -m http.server 8765`. Mô phỏng tiền trong két theo nhánh: `node tools/mo-phong-kinh-te.mjs` (người chơi máy pha tức thì, chỉ để so nhánh); giống người chơi thật: `node tools/mo-phong-kinh-te.mjs nguoi`. Hình nhà xe trên trang giới thiệu lấy từ game: `node tools/hinh-gioi-thieu.mjs` (test báo khi cần chạy lại).
- Không thêm tính năng qua máy chủ, quảng cáo hay thanh toán.

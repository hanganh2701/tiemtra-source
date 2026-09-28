# Kế hoạch và trạng thái

File này là nguồn sự thật cho việc làm game. Mỗi phiên làm việc đọc file này trước, làm xong việc nào thì đánh dấu ở đây trong cùng commit.

- Kế hoạch đầy đủ (22 tuần, 28/09/2026 → 28/02/2027): https://claude.ai/artifact/1aDewbmnoQv3Xj8Vm99wDM
- Nghiên cứu phần 1 (tiệm trà thật, giữ chân người chơi, cốt truyện): https://claude.ai/artifact/3cHqvu5ksaau4dnt4ZAgu1
- Nghiên cứu phần 2 (lớn lên, chơi cùng bạn, pháp lý): https://claude.ai/artifact/ApKcmtAtm2e6BJMDysNtFN
- Nhân vật và giọng thoại: [NHAN-VAT.md](NHAN-VAT.md)

## Đã chốt (28/09/2026)

1. Làm như sở thích, không kinh doanh, không kiếm tiền.
2. Đội ngũ chỉ có Claude: code, truyện, tranh. Chủ dự án duyệt, chơi thử, gửi bản cho nhóm thử.
3. Tác giả gốc đã đồng ý cho làm tiếp.
4. Tranh: dùng lại tranh gốc cho nhân vật (`img/faces.webp`, mèo), vẽ vector cho icon và vật phẩm mới.
5. Nhóm chơi thử gồm học sinh, sinh viên, người đi làm.

Hệ quả: **không làm tính năng qua máy chủ** (bảng xếp hạng online, kết bạn, tặng quà qua mạng), không quảng cáo, không thanh toán. Mọi thứ chạy trên máy người chơi. Theo Nghị định 147/2024, game có máy chủ cho người chơi tương tác cần giấy phép mà chỉ doanh nghiệp xin được.

## Quy ước

- **Không bước build.** HTML, CSS, JS thuần. `index.html` nạp `data/*.js` rồi `game.js` bằng thẻ script thường; hằng số cấp cao dùng chung giữa các file.
- **Nội dung nằm trong `data/`:** changelog, khách, câu đánh giá, sự kiện, cốt truyện. Code nằm trong `game.js`.
- **Test:** `npm test` (Node + jsdom). Sửa lỗi nào thì thêm test cho lỗi đó. Không commit khi test đỏ.
- **CI:** GitHub Actions (`.github/workflows/test.yml`) chạy `npm test` cho mọi pull request và mỗi lần push lên `main`. Chỉ gộp khi CI xanh.
- **Chạy thử:** `python3 -m http.server 8765` rồi mở http://localhost:8765.
- **Phát hành:** làm trên nhánh riêng, test xanh, gộp vào `main`. GitHub Pages tự cập nhật (https://hanganh2701.github.io/tiemtra-source/). Tính năng mới lên vào thứ Năm; sửa lỗi gấp lên bất cứ lúc nào. Tuần Tết 01–07/02/2027 không phát hành.
- **Mỗi bản:** tăng `GAME_VERSION`, thêm mục lên đầu `CHANGELOG` trong `data/changelog.js` (người chơi thấy ở "Có gì mới"). Đổi cấu trúc bản lưu thì thêm bước nâng cấp trong `loadFrom`.
- **Đổi cấu hình chủ game** (`DEFAULT_CONFIG`) mà muốn áp cho người chơi cũ: thêm bước `if (!(CFG.cfgVer >= N))` và tăng `CFG_VER`.
- **Riêng tư:** đo lường chỉ đếm gộp, không mã định danh (`track()`, `TELE_URL`). Không gửi dữ liệu game đi đâu.
- **Commit:** tiếng Việt, dòng đầu ngắn gọn, thân liệt kê thay đổi người chơi thấy được.

## Trạng thái

### Mốc 0 · Nền móng (tuần 1–2, tới 11/10)

- [x] Tác giả gốc đồng ý (chủ dự án)
- [x] Gỡ sao lưu 8 số qua máy chủ tác giả gốc; chỉ còn mã dài và file
- [x] Tách nội dung ra `data/` (changelog, khách, đánh giá, sự kiện)
- [x] Bộ test Node + jsdom (`tests/`)
- [x] Đo lường chỉ đếm gộp, chưa gắn địa chỉ (`TELE_URL` rỗng)
- [x] Vẽ 21 icon SVG còn thiếu (`img/ic_*.svg`, danh sách trong `ICO_SVG`)
- [x] Bible nhân vật (`docs/NHAN-VAT.md`) và 6 cảnh Chương 0 (`data/cot-truyen.js`, chưa nối vào game)
- [ ] Chủ dự án lập nhóm chơi thử
- [ ] Chủ dự án tạo tài khoản GoatCounter nếu muốn có số liệu, rồi gắn vào `TELE_URL`

### Mốc 1 · Lý do quay lại ngày mai (tuần 3–6, bản 4.0 "Hẻm 42")

- [ ] Bộ máy mẩu chuyện: đọc `MAU_CHUYEN`, chọn theo điều kiện và ưu tiên, màn cảnh thoại, nút Bỏ qua kèm tóm tắt, Sổ tay xem lại, cài đặt Đầy đủ / Gọn / Tắt
- [ ] Nối Chương 0 vào game
- [ ] 3 khách quen (Linh, chú Tư, Khoa): thanh thân thiết, 3 cảnh mỗi người, Sổ khách quen, bảng tên phân biệt với khách ngẫu nhiên cùng khuôn mặt
- [ ] Thẻ "Ngày mai" ở tổng kết cuối ngày
- [ ] Mở khoá dày tới ngày 10; dời vay, thuế, sự cố mất tiền về sau ngày 10
- [ ] Phá sản mềm: bà Sáu cho khất một lần mỗi chương; giữ công thức và độ thân
- [ ] Sổ công thức 12 trang (trang 1–5 trong mốc này)
- [ ] Kỷ lục của tôi
- [ ] Chăm chút cảm giác pha (hạt bọt, tiếng dán nắp, rung, dấu chấm điểm)
- [ ] Chọn được gọi là anh hay chị khi đặt tên tiệm

### Mốc 2 · Chơi cùng bạn, không cần mạng (tuần 7–10, bản 4.1)

- [ ] Mô phỏng tất định (ngẫu nhiên có hạt giống, tiền số nguyên)
- [ ] Thử thách hôm nay, thẻ chia sẻ, mã tự kiểm chứng, bảng bạn bè trên máy
- [ ] Danh thiếp tiệm, bạn thành khách VIP
- [ ] BXH Phố Trà với tiệm máy
- [ ] Mưa đẩy đơn app, giá riêng trên app

### Mốc 3 · Lớn lên lần đầu và Tết (tuần 11–16)

- [ ] Bậc 2: mặt tiền đầu hẻm; nhân viên có đặc điểm, tâm trạng, trưởng ca
- [ ] Hết Chương 1; đơn nhóm
- [ ] Noel (21/12); "Tết ở Hẻm 42" lên trước 20/01/2027 (ông Táo 30/01, mùng 1 Tết 06/02)

### Mốc 4 · Gắn bó dài hạn (tuần 17–22)

- [ ] Chương 2, trang trí tiệm, thành tựu, chế độ Thư giãn, mời cài app
- [ ] Chi nhánh (chỉ khi qua cổng C3)

## Cổng quyết định

| Cổng | Ngày | Đi tiếp khi |
|---|---|---|
| C0 · Quyền | 28/09 | Đã qua |
| C1 · Người chơi có quay lại | 08/11 | ≥80% xong ngày 1, ≥20% quay lại hôm sau, <60% bỏ qua cảnh, <5% phá sản trước ngày 10 |
| C2 · Người chơi rủ bạn | 06/12 | ≥25% người chơi thử thách chia sẻ mỗi tuần, ≥7% quay lại sau 7 ngày |
| C3 · Người chơi muốn lớn lên | 17/01 | ≥40% người chạm ngày 30 mở mặt tiền và chơi tiếp ≥7 ngày |

## Việc còn để ý

- 50 logo tem thương hiệu trong `img/brand/` chưa có; game đang hiện emoji thay thế (`BRAND_EMO`). Vẽ ở mốc 3–4.
- Câu đánh giá "Cảm ơn nhân viên đã làm lại đúng ý mình" không bao giờ được chọn (khách bị làm sai luôn đánh giá tiêu cực). Giữ nguyên có chủ ý.

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

### Mốc 1 · Lý do quay lại ngày mai (bản 4.0 "Hẻm 42") — xong 28/09

- [x] Bộ máy mẩu chuyện (`src/truyen.js`): chọn theo điều kiện và ưu tiên, một cảnh mỗi ngày, Bỏ qua kèm tóm tắt, Sổ tay xem lại, chế độ Đầy đủ / Gọn / Tắt
- [x] Chương 0 trong game
- [x] 3 khách quen Linh, chú Tư, Khoa (`src/khach-quen.js`): bảng tên ♥, món quen, độ thân, 9 cảnh Chương 1, Sổ khách quen
- [x] Thẻ "Ngày mai" ở tổng kết cuối ngày
- [x] Quà mở khoá tới ngày 10 (`MO_KHOA`); khách khó chiều từ ngày 8, vay ngân hàng từ ngày 10 (sự cố mất tiền vốn đã từ ngày 11)
- [x] Phá sản mềm: bà Sáu cho khất một lần mỗi chương (`S.noSau`); phá sản thật giữ `S.tr`, `S.kl`, `S.xung`
- [x] Sổ công thức 12 trang có ưu đãi (`coTrang(n)`), trang 1–4 có trong Chương 0–1; món đặc trưng khi đủ 12 trang
- [x] Kỷ lục của tôi (`S.kl`)
- [x] Cảm giác pha (`src/cam-giac.js`): bọt khi rót, dấu Hoàn hảo, rung
- [x] Chọn anh hay chị (`S.xung`)

### Mốc 2 · Chơi cùng bạn, không cần mạng (bản 4.1) — xong 28/09

- [x] Thử thách hôm nay (`src/thu-thach.js`): đề 40 khách từ hạt giống theo ngày, trạng thái tạm không lưu
- [x] Mã chia sẻ TT1 tự kiểm chứng, bảng bạn bè trên máy (hôm nay, 7 ngày)
- [x] Danh thiếp tiệm QN1, bạn bè thành khách VIP (`src/pho-tra.js`)
- [x] BXH Phố Trà với 9 tiệm máy (`data/pho-tra.js`)
- [x] Mưa: đơn app nhiều nhưng có đơn bị huỷ vì thiếu tài xế; giá riêng trên app (`S.appMk`), phí sàn 25% (bước cấu hình 40)

Khác kế hoạch: thay vì làm cả mô phỏng chạy ra cùng kết quả rồi chơi lại toàn bộ lượt, mã ghi công thức từng ly và thời gian;
máy người nhận tạo lại đề và kiểm công thức, thời gian pha, luật 3 chỗ. Gọn hơn nhiều, vẫn chặn được mã bịa bằng mod.
Chưa làm ảnh chia sẻ vẽ bằng canvas (để mốc 4 cùng thẻ khoe tiệm).

### Mốc 3 · Lớn lên lần đầu và Tết (bản 4.2) — xong 28/09

- [x] Bậc 2 mặt tiền đầu hẻm (`src/lon-len.js`, `MAT_TIEN`, `S.buoc`, `S.hd`, `S.coc`)
- [x] Nhân viên có đặc điểm, tay nghề, tâm trạng, kèm cặp, tăng lương, trưởng ca (`src/nhan-vien.js`, `S.nv`, `S.truongCa`)
- [x] Hết Chương 1: mẹ gửi tiền, sang nhượng góc đầu hẻm, trang 5; khai trương mặt tiền
- [x] Đơn nhóm (`DON_NHOM`, `S.dnHom`)
- [x] Noel và "Tết ở Hẻm 42" theo lịch thật (`src/le-hoi.js`, `LICH_LE`); `window.__ngay` để thử ngày lễ khi test

Lịch lễ `LICH_LE` trong `src/truyen.js` có Tết và Trung Thu tới 2030; cảnh lễ có năm trong id (`le_noel_2026`, `le_tet_2027`), năm sau cần thêm cảnh mới.

### Mốc 4 · Gắn bó dài hạn (bản 4.3) — xong 28/09

- [x] Chương 2 Mùa trăng (trang 6–10): Hana và cô Hạnh thành khách quen, chuỗi Mây Tea (quản lý Vy), Trung Thu, chuyện ông bà Sáu
- [x] Chương 3 Về nhà ăn Tết (trang 11–12): Khoa ở lại Sài Gòn, mẹ lên thăm (`img/me.svg`), kết truyện `c3_ket`
- [x] Huy hiệu (`HUY_HIEU`, `S.huyHieu`) và mục tiêu tuần (`MUC_TIEU_TUAN`, `S.tuan`) trong `src/thanh-tich.js`; không có chuỗi ngày đăng nhập
- [x] Trang trí tiệm (`TRANG_TRI`, `S.tri`, `img/tt_*.svg`) và ảnh khoe tiệm vẽ bằng canvas (`src/trang-tri.js`)
- [x] Chế độ Thư giãn (`S.thuGian`, `thuGian()` trong `src/gan-bo.js`)
- [x] Mời cài lên màn hình chính từ ngày 4 (`moiCai()`); iPhone chỉ có hướng dẫn và nhắc dùng mã sao lưu vì bộ nhớ riêng
- [x] 50 logo tem thương hiệu vẽ bằng SVG (`data/logo.js`)
- [ ] Chi nhánh: hoãn. Chỉ làm khi qua cổng C3 (cần số liệu chơi thử: ≥40% người chạm ngày 30 mở mặt tiền và chơi tiếp ≥7 ngày)

Khác kế hoạch: ảnh chia sẻ thử thách (lưới màu) vẫn là chữ, chỉ thêm ảnh khoe tiệm. Game vẫn không dùng service worker
(tác giả gốc chủ động gỡ để tránh bản cũ bị kẹt trong bộ nhớ đệm); Chrome hiện không bắt buộc service worker để hiện lời mời cài.

## Cổng quyết định

| Cổng | Ngày | Đi tiếp khi |
|---|---|---|
| C0 · Quyền | 28/09 | Đã qua |
| C1 · Người chơi có quay lại | 08/11 | ≥80% xong ngày 1, ≥20% quay lại hôm sau, <60% bỏ qua cảnh, <5% phá sản trước ngày 10 |
| C2 · Người chơi rủ bạn | 06/12 | ≥25% người chơi thử thách chia sẻ mỗi tuần, ≥7% quay lại sau 7 ngày |
| C3 · Người chơi muốn lớn lên | 17/01 | ≥40% người chạm ngày 30 mở mặt tiền và chơi tiếp ≥7 ngày |

## Việc còn để ý

- Cảnh lễ gắn với năm (`le_noel_2026`, `le_ong_tao_2027`, `le_tet_2027`): mỗi năm cần viết thêm cảnh mới, không thì lễ vẫn có trang trí và hệ số nhưng không có chuyện.
- Câu đánh giá "Cảm ơn nhân viên đã làm lại đúng ý mình" không bao giờ được chọn (khách bị làm sai luôn đánh giá tiêu cực). Giữ nguyên có chủ ý.

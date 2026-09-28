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

Lịch lễ `LICH_LE` trong `src/truyen.js` có Tết và Trung Thu tới 2030. Từ bản 4.6 cảnh lễ lặp lại mỗi năm (`moiNam`, `thoaiLai`), xem mục Hoàn thiện.

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

### Ngã rẽ Hẻm 42 · đợt 1 (bản 4.4) — xong 28/09

Theo trang nghiên cứu "Ngã rẽ Hẻm 42". Chủ dự án chọn theo đề xuất: ngã rẽ cố định trong một lượt chơi, 4 ngã rẽ lớn chia hai đợt, có chọn bằng ly pha, không có kết xấu.

- [x] Bộ máy: ngã rẽ lớn (`reRe`) không bị Bỏ qua hay chế độ Tắt chọn thay; nhánh `T.nhanh`; điều kiện `nhanh`, `khongCo`, `xem`, `chuaXem`; hạn chót `chot` (`src/truyen.js`)
- [x] Ngã rẽ Mây Tea: `c2_nga_re`, nhánh A `may_a1–3`, `c2_ket_a`; nhánh B `may_b1–3`, `c2_ket`
- [x] Hệ quả trong cách chơi (`src/nga-re.js`): đơn sỉ 30 phần trân châu mỗi sáng (dòng bán `si`); 14 ngày phá giá; khách quen, tip theo nhánh
- [x] 4 kết (`KET_CUC`) theo ngã rẽ Mây Tea và video của Hana (đợt 2 thay bằng ngã rẽ Hana); hậu truyện 9 nhân vật (`HAU_TRUYEN`)
- [x] Sơ đồ ngã rẽ và kết đã thấy trong Sổ tay (`KL().reDaDi`, `KL().ket`, giữ qua phá sản)
- [x] Hồi âm cho 7 lựa chọn chưa được nhắc lại
- [x] Bản lưu cũ: đã xem `c2_ket` thì vào nhánh B; đã hết truyện thì ghi kết
- [x] Test mô phỏng 4 tổ hợp nhánh: đủ 12 trang, đúng kết, mọi cảnh có người thấy, quãng trống truyện tối đa 8 ngày

Khác đề xuất: trang 8 vẫn ở cảnh chung `c2_vy` trước ngã rẽ (làm bối cảnh cho lựa chọn), chỉ trang 10 tách theo nhánh.

### Ngã rẽ Hẻm 42 · đợt 2 (bản 4.5) — xong 28/09

- [x] Ngã rẽ Linh (`linh_3`, nhánh `linh_a1–2` cần đã thuê Linh, `linh_b1–2`), Hana (`hana_3`, `hana_a1–2`, `hana_b1–2`), Tết (`c3_vang`, nhánh A `que_1–3` có `nghi`, nhánh B `tet_b1`, `c3_me`)
- [x] Hệ quả trong cách chơi (`heSoKhachNhanh`, `heSoQuenNhanh`, `heSoTipNhanh`); Linh ở lại vào nghề 2/5; Linh đi Đà Lạt mở olong, tặng 20 phần; về quê nghỉ 3 ngày (`nghiMotNgay` dùng chung với nghỉ Tết theo lịch thật)
- [x] Kết truyện: trục video đổi sang ngã rẽ Hana (`T.nhanh.hana === "A"`); không thân với Hana thì coi như chưa lên video
- [x] Chọn bằng ly pha (`DON_TRUYEN`, `donTruyenDen`, `spawnTruyen`, `donTruyenKhop`, `donTruyenXong`): Linh trước giờ thi, chú Tư ngày mưa, Vy trước ngã rẽ Mây Tea; có câu hồi âm và hậu truyện
- [x] Hẻm 42 lần nữa (`choiLai`, `S.tr.luot`, `KL().daDoc`): giữ tên tiệm, huy hiệu, kỷ lục, sơ đồ, bạn bè; cảnh đã đọc hiện gọn; `lan2_meo`, `lan2_mo` chỉ có từ lượt 2
- [x] Ngã rẽ chỉ tính đã xem khi chọn xong (thoát giữa chừng thì hỏi lại); bản lưu cũ được xếp nhánh theo cờ đã có
- [x] Test mô phỏng đủ 16 tổ hợp ngã rẽ, thêm đường không thân Hana và lượt chơi thứ hai
- [ ] Chơi thử: người chơi có nhận ra lựa chọn được nhắc lại không, có muốn chơi lại không

Khác đề xuất: ngã rẽ Hana chỉ có khi đủ thân với Hana (cảnh `hana_3` cần độ thân 5); không có thì kết truyện tính như tiệm chưa lên video.
Chọn bằng ly pha làm 3 đơn, dùng mức đường thay cho “thêm trân châu mới nấu” vì game không có loại trân châu nấu sẵn để so.

### Hoàn thiện (bản 4.6) — xong 28/09

- [x] Góp ý cho đợt chơi thử (`src/gop-y.js`): câu hỏi ngắn, tóm tắt tiến trình không kèm tên tiệm, chép hoặc chia sẻ; mời một lần khi hết truyện
- [x] Cảnh lễ lặp mỗi năm: `le_noel`, `le_ong_tao`, `le_tet` (theo `quanhTet`), thêm `le_trung_thu`; bản lưu cũ chuyển id
- [x] Ảnh chia sẻ kết quả thử thách (`veAnhThuThach`, dùng chung `chiaSeAnh` với ảnh khoe tiệm)
- [x] Mô phỏng tiền trong két 70 ngày (`tools/mo-phong-kinh-te.mjs`) và cân lại nhánh

Kết quả mô phỏng (người chơi máy pha đúng mọi ly, nghìn đồng, ngày 70; mỗi lần chạy lệch nhau tới khoảng 5%):

| Tổ hợp | Két ngày 60 | Két ngày 70 |
|---|---|---|
| Bắt tay · Hana ghi tên · ở lại Tết | 121.734 | 147.476 |
| Bắt tay · Hana giữ kín · ở lại Tết | 120.565 | 147.035 |
| Giữ hẻm · Hana ghi tên · ở lại Tết | 117.946 | 143.201 |
| Giữ hẻm · Hana giữ kín · ở lại Tết | 118.375 | 142.625 |
| Giữ hẻm · Hana giữ kín · về quê | 114.536 | 132.626 |

Mây Tea và Hana chênh nhau trong vài phần trăm. Về quê hụt vì nghỉ 3 ngày không bán: giữ có chủ ý (trang 11 “Tết thì bán ít lại”), đã nói rõ trong câu báo trước và bù một phần bằng lì xì 500k và 3 ngày khách quen mừng mở lại. Hai dòng cuối chạy sau khi cân lại, ba dòng đầu chạy trước.

### Sau đợt chơi thử của Claude (bản 4.7) — xong 28/09

Chơi bản 4.6 trên khung điện thoại (ngày 1–3, 6 chơi thật; tua tới ngày 16, 50, 62, 67 để thử truyện). Đã sửa:

- [x] Đơn truyện: ly phương án thứ hai giao đúng khách dù khách chưa đứng đầu hàng (`lyTruyenKhop` trong `sealServe`); gợi ý trên bong bóng (`goiYTruyenHTML`)
- [x] Thẻ Ngày mai không gợi ý khách chưa xuất hiện; Linh đi Đà Lạt không ghé tiệm (`vangMat`)
- [x] Nhãn Ngã rẽ không đè nút Bỏ qua; câu Khoa ngày 3 viết hoa; khách vãng lai không trùng tên nhân vật (`TEN_TRUYEN`)
- [x] Điểm sao có đệm lúc mới mở; hai ngày đầu khách kiên nhẫn hơn 40%
- [x] Ly của khách đã về không giao nhầm (`cup.cho`)
- [x] Hướng dẫn người mới 4 trang, nút Tiếp ghi trang đích ngay khi bấm
- [x] Về quê: nút Lên xe về quê, không đòi nấu hàng (`veQueSap`); câu báo trước nói hàng vẫn hết hạn
- [x] Nhắc thử thách ở màn chuẩn bị (`ttNhacNho`)
- [x] Phố Trà: tiệm máy mạnh hơn và có trần điểm (`tran`)
- [x] Thoại: chú Tư uống trà sữa ít ngọt, câu hồi âm chú Tư đặt sau câu đùa, câu mở đầu bà Sáu đủ ý

## Cổng quyết định

| Cổng | Ngày | Đi tiếp khi |
|---|---|---|
| C0 · Quyền | 28/09 | Đã qua |
| C1 · Người chơi có quay lại | 08/11 | ≥80% xong ngày 1, ≥20% quay lại hôm sau, <60% bỏ qua cảnh, <5% phá sản trước ngày 10 |
| C2 · Người chơi rủ bạn | 06/12 | ≥25% người chơi thử thách chia sẻ mỗi tuần, ≥7% quay lại sau 7 ngày |
| C3 · Người chơi muốn lớn lên | 17/01 | ≥40% người chạm ngày 30 mở mặt tiền và chơi tiếp ≥7 ngày |

## Việc còn để ý

- `LICH_LE` chỉ có ngày Tết và Trung Thu tới 2030: trước Tết 2031 cần thêm ngày.
- Game vẫn không có service worker (tác giả gốc cố ý gỡ để tránh kẹt bản cũ), nên chưa chơi được khi mất mạng hẳn.
- Câu đánh giá "Cảm ơn nhân viên đã làm lại đúng ý mình" không bao giờ được chọn (khách bị làm sai luôn đánh giá tiêu cực). Giữ nguyên có chủ ý.

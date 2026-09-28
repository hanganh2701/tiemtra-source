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
6. Sau lần chơi thử thứ ba của Claude (game dễ, tới ngày 49 là hết việc): chế độ thường khó dần theo chương (Thư giãn giữ nguyên), và làm chi nhánh ngay, không chờ cổng C3.
7. Tab Đời sống (bản 5.0): có chi phí sinh hoạt nhẹ mỗi ngày (Thư giãn miễn), có cả đồ cho bản thân và quà cho gia đình.
8. Nhà xe và đồ mua sắm chi tiết như ngoài đời (bản 5.1, chốt 29/09): diện tích, số phòng, tên hãng và mẫu thật dạng chữ (xe, điện thoại, đồng hồ, túi, điện máy), giá tham khảo ngoài đời, có hình vẽ riêng (không logo).

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
- [x] Chi nhánh: ban đầu hoãn tới cổng C3, làm sớm ở bản 4.9 theo quyết định 28/09 (xem mục bản 4.9)

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

### Sau lần chơi thử thứ hai của Claude (bản 4.8) — xong 28/09

Chơi lại bản 4.7 đủ 68 ngày trên khung điện thoại, rồi thử thách, góp ý, Sổ tay, Huy hiệu và Hẻm 42 lần nữa tới ngày 7 của lượt 2. Đã sửa:

- [x] Thẻ sự kiện không gắn món giữ dấu % (`evText`)
- [x] Nhãn chương theo ngày xem (`chuongLuc`, Chương 1 từ ngày 7): cảnh trôi theo độ thân hay theo lúc ra mặt tiền không làm nhật ký lùi chương
- [x] Trung Thu ngày 41; cảnh của Vy cần trang 7 nên trang 8 luôn tới sau
- [x] Linh học Đà Lạt: câu của Linh trong cảnh chung thành tin nhắn (điều kiện mới `khongNhanh`); cảnh lễ theo lịch thật không chen vào tuần đầu (`ngay: 7`)
- [x] Lượt 2: câu bà Sáu về Mướp theo lựa chọn ngày 1
- [x] Hẻm 42 lần nữa giữ thời gian bán mỗi ngày, chỉ dẫn và các câu đã hỏi (cài lên màn hình, sao lưu, góp ý)
- [x] Sự cố thường không còn "chủ quán tự đầu tư tiền ảo" (`gianLan`, thay bằng tủ mát hư); câu công an trả tiền khách bùng nói "hôm nọ"
- [x] Nhắc sao lưu thưa dần 7 → 14 → 28 ngày, có nút Đừng nhắc nữa (`bakSkip`, `bakOff`); chữ Khôi phục bản tự lưu
- [x] Góp sức cho Hẻm 42 (`GOP_HEM`, Hẻm 42 › Góp hẻm): 6 việc, tổng 38 triệu, mở theo truyện, ưu đãi nhỏ, lời cảm ơn, hiện trước tiệm, 2 huy hiệu
- [x] Mặt tiền có giao diện riêng (`giaoDienTiem`: mái hiên xanh cả lúc bán, bảng hiệu hộp đèn; góp đèn thì có dây bóng đèn); khách ×1,4 thay ×1,8, khách bớt sốt ruột (0,92 thay 0,85); tiền nhà 220k/ngày, cọc 12 ngày
- [x] Hệ quả nhánh vẫn thấy khi quầy kín: khách xem video và khách Tết chịu chờ lâu hơn (`heSoChoNhanh`), ở lại Tết tip ×1,3, thẻ Ngày mai nói rõ
- [x] Đơn online mở từ ngày 40 (cấu hình bản 41 chuyển cả bản lưu cũ); tablet chỉ bán khi đã mở online
- [x] Nhân viên lên nghề chậm hơn: cần kinh nghiệm gấp 9 lần bậc hiện tại thay vì 6 (Linh thành thợ cả khoảng ngày 50)
- [x] Mô phỏng kiểu người chơi thật: `node tools/mo-phong-kinh-te.mjs nguoi`

Người chơi máy cũ pha mọi ly ngay lập tức, kể cả đơn 5 ly, nên số tiền đo trong đợt chơi thử và bảng ở bản 4.6 cao hơn người thật nhiều. Bảng 4.6 chỉ dùng để so các nhánh với nhau. Khách mất ở mặt tiền trong đợt chơi thử phần lớn là do máy nấu thiếu hàng, không phải do quầy.

Kiểu người chơi thật (mỗi lúc pha một ly, 7 hoặc 11 giây mỗi ly, thuê phụ quầy thì nhanh hơn 30%; nấu theo cột hôm qua dùng; tự mua trang bị, trang trí, góp hẻm, ra mặt tiền, thuê Linh, nhân viên pha chế và nhân viên online; Linh ở lại, Hana ghi tên, giữ hẻm, ở lại Tết). Nghìn đồng:

| Người chơi | Két ngày 30 | Két ngày 50 | Két ngày 70 | Mua xong mọi thứ | Ly/ngày 41–70 |
|---|---|---|---|---|---|
| Giỏi, mặt tiền, thuê người | 4.233 | 26.400 | 93.900 | ngày 49 | 131 |
| Vừa, mặt tiền, thuê người | 4.207 | 13.189 | 52.221 | ngày 52 | 105 |
| Giỏi, ở trong hẻm, không thuê | 6.383 | 4.371 | 38.357 | ngày 49 | 42 |
| Giỏi, mặt tiền, Hana giữ kín | 3.425 | 22.694 | 89.709 | ngày 49 | 128 |

Trước khi cân lại (bản 4.7, cùng kiểu người chơi): người chơi giỏi mua hết mọi thứ trừ tablet ở ngày 30, rồi không còn gì để mua. Giờ tiền còn ý nghĩa tới khoảng ngày 50. Sau đó vẫn dư nhiều, vì mỗi ly lãi cao theo giá gốc của game. Chưa đụng giá vì Phố Trà vừa cân theo doanh thu ở bản 4.7; chờ số liệu chơi thử thật (cổng C3) rồi mới quyết.

### Sau lần chơi thử thứ ba của Claude (bản 4.9) — xong 28/09

Chơi bản 4.8 trên web từ ngày 1 tới kết (ngày 68) kiểu người chơi thật: 8 giây mỗi ly, nấu theo cột hôm qua dùng, tự mua và thuê người; Linh đi Đà Lạt, Hana giữ kín, bắt tay Mây Tea, về quê. Tới ngày 49 đã mua hết mọi thứ, két 65 triệu lúc kết, sao gần như luôn trên 4,7, Phố Trà hạng 1 từ ngày 33 tới hết. Đã làm:

- [x] Chi nhánh (`data/chi-nhanh.js`, `src/chi-nhanh.js`): mở khi đã ra mặt tiền 14 ngày, 4,3 sao và nghe Vy kể về mấy chỗ sang nhượng (`c2_chi_nhanh`, từ ngày 50). Ba loại: gần trường (rẻ, vắng cuối tuần và tuần thi), toà văn phòng (chịu chi, vắng cuối tuần), kiosk trung tâm thương mại (đều, ít chỗ, nộp 8% doanh thu)
- [x] Chi nhánh tự bán: số ly = nhỏ hơn giữa lượng khách và sức quản lý (thuê người phụ thì hơn); giá và tiền hàng theo tiệm gốc; trà và topping sắp hết hạn ở tiệm gốc tự chở qua (bếp trung tâm). Tính sổ lúc tiệm gốc đóng cửa (`chiNhanhCuoiNgay`, dòng bán `cn`, chi phí `cnChi`); tắt game thì không tự cộng tiền
- [x] Sáng hôm sau có thẻ báo cáo, tối đa một tình huống hai lựa chọn (`CN_VIEC`); quản lý lên nghề xin tăng lương; hết kỳ hợp đồng chủ nhà báo tăng giá; sang nhượng lấy lại 60% tiền trang trí
- [x] Khó dần theo chương (`src/do-kho.js`): Chương 2 khách kiên nhẫn ×0,95, khách khó chiều 16%, giá nhập ×1,1; Chương 3 ×0,9, 20%, ×1,2; thẻ cuối ngày báo khi sang chương; Thư giãn và thử thách hôm nay không đổi
- [x] Sự cố mất tiền tính theo két: khoảng 3%, ít nhất như cũ, tối đa 4 triệu (`tienSuCo`)
- [x] Phố Trà: Mây Tea mạnh dần (tăng 0,6/ngày, trần 150); có chi nhánh cộng 8 điểm, nên cuối game muốn giữ hạng 1 cần chi nhánh hoặc sao rất cao
- [x] Truyện: chú Tư chở hàng qua chi nhánh (`cn_cho_hang`), chợ giáp Tết lên giá (`c3_gia_tet`, ngày 60), hậu truyện bà Sáu nhắc chi nhánh; lấp khoảng trống ngày 56–61
- [x] Lời bà Sáu rủ góp hẻm nói đúng việc đang mở (`ru`); trang sổ của Linh thành trang 3, của Khoa thành trang 4 (bản lưu cũ đổi số, cờ `trang34`)

Mô phỏng kiểu người chơi thật sau khi làm (nghìn đồng):

| Người chơi | Két ngày 50 | Két ngày 70 | Mở chi nhánh | Mua xong mọi thứ | Cuối game |
|---|---|---|---|---|---|
| Giỏi, mặt tiền, chi nhánh gần trường | 27.139 | 103.281 | ngày 52 | ngày 52 | 4,8★ hạng 1 |
| Vừa, mặt tiền, chi nhánh gần trường | 5.157 | 45.124 | ngày 55 | ngày 59 | 4,7★ hạng 1 |
| Giỏi, ở trong hẻm, không thuê | 4.779 | 37.184 | – | ngày 49 | 4,2★ hạng 3 |
| Giỏi, mặt tiền, chi nhánh văn phòng, Hana giữ kín | 19.659 | 101.266 | ngày 52 | ngày 52 | 5,0★ hạng 1 |

Người chơi vừa giờ còn phải tính tiền tới khoảng ngày 60 (két ngày 50 chỉ 5 triệu). Người chơi giỏi vẫn dư nhiều từ ngày 50 vì mỗi ly lãi cao theo giá gốc; chưa đụng giá bán vì Phố Trà tính theo doanh thu. Độ khó theo chương thấy rõ nhất ở tiệm không thuê người: sao còn khoảng 3,8–4,2, Phố Trà hạng 3–4. Mỗi lần chạy lệch nhau khá nhiều vì ngẫu nhiên.

### Sau lần chơi thử thứ tư của Claude (bản 4.9.1) — xong 28/09

Chơi bản 4.9 trên web từ ngày 1 tới kết (ngày 68), 8 giây mỗi ly; Linh ở lại, Hana giữ kín, giữ hẻm, về quê, chi nhánh văn phòng (mở ngày 54). Độ khó theo chương, Phố Trà giành hạng, chi nhánh, báo cáo, tình huống, các cảnh mới đều chạy. Đã sửa:

- [x] Chi nhánh bớt lãi: quản lý 350k + 12% doanh thu, hàng mua ngoài ×1,3, sức bán `capGoc` 40 + `capBac` 12 × tay nghề, người phụ +30 ly; văn phòng giá ×1,1, gần trường ×0,85
- [x] Báo cáo chi nhánh chỉ một lần cho mỗi ngày bán (`daBao`), không báo lại ngày cũ sau mấy ngày về quê
- [x] Chuyện ngẫu nhiên ở chi nhánh không lặp lại trong 7 ngày (`gap`, `CHI_NHANH.lapLai`)
- [x] Vy kể chuyện sang nhượng sau cảnh Vy quyết ở lại chuỗi hay ra chợ: `sau` nhận danh sách cảnh (`ngayXemSau`)
- [x] Kết `tiem_cua_xom` có lời khác khi tiệm đã ra mặt tiền (`chuMt`) hay có chi nhánh (`chuCn`); sang nhượng thì bỏ cờ chi nhánh
- [x] Chi nhánh hiện ở dải đồ trước tiệm; chi nhánh gần trường đổi biểu tượng thành 🏫 (🎒 là quỹ học bổng); hai nút trong thẻ chi nhánh cùng cỡ; tổng kết đếm chi nhánh theo ly; báo cáo chỉ nhắc hàng dư khi từ 5 phần

Mô phỏng kiểu người chơi thật sau khi sửa (nghìn đồng, chi nhánh mở ngày 55 ở cả ba tiệm có mặt tiền):

| Người chơi | Két ngày 50 | Két ngày 70 | Mua xong mọi thứ | Cuối game |
|---|---|---|---|---|
| Giỏi, mặt tiền, chi nhánh gần trường | 29.372 | 102.757 | ngày 55 | 5,0★ hạng 1 |
| Vừa, mặt tiền, chi nhánh gần trường | 14.428 | 44.859 | ngày 57 | 4,9★ hạng 1 |
| Giỏi, ở trong hẻm, không thuê | 17.321 | 33.636 | ngày 51 | 4,2★ hạng 3 |
| Giỏi, mặt tiền, chi nhánh văn phòng, Hana giữ kín | 21.849 | 79.983 | ngày 55 | 4,9★ hạng 1 |

### Đời sống (bản 5.0) — xong 28/09

Chủ dự án muốn có mua sắm cho bản thân: từ nhà trọ lên nhà, từ xe đạp lên ô tô, điện thoại, đồng hồ. Đã chốt: có chi phí sinh hoạt nhẹ, có cả đồ cho bản thân và quà cho gia đình.

- [x] Tab Đời sống (`data/doi-song.js`, `src/doi-song.js`, biểu tượng `img/ic_home.svg`): chỗ ở 5 nấc (ở ghép phòng trọ → phòng trọ riêng → thuê căn hộ → mua căn hộ 180 triệu → nhà trong Hẻm 42 350 triệu), xe 5 nấc (xe đạp → xe số cũ → tay ga → ô tô cũ → ô tô mới), điện thoại 3 đời; chỉ lên nấc cao hơn, dọn nhà lấy lại cọc, đổi xe hay điện thoại bán lại đồ cũ một nửa
- [x] Ưu đãi nhỏ: xe máy giá nhập −3% và −5%, ô tô đỡ 10% tiền hàng chi nhánh, điện thoại khách đặt app chờ lâu hơn 10% và khách ghé +3%; đồ cho bản thân không có ưu đãi, có người trong hẻm nhận xét
- [x] Quà cho gia đình 5 món: mẹ nhắn lại, hậu truyện của mẹ nhắc (cờ `ds_<id>`); có chỗ ở rộng thì cảnh Tết theo lịch thật ba mẹ ngủ lại nhà bạn; về quê thấy mái nhà mới
- [x] Tiền sinh hoạt mỗi ngày mở tiệm (`doiSongCuoiNgay`, dòng `song` trong sổ): ăn uống 20k + tiền nhà hay phí + xăng; đầu game 40k. Thư giãn và thử thách hôm nay miễn
- [x] Huy hiệu An cư, Con có hiếu
- [x] Sửa lỗi cũ: `refreshPrep` thiếu tab Hẻm 42 (góp hẻm xong bấm Tiếp tục bị lỗi); ba bảng chọn trang gom về `vePane`

Mô phỏng kiểu người chơi thật, người chơi máy sắm đời sống khi dư quá 5 triệu (nghìn đồng):

| Người chơi | Két ngày 50 | Két ngày 70 | Két ngày 100 | Đã sắm |
|---|---|---|---|---|
| Giỏi, chi nhánh gần trường | 12.898 | 32.081 | – | căn hộ thuê, tay ga, điện thoại chụp đẹp, 4 món quà (ngày 70) |
| Vừa, chi nhánh gần trường | 8.595 | 10.548 | – | căn hộ thuê, tay ga, 3 món quà (ngày 70) |
| Giỏi, chơi 100 ngày | 14.644 | 22.755 | 47.338 | thêm mái nhà ở quê (ngày 75), ô tô cũ (ngày 91); chưa đủ tiền mua căn hộ |

Tiền giờ có chỗ tiêu suốt game; mua căn hộ và nhà trong hẻm là mục tiêu sau khi hết truyện.

### Nhà xe như ngoài đời (bản 5.1) — xong 29/09

- [x] Nhà (`DS_NHA`): nhà ở xã hội 45m² 1,05 tỷ (vay ưu đãi trả trước 20%, lãi 6,6%), căn hộ 44m² 2,2 tỷ, 54m² 3,2 tỷ, 75m² 4,8 tỷ, nhà trong Hẻm 42 6,5 tỷ, căn hộ 100m² nhìn ra sông 9,8 tỷ, nhà phố mặt tiền 24 tỷ, biệt thự 65 tỷ; thuê chỗ ở giữ 3 nấc (`DS_TRO`)
- [x] Xe máy (`DS_XM`): xe đạp, Honda Wave Alpha, Vision, Yamaha Exciter 155, Honda SH 160i; ô tô (`DS_OT`): VinFast VF 3, Kia Morning, Toyota Vios, Mazda CX-5, Ford Everest, Mercedes-Benz C 300, Porsche Macan, Porsche 911 (hai cửa nên không chở hàng cho chi nhánh)
- [x] Hình vẽ SVG cho từng nhà, từng xe (`src/hinh-doi-song.js`): xe nhìn ngang theo kiểu dáng, nhà theo loại; không logo
- [x] Trả góp (`dsTinh`, `gopNgay`, `doiSongCuoiNgay`): trả trước 30%, nhà vay 20 năm lãi 9%, ô tô 5 năm lãi 10%; ngân hàng xét thu nhập 7 ngày gần nhất (`thuNhapNgay`), tổng góp tới một nửa; hỏi lại trước khi mua; trả hết nợ được; sổ ghi tiền trả trước và tiền góp mỗi ngày (dòng `gop`)
- [x] Đổi nhà bán lại 90%, đổi xe bán lại 70% (trừ nợ góp còn lại); bản lưu 5.0 đã mua nhà xe, điện thoại giá cũ hay món không còn bán được hoàn tiền và báo một lần (`chuyenDs50`, `dsBaoHoan`)
- [x] Điện thoại (`DS_DT`), đồ cho bản thân (`DS_DO`, 4 nhóm) và quà cho ba mẹ (`DS_QUA`, 6 nhóm) theo giá chuỗi bán lẻ, trang hãng, tiệm vàng, công ty du lịch cuối 9/2026 (nghiên cứu ngày 29/09; túi LV, Chanel, Birkin không có giá niêm yết ở VN nên quy đổi). Thêm lì xì biếu Tết, xe Wave cho ba, bảo hiểm sức khỏe, tour Nhật, xây lại nhà ở quê. Mỗi món có hình vẽ (`hinhDo`) và dòng mô tả
- [x] Tab Đời sống gọn lại (nghiên cứu UX ngày 29/09: NN/g về accordion và bottom sheet, Baymard, Apple HIG, mục tiêu tiết kiệm kiểu Monzo Pots, hiệu ứng goal-gradient). Trang cũ dài khoảng 6.700px (hơn 8 màn hình điện thoại), trang mới khoảng 700px khi các khối đóng:
  - 6 khối thu gọn (`DS_KHOI`): Chỗ ở, Xe máy, Ô tô, Điện thoại, Cho bản thân, Quà cho ba mẹ. Tiêu đề khối có món đang có, món kế tiếp, giá và chữ tình trạng (Mua được, Góp được, Thiếu…), không chỉ dựa vào màu; mỗi lần mở một khối
  - Nấc nhà xe điện thoại là hàng gọn (`dsHang`), nấc đã qua gom thành một dòng bấm mở; đồ dùng và quà là lưới 3 cột theo nhóm
  - Bảng chi tiết trượt từ dưới lên (`xemDs`): chọn Trả thẳng hay Trả góp, bảng tiền (bán lại đồ cũ, tiền vay, góp mỗi ngày), chi phí mỗi ngày đổi bao nhiêu, lý do chưa mua được và số ngày ước chừng; đóng bằng nút Đóng, chạm nền, phím Esc hay vuốt lui trên điện thoại
  - Mục tiêu để dành (`dsMucTieu`): thanh tiến độ ở thẻ tóm tắt và màn chuẩn bị với số ngày ước chừng theo thu nhập 7 ngày, dòng tiến độ ở thẻ cuối ngày (`dsMucCuoiNgay`), đủ tiền thì nhắc một lần (`dsMucDu`)

Mô phỏng người chơi thật 200 ngày với giá mới (Wave 22,5 triệu, điện thoại, quà theo giá ngoài đời), máy mua dần điện thoại, quà, xe máy, ô tô và nhà ở xã hội trả góp (nghìn đồng):

| Người chơi | Két ngày 100 | Két ngày 200 | Mốc mua sắm |
|---|---|---|---|
| Giỏi, chi nhánh gần trường | 41.702 | 28.255 | Galaxy A17 ngày 50, Reno15 54, quà đi biển 60, Wave 72, Vision 77, lợp mái nhà ở quê 92, SH 110, Kia Morning trả góp 139, nhà ở xã hội trả góp 194 |
| Vừa, chi nhánh gần trường | 60.152 | 150.946 | Galaxy A17 ngày 60, Reno15 64, quà đi biển 73, Wave 80, Vision 86, lợp mái 101, SH 123, Kia Morning trả góp 154; chưa đủ tiền trả trước mua nhà |

Điện thoại mới khoảng ngày 50–65, xe máy trong khoảng ngày 70–125, ô tô nhỏ trả góp khoảng ngày 140–155, căn nhà đầu tiên khoảng ngày 190 trở đi (sớm hơn nếu để dành mua nhà trước xe). Căn hộ thường, nhà phố, biệt thự, Porsche là mơ ước lâu dài.

### Gửi tiền về quê (bản 5.2) — xong 29/09

Chủ dự án muốn có gửi tiền về quê mỗi tháng kèm cốt truyện hỗ trợ gia đình. Nghiên cứu ngày 29/09 (báo 2026): người đi làm ở thành phố thường gửi ba mẹ 5–7 triệu mỗi tháng, đây là phần cốt lõi của "báo hiếu" và cũng là áp lực, nên truyện không được trách người chơi.

- [x] Chuyện nhà ở quê (`data/cot-truyen.js`, cảnh `gui_1`…`gui_so`):
  - `gui_1`: ba trặc lưng lúc gặt lúa, mẹ nhắn, dặn đừng lo; hiện từ ngày 36 khi két có 3 triệu, hạn chót ngày 52. Chọn gửi 2 triệu, 5 triệu hay "Để con tính đã"
  - `gui_2`: ba khoẻ lại dù có gửi hay không (có gửi thì đi châm cứu, không thì chú Năm gặt giùm)
  - `gui_3`: gửi đủ ba tháng thì chú Tư ra bến lấy thùng hàng quê: mở vị xoài, thêm 30 phần xoài
  - `gui_so`: mua nhà rồi thì mẹ kể đã lén để dành một nửa ở bưu điện xã, gửi lại con sắm đồ nhà mới
  - Nhắc lại lựa chọn ở cảnh về quê ăn Tết (`que_1`) và hậu truyện của mẹ
- [x] Bộ máy truyện: `macDinh` (lựa chọn dùng khi Bỏ qua hay chế độ Tắt, để game không tự gửi tiền thay người chơi), `tienTren` (két có từ bấy nhiêu, điều kiện mềm)
- [x] Gửi mỗi tháng (`src/doi-song.js`, `DS.gui`):
  - Mức 0, 1, 2, 3, 5, 10 triệu, chỉnh ở khung đầu khối Quà cho ba mẹ, chỉ hiện sau cảnh `gui_1`
  - Cứ 30 ngày gửi một lần lúc đóng cửa (`guiVeCuoiNgay`); két phải còn 500 nghìn sau khi gửi, không thì tháng đó thôi và mẹ nhắn "kẹt thì thôi"
  - Tạm dừng rồi bật lại trong tháng thì giữ hẹn cũ
  - Mẹ nhắn lại mỗi lần gửi trên thẻ cuối ngày (`DS_GUI_TIN`)
  - Sổ sách, tổng kết có dòng riêng (`r.gui`). Ngân hàng không tính khoản này khi xét cho vay; ước lượng ngày tới mục tiêu có trừ
- [x] Mô phỏng người chơi máy gửi 2 triệu mỗi tháng từ lúc có cảnh

Mô phỏng người chơi thật 200 ngày (nghìn đồng):

| Người chơi | Két ngày 100 | Két ngày 200 | Gửi về quê | Mốc mua sắm |
|---|---|---|---|---|
| Giỏi, chi nhánh gần trường | 47.083 | 26.159 | từ ngày 38, 6 lần, 12.000; thùng xoài ngày 99; mẹ gửi lại 6.000 ngày 197 | Wave 69, SH 109, Kia Morning trả góp 141, nhà ở xã hội trả góp 197 |
| Vừa, chi nhánh gần trường | 35.891 | 114.837 | từ ngày 50, 6 lần, 12.000; thùng xoài ngày 111 | Wave 83, SH 132, Kia Morning trả góp 166; chưa mua nhà |

2 triệu mỗi tháng làm mốc mua sắm chậm vài ngày, nằm trong độ dao động giữa các lượt chạy.

## Cổng quyết định

| Cổng | Ngày | Đi tiếp khi |
|---|---|---|
| C0 · Quyền | 28/09 | Đã qua |
| C1 · Người chơi có quay lại | 08/11 | ≥80% xong ngày 1, ≥20% quay lại hôm sau, <60% bỏ qua cảnh, <5% phá sản trước ngày 10 |
| C2 · Người chơi rủ bạn | 06/12 | ≥25% người chơi thử thách chia sẻ mỗi tuần, ≥7% quay lại sau 7 ngày |
| C3 · Người chơi muốn lớn lên | 17/01 | ≥40% người chạm ngày 30 mở mặt tiền và chơi tiếp ≥7 ngày. Chi nhánh đã làm sớm (bản 4.9); cổng này dùng để chỉnh độ khó và chi nhánh |

## Việc còn để ý

- `LICH_LE` chỉ có ngày Tết và Trung Thu tới 2030: trước Tết 2031 cần thêm ngày.
- Game vẫn không có service worker (tác giả gốc cố ý gỡ để tránh kẹt bản cũ), nên chưa chơi được khi mất mạng hẳn.
- Câu đánh giá "Cảm ơn nhân viên đã làm lại đúng ý mình" không bao giờ được chọn (khách bị làm sai luôn đánh giá tiêu cực). Giữ nguyên có chủ ý.

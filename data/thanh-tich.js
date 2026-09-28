/* Huy hiệu và mục tiêu tuần. Nạp trước game.js; hàm dk() chỉ chạy lúc chơi.
   Không có chuỗi ngày đăng nhập: nghỉ chơi bao lâu cũng không mất gì.
   dk(K, T): K = kỷ lục (S.kl), T = trạng thái truyện (S.tr). */
const HUY_HIEU = [
  /* ---------- Quầy pha ---------- */
  { id: "ly_dau", nhom: "Quầy pha", ic: "🧋", ten: "Ly đầu tiên", mo: "Phục vụ vị khách đầu tiên", dk: (K) => K.khach >= 1 },
  { id: "khach_100", nhom: "Quầy pha", ic: "👥", ten: "Trăm khách", mo: "Phục vụ 100 khách tại quầy", dk: (K) => K.khach >= 100 },
  { id: "khach_500", nhom: "Quầy pha", ic: "🎉", ten: "Năm trăm khách", mo: "Phục vụ 500 khách tại quầy", dk: (K) => K.khach >= 500 },
  { id: "khach_2000", nhom: "Quầy pha", ic: "🏮", ten: "Cả phường đều ghé", mo: "Phục vụ 2.000 khách tại quầy", dk: (K) => K.khach >= 2000 },
  { id: "chuoi_10", nhom: "Quầy pha", ic: "⭐", ten: "Mười khách năm sao", mo: "10 khách liên tiếp chấm 5 sao", dk: (K) => K.chuoiMax >= 10 },
  { id: "chuoi_30", nhom: "Quầy pha", ic: "🌟", ten: "Tay nghề vững", mo: "30 khách liên tiếp chấm 5 sao", dk: (K) => K.chuoiMax >= 30 },
  { id: "nhanh_12", nhom: "Quầy pha", ic: "⚡", ten: "Nhanh tay", mo: "Pha xong một ly trong 12 giây", dk: (K) => K.nhanh > 0 && K.nhanh <= 12 },
  { id: "nhanh_8", nhom: "Quầy pha", ic: "🚀", ten: "Nhanh như chớp", mo: "Pha xong một ly trong 8 giây", dk: (K) => K.nhanh > 0 && K.nhanh <= 8 },
  { id: "ly_ngay_50", nhom: "Quầy pha", ic: "💪", ten: "Không ngơi tay", mo: "Bán 50 ly trong một ngày", dk: (K) => K.lyNgay >= 50 },
  { id: "ly_ngay_100", nhom: "Quầy pha", ic: "🏋️", ten: "Trăm ly một ngày", mo: "Bán 100 ly trong một ngày", dk: (K) => K.lyNgay >= 100 },
  { id: "sao5_20", nhom: "Quầy pha", ic: "✨", ten: "Mưa sao", mo: "20 đánh giá 5 sao trong một ngày", dk: (K) => K.sao5 >= 20 },
  { id: "app_50", nhom: "Quầy pha", ic: "🛵", ten: "Tài xế quen mặt", mo: "Giao 50 đơn app", dk: (K) => K.app >= 50 },
  { id: "nhom_1", nhom: "Quầy pha", ic: "🧺", ten: "Đơn nhóm đầu tiên", mo: "Làm xong một đơn nhóm", dk: (K) => K.nhom >= 1 },
  { id: "nhom_10", nhom: "Quầy pha", ic: "🏫", ten: "Cả lớp ghé", mo: "Làm xong 10 đơn nhóm", dk: (K) => K.nhom >= 10 },

  /* ---------- Tiệm ---------- */
  { id: "tuan_dau", nhom: "Tiệm", ic: "📅", ten: "Tuần đầu", mo: "Mở cửa đủ 7 ngày", dk: () => S.day > 7 },
  { id: "thang_dau", nhom: "Tiệm", ic: "🗓️", ten: "Tròn tháng", mo: "Mở cửa đủ 30 ngày", dk: () => S.day > 30 },
  { id: "ngay_100", nhom: "Tiệm", ic: "💯", ten: "Trăm ngày", mo: "Mở cửa đủ 100 ngày", dk: () => S.day > 100 },
  { id: "ngay_1tr", nhom: "Tiệm", ic: "💵", ten: "Ngày triệu bạc", mo: "Doanh thu một ngày từ 1 triệu", dk: (K) => K.ngayTot >= 1000000 },
  { id: "ngay_5tr", nhom: "Tiệm", ic: "💰", ten: "Ngày bội thu", mo: "Doanh thu một ngày từ 5 triệu", dk: (K) => K.ngayTot >= 5000000 },
  { id: "ket_10tr", nhom: "Tiệm", ic: "🏦", ten: "Két dày", mo: "Có 10 triệu trong két", dk: () => S.money >= 10000000 },
  { id: "sao_45", nhom: "Tiệm", ic: "🌸", ten: "Tiệm được thương", mo: "Đánh giá từ 4,5 sao sau ngày 14", dk: () => S.day > 14 && rating() >= 4.5 },
  { id: "mat_tien", nhom: "Tiệm", ic: "🏠", ten: "Ra mặt tiền", mo: "Thuê mặt tiền đầu hẻm", dk: () => buoc() >= 2 },
  { id: "nv_dau", nhom: "Tiệm", ic: "🤝", ten: "Người đồng hành", mo: "Thuê nhân viên đầu tiên", dk: () => Object.keys(S.nv || {}).length >= 1 },
  { id: "nv_tho_ca", nhom: "Tiệm", ic: "🎓", ten: "Thợ cả", mo: "Có nhân viên tay nghề 5/5", dk: () => Object.values(S.nv || {}).some((n) => n.kn >= 5) },
  { id: "thuc_don", nhom: "Tiệm", ic: "📜", ten: "Thực đơn phong phú", mo: "Pha đúng 20 món khác nhau", dk: (K, T) => Object.keys(T.mon).length >= 20 },
  { id: "mon_ruot", nhom: "Tiệm", ic: "❤️", ten: "Món ruột", mo: "Pha một món 50 lần", dk: (K, T) => Object.values(T.mon).some((n) => n >= 50) },
  { id: "tiem_xinh", nhom: "Tiệm", ic: "🪴", ten: "Tiệm xinh", mo: "Trang trí tiệm 3 món", dk: () => (S.tri || []).length >= 3 },

  /* ---------- Hẻm 42 ---------- */
  { id: "trang_1", nhom: "Hẻm 42", ic: "📖", ten: "Trang sổ đầu tiên", mo: "Nhận trang đầu của sổ công thức", dk: (K, T) => T.trang.length >= 1 },
  { id: "trang_6", nhom: "Hẻm 42", ic: "📚", ten: "Nửa cuốn sổ", mo: "Có 6 trang sổ công thức", dk: (K, T) => T.trang.length >= 6 },
  { id: "trang_12", nhom: "Hẻm 42", ic: "📕", ten: "Đủ cuốn sổ", mo: "Có đủ 12 trang sổ công thức", dk: (K, T) => T.trang.length >= 12 },
  { id: "dac_trung", nhom: "Hẻm 42", ic: "🍵", ten: "Trà của bà Sáu", mo: "Pha món đặc trưng lần đầu", dk: (K, T) => (T.mon[khoaMon(MON_DAC_TRUNG)] || 0) >= 1 },
  { id: "than_sau", nhom: "Hẻm 42", ic: "👵", ten: "Bà Sáu thương", mo: "Thân với bà Sáu 6/10", dk: (K, T) => (T.than.sau || 0) >= 6 },
  { id: "than_tu", nhom: "Hẻm 42", ic: "🛺", ten: "Bạn chú Tư", mo: "Thân với chú Tư 8/10", dk: (K, T) => (T.than.tu || 0) >= 8 },
  { id: "than_khoa", nhom: "Hẻm 42", ic: "📦", ten: "Bạn Khoa", mo: "Thân với Khoa 8/10", dk: (K, T) => (T.than.khoa || 0) >= 8 },
  { id: "than_linh", nhom: "Hẻm 42", ic: "🎒", ten: "Người Linh tin", mo: "Thân với Linh 8/10", dk: (K, T) => (T.than.linh || 0) >= 8 },
  { id: "combo_hanh", nhom: "Hẻm 42", ic: "🥖", ten: "Combo bánh mì", mo: "Làm combo với cô Hạnh", dk: (K, T) => T.co.combo_hanh === true },
  { id: "video_hana", nhom: "Hẻm 42", ic: "🎥", ten: "Lên video của Hana", mo: "Tiệm nổi nhờ video của Hana", dk: (K, T) => T.nhanh.hana === "A" },
  { id: "ket_truyen", nhom: "Hẻm 42", ic: "🎆", ten: "Hết truyện Hẻm 42", mo: "Đi hết Chương 3", dk: (K, T) => T.xem.c3_ket != null },
  { id: "hai_duong", nhom: "Hẻm 42", ic: "🔀", ten: "Thử cả hai đường", mo: "Đi cả hai nhánh của một ngã rẽ (qua nhiều lượt chơi)", dk: (K) => Object.values(K.reDaDi || {}).some((x) => x.A != null && x.B != null) },
  { id: "gop_1", nhom: "Hẻm 42", ic: "🏘️", ten: "Người của Hẻm 42", mo: "Góp một việc cho Hẻm 42", dk: () => Object.keys(S.gopHem || {}).length >= 1 },
  { id: "gop_het", nhom: "Hẻm 42", ic: "🌃", ten: "Hẻm 42 sáng đèn", mo: "Góp đủ mọi việc cho Hẻm 42", dk: () => GOP_HEM.every((d) => (S.gopHem || {})[d.id]) },
  { id: "ket_4", nhom: "Hẻm 42", ic: "📚", ten: "Đủ bốn kết", mo: "Thấy cả 4 kết truyện Hẻm 42", dk: (K) => Object.keys(K.ket || {}).length >= 4 },

  /* ---------- Bạn bè ---------- */
  { id: "tt_dau", nhom: "Bạn bè", ic: "🎯", ten: "So tài lần đầu", mo: "Chơi thử thách hôm nay", dk: () => Object.keys(S.ttKq || {}).length >= 1 },
  { id: "tt_40", nhom: "Bạn bè", ic: "🥇", ten: "Không trượt ly nào", mo: "Thử thách đạt 40/40 ly chuẩn", dk: () => Object.values(S.ttKq || {}).some((k) => k.chuan >= 40) },
  { id: "tt_7", nhom: "Bạn bè", ic: "🗂️", ten: "Bảy lần thử thách", mo: "Chơi thử thách 7 ngày (không cần liền nhau)", dk: () => Object.keys(S.ttKq || {}).length >= 7 },
  { id: "ban_be", nhom: "Bạn bè", ic: "💌", ten: "Có bạn Phố Trà", mo: "Thêm danh thiếp tiệm của bạn bè", dk: () => (S.banBe || []).length >= 1 },
  { id: "top3", nhom: "Bạn bè", ic: "🥉", ten: "Top 3 Phố Trà", mo: "Lên hạng 3 Phố Trà", dk: () => S.day > 1 && hangMinh() <= 3 },
  { id: "top1", nhom: "Bạn bè", ic: "🏆", ten: "Đứng đầu Phố Trà", mo: "Lên hạng 1 Phố Trà", dk: () => S.day > 1 && hangMinh() === 1 },

  /* ---------- Mùa lễ ---------- */
  { id: "li_xi", nhom: "Mùa lễ", ic: "🧧", ten: "Lì xì bà Sáu", mo: "Nhận lì xì dịp Tết", dk: () => Object.keys(S.liXi || {}).length >= 1 },
  { id: "tet_mo", nhom: "Mùa lễ", ic: "🐉", ten: "Mở cửa ngày Tết", mo: "Bán hàng một ngày Tết", dk: () => Object.values(S.tetChon || {}).includes("mo") },
  { id: "noel", nhom: "Mùa lễ", ic: "🎄", ten: "Giáng sinh ở tiệm", mo: "Bán hàng mùa Noel", dk: (K) => !!(K.le && K.le.noel) },
  { id: "trung_thu", nhom: "Mùa lễ", ic: "🏮", ten: "Rước đèn", mo: "Đón Trung Thu trong hẻm", dk: (K, T) => T.xem.c2_trung_thu != null },
  { id: "mua_dong", nhom: "Mùa lễ", ic: "🌧️", ten: "Mưa vẫn đông", mo: "Bán 30 ly vào một ngày mưa", dk: (K) => !!K.muaDong },
];

/* Mục tiêu tuần: đầu mỗi tuần trong game (ngày 1–7, 8–14…) chọn 3 mục tiêu.
   n và thưởng theo bậc: tuần đầu, tới ngày 45, sau ngày 45. Không làm kịp thì thôi, không phạt. */
const MUC_TIEU_TUAN = [
  { k: "khach", chu: "Phục vụ {n} khách tại quầy", n: [30, 70, 130] },
  { k: "sao5", chu: "Nhận {n} đánh giá 5 sao", n: [12, 30, 60] },
  { k: "tien", chu: "Doanh thu trong tuần đạt {n}", n: [1500000, 5000000, 12000000], tien: true },
  { k: "chuoi", chu: "Chuỗi {n} khách 5 sao liên tiếp", n: [5, 8, 12], max: true },
  { k: "quen", chu: "Khách quen ghé {n} lần", n: [2, 4, 6], khi: () => Object.values(KHACH_QUEN).some((q) => q.tuNgay <= S.day + 3) },
  { k: "app", chu: "Giao {n} đơn app", n: [6, 15, 30], khi: () => appsOn().length > 0 },
  { k: "nhom", chu: "Làm xong {n} đơn nhóm", n: [1, 1, 2], khi: () => level() >= 3 },
];
const THUONG_TUAN = [150000, 300000, 500000];

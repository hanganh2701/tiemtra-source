/* Đời sống của chủ tiệm: thuê chỗ ở, mua nhà, xe máy, ô tô, điện thoại, đồ cho bản thân, quà cho gia đình. Nạp trước game.js.
   Nhà và xe dùng giá tham khảo ngoài đời (2026), mua thẳng hoặc trả góp ngân hàng. Xe ghi tên hãng thật dạng chữ
   (chủ dự án chốt 29/09/2026), hình do game tự vẽ, không có logo. Khu vực nhà là tên gọi quen thuộc, không phải dự án thật.
   ngay = tốn mỗi ngày mở tiệm (tiền trọ, phí quản lý và điện nước, xăng hay sạc, gửi xe, bảo hiểm); coc = đặt cọc khi thuê.
   Ưu đãi: gn = giá nhập giảm, cn = tiền hàng chi nhánh giảm, onl = khách đặt app chờ lâu hơn, khach = khách ghé nhiều hơn.
   kieu, mau và các thông số khác dùng để vẽ hình (src/hinh-doi-song.js). phan = câu một người trong hẻm nói khi mua. */
const DS = {
  anUong: 20000 /* ăn uống mỗi ngày mở tiệm */,
  banLaiXe: 0.7 /* đổi xe thì bán lại xe cũ được bấy nhiêu */,
  banLaiNha: 0.9 /* đổi nhà thì bán lại nhà cũ được bấy nhiêu */,
  banLaiDt: 0.5,
  /* trả góp: trả trước, lãi mỗi năm (360 ngày như vay ngân hàng trong game), số ngày góp */
  vay: {
    nha: { truoc: 0.3, lai: 0.09, ngay: 7200, ten: "20 năm" },
    ot: { truoc: 0.3, lai: 0.1, ngay: 1800, ten: "5 năm" },
  },
  gopToiDa: 0.5 /* ngân hàng chỉ cho tổng tiền góp mỗi ngày tới một nửa thu nhập (trung bình 7 ngày gần nhất) */,
  /* gửi tiền về quê: mở từ cảnh gui_1 (ba trặc lưng). Người đi làm ở thành phố thường gửi 5–7 triệu mỗi tháng (báo 2026);
     tiệm mới mở nên cho chọn từ 1 triệu. chuKy = số ngày giữa hai lần gửi; két phải còn duPhong sau khi gửi, không thì tháng đó thôi */
  gui: { muc: [0, 1000000, 2000000, 3000000, 5000000, 10000000], chuKy: 30, duPhong: 500000, traLai: 0.5 },
};
/* mẹ nhắn lại mỗi lần nhận tiền, theo số tháng đã gửi; hết danh sách thì xoay vòng ba câu cuối */
const DS_GUI_TIN = [
  "Mẹ: Nhận rồi con.. Mai mẹ chở ba đi châm cứu ở trạm xá.",
  "Mẹ: Ba đỡ đau rồi. Ổng biểu con gửi ít thôi, để dành.",
  "Mẹ: Mẹ mua thêm bầy gà. Tết con về có gà luộc.",
  "Mẹ: Nhận rồi. Ba đi đám giỗ khoe con với cả xóm..",
  "Mẹ: Mưa quá con. Tiệm có dột không..",
  "Mẹ: Nhận rồi. Ăn cơm chưa con..",
  "Mẹ: Ba sơn lại cái cổng rồi. Mẹ gửi hình con coi nè.",
];
const DS_GUI_KET = "Mẹ: Tháng này con kẹt thì thôi. Ba mẹ còn lúa..";

/* thuê chỗ ở: nấc sau thay nấc trước, dọn đi thì lấy lại cọc */
const DS_TRO = [
  { id: "tro_ghep", kieu: "tro", phong: 4, sang: 1, mau: "#efe0c6", ten: "Ở ghép phòng trọ", ngay: 20000, mo: "Phòng trọ chung với hai bạn, đạp xe ra tiệm mười lăm phút." },
  {
    id: "tro_rieng", kieu: "tro", phong: 3, sang: 0, mau: "#f3e3c8", ten: "Phòng trọ riêng gần hẻm", ngay: 45000, coc: 900000, mo: "Một mình một phòng, đi bộ ra tiệm năm phút.",
    phan: ["sau", "Ở gần vậy thì sáng nào bà cũng kêu con dậy nấu hàng nghen."],
  },
  {
    id: "can_ho_thue", kieu: "can_ho", tang: 5, rong: 56, sang: [4], mau: "#eadcc8", ten: "Thuê căn hộ 35m²", ngay: 110000, coc: 3300000,
    mo: "Có bếp, có phòng cho ba mẹ lên chơi.", uuDai: "Tết ba mẹ lên thì ở lại nhà bạn",
    phan: ["tin", "Mẹ: Có phòng cho ba mẹ hả con.. Vậy Tết mẹ lên ở mấy bữa."],
  },
];
/* mua nhà: dt = diện tích, pn = phòng ngủ; vay = điều kiện vay riêng (nhà ở xã hội vay ưu đãi); đổi nhà thì bán lại nhà cũ */
const DS_NHA = [
  {
    id: "noxh", kieu: "can_ho", tang: 7, rong: 72, sang: [11], mau: "#f0e2cc", ten: "Căn hộ nhà ở xã hội 45m²", dt: 45, pn: 1, khu: "khu Bình Chánh", gia: 1050000000, ngay: 15000,
    vay: { truoc: 0.2, lai: 0.066 }, mo: "Vay ưu đãi: trả trước 20%, lãi 6,6%/năm. Xa tiệm, đi xe máy ba mươi phút.",
    phan: ["tin", "Mẹ: Con có nhà rồi hả.. Nhỏ cũng được, của mình là được."],
  },
  {
    id: "ch44", kieu: "can_ho", tang: 6, rong: 60, sang: [7], mau: "#f3e3c8", ten: "Căn hộ 44m²", dt: 44, pn: 1, khu: "khu Thủ Đức", gia: 2200000000, ngay: 25000,
    mo: "Bếp nhỏ, tầng 12, đi bộ ra ga metro.", phan: ["tin", "Mẹ: Con mua nhà thiệt hả.. Ba đọc tin nhắn xong ra sân đứng hoài."],
  },
  {
    id: "ch54", kieu: "can_ho", tang: 7, rong: 64, sang: [9, 10], mau: "#e8dcef", ten: "Căn hộ 54m²", dt: 54, pn: 2, khu: "gần cầu Sài Gòn", gia: 3200000000, ngay: 30000,
    mo: "Có phòng cho ba mẹ lên ở.", phan: ["sau", "Hai phòng ngủ hả? Vậy ba mẹ con lên ở được rồi đó."],
  },
  {
    id: "ch75", kieu: "can_ho", tang: 7, rong: 70, sang: [12, 13], bancong: true, mau: "#dcebe0", ten: "Căn hộ 75m²", dt: 75, pn: 2, khu: "Phú Mỹ Hưng", gia: 4800000000, ngay: 40000,
    mo: "Ban công rộng, trồng được cây.", phan: ["hanh", "Ban công trồng rau được hông con? Cô cho ít hạt giống."],
  },
  {
    id: "nha_hem", kieu: "nha_hem", mau: "#f5e6c8", ten: "Nhà trong Hẻm 42", dt: 48, pn: 3, khu: "cuối Hẻm 42", gia: 6500000000, ngay: 20000,
    mo: "Ngang 4m dài 12m, một trệt hai lầu, cách tiệm mấy bước.", uuDai: "Đón ba mẹ lên ở cùng",
    phan: ["sau", "Giờ con là người trong hẻm thiệt rồi đó. Bà mừng."],
  },
  {
    id: "ch100", kieu: "can_ho", tang: 8, rong: 62, sang: [16, 17], cao: true, song: true, mau: "#d6e4f0", ten: "Căn hộ 100m²", dt: 100, pn: 3, khu: "Thủ Thiêm", gia: 9800000000, ngay: 60000,
    mo: "Nhìn ra sông Sài Gòn, tầng cao.", phan: ["khoa", "Nhìn ra sông luôn! Tối giao đơn ngang qua, em thấy đèn nhà {ban}."],
  },
  {
    id: "nha_pho", kieu: "nha_pho", mau: "#f0dcc8", ten: "Nhà phố mặt tiền", dt: 100, pn: 4, khu: "đường lớn gần chợ", gia: 24000000000, ngay: 50000,
    mo: "Ngang 5m dài 20m, bốn tầng, trệt cho thuê được.", phan: ["tu", "Nhà mặt tiền! Chú chạy xe ôm hai chục năm chưa dám mơ tới."],
  },
  {
    id: "biet_thu", kieu: "biet_thu", mau: "#f4ead8", ten: "Biệt thự sân vườn", dt: 300, pn: 5, khu: "Thảo Điền", gia: 65000000000, ngay: 120000,
    mo: "Đất 300m², sân vườn, hồ bơi nhỏ.", phan: ["hana", "Wow! Tôi quay video nhà bạn được không?"],
  },
];
/* xe máy: nấc sau thay nấc trước, bán lại xe cũ */
const DS_XM = [
  { id: "xe_dap", kieu: "dap", mau: "#4f9d8b", ten: "Xe đạp", mo: "Đạp ra chợ mỗi sáng, tới nơi mồ hôi nhễ nhại." },
  {
    id: "wave", kieu: "so", mau: "#d23b3b", ten: "Honda Wave Alpha", dong: "xe số", gia: 22500000, ngay: 8000, gn: 0.03, uuDai: "Đi chợ sớm hơn, giá nhập giảm 3%",
    phan: ["tu", "Xe số bền lắm con. Hư gì kêu chú, chú sửa cho."],
  },
  {
    id: "vision", kieu: "ga", mau: "#f1efe8", ten: "Honda Vision", dong: "xe tay ga", gia: 33000000, ngay: 10000, gn: 0.04, uuDai: "Đi chợ sớm hơn, giá nhập giảm 4%",
    phan: ["tu", "Tay ga chạy êm. Mà nhớ đội nón bảo hiểm đàng hoàng nghen con."],
  },
  {
    id: "exciter", kieu: "con_tay", mau: "#2a5db0", mau2: "#1d2a44", ten: "Yamaha Exciter 155", dong: "xe côn tay", gia: 48000000, ngay: 12000, gn: 0.05, uuDai: "Đi chợ sớm hơn, giá nhập giảm 5%",
    phan: ["khoa", "Exciter! Xe tụi shipper mê nhất đó {ban}. Cho em chạy thử một vòng."],
  },
  {
    id: "sh", kieu: "ga_cao", mau: "#8a8f98", ten: "Honda SH 160i", dong: "xe tay ga cao cấp", gia: 95000000, ngay: 12000, gn: 0.05, uuDai: "Đi chợ sớm hơn, giá nhập giảm 5%",
    phan: ["hanh", "Đi SH rồi hả? Bán trà sữa mà sang dữ vậy con."],
  },
];
/* ô tô: chưa có thì thôi; đổi xe thì bán lại xe cũ. Xe hai cửa không chở hàng cho chi nhánh được */
const DS_OT = [
  {
    id: "vf3", kieu: "mini", dien: true, mau: "#8fd3b6", ten: "VinFast VF 3", dong: "xe điện mini", gia: 315000000, ngay: 30000, cn: 0.1, uuDai: "Chở hàng qua chi nhánh, đỡ 10% tiền hàng",
    phan: ["khoa", "Xe điện hả {ban}? Êm ru, chạy trong hẻm không ai nghe tiếng."],
  },
  {
    id: "morning", kieu: "hatch", mau: "#e8505b", ten: "Kia Morning", dong: "hatchback 5 chỗ", gia: 389000000, ngay: 55000, cn: 0.1, uuDai: "Chở hàng qua chi nhánh, đỡ 10% tiền hàng",
    phan: ["tu", "Chu choa, lên ô tô rồi! Bữa nào chở chú đi uống cà phê nghen."],
  },
  {
    id: "vios", kieu: "sedan", mau: "#c9ced6", ten: "Toyota Vios", dong: "sedan 5 chỗ", gia: 479000000, ngay: 60000, cn: 0.1, uuDai: "Chở hàng qua chi nhánh, đỡ 10% tiền hàng",
    phan: ["tu", "Xe này bền. Tết chở ba mẹ về quê ngon lành."],
  },
  {
    id: "cx5", kieu: "suv", mau: "#b3202c", ten: "Mazda CX-5", dong: "SUV 5 chỗ", gia: 799000000, ngay: 80000, cn: 0.1, uuDai: "Chở hàng qua chi nhánh, đỡ 10% tiền hàng",
    phan: ["hanh", "Xe đỏ đẹp dữ. Tết nhớ chở cô đi chợ hoa nghen."],
  },
  {
    id: "everest", kieu: "suv7", mau: "#3f6fb5", ten: "Ford Everest", dong: "SUV 7 chỗ", gia: 1300000000, ngay: 100000, cn: 0.12, uuDai: "Chở nhiều hàng, chi nhánh đỡ 12% tiền hàng",
    phan: ["sau", "Xe bảy chỗ hả? Vậy Tết chở bà với Mướp đi chơi được rồi."],
  },
  {
    id: "c300", kieu: "sang", mau: "#2d2f36", kinh: "#9fb5c4", ten: "Mercedes-Benz C 300", dong: "sedan hạng sang", gia: 2100000000, ngay: 150000, cn: 0.1, uuDai: "Chở hàng qua chi nhánh, đỡ 10% tiền hàng",
    phan: ["hanh", "Xe sang dữ… mà đậu trong hẻm cô sợ bị cạ đó con."],
  },
  {
    id: "macan", kieu: "suv_tt", mau: "#5c7a8a", ten: "Porsche Macan", dong: "SUV thể thao", gia: 3600000000, ngay: 200000, cn: 0.1, uuDai: "Chở hàng qua chi nhánh, đỡ 10% tiền hàng",
    phan: ["khoa", "Porsche luôn hả {ban}! Em chụp hình đăng nhóm shipper nha."],
  },
  {
    id: "p911", kieu: "the_thao", mau: "#f2c230", ten: "Porsche 911 Carrera", dong: "xe thể thao 2 cửa", gia: 8600000000, ngay: 300000, uuDai: "Cốp nhỏ, không chở hàng cho chi nhánh được",
    phan: ["tu", "Xe này hai cửa, chở chú hông nổi rồi. Mà đẹp thiệt!"],
  },
];
/* điện thoại: nấc sau thay nấc trước, bán lại máy cũ một nửa. Giá bán ở chuỗi lớn (thegioididong, FPT, apple.com/vn) cuối 9/2026.
   cam = số ống kính trên hình, gap = máy gập */
const DS_DT = [
  { id: "dt_cu", kieu: "dt", mau: "#6b6f78", ten: "Điện thoại cũ", mo: "Màn hình nứt một góc, sạc sáng thì chiều hết pin." },
  { id: "redmi", kieu: "dt", cam: 2, mau: "#4a6b8a", ten: "Xiaomi Redmi 15C", loai: "máy giá rẻ, pin 6.000mAh", gia: 3700000, onl: 0.03, uuDai: "Khách đặt app chờ lâu hơn 3%" },
  { id: "galaxy_a", kieu: "dt", cam: 3, mau: "#2d3a4a", ten: "Samsung Galaxy A17 5G", loai: "máy phổ thông", gia: 6500000, onl: 0.05, uuDai: "Khách đặt app chờ lâu hơn 5%" },
  {
    id: "reno", kieu: "dt", cam: 3, mau: "#c9d8e8", ten: "OPPO Reno15", loai: "máy tầm trung, chụp đẹp", gia: 16000000, onl: 0.08, khach: 0.01, uuDai: "Khách đặt app chờ lâu hơn 8%, ảnh tiệm đẹp nên khách ghé nhiều hơn 1%",
    phan: ["khoa", "Chụp ly trà đăng lên nhóm shipper đi {ban}. Đẹp vầy ai cũng ghé."],
  },
  { id: "ip_e", kieu: "dt", cam: 1, mau: "#f1efe8", ten: "iPhone 17e", loai: "iPhone giá mềm", gia: 18000000, onl: 0.1, khach: 0.01, uuDai: "Khách đặt app chờ lâu hơn 10%, khách ghé nhiều hơn 1%" },
  {
    id: "ip17", kieu: "dt", cam: 2, mau: "#b8c9e6", ten: "iPhone 17", loai: "iPhone đời trước", gia: 25000000, onl: 0.1, khach: 0.02, uuDai: "Khách đặt app chờ lâu hơn 10%, khách ghé nhiều hơn 2%",
    phan: ["hanh", "Điện thoại mới hả? Chụp giùm cô cái bảng hiệu bánh mì với."],
  },
  { id: "s_ultra", kieu: "dt", cam: 4, mau: "#3a3d44", ten: "Samsung Galaxy S26 Ultra", loai: "máy cao cấp, có bút S Pen", gia: 31000000, onl: 0.1, khach: 0.02, uuDai: "Khách đặt app chờ lâu hơn 10%, khách ghé nhiều hơn 2%" },
  {
    id: "fold", kieu: "dt", gap: true, mau: "#4a5563", ten: "Samsung Galaxy Z Fold8", loai: "máy gập", gia: 40000000, onl: 0.1, khach: 0.03, uuDai: "Khách đặt app chờ lâu hơn 10%, khách ghé nhiều hơn 3%",
    phan: ["tu", "Điện thoại gì mà gập được như cuốn sổ vậy con?"],
  },
  {
    id: "ip_pm", kieu: "dt", cam: 3, mau: "#2f4a6b", ten: "iPhone 18 Pro Max", loai: "iPhone mới nhất", gia: 42000000, onl: 0.1, khach: 0.03, uuDai: "Khách đặt app chờ lâu hơn 10%, khách ghé nhiều hơn 3%",
    phan: ["khoa", "Pro Max đời mới luôn! Quay video tiệm đăng nhóm shipper đi {ban}."],
  },
];
/* đồ cho bản thân, chia nhóm; không có ưu đãi, có người trong hẻm nhận xét. Giá ở cửa hàng chính hãng hay đại lý ở VN
   cuối 9/2026; túi LV, Chanel, Birkin không có giá niêm yết ở VN nên là giá quy đổi, Birkin là giá mua lại ngoài tiệm */
const DS_DO_NHOM = [["may_tinh", "Máy tính"], ["dong_ho", "Đồng hồ"], ["tui", "Túi xách"], ["thoi_trang", "Quần áo, giày, nước hoa"]];
const DS_DO = [
  { id: "laptop", nhom: "may_tinh", kieu: "laptop", mau: "#9aa3ab", ten: "ASUS Vivobook Go 15", gia: 13500000, mo: "Ryzen 5, RAM 16GB, ổ 512GB. Đủ làm sổ sách, đặt hàng.", phan: ["tin", "Mẹ: Mua máy tính chi vậy con.. Ờ, làm sổ sách thì được."] },
  { id: "mac_air", nhom: "may_tinh", kieu: "laptop", mau: "#c9ced6", ten: "MacBook Air 13 inch M5", gia: 36000000, mo: "Chip M5, RAM 16GB, ổ 512GB. Giá Apple sau đợt tăng giá tháng 6.", phan: ["khoa", "MacBook hả {ban}? Dân văn phòng em giao đơn ai cũng xài máy này."] },
  { id: "mac_pro", nhom: "may_tinh", kieu: "laptop", mau: "#5c6470", ten: "MacBook Pro 14 inch M5", gia: 55000000, mo: "Chip M5, màn 14 inch. Dựng video, chỉnh ảnh menu.", phan: ["hana", "Máy này dựng video mượt lắm. Tôi cũng dùng!"] },
  { id: "dong_ho", nhom: "dong_ho", kieu: "dong_ho", mau: "#c9ced6", mau2: "#3a3d44", ten: "Đồng hồ Casio", gia: 1000000, mo: "Dây kim loại, máy pin. Bền, rẻ, chạy đúng giờ.", phan: ["tu", "Có đồng hồ rồi thì mở cửa đúng giờ nghen con."] },
  { id: "seiko", nhom: "dong_ho", kieu: "dong_ho", mau: "#c9ced6", mau2: "#2a5db0", mat: "#1d3b6e", ten: "Seiko 5 Sports", gia: 6800000 },
  { id: "apple_watch", nhom: "dong_ho", kieu: "dong_ho", vuong: true, mau: "#2d2f36", mau2: "#f07c95", ten: "Apple Watch Series 12", gia: 11500000, mo: "Bản nhôm 42mm. Đếm bước, báo tin nhắn đơn hàng.", phan: ["khoa", "Đồng hồ đếm bước hả {ban}? Em chạy đơn một ngày chắc ba chục ngàn bước."] },
  { id: "tissot", nhom: "dong_ho", kieu: "dong_ho", mau: "#c9ced6", mau2: "#c9ced6", mat: "#2a4a7a", ten: "Tissot PRX Powermatic 80", gia: 17000000 },
  { id: "omega", nhom: "dong_ho", kieu: "dong_ho", mau: "#c9ced6", mau2: "#c9ced6", mat: "#1d4f7a", ten: "Omega Seamaster 300M", gia: 184000000, mo: "Đồng hồ lặn 300m. Giá cửa hàng, hãng không niêm yết ở VN.", phan: ["hanh", "Đồng hồ gì mà bằng mấy năm bán bánh mì của cô vậy con."] },
  { id: "rolex", nhom: "dong_ho", kieu: "dong_ho", mau: "#c9ced6", mau2: "#c9ced6", mat: "#1d2a44", ten: "Rolex Submariner", gia: 287000000, mo: "Bản thép, giá đề xuất của đại lý chính thức. Hàng thật thì hay phải chờ.", phan: ["tu", "Cái đồng hồ này bằng hơn chục ngàn ly trà sữa đó con!"] },
  { id: "vascara", nhom: "tui", kieu: "tui", mau: "#c96f5a", ten: "Túi Vascara", gia: 1500000, mo: "Túi đeo vai của hãng Việt.", phan: ["hanh", "Túi xinh. Đựng tiền lẻ bán hàng là vừa."] },
  { id: "charles", nhom: "tui", kieu: "tui", dang: "flap", mau: "#e8d8c8", ten: "Túi Charles & Keith", gia: 2600000 },
  { id: "coach", nhom: "tui", kieu: "tui", dang: "flap", mau: "#8a5a3b", ten: "Túi Coach Tabby", gia: 15000000 },
  { id: "lv", nhom: "tui", kieu: "tui", hoaVan: true, mau: "#8a5a3b", ten: "Louis Vuitton Neverfull MM", gia: 60000000, mo: "Túi tote họa tiết monogram. Giá quy đổi từ giá hãng.", phan: ["hanh", "Túi đẹp mà mắc. Cô bán bánh mì cả năm mới mua nổi."] },
  { id: "chanel", nhom: "tui", kieu: "tui", dang: "flap", mau: "#2d2f36", ten: "Chanel Classic Flap", gia: 308000000, mo: "Cỡ vừa. Giá quy đổi sau đợt tăng giá tháng 4.", phan: ["sau", "Cái túi bằng cả căn gác của bà hồi xưa đó con."] },
  { id: "birkin", nhom: "tui", kieu: "tui", dang: "birkin", mau: "#e08a3a", ten: "Hermès Birkin 25", gia: 900000000, mo: "Không mua thẳng ở cửa hàng được, giá mua lại ngoài tiệm.", phan: ["hana", "Birkin! Ở Paris người ta xếp hàng mấy năm mới mua được."] },
  { id: "ao", nhom: "thoi_trang", kieu: "ao", mau: "#7fb7a4", ten: "Áo khoác Uniqlo", gia: 980000, mo: "Áo khoác kéo khóa, mặc đi chợ sáng sớm.", phan: ["hanh", "Áo đẹp. Mà mặc đứng quầy coi chừng dính trà nghen."] },
  { id: "giay", nhom: "thoi_trang", kieu: "giay", mau: "#f1efe8", ten: "Giày Nike Air Force 1", gia: 2900000, mo: "Bản trắng kinh điển, giá chính hãng.", phan: ["khoa", "Giày trắng tinh! Đi hẻm mình mưa là dơ liền đó {ban}."] },
  { id: "nuoc_hoa", nhom: "thoi_trang", kieu: "nuoc_hoa", mau: "#cfe0f0", ten: "Nước hoa Dior Sauvage 100ml", gia: 3800000, mo: "Chai 100ml.", phan: ["khoa", "Thơm dữ {ban}! Khách chưa uống trà đã thấy thơm."] },
];
/* quà cho ba mẹ ở quê, chia nhóm; mẹ nhắn lại, hậu truyện nhắc (cờ ds_<id>). Giá ở siêu thị điện máy, tiệm vàng, công ty
   du lịch, bệnh viện cuối 9/2026; vàng theo giá nhẫn 9999 ngày 28/9/2026 (khoảng 14,2 triệu một chỉ) */
const DS_QUA_NHOM = [["dien_may", "Điện máy cho nhà ở quê"], ["rieng", "Quà riêng cho ba, cho mẹ"], ["vang", "Tiền biếu, vàng"], ["suc_khoe", "Sức khỏe"], ["di_choi", "Đi chơi"], ["nha_que", "Nhà ở quê"]];
const DS_QUA = [
  { id: "qua_dt", nhom: "dien_may", kieu: "dt", cam: 3, mau: "#2d3a4a", ten: "Điện thoại Galaxy A17", gia: 6500000, mo: "Màn to chữ to, gọi video với con mỗi tối.", tin: "Mẹ: Điện thoại mới chữ to dễ đọc. Mẹ gọi video thấy mặt con rồi." },
  { id: "qua_may_giat", nhom: "dien_may", kieu: "may_giat", mau: "#f5f5f5", ten: "Máy giặt Toshiba 9kg", gia: 5000000, mo: "Cửa trên, hợp nhà ở quê.", tin: "Mẹ: Có máy giặt rồi, mẹ đỡ đau lưng. Con đừng gửi nữa, để dành." },
  { id: "qua_loc_nuoc", nhom: "dien_may", kieu: "loc_nuoc", mau: "#dfe6ea", ten: "Máy lọc nước Kangaroo RO", gia: 7900000, mo: "Lọc nước giếng, nước máy uống liền.", tin: "Mẹ: Nước uống ngọt hơn nước giếng. Mẹ hết phải nấu nước sôi." },
  { id: "qua_tu_lanh", nhom: "dien_may", kieu: "tu_lanh", mau: "#dfe6ea", ten: "Tủ lạnh Panasonic 300L", gia: 10500000, mo: "Thay cái tủ cũ kêu rè rè.", tin: "Mẹ: Tủ lạnh to quá. Mẹ để dành cá kho gửi lên cho con." },
  { id: "qua_tivi", nhom: "dien_may", kieu: "tv", mau: "#8fd3ea", ten: "Tivi Samsung 55 inch 4K", gia: 12500000, mo: "Để ở nhà trên, cả xóm qua coi ké.", tin: "Mẹ: Ba coi đá banh trên tivi mới, hàng xóm qua coi ké đông nghẹt." },
  { id: "qua_may_lanh", nhom: "dien_may", kieu: "may_lanh", mau: "#f5f5f5", ten: "Máy lạnh Daikin 1 HP", gia: 14500000, mo: "Inverter, giá có cả công lắp.", tin: "Mẹ: Trưa nắng mà phòng mát rượi. Ba ngủ trưa ngáy to lắm." },
  { id: "qua_ao_dai", nhom: "rieng", kieu: "ao", mau: "#e8505b", ten: "Áo dài may đo cho mẹ", gia: 2500000, mo: "Vải lụa, may ở tiệm quen gần chợ.", tin: "Mẹ: Áo đẹp quá con. Mẹ để dành Tết mặc đi chùa." },
  { id: "qua_dong_ho", nhom: "rieng", kieu: "dong_ho", mau: "#e3c26a", mau2: "#8a5a3b", ten: "Đồng hồ tặng ba", gia: 3000000, mo: "Đồng hồ dây da cho ba đeo đi đám.", tin: "Mẹ: Ba đeo đồng hồ đi khoe khắp xóm. Ổng không nói mà mẹ biết ổng vui." },
  { id: "qua_xe_may", nhom: "rieng", kieu: "so", mau: "#d23b3b", ten: "Xe Wave Alpha cho ba", gia: 22500000, mo: "Thay chiếc xe cũ ba chạy ra đồng hai chục năm.", tin: "Mẹ: Ba chạy xe mới ra đồng, gặp ai cũng khoe con mua." },
  { id: "qua_bieu", nhom: "vang", kieu: "phong_bi", mau: "#e84a5f", ten: "Lì xì, biếu Tết ba mẹ", gia: 10000000, mo: "Phong bì đỏ gửi về trước Tết.", tin: "Mẹ: Con gửi chi nhiều vậy.. Mẹ cất, Tết con về mẹ nấu thịt kho." },
  { id: "qua_nhan", nhom: "vang", kieu: "vang", ten: "Nhẫn vàng 9999 một chỉ", gia: 14200000, mo: "Giá nhẫn trơn ngày 28/9/2026, khoảng 14,2 triệu một chỉ.", tin: "Mẹ: Nhẫn vàng đeo tay mẹ vừa khít. Mẹ cất để dành cho con." },
  { id: "qua_day_chuyen", nhom: "vang", kieu: "vang", day: true, ten: "Dây chuyền vàng hai chỉ", gia: 29500000, mo: "Vàng 24K, cả tiền công.", tin: "Mẹ: Đeo đi đám cưới ở xóm, ai cũng hỏi con mua ở đâu." },
  { id: "qua_kham", nhom: "suc_khoe", kieu: "suc_khoe", mau: "#7fb7a4", ten: "Khám tổng quát cho ba mẹ", gia: 6000000, mo: "Gói cơ bản cho hai người ở bệnh viện trên thành phố.", tin: "Mẹ: Bác sĩ nói ba mẹ khỏe. Ba bớt thuốc lá rồi đó con." },
  { id: "qua_bao_hiem", nhom: "suc_khoe", kieu: "suc_khoe", mau: "#ef6f8e", ten: "Bảo hiểm sức khỏe một năm", gia: 11000000, mo: "Cho ba mẹ ngoài 60, hai người.", tin: "Mẹ: Có bảo hiểm rồi, ba mẹ yên tâm đi khám. Con lo xa ghê." },
  { id: "qua_ghe", nhom: "suc_khoe", kieu: "ghe", mau: "#8a5a3b", ten: "Ghế massage Kingsport", gia: 16000000, mo: "Loại phổ thông, êm lưng cho ba.", tin: "Mẹ: Ba ngồi ghế massage xong ngủ quên luôn trên ghế.." },
  { id: "qua_da_lat", nhom: "di_choi", kieu: "may_bay", mau: "#7fb7a4", ten: "Tour Đà Lạt 3 ngày 2 đêm", gia: 5000000, mo: "Hai người, xe giường nằm, khách sạn 2 đến 3 sao.", tin: "Mẹ: Đà Lạt lạnh mà vui. Ba mua cả giỏ dâu về cho hàng xóm." },
  { id: "qua_du_lich", nhom: "di_choi", kieu: "may_bay", mau: "#8fd3ea", ten: "Bay ra biển Nha Trang", gia: 12000000, mo: "Hai người, vé máy bay và khách sạn gần biển.", tin: "Mẹ: Lần đầu ba mẹ đi biển từ hồi cưới. Ba cười suốt." },
  { id: "qua_nhat", nhom: "di_choi", kieu: "may_bay", mau: "#f07c95", ten: "Tour Nhật Bản 5 ngày", gia: 60000000, mo: "Hai người, Tokyo và núi Phú Sĩ mùa lá đỏ, cả visa.", tin: "Mẹ: Ba mẹ đi Nhật ngắm lá đỏ. Ba khoe hình với cả xã." },
  { id: "qua_mai_nha", nhom: "nha_que", kieu: "nha_que", mau: "#f3e3c8", mau2: "#9aa3ab", ten: "Lợp lại mái tôn", gia: 55000000, mo: "Tôn ba lớp chống nóng, khoảng 120m² mái.", tin: "Mẹ: Mưa bão mà nhà hết dột. Ba ngồi ngắm cái mái mới hoài." },
  { id: "qua_xay_nha", nhom: "nha_que", kieu: "nha_que", mau: "#f5e6c8", mau2: "#b2573f", ten: "Xây lại nhà ở quê", gia: 1000000000, mo: "Phá nhà cũ, xây nhà cấp 4 mới trên đất 100m².", tin: "Mẹ: Nhà mới xây xong rồi con.. Ba mẹ để dành một phòng cho con." },
];
/* bản 5.0: nhà xe giá thu nhỏ, vài món không còn trong danh sách; bản lưu cũ đã mua thì hoàn lại tiền đã trả */
const DS_GIA_CU = {
  can_ho: 180000000, nha_hem: 350000000, xe_so: 3500000, xe_ga: 9000000, o_to_cu: 60000000, o_to: 110000000,
  dt_tot: 1500000, dt_xin: 6000000, tui: 4000000, dong_ho_xin: 25000000,
};

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
};

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
    id: "wave", kieu: "so", mau: "#d23b3b", ten: "Honda Wave Alpha", dong: "xe số", gia: 18500000, ngay: 8000, gn: 0.03, uuDai: "Đi chợ sớm hơn, giá nhập giảm 3%",
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
const DS_DT = [
  { id: "dt_cu", ic: "📱", ten: "Điện thoại cũ", mo: "Màn hình nứt một góc, sạc sáng thì chiều hết pin." },
  { id: "dt_tot", ic: "📱", ten: "Điện thoại thông minh", gia: 1500000, onl: 0.1, uuDai: "Khách đặt app chờ lâu hơn 10%" },
  {
    id: "dt_xin", ic: "📸", ten: "Điện thoại chụp ảnh đẹp", gia: 6000000, onl: 0.1, khach: 0.03, uuDai: "Khách đặt app chờ lâu hơn 10%, ảnh tiệm đẹp nên khách ghé nhiều hơn 3%",
    phan: ["khoa", "Chụp ly trà đăng lên nhóm shipper đi {ban}. Đẹp vầy ai cũng ghé."],
  },
];
/* đồ cho bản thân: không có ưu đãi, chỉ là thích */
const DS_DO = [
  { id: "ao", ic: "🧥", ten: "Áo khoác mới", gia: 600000, phan: ["hanh", "Áo đẹp. Mà mặc đứng quầy coi chừng dính trà nghen."] },
  { id: "dong_ho", ic: "⌚", ten: "Đồng hồ đeo tay", gia: 1500000, phan: ["tu", "Có đồng hồ rồi thì mở cửa đúng giờ nghen con."] },
  { id: "tui", ic: "👜", ten: "Túi da thủ công", gia: 4000000, phan: ["hanh", "Túi đẹp mà mắc. Cô bán bánh mì cả tháng mới mua nổi."] },
  { id: "laptop", ic: "💻", ten: "Máy tính xách tay", gia: 12000000, phan: ["tin", "Mẹ: Mua máy tính chi vậy con.. Ờ, làm sổ sách thì được."] },
  { id: "dong_ho_xin", ic: "⌚", ten: "Đồng hồ xịn", gia: 25000000, phan: ["tu", "Cái đồng hồ này bằng mấy trăm ly trà sữa đó con!"] },
];
/* quà cho gia đình: mẹ nhắn lại, hậu truyện nhắc (cờ ds_<id>) */
const DS_QUA = [
  { id: "qua_ao_dai", ic: "👘", ten: "Áo dài cho mẹ", gia: 2500000, tin: "Mẹ: Áo đẹp quá con. Mẹ để dành Tết mặc đi chùa." },
  { id: "qua_dong_ho", ic: "⌚", ten: "Đồng hồ tặng ba", gia: 3000000, tin: "Mẹ: Ba đeo đồng hồ đi khoe khắp xóm. Ổng không nói mà mẹ biết ổng vui." },
  { id: "qua_may_giat", ic: "🧺", ten: "Máy giặt cho nhà ở quê", gia: 8000000, tin: "Mẹ: Có máy giặt rồi, mẹ đỡ đau lưng. Con đừng gửi nữa, để dành." },
  { id: "qua_du_lich", ic: "🏖️", ten: "Đưa ba mẹ đi biển", gia: 15000000, tin: "Mẹ: Lần đầu ba mẹ đi biển từ hồi cưới. Ba cười suốt." },
  { id: "qua_mai_nha", ic: "🏠", ten: "Lợp lại mái nhà ở quê", gia: 30000000, tin: "Mẹ: Mưa bão mà nhà hết dột. Ba ngồi ngắm cái mái mới hoài." },
];
/* bản 5.0: nhà xe giá thu nhỏ; bản lưu cũ đã mua thì hoàn lại tiền đã trả */
const DS_GIA_CU = { can_ho: 180000000, nha_hem: 350000000, xe_so: 3500000, xe_ga: 9000000, o_to_cu: 60000000, o_to: 110000000 };

/* Đời sống của chủ tiệm: chỗ ở, đi lại, điện thoại, đồ cho bản thân, quà cho gia đình. Nạp trước game.js.
   Giá thu nhỏ theo cùng tỉ lệ với tiền nhà (khoảng 1/5 đến 1/8 ngoài đời), nên mua nhà là mục tiêu dài, sau khi hết truyện.
   Không dùng tên thương hiệu thật. ngay = tốn mỗi ngày mở tiệm (tiền trọ, phí quản lý, xăng); coc = đặt cọc khi thuê
   (dọn đi thì lấy lại); gia = mua một lần (xe, điện thoại đổi đời mới thì bán lại đồ cũ được một nửa).
   Ưu đãi: gn = giá nhập giảm, cn = tiền hàng chi nhánh giảm, onl = khách đặt app chờ lâu hơn, khach = khách ghé nhiều hơn.
   phan = câu một người trong hẻm nói khi mua (như câu thoại truyện). */
const DS = {
  anUong: 20000 /* ăn uống mỗi ngày mở tiệm */,
  banLai: 0.5 /* đổi xe, đổi điện thoại thì bán lại đồ cũ được bấy nhiêu */,
};
const DS_O = [
  { id: "tro_ghep", ic: "🛏️", ten: "Ở ghép phòng trọ", ngay: 20000, mo: "Phòng trọ chung với hai bạn, đạp xe ra tiệm mười lăm phút." },
  {
    id: "tro_rieng", ic: "🚪", ten: "Phòng trọ riêng gần hẻm", ngay: 45000, coc: 900000, mo: "Một mình một phòng, đi bộ ra tiệm năm phút.",
    phan: ["sau", "Ở gần vậy thì sáng nào bà cũng kêu con dậy nấu hàng nghen."],
  },
  {
    id: "can_ho_thue", ic: "🏢", ten: "Thuê căn hộ nhỏ", ngay: 110000, coc: 3300000, mo: "Có bếp, có phòng cho ba mẹ lên chơi.", uuDai: "Tết ba mẹ lên thì ở lại nhà bạn",
    phan: ["tin", "Mẹ: Có phòng cho ba mẹ hả con.. Vậy Tết mẹ lên ở mấy bữa."],
  },
  {
    id: "can_ho", ic: "🏙️", ten: "Mua căn hộ nhỏ", gia: 180000000, ngay: 20000, mo: "Căn hộ của riêng mình, chỉ còn phí quản lý.", uuDai: "Tết ba mẹ lên thì ở lại nhà bạn",
    phan: ["tin", "Mẹ: Con mua nhà thiệt hả.. Ba đọc tin nhắn xong đi ra sân đứng hoài."],
  },
  {
    id: "nha_hem", ic: "🏡", ten: "Mua nhà trong Hẻm 42", gia: 350000000, ngay: 15000, mo: "Căn nhà cuối hẻm, cách tiệm mấy bước. Đủ chỗ đón ba mẹ lên ở cùng.", uuDai: "Đón ba mẹ lên ở cùng",
    phan: ["sau", "Giờ con là người trong hẻm thiệt rồi đó. Bà mừng."],
  },
];
const DS_XE = [
  { id: "xe_dap", ic: "🚲", ten: "Xe đạp", mo: "Đạp ra chợ mỗi sáng, tới nơi mồ hôi nhễ nhại." },
  {
    id: "xe_so", ic: "🏍️", ten: "Xe số cũ", gia: 3500000, ngay: 10000, gn: 0.03, uuDai: "Đi chợ sớm hơn, giá nhập giảm 3%",
    phan: ["tu", "Xe số bền lắm con. Hư gì kêu chú, chú sửa cho."],
  },
  {
    id: "xe_ga", ic: "🛵", ten: "Xe tay ga", gia: 9000000, ngay: 12000, gn: 0.05, uuDai: "Đi chợ sớm hơn, giá nhập giảm 5%",
    phan: ["khoa", "Xe mới đẹp dữ {ban}! Bữa nào cho em chạy thử một vòng."],
  },
  {
    id: "o_to_cu", ic: "🚗", ten: "Ô tô cũ", gia: 60000000, ngay: 40000, gn: 0.05, cn: 0.1, uuDai: "Giá nhập giảm 5%, chở hàng qua chi nhánh đỡ 10% tiền hàng",
    phan: ["tu", "Chu choa, lên ô tô rồi! Bữa nào chở chú đi uống cà phê nghen."],
  },
  {
    id: "o_to", ic: "🚙", ten: "Ô tô mới", gia: 110000000, ngay: 45000, gn: 0.05, cn: 0.1, uuDai: "Giá nhập giảm 5%, chở hàng qua chi nhánh đỡ 10% tiền hàng",
    phan: ["hanh", "Xe mới cáu. Tết nhớ chở cô đi chợ hoa nghen."],
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

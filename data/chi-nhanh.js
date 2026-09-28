/* Chi nhánh (bậc 3): tiệm thứ hai, chọn một trong ba loại, quản lý tự bán, tiệm gốc làm bếp trung tâm.
   Chi nhánh chỉ bán vào những ngày bạn mở tiệm gốc (tắt game thì không tự cộng tiền). Nạp trước game.js.
   Tiền nhà thu nhỏ theo cùng tỉ lệ với mặt tiền. */
const CHI_NHANH = {
  sauMatTien: 14 /* đã ra mặt tiền ít nhất bấy nhiêu ngày */,
  sao: 4.3,
  cocNgay: 12 /* cọc bằng bấy nhiêu ngày tiền nhà */,
  hopDong: 28 /* ngày mỗi kỳ hợp đồng */,
  luongQl: 300000 /* lương quản lý mỗi ngày, cộng thêm phần trăm doanh thu chi nhánh */,
  phanTramQl: 0.05,
  luongPhu: 150000 /* người phụ ở chi nhánh */,
  capPhu: 35 /* người phụ bán thêm được bấy nhiêu ly mỗi ngày */,
  muaNgoai: 1.2 /* hàng mua ngoài đắt hơn hàng tiệm gốc nấu */,
  sangNhuong: 0.6 /* sang nhượng thì lấy lại phần tiền trang trí này */,
  diemPhoTra: 8 /* có chi nhánh thì cộng điểm Phố Trà */,
};

/* cau: khách mỗi ngày thường; cuoiTuan, thi (tuần thi), mua (mưa), nong (nắng nóng): nhân vào lượng khách;
   gia: giá mỗi ly so với tiệm gốc; phanTram: phần doanh thu nộp cho trung tâm; capMax: bán tối đa (ít chỗ) */
const CN_LOAI = [
  {
    id: "truong", ic: "🎒", ten: "Chi nhánh gần trường", ngan: "gần trường",
    thue: 150000, trangTri: 3000000, cau: 105, cuoiTuan: 0.4, thi: 0.5, mua: 0.75, nong: 1.15, gia: 0.8,
    mo: "Học sinh đông, thích ngọt và nhiều topping, giá mềm hơn tiệm gốc. Cuối tuần và tuần thi vắng.",
  },
  {
    id: "vp", ic: "🏢", ten: "Chi nhánh dưới toà văn phòng", ngan: "toà văn phòng",
    thue: 300000, trangTri: 4000000, cau: 95, cuoiTuan: 0.3, mua: 0.85, nong: 1.1, gia: 1.15,
    mo: "Trưa ngày thường đông nghẹt, khách chịu chi hơn. Cuối tuần gần như vắng.",
  },
  {
    id: "kiosk", ic: "🛍️", ten: "Kiosk trong trung tâm thương mại", ngan: "kiosk",
    thue: 180000, phanTram: 0.08, trangTri: 2000000, cau: 72, cuoiTuan: 1.2, mua: 1, nong: 1, gia: 1, capMax: 85,
    mo: "Không sợ mưa nắng, khách đều cả tuần, cuối tuần đông hơn. Chỉ 2 chỗ nên bán có hạn, trung tâm lấy 8% doanh thu.",
  },
];
const CN_TEN_QL = ["Chị Ngọc", "Anh Tâm", "Chị Uyên", "Anh Phát", "Chị Diễm"];

/* tình huống buổi sáng, tối đa một mỗi ngày: a tốn tiền (gia), b chịu thiệt kiểu khác. {ql} = tên quản lý.
   Hệ quả nằm trong cnChonViec (src/chi-nhanh.js). */
const CN_VIEC = {
  may: { t: "Máy dán nắp hư", chu: "{ql} gọi báo: máy dán nắp ở chi nhánh hư từ tối qua, phải dán tay từng ly.", a: "Gọi thợ sửa liền", gia: 500000, b: "Để cuối tuần sửa (3 ngày bán chậm)" },
  hang: { t: "Chi nhánh hết trân châu", chu: "Hôm qua chi nhánh hết trân châu từ giữa buổi, khách hỏi hoài.", a: "Mua gấp chỗ quen", gia: 300000, b: "Hôm nay bán món khác (ít khách hơn)" },
  che: { t: "Khách chê trên mạng", chu: "Một khách chê chi nhánh pha nhạt, bài đăng được nhiều người thả tim.", a: "Xin lỗi, tặng phiếu giảm giá", gia: 250000, b: "Kệ, mai pha kỹ hơn (sao chi nhánh giảm)" },
  luong: { t: "{ql} lên nghề", chu: "{ql} quản lý chi nhánh giỏi lên, xin tăng lương 10%.", a: "Tăng lương", gia: 0, b: "Để sau (vài ngày làm chậm)" },
  nha: { t: "Chủ nhà báo tăng giá", chu: "Hết kỳ hợp đồng, chủ nhà chi nhánh muốn tăng tiền nhà 10%.", a: "Đồng ý tăng 10%", gia: 0, b: "Thương lượng (có khi giữ giá, có khi tăng 20%)" },
  truong: { t: "Trường xin tài trợ hội thao", chu: "Thầy giám thị hỏi chi nhánh tài trợ 40 ly nước cho hội thao.", a: "Tài trợ, học sinh nhớ tiệm", gia: 400000, b: "Từ chối khéo" },
  vp: { t: "Công ty đặt tiệc", chu: "Công ty tầng 5 đặt 40 ly cho buổi tiệc chiều nay.", a: "Nhận, thuê thêm người hôm nay", gia: 150000, b: "Từ chối, sợ làm không kịp" },
  kiosk: { t: "Trung tâm chạy khuyến mãi", chu: "Trung tâm thương mại chạy khuyến mãi hai ngày, rủ các kiosk giảm giá 10%.", a: "Tham gia (khách đông hơn, giá giảm)", gia: 0, b: "Thôi, giữ giá" },
};

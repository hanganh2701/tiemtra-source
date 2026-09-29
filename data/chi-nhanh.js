/* Chi nhánh (bậc 3): tiệm thứ hai, chọn một trong ba loại, quản lý tự bán, tiệm gốc làm bếp trung tâm.
   Chi nhánh chỉ bán vào những ngày bạn mở tiệm gốc (tắt game thì không tự cộng tiền). Nạp trước game.js.
   Giá theo ngoài đời ở TP.HCM (tra 29/09/2026, bản 5.2.1), cùng thang với giá xe, nhà ở tab Đời sống. Chi nhánh bán 50–100 ly
   mỗi ngày nên tính như một quầy take-away nhỏ: gần trường 8–12 triệu/tháng, tầng trệt toà văn phòng 12–25 triệu cộng phí dịch vụ,
   kiosk trung tâm thương mại ngoại ô tiền thuê thấp cộng phần trăm doanh thu; cọc 2–3 tháng; sang lại quầy cũ kèm đồ nghề
   (sangLai) vài chục triệu. cocNgay = cọc bằng bấy nhiêu ngày tiền nhà. Hợp đồng 6 tháng. */
const CHI_NHANH = {
  sauMatTien: 14 /* đã ra mặt tiền ít nhất bấy nhiêu ngày */,
  sao: 4.3,
  cocNgay: 60 /* cọc bằng bấy nhiêu ngày tiền nhà, loại nào không ghi riêng */,
  hopDong: 180 /* ngày mỗi kỳ hợp đồng (6 tháng); hết kỳ thì chủ nhà tăng giá */,
  luongQl: 350000 /* lương quản lý mỗi ngày, cộng thêm phần trăm doanh thu chi nhánh */,
  phanTramQl: 0.12,
  capGoc: 40 /* sức bán mỗi ngày của quản lý: capGoc + capBac × tay nghề */,
  capBac: 12,
  luongPhu: 150000 /* người phụ ở chi nhánh */,
  capPhu: 30 /* người phụ bán thêm được bấy nhiêu ly mỗi ngày */,
  muaNgoai: 1.3 /* hàng mua ngoài đắt hơn hàng tiệm gốc nấu */,
  lapLai: 7 /* một tình huống không lặp lại trong bấy nhiêu ngày */,
  sangNhuong: 0.6 /* sang nhượng lại cho người khác thì lấy lại phần này của tiền sang lại và trang trí */,
  diemPhoTra: 8 /* có chi nhánh thì cộng điểm Phố Trà */,
};

/* cau: khách mỗi ngày thường; cuoiTuan, thi (tuần thi), mua (mưa), nong (nắng nóng): nhân vào lượng khách;
   gia: giá mỗi ly so với tiệm gốc; phanTram: phần doanh thu nộp cho trung tâm; capMax: bán tối đa (ít chỗ) */
const CN_LOAI = [
  {
    id: "truong", ic: "🏫", ten: "Chi nhánh gần trường", ngan: "gần trường",
    thue: 300000, cocNgay: 60, trangTri: 5000000, sangLai: 30000000, cau: 105, cuoiTuan: 0.4, thi: 0.5, mua: 0.75, nong: 1.15, gia: 0.85,
    mo: "Học sinh đông, thích ngọt và nhiều topping, giá mềm hơn tiệm gốc. Cuối tuần và tuần thi vắng.",
  },
  {
    id: "vp", ic: "🏢", ten: "Chi nhánh dưới toà văn phòng", ngan: "toà văn phòng",
    thue: 500000, cocNgay: 90, trangTri: 8000000, sangLai: 40000000, cau: 95, cuoiTuan: 0.3, mua: 0.85, nong: 1.1, gia: 1.1,
    mo: "Trưa ngày thường đông nghẹt, khách chịu chi hơn. Cuối tuần gần như vắng.",
  },
  {
    id: "kiosk", ic: "🛍️", ten: "Kiosk trong trung tâm thương mại", ngan: "kiosk",
    thue: 250000, phanTram: 0.12, cocNgay: 90, trangTri: 25000000, sangLai: 0, cau: 72, cuoiTuan: 1.2, mua: 1, nong: 1, gia: 1, capMax: 85,
    mo: "Không sợ mưa nắng, khách đều cả tuần, cuối tuần đông hơn. Chỉ 2 chỗ nên bán có hạn, trung tâm lấy 12% doanh thu. Làm quầy mới theo chuẩn trung tâm.",
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
  nha: { t: "Chủ nhà báo tăng giá", chu: "Hết kỳ hợp đồng sáu tháng, chủ nhà chi nhánh muốn tăng tiền nhà 6%.", a: "Đồng ý tăng 6%", gia: 0, b: "Thương lượng (có khi giữ giá, có khi tăng 12%)" },
  truong: { t: "Trường xin tài trợ hội thao", chu: "Thầy giám thị hỏi chi nhánh tài trợ 40 ly nước cho hội thao.", a: "Tài trợ, học sinh nhớ tiệm", gia: 400000, b: "Từ chối khéo" },
  vp: { t: "Công ty đặt tiệc", chu: "Công ty tầng 5 đặt 40 ly cho buổi tiệc chiều nay.", a: "Nhận, thuê thêm người hôm nay", gia: 150000, b: "Từ chối, sợ làm không kịp" },
  kiosk: { t: "Trung tâm chạy khuyến mãi", chu: "Trung tâm thương mại chạy khuyến mãi hai ngày, rủ các kiosk giảm giá 10%.", a: "Tham gia (khách đông hơn, giá giảm)", gia: 0, b: "Thôi, giữ giá" },
};

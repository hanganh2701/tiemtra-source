/* Trang trí tiệm: mua một lần, ưu đãi nhỏ, hiện trước tiệm và trong ảnh khoe tiệm. Hình ở img/tt_<id>.svg.
   cho = khách chờ lâu hơn, tip = tiền tip, khach = khách ghé nhiều hơn, nong = ngày nắng nóng khách chờ lâu hơn. */
const TRANG_TRI = [
  { id: "chuong", ten: "Chuông gió", gia: 200000, uuDai: "Tiền tip tăng 3%", tip: 0.03 },
  { id: "tranh", ten: "Tranh Mướp", gia: 250000, uuDai: "Khách ghé nhiều hơn 2%", khach: 0.02 },
  { id: "cay", ten: "Chậu trầu bà", gia: 300000, uuDai: "Khách chờ lâu hơn 3%", cho: 0.03 },
  { id: "bang", ten: "Bảng phấn vẽ tay", gia: 400000, uuDai: "Khách ghé nhiều hơn 2%", khach: 0.02 },
  { id: "sach", ten: "Kệ sách cũ", gia: 450000, uuDai: "Khách chờ lâu hơn 3%", cho: 0.03 },
  { id: "den", ten: "Dây đèn lồng", gia: 500000, uuDai: "Tiền tip tăng 5%", tip: 0.05 },
  { id: "ghe", ten: "Ghế đẩu nhựa đỏ", gia: 600000, uuDai: "Khách chờ lâu hơn 4%", cho: 0.04 },
  { id: "quat", ten: "Quạt máy", gia: 700000, uuDai: "Ngày nắng nóng khách chờ lâu hơn 10%", nong: 0.1 },
];

/* Góp sức cho Hẻm 42: việc chung của xóm cho người chơi dư tiền về sau. Góp một lần, ưu đãi nhỏ cộng chung với trang trí
   (khach, cho, tip; mua = ngày mưa bớt vắng), hiện trước tiệm, có lời cảm ơn. mo: tuNgay = từ ngày, xem = sau cảnh này
   (tới ngày chot thì mở luôn cho người chưa thấy cảnh); goi = gợi ý lúc chưa mở. cam: câu thoại như cảnh truyện. */
const GOP_HEM = [
  {
    id: "den", ic: "💡", ten: "Đèn cho con hẻm", gia: 3000000, mo: { tuNgay: 15 }, goi: "Từ ngày 15",
    uuDai: "Khách ghé nhiều hơn 3%", khach: 0.03,
    cam: [["khoa", "Tối về hẻm sáng trưng. Tụi shipper em hết sợ té ổ gà rồi {ban}!"]],
  },
  {
    id: "mai_che", ic: "☂️", ten: "Mái che mưa đầu hẻm", gia: 5000000, mo: { xem: "khoa_2", chot: 30 }, goi: "Sau hôm Khoa trú mưa ở tiệm",
    uuDai: "Ngày mưa khách vắng ít hơn", mua: 0.2,
    cam: [["khoa", "Mưa cỡ nào tụi em cũng có chỗ đứng đợi đơn. Đã ghê {ban}!"]],
  },
  {
    id: "ghe_da", ic: "🪑", ten: "Băng ghế đá cho chú Tư", gia: 4000000, mo: { xem: "tu_3", chot: 30 }, goi: "Khi thân hơn với chú Tư",
    uuDai: "Khách chờ lâu hơn 5%", cho: 0.05,
    cam: [["tu", "Có ghế đá trước tiệm con rồi. Chú ngồi đợi cuốc khỏi đứng nắng!"]],
  },
  {
    id: "long_den", ic: "🏮", ten: "Lồng đèn cho con nít trong hẻm", gia: 3000000, mo: { xem: "c2_trung_thu" }, goi: "Sau Trung Thu trong hẻm",
    uuDai: "Tiền tip tăng 5%", tip: 0.05,
    cam: [["hanh", "Đứa nào trong hẻm cũng có lồng đèn. Chịu chi dữ… mà cô thích."]],
  },
  {
    id: "hoc_bong", ic: "🎒", ten: "Quỹ học bổng Hẻm 42", gia: 8000000, mo: { tuNgay: 40 }, goi: "Từ ngày 40",
    uuDai: "Khách ghé nhiều hơn 3%", khach: 0.03,
    cam: [
      ["linh", "Tụi nhỏ trong hẻm có tiền mua sách rồi. Em mừng muốn khóc {ban} ơi.", { khongNhanh: { linh: "B" } }],
      ["tin", "Linh: Mẹ em kể tiệm lập quỹ học bổng. Em ở Đà Lạt mà mừng quá!", { nhanh: { linh: "B" } }],
    ],
  },
  {
    id: "quan_nuoc", ic: "🍵", ten: "Dựng lại quán nước của bà Sáu", gia: 15000000, mo: { xem: "c2_ba_sau" }, goi: "Khi bà Sáu kể chuyện quán nước",
    uuDai: "Tiền tip tăng 5%", tip: 0.05,
    cam: [
      ["_", "(Cái chõng tre với ấm trà cũ được kê lại dưới gác bà Sáu.)"],
      ["sau", "Quán nước này… bà tưởng hổng bao giờ thấy lại."],
      ["sau", "Thôi, con lo bán đi. Đứng đây hoài bà khóc."],
    ],
  },
];

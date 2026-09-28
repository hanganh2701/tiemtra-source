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

/* Bảng xếp hạng Phố Trà: các tiệm trong khu (tên hư cấu). Điểm theo ngày của người chơi:
   diem = goc + tang * ngay, cộng đường cong riêng nếu có (mốt lên rồi xuống, chuỗi mới mở).
   Tiệm có tuNgay chỉ xuất hiện từ ngày đó. Nạp trước game.js.
   Cân sau đợt chơi thử: người chơi giỏi đứng khoảng hạng 2–3 lúc đầu, lên hạng 1 khoảng ngày 40 nếu đã ra mặt tiền;
   chuỗi Mây Tea là đối thủ khó nhất từ ngày 30. tran = điểm tối đa (người chơi tối đa khoảng 146 khi đủ sổ và ra mặt tiền). */
const PHO_TRA = [
  { id: "baychu", tran: 50, ten: "Quán Nước Chú Bảy", goc: 30, tang: 0.2, tinh: "Quán cóc đầu chợ, trà đá miễn phí, khách toàn người quen." },
  { id: "hanh", tran: 90, ten: "Bánh Mì & Trà Cô Hạnh", goc: 45, tang: 0.5, tinh: "Bên kia hẻm. Bánh mì ngon, trà thì… đang học." },
  { id: "meomun", tran: 100, ten: "Tiệm Nhà Mèo Mun", goc: 55, tang: 0.6, tinh: "Hai chị em sinh viên mở, decor mèo dễ thương." },
  { id: "hoian", tran: 110, ten: "Boba Hội An", goc: 70, tang: 0.5, tinh: "Mang trà sữa kiểu phố cổ vào Sài Gòn." },
  { id: "chanh", tran: 95, ten: "Trà Chanh Giã Tay Bờ Kè", goc: 60, tang: 0.3, mot: { dinh: 18, cao: 25, rong: 10 }, tinh: "Nổi như cồn trên mạng rồi nguội dần." },
  { id: "bay7k", tran: 90, ten: "Trà Sữa 7K Sinh Viên", goc: 70, tang: 0.1, tuNgay: 12, mot: { dinh: 20, cao: 20, rong: 14 }, tinh: "Siêu rẻ, xếp hàng dài, nhưng ít người quay lại." },
  { id: "matcha", tran: 126, ten: "Matcha Mộc", goc: 88, tang: 0.5, tinh: "Matcha pha tay, giá cao, khách văn phòng." },
  { id: "olong", tran: 138, ten: "Olong Đà Lạt House", goc: 100, tang: 0.55, tinh: "Trà olong vùng cao, quán rộng có máy lạnh." },
  { id: "may", tran: 150, ten: "Chuỗi Mây Tea", goc: 108, tang: 0.6, tuNgay: 30, tinh: "Chuỗi lớn vừa mở ở đầu hẻm. Quản lý là cháu cô Hạnh." },
];

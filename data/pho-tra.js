/* Bảng xếp hạng Phố Trà: các tiệm trong khu (tên hư cấu). Điểm theo ngày của người chơi:
   diem = goc + tang * ngay, cộng đường cong riêng nếu có (mốt lên rồi xuống, chuỗi mới mở).
   Tiệm có tuNgay chỉ xuất hiện từ ngày đó. Nạp trước game.js. */
const PHO_TRA = [
  { id: "baychu", ten: "Quán Nước Chú Bảy", goc: 22, tang: 0.15, tinh: "Quán cóc đầu chợ, trà đá miễn phí, khách toàn người quen." },
  { id: "hanh", ten: "Bánh Mì & Trà Cô Hạnh", goc: 30, tang: 0.45, tinh: "Bên kia hẻm. Bánh mì ngon, trà thì… đang học." },
  { id: "meomun", ten: "Tiệm Nhà Mèo Mun", goc: 34, tang: 0.55, tinh: "Hai chị em sinh viên mở, decor mèo dễ thương." },
  { id: "hoian", ten: "Boba Hội An", goc: 42, tang: 0.4, tinh: "Mang trà sữa kiểu phố cổ vào Sài Gòn." },
  { id: "chanh", ten: "Trà Chanh Giã Tay Bờ Kè", goc: 38, tang: 0.2, mot: { dinh: 18, cao: 22, rong: 10 }, tinh: "Nổi như cồn trên mạng rồi nguội dần." },
  { id: "bay7k", ten: "Trà Sữa 7K Sinh Viên", goc: 45, tang: 0.05, tuNgay: 12, mot: { dinh: 20, cao: 15, rong: 14 }, tinh: "Siêu rẻ, xếp hàng dài, nhưng ít người quay lại." },
  { id: "matcha", ten: "Matcha Mộc", goc: 52, tang: 0.35, tinh: "Matcha pha tay, giá cao, khách văn phòng." },
  { id: "olong", ten: "Olong Đà Lạt House", goc: 60, tang: 0.3, tinh: "Trà olong vùng cao, quán rộng có máy lạnh." },
  { id: "may", ten: "Chuỗi Mây Tea", goc: 70, tang: 0.35, tuNgay: 30, tinh: "Chuỗi lớn vừa mở ở đầu hẻm. Quản lý là cháu cô Hạnh." },
];

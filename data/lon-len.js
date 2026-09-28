/* Lớn lên: mặt tiền đầu hẻm, nhân viên có tính cách, đơn nhóm. Nạp trước game.js.
   Tiền nhà trong game thu nhỏ khoảng 1/5 đến 1/8 so với ngoài đời; mặt tiền đắt gấp khoảng 3 lần trong hẻm. */
const MAT_TIEN = {
  thue: 115000, /* tiền nhà mỗi ngày */
  cocNgay: 20, /* cọc bằng bấy nhiêu ngày tiền nhà */
  trangTri: 2500000,
  tuNgay: 20,
  sao: 4.2,
  hopDong: 28, /* ngày mỗi kỳ hợp đồng */
  tang: 0.1, /* gia hạn thì tiền nhà tăng */
};

/* tên nhân viên theo vị trí; ai mới thuê thì lấy ngẫu nhiên */
const NV_TEN = {
  staff1: ["Tuấn", "My", "Hào", "Vy", "Nhi"],
  staff2: ["Chị Thảo", "Anh Lộc", "Quyên", "Anh Sang"],
  staffOn: ["Phúc", "Ngân", "Duy", "Thư"],
  staff3: ["Bảo", "Trâm", "Kiệt", "Hân"],
};
/* đặc điểm: mỗi nhân viên một cái, có tốt có xấu */
const NV_DD = {
  nhanh: { ten: "Nhanh tay", mo: "Pha nhanh hơn 20%", tot: true },
  can_than: { ten: "Cẩn thận", mo: "Ít làm sai hơn một nửa", tot: true },
  deo_mieng: { ten: "Dẻo miệng", mo: "Khách chịu chờ lâu hơn 8%", tot: true },
  cham_chi: { ten: "Chăm chỉ", mo: "Ít mệt, tâm trạng giảm chậm", tot: true },
  vui_ve: { ten: "Vui vẻ", mo: "Khách chịu chờ lâu hơn 5%", tot: true },
  di_tre: { ten: "Hay đi trễ", mo: "Thỉnh thoảng tới giữa ca mới có mặt", tot: false },
  sinh_vien: { ten: "Sinh viên", mo: "Nghỉ 3 ngày mỗi mùa thi (khoảng 30 ngày một lần)", tot: false },
  vung: { ten: "Vụng", mo: "Làm sai nhiều gấp đôi", tot: false },
};

/* đơn nhóm: nhận ở đầu ngày, tới lúc thì cả nhóm gọi một lượt */
const DON_NHOM = [
  { id: "cty", ten: "Công ty đầu hẻm", n: [5, 8], at: 0.3, chu: "Chị kế toán công ty đầu hẻm đặt {n} ly cho buổi họp trưa, lấy lúc khoảng 12 giờ." },
  { id: "lop", ten: "Lớp 12A1", n: [6, 10], at: 0.6, chu: "Lớp 12A1 trường gần đây đặt {n} ly liên hoan, tan học ghé lấy khoảng 4 giờ chiều." },
];

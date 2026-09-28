/* Cốt truyện Hẻm 42: nhân vật và các mẩu chuyện. Nạp trước game.js.
   Bộ máy đọc mẩu chuyện làm ở mốc 1; hiện file này chỉ chứa nội dung, game chưa dùng.
   Viết thoại theo docs/NHAN-VAT.md. {ban} = anh/chị (người chơi chọn), {shop} = tên tiệm.

   Một mẩu chuyện:
   {
     id: "khoa_mua",               // duy nhất, không đổi sau khi phát hành (bản lưu nhớ theo id)
     chuong: 1,
     luc: "mo_cua" | "dong_cua",    // trước giờ mở cửa hoặc sau giờ đóng cửa
     dieuKien: { ngay, ngayTu, ngayDen, than: { khoa: 2 }, co: { ten: giá trị }, thoiTiet: "rain" },
     uuTien: 5,                     // nhiều mẩu cùng đủ điều kiện thì chọn số lớn nhất
     thoai: [["khoa", "câu"], ["_", "(chú thích hành động)"], ["tin", "tin nhắn của mẹ"]],
     luaChon: [{ chu: "nút", dat: { ten: giá trị }, thoai: [[ai, câu]] }],
     ketQua: { than: { khoa: 1 }, trang: 2, co: { ten: giá trị } }
   }
*/
const NHAN_VAT = {
  meo: { ten: "Mướp", anh: "cathead" },
  sau: { ten: "Bà Sáu", mat: 6 },
  tu: { ten: "Chú Tư", mat: 2 },
  linh: { ten: "Linh", mat: 7 },
  khoa: { ten: "Khoa", mat: 4 },
  hanh: { ten: "Cô Hạnh", mat: 3 },
  me: { ten: "Mẹ", tinNhan: true },
  hana: { ten: "Hana", ngoiSao: true },
};

const MAU_CHUYEN = [
  /* ---------- Chương 0 · Khai trương (ngày 1–6), mỗi cảnh tối đa 3 câu ---------- */
  {
    id: "c0_chia_khoa",
    chuong: 0,
    luc: "mo_cua",
    dieuKien: { ngay: 1 },
    uuTien: 10,
    thoai: [
      ["sau", "Chìa khoá nè. Tiền nhà bà thu mỗi tối. Trễ một bữa bà hông la…"],
      ["_", "(Mướp nhảy lên quầy, nằm chình ình.)"],
      ["sau", "Con Mướp chịu nằm chỗ nào là chỗ đó hên. Bán đắt hàng nghen."],
    ],
    luaChon: [
      { chu: "Vuốt Mướp", dat: { c0_meo: "vuot" }, thoai: [["_", "(Mướp kêu một tiếng rồi ngủ tiếp.)"]] },
      { chu: "Hỏi về quán nước", dat: { c0_meo: "hoi" }, thoai: [["sau", "Chuyện dài lắm. Bán được rồi bà kể."]] },
    ],
    ketQua: { than: { sau: 1 } },
  },
  {
    id: "c0_chu_tu",
    chuong: 0,
    luc: "mo_cua",
    dieuKien: { ngay: 2 },
    uuTien: 10,
    thoai: [
      ["tu", "Chú chạy xe ôm đầu hẻm hai chục năm. Giờ ai cũng bấm app."],
      ["tu", "Cho chú ly trà đá. Trà sữa ngọt quá chú hổng chịu."],
      ["tu", "Mà thôi, mở tiệm là gan rồi. Chú ghé ủng hộ hoài."],
    ],
    ketQua: { than: { tu: 1 } },
  },
  {
    id: "c0_khoa",
    chuong: 0,
    luc: "mo_cua",
    dieuKien: { ngay: 3 },
    uuTien: 10,
    thoai: [
      ["khoa", "{ban} ơi cho em xin miếng nước, em chạy đơn từ sáng tới giờ."],
      ["khoa", "Tiệm mới hả? Sau này lên app đi, em nhận đơn cho."],
      ["khoa", "Nắng muốn xỉu luôn á. Thôi em chạy tiếp nha!"],
    ],
    luaChon: [
      { chu: "Rót ly trà đá", dat: { c0_khoa: "tra_da" }, ketQua: { than: { khoa: 1 } } },
      { chu: "Đưa chai nước suối", dat: { c0_khoa: "nuoc" } },
    ],
  },
  {
    id: "c0_me",
    chuong: 0,
    luc: "dong_cua",
    dieuKien: { ngay: 4 },
    uuTien: 10,
    thoai: [
      ["tin", "Mẹ: Nghỉ việc thiệt hả con?.."],
      ["tin", "Mẹ: Ăn uống đàng hoàng. Đừng có bán tới khuya."],
      ["tin", "Mẹ: Tiệm tên gì. Để mẹ coi trên mạng."],
    ],
    luaChon: [
      { chu: "Nhắn tên tiệm cho mẹ", dat: { me_biet_ten: true } },
      { chu: "Để mai nhắn", dat: { me_biet_ten: false } },
    ],
  },
  {
    id: "c0_co_hanh",
    chuong: 0,
    luc: "mo_cua",
    dieuKien: { ngay: 5 },
    uuTien: 10,
    thoai: [
      ["hanh", "Cô bán bánh mì bên kia hẻm. Qua coi tiệm mới cái."],
      ["hanh", "Ly cũng được… mà hơi mắc. Hồi xưa bà Sáu bán ba ngàn một ly."],
      ["hanh", "Thôi, bán đi. Khách của cô ăn bánh mì cũng khát nước."],
    ],
    ketQua: { than: { hanh: 1 } },
  },
  {
    id: "c0_tien_nha",
    chuong: 0,
    luc: "mo_cua",
    dieuKien: { ngay: 6 },
    uuTien: 10,
    thoai: [
      ["sau", "Gần tuần rồi, tối nào con cũng đóng tiền nhà đủ. Được lắm."],
      ["_", "(Bà Sáu rút trong túi ra một trang giấy cũ, mép đã ố vàng.)"],
      ["sau", "Trang đầu cuốn sổ công thức của bà. Mấy trang kia… rớt đâu trong xóm."],
    ],
    ketQua: { than: { sau: 1 }, trang: 1 },
  },
];

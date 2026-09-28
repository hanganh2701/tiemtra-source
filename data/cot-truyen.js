/* Cốt truyện Hẻm 42: nhân vật, mẩu chuyện, khách quen, sổ công thức, quà mở khoá. Nạp trước game.js.
   Bộ máy đọc nội dung này nằm ở src/truyen.js. Viết thoại theo docs/NHAN-VAT.md.
   Trong câu thoại: {ban} = anh/chị (người chơi chọn), {Ban} = viết hoa, {shop} = tên tiệm.

   Một mẩu chuyện:
   {
     id: "khoa_mua",               // duy nhất, không đổi sau khi phát hành (bản lưu nhớ theo id)
     chuong: 1,
     luc: "mo_cua" | "dong_cua",    // trước giờ mở cửa hoặc sau giờ đóng cửa
     tomTat: "Một câu tóm tắt",     // hiện khi người chơi bỏ qua hoặc chọn chế độ Gọn
     dieuKien: {
       ngay: 3,                     // sớm nhất là ngày 3 (ngày của lúc mở cửa hoặc ngày vừa đóng cửa)
       ngayDen: 20,                 // muộn nhất
       than: { khoa: 4 },           // độ thân tối thiểu
       co: { ten: giá trị },        // cờ phải khớp (true = có đặt là được)
       sau: "khoa_1",               // phải xem cảnh này trước
       cachNgay: 2,                 // và cách cảnh kia ít nhất bấy nhiêu ngày
       thoiTiet: "rain",            // ưu tiên ngày có sự kiện này; chờ quá 8 ngày thì bỏ qua điều kiện
       trang: 4,                    // phải có trang sổ này
       nhanh: { may: "A" },         // đang đi nhánh A của ngã rẽ "may"
       khongCo: { ten: giá trị },   // cờ KHÔNG được khớp
       chot: 59,                    // hạn chót: từ ngày này bỏ qua điều kiện mềm (than, sau, trang, soTrang, sao, thoiTiet)
       le: "tet", quanhTet: [-10, -2], // dịp lễ theo lịch thật; với Tết: khoảng ngày so với mùng 1
       luot: 2,                     // chỉ có từ lượt chơi thứ 2 (Hẻm 42 lần nữa)
     },
     reRe: "Câu báo trước",         // ngã rẽ lớn: không bị Bỏ qua hay chế độ Tắt chọn thay, chỉ tính đã xem khi chọn xong
     ketCuc: true,                  // xong cảnh thì hiện kết truyện và hậu truyện
     nghi: true,                    // xong cảnh thì tiệm nghỉ ngày đó (về quê), cảnh nghỉ kế tiếp hiện liền
     moiNam: true, thoaiLai: [...],  // cảnh lễ lặp lại mỗi năm; từ năm thứ hai dùng thoaiLai
     uuTien: 5,                     // nhiều mẩu cùng đủ điều kiện thì chọn số lớn nhất
     thoai: [["khoa", "câu"], ["_", "(chú thích hành động)"], ["tin", "Mẹ: tin nhắn"], ["linh", "câu", { co: { x: 1 } }]],
     luaChon: [{ chu: "nút", dat: { ten: giá trị }, nhanh: { may: "A" }, thoai: [[ai, câu]], ketQua: {...} }],
     Câu thoại có thể kèm điều kiện { co, khongCo, nhanh, than, xem, chuaXem, ketDaThay } ở phần tử thứ ba.
     Câu có điều kiện trên cùng một cờ là các phương án thay nhau; số câu hiện ra tối đa 6.
     ketQua: { than: { khoa: 1 }, trang: 2, co: { ten: giá trị }, tien: 50000,
               mo: "olong", hang: { olong: 20 }, goi: "tenHam" }   // mở nguyên liệu, thêm hàng, gọi hàm của game
   }
*/
/* tên riêng của nhân vật truyện: khách vãng lai không được đặt trùng */
const TEN_TRUYEN = new Set(["Linh", "Hạnh", "Vy", "Khoa", "Tư", "Sáu", "Hana", "Mướp"]);
const NHAN_VAT = {
  meo: { ten: "Mướp", anh: "cathead" },
  sau: { ten: "Bà Sáu", mat: 6 },
  tu: { ten: "Chú Tư", mat: 2 },
  linh: { ten: "Linh", mat: 7 },
  khoa: { ten: "Khoa", mat: 4 },
  hanh: { ten: "Cô Hạnh", mat: 3 },
  me: { ten: "Mẹ", tinNhan: true },
  hana: { ten: "Hana", ngoiSao: 2 }, /* hàng 2 trong img/star.webp */
  vy: { ten: "Vy", mat: 0 }, /* quản lý chuỗi Mây Tea mở đầu hẻm, cháu cô Hạnh */
  me_gap: { ten: "Mẹ", anh: "me.svg" }, /* mẹ lên thăm (chương 3) */
};

const MAU_CHUYEN = [
  /* ---------- Chương 0 · Khai trương (ngày 1–6), mỗi cảnh tối đa 3 câu ---------- */
  {
    id: "c0_chia_khoa",
    chuong: 0,
    tomTat: "Bà Sáu giao chìa khoá tiệm, mèo Mướp chọn chỗ nằm trên quầy.",
    luc: "mo_cua",
    dieuKien: { ngay: 1 },
    uuTien: 10,
    thoai: [
      ["sau", "Chìa khoá nè. Trễ tiền nhà một bữa bà hông la… hai bữa thì la."],
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
    tomTat: "Chú Tư xe ôm ghé ủng hộ ly trà đầu tiên.",
    luc: "mo_cua",
    dieuKien: { ngay: 2 },
    uuTien: 10,
    thoai: [
      ["tu", "Chú chạy xe ôm đầu hẻm hai chục năm. Giờ ai cũng bấm app."],
      ["tu", "Cho chú ly trà sữa, ít ngọt thôi. Ngọt quá chú hổng chịu."],
      ["tu", "Mà thôi, mở tiệm là gan rồi. Chú ghé ủng hộ hoài."],
    ],
    ketQua: { than: { tu: 1 } },
  },
  {
    id: "c0_khoa",
    chuong: 0,
    tomTat: "Khoa shipper xin ly nước giữa trưa nắng.",
    luc: "mo_cua",
    dieuKien: { ngay: 3 },
    uuTien: 10,
    thoai: [
      ["khoa", "{Ban} ơi, cho em xin miếng nước, em chạy đơn từ sáng tới giờ."],
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
    tomTat: "Mẹ nhắn tin hỏi chuyện nghỉ việc mở tiệm.",
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
    tomTat: "Cô Hạnh bán bánh mì bên kia hẻm qua dòm tiệm mới.",
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
    tomTat: "Bà Sáu đưa trang đầu tiên của cuốn sổ công thức.",
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

/* ---------- Khách quen: ghé định kỳ ở quầy, phục vụ tốt thì thân thêm, đủ thân thì mở cảnh ---------- */
const KHACH_QUEN = {
  tu: {
    tuNgay: 2,
    cach: 2,
    mon: { base: "tra", tops: [], sugar: 30, ice: "Đá thường" },
    xin: "Cho chú",
    het: " nghen, ít ngọt thôi!",
    tieuSu: [
      "Chạy xe ôm ở đầu hẻm hơn hai chục năm.",
      "Con gái học đại học năm hai, chú chạy thêm cuốc tối để lo học phí.",
      "Mới học chạy xe bằng app, cuốc nào được năm sao cũng khoe.",
    ],
  },
  khoa: {
    tuNgay: 3,
    cach: 2,
    mon: { base: "matcha", tops: ["tcden"], sugar: 70, ice: "Đá thường" },
    xin: "{Ban} ơi, cho em",
    het: " nha, lẹ giúp em!",
    tieuSu: [
      "Shipper hai mươi tuổi, ngày chạy bốn chục đơn.",
      "Quê ở Bến Tre, tháng nào cũng gửi tiền về cho mẹ.",
      "Hay rủ bạn shipper ghé tiệm ngồi nghỉ chân.",
    ],
  },
  linh: {
    tuNgay: 4,
    cach: 3,
    mon: { base: "hong", flav: "f_dao", tops: [], sugar: 50, ice: "Ít đá" },
    xin: "{Ban} ơi, cho em",
    het: " như cũ nha!",
    tieuSu: [
      "Học sinh lớp 12, tối nào cũng học tới một giờ sáng.",
      "Ông nội hồi xưa hay uống trà ở quán nước của bà Sáu.",
      "Muốn đi làm thêm để tự lo tiền học đại học.",
    ],
  },
};

/* ---------- Sổ công thức của bà Sáu: mỗi trang cho một ưu đãi nhỏ nhưng lâu dài ---------- */
const TRANG_CONG_THUC = [
  null,
  { ten: "Trà ủ đủ lâu", chu: "Trà ngon là trà ủ đủ lâu. Ủ vội thì chát, khách uống một ngụm là biết.", uuDai: "Khách chờ lâu hơn 5%" },
  { ten: "Trà đá bà Sáu", chu: "Trà ủ nguội, không đường. Ai ngồi chờ thì rót cho một ly, không lấy tiền.", uuDai: "Khách chờ lâu hơn thêm 5%" },
  { ten: "Trà sữa bà Sáu", chu: "Trà đậm, sữa đặc ít thôi, thêm chút xíu muối cho ngọt hậu.", uuDai: "Tiền tip tăng 10%" },
  { ten: "Góc nghỉ chân", chu: "Người chạy xe cả ngày, cho họ chỗ ngồi với ly nước là họ nhớ mình.", uuDai: "Tài xế app chờ lâu hơn 20%" },
  { ten: "Sổ đi chợ", chu: "Mua trà mối quen ở chợ Bà Chiểu, lấy nhiều thì được bớt.", uuDai: "Giá nhập trà giảm 10%" },
  { ten: "Trà cho ngày mưa", chu: "Trời mưa thì nấu gừng, khách ướt mèm vô quán thấy ấm liền.", uuDai: "Ngày mưa khách ghé nhiều hơn 15%" },
  { ten: "Lồng đèn Trung Thu", chu: "Rằm tháng Tám treo lồng đèn trước quán, con nít kéo cha mẹ vô.", uuDai: "Ngày lễ khách ghé nhiều hơn 20%" },
  { ten: "Bí quyết topping", chu: "Trân châu nấu xong ngâm đường, để lâu không cứng.", uuDai: "Topping để được thêm 1 ngày" },
  { ten: "Khách khó tính", chu: "Khách khó thì cười, pha chậm mà chắc. Người ta khó vì mệt thôi.", uuDai: "Khách hãm ít xuất hiện hơn" },
  { ten: "Lời hàng xóm", chu: "Buôn có bạn, bán có phường. Hàng xóm giới thiệu là khách tới liền.", uuDai: "Đánh giá tốt kéo khách mạnh hơn" },
  { ten: "Mâm cỗ Tết", chu: "Tết thì bán ít lại, dành thời gian ngồi với người nhà.", uuDai: "Ngày Tết tip gấp đôi" },
  { ten: "Trà của bà Sáu", chu: "Hồng trà, siro vải, thạch củ năng. Pha cho người mình thương.", uuDai: "Mở món đặc trưng Trà của bà Sáu: khách gọi nhiều, trả thêm 10k" },
];
/* món đặc trưng khi đủ 12 trang */
const MON_DAC_TRUNG = { base: "hong", flav: "f_vai", tops: ["cunang"], ten: "Trà của bà Sáu", them: 10000 };

/* ---------- Quà mở khoá những ngày đầu: mỗi 1–2 ngày có một thứ mới ---------- */
const MO_KHOA = [
  { ngay: 2, k: "hong", chu: "Bà Sáu cho mượn hũ hồng trà cũ" },
  { ngay: 3, k: "tcvang", chu: "Mối trân châu tặng thử trân châu hoàng kim" },
  { ngay: 4, chai: "f_dao", chu: "Chú Tư mang qua một chai siro đào" },
  { ngay: 5, k: "luc", chu: "Nhà cung cấp tặng lục trà dùng thử" },
  { ngay: 7, k: "cunang", chu: "Cô Hạnh chỉ chỗ mua thạch củ năng rẻ" },
  { ngay: 8, ghiChu: "Từ hôm nay có thể gặp khách khó chiều: khách hối, khách đổi ý, khách trả giá" },
  { ngay: 9, k: "olong", chu: "Khoa mang về một gói trà olong từ quê bạn" },
  { ngay: 10, ghiChu: "Từ hôm nay ngân hàng cho vay khi két sắp cạn" },
];

/* ---------- Chương 1 · Người trong hẻm: cảnh của khách quen ---------- */
MAU_CHUYEN.push(
  {
    id: "tu_1",
    chuong: 1,
    luc: "dong_cua",
    tomTat: "Chú Tư nhờ chỉ cách chạy xe bằng app.",
    dieuKien: { than: { tu: 2 } },
    uuTien: 6,
    thoai: [
      ["tu", "Hôm nay chạy có hai cuốc. Mấy đứa nhỏ bấm app hết rồi."],
      ["tu", "Con gái chú cài cho cái app tài xế mà chú bấm hoài hổng ra."],
      ["tu", "Rảnh chỉ chú với nghen, chú trả bằng… ly trà đá."],
    ],
    luaChon: [
      { chu: "Chỉ chú luôn bây giờ", dat: { tu_app: "som" }, thoai: [["tu", "Ờ, bấm vô đây hả? Dễ vậy mà chú loay hoay cả tuần."]] },
      { chu: "Mai con chỉ", dat: { tu_app: "mai" }, thoai: [["tu", "Mai nghen. Chú ngồi đợi đó."]] },
    ],
    ketQua: { than: { tu: 1 } },
  },
  {
    id: "tu_2",
    chuong: 1,
    luc: "dong_cua",
    tomTat: "Chú Tư khoe cuốc xe app đầu tiên được năm sao.",
    dieuKien: { than: { tu: 4 }, sau: "tu_1", cachNgay: 2 },
    uuTien: 6,
    thoai: [
      ["tu", "Nè, cuốc app đầu tiên của chú! Chở một bà đi chợ Bà Chiểu."],
      ["_", "(Chú Tư chìa điện thoại khoe năm ngôi sao.)"],
      ["tu", "Nhờ con chỉ bữa đó đó.", { co: { tu_app: "som" } }],
      ["tu", "Hôm bữa con chỉ lâu ghê mà chú vẫn học được.", { co: { tu_app: "mai" } }],
      ["tu", "Hồi giờ chú tưởng mình già rồi, học hổng nổi."],
    ],
    ketQua: { than: { tu: 1 } },
  },
  {
    id: "tu_3",
    chuong: 1,
    luc: "dong_cua",
    tomTat: "Chú Tư trả lại trang sổ công thức thứ 2 rớt dưới yên xe.",
    dieuKien: { than: { tu: 6 }, sau: "tu_2", cachNgay: 2 },
    uuTien: 7,
    thoai: [
      ["tu", "Tiệm có đơn gần gần thì kêu chú, chú giao lẹ hơn app."],
      ["tu", "À, cái này rớt dưới yên xe chú lâu rồi. Chữ bà Sáu phải hông?"],
      ["_", "(Trang giấy ố vàng ghi: \"Trà đá bà Sáu: trà ủ nguội, không đường.\")"],
    ],
    ketQua: { than: { tu: 1 }, trang: 2 },
  },
  {
    id: "khoa_1",
    chuong: 1,
    luc: "dong_cua",
    tomTat: "Khoa kể chuyện chạy đơn giữa nắng và gửi tiền về quê.",
    dieuKien: { than: { khoa: 2 } },
    uuTien: 6,
    thoai: [
      ["khoa", "Ly trà đá bữa đầu đó, em còn nhớ vị luôn.", { co: { c0_khoa: "tra_da" } }],
      ["khoa", "Chai nước bữa đầu {ban} đưa, em còn giữ cái vỏ nè.", { co: { c0_khoa: "nuoc" } }],
      ["khoa", "Hôm nay chạy bốn chục đơn, nắng muốn cháy lưng."],
      ["khoa", "Xăng lên nữa rồi. Tháng này em gửi về quê hơi ít."],
      ["khoa", "Mà thôi, uống ly của {ban} là khoẻ lại liền."],
    ],
    luaChon: [
      { chu: "Mời Khoa thêm ly nữa", dat: { khoa_moi: true }, ketQua: { than: { khoa: 1 } }, thoai: [["khoa", "Trời, {ban} chiều em quá. Em ghé hoài luôn đó."]] },
      { chu: "Hỏi quê Khoa ở đâu", dat: { khoa_que: true }, thoai: [["khoa", "Bến Tre á {ban}. Mùa này dừa nhiều lắm, về em mang lên cho."]] },
    ],
  },
  {
    id: "khoa_2",
    chuong: 1,
    luc: "dong_cua",
    tomTat: "Khoa trú mưa ở tiệm sau khi bị huỷ đơn.",
    dieuKien: { than: { khoa: 4 }, sau: "khoa_1", cachNgay: 2, thoiTiet: "rain" },
    uuTien: 7,
    thoai: [
      ["_", "(Mưa như trút. Khoa đứng nép dưới mái hiên, áo mưa rách một bên.)"],
      ["khoa", "Đơn bị huỷ, em chạy tới nơi rồi người ta mới báo huỷ…"],
      ["khoa", "Cho em đứng đây chút nha, tạnh em đi liền."],
    ],
    luaChon: [
      { chu: "Cho Khoa mượn áo mưa", dat: { khoa_mua: "ao" }, thoai: [["khoa", "Mai em trả liền. Cảm ơn {ban} nhiều nha."]] },
      { chu: "Pha ly gừng nóng", dat: { khoa_mua: "gung" }, thoai: [["khoa", "Ấm bụng ghê. Hồi nhỏ mẹ em cũng nấu gừng vầy."]] },
    ],
    ketQua: { than: { khoa: 1 } },
  },
  {
    id: "khoa_3",
    chuong: 1,
    luc: "dong_cua",
    tomTat: "Khoa rủ shipper ghé tiệm và đưa trang sổ thứ 4 nhặt được hôm mưa.",
    dieuKien: { than: { khoa: 6 }, sau: "khoa_2", cachNgay: 2 },
    uuTien: 7,
    thoai: [
      ["khoa", "{Ban} biết hông, tụi shipper khu này hay ghé đây ngồi nghỉ."],
      ["khoa", "Có bình trà đá miễn phí là tụi em nhớ tiệm {shop} liền."],
      ["khoa", "Áo mưa bữa đó em giặt sạch rồi nè.", { co: { khoa_mua: "ao" } }],
      ["_", "(Khoa đưa một tờ giấy gấp tư, dính chút nước mưa.)"],
      ["khoa", "Em lượm ở đầu hẻm hôm mưa. Chữ ai viết đẹp ghê."],
    ],
    ketQua: { than: { khoa: 1 }, trang: 4 },
  },
  {
    id: "linh_1",
    chuong: 1,
    luc: "dong_cua",
    tomTat: "Linh kể chuyện ôn thi lớp 12 và mơ được đi làm thêm.",
    dieuKien: { than: { linh: 2 } },
    uuTien: 6,
    thoai: [
      ["linh", "Em lớp 12, còn mấy tháng nữa là thi tốt nghiệp rồi."],
      ["linh", "Tối nào em cũng học tới một giờ. Trà đào là bùa hộ mệnh đó."],
      ["linh", "Mẹ nói học xong mới được đi làm thêm. Em thì muốn thử quá."],
    ],
    ketQua: { than: { linh: 1 } },
  },
  {
    id: "linh_2",
    chuong: 1,
    luc: "dong_cua",
    tomTat: "Linh ghé tối trước ngày thi, lo ông nội buồn nếu thi rớt.",
    dieuKien: { than: { linh: 4 }, sau: "linh_1", cachNgay: 2 },
    uuTien: 7,
    thoai: [
      ["linh", "{Ban} ơi, trà đào ít đá như cũ… à, thêm trân châu nha. Mai em thi rồi."],
      ["linh", "Ông nội nói mai chở em đi, đứng ngoài cổng đợi nguyên buổi."],
      ["linh", "Em sợ rớt thì ông buồn hơn em buồn."],
    ],
    luaChon: [
      { chu: "Tặng ly này", dat: { linh_co_vu: "tang" }, thoai: [["linh", "…Dạ. Thi xong em ghé khoe liền."]] },
      { chu: "Viết lên ly: \"Bình tĩnh nha!\"", dat: { linh_co_vu: "viet" }, thoai: [["linh", "Hihi, em giữ cái ly này luôn. Thi xong em ghé khoe liền."]] },
    ],
    ketQua: { than: { linh: 1 } },
  },
  {
    id: "linh_3",
    chuong: 1,
    luc: "dong_cua",
    tomTat: "Linh thi đậu, được học bổng ở Đà Lạt mà muốn ở lại làm thêm ở tiệm. Linh hỏi ý bạn.",
    dieuKien: { than: { linh: 6 }, sau: "linh_2", cachNgay: 3 },
    uuTien: 7,
    reRe: "Chọn một lần. Ở lại: khi bạn thuê, Linh vào nghề sẵn. Đi học: Linh gửi trà Đà Lạt về.",
    thoai: [
      ["linh", "{Ban} ơi! Em đậu rồi! Điểm cao hơn em tưởng luôn."],
      ["linh", "Cái ly {ban} viết chữ, em để trên bàn học nè.", { co: { linh_co_vu: "viet" } }],
      ["linh", "Ly có thạch bữa trước ngon ghê, em làm bài trôi chảy luôn.", { co: { linh_ly: "thach" } }],
      ["linh", "Ly trà đào như cũ bữa trước, uống xong em hết run liền.", { co: { linh_ly: "cu" } }],
      ["linh", "Ông nội gửi cái này. Hồi xưa ông uống trà ở quán bà Sáu hoài."],
      ["_", "(Trang sổ ố vàng: \"Trà sữa bà Sáu: trà đậm, ít sữa, chút muối.\")"],
      ["linh", "Em được học bổng ở Đà Lạt. Mà em muốn ở lại phụ tiệm cho gần nhà."],
    ],
    luaChon: [
      { chu: "Ở lại làm thêm ở tiệm", nhanh: { linh: "A" }, dat: { linh_lam: true }, thoai: [["linh", "Dạ! Mai em đi làm liền. {Ban} nhớ thuê em nha!"]] },
      { chu: "Đi học Đà Lạt đi em", nhanh: { linh: "B" }, thoai: [["linh", "Dạ… Em sẽ gửi trà Đà Lạt về cho {ban} nha."]] },
    ],
    ketQua: { than: { linh: 1 }, trang: 3 },
  },
);

/* ---------- Chương 1 (tiếp): tiền nong, mặt tiền, chuyện của bà Sáu ---------- */
MAU_CHUYEN.push(
  {
    id: "c1_vay",
    chuong: 1,
    luc: "dong_cua",
    tomTat: "Két sắp cạn, mẹ nhắn muốn gửi tiền giúp.",
    dieuKien: { ngay: 10, ngayDen: 45, tienDuoi: 300000 },
    uuTien: 8,
    thoai: [
      ["tin", "Mẹ: Tiệm sao rồi con. Mẹ thấy con ít nhắn."],
      ["tin", "Mẹ: Mẹ có để dành chút đỉnh. Cần thì mẹ gửi lên."],
      ["_", "(Két chỉ còn vài trăm nghìn.)"],
    ],
    luaChon: [
      { chu: "Nhận tiền mẹ gửi", dat: { c1_vay: "me" }, ketQua: { tien: 1000000 }, thoai: [["tin", "Mẹ: Ừ. Đừng nói với ba nghen."]] },
      { chu: "Nói mẹ con tự lo được", dat: { c1_vay: "tu" }, thoai: [["tin", "Mẹ: Cứng đầu y chang ba con. Có gì phải nói mẹ."]] },
    ],
  },
  {
    id: "c1_sang_nhuong",
    chuong: 1,
    luc: "mo_cua",
    tomTat: "Bà Sáu kể góc mặt tiền đầu hẻm đang sang nhượng.",
    dieuKien: { ngay: 18, sao: 4.0 },
    uuTien: 7,
    thoai: [
      ["sau", "Cái kiosk trà sữa chuỗi ở đầu hẻm dẹp rồi đó con."],
      ["sau", "Mặt tiền, người qua lại đông. Chủ nhà là bạn bà."],
      ["sau", "Muốn ra đó thì để dành tiền cọc. Ở đây bà vẫn cho con nấu hàng."],
    ],
    ketQua: { co: { mat_tien_mo: true } },
  },
  {
    id: "c1_ket",
    chuong: 1,
    luc: "mo_cua",
    tomTat: "Bà Sáu kể về quán nước năm xưa và đưa trang sổ thứ 5.",
    dieuKien: { ngay: 26, soTrang: 3, chot: 32 },
    uuTien: 8,
    thoai: [
      ["sau", "Hồi xưa quán nước của bà đông lắm. Ông nhà nấu trà, bà bán."],
      ["sau", "Ổng mất, bà dẹp quán. Cuốn sổ ổng viết, bà xé cho mấy đứa trong xóm giữ."],
      ["_", "(Bà Sáu đưa một trang ghi tên mấy mối trà ở chợ Bà Chiểu.)"],
      ["sau", "Con gom lại được thì cuốn sổ về đúng chỗ của nó."],
    ],
    ketQua: { trang: 5, than: { sau: 1 } },
  },
  {
    id: "c2_mat_tien",
    chuong: 2,
    luc: "mo_cua",
    tomTat: "Ngày đầu ở mặt tiền đầu hẻm, cả xóm ghé mừng.",
    dieuKien: { buoc: 2 },
    uuTien: 9,
    thoai: [
      ["tu", "Chu choa, ra mặt tiền rồi! Bảng hiệu sáng trưng."],
      ["khoa", "Tụi shipper em hẹn nhau ghé đây hết đó {ban}."],
      ["linh", "Em mang hoa qua nè. Chúc tiệm đông khách!", { khongNhanh: { linh: "B" } }],
      ["tin", "Linh: Tiệm ra mặt tiền rồi hả {ban}! Em ở Đà Lạt khoe cả phòng trọ.", { nhanh: { linh: "B" } }],
      ["sau", "Nhớ về hẻm nấu hàng. Con Mướp nó theo con ra luôn rồi đó."],
    ],
    ketQua: { than: { sau: 1, tu: 1, khoa: 1, linh: 1 } },
  },
);

/* ---------- Lễ theo lịch thật: mỗi năm thêm cảnh mới với id có năm ---------- */
MAU_CHUYEN.push(
  {
    id: "le_noel",
    nhan: "Giáng sinh ở Hẻm 42",
    chuong: 1,
    luc: "mo_cua",
    moiNam: true,
    tomTat: "Noel ở Hẻm 42: kim tuyến trên quầy, Mướp bị đội nón ông già Noel.",
    dieuKien: { le: "noel", ngay: 7 },
    uuTien: 12,
    thoai: [
      ["linh", "{Ban} ơi, Noel nè! Em treo dây kim tuyến lên quầy nha.", { khongNhanh: { linh: "B" } }],
      ["tin", "Linh: Đà Lạt Noel lạnh run. {Ban} treo kim tuyến lên quầy giùm em nha!", { nhanh: { linh: "B" } }],
      ["khoa", "Tối nay nhà thờ Đức Bà kẹt xe dữ lắm, đơn ship chắc nhiều."],
      ["_", "(Mướp đội cái nón ông già Noel nhỏ xíu, mặt không vui lắm.)"],
    ],
    thoaiLai: [
      ["linh", "Noel nữa rồi {ban}! Năm nay em treo đèn nhấp nháy luôn.", { khongNhanh: { linh: "B" } }],
      ["tin", "Linh: Noel này em lại kẹt trên Đà Lạt. Đèn nhấp nháy em gửi xe về rồi!", { nhanh: { linh: "B" } }],
      ["khoa", "Năm ngoái ship muốn xỉu, năm nay em đi từ trưa cho chắc."],
      ["_", "(Mướp thấy cái nón ông già Noel là trốn xuống gầm quầy.)"],
    ],
    ketQua: { than: { linh: 1, khoa: 1 } },
  },
  {
    id: "le_ong_tao",
    nhan: "Tết ở Hẻm 42",
    chuong: 1,
    luc: "mo_cua",
    moiNam: true,
    tomTat: "Hai mươi ba tháng Chạp, thả cá chép tiễn ông Táo cùng bà Sáu.",
    dieuKien: { le: "tet", quanhTet: [-10, -2], ngay: 7 },
    uuTien: 12,
    thoai: [
      ["sau", "Hai mươi ba tháng Chạp rồi. Con phụ bà thả cá chép tiễn ông Táo nghen."],
      ["_", "(Hai bà cháu ra kênh thả ba con cá chép vàng.)"],
      ["sau", "Năm nay tiệm con làm ăn được. Ông Táo lên trời có chuyện vui mà kể."],
    ],
    thoaiLai: [
      ["sau", "Lại hai mươi ba tháng Chạp. Năm nào bà cũng nhờ con thả cá."],
      ["_", "(Ba con cá chép vàng quẫy đuôi rồi lặn mất dưới kênh.)"],
      ["sau", "Thêm một năm của tiệm. Ông Táo có nhiều chuyện để kể ghê."],
    ],
    ketQua: { than: { sau: 1 } },
  },
  {
    id: "le_tet",
    nhan: "Tết ở Hẻm 42",
    chuong: 1,
    luc: "mo_cua",
    moiNam: true,
    tomTat: "Ba mẹ lên thăm tiệm dịp Tết, chú Tư chở từ bến xe về.",
    dieuKien: { le: "tet", quanhTet: [-1, 8], ngay: 7 },
    uuTien: 13,
    thoai: [
      ["tin", "Mẹ: Tết này con có về không…"],
      ["tin", "Mẹ: Thôi, ba mẹ lên thăm con. Nhớ để dành bàn cho ba ngồi."],
      ["tin", "Mẹ: Năm nay ba mẹ ngủ lại nhà con luôn nghen, khỏi ra nhà trọ.", { co: { ds_nha_rong: true } }],
      ["_", "(Chú Tư chở hai ông bà từ bến xe về tận Hẻm 42.)"],
      ["tu", "Ông bà coi, tiệm con mình đông khách lắm đó nghen!"],
    ],
    thoaiLai: [
      ["tin", "Mẹ: Năm nay ba mẹ lại lên nghen. Ba đòi ngồi đúng cái bàn năm ngoái."],
      ["tin", "Mẹ: Ba mẹ ở lại nhà con tới mùng bốn nghen.", { co: { ds_nha_rong: true } }],
      ["_", "(Chú Tư lại chạy ra bến xe đón, lần này không cần ai nhờ.)"],
      ["tu", "Ông bà ơi, tiệm năm nay còn đông hơn năm ngoái đó!"],
    ],
    ketQua: { co: { me_len: true }, than: { tu: 1 } },
  },
  {
    id: "le_trung_thu",
    nhan: "Trung Thu ở Hẻm 42",
    chuong: 1,
    luc: "mo_cua",
    moiNam: true,
    tomTat: "Rằm tháng Tám: con nít trong hẻm mua trà mang đi rước đèn, cô Hạnh làm bánh nướng.",
    dieuKien: { le: "trungThu", ngay: 7 },
    uuTien: 12,
    thoai: [
      ["linh", "Rằm tháng Tám nè {ban}! Tụi nhỏ đòi mua trà mang đi rước đèn.", { khongNhanh: { linh: "B" } }],
      ["tin", "Linh: Đà Lạt cũng rước đèn mà em nhớ hẻm mình hơn. Rằm vui nha {ban}!", { nhanh: { linh: "B" } }],
      ["hanh", "Cô làm thêm mấy cái bánh nướng nhân đậu xanh, con bán kèm nha."],
      ["_", "(Tối đó trước tiệm treo một dãy lồng đèn giấy đỏ.)"],
    ],
    thoaiLai: [
      ["_", "(Lại một mùa trăng. Dãy lồng đèn giấy đỏ năm ngoái vẫn treo trên vách.)"],
      ["hanh", "Bánh nướng năm nay cô làm nhân trà xanh, học theo tiệm con đó."],
    ],
    ketQua: { than: { linh: 1, hanh: 1 } },
  },
);

/* ---------- Chương 2 · Mùa trăng (ngày 30–60): Hana, cô Hạnh, chuỗi đầu hẻm ---------- */
KHACH_QUEN.hanh = {
  tuNgay: 30,
  cach: 3,
  mon: { base: "tra", tops: ["thachcf"], sugar: 50, ice: "Đá thường" },
  xin: "Cho cô",
  het: " nha, cô đứng bán bánh mì cả sáng khát khô cổ!",
  tieuSu: [
    "Bán bánh mì bên kia hẻm mười lăm năm.",
    "Có đứa cháu tên Vy làm quản lý cho chuỗi trà sữa lớn.",
    "Muốn làm combo bánh mì với trà cùng tiệm bạn.",
  ],
};
KHACH_QUEN.hana = {
  tuNgay: 34,
  cach: 5,
  mon: { base: "tra", flav: "f_xoai", tops: ["tcden"], sugar: 50, ice: "Ít đá" },
  xin: "[Dịch tự động] Cho tôi",
  het: " với, cảm ơn!",
  tieuSu: [
    "Vlogger nước ngoài, quay video quán xá Sài Gòn.",
    "Đang học tiếng Việt, mỗi lần ghé học thêm một chữ.",
    "Video quay tiệm bạn được mấy trăm nghìn lượt xem.",
  ],
};
MAU_CHUYEN.push(
  {
    id: "hanh_1",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Cô Hạnh rủ làm combo bánh mì với trà.",
    dieuKien: { than: { hanh: 2 } },
    uuTien: 6,
    thoai: [
      ["hanh", "Hồi con mới mở, cô tưởng mấy bữa là dẹp. Ai dè đông quá."],
      ["hanh", "Khách ăn bánh mì bên cô cứ hỏi mua trà bên con."],
      ["hanh", "Hay mình làm combo: bánh mì bên cô, ly trà bên con, bớt năm ngàn?"],
    ],
    luaChon: [
      { chu: "Làm combo với cô", dat: { combo_hanh: true }, thoai: [["hanh", "Được! Mai cô viết bảng. Buôn có bạn mới vui."]] },
      { chu: "Để con tính đã", dat: { combo_hanh: false }, thoai: [["hanh", "Ừ, tính kỹ đi. Cô đợi được."]] },
    ],
    ketQua: { than: { hanh: 1 } },
  },
  {
    id: "c2_may",
    chuong: 2,
    luc: "mo_cua",
    tomTat: "Chuỗi Mây Tea mở ở đầu hẻm, quản lý là Vy, cháu cô Hạnh.",
    dieuKien: { ngay: 33 },
    uuTien: 8,
    thoai: [
      ["_", "(Đầu hẻm treo băng rôn đỏ: \"Mây Tea khai trương, mua 1 tặng 1\".)"],
      ["vy", "Em chào {ban}. Em là Vy, quản lý chỗ mới mở đầu hẻm."],
      ["vy", "Em lớn lên trong hẻm này. Công ty bắt mở ở đây, em cũng khó xử."],
    ],
    luaChon: [
      { chu: "Chúc Vy buôn bán được", dat: { vy: "ban" }, thoai: [["vy", "Cảm ơn {ban}. Có gì em giới thiệu khách qua."]] },
      { chu: "Hỏi sao không mở chỗ khác", dat: { vy: "hoi" }, thoai: [["vy", "Em có xin rồi mà sếp không nghe. Em xin lỗi nha."]] },
    ],
  },
  {
    id: "hana_1",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Hana quay video tiệm, nói qua nhãn dịch tự động.",
    dieuKien: { than: { hana: 1 } },
    uuTien: 6,
    thoai: [
      ["hana", "[Dịch tự động] Xin chào. Tôi quay video quán ăn Sài Gòn."],
      ["hana", "[Dịch tự động] Trà này rất ngon. Con mèo này tên gì?"],
      ["_", "(Mướp nhìn thẳng vào ống kính như ngôi sao thứ thiệt.)"],
    ],
    luaChon: [
      { chu: "Nói chậm: \"Mèo tên Mướp\"", dat: { hana_muop: true }, thoai: [["hana", "Mướp… Mướp! Dễ thương!"]] },
      { chu: "Mời Hana thử trà đá", dat: { hana_trada: true }, thoai: [["hana", "[Dịch tự động] Miễn phí? Người Việt Nam tốt bụng quá."]] },
    ],
    ketQua: { than: { hana: 1 } },
  },
  {
    id: "hana_2",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Hana ghé lần hai, chú Tư dạy chữ xoài.",
    dieuKien: { than: { hana: 3 }, sau: "hana_1", cachNgay: 3 },
    uuTien: 6,
    thoai: [
      ["hana", "[Dịch tự động] Cho tôi ly lần trước. Loại trái cây màu vàng."],
      ["tu", "Vàng vàng ngọt ngọt là xoài chớ gì!"],
      ["hana", "Xoài… Xoài! Đúng hông?"],
      ["hana", "Mướp. Xoài. Cảm ơn. Tôi biết ba chữ rồi!", { co: { hana_muop: true } }],
    ],
    ketQua: { than: { hana: 1, tu: 1 } },
  },
  {
    id: "hana_3",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Video của Hana về con hẻm nổi lên. Hana hỏi có được ghi tên tiệm không.",
    dieuKien: { than: { hana: 5 }, sau: "hana_2", cachNgay: 3 },
    uuTien: 7,
    reRe: "Chọn một lần, kết truyện đổi theo. Ghi tên: khách lạ đông hơn, chịu xếp hàng chờ. Giữ kín: khách quen ghé nhiều, tip cao hơn.",
    thoai: [
      ["hana", "{Ban} ơi! Video quay con hẻm được hai trăm nghìn lượt xem!"],
      ["_", "(Hana nói trọn câu tiếng Việt, không cần nhãn dịch nữa.)"],
      ["hana", "Người ta hỏi địa chỉ. Tôi ghi tên tiệm {shop} vào được không?"],
      ["hana", "Ghi thì nhiều người tới lắm. Không ghi thì chỉ là con hẻm đẹp."],
    ],
    luaChon: [
      { chu: "Ghi tên tiệm đi Hana", nhanh: { hana: "A" }, dat: { hana_video: true }, thoai: [["hana", "Hihi, mai đông lắm đó. Tôi xin lỗi trước nha!"]] },
      { chu: "Chỉ quay con hẻm thôi nha", nhanh: { hana: "B" }, thoai: [["hana", "Được! Vậy tiệm là bí mật của tôi với {ban}."]] },
    ],
    ketQua: { than: { hana: 1 } },
  },
  {
    id: "c2_trung_thu",
    chuong: 2,
    luc: "mo_cua",
    tomTat: "Trung Thu trong hẻm: con nít rước đèn, bà Sáu đưa trang 7.",
    dieuKien: { ngay: 41 },
    uuTien: 8,
    thoai: [
      ["_", "(Con nít trong hẻm rước đèn ông sao, đi ngang tiệm hát vang.)"],
      ["linh", "Hồi nhỏ em cũng rước đèn ngang quán nước của bà Sáu nè.", { khongNhanh: { linh: "B" } }],
      ["tin", "Linh: Hồi nhỏ em rước đèn ngang quán nước của bà Sáu hoài. Nhớ ghê.", { nhanh: { linh: "B" } }],
      ["sau", "Rằm tháng Tám nào quán bà cũng treo lồng đèn. Con treo đi."],
      ["_", "(Bà Sáu gỡ trong lồng đèn cũ ra một trang giấy gấp nhỏ.)"],
    ],
    ketQua: { trang: 7, than: { sau: 1, linh: 1 } },
  },
  {
    id: "hanh_2",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Cô Hạnh kẹt giữa tiệm bạn và đứa cháu làm chuỗi, đưa trang 6.",
    dieuKien: { than: { hanh: 4 }, sau: "hanh_1", cachNgay: 2, ngay: 36 },
    uuTien: 7,
    thoai: [
      ["hanh", "Con Vy nó buồn lắm. Chuỗi bắt nó giảm giá giành khách."],
      ["hanh", "Cô thương nó mà cũng thương con. Khó ghê."],
      ["hanh", "Cái này bà Sáu đưa cô giữ hồi xưa. Giờ con giữ thì đúng hơn."],
      ["_", "(Trang giấy: \"Trời mưa thì nấu gừng, khách ướt mèm vô quán thấy ấm.\")"],
    ],
    ketQua: { than: { hanh: 1 }, trang: 6 },
  },
  {
    id: "c2_vy",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Vy ghé kể chuyện chuỗi, trả lại trang 8 của bà Sáu.",
    /* cần trang 7 (Trung Thu) để trang 8 không tới trước */
    dieuKien: { ngay: 42, sau: "c2_may", cachNgay: 6, trang: 7 },
    uuTien: 6,
    thoai: [
      ["vy", "Bữa đầu {ban} chúc em buôn bán được, em nhớ hoài.", { co: { vy: "ban" } }],
      ["vy", "Bữa đầu {ban} hỏi sao không mở chỗ khác. Em cũng tự hỏi.", { co: { vy: "hoi" } }],
      ["vy", "Trân châu bên em nấu sẵn từ xưởng, để lâu cứng ngắc."],
      ["vy", "Em thèm ly trân châu mới nấu như hồi nhỏ uống quán bà Sáu."],
      ["vy", "Dì Hạnh nói trang này của bà Sáu. Em giữ lâu rồi, giờ trả."],
      ["_", "(\"Trân châu nấu xong ngâm đường, để lâu không cứng.\")"],
    ],
    ketQua: { trang: 8 },
  },
  {
    id: "c2_ba_sau",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Bà Sáu kể vì sao quán nước đóng cửa, đưa trang 9.",
    dieuKien: { ngay: 48, than: { sau: 3 } },
    uuTien: 8,
    thoai: [
      ["sau", "Con Mướp chịu con từ bữa con vuốt nó. Nó khó lắm đó.", { co: { c0_meo: "vuot" } }],
      ["sau", "Bữa đầu con hỏi chuyện quán nước. Giờ bà kể nè.", { co: { c0_meo: "hoi" } }],
      ["sau", "Ông nhà bà nóng tính mà khách khó cỡ nào ổng cũng cười."],
      ["sau", "Ổng nói người ta khó là vì mệt. Cho ly trà là hết khó."],
      ["sau", "Ổng đi rồi, bà không nấu nổi trà ổng nấu. Bà dẹp quán."],
      ["_", "(Bà Sáu đưa trang viết nét chữ run run của ông.)"],
      ["sau", "Bữa con kẹt tiền, mẹ con gửi lên liền. Có mẹ là có hết.", { co: { c1_vay: "me" } }],
      ["sau", "Bữa con kẹt tiền mà không xin ai. Cứng đầu giống ông.", { co: { c1_vay: "tu" } }],
    ],
    ketQua: { trang: 9, than: { sau: 1 } },
  },
  {
    id: "c2_ket",
    chuong: 2,
    luc: "mo_cua",
    tomTat: "Cả xóm giới thiệu khách cho tiệm khi chuỗi phá giá, trang 10.",
    dieuKien: { ngay: 55, soTrang: 7, nhanh: { may: "B" }, sau: "may_b3", chot: 59 },
    uuTien: 8,
    thoai: [
      ["tu", "Chú chở khách nào cũng nói: uống trà thì ghé tiệm {shop}."],
      ["khoa", "Tụi shipper em đặt tên nhóm Zalo là \"Hội ghé {shop}\" luôn."],
      ["hanh", "Bánh mì bên cô bán kèm tờ giới thiệu tiệm con nè."],
      ["hanh", "Combo bánh mì với trà bán chạy nhất xóm luôn!", { co: { combo_hanh: true } }],
      ["sau", "Buôn có bạn, bán có phường. Trang này ông viết đúng quá."],
    ],
    ketQua: { trang: 10, than: { sau: 1, tu: 1, khoa: 1, hanh: 1 } },
  },
);

/* ---------- Chương 3 · Về nhà ăn Tết (ngày 60+): kết truyện ---------- */
MAU_CHUYEN.push(
  {
    id: "c3_vang",
    chuong: 3,
    luc: "dong_cua",
    tomTat: "Sài Gòn vắng Tết, Khoa không có tiền về quê, mẹ hỏi Tết này có về không.",
    dieuKien: { ngay: 62 },
    uuTien: 8,
    reRe: "Chọn một lần. Về quê: tiệm nghỉ 3 ngày, không tốn tiền nhà, hàng trong kho vẫn hết hạn. Ở lại: bán ngày Tết đông khách, tip rộng tay.",
    thoai: [
      ["_", "(Sài Gòn những ngày giáp Tết vắng hoe. Hẻm 42 chỉ còn vài nhà.)"],
      ["khoa", "Năm nay em không về quê. Vé xe lên gấp ba, em để dành gửi mẹ."],
      ["khoa", "Dừa Bến Tre em hứa mang lên, chắc hẹn {ban} Tết sau.", { co: { khoa_que: true } }],
      ["khoa", "{Ban} còn nợ em ly thứ hai bữa trước đó nha, hihi.", { co: { khoa_moi: true } }],
      ["tin", "Mẹ: Tết này con về không? Ba hỏi hoài."],
      ["sau", "Con về thì về. Tiệm để bà với thằng Khoa coi cho."],
    ],
    luaChon: [
      {
        chu: "Về quê ăn Tết",
        nhanh: { tet: "A" },
        dat: { khoa_tet: "trong" },
        ketQua: { than: { khoa: 1 } },
        thoai: [["khoa", "Em coi tiệm cho! {Ban} về ăn Tết vui nha."]],
      },
      {
        chu: "Ở lại mở cửa, ăn Tết với cả hẻm",
        nhanh: { tet: "B" },
        dat: { khoa_tet: true },
        ketQua: { than: { khoa: 1 } },
        thoai: [["khoa", "Vậy em mang dưa hấu qua! Ăn Tết với bà Sáu vui lắm."]],
      },
    ],
  },
  {
    id: "c3_me",
    chuong: 3,
    luc: "mo_cua",
    tomTat: "Mẹ lên thăm tiệm, hoá ra là người viết đánh giá 5 sao ẩn danh.",
    dieuKien: { ngay: 65, sau: "c3_vang", cachNgay: 1, nhanh: { tet: "B" } },
    uuTien: 9,
    thoai: [
      ["_", "(Một bà mặc áo bà ba đứng trước quầy, tay xách giỏ bánh tét.)"],
      ["me_gap", "Bất ngờ chưa. Mẹ đi xe đò lên đó."],
      ["_", "(Mẹ mở điện thoại, chỉ một đánh giá 5 sao ký tên \"Khách quen\".)"],
      ["me_gap", "Ngày nào mẹ cũng đọc đánh giá tiệm con. Đọc hết."],
      ["me_gap", "Tên tiệm con nhắn bữa đầu, mẹ dán trên tủ lạnh.", { co: { me_biet_ten: true } }],
      ["me_gap", "Tên tiệm mẹ phải hỏi bà Sáu mới biết đó nghen.", { co: { me_biet_ten: false } }],
      ["_", "(Trong giỏ bánh tét có một trang giấy mẹ xin bà Sáu từ hôm qua.)"],
    ],
    ketQua: { trang: 11, co: { me_len: true } },
  },
  {
    id: "c3_ket",
    chuong: 3,
    luc: "dong_cua",
    tomTat: "Bà Sáu trao trang cuối: Trà của bà Sáu. Hẻm 42 đón năm mới.",
    dieuKien: { ngay: 67, soTrang: 11, chot: 75 },
    uuTien: 10,
    ketCuc: true,
    thoai: [
      ["sau", "Mười một trang rồi. Trang cuối bà giữ lâu nhất."],
      ["_", "(\"Hồng trà, siro vải, thạch củ năng. Pha cho người mình thương.\")"],
      ["sau", "Giờ cuốn sổ về đủ rồi. Tiệm này là của con."],
      ["me_gap", "Mẹ tự hào về con.", { co: { me_len: true } }],
      ["vy", "Tết này Mây Tea nghỉ. Em qua đón giao thừa với tiệm nha!", { nhanh: { may: "A" } }],
      ["vy", "Xe trà của em nghỉ Tết rồi. Em qua phụ tiệm nè!", { nhanh: { may: "B" } }],
      ["_", "(Giao thừa. Pháo hoa bên kia sông. Mướp nằm ngủ trên quầy.)"],
    ],
    ketQua: { trang: 12, than: { sau: 2 } },
  },
);

/* ---------- Ngã rẽ Mây Tea (Chương 2, ngày 50–59) ----------
   Nhánh A: bắt tay nấu trân châu cho cả chuỗi. Nhánh B: giữ hẻm cùng cả xóm (kết bằng c2_ket ở trên).
   Mỗi nhánh 3 cảnh riêng rồi một cảnh chốt đưa trang 10. Hệ quả trong cách chơi ở src/nga-re.js. */
MAU_CHUYEN.push(
  {
    id: "c2_nga_re",
    chuong: 2,
    luc: "mo_cua",
    tomTat: "Vy mang lời đề nghị của Mây Tea, cô Hạnh rủ cả xóm giữ khách. Phải chọn một đường.",
    dieuKien: { ngay: 50, sau: "c2_vy", chot: 53 },
    uuTien: 9,
    reRe: "Chọn một lần, kết truyện đổi theo. Bắt tay: sáng nào cũng có đơn sỉ trân châu. Giữ hẻm: hai tuần bị phá giá, rồi khách quen và khách giới thiệu tăng.",
    thoai: [
      ["vy", "{Ban} ơi, công ty em muốn đặt trân châu của tiệm cho cả chuỗi."],
      ["vy", "Sáng nào xe em cũng qua lấy. Giá sỉ đều, trả tiền liền."],
      ["hanh", "Còn cô với mấy quán trong hẻm tính lập hội, giới thiệu khách."],
      ["hanh", "Mây Tea mà phá giá thì một mình con chống không nổi đâu."],
      ["_", "(Bà Sáu ngồi đầu quầy, không nói gì, chỉ vuốt con Mướp.)"],
      ["vy", "Ly ngọt vừa bữa trước làm em nhớ quán bà Sáu quá.", { co: { vy_ly: "vua" } }],
    ],
    luaChon: [
      {
        chu: "Bắt tay với Mây Tea",
        nhanh: { may: "A" },
        thoai: [["vy", "Thiệt hả {ban}? Em về báo sếp liền!"], ["hanh", "Ừ… con tính vậy thì cô cũng hiểu."]],
      },
      {
        chu: "Giữ hẻm cùng cả xóm",
        nhanh: { may: "B" },
        thoai: [["hanh", "Vậy mới là người trong hẻm chớ!"], ["vy", "Dạ… em hiểu mà. Em xin lỗi vì mấy chuyện này."]],
      },
    ],
  },
  /* nhánh A · bắt tay */
  {
    id: "may_a1",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Xe Mây Tea tới lấy trân châu mỗi sáng. Chú Tư hỏi mai uống trà ở đâu.",
    dieuKien: { nhanh: { may: "A" }, sau: "c2_nga_re", cachNgay: 1, ngayDen: 60 },
    uuTien: 7,
    thoai: [
      ["_", "(Năm giờ sáng, xe tải nhỏ của Mây Tea đậu đầu hẻm lấy trân châu.)"],
      ["tu", "Con nấu cho tụi nó hả? Vậy mai chú uống trà ở đâu?"],
      ["tu", "Chú giỡn thôi. Có mối đều là mừng rồi, con làm cho kỹ nghen."],
      ["tu", "Mà từ bữa con pha ít ngọt, chú bớt đường thiệt đó nghen.", { co: { tu_ly: "it" } }],
    ],
  },
  {
    id: "may_a2",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Cô Hạnh ít ghé. Cô nói cô không giận, chỉ buồn.",
    dieuKien: { nhanh: { may: "A" }, sau: "may_a1", cachNgay: 1, ngayDen: 60 },
    uuTien: 7,
    thoai: [
      ["_", "(Mấy bữa nay cô Hạnh bán bánh mì mà không ngó qua tiệm.)"],
      ["hanh", "Cô không giận con đâu. Cô buồn thôi."],
      ["hanh", "Hẻm này mấy chục năm, giờ ai cũng lo phần mình."],
      ["hanh", "Mà combo mình vẫn bán nha. Bánh mì cô đâu có phá giá.", { co: { combo_hanh: true } }],
    ],
    luaChon: [
      { chu: "Mời cô ly trà gừng", dat: { a_hanh: "tra" }, ketQua: { than: { hanh: 1 } }, thoai: [["hanh", "Cái con này… Ừ, cô uống. Mai cô qua."]] },
      { chu: "Để cô yên vài bữa", dat: { a_hanh: "yen" }, thoai: [["_", "(Tối đó cô Hạnh để trước cửa tiệm một ổ bánh mì còn nóng.)"]] },
    ],
  },
  {
    id: "may_a3",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Vy cãi với công ty để giữ trân châu nấu mỗi sáng.",
    dieuKien: { nhanh: { may: "A" }, sau: "may_a2", cachNgay: 1, ngayDen: 60 },
    uuTien: 7,
    thoai: [
      ["vy", "Sếp em muốn đổi qua trân châu bột cho rẻ. Em cãi quá trời."],
      ["vy", "Em mang ly của {ban} lên họp. Cả phòng uống xong im re."],
      ["vy", "Công ty chịu rồi! Ly nào cũng ghi \"trân châu nấu mỗi sáng\"."],
    ],
  },
  {
    id: "c2_ket_a",
    chuong: 2,
    luc: "mo_cua",
    tomTat: "Bà Sáu uống thử ly ở Mây Tea, biết ngay là trân châu của tiệm, đưa trang 10.",
    dieuKien: { ngay: 55, soTrang: 7, nhanh: { may: "A" }, sau: "may_a3", chot: 59 },
    uuTien: 8,
    thoai: [
      ["sau", "Bữa nay bà ra đầu hẻm uống thử ly của tụi Mây Tea."],
      ["sau", "Trân châu mềm, ngọt vừa. Bà biết liền là của con."],
      ["sau", "Ông nhà bà nói: buôn có bạn, bán có phường. Bạn nào cũng là bạn."],
      ["hanh", "Thôi, cô hết buồn rồi. Mai qua uống ly trà gừng nữa.", { co: { a_hanh: "tra" } }],
      ["_", "(Bà Sáu đưa trang sổ có chữ của ông: \"Buôn có bạn, bán có phường\".)"],
    ],
    ketQua: { trang: 10, than: { sau: 1 } },
  },
  /* nhánh B · giữ hẻm */
  {
    id: "may_b1",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Mây Tea treo băng rôn đồng giá, khách vãng lai vắng hẳn.",
    dieuKien: { nhanh: { may: "B" }, sau: "c2_nga_re", cachNgay: 1, ngayDen: 60 },
    uuTien: 7,
    thoai: [
      ["_", "(Đầu hẻm treo băng rôn: \"Mây Tea đồng giá 15 ngàn, hai tuần\".)"],
      ["khoa", "Khách lạ qua bên đó hết rồi {ban}. Mà tụi shipper em vẫn ghé."],
      ["khoa", "Em nói tụi nó: ở đây có người hỏi han, bên kia có máy thôi."],
    ],
  },
  {
    id: "may_b2",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Cô Hạnh, chú Tư, Khoa lập Hội ghé tiệm, chia phiếu giới thiệu.",
    dieuKien: { nhanh: { may: "B" }, sau: "may_b1", cachNgay: 1, ngayDen: 60 },
    uuTien: 7,
    thoai: [
      ["hanh", "Cô in phiếu rồi nè: mua bánh mì bên cô, qua tiệm con bớt 3 ngàn."],
      ["tu", "Chú dán phiếu trên xe. Chở ai chú cũng đưa một tờ."],
      ["tu", "Từ bữa con pha ít ngọt, chú bớt đường thiệt đó nghen.", { co: { tu_ly: "it" } }],
      ["hanh", "Combo mình giờ thành vũ khí bí mật luôn đó con.", { co: { combo_hanh: true } }],
      ["_", "(Tối đó cả xóm ngồi gấp phiếu trên mấy cái ghế nhựa trước tiệm.)"],
    ],
    ketQua: { than: { hanh: 1, tu: 1 } },
  },
  {
    id: "may_b3",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Vy nghỉ việc ở Mây Tea, muốn mở xe trà nhỏ ở chợ.",
    dieuKien: { nhanh: { may: "B" }, sau: "may_b2", cachNgay: 1, ngayDen: 60 },
    uuTien: 7,
    thoai: [
      ["vy", "Em xin nghỉ rồi {ban}. Em không làm nổi cảnh phá giá hàng xóm."],
      ["vy", "Em tính mở xe trà nhỏ ở chợ. Mà em nấu trân châu còn dở lắm."],
    ],
    luaChon: [
      { chu: "Tặng Vy cái nồi nấu cũ", dat: { vy_b: "noi" }, thoai: [["vy", "Nồi này nấu trân châu cho cả hẻm đó hả? Em giữ kỹ lắm."]] },
      { chu: "Hẹn Vy sáng mai qua học", dat: { vy_b: "hoc" }, thoai: [["vy", "Dạ! Năm giờ sáng em có mặt, {ban} đừng ngủ quên nha."]] },
    ],
  },
);

/* ---------- Ngã rẽ Linh (Chương 1): ở lại làm thêm hay đi học Đà Lạt ---------- */
MAU_CHUYEN.push(
  {
    id: "linh_a1",
    chuong: 1,
    luc: "dong_cua",
    tomTat: "Ca làm đầu tiên của Linh: pha lẹ mà quên bỏ đá.",
    dieuKien: { nhanh: { linh: "A" }, co: { linh_da_lam: true }, sau: "linh_3", cachNgay: 2 },
    uuTien: 7,
    thoai: [
      ["linh", "Ca đầu tiên! Em pha lẹ mà quên bỏ đá ba ly liền, hihi."],
      ["linh", "Em học thuộc hết menu rồi nè. Hỏi thử đi {ban}!"],
      ["_", "(Linh đọc vanh vách cả menu, sai đúng một món.)"],
    ],
    ketQua: { than: { linh: 1 } },
  },
  {
    id: "linh_a2",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Linh nghĩ ra món \"Ly thi đậu\", tay nghề lên một bậc.",
    dieuKien: { nhanh: { linh: "A" }, sau: "linh_a1", cachNgay: 5 },
    uuTien: 6,
    thoai: [
      ["linh", "Em nghĩ ra món: hồng trà đào thêm thạch, tên là \"Ly thi đậu\"."],
      ["linh", "Khách học sinh gọi quá trời, tụi nó nói uống cho may."],
      ["_", "(Tay nghề của Linh tăng thêm một bậc.)"],
    ],
    ketQua: { goi: "linhLenNghe" },
  },
  {
    id: "linh_b1",
    chuong: 1,
    luc: "dong_cua",
    tomTat: "Linh gửi thư từ Đà Lạt kèm gói trà olong đồi Cầu Đất.",
    dieuKien: { nhanh: { linh: "B" }, sau: "linh_3", cachNgay: 4 },
    uuTien: 7,
    thoai: [
      ["tin", "Linh: {Ban} ơi, Đà Lạt lạnh xíu mà đẹp lắm!"],
      ["tin", "Linh: Em gửi gói trà olong đồi Cầu Đất, {ban} pha thử nha."],
      ["_", "(Trong gói trà có tấm ảnh Linh đứng giữa đồi chè, áo khoác to sụ.)"],
    ],
    ketQua: { mo: "olong", hang: { olong: 20 } },
  },
  {
    id: "linh_b2",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Linh làm thêm ở quán trà trên Đà Lạt, hẹn Tết về ghé tiệm.",
    dieuKien: { nhanh: { linh: "B" }, sau: "linh_b1", cachNgay: 10, ngay: 32 },
    uuTien: 6,
    thoai: [
      ["tin", "Linh: Em đi làm thêm ở quán trà trên này. Ai cũng khen em pha lẹ."],
      ["tin", "Linh: Em kể về tiệm {shop} hoài, chủ quán muốn ghé thăm luôn."],
      ["tin", "Linh: Tết em về, {ban} để dành cho em một ly nha!"],
    ],
    ketQua: { than: { linh: 1 } },
  },
);

/* ---------- Ngã rẽ Hana (Chương 2): ghi tên tiệm hay giữ kín ---------- */
MAU_CHUYEN.push(
  {
    id: "hana_a1",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Khách lạ xếp hàng tới đầu hẻm, chú Tư mất chỗ ngồi quen.",
    dieuKien: { nhanh: { hana: "A" }, sau: "hana_3", cachNgay: 2 },
    uuTien: 6,
    thoai: [
      ["_", "(Khách lạ cầm điện thoại xếp hàng tới tận đầu hẻm.)"],
      ["tu", "Cái ghế đẩu của chú có đứa ngồi chụp hình rồi. Thôi chú về."],
    ],
    luaChon: [
      { chu: "Giữ ghế riêng cho chú Tư", dat: { hana_ghe: "giu" }, ketQua: { than: { tu: 1 } }, thoai: [["tu", "Ghế có tên chú luôn hả? Ha ha, được!"]] },
      { chu: "Mời chú ly mang về", dat: { hana_ghe: "mang" }, thoai: [["tu", "Ừ, mang về cũng được. Đông vậy là mừng cho con."]] },
    ],
  },
  {
    id: "hana_a2",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Hana quay thêm video về người trong hẻm, hẹn sau Tết về nước.",
    dieuKien: { nhanh: { hana: "A" }, sau: "hana_a1", cachNgay: 3 },
    uuTien: 6,
    thoai: [
      ["hana", "Tôi đọc bình luận rồi. Có người chê hẻm ồn, tôi buồn."],
      ["hana", "Tôi quay thêm một video về chú Tư, bà Sáu, cô Hạnh nha."],
      ["hana", "Sau Tết tôi về nước. Nhưng video sẽ ở lại với hẻm."],
    ],
    ketQua: { than: { hana: 1, hanh: 1 } },
  },
  {
    id: "hana_b1",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Hana học pha trà, đổ tràn ra quầy, cười ngặt nghẽo.",
    dieuKien: { nhanh: { hana: "B" }, sau: "hana_3", cachNgay: 2 },
    uuTien: 6,
    thoai: [
      ["hana", "Hôm nay tôi học pha trà với {ban} được không?"],
      ["_", "(Hana rót trà xoài, đổ tràn ra quầy, cười ngặt nghẽo.)"],
      ["hana", "Khó quá! Nhưng tôi thích. Mướp cũng thích."],
    ],
    ketQua: { than: { hana: 1 } },
  },
  {
    id: "hana_b2",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Hana xin ở lại ăn Tết trong hẻm, bà Sáu hứa dạy gói bánh tét.",
    dieuKien: { nhanh: { hana: "B" }, sau: "hana_b1", cachNgay: 3 },
    uuTien: 6,
    thoai: [
      ["hana", "Tết này tôi không về nước. Tôi muốn ăn Tết ở hẻm này."],
      ["sau", "Ở với bà. Bà dạy con gói bánh tét."],
      ["hana", "Bánh… tét! Tôi nhớ rồi!"],
    ],
    ketQua: { co: { hana_tet: true }, than: { sau: 1 } },
  },
);

/* ---------- Ngã rẽ Tết (Chương 3): về quê hay ở lại ----------
   nghi: xong cảnh thì tiệm nghỉ ngày đó (không bán, không tiền nhà, không lương), cảnh nghỉ kế tiếp hiện liền. */
MAU_CHUYEN.push(
  {
    id: "que_1",
    chuong: 3,
    nhan: "Chương 3 · Về quê ăn Tết",
    luc: "mo_cua",
    nghi: true,
    tomTat: "Về quê: ba ra bến xe đón, Khoa nhắn tiệm bình an.",
    dieuKien: { nhanh: { tet: "A" }, sau: "c3_vang", cachNgay: 1 },
    uuTien: 10,
    thoai: [
      ["_", "(Xe đò về tới bến lúc chạng vạng. Ba đứng chờ, tay cầm cái nón.)"],
      ["_", "(Ba xách giùm cái giỏ, chỉ hỏi: \"Tiệm bán được không con?\")"],
      ["tin", "Khoa: Tiệm bình an nha {ban}. Mướp ăn hết nửa con cá rồi."],
    ],
  },
  {
    id: "que_2",
    chuong: 3,
    nhan: "Chương 3 · Về quê ăn Tết",
    luc: "mo_cua",
    nghi: true,
    tomTat: "Bếp của mẹ: mẹ từng uống trà ở quán bà Sáu, đưa trang 11.",
    dieuKien: { nhanh: { tet: "A" }, sau: "que_1", cachNgay: 1 },
    uuTien: 10,
    thoai: [
      ["_", "(Mái nhà mới lợp năm rồi, đêm mưa nghe êm ru.)", { co: { ds_qua_mai_nha: true } }],
      ["me_gap", "Con nếm thử nồi trà gừng này coi. Công thức của bà ngoại."],
      ["me_gap", "Hồi mẹ lên Sài Gòn đi học, mẹ uống trà quán bà Sáu hoài."],
      ["_", "(Mẹ lấy trong hộc tủ ra một trang giấy cũ, nét chữ lạ mà quen.)"],
      ["me_gap", "Bà Sáu đưa mẹ trang này hồi đó. Giờ con giữ đi."],
      ["me_gap", "Mẹ tự hào về con."],
    ],
    ketQua: { trang: 11, co: { me_que: true } },
  },
  {
    id: "que_3",
    chuong: 3,
    nhan: "Chương 3 · Về quê ăn Tết",
    luc: "mo_cua",
    nghi: true,
    tomTat: "Trở lại hẻm với lì xì của ba, Khoa kể ba ngày trông tiệm.",
    dieuKien: { nhanh: { tet: "A" }, sau: "que_2", cachNgay: 1 },
    uuTien: 10,
    thoai: [
      ["_", "(Bạn về lại hẻm. Trong giỏ có mứt gừng và phong bì lì xì của ba.)"],
      ["khoa", "Em trông tiệm ba ngày, bán hết sạch trà đá luôn {ban}!"],
      ["khoa", "Linh từ Đà Lạt về, ghé để lại hộp mứt atiso cho {ban} nè.", { nhanh: { linh: "B" } }],
      ["khoa", "Linh ghé phụ em một buổi, pha lẹ hơn em nữa.", { nhanh: { linh: "A" } }],
      ["khoa", "Hana ghé chúc Tết, nói được câu \"An khang thịnh vượng\" luôn.", { co: { hana_tet: true } }],
    ],
    ketQua: { tien: 500000 },
  },
  {
    id: "tet_b1",
    chuong: 3,
    luc: "mo_cua",
    tomTat: "Mùng một: hẻm vắng mà tiệm đông khách đi chơi Tết.",
    dieuKien: { nhanh: { tet: "B" }, sau: "c3_vang", cachNgay: 1 },
    uuTien: 9,
    thoai: [
      ["_", "(Mùng một. Hẻm vắng mà tiệm đông, toàn khách đi chơi Tết ghé ngang.)"],
      ["khoa", "Em chạy đơn Tết, bo gấp ba! Ghé {ban} lấy ly trà đá lấy hên."],
      ["tin", "Linh: Em về tới bến xe rồi! Chiều em ghé tiệm nha {ban}!", { nhanh: { linh: "B" } }],
      ["linh", "Chúc {ban} năm mới đắt hàng! Hôm nay em đứng quầy cho.", { nhanh: { linh: "A" } }],
      ["hana", "Chúc mừng năm mới! Tôi gói bánh tét với bà Sáu rồi nè!", { co: { hana_tet: true } }],
    ],
  },
);

/* ---------- Hẻm 42 lần nữa: cảnh chỉ có từ lượt chơi thứ hai (luot) ---------- */
MAU_CHUYEN.push(
  {
    id: "lan2_meo",
    chuong: 1,
    luc: "mo_cua",
    tomTat: "Mướp nhìn bạn như đã gặp ở đâu rồi.",
    dieuKien: { ngay: 7, luot: 2 },
    uuTien: 9,
    thoai: [
      ["_", "(Mướp nhìn bạn rất lâu, như đã gặp ở đâu rồi.)"],
      ["sau", "Lạ ghê. Con Mướp ít cho ai vuốt, vậy mà bữa đầu nó chịu con liền.", { co: { c0_meo: "vuot" } }],
      ["sau", "Lạ ghê. Con Mướp chưa cho ai vuốt mà nó chịu nằm cạnh con.", { khongCo: { c0_meo: "vuot" } }],
      ["sau", "Chắc kiếp trước con bán trà ở hẻm này rồi đó."],
    ],
  },
  {
    id: "lan2_mo",
    chuong: 2,
    luc: "dong_cua",
    tomTat: "Bà Sáu kể giấc mơ về tiệm, giống những kết bạn từng thấy.",
    dieuKien: { ngay: 46, luot: 2 },
    uuTien: 7,
    thoai: [
      ["sau", "Đêm qua bà nằm mơ thấy tiệm con, mà lạ lắm."],
      ["sau", "Bà thấy xe Mây Tea tới hẻm lấy trân châu của con.", { ketDaThay: ["thuong_hieu", "xuong_tran_chau"] }],
      ["sau", "Bà thấy cả xóm ngồi gấp phiếu trước tiệm, vui dữ lắm.", { ketDaThay: ["tiem_cua_xom", "len_ban_do"] }],
      ["sau", "Mơ vậy thôi. Đường nào cũng là đường của con."],
    ],
  },
);

/* ---------- Chọn bằng ly pha ----------
   Khách trong truyện ghé với một đơn đặc biệt. Ly pha trúng phương án nào thì ghi cờ co = id phương án.
   Có gợi ý hiện khi khách tới; phương án nào cũng tính là pha đúng. can: bậc tối thiểu (cần chọn đường, đá). */
const DON_TRUYEN = [
  {
    id: "linh_thi",
    ai: "linh",
    co: "linh_ly",
    can: 2,
    dk: { xem: "linh_2", chuaXem: "linh_3" },
    xin: "{Ban} ơi, mai em thi rồi. Cho em",
    het: " như cũ nha!",
    goiY: "Mai Linh thi. Pha đúng như cũ, hay thêm thạch cho Linh có sức?",
    phuongAn: [
      { id: "cu", mon: { base: "hong", flav: "f_dao", tops: [], sugar: 50, ice: "Ít đá" }, phan: "Đúng vị quen. Em hết run rồi!" },
      { id: "thach", mon: { base: "hong", flav: "f_dao", tops: ["thach"], sugar: 50, ice: "Ít đá" }, phan: "Có thạch! {Ban} hiểu em ghê." },
    ],
  },
  {
    id: "tu_duong",
    ai: "tu",
    co: "tu_ly",
    can: 2,
    dk: { ngay: 32, xem: "tu_3" },
    xin: "Trời mưa lạnh quá. Cho chú",
    het: " nghen… mà bác sĩ dặn chú bớt đường.",
    goiY: "Chú Tư đòi 100% đường mà bác sĩ dặn bớt. Pha đúng như chú gọi, hay chỉ 30%?",
    phuongAn: [
      { id: "ngot", mon: { base: "tra", tops: [], sugar: 100, ice: "Đá thường" }, phan: "Ngọt đã đời! Mà thôi, bữa nay thôi nghen." },
      { id: "it", mon: { base: "tra", tops: [], sugar: 30, ice: "Đá thường" }, phan: "Con bớt đường cho chú hả… Ừ, chú nghe con." },
    ],
  },
  {
    id: "vy_chuan",
    ai: "vy",
    co: "vy_ly",
    can: 2,
    dk: { xem: "c2_vy", chuaXem: "c2_nga_re" },
    xin: "{Ban} ơi, cho em",
    het: " kiểu chuỗi tụi em nha.",
    goiY: "Vy gọi kiểu chuỗi 100% đường. Pha đúng như vậy, hay ngọt vừa 50% kiểu quán bà Sáu?",
    phuongAn: [
      { id: "chuan", mon: { base: "tra", tops: ["tcden"], sugar: 100, ice: "Đá thường" }, phan: "Y chang bên em mà ngon hơn. Lạ ghê." },
      { id: "vua", mon: { base: "tra", tops: ["tcden"], sugar: 50, ice: "Đá thường" }, phan: "Ngọt vừa… Giống ly hồi nhỏ em uống ở quán bà Sáu." },
    ],
  },
];

/* ---------- Ngã rẽ, kết truyện, hậu truyện ----------
   NGA_RE: các ngã rẽ lớn (hiện trong Sổ tay). Đợt sau thêm Linh, Hana, Tết.
   KET_CUC: tên kết theo ngã rẽ Mây Tea và ngã rẽ Hana (video = đã cho ghi tên tiệm).
   HAU_TRUYEN: mỗi nhân vật lấy dòng đầu tiên khớp điều kiện (cùng kiểu điều kiện với câu thoại); an = không hiện. */
const NGA_RE = [
  { id: "linh", ten: "Linh thi xong", chuong: 1, canh: "linh_3", nhanh: { A: "Ở lại làm thêm", B: "Đi học Đà Lạt" } },
  { id: "hana", ten: "Video của Hana", chuong: 2, canh: "hana_3", nhanh: { A: "Ghi tên tiệm", B: "Chỉ quay con hẻm" }, ghiChu: "Cần thân với Hana" },
  { id: "may", ten: "Chuỗi Mây Tea", chuong: 2, canh: "c2_nga_re", nhanh: { A: "Bắt tay với Mây Tea", B: "Giữ hẻm cùng cả xóm" } },
  { id: "tet", ten: "Tết", chuong: 3, canh: "c3_vang", nhanh: { A: "Về quê ăn Tết", B: "Ở lại mở cửa" } },
];
const KET_CUC = [
  {
    id: "tiem_cua_xom",
    may: "B",
    video: false,
    ten: "Tiệm của xóm",
    chu: "Tiệm vẫn nhỏ, vẫn nằm dưới căn gác của bà Sáu. Ai trong hẻm cũng có một ly quen, và ly nào cũng có tên người uống.",
    /* tiệm đã ra mặt tiền (chuMt) hoặc có chi nhánh (chuCn) */
    chuMt: "Tiệm ra tới đầu hẻm mà hàng vẫn nấu dưới căn gác của bà Sáu. Ai trong hẻm cũng có một ly quen, và ly nào cũng có tên người uống.",
    chuCn: "Tiệm có thêm chi nhánh, mà hàng vẫn nấu dưới căn gác của bà Sáu. Ai trong hẻm cũng có một ly quen, và ly nào cũng có tên người uống.",
  },
  {
    id: "len_ban_do",
    may: "B",
    video: true,
    ten: "Hẻm 42 lên bản đồ",
    chu: "Khách phương xa theo video của Hana tìm vào tận hẻm. Họ ghé tiệm, rồi ghé luôn bánh mì cô Hạnh, xe ôm chú Tư. Cả xóm cùng đông.",
  },
  {
    id: "xuong_tran_chau",
    may: "A",
    video: false,
    ten: "Xưởng trân châu đầu hẻm",
    chu: "Mỗi sáng xe Mây Tea tới lấy trân châu nấu trong hẻm. Cả thành phố uống trân châu của tiệm mà không biết. Bà Sáu vẫn ngồi đầu quầy.",
  },
  {
    id: "thuong_hieu",
    may: "A",
    video: true,
    ten: "Thương hiệu từ con hẻm",
    chu: "Video của Hana và ly trân châu nhà làm đưa tên tiệm lên ly của cả chuỗi. Công ty của Vy gọi đó là công thức Hẻm 42.",
  },
];
const HAU_TRUYEN = [
  ["meo", [
    [{ co: { c0_meo: "vuot" } }, "Mướp vẫn nằm đúng chỗ bữa đầu bạn vuốt nó. Khách quen gọi nó là quản lý."],
    [{}, "Mướp nghe bà Sáu kể chuyện quán nước cả trăm lần, giờ ngủ ngon lành trên quầy."],
  ]],
  ["sau", [
    [{ nhanh: { may: "A" } }, "Bà Sáu ra đầu hẻm uống ly Mây Tea mỗi chiều, lần nào cũng nói: \"Trân châu này của con.\""],
    [{ co: { chi_nhanh: true } }, "Sáng nào bà Sáu cũng đứng đầu hẻm đếm từng thùng trân châu chở qua chi nhánh."],
    [{}, "Bà Sáu treo lại tấm bảng quán nước của ông trên vách tiệm, ngay chỗ Mướp nằm."],
  ]],
  ["tu", [
    [{ co: { tu_ly: "it" } }, "Chú Tư bớt ngọt được nửa năm, bác sĩ khen. Chú khoe cả hẻm là nhờ tiệm."],
    [{ co: { hana_ghe: "giu" } }, "Cái ghế đẩu có tên chú Tư vẫn đứng đầu quầy. Khách lạ tới chỉ dám chụp hình, không dám ngồi."],
    [{ co: { tu_app: "som" } }, "Chú Tư thành tài xế app năm sao. Chở khách nào chú cũng vòng qua tiệm."],
    [{ xem: "tu_1" }, "Chú Tư bấm app chậm rì mà khách đầu hẻm vẫn chờ chú. Ly trà sữa ít ngọt vẫn để sẵn."],
    [{}, "Chú Tư vẫn chạy xe ôm đầu hẻm, sáng nào cũng ghé một ly trà sữa ít ngọt."],
  ]],
  ["khoa", [
    [{ co: { khoa_tet: "trong" } }, "Khoa trông tiệm ba ngày Tết, bán sạch trà đá, để lại tờ giấy: \"Em giữ tiệm kỹ lắm nha.\""],
    [{ co: { khoa_tet: true } }, "Khoa ăn Tết cùng bà Sáu, mang theo trái dưa hấu to nhất chợ."],
    [{ co: { c0_khoa: "tra_da" } }, "Góc trà đá cho shipper trước tiệm có tấm bảng nhỏ: \"Góc của Khoa\"."],
    [{ co: { khoa_que: true } }, "Khoa để dành đủ tiền, hè này về Bến Tre, hứa mang dừa lên cho cả tiệm."],
    [{}, "Khoa vẫn chạy đơn giữa nắng mưa, ngày nào cũng ghé uống một ly rồi mới chạy tiếp."],
  ]],
  ["linh", [
    [{ co: { linh_da_lam: true, linh_co_vu: "viet" } }, "Linh vừa học vừa làm ở tiệm. Ly nào Linh pha cũng có một câu cổ vũ viết tay."],
    [{ co: { linh_da_lam: true } }, "Linh vừa học vừa làm ở tiệm, pha lẹ hơn cả chủ."],
    [{ nhanh: { linh: "A" } }, "Linh vẫn chờ tiệm gọi đi làm, tuần nào cũng ghé hỏi: \"Bữa nay cần em hông?\""],
    [{ nhanh: { linh: "B" }, co: { linh_ly: "thach" } }, "Linh học năm hai ở Đà Lạt, mở góc trà nhỏ trong ký túc xá, ly nào cũng có thạch."],
    [{ nhanh: { linh: "B" } }, "Linh học năm hai ở Đà Lạt, mỗi mùa gửi về tiệm một gói trà đồi Cầu Đất."],
    [{ xem: "linh_1" }, "Linh vào đại học, vẫn giữ cái ly từ bữa đi thi trên bàn học."],
    [{ an: true }],
  ]],
  ["hanh", [
    [{ nhanh: { may: "A" }, co: { a_hanh: "tra" } }, "Cô Hạnh giận đúng ba bữa. Giờ chiều nào cũng qua uống ly trà gừng."],
    [{ nhanh: { may: "A" } }, "Cô Hạnh vẫn để trước cửa tiệm một ổ bánh mì mỗi sáng, không nói gì."],
    [{ co: { combo_hanh: true } }, "Combo bánh mì với trà thành bữa sáng của cả hẻm. Cô Hạnh tính mở thêm xe thứ hai."],
    [{}, "Cô Hạnh vẫn soi giá tiệm mỗi tuần, rồi vẫn mua một ly."],
  ]],
  ["vy", [
    [{ nhanh: { may: "A" }, co: { vy_ly: "vua" } }, "Vy thành quản lý vùng, đổi cả chuỗi sang ngọt vừa. Khách nói giống vị quán bà Sáu."],
    [{ nhanh: { may: "A" } }, "Vy thành quản lý vùng. Ly nào của Mây Tea cũng ghi \"trân châu nấu mỗi sáng\"."],
    [{ nhanh: { may: "B" }, co: { vy_b: "hoc" } }, "Xe trà của Vy ở chợ đông khách. Sáng nào Vy cũng qua tiệm học nấu một mẻ."],
    [{ nhanh: { may: "B" } }, "Xe trà của Vy ở chợ đông khách, nồi nấu trân châu là cái nồi cũ của tiệm."],
    [{ an: true }],
  ]],
  ["hana", [
    [{ nhanh: { hana: "A" } }, "Video Hẻm 42 thành video nhiều lượt xem nhất kênh của Hana. Cô hẹn Tết sau quay lại."],
    [{ nhanh: { hana: "B" }, co: { hana_tet: true } }, "Hana ăn Tết ở hẻm, gói cái bánh tét méo nhất năm. Bà Sáu khen hoài."],
    [{ nhanh: { hana: "B" } }, "Hana về nước. Kênh của cô có một video về con hẻm đẹp mà không ai biết ở đâu."],
    [{ co: { hana_muop: true } }, "Hana về nước, mang theo ba chữ tiếng Việt: Mướp, xoài, cảm ơn."],
    [{ xem: "hana_1" }, "Hana về nước, thỉnh thoảng gửi ảnh ly trà xoài cô tự pha."],
    [{ an: true }],
  ]],
  ["me_gap", [
    [{ co: { ds_nha_hem: true } }, "Ba mẹ dọn lên căn nhà cuối Hẻm 42. Sáng nào mẹ cũng ra tiệm phụ rửa ly."],
    [{ co: { ds_qua_mai_nha: true } }, "Mẹ nhắn: \"Mưa lớn mà ba ngủ ngon, lâu lắm rồi.\" Mái nhà ở quê không còn dột."],
    [{ co: { ds_qua_du_lich: true } }, "Tấm hình ba mẹ đứng ở biển, mẹ để làm hình nền điện thoại."],
    [{ nhanh: { tet: "A" } }, "Mẹ gói cho con túi mứt gừng, dặn: \"Tết sau về nữa nghen. Dẫn Mướp về luôn.\""],
    [{ co: { me_len: true, c1_vay: "me" } }, "Mẹ về quê kể với ba chuyện tiền gửi. Ba chỉ hỏi: \"Tiệm có bán trà đá không?\""],
    [{ co: { me_len: true } }, "Mẹ in đánh giá năm sao của mình ra, dán lên tủ lạnh cạnh tên tiệm."],
    [{}, "Mẹ vẫn đọc từng đánh giá của tiệm mỗi tối, rồi nhắn: \"Ăn cơm chưa con?\""],
  ]],
];

/* ---------- Bản 4.9: lấp khoảng trống cuối Chương 2 · chi nhánh và chợ giáp Tết ---------- */
MAU_CHUYEN.push(
  {
    id: "c2_chi_nhanh",
    chuong: 2,
    luc: "mo_cua",
    tomTat: "Vy kể có mấy mặt bằng đang sang nhượng. Bà Sáu dặn hàng vẫn nấu ở tiệm gốc.",
    /* sau khi Vy đã quyết ở lại chuỗi hay ra chợ; ưu tiên thấp: tới vào ngày trống đầu tiên */
    dieuKien: { ngay: 50, buoc: 2, sau: ["may_a3", "may_b3"] },
    uuTien: 3,
    thoai: [
      ["vy", "Em mới đẩy xe trà ra chợ, nghe mấy chỗ đang sang nhượng. Ngon lắm {ban}.", { nhanh: { may: "B" } }],
      ["vy", "Mây Tea mở thêm kiosk, sếp em hỏi tiệm có muốn giữ một chỗ không.", { khongNhanh: { may: "B" } }],
      ["_", "(Tờ giấy Vy để lại ghi ba chỗ: gần trường, toà văn phòng, kiosk.)"],
      ["sau", "Muốn mở thêm thì mở. Mà tiệm gốc vẫn ở dưới gác bà nghen."],
      ["sau", "Hàng nấu ở đây, chở qua đó. Dư bữa nào đỡ phí bữa đó."],
    ],
    ketQua: { co: { chi_nhanh_mo: true } },
  },
  {
    id: "cn_cho_hang",
    chuong: 3,
    luc: "mo_cua",
    tomTat: "Chú Tư nhận chở hàng từ tiệm gốc qua chi nhánh mỗi sáng.",
    /* cn_khai_truong: ngày mở chi nhánh, ghi trong moChiNhanh (src/chi-nhanh.js) */
    dieuKien: { sau: "cn_khai_truong", cachNgay: 2, buoc: 2 },
    uuTien: 6,
    thoai: [
      ["tu", "Sáng nào chú cũng chạy qua chở hàng cho chi nhánh. Khỏi kêu app."],
      ["tu", "Chú khoe với khách: trà này nấu ở Hẻm 42 đó nghen!"],
      ["_", "(Thùng trân châu còn ấm, buộc gọn sau yên xe chú Tư.)"],
    ],
    ketQua: { than: { tu: 1 } },
  },
  {
    id: "c3_gia_tet",
    chuong: 3,
    luc: "mo_cua",
    tomTat: "Giáp Tết chợ lên giá, khách đông mà khó tính hơn.",
    dieuKien: { ngay: 60 },
    uuTien: 6,
    thoai: [
      ["_", "(Chợ Bà Chiểu treo đầy câu đối đỏ. Trà, sữa, đường đều lên giá.)"],
      ["hanh", "Giáp Tết cái gì cũng lên giá. Bột mì cô mua mắc hơn tuần trước."],
      ["tu", "Mấy bữa này khách đông mà khó tính lắm. Con pha lẹ tay nghen."],
    ],
    ketQua: { than: { hanh: 1, tu: 1 } },
  },
);

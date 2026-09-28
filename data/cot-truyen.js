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
     },
     uuTien: 5,                     // nhiều mẩu cùng đủ điều kiện thì chọn số lớn nhất
     thoai: [["khoa", "câu"], ["_", "(chú thích hành động)"], ["tin", "Mẹ: tin nhắn"], ["linh", "câu", { co: { x: 1 } }]],
     luaChon: [{ chu: "nút", dat: { ten: giá trị }, thoai: [[ai, câu]], ketQua: {...} }],
     ketQua: { than: { khoa: 1 }, trang: 2, co: { ten: giá trị }, tien: 50000 }
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
    tomTat: "Bà Sáu giao chìa khoá tiệm, mèo Mướp chọn chỗ nằm trên quầy.",
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
    tomTat: "Chú Tư xe ôm ghé ủng hộ ly trà đầu tiên.",
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
    tomTat: "Khoa shipper xin ly nước giữa trưa nắng.",
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
  { ten: "Góc nghỉ chân", chu: "Người chạy xe cả ngày, cho họ chỗ ngồi với ly nước là họ nhớ mình.", uuDai: "Tài xế app chờ lâu hơn 20%" },
  { ten: "Trà sữa bà Sáu", chu: "Trà đậm, sữa đặc ít thôi, thêm chút xíu muối cho ngọt hậu.", uuDai: "Tiền tip tăng 10%" },
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
    tomTat: "Khoa rủ shipper ghé tiệm và đưa trang sổ thứ 3 nhặt được hôm mưa.",
    dieuKien: { than: { khoa: 6 }, sau: "khoa_2", cachNgay: 2 },
    uuTien: 7,
    thoai: [
      ["khoa", "{Ban} biết hông, tụi shipper khu này hay ghé đây ngồi nghỉ."],
      ["khoa", "Có bình trà đá miễn phí là tụi em nhớ tiệm {shop} liền."],
      ["khoa", "Áo mưa bữa đó em giặt sạch rồi nè.", { co: { khoa_mua: "ao" } }],
      ["_", "(Khoa đưa một tờ giấy gấp tư, dính chút nước mưa.)"],
      ["khoa", "Em lượm ở đầu hẻm hôm mưa. Chữ ai viết đẹp ghê."],
    ],
    ketQua: { than: { khoa: 1 }, trang: 3 },
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
    tomTat: "Linh thi đậu, gửi trang sổ thứ 4 của ông nội và xin làm thêm.",
    dieuKien: { than: { linh: 6 }, sau: "linh_2", cachNgay: 3 },
    uuTien: 7,
    thoai: [
      ["linh", "{Ban} ơi! Em đậu rồi! Điểm cao hơn em tưởng luôn."],
      ["linh", "Cái ly {ban} viết chữ, em để trên bàn học nè.", { co: { linh_co_vu: "viet" } }],
      ["linh", "Ông nội gửi cái này. Hồi xưa ông uống trà ở quán bà Sáu hoài."],
      ["_", "(Trang sổ ố vàng: \"Trà sữa bà Sáu: trà đậm, ít sữa, chút muối.\")"],
      ["linh", "Hè này em đi làm thêm được hông {ban}? Em pha lẹ lắm!"],
    ],
    ketQua: { than: { linh: 1 }, trang: 4, co: { linh_lam: true } },
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
    dieuKien: { ngay: 26, soTrang: 3 },
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
      ["linh", "Em mang hoa qua nè. Chúc tiệm đông khách!"],
      ["sau", "Nhớ về hẻm nấu hàng. Con Mướp nó theo con ra luôn rồi đó."],
    ],
    ketQua: { than: { sau: 1, tu: 1, khoa: 1, linh: 1 } },
  },
);

/* ---------- Lễ theo lịch thật: mỗi năm thêm cảnh mới với id có năm ---------- */
MAU_CHUYEN.push(
  {
    id: "le_noel_2026",
    nhan: "Giáng sinh ở Hẻm 42",
    chuong: 1,
    luc: "mo_cua",
    tomTat: "Noel ở Hẻm 42: Linh treo kim tuyến, Mướp bị đội nón ông già Noel.",
    dieuKien: { le: "noel" },
    uuTien: 12,
    thoai: [
      ["linh", "{Ban} ơi, Noel nè! Em treo dây kim tuyến lên quầy nha."],
      ["khoa", "Tối nay nhà thờ Đức Bà kẹt xe dữ lắm, đơn ship chắc nhiều."],
      ["_", "(Mướp đội cái nón ông già Noel nhỏ xíu, mặt không vui lắm.)"],
    ],
    ketQua: { than: { linh: 1, khoa: 1 } },
  },
  {
    id: "le_ong_tao_2027",
    nhan: "Tết ở Hẻm 42",
    chuong: 1,
    luc: "mo_cua",
    tomTat: "Hai mươi ba tháng Chạp, thả cá chép tiễn ông Táo cùng bà Sáu.",
    dieuKien: { le: "tet", tuNgayThat: "2027-01-28", denNgayThat: "2027-02-04" },
    uuTien: 12,
    thoai: [
      ["sau", "Hai mươi ba tháng Chạp rồi. Con phụ bà thả cá chép tiễn ông Táo nghen."],
      ["_", "(Hai bà cháu ra kênh thả ba con cá chép vàng.)"],
      ["sau", "Năm nay tiệm con làm ăn được. Ông Táo lên trời có chuyện vui mà kể."],
    ],
    ketQua: { than: { sau: 1 } },
  },
  {
    id: "le_tet_2027",
    nhan: "Tết ở Hẻm 42",
    chuong: 1,
    luc: "mo_cua",
    tomTat: "Ba mẹ lên thăm tiệm dịp Tết, chú Tư chở từ bến xe về.",
    dieuKien: { le: "tet", tuNgayThat: "2027-02-05" },
    uuTien: 13,
    thoai: [
      ["tin", "Mẹ: Tết này con có về không…"],
      ["tin", "Mẹ: Thôi, ba mẹ lên thăm con. Nhớ để dành bàn cho ba ngồi."],
      ["_", "(Chú Tư chở hai ông bà từ bến xe về tận Hẻm 42.)"],
      ["tu", "Ông bà coi, tiệm con mình đông khách lắm đó nghen!"],
    ],
    ketQua: { co: { me_len: true }, than: { tu: 1 } },
  },
);

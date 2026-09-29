/* ---------- ĐỜI SỐNG CỦA CHỦ TIỆM ----------
   Tab Đời sống (data/doi-song.js, hình ở src/hinh-doi-song.js): thuê chỗ ở, mua nhà, xe máy, ô tô, điện thoại,
   đồ cho bản thân, quà cho gia đình. Nhà và ô tô mua thẳng hoặc trả góp: trả trước 30%, góp mỗi ngày, ngân hàng
   chỉ cho tổng tiền góp tới nửa thu nhập. Mỗi ngày mở tiệm tốn ăn uống, chỗ ở, xăng xe (Thư giãn miễn), cộng tiền góp.
   Sổ sách theo dòng tiền như cả game: ghi tiền trả trước lúc mua, rồi ghi tiền góp mỗi ngày. Nạp trước game.js. */

const DS_DONG = { tro: DS_TRO, nha: DS_NHA, xm: DS_XM, ot: DS_OT, dt: DS_DT };
function dsS() {
  if (!S.ds) S.ds = { tro: DS_TRO[0].id, nha: null, xm: DS_XM[0].id, ot: null, dt: DS_DT[0].id, do: {}, qua: {}, coc: 0, vay: {} };
  const d = S.ds;
  if (d.o !== undefined || d.xe !== undefined) chuyenDs50(d);
  d.vay = d.vay || {};
  /* bản 5.3: bản lưu từng hoàn tiền nhà xe mà cờ còn sót thì xoá cờ nhà, ô tô không còn có (một lần) */
  if (!d.coV) {
    d.coV = 1;
    const co = TT().co;
    if (!(DS_NHA.some((x) => x.id === d.nha))) ["ds_co_nha", "ds_nha_hem"].forEach((k) => delete co[k]);
    if (!(DS_OT.some((x) => x.id === d.ot))) delete co.ds_o_to;
  }
  return d;
}
/* bản lưu 5.0 (nhà xe giá thu nhỏ): hoàn lại tiền đã mua nhà xe, điện thoại và món đồ không còn bán; giữ nấc thuê, báo một lần */
function chuyenDs50(d) {
  let hoan = (DS_GIA_CU[d.o] || 0) + (DS_GIA_CU[d.xe] || 0);
  if (!DS_DT.some((x) => x.id === d.dt)) {
    hoan += DS_GIA_CU[d.dt] || 0;
    d.dt = DS_DT[0].id;
  }
  Object.keys(d.do || {})
    .filter((id) => !DS_DO.some((x) => x.id === id))
    .forEach((id) => {
      hoan += DS_GIA_CU[id] || 0;
      delete d.do[id];
    });
  d.tro = DS_TRO.some((x) => x.id === d.o) ? d.o : "can_ho_thue";
  if (!DS_TRO.some((x) => x.id === d.o)) d.coc = 0;
  d.nha = null;
  d.xm = DS_XM[0].id;
  d.ot = null;
  delete d.o;
  delete d.xe;
  if (hoan) {
    S.money += hoan;
    S.dsHoan = hoan;
  }
  /* nhà xe giá cũ đã hoàn tiền: truyện không nhắc nhà mới, ô tô nữa */
  const co = TT().co;
  ["ds_co_nha", "ds_nha_hem", "ds_o_to"].forEach((k) => delete co[k]);
}
const dsMuc = (dong) => DS_DONG[dong].find((x) => x.id === dsS()[dong]) || null;
const dsTro = () => dsMuc("tro") || DS_TRO[0];
const dsNha = () => dsMuc("nha");
const dsO = () => dsNha() || dsTro(); /* chỗ đang ở */
const dsXm = () => dsMuc("xm") || DS_XM[0];
const dsOt = () => dsMuc("ot");
const dsDt = () => dsMuc("dt") || DS_DT[0];
/* ưu đãi của xe và điện thoại đang dùng */
const dsUu = (k) => (S ? [dsXm(), dsOt(), dsDt()].reduce((a, x) => a + ((x && x[k]) || 0), 0) : 0);
const dsGiaNhap = () => 1 - dsUu("gn");
const dsHangCn = () => 1 - dsUu("cn");
const dsChoOnl = () => 1 + dsUu("onl");
const dsKhach = () => 1 + dsUu("khach");
/* tốn mỗi ngày mở tiệm (chưa kể tiền góp): ăn uống, chỗ ở, xe máy, ô tô */
const dsTienNgay = () =>
  !S || thuGian() ? 0 : DS.anUong + (dsO().ngay || 0) + (dsXm().ngay || 0) + ((dsOt() && dsOt().ngay) || 0);
const dsTienGop = () => Object.values(dsS().vay).reduce((a, v) => a + v.gop, 0);

/* bản 5.3: bản lưu cũ ghi nhà xe, quà, đồ đời sống trong r.equip (trang bị của tiệm). Chuyển sang r.caNhan, cộng lại
   vào lợi nhuận tích luỹ (không thì lợi nhuận âm, khoá đơn online). Nhận theo tên: tiền tố của các bản 5.0–5.2 và tên nhà xe */
const DS_TEN_CU = ["Xe số cũ", "Xe tay ga", "Ô tô cũ", "Ô tô mới", "Điện thoại thông minh", "Điện thoại chụp ảnh đẹp"];
function tachSoCu() {
  const ten = new Set([...DS_TRO, ...DS_NHA, ...DS_XM, ...DS_OT, ...DS_DT].map((x) => x.ten).concat(DS_TEN_CU)),
    laDoiSong = (e) => /^(Mua |Quà|Bán lại |Trả trước |Trả hết nợ góp)/.test(e.n) || ten.has(e.n);
  let them = 0;
  [...(S.history || []), S.cur].forEach((r) => {
    if (!r || !r.equip) return;
    const ds = r.equip.filter(laDoiSong);
    if (!ds.length) return;
    r.equip = r.equip.filter((e) => !laDoiSong(e));
    r.caNhan = (r.caNhan || []).concat(ds);
    if (r !== S.cur) them += ds.reduce((a, e) => a + e.v, 0);
  });
  S.totalProfit = (S.totalProfit || 0) + them;
}

/* ---------- trả góp ---------- */
/* tiền góp mỗi ngày để trả hết khoản vay trong n ngày, lãi mỗi năm (360 ngày) */
function gopNgay(vay, laiNam, n) {
  const r = laiNam / 360;
  return Math.ceil((vay * r) / (1 - (1 + r) ** -n) / 1000) * 1000;
}
/* chi tiêu của chủ tiệm trong một ngày: sinh hoạt, trả góp, gửi về quê, mua sắm đời sống (bán lại đồ cũ thì trừ ra).
   Không nằm trong chi phí của tiệm (recCost): thẻ cuối ngày và tổng kết hiện riêng dưới lãi của tiệm */
const recCaNhan = (r) => (r.song || 0) + (r.gop || 0) + (r.gui || 0) + (r.caNhan || []).reduce((a, e) => a + e.v, 0);
const ghiCaNhan = (n, v) => (S.cur.caNhan = S.cur.caNhan || []).push({ n, v });
/* thu nhập mỗi ngày ngân hàng xét: trung bình 7 ngày mở cửa gần nhất (bỏ ngày nghỉ Tết), lãi của tiệm trừ tiền ăn ở,
   không trừ tiền mua trang bị (bản lưu cũ còn ghi đồ đời sống trong đó) */
function thuNhapNgay() {
  const H = (S.history || []).filter((r) => !r.nghi).slice(-7);
  if (H.length < 3) return 0;
  return H.reduce((a, r) => a + recRev(r) - recCost(r) - (r.song || 0) + r.equip.reduce((s, e) => s + Math.max(0, e.v), 0), 0) / H.length;
}

/* ---------- mua bán ---------- */
/* tiền thu về khi bỏ món đang có của một dòng: cọc thuê nhà, bán lại nhà hay xe (đã trừ nợ góp còn lại) */
function dsThuVe(dong) {
  const d = dsS();
  if (dong === "nha") {
    const nha = dsNha();
    return nha ? Math.round(nha.gia * DS.banLaiNha) - ((d.vay.nha && d.vay.nha.con) || 0) : d.coc || 0;
  }
  if (dong === "ot") {
    const ot = dsOt();
    return ot ? Math.round((ot.gia * DS.banLaiXe) / 1000) * 1000 - ((d.vay.ot && d.vay.ot.con) || 0) : 0;
  }
  if (dong === "xm") return dsXm().gia ? Math.round((dsXm().gia * DS.banLaiXe) / 1000) * 1000 : 0;
  if (dong === "dt") return dsDt().gia ? Math.round((dsDt().gia * DS.banLaiDt) / 1000) * 1000 : 0;
  if (dong === "tro") return d.coc || 0;
  return 0;
}
/* tính trước một lần mua: tiền phải trả ngay, tiền vay, tiền góp mỗi ngày */
function dsTinh(dong, x, gop) {
  const thuVe = dsThuVe(dong),
    v = gop && DS.vay[dong] && { ...DS.vay[dong], ...(x.vay || {}) };
  if (!v) return { can: (x.gia || 0) + (x.coc || 0) - thuVe, thuVe, vay: 0, gop: 0 };
  /* vay tối đa phần giá trừ tiền trả trước, và không quá phần còn thiếu sau khi bán đồ cũ (không vay dư để cầm tiền về) */
  const vay = Math.max(0, Math.min(Math.round((x.gia * (1 - v.truoc)) / 1000) * 1000, x.gia - thuVe));
  return { can: x.gia - vay - thuVe, thuVe, vay, gop: gopNgay(vay, v.lai, v.ngay), ngay: v.ngay, lai: v.lai };
}
/* tiền góp mỗi ngày của các khoản vay khác (khoản cùng dòng sẽ được trả bằng tiền bán lại khi đổi món) */
const dsGopKhac = (dong) => Object.entries(dsS().vay).filter(([k]) => k !== dong).reduce((a, [, v]) => a + v.gop, 0);
/* có mua được không; trả chuỗi lý do nếu không */
function dsKhongDuoc(dong, x, gop) {
  const d = dsS(),
    ds = DS_DONG[dong],
    t = dsTinh(dong, x, gop);
  if (dong === "tro" && dsNha()) return "Đã có nhà";
  if (dong === "nha" || dong === "ot") {
    const cu = dong === "nha" ? dsNha() : dsOt();
    if (cu && x.gia <= cu.gia) return cu.id === x.id ? "Đang có" : "Rẻ hơn món đang có";
  } else if (ds.indexOf(x) <= ds.indexOf(dsMuc(dong) || ds[0])) return "Đã qua";
  if (S.money < t.can) return "Chưa đủ tiền";
  if (gop) {
    const tn = thuNhapNgay(),
      khac = dsGopKhac(dong);
    if (tn <= 0) return "Ngân hàng cần xem thu nhập ít nhất 3 ngày bán hàng mới cho vay";
    if (khac + t.gop > tn * DS.gopToiDa)
      return `Ngân hàng chỉ cho góp tới nửa thu nhập: còn góp thêm được khoảng ${fmt(Math.max(0, tn * DS.gopToiDa - khac))}/ngày, món này cần ${fmt(t.gop)}/ngày`;
  }
  return "";
}
function dsCo() {
  const co = TT().co;
  if (dsNha() || DS_TRO.indexOf(dsTro()) >= 2) co.ds_nha_rong = true;
  if (dsNha()) co.ds_co_nha = true;
  if (dsNha() && dsNha().id === "nha_hem") co.ds_nha_hem = true;
  if (dsOt()) co.ds_o_to = true;
}
function dsXong(x, cau, them) {
  dsCo();
  save();
  head();
  sfx("coin");
  if (typeof track === "function") track("doi-song-" + x.id);
  xetHuyHieu();
  ask(
    `<div class="dshinhto">${dsHinh(dsDong(x), x)}</div><h2>${esc(x.ten)}</h2>${cau ? locDong([cau]).map(dongThoai).join("") : ""}${them ? `<p class="note">${them}</p>` : ""}${x.uuDai ? `<p class="note">${esc(x.uuDai)}</p>` : ""}`,
    [["Tiếp tục", () => refreshPrep(1), 1]],
  );
}
/* mua (gop = trả góp); trả true nếu đã mua */
function muaDs(dong, id, gop) {
  const d = dsS();
  /* mua đúng món mục tiêu thì mục tiêu xong */
  const xongMuc = () => {
    if (d.muc && d.muc.dong === dong && d.muc.id === id) d.muc = null;
  };
  if (dong === "do" || dong === "qua") {
    const x = (dong === "do" ? DS_DO : DS_QUA).find((y) => y.id === id);
    if (!x || d[dong][id] || S.money < x.gia) return false;
    S.money -= x.gia;
    d[dong][id] = S.day;
    TT().co["ds_" + id] = true;
    xongMuc();
    ghiCaNhan((dong === "do" ? "Mua " : "Quà cho ba mẹ: ") + x.ten, x.gia);
    dsXong(x, dong === "qua" ? ["tin", x.tin] : x.phan);
    return true;
  }
  const x = DS_DONG[dong].find((y) => y.id === id);
  if (!x || dsKhongDuoc(dong, x, gop)) return false;
  const t = dsTinh(dong, x, gop),
    cu = dsMuc(dong) || (dong === "nha" ? null : DS_DONG[dong][0]);
  const cocCu = d.coc || 0,
    thueCu = dong === "tro" || (dong === "nha" && !dsNha()) ? dsTro() : null;
  S.money -= t.can;
  /* ghi vào chi tiêu cá nhân theo dòng tiền: tiền trả ngay, tiền bán lại đồ cũ (đã trừ nợ) thì trừ ra; tiền cọc đặt, lấy lại */
  if (x.gia) ghiCaNhan((t.vay ? "Trả trước " : "Mua ") + x.ten, x.gia - t.vay);
  if (dong !== "tro" && cu && cu.gia && t.thuVe) ghiCaNhan("Bán lại " + cu.ten + (d.vay[dong] ? " (đã trừ nợ góp)" : ""), -t.thuVe);
  if (thueCu && cocCu) ghiCaNhan("Lấy lại cọc " + thueCu.ten.toLowerCase(), -cocCu);
  if (dong === "tro" && x.coc) ghiCaNhan("Đặt cọc " + x.ten.toLowerCase(), x.coc);
  if (dong === "nha") d.coc = 0; /* dọn khỏi chỗ thuê, lấy lại cọc (đã tính trong tiền thu về) */
  if (dong === "tro") d.coc = x.coc || 0;
  d[dong] = id;
  if (d.vay[dong]) delete d.vay[dong]; /* nợ món cũ đã trả bằng tiền bán lại */
  if (t.vay) d.vay[dong] = { id, con: t.vay, gop: t.gop, lai: t.lai, ngay: t.ngay };
  xongMuc();
  dsXong(x, x.phan, t.vay ? `Vay ${fmtBig(t.vay)}, góp ${fmt(t.gop)}/ngày trong ${DS.vay[dong].ten}.` : "");
  return true;
}
/* bán nhà, ô tô, xe máy, điện thoại đang có (lúc cần tiền); nhà bán thì về ở ghép phòng trọ */
const dsBanDuoc = (dong) => {
  const cu = ["nha", "ot", "xm", "dt"].includes(dong) && dsMuc(dong);
  return !!(cu && cu.gia);
};
function banDs(dong) {
  const d = dsS(),
    cu = dsMuc(dong),
    v = dsThuVe(dong);
  if (!dsBanDuoc(dong) || S.money + v < 0) return false;
  S.money += v;
  ghiCaNhan("Bán " + cu.ten + (d.vay[dong] ? " (đã trừ nợ góp)" : ""), -v);
  delete d.vay[dong];
  if (dong === "nha") {
    d.nha = null;
    d.tro = DS_TRO[0].id;
    d.coc = 0;
  } else if (dong === "ot") d.ot = null;
  else d[dong] = DS_DONG[dong][0].id;
  save();
  head();
  toast(`Đã bán ${cu.ten}${v ? (v > 0 ? ", nhận " + fmtBig(v) : ", bù " + fmtBig(-v)) : ""}`, 3500);
  refreshPrep(1);
  return true;
}
/* trả hết nợ góp của một món */
function traHetVay(dong) {
  const v = dsS().vay[dong];
  if (!v || S.money < v.con) return false;
  S.money -= v.con;
  ghiCaNhan("Trả hết nợ góp " + ((DS_DONG[dong].find((x) => x.id === v.id) || {}).ten || ""), v.con);
  delete dsS().vay[dong];
  save();
  head();
  toast("Đã trả hết nợ góp");
  refreshPrep();
  return true;
}

/* lúc đóng cửa (endDay): tiền sinh hoạt và tiền góp vào sổ của ngày */
function doiSongCuoiNgay(r) {
  if (R.challenge) return;
  const v = dsTienNgay();
  if (v) {
    r.song = (r.song || 0) + v;
    S.money -= v;
  }
  const d = dsS();
  Object.entries(d.vay).forEach(([dong, vay]) => {
    const lai = Math.round((vay.con * vay.lai) / 360),
      tra = Math.min(vay.gop, vay.con + lai);
    vay.con = Math.max(0, vay.con + lai - tra);
    vay.ngay--;
    r.gop = (r.gop || 0) + tra;
    S.money -= tra;
    if (vay.con < 1000 || vay.ngay <= 0) {
      delete d.vay[dong];
      r.gopXong = ((DS_DONG[dong].find((x) => x.id === vay.id) || {}).ten || "") + (r.gopXong ? ", " + r.gopXong : "");
    }
  });
  /* gửi về quê gọi riêng ở cuối endDay, sau khi đã trừ tiền nhà, lương, nợ */
}

/* ---------- gửi tiền về quê mỗi tháng: mở từ cảnh gui_1 (data/cot-truyen.js), chỉnh ở khối Quà cho ba mẹ ----------
   S.ds.gui = tiền mỗi lần gửi (0 = không gửi), guiToi = ngày mà lúc đóng cửa sẽ gửi, guiThang = số lần đã gửi,
   guiTong = tổng đã gửi, guiBo = số tháng két không dư nên thôi, guiTraLai = tiền mẹ gửi lại (cảnh gui_so). */
const dsGuiMo = () => !!(S && S.tr && S.tr.co && S.tr.co.gui_ve);
/* đặt mức gửi: lần đầu (hay bật lại sau khi quá hẹn) thì gửi lúc đóng cửa hôm nay; tạm dừng rồi bật lại trong tháng thì giữ hẹn cũ */
function dsGuiDat(v) {
  const d = dsS();
  d.gui = v;
  if (v && !(d.guiToi >= S.day)) d.guiToi = S.day;
  save();
}
const nhacGui = () => setTimeout(() => toast("💌 Chỉnh tiền gửi về quê ở tab Đời sống, khối Quà cho ba mẹ", 4000), 900);
/* các lựa chọn của cảnh gui_1 (ketQua.goi) */
function guiVeHai() {
  dsGuiDat(DS.gui.muc[2]);
  nhacGui();
}
function guiVeNam() {
  dsGuiDat(DS.gui.muc[4]);
  nhacGui();
}
function guiVeMo() {
  nhacGui();
}
/* tin mẹ nhắn khi nhận lần thứ n; hết danh sách thì xoay vòng ba câu cuối */
const dsGuiTin = (n) => {
  const L = DS_GUI_TIN.length,
    i = n - 1;
  /* lần đầu gửi mà ba đã khoẻ (cảnh gui_2 tới trước) thì mẹ nói khác */
  if (i === 0 && S && S.tr && S.tr.co && S.tr.co.ba_khoe) return DS_GUI_TIN_KHOE;
  return DS_GUI_TIN[i < L ? i : L - 3 + ((i - L) % 3)];
};
/* lúc đóng cửa: tới hẹn thì gửi; két không còn dư phòng sau khi gửi thì tháng đó thôi, mẹ nhắn không sao */
function guiVeCuoiNgay(r) {
  const d = dsS();
  if (!d.gui || !(S.day >= d.guiToi)) return;
  const hen = d.guiHen || d.guiToi;
  if (S.money - d.gui < DS.gui.duPhong) {
    /* két chưa dư: chờ thêm tối đa 3 ngày rồi mới thôi tháng này */
    if (S.day - hen < 3) {
      d.guiHen = hen;
      d.guiToi = S.day + 1;
      r.guiCho = 1;
      return;
    }
    d.guiHen = null;
    d.guiToi = hen + DS.gui.chuKy;
    d.guiBo = (d.guiBo || 0) + 1;
    r.guiLo = 1;
    return;
  }
  d.guiHen = null;
  d.guiToi = hen + DS.gui.chuKy;
  S.money -= d.gui;
  r.gui = (r.gui || 0) + d.gui;
  d.guiThang = (d.guiThang || 0) + 1;
  d.guiTong = (d.guiTong || 0) + d.gui;
  r.guiN = d.guiThang;
  const co = TT().co;
  co.gui_da = true;
  if (d.guiThang >= 3) co.gui_3thang = true;
}
/* thẻ cuối ngày */
function dsGuiCuoiNgay(r) {
  if (r.gui) return `<p class="lvup">💌 Đã gửi về quê ${fmtBig(r.gui)}. ${esc(dsGuiTin(r.guiN || 1))}</p>`;
  if (r.guiLo) return `<p class="lvup">💌 Két không còn dư để gửi về quê tháng này. ${esc(DS_GUI_KET)}</p>`;
  if (r.guiCho) return `<p class="lvup">💌 Két chưa dư để gửi về quê, mai gửi (két phải còn ${fmtBig(DS.gui.duPhong)} sau khi gửi).</p>`;
  return "";
}
/* cảnh gui_3: thùng xoài ở quê. Chỉ thêm hàng khi tiệm đang bán vị xoài, để không mở vị mới rồi hết giữa ngày */
function guiVeXoai() {
  if (!(S.unlocked.f_xoai && qty("f_xoai") > 0)) return;
  addStock("f_xoai", CFG.bottleN);
  setTimeout(() => toast(`🥭 Thêm ${CFG.bottleN} ly vị xoài từ thùng quê`, 3500, 1), 700);
}
/* cảnh gui_so: mua nhà rồi thì mẹ gửi lại phần đã để dành */
function guiVeTraLai() {
  const d = dsS(),
    v = Math.round(((d.guiTong || 0) * DS.gui.traLai) / 100000) * 100000;
  if (!v || d.guiTraLai) return;
  d.guiTraLai = v;
  S.money += v;
  ghiCaNhan("Mẹ gửi lại tiền để dành", -v);
  head();
  setTimeout(() => toast("💌 Mẹ gửi lại " + fmtBig(v), 4000, 1), 700);
}

/* ---------- tab Đời sống ----------
   Trang gọn khoảng một màn hình: thẻ tóm tắt (chỗ ở, xe, chi phí, nợ góp, mục tiêu) rồi 6 khối thu gọn. Tiêu đề khối
   cho biết đang có gì, món kế tiếp và mua được chưa. Mở khối: nấc nhà xe là hàng gọn (nấc đã qua gom một dòng),
   đồ cho bản thân và quà là lưới 3 cột. Bấm món mở bảng chi tiết từ dưới lên: trả thẳng hay trả góp, đặt mục tiêu. */
const dsDong = (x) => Object.keys(DS_DONG).find((k) => DS_DONG[k].includes(x)) || (DS_DO.includes(x) ? "do" : "qua");
const dsTim = (dong, id) => (DS_DONG[dong] || (dong === "do" ? DS_DO : DS_QUA)).find((x) => x.id === id);
const dsHinh = (dong, x) => (dong === "tro" || dong === "nha" ? hinhNha(x) : dong === "xm" || dong === "ot" ? hinhXe(x) : hinhDo(x));
/* tình trạng một món: co (đang có / đã mua), qua (đã vượt qua, ẩn), gia (tiền mua thẳng), gop (tiền trả trước nếu góp được) */
function dsTinhTrang(dong, x) {
  const d = dsS();
  if (dong === "do" || dong === "qua") return { co: !!d[dong][x.id], gia: x.gia };
  const co = dong === "tro" ? !dsNha() && dsTro() === x : dsMuc(dong) === x || (!dsMuc(dong) && DS_DONG[dong][0] === x && dong !== "nha" && dong !== "ot");
  const ly = dsKhongDuoc(dong, x, false);
  return {
    co,
    qua: !co && ["Đã qua", "Rẻ hơn món đang có", "Đã có nhà"].includes(ly),
    gia: dsTinh(dong, x, false).can,
    gop: DS.vay[dong] && !dsKhongDuoc(dong, x, true) ? dsTinh(dong, x, true).can : null,
    lyGop: DS.vay[dong] ? dsKhongDuoc(dong, x, true) : null,
  };
}
/* tiền để dành được mỗi ngày (thu nhập 7 ngày gần nhất trừ tiền góp và tiền gửi về quê); dùng ước lượng số ngày tới mục tiêu */
const dsTietKiem = () => thuNhapNgay() - dsTienGop() - (dsS().gui || 0) / DS.gui.chuKy;
const dsSoNgay = (thieu) => (dsTietKiem() > 0 && thieu > 0 ? Math.ceil(thieu / dsTietKiem()) : null);
/* chữ tình trạng một món: luôn có chữ, không chỉ màu */
function dsChuTT(dong, x, dai) {
  const t = dsTinhTrang(dong, x);
  if (t.co) return { cls: "co", chu: "✓ " + (dong === "qua" ? "Đã tặng" : dong === "do" ? "Đã mua" : dong === "tro" || dong === "nha" ? "Đang ở" : "Đang dùng") };
  if (t.qua) return { cls: "qua", chu: "Đã qua" };
  if (!x.gia && !x.coc) return { cls: "", chu: "" };
  if (S.money >= t.gia) return { cls: "du", chu: dong === "qua" ? "Tặng được" : x.coc ? "Thuê được" : "Mua được" };
  if (t.gop != null) return { cls: "gop", chu: `Góp được${dai ? " · trả trước " + fmtBig(t.gop) : ""}` };
  const nganHang = /Ngân hàng/.test(t.lyGop || ""),
    truoc = DS.vay[dong] && !nganHang ? dsTinh(dong, x, true).can : Infinity,
    laGop = truoc < t.gia /* thiếu tính theo tiền trả trước khi vay */,
    thieu = Math.max(0, Math.min(t.gia, truoc) - S.money),
    n = dai && dsSoNgay(thieu);
  return { cls: "thieu", laGop, chu: `Thiếu ${dai ? fmtBig(thieu) : dsGon(thieu)}${laGop ? " trả trước" : ""}${n ? " · ~" + n + " ngày" : ""}` };
}
/* số tiền gọn cho chữ tình trạng: 39,7tr, 1,05 tỷ */
const dsGon = (n) => (Math.abs(n) >= 1e9 ? fmtBig(n) : fmtTr(n));
/* ghi chú cho nấc kế tiếp ở tiêu đề khối: tiền trả trước khi vay, hoặc tiền bán lại đồ cũ đã tính vào */
function dsGhiTiep(dong, x) {
  const t = dsChuTT(dong, x);
  if (t.cls === "gop" || (t.cls === "thieu" && t.laGop)) return ` · trả trước ${dsGon(dsTinh(dong, x, true).can)}`;
  const thuVe = dsTinh(dong, x, false).thuVe,
    cu = dsMuc(dong);
  if (cu && cu.gia && thuVe >= 1e6) return ` · bán ${dong === "nha" ? "nhà" : dong === "dt" ? "máy" : "xe"} cũ được ${dsGon(thuVe)}`;
  return "";
}
/* ô vuông cho đồ dùng và quà (lưới 3 cột) */
function dsTheNho(dong, x) {
  const t = dsChuTT(dong, x),
    muc = dsLaMuc(dong, x.id),
    ngay = (dsS()[dong] || {})[x.id];
  return `<button class="dstile${t.cls === "co" ? " co" : ""}${muc ? " muc" : ""}" data-dsxem="${dong}:${x.id}"><span class="dsti">${dsHinh(dong, x)}</span><span class="dstn">${esc(x.ten)}</span><span class="dstg">${fmtBig(x.gia)}</span><span class="dsbadge ${t.cls}">${t.cls === "co" ? "✓ Ngày " + ngay : esc(t.chu)}</span>${muc ? '<span class="dsmucdau">🎯</span>' : ""}</button>`;
}
/* hàng gọn cho nấc nhà, xe, điện thoại */
function dsHang(dong, x) {
  const t = dsChuTT(dong, x),
    spec = x.dt ? `${x.dt}m² · ${x.pn} PN · ${esc(x.khu)}` : dong === "tro" ? (x.coc ? `đặt cọc ${fmt(x.coc)}` : "không cọc") : esc(x.dong || x.loai || x.mo || ""),
    uu = x.gn || x.cn || x.onl || x.khach || ((dong === "tro" || dong === "nha") && x.uuDai) ? '<i class="dsuu">★ ưu đãi</i>' : "";
  return `<button class="dsrow${t.cls === "co" ? " co" : ""}${dsLaMuc(dong, x.id) ? " muc" : ""}" data-dsxem="${dong}:${x.id}"><span class="dsrh">${dsHinh(dong, x)}</span><span class="dsrt"><b>${esc(x.ten)}</b><small>${spec} ${uu}</small></span><span class="dsrg"><b>${x.gia ? fmtBig(x.gia) : x.coc ? fmt(x.ngay) + "/ngày" : "Có sẵn"}</b><small class="st ${t.cls}">${esc(t.chu)}</small></span></button>`;
}
/* khung gửi về quê ở đầu khối Quà cho ba mẹ */
function dsGuiHTML() {
  const d = dsS(),
    g = d.gui || 0,
    toi = Math.max(d.guiToi || 0, S.day),
    tt = g ? (toi === S.day ? "Gửi lúc đóng cửa hôm nay" : `Lần tới: đóng cửa ngày ${toi}`) : d.guiThang ? "Đang tạm dừng" : "Chưa gửi";
  return `<div class="dsgui"><b>💌 Gửi về quê mỗi tháng</b><small>${tt}${d.guiThang ? ` · đã gửi ${d.guiThang} lần, tổng ${fmtBig(d.guiTong)}` : ""}</small><div class="dsseg dsseg6" role="group" aria-label="Tiền gửi về quê mỗi tháng">${DS.gui.muc
    .map((v) => `<button class="${v === g ? "on" : ""}" data-dsgui="${v}" aria-pressed="${v === g}">${v ? v / 1e6 + "tr" : "Không"}</button>`)
    .join("")}</div><small>Cứ ${DS.gui.chuKy} ngày gửi một lần lúc đóng cửa. Két phải còn ${fmtBig(DS.gui.duPhong)} sau khi gửi, không thì tháng đó thôi.</small></div>`;
}
const DS_KHOI = [
  { id: "o", ten: "Chỗ ở", dong: ["tro", "nha"] },
  { id: "xm", ten: "Xe máy", dong: ["xm"] },
  { id: "ot", ten: "Ô tô", dong: ["ot"] },
  { id: "dt", ten: "Điện thoại", dong: ["dt"] },
  { id: "do", ten: "Cho bản thân", bst: "do", nhom: DS_DO_NHOM, ic: { kieu: "tui", mau: "#c96f5a" } },
  { id: "qua", ten: "Quà cho ba mẹ", bst: "qua", nhom: DS_QUA_NHOM, ic: { kieu: "phong_bi", mau: "#e84a5f" } },
];
const dsKhoiCua = (dong) => (DS_KHOI.find((k) => (k.bst ? k.bst === dong : k.dong.includes(dong))) || {}).id;
const dsNac = (k) => k.dong.flatMap((dong) => DS_DONG[dong].map((x) => [dong, x]));
/* món đang có của một khối và nấc kế tiếp (chưa có, chưa qua) */
function dsDangVaTiep(k) {
  const ds = dsNac(k),
    dang = ds.find(([dong, x]) => dsTinhTrang(dong, x).co) || null,
    tiep = ds.find(([dong, x]) => { const t = dsTinhTrang(dong, x); return !t.co && !t.qua; }) || null;
  return { dang, tiep };
}
function dsKhoi(k) {
  const mo = R.dsMo === k.id;
  let hinh, dong1, dong2, than,
    chip = "";
  if (k.bst) {
    const ds = k.bst === "do" ? DS_DO : DS_QUA,
      co = ds.filter((x) => dsS()[k.bst][x.id]).length,
      duoc = ds.filter((x) => !dsS()[k.bst][x.id] && S.money >= x.gia).length;
    hinh = hinhDo(k.ic);
    dong1 = `${k.bst === "qua" ? "Đã tặng" : "Đã mua"} ${co}/${ds.length}${k.bst === "qua" && dsS().gui ? ` · gửi về quê ${fmtBig(dsS().gui)}/tháng` : ""}`;
    dong2 = duoc ? `${duoc} món ${k.bst === "qua" ? "tặng" : "mua"} được` : "Chưa đủ tiền món nào";
    than = mo
      ? (k.bst === "qua" && dsGuiMo() ? dsGuiHTML() : "") +
        k.nhom
          .map(([n, ten]) => `<div class="dsphan"><b>${esc(ten)}</b></div><div class="dsluoi c3">${ds.filter((x) => x.nhom === n).map((x) => dsTheNho(k.bst, x)).join("")}</div>`)
          .join("")
      : "";
  } else {
    const { dang, tiep } = dsDangVaTiep(k),
      qua = dsNac(k).filter(([dong, x]) => dsTinhTrang(dong, x).qua),
      hien = dsNac(k).filter(([dong, x]) => !dsTinhTrang(dong, x).qua);
    hinh = dang ? dsHinh(dang[0], dang[1]) : k.id === "ot" ? hinhXe(DS_OT[0]).replace('class="dshinh"', 'class="dshinh mo"') : "";
    dong1 = dang ? `${k.id === "o" ? "Đang ở" : "Đang dùng"}: ${esc(dang[1].ten)}${dang[1].ngay ? " · " + fmt(dang[1].ngay) + "/ngày" : ""}` : "Chưa có";
    dong2 = tiep ? `Tiếp: ${esc(tiep[1].ten)} · ${tiep[1].gia ? fmtBig(tiep[1].gia) : fmt(tiep[1].ngay) + "/ngày"}${esc(dsGhiTiep(tiep[0], tiep[1]))}` : "Đã lên nấc cao nhất";
    if (tiep) {
      const t = dsChuTT(tiep[0], tiep[1]);
      chip = `<small class="st ${t.cls}">${esc(t.chu)}</small>`;
    }
    than = mo
      ? `${qua.length ? `<button class="dsquabtn" data-dsqua="${k.id}">${R.dsQua && R.dsQua[k.id] ? "Ẩn" : "✓"} ${qua.length} nấc đã qua ${R.dsQua && R.dsQua[k.id] ? "▴" : "▸"}</button>` : ""}${(R.dsQua && R.dsQua[k.id] ? dsNac(k) : hien)
          .map(([dong, x], i, arr) => (k.id === "o" && dong === "nha" && (i === 0 || arr[i - 1][0] !== "nha") ? '<div class="dsphan"><b>Mua nhà</b><small>trả thẳng hoặc trả góp 20 năm</small></div>' : k.id === "o" && dong === "tro" && i === 0 ? '<div class="dsphan"><b>Thuê</b></div>' : "") + dsHang(dong, x))
          .join("")}`
      : "";
  }
  return `<section class="dskhoi${mo ? " mo" : ""}" id="dsk-${k.id}"><button class="dskh" data-dskhoi="${k.id}" aria-expanded="${mo}"><span class="dskhh">${hinh}</span><span class="dskht"><span class="dskhtt"><b>${esc(k.ten)}</b>${chip}</span><small>${dong1}</small><small class="dsk2">${dong2}</small></span><span class="dskhc">${mo ? "▴" : "▾"}</span></button>${mo ? `<div class="dskb">${than}</div>` : ""}</section>`;
}
/* bản lưu 5.0 vừa được hoàn tiền nhà xe: báo một lần lúc chuẩn bị ngày */
function dsBaoHoan() {
  dsS();
  if (!S.dsHoan) return false;
  const v = S.dsHoan;
  delete S.dsHoan;
  save();
  head();
  ask(
    `<div class="pbig">🏡</div><h2>Đời sống theo giá ngoài đời</h2><p>Từ bản 5.1, nhà, xe, điện thoại, đồ dùng và quà cho ba mẹ trong tab Đời sống có tên, giá tham khảo như ngoài đời. Nhà và ô tô mua thẳng hoặc trả góp.</p><p>Tiền bạn đã mua nhà, xe, điện thoại và món không còn bán được hoàn lại: <b>${fmtBig(v)}</b>.</p>`,
    [["Xem Đời sống", () => ((R.tab = "doisong"), renderPrep()), 1]],
  );
  return true;
}

/* ---------- mục tiêu để dành: một món, không giữ tiền lại, tiền cần tính lại mỗi lần theo cách trả đã chọn ---------- */
const dsLaMuc = (dong, id) => {
  const m = S && S.ds && S.ds.muc;
  return !!m && m.dong === dong && m.id === id;
};
function dsMucTieu() {
  const m = dsS().muc;
  if (!m || typeof m !== "object") return null;
  const x = dsTim(m.dong, m.id);
  if (!x) return null;
  const t = dsTinhTrang(m.dong, x);
  if (t.co || t.qua) return null;
  const gop = !!(m.gop && DS.vay[m.dong]),
    can = Math.max(1, gop ? dsTinh(m.dong, x, true).can : t.gia),
    nganHang = gop && S.money >= can && /Ngân hàng/.test(dsKhongDuoc(m.dong, x, true));
  return { dong: m.dong, x, can, gop, nganHang, pt: Math.min(nganHang ? 0.99 : 1, Math.max(0, S.money / can)), ngay: dsSoNgay(can - S.money) };
}
const dsMucHTML = (m) =>
  `<button class="dsmuc" data-dsxem="${m.dong}:${m.x.id}"><span class="dsmh">${dsHinh(m.dong, m.x)}</span><span class="dsmt"><b>🎯 ${esc(m.x.ten)}</b><i><b style="width:${Math.round(m.pt * 100)}%"></b></i><small>${
    m.nganHang ? "Đủ trả trước, ngân hàng chưa cho vay: cần thu nhập cao hơn" : m.pt >= 1 ? "Đủ tiền rồi! Bấm để mua" : `${fmtBig(S.money)} / ${fmtBig(m.can)}${m.gop ? " trả trước" : ""}${m.ngay ? ` · ~${m.ngay} ngày nếu giữ nhịp tuần này` : ""}`
  }</small></span></button>`;
/* màn chuẩn bị: thanh mục tiêu dưới bảng hiệu */
function dsMucNhacNho() {
  const m = S && S.ds && dsMucTieu();
  return m ? `<div class="dsmucnho">${dsMucHTML(m)}</div>` : "";
}
/* thẻ cuối ngày: mục tiêu đi được bao nhiêu */
function dsMucCuoiNgay() {
  const m = S && S.ds && dsMucTieu();
  if (!m) return "";
  const pt = Math.round(m.pt * 100),
    cu = S.ds.mucPt == null ? pt : S.ds.mucPt;
  S.ds.mucPt = pt;
  return `<p class="lvup">🎯 Mục tiêu ${esc(m.x.ten)}: ${pt}%${pt !== cu ? ` (${pt > cu ? "+" : ""}${pt - cu}%)` : ""}</p>`;
}
/* đầu ngày (prepChecks): mục tiêu vừa đủ tiền thì báo một lần; trả true nếu đang hỏi */
function dsMucDu() {
  const m = S && S.ds && dsMucTieu();
  if (!m || m.pt < 1 || S.ds.mucBao === m.x.id) return false;
  S.ds.mucBao = m.x.id;
  save();
  ask(`<div class="dshinhto">${dsHinh(m.dong, m.x)}</div><h2>Đủ tiền mua ${esc(m.x.ten)} rồi!</h2><p class="note">Mục tiêu để dành của bạn. Mua hay chưa là tuỳ bạn.</p>`, [
    ["Để sau", () => {}],
    ["Xem", () => setTimeout(() => (dsChonCach(m.dong, m.x.id), xemDs(m.dong, m.x.id)), 50), 1],
  ]);
  return true;
}

function paneDoiSong() {
  const d = dsS(),
    o = dsO(),
    xm = dsXm(),
    ot = dsOt(),
    tn = dsTienNgay(),
    tg = dsTienGop(),
    m = dsMucTieu();
  if (R.dsMo === undefined) R.dsMo = m ? dsKhoiCua(m.dong) : null;
  const vay = Object.entries(d.vay)
    .map(([dong, v]) => {
      const x = DS_DONG[dong].find((y) => y.id === v.id) || {};
      return `<div class="dsvay"><span>Góp ${esc(x.ten || "")}: còn ${fmtBig(v.con)} · ${fmt(v.gop)}/ngày</span><button class="sbtn ghost" data-dstra="${dong}" ${S.money < v.con ? "disabled" : ""}>Trả hết</button></div>`;
    })
    .join("");
  return `<div class="mtcard on dscard"><div class="dstom"><span class="dstomh">${hinhNha(o)}</span><span class="dstomh">${hinhXe(ot || xm)}</span><div><b>${esc(o.ten)}</b><small>${esc(ot ? ot.ten : xm.ten)} · ${esc(dsDt().ten)}</small><small>${
    tn ? `Mỗi ngày ${fmt(tn)} ăn, ở, đi lại` : "Thư giãn: không tốn sinh hoạt"
  }${tg ? ` · góp ${fmt(tg)}` : ""}${d.gui ? ` · gửi quê ${fmtBig(d.gui)}/tháng` : ""}</small></div></div>${vay}${m ? dsMucHTML(m) : ""}</div>${DS_KHOI.map(dsKhoi).join("")}${
    m ? "" : `<p class="note dsgoiy">Bấm một món, chọn 🎯 để đặt làm mục tiêu để dành tiền.</p>`
  }`;
}
function paneDoiSongVe() {
  $("pane").innerHTML = paneDoiSong();
}

/* cách trả khi mở bảng chi tiết: món mục tiêu theo cách đã chọn lúc đặt; món khác mà chỉ góp được thì mở sẵn Trả góp */
function dsChonCach(dong, id) {
  const m = dsS().muc,
    x = dsTim(dong, id);
  if (m && m.dong === dong && m.id === id) R.dsCach = m.gop ? "gop" : "thang";
  else if (DS.vay[dong] && x && dsKhongDuoc(dong, x, false) && !dsKhongDuoc(dong, x, true)) R.dsCach = "gop";
}
/* ---------- bảng chi tiết từ dưới lên: một bảng mỗi lần; nút Đóng, chạm nền hay vuốt lui trên điện thoại đều đóng ---------- */
let dsBangMo = false;
function dongBangDs(luiLichSu) {
  if (!dsBangMo) return;
  dsBangMo = false;
  $("modal").classList.remove("sheet");
  $("modal").hidden = true;
  if (luiLichSu && history.state && history.state.dsBang) history.back();
}
window.addEventListener("popstate", () => dongBangDs(false));
function xemDs(dong, id) {
  const x = dsTim(dong, id),
    d = dsS();
  if (!x) return;
  const t = dsTinhTrang(dong, x),
    coVay = !!DS.vay[dong],
    cach = coVay && R.dsCach === "gop" ? "gop" : "thang",
    gop = cach === "gop",
    tc = dsTinh(dong, x, gop),
    v = coVay && { ...DS.vay[dong], ...(x.vay || {}) },
    ly = t.co || t.qua ? "" : dong === "do" || dong === "qua" ? (S.money < x.gia ? "Chưa đủ tiền" : "") : dsKhongDuoc(dong, x, gop),
    cu = dong === "tro" || dong === "nha" ? dsO() : dong === "xm" ? dsXm() : dong === "ot" ? dsOt() : dong === "dt" ? dsDt() : null,
    phiCu = cu ? cu.ngay || 0 : 0,
    phiMoi = x.ngay || 0,
    vayCu = d.vay[dong];
  const spec = [x.dt ? `${x.dt}m² · ${x.pn} phòng ngủ · ${esc(x.khu)}` : "", x.dong || x.loai ? esc(x.dong || x.loai) : ""].filter(Boolean).join(" · ");
  let giua = "";
  if (!t.co && !t.qua && (x.gia || x.coc)) {
    if (coVay)
      giua += `<div class="dsseg" role="group" aria-label="Cách trả"><button class="${gop ? "" : "on"}" data-dscach="thang">Trả thẳng</button><button class="${gop ? "on" : ""}" data-dscach="gop">Trả góp ${esc(v.ten)}</button></div>`;
    if (tc.thuVe || gop || x.coc) giua += `<div class="ledger"><div><span>${x.coc ? "Cọc" : "Giá"}</span><span>${fmtBig(x.gia || x.coc)}</span></div>${
      tc.thuVe ? `<div><span class="wl">${dong === "tro" || (dong === "nha" && !dsNha()) ? "Lấy lại cọc chỗ thuê" : "Bán lại " + esc((dsMuc(dong) || {}).ten || "") + (vayCu ? " (đã trừ nợ góp)" : "")}</span><span class="pos">−${fmtBig(tc.thuVe)}</span></div>` : ""
    }${gop ? `<div><span class="wl">Vay ngân hàng, lãi ${String(Math.round(v.lai * 1000) / 10).replace(".", ",")}%/năm</span><span class="wl">−${fmtBig(tc.vay)}</span></div>` : ""}<div class="tot"><span>Trả ngay</span><span>${fmtBig(Math.max(0, tc.can))}</span></div>${
      gop ? `<div><span>Góp mỗi ngày trong ${esc(v.ten)}</span><span>${fmt(tc.gop)}</span></div>` : ""
    }</div>`;
    giua += `${
      gop
        ? thuNhapNgay() > 0
          ? `<p class="note">Ngân hàng cho góp tối đa ${fmt(thuNhapNgay() * DS.gopToiDa)}/ngày (nửa thu nhập 7 ngày mở cửa gần nhất)${dsGopKhac(dong) ? `, đang góp khoản khác ${fmt(dsGopKhac(dong))}` : ""}.</p>`
          : ""
        : ""
    }`;
  }
  const nutChinh =
    t.co || t.qua || !(x.gia || x.coc)
      ? ""
      : `${ly ? `<p class="dsly">${ly === "Chưa đủ tiền" ? `Còn thiếu ${fmtBig(tc.can - S.money)}${dsSoNgay(tc.can - S.money) ? `, khoảng ${dsSoNgay(tc.can - S.money)} ngày nữa nếu giữ nhịp tuần này` : ""}` : esc(ly)}</p>` : ""}<button class="big" data-dsmua ${ly ? "disabled" : ""}>${dong === "qua" ? "Tặng" : x.coc ? "Thuê" : gop ? "Vay và mua" : "Mua"} · trả ${fmtBig(Math.max(0, tc.can))}</button>`;
  $("card").onchange = null;
  $("card").innerHTML = `<div class="dsgrab" aria-hidden="true"></div><div class="dshinhto">${dsHinh(dong, x)}</div><h2>${esc(x.ten)}</h2>${spec ? `<p class="dsthong">${spec}</p>` : ""}${x.mo ? `<p class="note">${esc(x.mo)}</p>` : ""}${
    x.uuDai ? `<p class="dsuuhop">★ ${esc(x.uuDai)}</p>` : ""
  }${cu && !t.co && phiMoi !== phiCu ? `<p class="note">Chi phí mỗi ngày ${fmt(phiCu)} → ${fmt(phiMoi)} (${phiMoi > phiCu ? "+" : "−"}${fmt(Math.abs(phiMoi - phiCu))})</p>` : ""}${giua}${
    t.co ? `<p class="okline">✓ ${dong === "qua" ? "Đã tặng" : "Đang có"}</p>` : ""
  }${t.co && vayCu ? `<div class="dsvay"><span>Còn nợ góp ${fmtBig(vayCu.con)}</span><button class="sbtn ghost" data-dstra="${dong}" ${S.money < vayCu.con ? "disabled" : ""}>Trả hết</button></div>` : ""}${
    t.co && dsBanDuoc(dong)
      ? `<div class="dsvay"><span>${dsThuVe(dong) >= 0 ? `Bán lại được ${fmtBig(dsThuVe(dong))}${vayCu ? " (đã trừ nợ góp)" : ""}` : `Bán thì phải bù ${fmtBig(-dsThuVe(dong))} trả nợ`}</span><button class="sbtn ghost" data-dsban="${dong}" ${S.money + dsThuVe(dong) < 0 ? "disabled" : ""}>Bán</button></div>`
      : ""
  }<div class="askbtns">${nutChinh}${
    !t.co && !t.qua && (x.gia || x.coc) ? `<button class="sbtn ghost" data-dsmucchon>${dsLaMuc(dong, id) ? "Bỏ mục tiêu" : "🎯 Đặt làm mục tiêu để dành"}</button>` : ""
  }<button class="sbtn ghost" data-dsdong>Đóng</button></div>`;
  $("modal").classList.add("sheet");
  $("modal").hidden = false;
  if (!dsBangMo) {
    dsBangMo = true;
    try {
      history.pushState({ dsBang: 1 }, "");
    } catch (e) {}
  }
  const card = $("card");
  card.setAttribute("role", "dialog");
  card.querySelectorAll("[data-dscach]").forEach((b) => (b.onclick = () => ((R.dsCach = b.dataset.dscach), xemDs(dong, id))));
  const mua = card.querySelector("[data-dsmua]");
  if (mua)
    mua.onclick = () => {
      dongBangDs(true);
      setTimeout(() => muaDs(dong, id, gop), 30);
    };
  const mb = card.querySelector("[data-dsmucchon]");
  if (mb)
    mb.onclick = () => {
      const bo = dsLaMuc(dong, id);
      d.muc = bo ? null : { dong, id, gop };
      if (!bo) R.dsMo = dsKhoiCua(dong);
      d.mucBao = null;
      d.mucPt = null;
      save();
      dongBangDs(true);
      toast(bo ? "Đã bỏ mục tiêu" : "🎯 Mục tiêu mới: " + x.ten);
      refreshPrep(1);
    };
  card.querySelector("[data-dsdong]").onclick = () => dongBangDs(true);
}
/* chạm ra ngoài bảng hay bấm Esc thì đóng */
document.addEventListener("click", (e) => {
  if (dsBangMo && e.target === $("modal")) dongBangDs(true);
});
document.addEventListener("keydown", (e) => {
  if (dsBangMo && e.key === "Escape") dongBangDs(true);
});
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-dsxem], [data-dstra], [data-dsban], [data-dskhoi], [data-dsqua], [data-dsgui]");
  if (!b || b.disabled || typeof S === "undefined" || !S) return;
  e.stopPropagation();
  if (b.dataset.dstra) {
    const dong = b.dataset.dstra,
      v = dsS().vay[dong];
    dongBangDs(true);
    if (!v) return;
    return setTimeout(
      () =>
        ask(`<h2>Trả hết nợ góp?</h2><p>Trả ${fmtBig(v.con)} một lần, hết góp ${fmt(v.gop)}/ngày. Két còn ${fmtBig(S.money - v.con)} sau khi trả.</p>`, [
          ["Thôi", () => {}],
          ["Trả hết", () => traHetVay(dong), 1],
        ]),
      30,
    );
  }
  if (b.dataset.dsban) {
    const dong = b.dataset.dsban,
      cu = dsMuc(dong),
      v = dsThuVe(dong);
    dongBangDs(true);
    return setTimeout(
      () =>
        ask(
          `<h2>Bán ${esc(cu.ten)}?</h2><p>${v >= 0 ? `Nhận về ${fmtBig(v)}` : `Phải bù ${fmtBig(-v)} để trả hết nợ`} (bán lại ${dong === "nha" ? "90%" : dong === "dt" ? "50%" : "70%"} giá mua${dsS().vay[dong] ? ", đã trừ nợ góp" : ""}).${dong === "nha" ? " Bán nhà thì về ở ghép phòng trọ." : ""}</p>`,
          [
            ["Thôi", () => {}],
            ["Bán", () => banDs(dong), 1],
          ],
        ),
      30,
    );
  }
  if (b.dataset.dskhoi) {
    R.dsMo = R.dsMo === b.dataset.dskhoi ? null : b.dataset.dskhoi;
    refreshPrep();
    const k = $("dsk-" + b.dataset.dskhoi);
    if (k && R.dsMo) {
      const h = document.querySelector("header");
      window.scrollTo({ top: k.getBoundingClientRect().top + window.scrollY - (h ? h.offsetHeight : 0) - 6 });
    }
    return;
  }
  if (b.dataset.dsgui != null) {
    const cu = dsS().gui || 0,
      v = +b.dataset.dsgui;
    if (v === cu) return;
    dsGuiDat(v);
    toast(v ? `💌 Gửi về quê ${fmtBig(v)} mỗi tháng` : "Mẹ: Ừ, con lo cho tiệm trước đi..", 3000);
    return refreshPrep();
  }
  if (b.dataset.dsqua) {
    R.dsQua = R.dsQua || {};
    R.dsQua[b.dataset.dsqua] = !R.dsQua[b.dataset.dsqua];
    return refreshPrep();
  }
  const [dong, id] = b.dataset.dsxem.split(":");
  if (R.tab !== "doisong") {
    R.tab = "doisong";
    R.dsMo = dsKhoiCua(dong);
    renderPrep();
  }
  dsChonCach(dong, id);
  xemDs(dong, id);
});

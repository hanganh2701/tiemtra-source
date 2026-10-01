/* ---------- CHI NHÁNH (bậc 3) ----------
   Mở sau khi đã ra mặt tiền và nghe Vy kể về mấy mặt bằng sang nhượng. Chọn một trong ba loại (data/chi-nhanh.js).
   Quản lý tự bán: số ly = nhỏ hơn giữa lượng khách và sức quản lý (thêm người phụ thì hơn). Hàng dư sắp hết hạn
   ở tiệm gốc tự chở qua nên đỡ tiền nhập. Chi nhánh tính sổ lúc tiệm gốc đóng cửa (endDay), sáng hôm sau có thẻ
   báo cáo, tối đa một tình huống mỗi ngày. Tắt game thì chi nhánh không tự cộng tiền. Nạp trước game.js. */

const cnLoai = () => (S && S.cn ? CN_LOAI.find((x) => x.id === S.cn.loai) : null);
const cuoiTuanNgay = (d) => d > 1 && (d % 7 === 6 || d % 7 === 0);
/* chi nhánh mở trước bản 5.2.1: giữ giá trang trí, phần trăm doanh thu và kỳ lấy lại cọc 28 ngày như lúc mở;
   ghi số kỳ hợp đồng đã qua để gia hạn không chạy liền sau khi cập nhật */
const CN_CU = { truong: { tt: 3000000 }, vp: { tt: 4000000 }, kiosk: { tt: 2000000, pt: 0.08 } };
/* kiosk bán tối đa capMax ly (có người phụ thì bày thêm được một quầy) */
/* các nấc mở rộng đã làm, gộp lại */
function cnMoRong(c) {
  const ds = CN_MO_RONG.slice(0, (c && c.mr) || 0);
  return {
    cauHs: ds.reduce((a, x) => a * x.cauHs, 1),
    capThem: ds.reduce((a, x) => a + x.capThem, 0),
    chiNgay: ds.reduce((a, x) => a + x.chiNgay, 0),
    sao: ds.reduce((a, x) => a + (x.sao || 0), 0),
    diem: ds.reduce((a, x) => a + (x.diem || 0), 0),
  };
}
const cnCapMax = (c, L) => (L.capMax || Infinity) + (c && c.phu ? CHI_NHANH.capPhuKiosk : 0) + cnMoRong(c).capThem;
/* người phụ bán thêm được bao nhiêu ly (kiosk đã chạm mức tối đa thì chỉ còn phần quầy thêm) */
function cnPhuThem(c, L) {
  const cap = CHI_NHANH.capGoc + CHI_NHANH.capBac * c.ql.kn;
  return L.capMax ? Math.max(0, Math.min(cap + CHI_NHANH.capPhu, L.capMax + CHI_NHANH.capPhuKiosk) - Math.min(cap, L.capMax)) : CHI_NHANH.capPhu;
}
function cnChuan(c) {
  if (!c || c.tt != null) return c;
  const L = CN_LOAI.find((x) => x.id === c.loai) || {},
    cu = c.sang == null && CN_CU[c.loai];
  c.tt = cu ? cu.tt : L.trangTri;
  c.pt = cu ? cu.pt || 0 : L.phanTram || 0;
  if (cu) c.cocKy = 28;
  c.ky = Math.floor((S.day - c.bd) / CHI_NHANH.hopDong);
  return c;
}
const cnCoc = (L) => L.thue * (L.cocNgay || CHI_NHANH.cocNgay);
const cnTien = (L) => cnCoc(L) + (L.sangLai || 0) + L.trangTri;

/* điều kiện mở chi nhánh */
function dkChiNhanh() {
  return [
    { t: `Ra mặt tiền được ${CHI_NHANH.sauMatTien} ngày`, ok: buoc() >= 2 && !!S.hd && S.day - S.hd.bd >= CHI_NHANH.sauMatTien },
    { t: "Đánh giá từ " + String(CHI_NHANH.sao).replace(".", ",") + " sao", ok: rating() >= CHI_NHANH.sao },
    { t: "Nghe Vy kể về mấy chỗ sang nhượng (cuối Chương 2)", ok: !!TT().co.chi_nhanh_mo },
    { t: "Không đang nợ ngân hàng", ok: !inDebt() },
  ];
}

/* giá mỗi ly và tiền hàng mỗi ly ở tiệm gốc, trung bình 3 ngày gần nhất */
function cnGiaLy() {
  let a = 0,
    q = 0,
    hang = 0;
  S.history.slice(-3).forEach((r) => {
    Object.entries(r.sales).forEach(([k, x]) => {
      if (k !== "si" && k !== "cn") a += x.a;
    });
    q += r.served || 0;
    hang += Object.values(r.ing).reduce((s, x) => s + x.v, 0);
  });
  return { gia: q ? a / q : 40000, hang: q ? Math.min(20000, Math.max(5000, hang / q)) : 9000 };
}
/* bếp trung tâm: lấy trà và topping sắp hết hạn hôm nay ở tiệm gốc chở qua chi nhánh (không thì cũng đổ bỏ) */
function cnLayHangDu(ly) {
  const lay = (keys) => {
    let n = 0;
    keys.forEach((k) => {
      (S.stock[k] || []).forEach((b) => {
        if (b.exp <= S.day && n < ly && b.q > 0) {
          const m = Math.min(b.q, ly - n);
          b.q -= m;
          n += m;
        }
      });
      if (S.stock[k]) S.stock[k] = S.stock[k].filter((b) => b.q > 0);
    });
    return n;
  };
  return { tra: lay(BASE_KEYS), top: lay(TOP_KEYS) };
}
/* hệ quả tình huống còn hiệu lực hôm nay: nhân (…Hs) hoặc cộng (…Them) */
function cnHieu(k, macDinh) {
  return ((S.cn && S.cn.hieu) || [])
    .filter((h) => h.den >= S.day && h[k] != null)
    .reduce((a, h) => (/Them$/.test(k) ? a + h[k] : a * h[k]), macDinh);
}

/* lúc tiệm gốc đóng cửa (endDay, trước khi đổ hàng hết hạn): tính sổ chi nhánh vào sổ của ngày */
function chiNhanhCuoiNgay(r) {
  const c = cnChuan(S.cn),
    L = cnLoai();
  if (!c || !L || R.challenge) return;
  const d = S.day,
    e = ev(),
    ct = cuoiTuanNgay(d),
    thi = !!L.thi && d % 30 >= 25 && d % 30 <= 27,
    mr = cnMoRong(c);
  const cau =
    L.cau *
      (ct ? L.cuoiTuan : 1) *
      (thi ? L.thi : 1) *
      (e && e.id === "rain" ? L.mua : e && e.id === "hot" ? L.nong : 1) *
      Math.max(0.7, Math.min(1.1, c.sao / 4.4)) *
      (S.upg.brandKit ? 1.1 : 1) *
      heSoGiaKhach() /* giá cao thì khách chi nhánh cũng vắng như tiệm gốc */ *
      cnHieu("cauHs", 1) *
      mr.cauHs *
      (0.85 + Math.random() * 0.3) +
    cnHieu("cauThem", 0);
  let cap = (CHI_NHANH.capGoc + CHI_NHANH.capBac * c.ql.kn + (c.phu ? CHI_NHANH.capPhu : 0)) * cnHieu("capHs", 1) + cnHieu("capThem", 0) + mr.capThem;
  if (L.capMax) cap = Math.min(cap, cnCapMax(c, L));
  const ly = Math.max(0, Math.round(Math.min(cau, cap))),
    g = cnGiaLy(),
    thu = Math.round((ly * g.gia * L.gia * cnHieu("giaHs", 1)) / 100) * 100,
    du = cnLayHangDu(ly),
    phanDu = ly ? (du.tra + du.top) / (2 * ly) : 0,
    hang = Math.round(ly * g.hang * CHI_NHANH.muaNgoai * (1 - 0.9 * phanDu) * dsHangCn()),
    nha = c.gia + (c.pt ? Math.round(thu * c.pt) : 0) + mr.chiNgay,
    luong = Math.round(c.ql.luong + thu * CHI_NHANH.phanTramQl + (c.phu ? CHI_NHANH.luongPhu : 0)),
    chi = hang + nha + luong;
  const x = (r.sales.cn = r.sales.cn || { q: 0, a: 0 });
  x.q += ly;
  x.a += thu;
  r.cnChi = (r.cnChi || 0) + chi; /* đã gồm tiền tình huống trả buổi sáng */
  S.money += thu - chi;
  S.totalRev += thu;
  const quaTai = cau > cap * 1.15,
    chamTran = !!L.capMax && cap >= cnCapMax(c, L) /* kiosk đã bán tới mức tối đa: thuê người phụ không bán thêm được */,
    sao = 3.5 + 0.2 * c.ql.kn + (c.phu ? 0.1 : 0) + mr.sao - (quaTai ? 0.2 : 0) + cnHieu("saoThem", 0) + (Math.random() - 0.5) * 0.3;
  c.sao = Math.round((c.sao * 0.7 + Math.max(3.3, Math.min(4.9, sao)) * 0.3) * 100) / 100;
  const dong = thi
    ? "Tuần thi, học sinh ở nhà ôn bài nên vắng."
    : ct && L.cuoiTuan < 1
      ? "Cuối tuần vắng khách."
      : quaTai
        ? chamTran
          ? `Kiosk chỉ bán được ${cnCapMax(c, L)} ly một ngày, khách còn đông hơn.`
          : `Khách đông hơn sức ${c.ql.ten}${c.phu ? "" : ". Thuê thêm người phụ thì bán được nhiều hơn"}.`
        : du.tra + du.top >= 5
          ? `Hàng dư ở tiệm gốc chở qua ${du.tra + du.top} phần, đỡ tiền nhập.`
          : e && e.id === "rain" && L.mua < 1
            ? "Trời mưa nên vắng."
            : "Một ngày bình thường.";
  c.hq = { ngay: d, ly, thu, chi: r.cnChi, lai: thu - r.cnChi, sao: c.sao, dong };
  r.cn = { ly, thu, lai: thu - r.cnChi, loai: L.id };
  /* quản lý lên nghề như nhân viên; hết kỳ hợp đồng thì chủ nhà báo tăng giá; còn lại đôi khi có chuyện */
  c.ql.xp++;
  if (c.ql.kn < 5 && c.ql.xp >= c.ql.kn * 9) {
    c.ql.kn++;
    c.ql.xp = 0;
    c.viec = c.viec || { id: "luong" };
  }
  /* hết kỳ hợp đồng (tính theo số kỳ đã qua, ngày tới kỳ là ngày nghỉ cũng không lỡ) thì chủ nhà báo tăng giá */
  const ky = Math.floor((d + 1 - c.bd) / CHI_NHANH.hopDong);
  if (!c.viec && ky > (c.ky || 0)) {
    c.ky = ky;
    c.viec = { id: "nha" };
  }
  /* từ chối tăng lương: một tuần sau quản lý hỏi lại */
  if (!c.viec && c.luongHoi && d >= c.luongHoi) {
    c.luongHoi = null;
    c.viec = { id: "luong" };
  }
  /* chuyện ngẫu nhiên: không lặp lại chuyện đã gặp trong CHI_NHANH.lapLai ngày */
  const gap = c.gap || {},
    ds = ["may", "hang", "che", L.id].filter((id) => !(d - (gap[id] || -99) < CHI_NHANH.lapLai));
  if (!c.viec && d - c.bd >= 2 && ds.length && Math.random() < 0.25) c.viec = { id: rnd(ds) };
  if (c.viec) (c.gap = gap)[c.viec.id] = d;
  c.hieu = (c.hieu || []).filter((h) => h.den > d);
}

/* ---------- mở, người phụ, sang nhượng ---------- */
function moChiNhanh(id) {
  const L = CN_LOAI.find((x) => x.id === id);
  if (!L || S.cn || !dkChiNhanh().every((x) => x.ok) || S.money < cnTien(L)) return false;
  const coc = cnCoc(L);
  S.money -= coc + (L.sangLai || 0) + L.trangTri;
  if (L.sangLai) S.cur.equip.push({ n: "Sang lại mặt bằng " + L.ngan, v: L.sangLai });
  S.cur.equip.push({ n: "Trang trí " + L.ten.toLowerCase(), v: L.trangTri });
  S.cn = { loai: id, bd: S.day, gia: L.thue, coc, sang: L.sangLai || 0, tt: L.trangTri, pt: L.phanTram || 0, ky: 0, ql: { ten: rnd(CN_TEN_QL), kn: 2, xp: 0, luong: CHI_NHANH.luongQl }, phu: false, sao: 4.2, hieu: [] };
  S.cnDaMo = true;
  TT().co.chi_nhanh = id; /* hậu truyện nhắc lại */
  TT().xem.cn_khai_truong = S.day; /* mốc cho cảnh chú Tư chở hàng qua chi nhánh (cn_cho_hang) */
  save();
  head();
  sfx("lvup");
  if (typeof track === "function") track("chi-nhanh-" + id);
  xetHuyHieu();
  ask(
    `<div class="pbig">${L.ic}</div><h2>Khai trương ${esc(L.ten.toLowerCase())}</h2><p>${esc(S.cn.ql.ten)} làm quản lý. Ngày nào bạn mở tiệm gốc thì chi nhánh cũng bán, sáng hôm sau có báo cáo. Trà và topping sắp hết hạn ở tiệm gốc tự chở qua chi nhánh.</p><p class="note">Tắt game thì chi nhánh cũng nghỉ, không tự cộng tiền.</p>`,
    [["Tuyệt", () => renderPrep(), 1]],
  );
  return true;
}
function sangNhuongCN() {
  const c = cnChuan(S.cn),
    L = cnLoai();
  if (!c || !L) return;
  const kyCoc = c.cocKy || CHI_NHANH.hopDong,
    traCoc = S.day - c.bd >= kyCoc,
    /* lấy lại phần tiền sang lại, trang trí đã trả lúc mở và tiền mở rộng (chi nhánh mở từ bản cũ không có tiền sang lại) */
    lai = Math.round((((c.sang || 0) + c.tt + (c.mrTien || 0)) * CHI_NHANH.sangNhuong) / 1000) * 1000;
  ask(
    `<div class="pbig">${L.ic}</div><h2>Sang nhượng chi nhánh?</h2><p>Người sang lại trả ${fmtBig(lai)} cho mặt bằng và đồ nghề. ${traCoc ? `Đã qua một kỳ hợp đồng nên lấy lại cọc ${fmtBig(c.coc)}.` : `Chưa hết kỳ hợp đồng đầu (còn ${kyCoc - (S.day - c.bd)} ngày) nên mất cọc ${fmtBig(c.coc)}.`}</p>`,
    [
      ["Giữ lại", () => {}],
      [
        "Sang nhượng",
        () => {
          const v = lai + (traCoc ? c.coc : 0);
          S.money += v;
          /* tiền sang lại ghi như bán lại đồ (trừ vào chi phí); cọc không ghi sổ, như lúc đặt cọc */
          S.cur.equip.push({ n: "Sang nhượng chi nhánh", v: -lai });
          if (!traCoc && c.coc) S.cur.equip.push({ n: "Mất cọc chi nhánh", v: c.coc }); /* cọc lúc đặt không ghi sổ; mất thì là chi phí */
          S.cn = null;
          delete TT().co.chi_nhanh; /* lời kết và hậu truyện không nhắc chi nhánh đã sang nhượng */
          save();
          head();
          toast("Đã sang nhượng chi nhánh, lấy lại " + fmtBig(v));
          renderPrep();
        },
        1,
      ],
    ],
  );
}

/* ---------- thẻ trong Nâng cấp › Mở rộng ---------- */
function theChiNhanh() {
  if (buoc() < 2) return "";
  const c = S.cn,
    L = cnLoai();
  if (c && L) {
    cnChuan(c);
    const con = CHI_NHANH.hopDong - ((S.day - c.bd) % CHI_NHANH.hopDong),
      hq = c.hq;
    return `<div class="mtcard on cncard"><b>${L.ic} ${esc(L.ten)}</b><p>Quản lý ${esc(c.ql.ten)} · tay nghề ${"★".repeat(c.ql.kn)}${"☆".repeat(5 - c.ql.kn)} · lương ${fmt(c.ql.luong)}/ngày + ${Math.round(CHI_NHANH.phanTramQl * 100)}% doanh thu</p><p>Tiền nhà ${fmt(c.gia)}/ngày${c.pt ? ` + ${Math.round(c.pt * 100)}% doanh thu` : ""}${L.capMax ? ` · bán tối đa ${cnCapMax(c, L)} ly/ngày` : ""} · còn ${con} ngày tới kỳ gia hạn · ${String(c.sao.toFixed(1)).replace(".", ",")}★</p>${
      hq ? `<p>Ngày ${hq.ngay}: ${hq.ly} ly · thu ${fmt(hq.thu)} · lãi <b class="${hq.lai < 0 ? "neg" : "pos"}">${hq.lai < 0 ? "−" : "+"}${fmt(Math.abs(hq.lai))}</b></p>` : `<p class="note">Chưa bán ngày nào. Mở tiệm gốc là chi nhánh bán theo.</p>`
    }<div class="cnnut"><button class="sbtn${c.phu ? " ghost" : " pri"}" data-cnphu>${c.phu ? "Cho người phụ nghỉ" : `Thuê người phụ<small>+${cnPhuThem(c, L)} ly/ngày · ${fmt(CHI_NHANH.luongPhu)}/ngày</small>`}</button><button class="sbtn ghost" data-cnsang>Sang nhượng</button></div>${theMoRong(c, L)}</div>`;
  }
  const dk = dkChiNhanh(),
    du = dk.every((x) => x.ok);
  return `<div class="mtcard cncard"><b>🏪 Chi nhánh</b><p>Mở tiệm thứ hai. Quản lý tự bán, hàng nấu ở tiệm gốc, sáng nào cũng có báo cáo.</p>${dk
    .map((x) => `<div class="mtdk ${x.ok ? "ok" : ""}">${x.ok ? "✓" : "○"} ${esc(x.t)}</div>`)
    .join("")}${
    du
      ? CN_LOAI.map(
          (L) =>
            `<div class="cnloai"><b>${L.ic} ${esc(L.ten)}</b><p>${esc(L.mo)}</p><p class="note">Tiền nhà ${fmt(L.thue)}/ngày${L.phanTram ? ` + ${Math.round(L.phanTram * 100)}% doanh thu` : ""} (khoảng ${fmtBig(L.thue * 30)}/tháng) · cọc ${fmtBig(cnCoc(L))} · ${L.sangLai ? `sang lại quầy, đồ nghề ${fmtBig(L.sangLai)} · ` : ""}${L.sangLai ? "sửa sang" : "làm quầy mới"} ${fmtBig(L.trangTri)}</p><button class="sbtn pri" data-cnmo="${L.id}" ${S.money < cnTien(L) ? "disabled" : ""}><b>${fmtBig(cnTien(L))}</b>Mở</button></div>`,
        ).join("")
      : ""
  }</div>`;
}

/* ---------- buổi sáng (prepChecks): báo cáo hôm qua, rồi tình huống nếu có; trả true nếu đang hỏi ---------- */
function chiNhanhSang() {
  const c = cnChuan(S.cn),
    L = cnLoai();
  if (!c || !L || R.challenge) return false;
  /* mỗi ngày bán chỉ báo một lần: nghỉ về quê mấy ngày thì không báo lại ngày cũ */
  if (c.hq && c.daBao !== c.hq.ngay) {
    c.daBao = c.hq.ngay;
    save();
    const h = c.hq;
    ask(
      `<div class="pbig">${L.ic}</div><h2>Chi nhánh ${esc(L.ngan)} · ngày ${h.ngay}</h2><div class="kpis"><div><b>${h.ly}</b>🧋</div><div><b class="${h.lai < 0 ? "neg" : ""}">${h.lai < 0 ? "−" : "+"}${fmtBig(Math.abs(h.lai))}</b>lãi</div><div><b>${String(h.sao.toFixed(1)).replace(".", ",")}</b>★</div></div><p class="note">Thu ${fmt(h.thu)} · chi ${fmt(h.chi)}. ${esc(h.dong)}</p>`,
      [["Xong", () => {}, 1]],
    );
    return true;
  }
  if (c.viec) {
    const v = CN_VIEC[c.viec.id],
      id = c.viec.id;
    c.viec = null;
    save();
    if (!v) return false;
    const ten = (x) => x.replace("{ql}", c.ql.ten),
      duTien = S.money >= v.gia;
    ask(
      `<div class="pbig">${L.ic}</div><h2>${esc(ten(v.t))}</h2><p>${esc(ten(v.chu))}</p>${duTien ? "" : `<p class="note">Két không đủ ${fmtBig(v.gia)}.</p>`}`,
      [
        [v.b, () => cnChonViec(id, "b")],
        ...(duTien ? [[v.a + (v.gia ? ` (${fmtBig(v.gia)})` : ""), () => cnChonViec(id, "a"), 1]] : []),
      ],
    );
    return true;
  }
  return false;
}
function cnChonViec(id, chon) {
  const c = cnChuan(S.cn),
    d = S.day,
    v = CN_VIEC[id];
  if (!c || !v) return;
  const hieu = (h) => c.hieu.push(h);
  if (chon === "a" && v.gia) {
    S.money -= v.gia;
    S.cur.cnChi = (S.cur.cnChi || 0) + v.gia;
  }
  const A = chon === "a";
  if (id === "may" && !A) hieu({ den: d + 2, capHs: 0.7 });
  if (id === "hang" && !A) hieu({ den: d, cauHs: 0.75 });
  if (id === "che") A ? hieu({ den: d + 2, saoThem: 0.1 }) : (c.sao = Math.max(3.3, c.sao - 0.3));
  if (id === "luong") {
    if (A) {
      c.ql.luong = Math.round((c.ql.luong * 1.1) / 1000) * 1000;
      c.tuChoi = 0;
    } else {
      /* từ chối lần đầu: làm chậm vài ngày, một tuần sau hỏi lại; lần nữa thì làm chậm tới khi được tăng lương */
      c.tuChoi = (c.tuChoi || 0) + 1;
      hieu({ den: c.tuChoi >= 2 ? d + 60 : d + 4, capHs: 0.85, luong: 1 });
      c.luongHoi = d + 7;
      if (c.tuChoi >= 2) toast(c.ql.ten + " buồn, làm chậm hẳn tới khi được tăng lương", 3500);
    }
    if (A) c.hieu = c.hieu.filter((h) => !h.luong);
  }
  if (id === "nha") {
    const L0 = cnLoai(),
      tang = A ? 1.06 : Math.random() < 0.5 ? 1 : 1.12,
      moi = Math.round((c.gia * tang) / 1000) * 1000;
    /* hợp đồng cũ rẻ hơn giá thuê bây giờ nhiều thì gia hạn theo gần giá bây giờ */
    c.gia = tang === 1 ? c.gia : Math.max(moi, Math.round(((L0 ? L0.thue : c.gia) * 0.9) / 1000) * 1000);
    toast(A ? `Gia hạn hợp đồng: tiền nhà ${fmt(c.gia)}/ngày` : tang === 1 ? "Chủ nhà đồng ý giữ giá" : `Chủ nhà không chịu, tiền nhà ${fmt(c.gia)}/ngày`, 3500);
  }
  if (id === "truong" && A) hieu({ den: d + 4, cauHs: 1.2 });
  if (id === "vp" && A) hieu({ den: d, cauThem: 40, capThem: 40 });
  if (id === "kiosk" && A) hieu({ den: d + 1, cauHs: 1.35, giaHs: 0.9, capThem: 20 }); /* khuyến mãi: trung tâm cho bày thêm quầy */
  save();
  head();
}

/* ---------- mở rộng chi nhánh ---------- */
const cnMoRongTiep = (c) => (c ? CN_MO_RONG[c.mr || 0] || null : null);
const cnMoRongDuoc = (c) => !!c && S.day - c.bd >= CN_MO_RONG_SAU;
function theMoRong(c, L) {
  const da = CN_MO_RONG.slice(0, c.mr || 0),
    x = cnMoRongTiep(c);
  const daLam = da.length ? `<p class="note">Đã mở rộng: ${da.map((y) => esc(y.ten.toLowerCase())).join(", ")}.</p>` : "";
  if (!x) return `<div class="cnmr">${daLam}</div>`;
  const duoc = cnMoRongDuoc(c);
  return `<div class="cnmr"><b>Mở rộng · nấc ${(c.mr || 0) + 1}/${CN_MO_RONG.length}: ${esc(x.ten)}</b><p>${esc(x.mo)} Khách đông hơn khoảng ${Math.round((x.cauHs - 1) * 100)}%, bán thêm được ${x.capThem} ly/ngày, tốn thêm ${fmt(x.chiNgay)}/ngày${x.diem ? `, thêm ${x.diem} điểm Phố Trà` : ""}.</p>${daLam}${
    duoc ? "" : `<p class="note">Chi nhánh bán đủ ${CN_MO_RONG_SAU} ngày mới mở rộng được (còn ${CN_MO_RONG_SAU - (S.day - c.bd)} ngày).</p>`
  }<button class="sbtn pri" data-cnmr ${duoc && S.money >= x.gia && !inDebt() ? "" : "disabled"}><b>${fmtBig(x.gia)}</b>Mở rộng</button></div>`;
}
function moRongCN() {
  const c = cnChuan(S.cn),
    L = cnLoai(),
    x = cnMoRongTiep(c);
  if (!c || !L || !x || !cnMoRongDuoc(c) || S.money < x.gia) return false;
  ask(
    `<div class="pbig">${L.ic}</div><h2>${esc(x.ten)}?</h2><p>${esc(x.mo)}</p><p>Trả ${fmtBig(x.gia)}, từ mai chi nhánh tốn thêm ${fmt(x.chiNgay)} mỗi ngày. Sang nhượng thì người mua trả lại ${Math.round(CHI_NHANH.sangNhuong * 100)}% tiền mở rộng.</p>`,
    [
      ["Để sau", () => {}],
      [
        "Mở rộng",
        () => {
          if (S.money < x.gia) return;
          S.money -= x.gia;
          S.cur.equip.push({ n: "Mở rộng chi nhánh: " + x.ten.toLowerCase(), v: x.gia });
          c.mr = (c.mr || 0) + 1;
          c.mrTien = (c.mrTien || 0) + x.gia;
          save();
          head();
          sfx("lvup");
          toast(`${L.ic} ${c.ql.ten}: Để em lo, mai khách tới là thấy liền!`, 4500, 1);
          renderPrep();
        },
        1,
      ],
    ],
  );
  return true;
}

document.addEventListener("click", (e) => {
  const t = e.target.closest && e.target.closest("[data-cnmo], [data-cnphu], [data-cnsang], [data-cnmr]");
  if (!t || t.disabled || typeof S === "undefined" || !S) return;
  e.stopPropagation();
  if (t.dataset.cnmo) moChiNhanh(t.dataset.cnmo);
  else if (t.hasAttribute("data-cnphu") && S.cn) {
    S.cn.phu = !S.cn.phu;
    save();
    toast(S.cn.phu ? "Đã thuê người phụ cho chi nhánh" : "Người phụ ở chi nhánh nghỉ");
    refreshPrep();
  } else if (t.hasAttribute("data-cnsang")) sangNhuongCN();
  else if (t.hasAttribute("data-cnmr")) moRongCN();
});

/* ---------- CHI NHÁNH (bậc 3) ----------
   Mở sau khi đã ra mặt tiền và nghe Vy kể về mấy mặt bằng sang nhượng. Chọn một trong ba loại (data/chi-nhanh.js).
   Quản lý tự bán: số ly = nhỏ hơn giữa lượng khách và sức quản lý (thêm người phụ thì hơn). Hàng dư sắp hết hạn
   ở tiệm gốc tự chở qua nên đỡ tiền nhập. Chi nhánh tính sổ lúc tiệm gốc đóng cửa (endDay), sáng hôm sau có thẻ
   báo cáo, tối đa một tình huống mỗi ngày. Tắt game thì chi nhánh không tự cộng tiền. Nạp trước game.js. */

const cnLoai = () => (S && S.cn ? CN_LOAI.find((x) => x.id === S.cn.loai) : null);
const cuoiTuanNgay = (d) => d > 1 && (d % 7 === 6 || d % 7 === 0);
const cnTien = (L) => L.thue * CHI_NHANH.cocNgay + L.trangTri;

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
  const c = S.cn,
    L = cnLoai();
  if (!c || !L || R.challenge) return;
  const d = S.day,
    e = ev(),
    ct = cuoiTuanNgay(d),
    thi = !!L.thi && d % 30 >= 25 && d % 30 <= 27;
  const cau =
    L.cau *
      (ct ? L.cuoiTuan : 1) *
      (thi ? L.thi : 1) *
      (e && e.id === "rain" ? L.mua : e && e.id === "hot" ? L.nong : 1) *
      Math.max(0.7, Math.min(1.1, c.sao / 4.4)) *
      (S.upg.brandKit ? 1.1 : 1) *
      cnHieu("cauHs", 1) *
      (0.85 + Math.random() * 0.3) +
    cnHieu("cauThem", 0);
  let cap = (CHI_NHANH.capGoc + CHI_NHANH.capBac * c.ql.kn + (c.phu ? CHI_NHANH.capPhu : 0)) * cnHieu("capHs", 1) + cnHieu("capThem", 0);
  if (L.capMax) cap = Math.min(cap, L.capMax);
  const ly = Math.max(0, Math.round(Math.min(cau, cap))),
    g = cnGiaLy(),
    thu = Math.round((ly * g.gia * L.gia * cnHieu("giaHs", 1)) / 100) * 100,
    du = cnLayHangDu(ly),
    phanDu = ly ? (du.tra + du.top) / (2 * ly) : 0,
    hang = Math.round(ly * g.hang * CHI_NHANH.muaNgoai * (1 - 0.9 * phanDu) * dsHangCn()),
    nha = c.gia + (L.phanTram ? Math.round(thu * L.phanTram) : 0),
    luong = Math.round(c.ql.luong + thu * CHI_NHANH.phanTramQl + (c.phu ? CHI_NHANH.luongPhu : 0)),
    chi = hang + nha + luong;
  const x = (r.sales.cn = r.sales.cn || { q: 0, a: 0 });
  x.q += ly;
  x.a += thu;
  r.cnChi = (r.cnChi || 0) + chi; /* đã gồm tiền tình huống trả buổi sáng */
  S.money += thu - chi;
  S.totalRev += thu;
  const quaTai = cau > cap * 1.15,
    sao = 3.5 + 0.2 * c.ql.kn + (c.phu ? 0.1 : 0) - (quaTai ? 0.2 : 0) + cnHieu("saoThem", 0) + (Math.random() - 0.5) * 0.3;
  c.sao = Math.round((c.sao * 0.7 + Math.max(3.3, Math.min(4.9, sao)) * 0.3) * 100) / 100;
  const dong = thi
    ? "Tuần thi, học sinh ở nhà ôn bài nên vắng."
    : ct && L.cuoiTuan < 1
      ? "Cuối tuần vắng khách."
      : quaTai
        ? `Khách đông hơn sức ${c.ql.ten}${c.phu ? "" : ". Thuê thêm người phụ thì bán được nhiều hơn"}.`
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
  const ky = d + 1 - c.bd;
  if (!c.viec && ky > 0 && ky % CHI_NHANH.hopDong === 0) c.viec = { id: "nha" };
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
  const coc = L.thue * CHI_NHANH.cocNgay;
  S.money -= coc + L.trangTri;
  S.cur.equip.push({ n: "Trang trí " + L.ten.toLowerCase(), v: L.trangTri });
  S.cn = { loai: id, bd: S.day, gia: L.thue, coc, ql: { ten: rnd(CN_TEN_QL), kn: 2, xp: 0, luong: CHI_NHANH.luongQl }, phu: false, sao: 4.2, hieu: [] };
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
  const c = S.cn,
    L = cnLoai();
  if (!c || !L) return;
  const traCoc = S.day - c.bd >= CHI_NHANH.hopDong,
    lai = Math.round((L.trangTri * CHI_NHANH.sangNhuong) / 1000) * 1000;
  ask(
    `<div class="pbig">${L.ic}</div><h2>Sang nhượng chi nhánh?</h2><p>Lấy lại ${fmtBig(lai)} tiền trang trí. ${traCoc ? `Đã qua một kỳ hợp đồng nên lấy lại cọc ${fmtBig(c.coc)}.` : `Chưa hết kỳ hợp đồng đầu (còn ${CHI_NHANH.hopDong - (S.day - c.bd)} ngày) nên mất cọc ${fmtBig(c.coc)}.`}</p>`,
    [
      ["Giữ lại", () => {}],
      [
        "Sang nhượng",
        () => {
          const v = lai + (traCoc ? c.coc : 0);
          S.money += v;
          /* tiền trang trí lấy lại ghi như bán lại đồ (trừ vào chi phí); cọc không ghi sổ, như lúc đặt cọc */
          S.cur.equip.push({ n: "Sang nhượng chi nhánh", v: -lai });
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

/* ---------- thẻ trong Nâng cấp › Trang bị ---------- */
function theChiNhanh() {
  if (buoc() < 2) return "";
  const c = S.cn,
    L = cnLoai();
  if (c && L) {
    const con = CHI_NHANH.hopDong - ((S.day - c.bd) % CHI_NHANH.hopDong),
      hq = c.hq;
    return `<div class="mtcard on cncard"><b>${L.ic} ${esc(L.ten)}</b><p>Quản lý ${esc(c.ql.ten)} · tay nghề ${"★".repeat(c.ql.kn)}${"☆".repeat(5 - c.ql.kn)} · lương ${fmt(c.ql.luong)}/ngày + ${Math.round(CHI_NHANH.phanTramQl * 100)}% doanh thu</p><p>Tiền nhà ${fmt(c.gia)}/ngày${L.phanTram ? ` + ${Math.round(L.phanTram * 100)}% doanh thu` : ""} · còn ${con} ngày tới kỳ gia hạn · ${String(c.sao.toFixed(1)).replace(".", ",")}★</p>${
      hq ? `<p>Ngày ${hq.ngay}: ${hq.ly} ly · thu ${fmt(hq.thu)} · lãi <b class="${hq.lai < 0 ? "neg" : "pos"}">${hq.lai < 0 ? "−" : "+"}${fmt(Math.abs(hq.lai))}</b></p>` : `<p class="note">Chưa bán ngày nào. Mở tiệm gốc là chi nhánh bán theo.</p>`
    }<div class="cnnut"><button class="sbtn${c.phu ? " ghost" : " pri"}" data-cnphu>${c.phu ? "Cho người phụ nghỉ" : `Thuê người phụ<small>+${CHI_NHANH.capPhu} ly/ngày · ${fmt(CHI_NHANH.luongPhu)}/ngày</small>`}</button><button class="sbtn ghost" data-cnsang>Sang nhượng</button></div></div>`;
  }
  const dk = dkChiNhanh(),
    du = dk.every((x) => x.ok);
  return `<div class="mtcard cncard"><b>🏪 Chi nhánh</b><p>Mở tiệm thứ hai. Quản lý tự bán, hàng nấu ở tiệm gốc, sáng nào cũng có báo cáo.</p>${dk
    .map((x) => `<div class="mtdk ${x.ok ? "ok" : ""}">${x.ok ? "✓" : "○"} ${esc(x.t)}</div>`)
    .join("")}${
    du
      ? CN_LOAI.map(
          (L) =>
            `<div class="cnloai"><b>${L.ic} ${esc(L.ten)}</b><p>${esc(L.mo)}</p><p class="note">Tiền nhà ${fmt(L.thue)}/ngày${L.phanTram ? ` + ${Math.round(L.phanTram * 100)}% doanh thu` : ""} · cọc ${fmtBig(L.thue * CHI_NHANH.cocNgay)} · trang trí ${fmtBig(L.trangTri)}</p><button class="sbtn pri" data-cnmo="${L.id}" ${S.money < cnTien(L) ? "disabled" : ""}><b>${fmtBig(cnTien(L))}</b>Mở</button></div>`,
        ).join("")
      : ""
  }</div>`;
}

/* ---------- buổi sáng (prepChecks): báo cáo hôm qua, rồi tình huống nếu có; trả true nếu đang hỏi ---------- */
function chiNhanhSang() {
  const c = S.cn,
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
  const c = S.cn,
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
  if (id === "luong") A ? (c.ql.luong = Math.round((c.ql.luong * 1.1) / 1000) * 1000) : hieu({ den: d + 4, capHs: 0.85 });
  if (id === "nha") {
    const tang = A ? 1.1 : Math.random() < 0.5 ? 1 : 1.2;
    c.gia = Math.round((c.gia * tang) / 1000) * 1000;
    if (!A) toast(tang === 1 ? "Chủ nhà đồng ý giữ giá" : "Chủ nhà không chịu, tăng 20%", 3500);
  }
  if (id === "truong" && A) hieu({ den: d + 4, cauHs: 1.2 });
  if (id === "vp" && A) hieu({ den: d, cauThem: 40, capThem: 40 });
  if (id === "kiosk" && A) hieu({ den: d + 1, cauHs: 1.35, giaHs: 0.9 });
  save();
  head();
}

document.addEventListener("click", (e) => {
  const t = e.target.closest && e.target.closest("[data-cnmo], [data-cnphu], [data-cnsang]");
  if (!t || t.disabled || typeof S === "undefined" || !S) return;
  e.stopPropagation();
  if (t.dataset.cnmo) moChiNhanh(t.dataset.cnmo);
  else if (t.hasAttribute("data-cnphu") && S.cn) {
    S.cn.phu = !S.cn.phu;
    save();
    toast(S.cn.phu ? "Đã thuê người phụ cho chi nhánh" : "Người phụ ở chi nhánh nghỉ");
    refreshPrep();
  } else if (t.hasAttribute("data-cnsang")) sangNhuongCN();
});

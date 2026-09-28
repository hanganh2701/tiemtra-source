/* ---------- NGÃ RẼ LỚN, KẾT TRUYỆN, HẬU TRUYỆN ----------
   Dữ liệu (NGA_RE, KET_CUC, HAU_TRUYEN, cảnh các nhánh) ở data/cot-truyen.js; bộ máy chọn cảnh ở src/truyen.js.
   Ở đây: hệ quả của nhánh trong cách chơi, màn kết truyện, sơ đồ ngã rẽ trong Sổ tay. Nạp trước game.js. */

/* nhánh đã chọn ở ngã rẽ id ("A" | "B" | null) và ngày chọn */
const nhanh = (id) => (S && S.tr && S.tr.nhanh && S.tr.nhanh[id]) || null;
const ngayRe = (id) => {
  const r = NGA_RE.find((x) => x.id === id);
  return r && S && S.tr && S.tr.xem ? S.tr.xem[r.canh] : null;
};
const nhanhMay = () => nhanh("may");
const ngayReMay = () => ngayRe("may");
/* đơn sỉ trân châu mỗi sáng ở nhánh bắt tay */
const SI_MAY = { n: 30, gia: 5000 };
/* nhánh giữ hẻm: 14 ngày Mây Tea phá giá */
const PHA_GIA = { ngay: 14, khach: 0.85 };

const dangPhaGia = () => {
  const d = ngayReMay();
  return nhanhMay() === "B" && d != null && S.day > d && S.day <= d + PHA_GIA.ngay;
};
/* số ngày kể từ ngã rẽ (null nếu chưa tới) */
const sauRe = (id) => (ngayRe(id) == null ? null : S.day - ngayRe(id));
/* ngày tiệm mở lại sau khi về quê ăn Tết */
const ngayVeLai = () => (S && S.tr && S.tr.xem && S.tr.xem.que_3 != null ? S.tr.xem.que_3 + 1 : null);
const dangMungMoLai = () => nhanh("tet") === "A" && ngayVeLai() != null && S.day >= ngayVeLai() && S.day < ngayVeLai() + 3;
/* nhân vào lượng khách vãng lai (qua heSoKhachTruyen):
   Mây Tea phá giá 14 ngày, hết phá giá thì phiếu giới thiệu của cả xóm kéo thêm khách;
   video ghi tên tiệm: 3 ngày đầu rất đông rồi đông hơn mãi;
   Tết ở lại mở cửa: 4 ngày khách đi chơi Tết; về quê: 3 ngày đầu mở lại khách quen mừng ghé */
function heSoKhachNhanh() {
  const h = sauRe("hana"),
    t = sauRe("tet");
  return (
    (dangPhaGia() ? PHA_GIA.khach : nhanhMay() === "B" && S.tr.xem.c2_ket != null ? 1.05 : 1) *
    (dangMungMoLai() ? 1.25 : 1) *
    (nhanh("hana") === "A" && h > 0 ? (h <= 3 ? 1.3 : 1.1) : 1) *
    (nhanh("tet") === "B" && t > 0 && t <= 4 ? 1.4 : 1)
  );
}
/* nhân vào xác suất khách quen ghé: bắt tay thì bận đơn sỉ, giữ hẻm thì xóm ghé nhiều hơn; tiệm nổi thì khách quen ngại đông */
const heSoQuenNhanh = () =>
  (nhanhMay() === "A" ? 0.75 : nhanhMay() === "B" ? 1.3 : 1) * (nhanh("hana") === "A" ? 0.85 : nhanh("hana") === "B" ? 1.15 : 1);
/* nhân vào tip: sau khi cả xóm lập Hội ghé tiệm; tiệm là bí mật của khách quen */
const heSoTipNhanh = () => (nhanhMay() === "B" && S.tr.xem.c2_ket != null ? 1.1 : 1) * (nhanh("hana") === "B" ? 1.05 : 1);

/* đầu ngày bán: xe Mây Tea lấy trân châu (gọi trong startDay) */
function truyenDauNgay() {
  if (R.challenge || nhanhMay() !== "A") return;
  const d = ngayReMay();
  if (d == null || S.day <= d) return;
  const n = Math.min(SI_MAY.n, qty("tcden"));
  if (!n) {
    setTimeout(() => toast("🚚 Xe Mây Tea tới mà hết trân châu đen. Sáng nay không giao được", 4000, 1), 900);
    return;
  }
  for (let i = 0; i < n; i++) {
    take("tcden");
    use("tcden");
    R.today.cogs += CFG.cost.tcden;
  }
  const a = n * SI_MAY.gia,
    x = (S.cur.sales.si = S.cur.sales.si || { q: 0, a: 0 });
  x.q += n;
  x.a += a;
  S.money += a;
  R.today.rev += a;
  S.totalRev += a;
  save();
  setTimeout(() => toast(`🚚 Xe Mây Tea lấy ${n} phần trân châu đen: +${fmt(a)}`, 3500), 900);
}
/* dòng cho thẻ Ngày mai */
function ngayMaiNhanh() {
  if (nhanh("linh") === "A" && !TT().co.linh_da_lam) return "🎒 Linh chờ bạn thuê làm phụ quầy (Nâng cấp › Nhân viên)";
  if (nhanhMay() === "A" && ngayReMay() != null)
    return `🚚 Sáng mai xe Mây Tea lấy ${SI_MAY.n} phần trân châu đen (${fmt(SI_MAY.gia)}/phần). Nhớ nấu dư`;
  if (dangMungMoLai()) return `🏮 Khách quen mừng tiệm mở lại sau Tết: còn ${ngayVeLai() + 3 - S.day} ngày đông hơn`;
  if (dangPhaGia()) return `🏷️ Mây Tea còn phá giá ${ngayReMay() + PHA_GIA.ngay - S.day} ngày: khách lạ ít hơn, khách quen ghé nhiều hơn`;
  return "";
}

/* ---------- kết truyện ---------- */
const timKet = (may, video) => KET_CUC.find((k) => k.may === may && k.video === video) || KET_CUC[0];
function ketCucNay() {
  const T = TT();
  return timKet(T.nhanh.may || "B", T.nhanh.hana === "A");
}
/* mỗi nhân vật một dòng hậu truyện: dòng đầu tiên khớp điều kiện */
function hauTruyen() {
  return HAU_TRUYEN.map(([ai, ds]) => {
    const x = ds.find(([dk]) => khopDk(dk));
    return x && !x[0].an ? { ai, chu: x[1] } : null;
  }).filter(Boolean);
}
function ghiKet(k, ngay) {
  const T = TT(),
    K = KL();
  T.ket = { id: k.id, ngay };
  K.ket = K.ket || {};
  if (K.ket[k.id] == null) K.ket[k.id] = ngay;
}
const soKetDaThay = () => Object.keys(KL().ket || {}).length;
function theKetCuc(k) {
  const hau = hauTruyen();
  return `<small class="trch">Kết truyện Hẻm 42</small><div class="kcten">${esc(k.ten)}</div><p class="kcchu">${thayTen(k.chu)}</p><div class="kchau">${hau
    .map((h) => `<div class="trw">${chanDung(h.ai)}<div><b class="trn2">${esc(NHAN_VAT[h.ai].ten)}</b><p class="trl">${thayTen(h.chu)}</p></div></div>`)
    .join("")}</div><p class="note">Đã thấy ${soKetDaThay()}/${KET_CUC.length} kết. Tiệm vẫn mở cửa mỗi ngày.</p>`;
}
/* sau cảnh giao thừa */
function hienKetCuc(xong) {
  const k = ketCucNay();
  ghiKet(k, S.day);
  save();
  if (typeof track === "function") track("ket-" + k.id);
  sfx("lvup");
  $("card").onchange = null;
  $("card").innerHTML = `${theKetCuc(k)}<div class="askbtns"><button class="big" id="kcOk">Tiếp tục</button></div>`;
  $("modal").hidden = false;
  $("kcOk").onclick = () => {
    $("modal").hidden = true;
    if (typeof xetHuyHieu === "function") xetHuyHieu();
    (xong || (() => {}))();
  };
}

/* bản lưu từ trước khi có ngã rẽ: cảnh cũ đã xem thì xếp vào nhánh khớp với chữ đã đọc; đã hết truyện thì ghi kết */
function chuyenBanLuuNhanh(T) {
  /* cảnh lễ cũ gắn năm trong id: đổi sang cảnh lặp mỗi năm, nhớ năm đã xem */
  [["le_noel_2026", "le_noel@2026"], ["le_ong_tao_2027", "le_ong_tao@2027"], ["le_tet_2027", "le_tet@2027"]].forEach(([cu, moi]) => {
    if (T.xem[cu] == null) return;
    T.xem[moi] = T.xem[cu];
    T.xem[moi.split("@")[0]] = T.xem[cu];
    delete T.xem[cu];
  });
  if (T.xem.c2_ket != null && !T.nhanh.may) {
    T.nhanh.may = "B";
    if (T.xem.c2_nga_re == null) T.xem.c2_nga_re = T.xem.c2_ket;
  }
  if (T.xem.linh_3 != null && !T.nhanh.linh && T.co.linh_lam) T.nhanh.linh = "A";
  if (T.xem.hana_3 != null && !T.nhanh.hana && T.co.hana_video) T.nhanh.hana = "A";
  if (T.xem.c3_vang != null && !T.nhanh.tet && T.co.khoa_tet !== "trong") T.nhanh.tet = "B";
  if (T.xem.c3_ket != null && !T.ket && typeof KET_CUC !== "undefined") {
    const k = timKet(T.nhanh.may || "B", T.nhanh.hana === "A");
    T.ket = { id: k.id, ngay: T.xem.c3_ket };
    S.kl = S.kl || {};
    S.kl.ket = S.kl.ket || {};
    if (S.kl.ket[k.id] == null) S.kl.ket[k.id] = T.xem.c3_ket;
  }
}

/* ---------- sơ đồ ngã rẽ trong Sổ tay ---------- */
function paneNgaRe() {
  const T = TT(),
    K = KL(),
    da = K.reDaDi || {};
  const re = NGA_RE.map((r) => {
    const chon = T.nhanh[r.id],
      toi = T.xem[r.canh] != null;
    const o = ["A", "B"]
      .map((v) => {
        const la = chon === v,
          tungDi = da[r.id] && da[r.id][v] != null;
        return `<span class="nro${la ? " on" : ""}">${la || tungDi ? esc(r.nhanh[v]) : "???"}</span>`;
      })
      .join("");
    return `<div class="nrr"><b>${esc(r.ten)}</b><small>${
      toi ? (chon ? "Đã chọn" : "Đang ở ngã rẽ") : "Chương " + r.chuong + (r.ghiChu ? " · " + esc(r.ghiChu) : "")
    }</small><div class="nrlo">${o}</div></div>`;
  }).join("");
  const ket = KET_CUC.map((k) => {
    const thay = (K.ket || {})[k.id] != null,
      nay = T.ket && T.ket.id === k.id;
    return `<span class="nro${nay ? " on" : ""}">${thay ? esc(k.ten) : "???"}</span>`;
  }).join("");
  return `<div class="ttcard nrmap"><b>Ngã rẽ</b>${re}<div class="nrr"><b>Kết truyện</b><small>Đã thấy ${soKetDaThay()}/${KET_CUC.length}</small><div class="nrlo nrket">${ket}</div>${
    T.ket
      ? '<button class="sbtn ghost" data-ket>Xem lại kết truyện</button><button class="sbtn pri" data-lannua>Hẻm 42 lần nữa</button><p class="note">Chơi lại từ đầu để thử đường khác. Giữ huy hiệu, kỷ lục, sơ đồ này và tên tiệm. Cảnh đã đọc hiện gọn, có vài chuyện mới chỉ lượt sau mới thấy.</p>'
      : ""
  }</div></div>`;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-ket]");
  if (!b || typeof S === "undefined" || !S || !TT().ket) return;
  e.stopPropagation();
  const k = KET_CUC.find((x) => x.id === TT().ket.id) || ketCucNay();
  $("card").onchange = null;
  $("card").innerHTML = `${theKetCuc(k)}<div class="askbtns"><button class="big" id="kcOk">Đóng</button></div>`;
  $("modal").hidden = false;
  $("kcOk").onclick = () => ($("modal").hidden = true);
});

/* ---------- về quê ăn Tết: cảnh có nghi thì tiệm nghỉ ngày đó, cảnh nghỉ kế tiếp hiện liền ---------- */
function nghiVeQue() {
  nghiMotNgay("🏡 Về quê ăn Tết, tiệm nghỉ. Khoa trông giùm");
  const k = canhKe("mo_cua");
  if (k && k.nghi) setTimeout(() => truyenLuc("mo_cua", renderPrep), 350);
  else renderPrep();
}
/* Linh nghĩ ra món mới: nhân viên Linh lên một bậc tay nghề */
function linhLenNghe() {
  const n = Object.values(S.nv || {}).find((x) => x.ten === "Linh");
  if (n && n.kn < 5) n.kn++;
}

/* ---------- chọn bằng ly pha ---------- */
/* các ly chấp nhận được của một đơn truyện, theo bậc và hàng đang có; thiếu thì không có đơn */
function lyTruyen(dt) {
  if (level() < (dt.can || 1)) return null;
  const ds = dt.phuongAn.map((p) => ({
    id: p.id,
    phan: p.phan,
    o: { base: p.mon.base, flav: p.mon.flav || null, tops: [...(p.mon.tops || [])], cheese: false, size: "M", so: null, sugar: p.mon.sugar, ice: p.mon.ice, quen: true },
  }));
  const du = ds.every((p) => [p.o.base, p.o.flav, ...p.o.tops].filter(Boolean).every((k) => S.unlocked[k] && qty(k) > 0));
  return du ? ds : null;
}
/* gọi trong spawn(): có đơn truyện tới hẹn thì khách đó ghé */
function donTruyenDen() {
  if (R.challenge || !R.running || R.t < 25 || typeof DON_TRUYEN === "undefined") return null;
  if (R.slots.some((c) => c && c.dt)) return null;
  const T = TT();
  T.dt = T.dt || {};
  const ds = DON_TRUYEN.filter(
    (d) => T.dt[d.id] == null && (R.dtNgay || {})[d.id] !== S.day && khopDk(d.dk) && (!d.dk.ngay || S.day >= d.dk.ngay) && !R.slots.some((c) => c && c.reg === d.ai) && lyTruyen(d),
  );
  if (!ds.length || Math.random() > 0.3) return null;
  return ds[0];
}
function spawnTruyen(i, dt) {
  const ly = lyTruyen(dt),
    nv = NHAN_VAT[dt.ai],
    o = ly[0].o,
    max = 63 * 1.5 * (S.upg.seats ? 1.25 : 1) * heSoCho();
  R.dtNgay = R.dtNgay || {};
  R.dtNgay[dt.id] = S.day;
  if (KHACH_QUEN[dt.ai]) daGheHomNay()[dt.ai] = true;
  R.slots[i] = {
    reg: KHACH_QUEN[dt.ai] ? dt.ai : undefined,
    dt: dt.id,
    born: performance.now(),
    id: ++uid,
    who: nv.mat,
    sf: nv.ngoiSao,
    face: "🙂",
    name: nv.ten,
    say: thayTen(dt.xin, true),
    end: thayTen(dt.het, true),
    cups: [o],
    done: [false],
    order: o,
    pat: max,
    max,
    wrong: 0,
    paid: 0,
  };
  renderStreet();
  sfx("bell");
  /* gợi ý màu tím để không lẫn với cảnh báo */
  toast("💭 " + thayTen(dt.goiY, true), 6000, 1);
  const t = $("toast");
  t.classList.add("goiy");
  setTimeout(() => t.classList.remove("goiy"), 6000);
}
/* gọi trong serve() trước khi so ly: ly trúng phương án nào thì đơn thành phương án đó */
function donTruyenKhop(c) {
  const dt = DON_TRUYEN.find((d) => d.id === c.dt),
    ly = dt && lyTruyen(dt);
  if (!ly) return;
  const p = ly.find((x) => matches(cup, x.o));
  if (!p) return;
  c.cups[0] = p.o;
  c.order = p.o;
  c.dtChon = p.id;
}
/* phục vụ xong đơn truyện: ghi cờ, khách nói một câu */
function donTruyenXong(c) {
  const dt = DON_TRUYEN.find((d) => d.id === c.dt);
  if (!dt || !c.dtChon) return;
  const T = TT(),
    p = dt.phuongAn.find((x) => x.id === c.dtChon);
  T.dt = T.dt || {};
  T.dt[dt.id] = S.day;
  T.co[dt.co] = c.dtChon;
  if (typeof track === "function") track("ly-" + dt.id + "-" + c.dtChon);
  setTimeout(() => toast(`${NHAN_VAT[dt.ai].ten}: ${thayTen(p.phan, true)}`, 4000, 1), 700);
}

/* ---------- Hẻm 42 lần nữa ---------- */
function choiLai() {
  const T = TT(),
    K = KL();
  K.daDoc = K.daDoc || {};
  Object.keys(T.xem).forEach((id) => (K.daDoc[id] = true));
  const giu = {
    shopName: S.shopName,
    xung: S.xung,
    kl: K,
    huyHieu: S.huyHieu,
    banBe: S.banBe,
    ttKq: S.ttKq,
    bb: S.bb,
    thuGian: S.thuGian,
  };
  const tr = { che: T.che, luot: (T.luot || 1) + 1 };
  S = fresh();
  Object.entries(giu).forEach(([k, v]) => v !== undefined && (S[k] = v));
  S.tr = tr;
  save();
  if (typeof track === "function") track("choi-lai-" + tr.luot);
  R.tab = "kho";
  renderPrep();
  toast("🌱 Hẻm 42 lần nữa: lượt thứ " + tr.luot + ". Chìa khoá tiệm lại trong tay bạn", 4500, 1);
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-lannua]");
  if (!b || typeof S === "undefined" || !S || !TT().ket) return;
  e.stopPropagation();
  ask(
    `<div class="pbig">🌱</div><h2>Hẻm 42 lần nữa?</h2><p>Tiệm, tiền, kho, nâng cấp và câu chuyện bắt đầu lại từ ngày 1.</p><p>Giữ lại: tên tiệm, huy hiệu, kỷ lục, sơ đồ ngã rẽ, các kết đã thấy, bạn bè Phố Trà.</p><p class="note">Nên sao lưu tiến trình trước (Cài đặt › Sao lưu tiến trình).</p>`,
    [
      ["Để sau", () => {}],
      ["Chơi lại", choiLai, 1],
    ],
  );
});

/* ---------- sửa sau đợt chơi thử ---------- */
/* khách quen vắng mặt vì nhánh truyện: Linh đi học Đà Lạt */
const vangMat = (k) => k === "linh" && nhanh("linh") === "B";
/* cảnh mở cửa kế tiếp là ngày nghỉ về quê: nút Mở cửa thành nút lên xe, không đòi nấu hàng */
const veQueSap = () => !!(S && S.tr && typeof canhKe === "function" && (canhKe("mo_cua") || {}).nghi);
/* ly đang pha trúng một phương án của đơn truyện này không (dùng khi dán nắp để tìm đúng khách) */
function lyTruyenKhop(c) {
  if (!c || !c.dt || c.done[0] || typeof DON_TRUYEN === "undefined") return false;
  const dt = DON_TRUYEN.find((d) => d.id === c.dt),
    ly = dt && lyTruyen(dt);
  return !!(ly && ly.some((p) => matches(cup, p.o)));
}
/* gợi ý của đơn truyện, hiện luôn trên bong bóng thoại để không lỡ khi toast đã tắt */
function goiYTruyenHTML(c) {
  const dt = typeof DON_TRUYEN !== "undefined" && DON_TRUYEN.find((d) => d.id === c.dt);
  return dt ? `<small class="goiyb">💭 ${esc(thayTen(dt.goiY, true))}</small>` : "";
}

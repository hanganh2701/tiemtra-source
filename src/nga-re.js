/* ---------- NGÃ RẼ LỚN, KẾT TRUYỆN, HẬU TRUYỆN ----------
   Dữ liệu (NGA_RE, KET_CUC, HAU_TRUYEN, cảnh các nhánh) ở data/cot-truyen.js; bộ máy chọn cảnh ở src/truyen.js.
   Ở đây: hệ quả của nhánh trong cách chơi, màn kết truyện, sơ đồ ngã rẽ trong Sổ tay. Nạp trước game.js. */

const nhanhMay = () => (S && S.tr && S.tr.nhanh && S.tr.nhanh.may) || null;
/* ngày chọn ngã rẽ Mây Tea */
const ngayReMay = () => (S && S.tr && S.tr.xem ? S.tr.xem.c2_nga_re : null);
/* đơn sỉ trân châu mỗi sáng ở nhánh bắt tay */
const SI_MAY = { n: 30, gia: 5000 };
/* nhánh giữ hẻm: 14 ngày Mây Tea phá giá */
const PHA_GIA = { ngay: 14, khach: 0.85 };

const dangPhaGia = () => {
  const d = ngayReMay();
  return nhanhMay() === "B" && d != null && S.day > d && S.day <= d + PHA_GIA.ngay;
};
/* nhân vào lượng khách vãng lai (qua heSoKhachTruyen) */
const heSoKhachNhanh = () => (dangPhaGia() ? PHA_GIA.khach : 1);
/* nhân vào xác suất khách quen ghé: bắt tay thì bận đơn sỉ, giữ hẻm thì xóm ghé nhiều hơn */
const heSoQuenNhanh = () => (nhanhMay() === "A" ? 0.75 : nhanhMay() === "B" ? 1.3 : 1);
/* nhân vào tip: sau khi cả xóm lập Hội ghé tiệm */
const heSoTipNhanh = () => (nhanhMay() === "B" && S.tr.xem.c2_ket != null ? 1.1 : 1);

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
  if (nhanhMay() === "A" && ngayReMay() != null)
    return `🚚 Sáng mai xe Mây Tea lấy ${SI_MAY.n} phần trân châu đen (${fmt(SI_MAY.gia)}/phần). Nhớ nấu dư`;
  if (dangPhaGia()) return `🏷️ Mây Tea còn phá giá ${ngayReMay() + PHA_GIA.ngay - S.day} ngày: khách lạ ít hơn, khách quen ghé nhiều hơn`;
  return "";
}

/* ---------- kết truyện ---------- */
const timKet = (may, video) => KET_CUC.find((k) => k.may === may && k.video === video) || KET_CUC[0];
function ketCucNay() {
  const T = TT();
  return timKet(T.nhanh.may || "B", T.xem.hana_3 != null);
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

/* bản lưu cũ: đã xem cảnh Hội ghé tiệm thì coi như đã chọn giữ hẻm; đã hết truyện thì ghi kết */
function chuyenBanLuuNhanh(T) {
  if (T.xem.c2_ket != null && !T.nhanh.may) {
    T.nhanh.may = "B";
    if (T.xem.c2_nga_re == null) T.xem.c2_nga_re = T.xem.c2_ket;
  }
  if (T.xem.c3_ket != null && !T.ket && typeof KET_CUC !== "undefined") {
    const k = timKet(T.nhanh.may || "B", T.xem.hana_3 != null);
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
    return `<div class="nrr"><b>${esc(r.ten)}</b><small>${toi ? (chon ? "Đã chọn" : "Đang ở ngã rẽ") : "Chương " + r.chuong}</small><div class="nrlo">${o}</div></div>`;
  }).join("");
  const ket = KET_CUC.map((k) => {
    const thay = (K.ket || {})[k.id] != null,
      nay = T.ket && T.ket.id === k.id;
    return `<span class="nro${nay ? " on" : ""}">${thay ? esc(k.ten) : "???"}</span>`;
  }).join("");
  return `<div class="ttcard nrmap"><b>Ngã rẽ</b>${re}<div class="nrr"><b>Kết truyện</b><small>Đã thấy ${soKetDaThay()}/${KET_CUC.length}</small><div class="nrlo nrket">${ket}</div>${
    T.ket ? '<button class="sbtn ghost" data-ket>Xem lại kết truyện</button>' : ""
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

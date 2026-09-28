/* ---------- ĐỜI SỐNG CỦA CHỦ TIỆM ----------
   Tab Đời sống: chỗ ở, đi lại, điện thoại, đồ cho bản thân, quà cho gia đình (data/doi-song.js).
   Bắt đầu ở ghép phòng trọ, đi xe đạp. Mỗi ngày mở tiệm tốn ăn uống, tiền trọ hay phí quản lý, xăng xe
   (chế độ Thư giãn thì miễn). Nhà, xe, điện thoại chỉ đổi lên nấc cao hơn; đổi xe, đổi điện thoại thì bán lại
   đồ cũ được một nửa; dọn nhà thì lấy lại cọc. Nạp trước game.js. */

const DS_DONG = { o: DS_O, xe: DS_XE, dt: DS_DT };
const dsS = () => (S.ds = S.ds || { o: DS_O[0].id, xe: DS_XE[0].id, dt: DS_DT[0].id, do: {}, qua: {}, coc: 0 });
const dsHien = (loai) => DS_DONG[loai].find((x) => x.id === dsS()[loai]) || DS_DONG[loai][0];
const dsBac = (loai) => DS_DONG[loai].indexOf(dsHien(loai));
/* ưu đãi của xe và điện thoại đang dùng */
const dsUu = (k) => (S ? (dsHien("xe")[k] || 0) + (dsHien("dt")[k] || 0) : 0);
const dsGiaNhap = () => 1 - dsUu("gn");
const dsHangCn = () => 1 - dsUu("cn");
const dsChoOnl = () => 1 + dsUu("onl");
const dsKhach = () => 1 + dsUu("khach");
/* tốn mỗi ngày mở tiệm: ăn uống, chỗ ở, xăng xe */
const dsTienNgay = () => (!S || thuGian() ? 0 : DS.anUong + (dsHien("o").ngay || 0) + (dsHien("xe").ngay || 0));

/* lúc đóng cửa (endDay): trừ tiền sinh hoạt vào sổ của ngày */
function doiSongCuoiNgay(r) {
  if (R.challenge) return;
  const v = dsTienNgay();
  if (!v) return;
  r.song = (r.song || 0) + v;
  S.money -= v;
}

/* cờ cho truyện và hậu truyện: có chỗ cho ba mẹ ở lại, có nhà trong hẻm, có ô tô */
function dsCo() {
  const co = TT().co;
  if (dsBac("o") >= 2) co.ds_nha_rong = true;
  if (dsHien("o").id === "nha_hem") co.ds_nha_hem = true;
  if (dsBac("o") >= 3) co.ds_co_nha = true;
  if (dsBac("xe") >= 3) co.ds_o_to = true;
}
function dsXong(x, cau) {
  dsCo();
  save();
  head();
  sfx("coin");
  if (typeof track === "function") track("doi-song-" + x.id);
  xetHuyHieu();
  ask(
    `<div class="pbig">${x.ic}</div><h2>${esc(x.ten)}</h2>${cau ? locDong([cau]).map(dongThoai).join("") : ""}${x.uuDai ? `<p class="note">${esc(x.uuDai)}</p>` : ""}`,
    [["Tiếp tục", () => refreshPrep(), 1]],
  );
}
/* tiền phải trả ngay để lên nấc id (đã trừ cọc lấy lại hay tiền bán lại đồ cũ) */
function dsCan(loai, x) {
  const cu = dsHien(loai);
  return (x.gia || 0) + (x.coc || 0) - (loai === "o" ? dsS().coc || 0 : 0) - dsBanLai(loai, cu);
}
const dsBanLai = (loai, cu) => (loai !== "o" && cu.gia ? Math.round((cu.gia * DS.banLai) / 1000) * 1000 : 0);
function muaDs(loai, id) {
  const d = dsS();
  if (loai === "do" || loai === "qua") {
    const x = (loai === "do" ? DS_DO : DS_QUA).find((y) => y.id === id);
    if (!x || d[loai][id] || S.money < x.gia) return false;
    S.money -= x.gia;
    d[loai][id] = S.day;
    TT().co["ds_" + id] = true;
    S.cur.equip.push({ n: (loai === "do" ? "Mua " : "Quà: ") + x.ten.toLowerCase(), v: x.gia });
    dsXong(x, loai === "qua" ? ["tin", x.tin] : x.phan);
    return true;
  }
  const ds = DS_DONG[loai],
    moi = ds.find((y) => y.id === id),
    cu = dsHien(loai);
  if (!moi || ds.indexOf(moi) <= ds.indexOf(cu)) return false;
  const can = dsCan(loai, moi),
    banLai = dsBanLai(loai, cu);
  if (S.money < can) return false;
  S.money -= can;
  /* ghi sổ: tiền mua là chi phí, bán lại đồ cũ trừ vào chi phí; tiền cọc không ghi (như cọc mặt tiền) */
  if (moi.gia) S.cur.equip.push({ n: moi.ten, v: moi.gia });
  if (banLai) S.cur.equip.push({ n: "Bán lại " + cu.ten.toLowerCase(), v: -banLai });
  d[loai] = id;
  if (loai === "o") d.coc = moi.coc || 0;
  dsXong(moi, moi.phan);
  return true;
}

/* ---------- tab Đời sống ---------- */
function paneDoiSong() {
  const d = dsS(),
    o = dsHien("o"),
    xe = dsHien("xe"),
    dt = dsHien("dt"),
    tn = dsTienNgay();
  const dong = (loai) =>
    DS_DONG[loai]
      .map((x, i) => {
        const bac = dsBac(loai),
          phi = [x.coc ? "cọc " + fmtBig(x.coc) : "", x.ngay ? (loai === "xe" ? "xăng " : x.gia ? "phí " : "tiền nhà ") + fmt(x.ngay) + "/ngày" : ""].filter(Boolean).join(" · "),
          nut =
            i === bac
              ? `<span class="okline">✓ ${loai === "o" ? "Đang ở" : "Đang dùng"}</span>`
              : i < bac
                ? `<span class="wl">Đã qua</span>`
                : `<button class="sbtn pri" data-ds="${loai}:${x.id}" ${S.money < dsCan(loai, x) ? "disabled" : ""}><b>${fmtBig(Math.max(0, dsCan(loai, x)))}</b>${x.gia ? "Mua" : "Thuê"}</button>`;
        return `<div class="rowi${i < bac ? " dsqua" : ""}"><span class="icon gopic">${x.ic}</span><div><div class="nm">${esc(x.ten)}</div><div class="sub">${esc(x.uuDai || x.mo || "")}</div>${phi ? `<div class="sub">${phi}</div>` : ""}</div>${nut}</div>`;
      })
      .join("");
  const mot = (ds, loai) =>
    ds
      .map(
        (x) =>
          `<div class="rowi"><span class="icon gopic">${x.ic}</span><div><div class="nm">${esc(x.ten)}</div></div>${
            d[loai][x.id] ? `<span class="okline">✓ Ngày ${d[loai][x.id]}</span>` : `<button class="sbtn pri" data-ds="${loai}:${x.id}" ${S.money < x.gia ? "disabled" : ""}><b>${fmtBig(x.gia)}</b>${loai === "qua" ? "Tặng" : "Mua"}</button>`
          }</div>`,
      )
      .join("");
  return `<div class="mtcard on dscard"><b>${o.ic} ${esc(o.ten)} · ${xe.ic} ${esc(xe.ten)} · ${dt.ic} ${esc(dt.ten)}</b><p>${
    tn
      ? `Mỗi ngày mở tiệm tốn ${fmt(tn)}: ăn uống ${fmt(DS.anUong)}${o.ngay ? `, ${o.gia ? "phí nhà" : "tiền nhà"} ${fmt(o.ngay)}` : ""}${xe.ngay ? `, xăng ${fmt(xe.ngay)}` : ""}.`
      : "Chế độ Thư giãn: không tốn tiền sinh hoạt."
  }</p></div>
  <div class="sec">Chỗ ở</div><div class="note">Dọn nhà thì lấy lại cọc chỗ cũ. Nhà mua rồi chỉ còn phí quản lý.</div>${dong("o")}
  <div class="sec">Đi lại</div><div class="note">Đổi xe thì bán lại xe cũ được một nửa giá.</div>${dong("xe")}
  <div class="sec">Điện thoại</div>${dong("dt")}
  <div class="sec">Cho bản thân</div><div class="note">Không có ưu đãi, chỉ là thích.</div>${mot(DS_DO, "do")}
  <div class="sec">Quà cho gia đình</div><div class="note">Ba mẹ ở quê. Quà gửi về thì mẹ nhắn lại.</div>${mot(DS_QUA, "qua")}`;
}
function paneDoiSongVe() {
  $("pane").innerHTML = paneDoiSong();
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-ds]");
  if (!b || b.disabled || typeof S === "undefined" || !S) return;
  e.stopPropagation();
  const [loai, id] = b.dataset.ds.split(":");
  muaDs(loai, id);
});

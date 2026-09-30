/* ---------- LỄ THEO LỊCH THẬT: Noel, Tết ----------
   leHoiNay() nằm trong src/truyen.js. Nạp trước game.js. */

/* trang trí theo lễ: gắn lớp lên body để CSS vẽ tuyết Noel hay đỏ vàng ngày Tết */
function leHoiTrangTri() {
  const le = leHoiNay();
  document.body.classList.toggle("le-noel", le === "noel");
  document.body.classList.toggle("le-tet", le === "tet");
}
/* lượng khách và tip theo lễ */
const heSoKhachLe = () => (leHoiNay() === "noel" ? 1.2 : S.tetMo === S.day ? 2.5 : 1);
const heSoTipLe = () => (leHoiNay() === "noel" ? 1.5 : 1);
/* ngày Tết mở cửa thì lương gấp 3 */
const heSoLuongLe = () => (S.tetMo === S.day ? 3 : 1);

/* đầu ngày: lì xì của bà Sáu, chọn nghỉ Tết hay mở cửa; trả true nếu đang hỏi */
function leHoiCheck() {
  const le = leHoiNay(),
    hom = homNayVN();
  if (le !== "tet") return false;
  const nam = LICH_LE.tet.find((t) => Math.abs(cachNgayLich(hom, t)) <= 20) || hom.slice(0, 4);
  const d = cachNgayLich(hom, nam),
    T = TT();
  /* truyện đang cho về quê ăn Tết (ngã rẽ tet A): các ngày đó truyện tự cho tiệm nghỉ, không hỏi */
  if (T.nhanh.tet === "A" && T.xem.que_3 == null && T.xem.c3_vang != null) return false;
  S.liXi = S.liXi || {};
  /* lì xì từ giao thừa, và sau khi đã nhận chìa khoá tiệm */
  if (!S.liXi[nam] && d >= -1 && T.xem.c0_chia_khoa != null) {
    S.liXi[nam] = true;
    S.money += 200000;
    ghiCaNhan("Lì xì bà Sáu", -200000);
    save();
    sfx("lvup");
    ask(
      `<div class="pbig">${ico("gift")}</div><h2>Bà Sáu lì xì</h2><p>“Năm mới buôn may bán đắt nghen con.” Bà Sáu dúi vào tay một bao lì xì đỏ.</p><p class="lvup">+${fmt(200000)} vào két</p>`,
      [["Con cảm ơn bà", () => head(), 1]],
    );
    return true;
  }
  /* từ giao thừa tới mùng 4: mỗi ngày chơi hỏi nghỉ Tết hay mở cửa */
  S.tetChon = S.tetChon || {};
  if (d >= -1 && d <= 3 && S.tetChon[S.day] == null) {
    ask(
      `<div class="pbig">🧧</div><h2>${d < 0 ? "Giao thừa" : "Mùng " + (d + 1) + " Tết"}</h2><p>Hẻm vắng hẳn, ai cũng về quê. Mở cửa thì khách đi chơi Tết ghé đông gấp mấy lần, nhưng lương nhân viên ngày Tết gấp 3.</p>`,
      [
        ["Nghỉ Tết hôm nay", () => nghiTet()],
        [
          "Mở cửa",
          () => {
            S.tetChon[S.day] = "mo";
            S.tetMo = S.day;
            save();
            toast("Mở cửa ngày Tết: khách đông, lương gấp 3");
          },
          1,
        ],
      ],
    );
    return true;
  }
  return false;
}
/* nghỉ một ngày Tết: không bán, không tốn tiền nhà và lương, hàng vẫn hết hạn */
function nghiTet() {
  S.tetChon = S.tetChon || {};
  S.tetChon[S.day] = "nghi";
  nghiMotNgay("🧧 Nghỉ Tết một ngày, ăn Tết với bà Sáu và Mướp");
  renderPrep();
}
/* tiệm nghỉ trọn một ngày rồi sang ngày mới (dùng cho nghỉ Tết theo lịch thật và về quê trong truyện) */
function nghiMotNgay(loi) {
  const r = S.cur,
    waste = expireStock();
  syncFlav();
  waste.forEach((x) => (r.waste[x.k] = { q: x.q, v: x.v }));
  r.nghi = true;
  S.history.push(r);
  if (S.history.length > 400) S.history.shift();
  S.day++;
  S.cur = newRec(S.day);
  rollDay(S.day);
  save();
  if (loi) toast(loi);
}

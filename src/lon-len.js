/* ---------- LỚN LÊN: mặt tiền đầu hẻm (bậc 2) và đơn nhóm ----------
   Bậc 2 vẫn là một địa điểm: đông khách vãng lai hơn, thêm một chỗ ở quầy, tiền nhà cao hơn,
   hợp đồng gia hạn thì tăng giá. Tiệm cũ trong hẻm thành chỗ nấu hàng. Nạp trước game.js. */

const buoc = () => (S && S.buoc) || 1;
const tienCoc = () => MAT_TIEN.thue * MAT_TIEN.cocNgay;
const tienNha = () => (buoc() >= 2 && S.hd ? S.hd.gia : CFG.rent);
/* số chỗ ở quầy */
const soCho = () => (S.upg.slot4 ? 4 : 3) + (buoc() >= 2 ? 1 : 0);
/* hệ số theo bậc: khách vãng lai đông hơn, kém kiên nhẫn hơn, mưa vắng hơn, biển hiệu có tác dụng hơn */
const heSoKhachBuoc = () =>
  buoc() >= 2 ? MAT_TIEN.khach * (evIs("rain") ? 0.85 : 1) * (S.upg.sign ? 1.08 : 1) : 1;
const heSoChoBuoc = () => (buoc() >= 2 ? 0.92 : 1);
/* giao diện theo tiệm: ra mặt tiền thì mái hiên, bảng hiệu đổi; góp đèn cho hẻm thì có dây bóng đèn */
function giaoDienTiem() {
  document.body.classList.toggle("mat-tien", buoc() >= 2);
  document.body.classList.toggle("hem-den", daGop("den"));
}

/* điều kiện thuê mặt tiền */
function dkMatTien() {
  const can = tienCoc() + MAT_TIEN.trangTri;
  return [
    { t: "Mở cửa từ ngày " + MAT_TIEN.tuNgay, ok: S.day >= MAT_TIEN.tuNgay },
    { t: "Đánh giá từ " + String(MAT_TIEN.sao).replace(".", ",") + " sao", ok: rating() >= MAT_TIEN.sao },
    { t: "Có " + fmtBig(can) + " (cọc " + fmtBig(tienCoc()) + " + sửa sang " + fmtBig(MAT_TIEN.trangTri) + ")", ok: S.money >= can },
    { t: "Không đang nợ ngân hàng", ok: !inDebt() },
  ];
}
function theMatTien() {
  if (buoc() >= 2) {
    const con = MAT_TIEN.hopDong - ((S.day - S.hd.bd) % MAT_TIEN.hopDong);
    return `<div class="mtcard on"><b>🏠 Mặt tiền đầu hẻm</b><p>Tiền nhà ${fmt(S.hd.gia)}/ngày · còn ${con} ngày tới kỳ gia hạn (tăng khoảng ${Math.round(MAT_TIEN.tang * 100)}%) · đang giữ cọc ${fmtBig(S.coc || 0)}</p><p class="note">Đông khách vãng lai hơn, thêm một chỗ ở quầy. Tiệm cũ trong hẻm vẫn là chỗ nấu hàng.</p></div>`;
  }
  const dk = dkMatTien(),
    du = dk.every((x) => x.ok),
    nghe = TT().co.mat_tien_mo;
  return `<div class="mtcard"><b>🏠 Mặt tiền đầu hẻm</b><p>${
    nghe ? "Góc kiosk đầu hẻm đang sang nhượng, chủ nhà là bạn bà Sáu." : "Mặt tiền ở đầu hẻm, người qua lại đông hơn."
  } Tiền nhà ${fmt(MAT_TIEN.thue)}/ngày (trong hẻm ${fmt(CFG.rent)}), thêm một chỗ ở quầy, khách vãng lai kém kiên nhẫn hơn.</p>${dk
    .map((x) => `<div class="mtdk ${x.ok ? "ok" : ""}">${x.ok ? "✓" : "○"} ${esc(x.t)}</div>`)
    .join("")}<div class="askbtns"><button class="big" data-mattien ${du ? "" : "disabled"}>Thuê mặt tiền</button></div></div>`;
}
function thueMatTien() {
  if (buoc() >= 2 || !dkMatTien().every((x) => x.ok)) return;
  ask(
    `<div class="pbig">🏠</div><h2>Ra mặt tiền đầu hẻm?</h2><p>Đặt cọc ${fmtBig(tienCoc())} (một tháng, chủ nhà là bạn bà Sáu) và sửa sang kiosk ${fmtBig(MAT_TIEN.trangTri)}. Tiền nhà từ ${fmt(CFG.rent)} lên ${fmt(MAT_TIEN.thue)}/ngày (khoảng ${fmtBig(MAT_TIEN.thue * 30)}/tháng), hợp đồng ${MAT_TIEN.hopDong} ngày, gia hạn tăng khoảng ${Math.round(MAT_TIEN.tang * 100)}%.</p>${
      S.money - tienCoc() - MAT_TIEN.trangTri < MAT_TIEN.vonNau
        ? `<p class="note">⚠️ Thuê xong két còn ${fmt(S.money - tienCoc() - MAT_TIEN.trangTri)}. Mặt tiền đông khách, chừng đó có thể không đủ nấu hàng hôm nay.</p>`
        : ""
    }`,
    [
      ["Để sau", () => {}],
      [
        "Thuê luôn",
        () => {
          S.money -= tienCoc() + MAT_TIEN.trangTri;
          S.coc = tienCoc();
          S.cur.equip.push({ n: "Sửa sang kiosk mặt tiền", v: MAT_TIEN.trangTri });
          S.buoc = 2;
          S.hd = { bd: S.day, gia: MAT_TIEN.thue };
          save();
          sfx("lvup");
          if (typeof track === "function") track("thue-mat-tien");
          toast("🏠 Đã thuê mặt tiền đầu hẻm! Mở cửa là bán ở chỗ mới.", 4500, 1);
          renderPrep();
        },
        1,
      ],
    ],
  );
}
/* cuối ngày (sau khi sang ngày mới): gia hạn hợp đồng thì tăng tiền nhà */
function matTienCuoiNgay() {
  if (buoc() < 2 || !S.hd) return "";
  if ((S.day - S.hd.bd) % MAT_TIEN.hopDong !== 0) return "";
  const cu = S.hd.gia;
  S.hd.gia = Math.round((cu * (1 + MAT_TIEN.tang)) / 1000) * 1000;
  return `<p class="lvup">🏠 Gia hạn hợp đồng mặt tiền: tiền nhà ${fmt(cu)} → ${fmt(S.hd.gia)}/ngày</p>`;
}

/* ---------- đơn nhóm ---------- */
/* đầu ngày: thỉnh thoảng có nhóm đặt trước; trả true nếu đang hỏi */
function donNhomCheck() {
  if (level() < 3) return false;
  if (S.dnKe == null) S.dnKe = S.day + 3 + Math.floor(Math.random() * 5);
  if (S.day < S.dnKe || (S.dnHom && S.dnHom.ngay === S.day)) return false;
  S.dnKe = S.day + 5 + Math.floor(Math.random() * 5);
  const d = rnd(DON_NHOM),
    n = d.n[0] + Math.floor(Math.random() * (d.n[1] - d.n[0] + 1));
  save();
  ask(
    `<div class="pbig">${ico("people")}</div><h2>Đơn nhóm: ${esc(d.ten)}</h2><p>${esc(d.chu.replace("{n}", n))}</p><p class="note">Cả nhóm gọi một lượt ${n} ly, chịu chờ lâu hơn khách thường. Làm kịp thì tip gấp đôi. Lúc đó quầy sẽ bận, khách lẻ ít ghé hơn.</p>`,
    [
      ["Từ chối", () => {}],
      [
        "Nhận đơn",
        () => {
          S.dnHom = { ngay: S.day, id: d.id, ten: d.ten, n, at: d.at };
          save();
          toast("Đã nhận đơn " + d.ten + " " + n + " ly");
        },
        1,
      ],
    ],
  );
  return true;
}
/* mỗi nhịp: tới giờ thì cả nhóm tới */
function donNhomNhip() {
  const d = S.dnHom;
  if (!d || d.ngay !== S.day || d.toi || R.challenge) return;
  if (R.t > dayLen() * 60 * (1 - d.at)) return;
  const i = R.slots.findIndex((s) => !s);
  if (i < 0) return;
  d.toi = true;
  const lv = level(),
    cups = Array.from({ length: d.n }, () => {
      let o = genOrder();
      for (let t = 0; t < 8 && o.so; t++) o = genOrder();
      o.so = null;
      o.tops = o.tops.slice(0, 2);
      return o;
    }),
    max = 40 * d.n * (S.upg.seats ? 1.25 : 1) * heSoCho();
  R.slots[i] = {
    nhom: d.id,
    born: performance.now(),
    id: ++uid,
    who: d.id === "lop" ? 7 : 3,
    face: "🙂",
    name: d.ten,
    say: thayTen("{Ban} ơi, " + d.ten + " tới lấy đơn đặt nè. Cho", true),
    end: "!",
    cups,
    done: cups.map(() => false),
    order: cups[0],
    pat: max,
    max,
    wrong: 0,
    paid: 0,
  };
  renderStreet();
  sfx("bell");
  toast("👥 " + d.ten + " tới lấy " + d.n + " ly!", 4000, 1);
  void lv;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-mattien]");
  if (!b || b.disabled || typeof S === "undefined" || !S) return;
  e.stopPropagation();
  thueMatTien();
});

/* ---------- KHÁCH QUEN, SỔ CÔNG THỨC, KỶ LỤC, TAB HẺM 42 ----------
   Khách quen (KHACH_QUEN trong data/cot-truyen.js) ghé quầy định kỳ, phục vụ tốt thì thân thêm.
   Nạp trước game.js; chỉ chạy lúc chơi. */

/* ---------- khách quen ghé quầy ---------- */
/* chọn khách quen sẽ ghé ở lượt khách này (gọi trong spawn), hoặc null */
function khachQuenDen() {
  if (R.challenge || !R.running || R.t < 20) return null;
  if (R.slots.some((c) => c && c.reg)) return null; /* mỗi lúc chỉ một khách quen ở quầy */
  const da = daGheHomNay(),
    ks = Object.keys(KHACH_QUEN).filter((k) => sapGhe(k) && !da[k]);
  if (!ks.length || Math.random() > 0.2) return null;
  return rnd(ks);
}
/* khách quen đã ghé trong ngày đang bán */
function daGheHomNay() {
  if (R.qNgay !== S.day) {
    R.qNgay = S.day;
    R.qDa = {};
  }
  return R.qDa;
}
/* khách quen tới hẹn ghé (tính theo ngày đang bán) */
function sapGhe(k, ngay) {
  const q = KHACH_QUEN[k],
    d = ngay == null ? S.day : ngay,
    last = TT().ghe[k];
  return d >= q.tuNgay && (last == null || d - last >= q.cach);
}
/* món quen nếu đang có đủ hàng, không thì gọi món khác như khách thường */
function donQuen(k) {
  const m = KHACH_QUEN[k].mon,
    lv = level(),
    can = [m.base, m.flav, ...(m.tops || [])].filter(Boolean);
  if (can.every((x) => S.unlocked[x] && qty(x) > 0))
    return {
      base: m.base,
      flav: m.flav || null,
      tops: [...(m.tops || [])],
      cheese: false,
      size: "M",
      so: null,
      sugar: lv >= 2 ? m.sugar : null,
      ice: lv >= 2 ? m.ice : null,
      quen: true,
    };
  let o = genOrder();
  for (let t = 0; t < 8 && o.so; t++) o = genOrder();
  o.so = null;
  return o;
}
function spawnQuen(i, k) {
  const q = KHACH_QUEN[k],
    o = donQuen(k),
    max =
      (55 + (level() >= 2 ? 8 : 0)) *
      1.3 *
      (S.upg.seats ? 1.25 : 1) *
      (1 + 0.35 * (slowN(o) + Math.max(0, o.tops.length - 1))) *
      heSoCho();
  daGheHomNay()[k] = true;
  R.slots[i] = {
    reg: k,
    born: performance.now(),
    id: ++uid,
    who: NHAN_VAT[k].mat,
    sf: NHAN_VAT[k].ngoiSao, /* Hana vẽ bằng ảnh ngôi sao */
    face: "🙂",
    name: NHAN_VAT[k].ten,
    say: thayTen(q.xin, true),
    end: o.quen ? q.het : "!",
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
}
/* phục vụ xong khách quen: 4 sao trở lên thì thân thêm */
function quenXong(c, sao) {
  const T = TT(),
    k = c.reg;
  T.ghe[k] = S.day;
  T.lan[k] = (T.lan[k] || 0) + 1;
  demTuan("quen");
  if (sao >= 4 && (T.than[k] || 0) < 10) {
    T.than[k] = (T.than[k] || 0) + 1;
    setTimeout(() => toast("♥ " + NHAN_VAT[k].ten + " thân với tiệm hơn (" + T.than[k] + "/10)", 2800), 500);
  }
}
/* khách quen bỏ về hoặc được mời về: hẹn lần sau */
function quenBo(c) {
  if (c && c.reg) TT().ghe[c.reg] = S.day;
}
/* ưu đãi từ sổ công thức: khách chờ lâu hơn */
/* cộng thêm đồ trang trí (src/trang-tri.js) */
const heSoCho = () => 1 + (coTrang(1) ? 0.05 : 0) + (coTrang(2) ? 0.05 : 0) + choTri();

/* ---------- món đã pha và kỷ lục ---------- */
const khoaMon = (o) => [o.base, o.flav || "", [...o.tops].sort().join("+"), o.cheese ? "cheese" : ""].join("|");
function ghiMon(o) {
  const T = TT(),
    k = khoaMon(o);
  T.mon[k] = (T.mon[k] || 0) + 1;
}
function KL() {
  S.kl = S.kl || {};
  return S.kl;
}
/* sau mỗi khách tại quầy phục vụ xong */
function ghiPhucVu(c, sao) {
  const K = KL();
  K.chuoi = sao >= 5 ? (K.chuoi || 0) + 1 : 0;
  K.chuoiMax = Math.max(K.chuoiMax || 0, K.chuoi);
  if (c.cups.length === 1 && c.born) {
    const giay = Math.round((performance.now() - c.born) / 100) / 10;
    if (!K.nhanh || giay < K.nhanh) K.nhanh = giay;
  }
  K.khach = (K.khach || 0) + 1;
  if (c.nhom) K.nhom = (K.nhom || 0) + 1;
  demTuan("khach");
  if (sao >= 5) demTuan("sao5");
  demTuan("chuoi", K.chuoi, true);
  if (c.nhom) demTuan("nhom");
  xetHuyHieu();
}
/* cuối ngày */
function ghiNgay(rec, doanhThu) {
  const K = KL(),
    s5 = (R.today.stars || []).filter((x) => x >= 5).length;
  if (doanhThu > (K.ngayTot || 0)) {
    K.ngayTot = doanhThu;
    K.ngayTotSo = rec.day;
  }
  if (s5 > (K.sao5 || 0)) K.sao5 = s5;
  if ((rec.served || 0) > (K.lyNgay || 0)) K.lyNgay = rec.served;
  const le = typeof leHoiNay === "function" && leHoiNay();
  if (le) (K.le = K.le || {})[le] = true;
  if (rec.ev && rec.ev.id === "rain" && (rec.served || 0) >= 30) K.muaDong = true;
  demTuan("tien", doanhThu);
  xetHuyHieu();
}

/* ---------- ngày mai ---------- */
function ngayMaiHTML() {
  const T = TT(),
    dong = [];
  const q = MO_KHOA.find((x) => x.ngay === S.day && !T.qua[x.ngay]);
  if (q)
    dong.push(
      `${ico("gift")} ${q.k ? "Món mới: " + ITEMS[q.k].n : q.chai ? "Quà: chai " + low(ITEMS[q.chai].n) : esc(q.ghiChu)}`,
    );
  const toi = Object.keys(KHACH_QUEN).filter((k) => sapGhe(k, S.day));
  if (toi.length) dong.push(`♥ ${toi.map((k) => NHAN_VAT[k].ten).join(", ")} có thể ghé`);
  const g = goiYThan();
  if (g) dong.push(g);
  else if (T.trang.length < 12) dong.push(`${ico("book")} Sổ công thức: ${T.trang.length}/12 trang`);
  return dong.length ? `<div class="ngaymai"><b>Ngày mai</b>${dong.map((x) => `<div>${x}</div>`).join("")}</div>` : "";
}
/* khách quen nào sắp có chuyện mới */
function goiYThan() {
  const T = TT();
  let best = null;
  for (const k of Object.keys(KHACH_QUEN)) {
    const can = MAU_CHUYEN.filter((m) => T.xem[m.id] == null && m.dieuKien && m.dieuKien.than && m.dieuKien.than[k] != null)
      .map((m) => m.dieuKien.than[k])
      .sort((a, b) => a - b)[0];
    if (can == null) continue;
    const thieu = can - (T.than[k] || 0);
    if (thieu > 0 && (!best || thieu < best.thieu)) best = { k, thieu };
  }
  return best ? `♥ ${NHAN_VAT[best.k].ten} cần thêm ${best.thieu} lần phục vụ tốt để kể chuyện mới` : "";
}

/* ---------- tab Hẻm 42 ---------- */
const timThan = (n) => `<span class="hearts" aria-label="${n}/10">${"♥".repeat(Math.ceil(n / 2))}${"♡".repeat(5 - Math.ceil(n / 2))}</span>`;
function moTaMon(o) {
  return [ITEMS[o.base] && ITEMS[o.base].n, o.flav && ITEMS[o.flav] && "siro " + low(ITEMS[o.flav].n), ...(o.tops || []).map((t) => low(ITEMS[t].n))]
    .filter(Boolean)
    .join(", ");
}
function paneQuen() {
  const T = TT();
  return (
    Object.keys(KHACH_QUEN)
      .map((k) => {
        const q = KHACH_QUEN[k],
          nv = NHAN_VAT[k],
          than = T.than[k] || 0,
          gap = (T.lan[k] || 0) > 0;
        if (!gap)
          return `<div class="kq an"><span class="trf">?</span><div><b>Chưa gặp</b><small>Thường ghé từ ngày ${q.tuNgay}</small></div></div>`;
        const ts = q.tieuSu.filter((_, i) => than >= [0, 3, 6][i]);
        return `<div class="kq"><span class="trf" style="${nv.ngoiSao != null ? starBg(nv.ngoiSao, than >= 6 ? 1 : 0, 64, 63) : faceBg(nv.mat, than >= 6 ? 1 : 0, 64, 63)}"></span><div><b>${esc(nv.ten)}</b> ${timThan(than)}<small>Đã ghé ${T.lan[k]} lần · thân ${than}/10</small>${ts.map((t) => `<p>${esc(t)}</p>`).join("")}${
          T.lan[k] >= 2 ? `<p class="kqmon">Món quen: ${esc(moTaMon(q.mon))}</p>` : ""
        }</div></div>`;
      })
      .join("") + `<p class="note">Phục vụ khách quen được 4 sao trở lên thì thân thêm. Đủ thân thì họ kể chuyện mới sau giờ đóng cửa.</p>`
  );
}
function paneSo() {
  const T = TT(),
    trang = TRANG_CONG_THUC.slice(1)
      .map((P, i) =>
        T.trang.includes(i + 1)
          ? `<div class="sotr"><b>Trang ${i + 1}: ${esc(P.ten)}</b><p>“${esc(P.chu)}”</p><small>${esc(P.uuDai)}</small></div>`
          : `<div class="sotr an"><b>Trang ${i + 1}</b><small>Chưa tìm thấy. Có lẽ đang nằm đâu đó trong xóm.</small></div>`,
      )
      .join("");
  const mon = Object.entries(T.mon)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([k, n]) => {
      const [b, f, tp, ch] = k.split("|"),
        ten = [ITEMS[b] && ITEMS[b].n, f && ITEMS[f] && "siro " + low(ITEMS[f].n), ...(tp ? tp.split("+") : []).map((t) => ITEMS[t] && low(ITEMS[t].n)), ch && "kem cheese"]
          .filter(Boolean)
          .join(", "),
        sao = n >= 50 ? 3 : n >= 20 ? 2 : n >= 5 ? 1 : 0;
      return `<div class="crow"><span>${esc(ten)}</span><span>${"★".repeat(sao)}${"☆".repeat(3 - sao)} · ${n} ly</span></div>`;
    })
    .join("");
  return `<p class="note">Sổ công thức của bà Sáu: ${T.trang.length}/12 trang. Đủ 12 trang thì có món đặc trưng.</p>${trang}<div class="sec">Món bạn đã pha</div>${
    mon || '<p class="note">Pha đúng món cho khách là món đó được ghi vào đây. 5, 20, 50 ly thì lên sao tay nghề.</p>'
  }`;
}
function paneSoTay() {
  const T = TT(),
    xem = MAU_CHUYEN.filter((m) => T.xem[m.id] != null).sort((a, b) => T.xem[a.id] - T.xem[b.id]);
  if (!xem.length) return '<p class="note">Chưa có chuyện nào. Mở cửa ngày đầu tiên là bà Sáu ghé.</p>';
  return (
    xem
      .map(
        (m) =>
          `<button class="stl" data-canh="${m.id}"><small>Ngày ${T.xem[m.id]} · Chương ${m.chuong}</small>${esc(m.tomTat || m.id)}</button>`,
      )
      .join("") + `<p class="note">Bấm vào một chuyện để xem lại.</p>`
  );
}
function paneKyLuc() {
  const K = KL(),
    row = (t, v) => `<div class="crow"><span>${t}</span><span>${v}</span></div>`;
  return (
    row("Ngày doanh thu cao nhất", K.ngayTot ? `${fmt(K.ngayTot)} (ngày ${K.ngayTotSo})` : "–") +
    row("Chuỗi khách 5 sao liên tiếp", K.chuoiMax ? K.chuoiMax + " khách" : "–") +
    row("Phục vụ nhanh nhất (1 ly)", K.nhanh ? String(K.nhanh).replace(".", ",") + " giây" : "–") +
    row("Nhiều 5 sao nhất trong ngày", K.sao5 ? K.sao5 + " đánh giá" : "–") +
    row("Nhiều ly nhất trong ngày", K.lyNgay ? K.lyNgay + " ly" : "–") +
    row("Khách đã phục vụ", (K.khach || 0) + " khách") +
    row("Số ngày mở cửa", Math.max(0, S.day - 1) + " ngày")
  );
}
/* các tab con của Hẻm 42; mốc sau thêm tab bằng HEM_TAB.push */
/* nhãn là hàm vì ico() của game.js chưa có lúc nạp file này */
const HEM_TAB = [
  [() => "♥ Khách quen", paneQuen],
  [() => ico("book") + " Sổ công thức", paneSo],
  [() => "📖 Sổ tay", paneSoTay],
  [() => ico("trophy") + " Kỷ lục", paneKyLuc],
];
function paneHem() {
  $("pane").innerHTML = subTabs(
    "hem",
    HEM_TAB.map(([t, f]) => [t(), f()]),
  );
  bindSub("hem");
  $("pane").onclick = (e) => {
    const b = e.target.closest("[data-canh]");
    if (!b) return;
    const m = MAU_CHUYEN.find((x) => x.id === b.dataset.canh);
    if (m) hienCanh(m, () => {}, true);
  };
  if (typeof hemBind === "function") hemBind();
}

/* ---------- quà mở khoá những ngày đầu (MO_KHOA) ---------- */
/* gọi trong prepChecks; trả true nếu đang hiện hộp thoại */
function quaMoKhoa() {
  const T = TT();
  MO_KHOA.forEach((x) => {
    if (S.day - x.ngay > 2) T.qua[x.ngay] = true; /* bản lưu cũ đã qua mốc: không dồn quà */
  });
  const q = MO_KHOA.find((x) => x.ngay <= S.day && !T.qua[x.ngay]);
  if (!q) return false;
  T.qua[q.ngay] = true;
  let them = "";
  if (q.k) {
    if (S.unlocked[q.k] || (S.off || {})[q.k]) {
      save();
      return false;
    }
    S.unlocked[q.k] = true;
    them = `Mở ${ITEMS[q.k].n} miễn phí, có ngay trong Kho`;
  } else if (q.chai) {
    addStock(q.chai, CFG.bottleN);
    syncFlav();
    them = `+1 chai ${low(ITEMS[q.chai].n)}, dùng được ${CFG.bottleN} ly`;
  }
  save();
  sfx("lvup");
  ask(
    `<div class="pbig">${ico(them ? "gift" : "warn")}</div><h2>${them ? "Quà ngày " + S.day : "Lưu ý từ hôm nay"}</h2><p>${esc(q.chu || q.ghiChu)}</p>${them ? `<p class="lvup">${them}</p>` : ""}`,
    [["Tuyệt", () => refreshPrep(1), 1]],
  );
  return true;
}

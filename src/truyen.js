/* ---------- CỐT TRUYỆN HẺM 42: bộ máy mẩu chuyện ----------
   Đọc MAU_CHUYEN trong data/cot-truyen.js, chọn cảnh theo điều kiện, hiện từng câu kèm chân dung.
   Nạp sau data/*.js, trước game.js. Mọi hàm chỉ chạy lúc chơi nên được dùng S, R, $, ask… của game.js. */

const CHUONG_TEN = ["Khai trương", "Người trong hẻm", "Mùa trăng", "Về nhà ăn Tết"];

/* trạng thái truyện trong bản lưu */
function TT() {
  if (!S.tr) S.tr = {};
  const T = S.tr;
  T.xem = T.xem || {}; /* id cảnh -> ngày đã xem */
  T.co = T.co || {}; /* cờ do lựa chọn đặt */
  T.than = T.than || {}; /* độ thân khách quen, 0–10 */
  T.trang = T.trang || []; /* các trang sổ công thức đã có */
  T.khat = T.khat || {}; /* chương đã được bà Sáu cho khất tiền nhà */
  T.ghe = T.ghe || {}; /* khách quen: ngày ghé gần nhất */
  T.lan = T.lan || {}; /* khách quen: số lần ghé */
  T.qua = T.qua || {}; /* quà mở khoá đã nhận, theo ngày */
  T.mon = T.mon || {}; /* món đã pha đúng: khoá -> số ly */
  T.nhanh = T.nhanh || {}; /* ngã rẽ lớn đã chọn: id ngã rẽ -> "A" | "B" */
  /* bản 4.9 đổi số trang 3 và 4 (trang của Linh thường tới trước trang của Khoa): bản lưu cũ đổi theo */
  if (!T.trang34) {
    T.trang = T.trang.map((n) => (n === 3 ? 4 : n === 4 ? 3 : n));
    T.trang34 = true;
  }
  if (typeof chuyenBanLuuNhanh === "function") chuyenBanLuuNhanh(T);
  return T;
}
const cheDo = () => (S.tr && S.tr.che) || "day"; /* day: đầy đủ · gon: gọn · tat: tắt */
const CHE_DO_TEN = { day: "Đầy đủ", gon: "Gọn", tat: "Tắt" };
const xung = () => (S.xung === "anh" ? "anh" : "chị");
const hoaDau = (x) => x.charAt(0).toUpperCase() + x.slice(1);
/* chương theo ngày: cảnh trôi theo độ thân hay theo lúc ra mặt tiền vẫn mang nhãn chương của ngày xem, để nhật ký không lùi chương */
const chuongLuc = (ngay) => (ngay < 7 ? 0 : ngay < 30 ? 1 : ngay < 60 ? 2 : 3);
/* nhãn chương của một ngày: qua cảnh mở hàng mùng năm (c3_ket) thì là "Sau Tết" (độ khó vẫn theo Chương 3) */
function tenChuongNgay(ngay) {
  const T = TT();
  if (T.xem.c3_ket != null && ngay > T.xem.c3_ket) return "Sau Tết";
  const ch = chuongLuc(ngay);
  return `Chương ${ch} · ${CHUONG_TEN[ch] || ""}`;
}
const chuongNay = () => chuongLuc(S.day);
/* truyện ảnh hưởng lượng khách: combo với cô Hạnh nhỉnh hơn; các ngã rẽ tính trong heSoKhachNhanh (src/nga-re.js) */
function heSoKhachTruyen() {
  const T = S && S.tr;
  if (!T || !T.xem) return 1;
  return (T.co && T.co.combo_hanh ? 1.03 : 1) * (typeof heSoKhachNhanh === "function" ? heSoKhachNhanh() : 1);
}
/* S có thể chưa có khi game đang đọc bản lưu */
const coTrang = (n) => !!(S && S.tr && S.tr.trang && S.tr.trang.includes(n));

/* chèn cách xưng hô và tên tiệm vào câu; thô = không thoát HTML (dùng trong câu gọi món) */
function thayTen(t, tho) {
  /* tên tiệm đã bắt đầu bằng "Tiệm", "Quán" thì bỏ chữ "tiệm" đứng trước {shop} (tránh "tiệm Tiệm Trà Nhỏ") */
  const s0 = /^(tiệm|quán)\s/i.test(shopName()) ? String(t).replace(/(^|\s)(tiệm|quán) \{shop\}/gi, "$1{shop}") : String(t);
  const s = tho ? s0 : esc(s0);
  return s
    .replace(/\{Ban\}/g, hoaDau(xung()))
    .replace(/\{ban\}/g, xung())
    .replace(/\{shop\}/g, tho ? shopName() : esc(shopName()));
}
/* khách thường gọi "Chị ơi…" thì đổi theo cách người chơi muốn được gọi */
const xungGoi = (say) => say.replace(/^Chị ơi/, hoaDau(xung()) + " ơi");

/* ---------- chọn cảnh ---------- */
/* mở cửa: ngày đang bán; đóng cửa: ngày vừa bán xong (S.day đã sang ngày mới) */
const ngayCua = (luc) => (luc === "dong_cua" ? S.day - 1 : S.day);
function khopCo(want) {
  const T = TT();
  return Object.entries(want || {}).every(([k, v]) => (v === true ? !!T.co[k] : T.co[k] === v));
}
/* điều kiện chung cho câu thoại, hậu truyện và phần cứng của điều kiện cảnh */
function khopDk(d) {
  if (!d) return true;
  const T = TT(),
    trung = (w) => Object.entries(w).some(([k, v]) => (v === true ? !!T.co[k] : T.co[k] === v));
  if (d.co && !khopCo(d.co)) return false;
  if (d.khongCo && trung(d.khongCo)) return false;
  if (d.nhanh && !Object.entries(d.nhanh).every(([k, v]) => T.nhanh[k] === v)) return false;
  if (d.khongNhanh && Object.entries(d.khongNhanh).some(([k, v]) => T.nhanh[k] === v)) return false;
  if (d.than && !Object.entries(d.than).every(([k, v]) => (T.than[k] || 0) >= v)) return false;
  if (d.xem && ![].concat(d.xem).every((id) => T.xem[id] != null)) return false;
  if (d.chuaXem && [].concat(d.chuaXem).some((id) => T.xem[id] != null)) return false;
  /* đã thấy ít nhất một trong các kết này ở lượt chơi trước */
  if (d.ketDaThay && !([].concat(d.ketDaThay).some((id) => ((S.kl || {}).ket || {})[id] != null))) return false;
  return true;
}
/* cảnh lễ lặp lại mỗi năm: đã xem tính theo năm của dịp lễ (Tết tính theo năm của mùng 1) */
const tetGan = (hom) =>
  LICH_LE.tet.find((t) => {
    const k = cachNgayLich(hom || homNayVN(), t);
    return k >= -17 && k <= 8;
  }) || null;
const namLe = (le) => (le === "tet" && tetGan() ? tetGan() : homNayVN()).slice(0, 4);
const khoaXem = (m) => (m.moiNam ? m.id + "@" + namLe((m.dieuKien || {}).le) : m.id);
/* ngày đã xem cảnh "sau": một id hoặc danh sách id (cảnh nào xem trước thì tính cảnh đó); chưa xem thì null */
function ngayXemSau(T, sau) {
  const ds = [].concat(sau).map((id) => T.xem[id]).filter((x) => x != null);
  return ds.length ? Math.min(...ds) : null;
}
function hopCanh(m, luc) {
  if (m.luc !== luc) return false;
  const T = TT(),
    d = m.dieuKien || {},
    dn = ngayCua(luc);
  if (T.xem[khoaXem(m)] != null) return false;
  if (d.quanhTet) {
    const t = tetGan(),
      k = t && cachNgayLich(homNayVN(), t);
    if (!t || k < d.quanhTet[0] || k > d.quanhTet[1]) return false;
  }
  if (d.ngay != null && dn < d.ngay) return false;
  if (d.ngayDen != null && dn > d.ngayDen) return false;
  if (d.chuaXem && [].concat(d.chuaXem).some((id) => T.xem[id] != null)) return false;
  /* cảnh Tết ngoài đời không chen vào đoạn Tết của truyện (từ ngày 55 tới khi mở hàng mùng năm) */
  if (d.ngoaiTetTruyen && dn >= 55 && T.xem.c3_ket == null) return false;
  if (!khopDk({ co: d.co, khongCo: d.khongCo, nhanh: d.nhanh, khongNhanh: d.khongNhanh })) return false;
  if (d.buoc && (S.buoc || 1) < d.buoc) return false;
  if (d.tienDuoi != null && !(S.money < d.tienDuoi)) return false;
  if (d.tuNgayThat && homNayVN() < d.tuNgayThat) return false;
  if (d.denNgayThat && homNayVN() > d.denNgayThat) return false;
  if (d.le && !(typeof leHoiNay === "function" && leHoiNay() === d.le)) return false;
  if (d.luot && (T.luot || 1) < d.luot) return false; /* lượt chơi thứ mấy (Hẻm 42 lần nữa) */
  /* hạn chót: từ ngày này bỏ qua điều kiện mềm (than, trang, sao, soTrang, tienTren, sau, thoiTiet) để truyện không bị kẹt */
  if (d.chot != null && dn >= d.chot) return true;
  if (d.than && !Object.entries(d.than).every(([k, v]) => (T.than[k] || 0) >= v)) return false;
  if (d.trang && !T.trang.includes(d.trang)) return false;
  if (d.sao != null && rating() < d.sao) return false;
  if (d.soTrang != null && T.trang.length < d.soTrang) return false;
  if (d.tienTren != null && S.money < d.tienTren) return false;
  if (d.sau) {
    const x = ngayXemSau(T, d.sau);
    if (x == null || (d.cachNgay && dn - x < d.cachNgay)) return false;
  }
  if (d.thoiTiet) {
    const e = luc === "dong_cua" ? (S.history[S.history.length - 1] || {}).ev : ev();
    const cho = d.sau ? dn - ngayXemSau(T, d.sau) : 0;
    if (!(e && e.id === d.thoiTiet) && cho < 8) return false;
  }
  return true;
}
function canhKe(luc) {
  const T = TT();
  if (T.homNay === ngayCua(luc)) return null; /* tối đa một cảnh mỗi ngày */
  const ds = MAU_CHUYEN.filter((m) => hopCanh(m, luc));
  ds.sort(
    (a, b) =>
      (b.uuTien || 0) - (a.uuTien || 0) || ((a.dieuKien || {}).ngay || 0) - ((b.dieuKien || {}).ngay || 0),
  );
  return ds[0] || null;
}

/* ---------- áp kết quả ---------- */
function apKetQua(kq, moi) {
  if (!kq) return;
  const T = TT();
  Object.entries(kq.than || {}).forEach(([k, v]) => (T.than[k] = Math.max(0, Math.min(10, (T.than[k] || 0) + v))));
  Object.assign(T.co, kq.co || {});
  if (kq.trang && !T.trang.includes(kq.trang)) {
    T.trang.push(kq.trang);
    T.trang.sort((a, b) => a - b);
    moi.push(kq.trang);
  }
  if (kq.tien) {
    S.money += kq.tien;
    S.cur.gift = (S.cur.gift || 0) + kq.tien;
  }
  /* tiền người nhà cho (mẹ gửi, ba lì xì): tiền vào của chủ tiệm, ghi ở Chi tiêu của bạn, không tính doanh thu */
  if (kq.tienRieng) {
    S.money += kq.tienRieng;
    ghiCaNhan(kq.tienNhan || "Tiền người nhà cho", -kq.tienRieng);
  }
  /* quà trong truyện: mở nguyên liệu, thêm hàng vào kho, hoặc gọi một hàm của game */
  if (kq.mo && ITEMS[kq.mo] && !S.unlocked[kq.mo]) {
    S.unlocked[kq.mo] = true;
    setTimeout(() => toast("🎁 Mở " + ITEMS[kq.mo].n + " miễn phí, có trong Kho", 3500, 1), 600);
  }
  if (kq.hang) Object.entries(kq.hang).forEach(([k, n]) => ITEMS[k] && addStock(k, n));
  if (kq.goi && typeof window[kq.goi] === "function") window[kq.goi]();
}
function apDung(m, chon) {
  const T = TT(),
    moi = [];
  if (m.reRe && T.xem[m.id] == null) T.xem[m.id] = T.homNay != null ? T.homNay : S.day;
  if (chon) Object.assign(T.co, chon.dat || {});
  if (chon && chon.nhanh) {
    Object.assign(T.nhanh, chon.nhanh);
    const K = KL();
    K.reDaDi = K.reDaDi || {};
    Object.entries(chon.nhanh).forEach(([k, v]) => ((K.reDaDi[k] = K.reDaDi[k] || {})[v] = S.day));
    if (typeof track === "function") Object.entries(chon.nhanh).forEach(([k, v]) => track("nga-re-" + k + "-" + v));
  }
  apKetQua(m.ketQua, moi);
  if (chon) apKetQua(chon.ketQua, moi);
  if (typeof xetHuyHieu === "function") setTimeout(() => xetHuyHieu(), 1500);
  save();
  head();
  return moi;
}

/* ---------- hiện cảnh ---------- */
function chanDung(ai) {
  const nv = NHAN_VAT[ai];
  if (ai === "tin" || (nv && nv.tinNhan)) return `<span class="trf trf-ic">${ico("phone")}</span>`;
  if (!nv) return "";
  if (nv.anh) return `<span class="trf" style="background-image:url(${IMG}${nv.anh}${nv.anh.includes(".") ? "" : ".png"})"></span>`;
  if (nv.mat != null) return `<span class="trf" style="${faceBg(nv.mat, 0, 64, 63)}"></span>`;
  if (nv.ngoiSao != null && typeof nv.ngoiSao === "number") return `<span class="trf" style="${starBg(nv.ngoiSao, 0, 64, 63)}"></span>`;
  return "";
}
function dongThoai([ai, cau]) {
  if (ai === "_") return `<p class="trl trn">${thayTen(cau)}</p>`;
  if (ai === "tin") return `<div class="trw"><span class="trf trf-ic">${ico("phone")}</span><p class="trl trtin">${thayTen(cau)}</p></div>`;
  const nv = NHAN_VAT[ai] || { ten: ai };
  return `<div class="trw">${chanDung(ai)}<div><b class="trn2">${esc(nv.ten)}</b><p class="trl">${thayTen(cau)}</p></div></div>`;
}
const locDong = (ds) => (ds || []).filter((d) => khopDk(d[2]));

/* chạy cảnh (nếu có) rồi gọi xong(). luc: "mo_cua" | "dong_cua" */
function truyenLuc(luc, xong) {
  xong = xong || (() => {});
  if (R.challenge || !$("card")) return xong();
  let m = canhKe(luc);
  if (!m) return xong();
  const T = TT();
  /* cảnh lễ năm thứ hai trở đi: lời thoại khác */
  if (m.moiNam && m.thoaiLai && Object.keys(T.xem).some((k) => k.startsWith(m.id + "@") && k !== khoaXem(m))) m = { ...m, thoai: m.thoaiLai };
  /* ngã rẽ lớn chỉ tính là đã xem khi người chơi chọn xong, thoát giữa chừng thì lần sau hỏi lại */
  if (m.moiNam) T.xem[khoaXem(m)] = ngayCua(luc);
  if (!m.reRe) T.xem[m.id] = ngayCua(luc);
  T.homNay = ngayCua(luc);
  save();
  if (typeof track === "function") track("truyen-" + m.id);
  /* cảnh kết truyện: xong thì hiện kết và hậu truyện */
  const tiep = m.nghi && typeof nghiVeQue === "function" ? nghiVeQue : m.ketCuc && typeof hienKetCuc === "function" ? () => hienKetCuc(xong) : xong;
  /* chế độ Tắt tự chọn thay, trừ ngã rẽ lớn */
  if (cheDo() === "tat" && !m.reRe) {
    const moi = apDung(m, (m.luaChon || [])[m.macDinh || 0]);
    return hienTrangMoi(moi, tiep);
  }
  hienCanh(m, tiep, false);
}

/* xemLai = mở từ Sổ tay: không áp kết quả lần nữa */
function hienCanh(m, xong, xemLai) {
  const card = $("card"),
    dong = locDong(m.thoai),
    /* cảnh sau giờ đóng cửa thuộc ngày vừa bán (S.day đã sang ngày mới) */
    ngayCanh = xemLai ? (TT().xem[khoaXem(m)] ?? S.day) : ngayCua(m.luc),
    nhan = `<small class="trch">${esc(m.nhan || tenChuongNgay(ngayCanh))}${m.reRe ? ' <span class="trre">Ngã rẽ</span>' : ""}</small>`,
    baoRe = m.reRe && !xemLai ? `<p class="trrew">${esc(m.reRe)}</p>` : "";
  let i = 0;
  const ketThuc = (chon, boQua) => {
    const moi = xemLai ? [] : apDung(m, chon);
    const sau = locDong(chon && chon.thoai);
    const dong2 = () => {
      $("modal").hidden = true;
      if (boQua && !xemLai) toast("📖 " + m.tomTat, 3500);
      hienTrangMoi(moi, xong);
    };
    if (sau.length && !boQua) {
      card.innerHTML = `${nhan}${tranhCanh(m)}${sau.map(dongThoai).join("")}<div class="askbtns"><button class="big" id="trOk">Tiếp tục</button></div>`;
      $("trOk").onclick = dong2;
    } else dong2();
  };
  const nutChon = () =>
    m.luaChon && m.luaChon.length
      ? `${baoRe}<div class="askbtns">${m.luaChon.map((c, k) => `<button class="big trc" data-ch="${k}">${thayTen(c.chu)}</button>`).join("")}</div>`
      : `<div class="askbtns"><button class="big" id="trOk">Tiếp tục</button></div>`;
  const ganNut = () => {
    card.querySelectorAll("[data-ch]").forEach((b) => (b.onclick = () => ketThuc(m.luaChon[+b.dataset.ch], false)));
    if ($("trOk")) $("trOk").onclick = () => ketThuc(null, false);
    if ($("trSkip"))
      $("trSkip").onclick = () =>
        /* ngã rẽ lớn: Bỏ qua chỉ tua thoại, người chơi vẫn tự chọn */
        m.reRe && m.luaChon && m.luaChon.length ? veChon() : ketThuc((m.luaChon || [])[m.macDinh || 0] || null, true);
  };
  const veChon = () => {
    card.innerHTML = `${nhan}${tranhCanh(m)}<p class="trl trn">${thayTen(m.tomTat || "")}</p>${nutChon()}`;
    ganNut();
  };
  const boQuaNut = xemLai ? "" : `<button class="sp-link trskip" id="trSkip">Bỏ qua ›</button>`;
  const ve = () => {
    /* đã đọc ở lượt chơi trước thì hiện gọn cả cảnh */
    const gon = cheDo() !== "day" || xemLai || !!((S.kl || {}).daDoc || {})[m.id];
    if (gon) {
      card.innerHTML = `${boQuaNut}${nhan}${tranhCanh(m)}${dong.map(dongThoai).join("")}${nutChon()}`;
    } else {
      const cuoi = i >= dong.length - 1;
      /* tranh giữ nguyên qua từng câu, người đang nói nhô lên */
      card.innerHTML = `${boQuaNut}${nhan}${tranhCanh(m, tcAiNoi(dong[i]))}${dongThoai(dong[i])}<div class="trdots">${dong.map((_, k) => `<i class="${k <= i ? "on" : ""}"></i>`).join("")}</div>${
        cuoi ? nutChon() : `<div class="askbtns"><button class="big" id="trNext">Tiếp ›</button></div>`
      }`;
      if ($("trNext"))
        $("trNext").onclick = () => {
          i++;
          ve();
        };
    }
    ganNut();
    if (xemLai && $("trOk")) $("trOk").onclick = () => ($("modal").hidden = true, xong());
  };
  card.onchange = null;
  $("modal").hidden = false;
  ve();
}

/* nhận trang sổ công thức mới: hiện từng trang rồi mới đi tiếp */
function hienTrangMoi(moi, xong) {
  if (!moi || !moi.length) return xong();
  const n = moi.shift(),
    P = TRANG_CONG_THUC[n];
  sfx("lvup");
  ask(
    `<div class="pbig">${ico("book")}</div><h2>Trang ${n}: ${esc(P.ten)}</h2><p class="trpg">“${esc(P.chu)}”</p><p class="lvup">${esc(P.uuDai)}</p><p class="note">Sổ công thức của bà Sáu: ${TT().trang.length}/12 trang</p>`,
    [["Cất vào sổ", () => hienTrangMoi(moi, xong), 1]],
  );
}

/* nút chọn anh/chị trong trang đặt tên quán (bắt ở cấp tài liệu vì trang được vẽ lại nhiều nơi) */
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-xung]");
  if (!b || typeof S === "undefined" || !S) return;
  S.xung = b.dataset.xung;
  b.parentElement.querySelectorAll("[data-xung]").forEach((x) => x.classList.toggle("on", x === b));
  save();
});

/* ---------- lễ hội theo lịch thật (giờ Việt Nam) ----------
   Mùng 1 Tết và rằm tháng Tám theo dương lịch; mỗi năm cập nhật thêm một dòng. */
const LICH_LE = {
  tet: ["2027-02-06", "2028-01-26", "2029-02-13", "2030-02-03"],
  trungThu: ["2026-09-25", "2027-09-15", "2028-10-03", "2029-09-22", "2030-09-12"],
};
/* window.__ngay = "YYYY-MM-DD" để thử lễ Tết, Noel mà không phải đợi tới ngày (chỉ dùng khi test) */
const homNayVN = () => window.__ngay || new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
const cachNgayLich = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);
/* "tet" từ 17 ngày trước mùng 1 (gần ông Táo) tới mùng 9; "trungThu" 5 ngày quanh rằm; "noel" 20–26/12 */
function leHoiNay(ngay) {
  const d = ngay || homNayVN();
  if (LICH_LE.tet.some((t) => cachNgayLich(d, t) >= -17 && cachNgayLich(d, t) <= 8)) return "tet";
  if (LICH_LE.trungThu.some((t) => Math.abs(cachNgayLich(d, t)) <= 2)) return "trungThu";
  const md = d.slice(5);
  if (md >= "12-20" && md <= "12-26") return "noel";
  return null;
}

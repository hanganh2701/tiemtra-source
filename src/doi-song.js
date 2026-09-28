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
  return d;
}
/* bản lưu 5.0 (nhà xe giá thu nhỏ): hoàn lại tiền đã mua nhà xe, giữ nấc thuê, báo một lần */
function chuyenDs50(d) {
  const hoan = (DS_GIA_CU[d.o] || 0) + (DS_GIA_CU[d.xe] || 0);
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

/* ---------- trả góp ---------- */
/* tiền góp mỗi ngày để trả hết khoản vay trong n ngày, lãi mỗi năm (360 ngày) */
function gopNgay(vay, laiNam, n) {
  const r = laiNam / 360;
  return Math.ceil((vay * r) / (1 - (1 + r) ** -n) / 1000) * 1000;
}
/* thu nhập mỗi ngày ngân hàng xét: trung bình 7 ngày gần nhất, không tính tiền mua sắm và tiền góp */
function thuNhapNgay() {
  const H = (S.history || []).slice(-7);
  if (H.length < 3) return 0;
  return H.reduce((a, r) => a + recRev(r) - recCost(r) + r.equip.reduce((s, e) => s + Math.max(0, e.v), 0) + (r.gop || 0), 0) / H.length;
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
  const vay = Math.round((x.gia * (1 - v.truoc)) / 1000) * 1000;
  return { can: x.gia - vay - thuVe, thuVe, vay, gop: gopNgay(vay, v.lai, v.ngay), ngay: v.ngay, lai: v.lai };
}
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
    const khac = Object.entries(d.vay).filter(([k]) => k !== dong).reduce((a, [, v]) => a + v.gop, 0);
    if (khac + t.gop > thuNhapNgay() * DS.gopToiDa) return `Ngân hàng chỉ cho góp tới nửa thu nhập (khoảng ${fmt(Math.max(0, thuNhapNgay() * DS.gopToiDa))}/ngày)`;
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
    `${x.kieu ? `<div class="dshinhto">${x.kieu === "tro" || DS_NHA.includes(x) || x.kieu === "can_ho" ? hinhNha(x) : hinhXe(x)}</div>` : `<div class="pbig">${x.ic}</div>`}<h2>${esc(x.ten)}</h2>${cau ? locDong([cau]).map(dongThoai).join("") : ""}${them ? `<p class="note">${them}</p>` : ""}${x.uuDai ? `<p class="note">${esc(x.uuDai)}</p>` : ""}`,
    [["Tiếp tục", () => refreshPrep(), 1]],
  );
}
/* mua (gop = trả góp); trả true nếu đã mua */
function muaDs(dong, id, gop) {
  const d = dsS();
  if (dong === "do" || dong === "qua") {
    const x = (dong === "do" ? DS_DO : DS_QUA).find((y) => y.id === id);
    if (!x || d[dong][id] || S.money < x.gia) return false;
    S.money -= x.gia;
    d[dong][id] = S.day;
    TT().co["ds_" + id] = true;
    S.cur.equip.push({ n: (dong === "do" ? "Mua " : "Quà: ") + x.ten.toLowerCase(), v: x.gia });
    dsXong(x, dong === "qua" ? ["tin", x.tin] : x.phan);
    return true;
  }
  const x = DS_DONG[dong].find((y) => y.id === id);
  if (!x || dsKhongDuoc(dong, x, gop)) return false;
  const t = dsTinh(dong, x, gop),
    cu = dsMuc(dong) || (dong === "nha" ? null : DS_DONG[dong][0]);
  S.money -= t.can;
  /* ghi sổ theo dòng tiền: tiền trả ngay là chi phí, tiền bán lại đồ cũ (đã trừ nợ) trừ vào chi phí; cọc không ghi */
  if (x.gia) S.cur.equip.push({ n: (t.vay ? "Trả trước " : "") + x.ten, v: x.gia - t.vay });
  if (dong !== "tro" && cu && cu.gia && t.thuVe) S.cur.equip.push({ n: "Bán lại " + cu.ten, v: -t.thuVe });
  if (dong === "nha") d.coc = 0; /* dọn khỏi chỗ thuê, lấy lại cọc (đã tính trong tiền thu về) */
  if (dong === "tro") d.coc = x.coc || 0;
  d[dong] = id;
  if (d.vay[dong]) delete d.vay[dong]; /* nợ món cũ đã trả bằng tiền bán lại */
  if (t.vay) d.vay[dong] = { id, con: t.vay, gop: t.gop, lai: t.lai, ngay: t.ngay };
  dsXong(x, x.phan, t.vay ? `Vay ${fmtBig(t.vay)}, góp ${fmt(t.gop)}/ngày trong ${DS.vay[dong].ten}.` : "");
  return true;
}
/* nhà, ô tô: hỏi lại trước khi mua vì số tiền lớn */
function hoiMuaDs(dong, id, gop) {
  const x = DS_DONG[dong].find((y) => y.id === id),
    t = dsTinh(dong, x, gop);
  ask(
    `<div class="dshinhto">${dong === "nha" ? hinhNha(x) : hinhXe(x)}</div><h2>${esc(x.ten)}</h2><div class="ledger"><div><span>Giá</span><span>${fmtBig(x.gia)}</span></div>${
      t.thuVe ? `<div><span class="wl">${dong === "nha" && !dsNha() ? "Lấy lại cọc chỗ thuê" : "Bán lại " + esc((dsMuc(dong) || {}).ten || "") + (d0(dong) ? " (đã trừ nợ góp)" : "")}</span><span class="pos">−${fmtBig(t.thuVe)}</span></div>` : ""
    }${t.vay ? `<div><span class="wl">Vay ngân hàng ${DS.vay[dong].ten}, lãi ${Math.round(t.lai * 100)}%/năm</span><span class="wl">−${fmtBig(t.vay)}</span></div>` : ""}<div class="tot"><span>Trả ngay</span><span>${fmtBig(t.can)}</span></div>${
      t.vay ? `<div><span>Góp mỗi ngày</span><span>${fmt(t.gop)}</span></div>` : ""
    }</div><p class="note">Mỗi ngày còn tốn ${fmt(x.ngay || 0)} ${dong === "nha" ? "phí quản lý, điện nước" : x.dien ? "sạc, gửi xe, bảo hiểm" : "xăng, gửi xe, bảo hiểm"}.</p>`,
    [
      ["Để sau", () => {}],
      [t.vay ? "Vay và mua" : "Mua", () => setTimeout(() => muaDs(dong, id, gop), 50), 1],
    ],
  );
}
const d0 = (dong) => !!dsS().vay[dong];
/* trả hết nợ góp của một món */
function traHetVay(dong) {
  const v = dsS().vay[dong];
  if (!v || S.money < v.con) return false;
  S.money -= v.con;
  S.cur.equip.push({ n: "Trả hết nợ góp " + ((DS_DONG[dong].find((x) => x.id === v.id) || {}).ten || ""), v: v.con });
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
}

/* ---------- tab Đời sống ---------- */
const dsHinh = (dong, x) => (dong === "tro" || dong === "nha" ? hinhNha(x) : hinhXe(x));
function theDs(dong, x) {
  const dangCo = dong === "tro" ? !dsNha() && dsTro() === x : dsMuc(dong) === x,
    ly = dsKhongDuoc(dong, x, false),
    lyGop = DS.vay[dong] ? dsKhongDuoc(dong, x, true) : "x",
    tGop = DS.vay[dong] && dsTinh(dong, x, true),
    chiTiet = [
      x.dt ? `${x.dt}m² · ${x.pn} phòng ngủ · ${esc(x.khu)}` : x.dong ? esc(x.dong) : "",
      x.gia ? `<b>${fmtBig(x.gia)}</b>` : "",
      x.coc ? "cọc " + fmtBig(x.coc) : "",
      x.ngay ? `${dong === "tro" ? "tiền nhà" : dong === "nha" ? "phí" : x.dien ? "sạc, gửi xe" : "xăng, gửi xe"} ${fmt(x.ngay)}/ngày` : "",
    ].filter(Boolean),
    thap = !dangCo && ["Đã qua", "Rẻ hơn món đang có", "Đã có nhà"].includes(ly);
  let nut;
  if (dangCo) nut = `<span class="okline">✓ ${dong === "tro" || dong === "nha" ? "Đang ở" : "Đang dùng"}</span>`;
  else if (thap) nut = "";
  else if (dong === "nha" || dong === "ot")
    nut = `<button class="sbtn pri" data-dsmua="${dong}:${x.id}" ${ly ? "disabled" : ""}><b>${fmtBig(Math.max(0, dsTinh(dong, x, false).can))}</b>Trả thẳng</button><button class="sbtn" data-dsgop="${dong}:${x.id}" ${lyGop ? "disabled" : ""} title="${esc(lyGop)}"><b>${fmtBig(Math.max(0, tGop.can))}</b>Góp ${fmt(tGop.gop)}/ngày</button>`;
  else nut = `<button class="sbtn pri" data-ds="${dong}:${x.id}" ${ly ? "disabled" : ""}><b>${fmtBig(Math.max(0, dsTinh(dong, x, false).can))}</b>${x.coc ? "Thuê" : "Mua"}</button>`;
  return `<div class="dsthe${thap ? " dsqua" : ""}${dangCo ? " dsdang" : ""}"><div class="dsanh">${dsHinh(dong, x)}</div><div class="dstt"><div class="nm">${esc(x.ten)}</div><div class="sub">${chiTiet.join(" · ")}</div><div class="sub">${esc(x.uuDai || x.mo || "")}</div><div class="dsnut">${nut}</div></div></div>`;
}
function paneDoiSong() {
  const d = dsS(),
    o = dsO(),
    xm = dsXm(),
    ot = dsOt(),
    tn = dsTienNgay(),
    tg = dsTienGop();
  const mot = (ds, dong) =>
    ds
      .map(
        (x) =>
          `<div class="rowi"><span class="icon gopic">${x.ic}</span><div><div class="nm">${esc(x.ten)}</div>${x.uuDai ? `<div class="sub">${esc(x.uuDai)}</div>` : ""}</div>${
            dong === "dt"
              ? dsDt() === x
                ? `<span class="okline">✓ Đang dùng</span>`
                : DS_DT.indexOf(x) < DS_DT.indexOf(dsDt())
                  ? `<span class="wl">Đã qua</span>`
                  : `<button class="sbtn pri" data-ds="dt:${x.id}" ${S.money < dsTinh("dt", x).can ? "disabled" : ""}><b>${fmtBig(dsTinh("dt", x).can)}</b>Mua</button>`
              : d[dong][x.id]
                ? `<span class="okline">✓ Ngày ${d[dong][x.id]}</span>`
                : `<button class="sbtn pri" data-ds="${dong}:${x.id}" ${S.money < x.gia ? "disabled" : ""}><b>${fmtBig(x.gia)}</b>${dong === "qua" ? "Tặng" : "Mua"}</button>`
          }</div>`,
      )
      .join("");
  const vay = Object.entries(d.vay)
    .map(([dong, v]) => {
      const x = DS_DONG[dong].find((y) => y.id === v.id) || {};
      return `<div class="dsvay"><span>Góp ${esc(x.ten || "")}: còn nợ ${fmtBig(v.con)}, ${fmt(v.gop)}/ngày</span><button class="sbtn ghost" data-dstra="${dong}" ${S.money < v.con ? "disabled" : ""}>Trả hết</button></div>`;
    })
    .join("");
  return `<div class="mtcard on dscard"><div class="dsnha"><div class="dsanh">${hinhNha(o)}</div><div class="dsanh">${hinhXe(ot || xm)}</div></div><b>${esc(o.ten)} · ${esc(xm.ten)}${ot ? " · " + esc(ot.ten) : ""}</b><p>${
    tn ? `Mỗi ngày mở tiệm tốn ${fmt(tn)}: ăn uống, ${dsNha() ? "phí nhà" : "tiền nhà"}${xm.ngay || ot ? ", xăng xe" : ""}.` : "Chế độ Thư giãn: không tốn tiền sinh hoạt."
  }${tg ? ` Tiền góp ${fmt(tg)}/ngày.` : ""}</p>${vay}</div>
  <div class="sec">Thuê chỗ ở</div><div class="note">Dọn nhà thì lấy lại cọc chỗ cũ.</div>${DS_TRO.map((x) => theDs("tro", x)).join("")}
  <div class="sec">Mua nhà</div><div class="note">Giá tham khảo ngoài đời. Trả góp: trả trước 30%, vay ${DS.vay.nha.ten}, lãi ${Math.round(DS.vay.nha.lai * 100)}%/năm. Ngân hàng chỉ cho góp tới nửa thu nhập mỗi ngày. Đổi nhà thì bán lại nhà cũ ${Math.round(DS.banLaiNha * 100)}% giá.</div>${DS_NHA.map((x) => theDs("nha", x)).join("")}
  <div class="sec">Xe máy</div><div class="note">Đổi xe thì bán lại xe cũ ${Math.round(DS.banLaiXe * 100)}% giá.</div>${DS_XM.map((x) => theDs("xm", x)).join("")}
  <div class="sec">Ô tô</div><div class="note">Trả góp: trả trước 30%, vay ${DS.vay.ot.ten}, lãi ${Math.round(DS.vay.ot.lai * 100)}%/năm.</div>${DS_OT.map((x) => theDs("ot", x)).join("")}
  <div class="sec">Điện thoại</div>${mot(DS_DT, "dt")}
  <div class="sec">Cho bản thân</div><div class="note">Không có ưu đãi, chỉ là thích.</div>${mot(DS_DO, "do")}
  <div class="sec">Quà cho gia đình</div><div class="note">Ba mẹ ở quê. Quà gửi về thì mẹ nhắn lại.</div>${mot(DS_QUA, "qua")}`;
}
function paneDoiSongVe() {
  $("pane").innerHTML = paneDoiSong();
}
/* đầu ngày (prepChecks): bản lưu 5.0 đã mua nhà xe giá cũ thì báo đã hoàn tiền; trả true nếu đang hỏi */
function dsBaoHoan() {
  dsS();
  if (!S.dsHoan) return false;
  const v = S.dsHoan;
  delete S.dsHoan;
  save();
  head();
  ask(
    `<div class="pbig">🏡</div><h2>Nhà xe theo giá ngoài đời</h2><p>Từ bản 5.1, nhà và xe trong tab Đời sống có tên, diện tích, giá tham khảo như ngoài đời, mua thẳng hoặc trả góp.</p><p>Tiền bạn đã mua nhà xe theo giá cũ được hoàn lại: <b>${fmtBig(v)}</b>.</p>`,
    [["Xem Đời sống", () => ((R.tab = "doisong"), renderPrep()), 1]],
  );
  return true;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-ds], [data-dsmua], [data-dsgop], [data-dstra]");
  if (!b || b.disabled || typeof S === "undefined" || !S) return;
  e.stopPropagation();
  if (b.dataset.dstra) return traHetVay(b.dataset.dstra);
  const [dong, id] = (b.dataset.ds || b.dataset.dsmua || b.dataset.dsgop).split(":");
  if (b.dataset.ds) muaDs(dong, id);
  else hoiMuaDs(dong, id, !!b.dataset.dsgop);
});

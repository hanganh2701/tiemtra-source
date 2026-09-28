/* ---------- TRANG TRÍ TIỆM, GÓP SỨC CHO HẺM 42 VÀ ẢNH KHOE TIỆM ----------
   Dữ liệu ở data/trang-tri.js. Nạp trước game.js. */

const coTri = (id) => !!(S && S.tri && S.tri.includes(id));
const daGop = (id) => !!(S && S.gopHem && S.gopHem[id]);
const triTong = (k) =>
  TRANG_TRI.reduce((a, t) => a + (coTri(t.id) ? t[k] || 0 : 0), 0) + GOP_HEM.reduce((a, d) => a + (daGop(d.id) ? d[k] || 0 : 0), 0);
/* cộng vào hệ số chờ (heSoCho), nhân vào tip và lượng khách (trang trí và việc đã góp cho hẻm) */
const choTri = () => triTong("cho") + (typeof evIs === "function" && evIs("hot") ? triTong("nong") : 0);
const heSoTipTri = () => 1 + triTong("tip");
const heSoKhachTri = () => (1 + triTong("khach")) * (typeof evIs === "function" && evIs("rain") ? 1 + triTong("mua") : 1);

/* mục Trang trí trong tab Trang bị */
function theTrangTri() {
  return (
    `<div class="sec">Trang trí tiệm</div><div class="note">Mua một lần. Mỗi món có ưu đãi nhỏ, hiện trước tiệm và trong ảnh khoe tiệm.</div>` +
    TRANG_TRI.map(
      (t) =>
        `<div class="rowi"><span class="icon"><img class="ico" src="img/tt_${t.id}.svg" alt=""></span><div><div class="nm">${esc(t.ten)}</div><div class="sub">${esc(t.uuDai)}</div></div>${
          coTri(t.id) ? '<span class="okline">✓</span>' : `<button class="sbtn pri" data-tri="${t.id}" ${S.money < t.gia ? "disabled" : ""}><b>${fmt(t.gia)}</b>Mua</button>`
        }</div>`,
    ).join("")
  );
}
function muaTri(id) {
  const t = TRANG_TRI.find((x) => x.id === id);
  if (!t || coTri(id) || S.money < t.gia) return false;
  S.money -= t.gia;
  S.tri = S.tri || [];
  S.tri.push(id);
  S.cur.equip.push({ n: "Trang trí: " + t.ten, v: t.gia });
  save();
  sfx("coin");
  toast(`🪴 Đã trang trí ${t.ten}. ${t.uuDai}`);
  if (typeof track === "function") track("trang-tri-" + id);
  xetHuyHieu();
  return true;
}
/* dải đồ trang trí trước tiệm (màn chuẩn bị), kèm những việc đã góp cho hẻm */
function triDai() {
  const ds = TRANG_TRI.filter((t) => coTri(t.id)),
    gop = GOP_HEM.filter((d) => daGop(d.id)),
    cn = typeof cnLoai === "function" && cnLoai();
  return ds.length || gop.length || cn
    ? `<div class="tridai" aria-label="Trang trí tiệm">${ds.map((t) => `<img src="img/tt_${t.id}.svg" alt="${esc(t.ten)}" title="${esc(t.ten)}">`).join("")}${gop
        .map((d) => `<span class="gopic" role="img" aria-label="${esc(d.ten)}" title="${esc(d.ten)}">${d.ic}</span>`)
        .join("")}${cn ? `<span class="gopic" role="img" aria-label="${esc(cn.ten)}" title="${esc(cn.ten)}">${cn.ic}</span>` : ""}</div>`
    : "";
}

/* ---------- góp sức cho Hẻm 42 ---------- */
const gopMo = (d) =>
  (d.mo.tuNgay == null || S.day >= d.mo.tuNgay) && (!d.mo.xem || TT().xem[d.mo.xem] != null || (d.mo.chot != null && S.day >= d.mo.chot));
function paneGopHem() {
  S.gopHem = S.gopHem || {};
  return (
    `<p class="note">Việc chung của xóm. Góp một lần, có ưu đãi nhỏ cộng với trang trí và hiện trước tiệm.</p>` +
    GOP_HEM.map((d) => {
      const nut = daGop(d.id)
        ? `<span class="okline">✓ Ngày ${S.gopHem[d.id]}</span>`
        : gopMo(d)
          ? `<button class="sbtn pri" data-gop="${d.id}" ${S.money < d.gia ? "disabled" : ""}><b>${fmtBig(d.gia)}</b>Góp</button>`
          : `<span class="wl">${esc(d.goi)}</span>`;
      return `<div class="rowi"><span class="icon gopic">${d.ic}</span><div><div class="nm">${esc(d.ten)}</div><div class="sub">${esc(d.uuDai)}</div></div>${nut}</div>`;
    }).join("")
  );
}
function gopHem(id) {
  const d = GOP_HEM.find((x) => x.id === id);
  if (!d || daGop(id) || !gopMo(d) || S.money < d.gia) return false;
  S.money -= d.gia;
  (S.gopHem = S.gopHem || {})[id] = S.day;
  TT().co["gop_" + id] = true; /* để câu thoại về sau nhắc lại */
  S.cur.equip.push({ n: "Góp hẻm: " + d.ten, v: d.gia });
  save();
  head();
  sfx("coin");
  if (typeof track === "function") track("gop-hem-" + id);
  xetHuyHieu();
  ask(`<div class="pbig">${d.ic}</div><h2>${esc(d.ten)}</h2>${locDong(d.cam).map(dongThoai).join("")}<p class="note">${esc(d.uuDai)}</p>`, [["Tiếp tục", () => refreshPrep(), 1]]);
  return true;
}
/* đầu ngày (prepChecks): việc đầu tiên mở thì bà Sáu rủ góp một lần; trả true nếu đang hỏi */
function moiGopHem() {
  const dau = !S.gopHemMoi && !R.challenge && GOP_HEM.find(gopMo);
  if (!dau) return false;
  S.gopHemMoi = S.day;
  save();
  ask(
    `<div class="pbig">🏘️</div><h2>Góp sức cho Hẻm 42</h2>${dongThoai(["sau", `Xóm mình tính góp tiền ${dau.ru}. Con có góp hông?`])}<p class="note">Tiền dư thì góp cho xóm: mỗi việc có ưu đãi nhỏ và hiện trước tiệm. Xem ở Hẻm 42 › Góp hẻm.</p>`,
    [
      ["Để sau", () => {}],
      [
        "Xem",
        () => {
          R.tab = "hem";
          R.sub = R.sub || {};
          R.sub.hem = HEM_TAB.findIndex((x) => x[1] === paneGopHem);
          renderPrep();
        },
        1,
      ],
    ],
  );
  return true;
}
HEM_TAB.push([() => "🏘️ Góp hẻm", paneGopHem]);
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-gop]");
  if (!b || b.disabled || typeof S === "undefined" || !S) return;
  e.stopPropagation();
  gopHem(b.dataset.gop);
});
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-tri]");
  if (!b || b.disabled || typeof S === "undefined" || !S) return;
  e.stopPropagation();
  if (muaTri(b.dataset.tri)) refreshPrep();
});

/* ---------- ảnh khoe tiệm ---------- */
/* tên món từ khoá "base|flav|tops|cheese" */
function tenMonKhoa(k) {
  const [b, f, tp, ch] = String(k).split("|");
  return [ITEMS[b] && ITEMS[b].n, f && ITEMS[f] && "siro " + low(ITEMS[f].n), ...(tp ? tp.split("+") : []).map((t) => ITEMS[t] && low(ITEMS[t].n)), ch && "kem cheese"]
    .filter(Boolean)
    .join(", ");
}
/* các số liệu in trên ảnh */
function soLieuKhoe() {
  const T = TT();
  return {
    ten: shopName(),
    ngay: S.day,
    chuong: CHUONG_TEN[chuongNay()],
    sao: rating().toFixed(1).replace(".", ","),
    hang: hangMinh(),
    soTiem: bangPhoTra().length,
    trang: T.trang.length,
    huy: Object.keys(S.huyHieu || {}).length,
    mon: tenMonKhoa(monTuHao()),
    khoaMon: monTuHao(),
    tri: TRANG_TRI.filter((t) => coTri(t.id)).map((t) => t.id),
    matTien: buoc() >= 2,
  };
}
/* tải ảnh để vẽ; quá 3 giây thì bỏ qua ảnh đó */
const taiAnh = (src) =>
  new Promise((r) => {
    const i = new Image();
    i.onload = () => r(i);
    i.onerror = () => r(null);
    setTimeout(() => r(null), 3000);
    i.src = src;
  });
function oTron(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
/* chữ vừa khung: thu nhỏ cỡ chữ tới khi vừa */
function chuVua(g, t, x, y, maxW, co, dam) {
  let c = co;
  do {
    g.font = `${dam || 800} ${c}px "Baloo 2", system-ui, sans-serif`;
    c -= 2;
  } while (g.measureText(t).width > maxW && c > 20);
  g.fillText(t, x, y);
}
/* vẽ ly món ruột */
function veLy(g, cx, top, k) {
  const [b, f, tp] = String(k).split("|"),
    mau = (ITEMS[b] && ITEMS[b].c) || "#c8986a",
    tops = tp ? tp.split("+") : [],
    w1 = 190,
    w2 = 150,
    h = 300;
  /* ống hút */
  g.save();
  g.strokeStyle = "#ef6f8e";
  g.lineWidth = 22;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(cx + 20, top + 60);
  g.lineTo(cx + 60, top - 70);
  g.stroke();
  g.restore();
  /* nắp */
  g.fillStyle = "rgba(255,255,255,.9)";
  g.strokeStyle = "#5b3a29";
  g.lineWidth = 8;
  g.beginPath();
  g.ellipse(cx, top + 8, w1 / 2 + 8, 40, 0, Math.PI, 0);
  g.closePath();
  g.fill();
  g.stroke();
  /* thân ly */
  const than = () => {
    g.beginPath();
    g.moveTo(cx - w1 / 2, top + 10);
    g.lineTo(cx + w1 / 2, top + 10);
    g.lineTo(cx + w2 / 2, top + h);
    g.lineTo(cx - w2 / 2, top + h);
    g.closePath();
  };
  g.save();
  than();
  g.clip();
  g.fillStyle = "#fff";
  g.fillRect(cx - w1, top, w1 * 2, h + 20);
  const gr = g.createLinearGradient(0, top + 40, 0, top + h);
  gr.addColorStop(0, f && ITEMS[f] ? ITEMS[f].c : mau);
  gr.addColorStop(1, mau);
  g.fillStyle = gr;
  g.fillRect(cx - w1, top + 40, w1 * 2, h);
  /* topping: trân châu là chấm tròn, thạch là ô vuông */
  tops.forEach((t, i) => {
    const it = ITEMS[t];
    if (!it) return;
    g.fillStyle = it.c || "#3b2a20";
    for (let n = 0; n < 9; n++) {
      const x = cx - w2 / 2 + 18 + ((n * 37 + i * 13) % (w2 - 30)),
        y = top + h - 22 - i * 34 - (n % 3) * 12;
      g.beginPath();
      if (it.g === "tc" || it.g === "pm") g.arc(x, y, 11, 0, Math.PI * 2);
      else g.rect(x - 10, y - 10, 20, 20);
      g.fill();
    }
  });
  g.restore();
  g.strokeStyle = "#5b3a29";
  g.lineWidth = 8;
  than();
  g.stroke();
}
async function veAnhKhoe() {
  const cv = document.createElement("canvas");
  cv.width = 1080;
  cv.height = 1350;
  const g = cv.getContext && cv.getContext("2d");
  if (!g || typeof g.arcTo !== "function" || typeof g.createLinearGradient !== "function") return null;
  try {
    if (document.fonts && document.fonts.load) await Promise.all([document.fonts.load('800 80px "Baloo 2"'), document.fonts.load('600 40px "Baloo 2"')]);
  } catch (e) {}
  const d = soLieuKhoe(),
    [meo, ...tri] = await Promise.all([taiAnh(IMG + "cathead.png"), ...d.tri.map((id) => taiAnh("img/tt_" + id + ".svg"))]);
  /* nền và mái hiên sọc hồng trắng */
  g.fillStyle = "#fdf3e4";
  g.fillRect(0, 0, 1080, 1350);
  for (let x = 0; x < 1080; x += 60) {
    g.fillStyle = (x / 60) % 2 ? "#fff" : "#ef6f8e";
    g.fillRect(x, 0, 60, 70);
    g.beginPath();
    g.arc(x + 30, 70, 30, 0, Math.PI);
    g.fill();
  }
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  /* bảng tên tiệm */
  g.fillStyle = "#fff7e8";
  g.strokeStyle = "#8a5a3b";
  g.lineWidth = 10;
  oTron(g, 90, 140, 900, 150, 30);
  g.fill();
  g.stroke();
  g.fillStyle = "#8a3a50";
  chuVua(g, d.ten, 540, 245, 820, 96);
  g.fillStyle = "#6b4e38";
  g.font = '600 40px "Baloo 2", system-ui, sans-serif';
  g.fillText(`Hẻm 42 · ngày ${d.ngay} · ${d.matTien ? "mặt tiền đầu hẻm" : "Chương " + chuongNay() + " " + d.chuong}`, 540, 350);
  /* thẻ món ruột */
  g.fillStyle = "#fff";
  g.strokeStyle = "#e6d3b8";
  g.lineWidth = 6;
  oTron(g, 70, 390, 940, 520, 40);
  g.fill();
  g.stroke();
  veLy(g, 300, 520, d.khoaMon);
  g.textAlign = "left";
  g.fillStyle = "#c24c69";
  g.font = '800 40px "Baloo 2", system-ui, sans-serif';
  g.fillText("MÓN RUỘT", 500, 500);
  g.fillStyle = "#3b2a20";
  const chu = d.mon.split(", ");
  let y = 570;
  g.font = '800 58px "Baloo 2", system-ui, sans-serif';
  g.fillText(chu[0] || "", 500, y);
  g.font = '600 40px "Baloo 2", system-ui, sans-serif';
  chu.slice(1, 4).forEach((c) => g.fillText("+ " + c, 500, (y += 56)));
  if (meo) g.drawImage(meo, 820, 740, 150, 150);
  /* bốn ô số liệu */
  const o = [
    [d.sao + "★", "đánh giá"],
    ["#" + d.hang, "Phố Trà (" + d.soTiem + " tiệm)"],
    [d.trang + "/12", "trang sổ bà Sáu"],
    [String(d.huy), "huy hiệu"],
  ];
  g.textAlign = "center";
  o.forEach(([so, nhan], i) => {
    const x = 70 + i * 240;
    g.fillStyle = "#fff7e8";
    g.strokeStyle = "#e6d3b8";
    g.lineWidth = 5;
    oTron(g, x, 940, 220, 170, 28);
    g.fill();
    g.stroke();
    g.fillStyle = "#8a3a50";
    chuVua(g, so, x + 110, 1030, 190, 64);
    g.fillStyle = "#6b4e38";
    chuVua(g, nhan, x + 110, 1080, 200, 30, 600);
  });
  /* đồ trang trí */
  const n = tri.filter(Boolean).length;
  tri.filter(Boolean).forEach((im, i) => g.drawImage(im, 540 - (n * 100) / 2 + i * 100 + 5, 1140, 90, 90));
  g.fillStyle = "#a07a5a";
  g.font = '600 32px "Baloo 2", system-ui, sans-serif';
  g.fillText("Tiệm Trà Nhỏ · " + (location.host + location.pathname).replace(/index\.html$/, "").replace(/\/$/, ""), 540, n ? 1300 : 1220);
  return cv;
}
/* chia sẻ một ảnh canvas: Web Share có tệp thì gửi thẳng, không thì hiện ảnh để nhấn giữ lưu hoặc tải */
async function chiaSeAnh(cv, ten, chu, tieuDe) {
  if (!cv) return toast("Máy này chưa vẽ được ảnh", 3000, 1);
  const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
  if (!blob) return toast("Máy này chưa vẽ được ảnh", 3000, 1);
  const file = typeof File === "function" ? new File([blob], ten, { type: "image/png" }) : null;
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: chu });
      return;
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  ask(`<h2>${esc(tieuDe)}</h2><img src="${url}" alt="${esc(tieuDe)}" style="width:100%;border-radius:12px;border:2px solid var(--line)"><p class="note">Nhấn giữ ảnh để lưu hoặc gửi. Trên máy tính bấm Tải ảnh.</p>`, [
    ["Đóng", () => URL.revokeObjectURL(url)],
    [
      "Tải ảnh",
      () => {
        const a = document.createElement("a");
        a.href = url;
        a.download = ten;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      },
      1,
    ],
  ]);
}
const tenTep = (x) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
async function khoeTiem() {
  const d = soLieuKhoe(),
    chu = `Tiệm ${d.ten} 🧋 ngày ${d.ngay} · ${d.sao}★ · hạng ${d.hang} Phố Trà. Ghé tiệm mình trong Tiệm Trà Nhỏ: ${linkQuan()}`;
  if (typeof track === "function") track("khoe-tiem");
  chiaSeAnh(await veAnhKhoe(), "tiem-tra-" + (tenTep(d.ten) || "nho") + ".png", chu, "Ảnh khoe tiệm");
}

/* ---------- ảnh kết quả thử thách hôm nay ---------- */
const MAU_O = ["#4fa883", "#f0b43c", "#e2574c", "#d8cbb8"]; /* chuẩn, tạm, sai, bỏ về: cùng thứ tự với TT_O */
function nenAnh(g) {
  g.fillStyle = "#fdf3e4";
  g.fillRect(0, 0, 1080, 1350);
  for (let x = 0; x < 1080; x += 60) {
    g.fillStyle = (x / 60) % 2 ? "#fff" : "#ef6f8e";
    g.fillRect(x, 0, 60, 70);
    g.beginPath();
    g.arc(x + 30, 70, 30, 0, Math.PI);
    g.fill();
  }
}
async function veAnhThuThach(kq) {
  const cv = document.createElement("canvas");
  cv.width = 1080;
  cv.height = 1350;
  const g = cv.getContext && cv.getContext("2d");
  if (!g || typeof g.arcTo !== "function") return null;
  try {
    if (document.fonts && document.fonts.load) await Promise.all([document.fonts.load('800 80px "Baloo 2"'), document.fonts.load('600 40px "Baloo 2"')]);
  } catch (e) {}
  nenAnh(g);
  g.textAlign = "center";
  g.fillStyle = "#c24c69";
  g.font = '800 44px "Baloo 2", system-ui, sans-serif';
  g.fillText("THỬ THÁCH HÔM NAY · " + ttNgayDep(kq.ngay).toUpperCase(), 540, 170);
  g.fillStyle = "#fff7e8";
  g.strokeStyle = "#8a5a3b";
  g.lineWidth = 10;
  oTron(g, 140, 205, 800, 120, 28);
  g.fill();
  g.stroke();
  g.fillStyle = "#8a3a50";
  chuVua(g, kq.ten || shopName(), 540, 290, 740, 76);
  g.fillStyle = "#3b2a20";
  g.font = '800 170px "Baloo 2", system-ui, sans-serif';
  g.fillText(`${kq.chuan}/${TT_SO}`, 540, 520);
  g.fillStyle = "#6b4e38";
  g.font = '600 44px "Baloo 2", system-ui, sans-serif';
  g.fillText(`ly chuẩn · ${kq.tam} tạm · ${ttGio(kq.giay)}`, 540, 590);
  /* lưới 5 hàng x 8 ô, mỗi ô một khách */
  const o = 96,
    kc = 14,
    x0 = 540 - (8 * o + 7 * kc) / 2,
    y0 = 650;
  kq.kq.forEach((x, i) => {
    g.fillStyle = MAU_O[x.kq] || MAU_O[3];
    oTron(g, x0 + (i % 8) * (o + kc), y0 + Math.floor(i / 8) * (o + kc), o, o, 20);
    g.fill();
  });
  g.font = '600 34px "Baloo 2", system-ui, sans-serif';
  const chu = ["chuẩn", "tạm", "sai", "bỏ về"];
  chu.forEach((c, i) => {
    const x = 170 + i * 250;
    g.fillStyle = MAU_O[i];
    oTron(g, x - 70, 1232, 36, 36, 8);
    g.fill();
    g.fillStyle = "#6b4e38";
    g.textAlign = "left";
    g.fillText(c, x - 22, 1262);
  });
  g.textAlign = "center";
  g.fillStyle = "#a07a5a";
  g.font = '600 32px "Baloo 2", system-ui, sans-serif';
  g.fillText("Chơi rồi so với mình · Tiệm Trà Nhỏ", 540, 1320);
  return cv;
}
async function anhThuThach(kq, ma) {
  if (typeof track === "function") track("anh-thu-thach");
  chiaSeAnh(await veAnhThuThach(kq), "thu-thach-" + kq.ngay + ".png", ttChuChiaSe(kq, ma), "Ảnh thử thách");
}

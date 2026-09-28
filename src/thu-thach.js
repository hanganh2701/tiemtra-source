/* ---------- THỬ THÁCH HÔM NAY ----------
   Mỗi ngày (giờ Việt Nam) mọi người gặp cùng 40 khách, cùng vốn, hàng và menu; không dùng bản lưu nên mod
   sửa tiền không có tác dụng. Chơi xong ra mã chia sẻ; máy người nhận tự tạo lại đề và kiểm chứng mã,
   không cần máy chủ. Nạp trước game.js; chỉ chạy lúc chơi. */

const TT_SO = 40; /* số khách mỗi thử thách */
const TT_CHO = 60; /* giây mỗi khách chịu chờ */
const TT_BASE = ["tra", "matcha", "hong", "luc", "olong"];
const TT_FLAV = [null, "f_dao", "f_vai", "f_dau"];
const TT_TOP = [null, "tcden", "thach", "tcvang", "cunang"];
const TT_SIZE = ["M", "L"];
const TT_O = ["🟩", "🟨", "🟥", "⬜"]; /* chuẩn, tạm, sai rồi bỏ về, bỏ về */

/* số ngẫu nhiên có hạt giống: cùng hạt giống thì mọi máy ra cùng dãy số */
function ttRng(chu) {
  let h = 2166136261;
  for (let i = 0; i < chu.length; i++) h = Math.imul(h ^ chu.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* đề của một ngày: 40 đơn một ly, level 2 (có đường và đá) */
function ttDe(ngay) {
  const r = ttRng("tiemtra-" + ngay),
    pick = (a) => a[Math.floor(r() * a.length)];
  return Array.from({ length: TT_SO }, () => {
    const base = pick(TT_BASE),
      flav = r() < 0.45 ? pick(TT_FLAV.slice(1)) : null,
      top = r() < 0.6 ? pick(TT_TOP.slice(1)) : null;
    return {
      base,
      flav,
      tops: top ? [top] : [],
      cheese: false,
      size: r() < 0.3 ? "L" : "M",
      so: null,
      sugar: pick(SUGAR),
      ice: pick(ICE),
      mat: Math.floor(r() * 9),
    };
  });
}
const ttNgayDep = (ngay) => ngay.slice(8, 10) + "/" + ngay.slice(5, 7);

/* ---------- bắt đầu và kết thúc ---------- */
function ttTrangThaiTam() {
  const t = fresh();
  Object.assign(t, {
    day: 10,
    seenLv: 2,
    coach: false,
    shopName: S.shopName,
    xung: S.xung,
    money: 0,
    ev: null,
    evDay: 10,
    mood: null,
    gift: null,
    badPlan: { start: 10, ev: [] },
    upg: {},
    online: false,
  });
  [...TT_BASE, ...TT_FLAV, ...TT_TOP].filter(Boolean).forEach((k) => (t.unlocked[k] = true));
  Object.keys(ITEMS).forEach((k) => (t.stock[k] = [{ q: 999, exp: 99999 }]));
  return t;
}
function ttBatDau() {
  if (R.running) return;
  const ngay = homNayVN();
  R.challenge = { ngay, de: ttDe(ngay), S0: S, idx: 0, t: 0, lastArr: -99, kq: [], chuan: 0, xong: 0 };
  S = ttTrangThaiTam();
  startDay();
  Object.assign(R, { t: 1e7, starAt: 0, vipDone: true, burstDone: true, bigQ: [], spawnT: 0.5 });
  if (typeof track === "function") track("thu-thach-bat-dau");
  toast("Thử thách " + ttNgayDep(ngay) + ": " + TT_SO + " khách, ai cũng gặp giống nhau. Pha chuẩn càng nhiều càng tốt!", 5000, 1);
  head();
}
/* gọi trong spawn() khi đang thử thách */
function ttSpawn() {
  const C = R.challenge,
    i = R.slots.findIndex((s) => !s);
  if (i < 0 || C.idx >= TT_SO || C.t - C.lastArr < 2) return;
  const o = { ...C.de[C.idx], tops: [...C.de[C.idx].tops] },
    who = o.mat;
  delete o.mat;
  R.slots[i] = {
    tt: C.idx,
    ttDen: C.t,
    born: performance.now(),
    id: ++uid,
    who,
    face: "🙂",
    name: "Khách " + (C.idx + 1),
    say: xungGoi(rnd(PERSONA[who].o)),
    end: rnd(PERSONA[who].e),
    cups: [o],
    done: [false],
    order: o,
    pat: TT_CHO,
    max: TT_CHO,
    wrong: 0,
    paid: 0,
  };
  C.idx++;
  C.lastArr = C.t;
  renderStreet();
  sfx("bell");
}
/* ghi kết quả một khách: 0 chuẩn, 1 tạm, 2 sai rồi bỏ về, 3 bỏ về */
function ttGhi(c, kq) {
  const C = R.challenge;
  if (!C || c.tt == null || C.kq[c.tt]) return;
  C.kq[c.tt] = { kq, den: Math.floor(c.ttDen), xong: Math.floor(C.t), o: kq <= 1 ? c.order : null };
  C.xong++;
  if (kq === 0) C.chuan++;
  head();
}
/* gọi mỗi nhịp tick */
function ttNhip(dt) {
  const C = R.challenge;
  if (!C) return;
  C.t += dt;
  /* kết thúc ngoài nhịp tick để phần còn lại của tick không chạy trên bản lưu thật */
  if (C.idx >= TT_SO && !R.slots.some(Boolean) && !C.het) {
    C.het = true;
    setTimeout(() => ttKetThuc(false), 0);
  }
}
function ttKetThuc(dung) {
  const C = R.challenge;
  if (!C) return;
  clearInterval(timer);
  R.running = false;
  pourSnd(false);
  R.slots.forEach((c) => c && ttGhi(c, c.wrong ? 2 : 3));
  for (let k = 0; k < TT_SO; k++)
    if (!C.kq[k]) C.kq[k] = { kq: 3, den: Math.floor(C.t), xong: Math.floor(C.t), o: null };
  const ma = ttMa(C.ngay, C.S0.shopName || "Tiệm Trà Nhỏ", C.kq, dung),
    kq = ttDoc(ma);
  S = C.S0;
  R.challenge = null;
  S.ttKq = S.ttKq || {};
  const lanDau = !S.ttKq[C.ngay];
  if (lanDau) S.ttKq[C.ngay] = { ma, chuan: kq.chuan, tam: kq.tam, giay: kq.giay };
  ttLuuBang(kq, true);
  save();
  if (typeof track === "function") track("thu-thach-xong");
  R.tab = "hem";
  R.sub = R.sub || {};
  R.sub.hem = HEM_TAB.findIndex((x) => x[1] === paneThuThach);
  renderPrep();
  ttHienKetQua(kq, ma, lanDau);
  setTimeout(() => xetHuyHieu(), 2500);
}

/* ---------- mã chia sẻ ---------- */
const b36 = (n, w) => Math.max(0, Math.min(36 ** w - 1, n)).toString(36).padStart(w, "0");
function ttMa(ngay, ten, kq, dung) {
  const body = kq
    .map((x) => {
      const o = x.o,
        cth = o
          ? [TT_BASE.indexOf(o.base), TT_FLAV.indexOf(o.flav || null), TT_TOP.indexOf(o.tops[0] || null), SUGAR.indexOf(o.sugar), ICE.indexOf(o.ice), TT_SIZE.indexOf(o.size)].join("")
          : "000000";
      return x.kq + cth + b36(x.den, 2) + b36(x.xong, 2);
    })
    .join("");
  const nd = [ngay.replace(/-/g, ""), b64e(new TextEncoder().encode(ten.slice(0, 24))), dung ? "d" : "x", body].join(".");
  return "TT1." + nd + "." + bakHash(nd);
}
/* đọc và kiểm chứng mã; không tin con số điểm nào trong mã, luôn tính lại từ đề */
function ttDoc(ma) {
  const m = String(ma || "").trim().match(/^TT1\.(\d{8})\.([A-Za-z0-9_-]*)\.([dx])\.([0-9a-z]+)\.([0-9a-z]+)$/);
  if (!m) return { hopLe: false, lyDo: "Mã không đúng dạng" };
  const [, nd, tenB, dung, body, chk] = m;
  const ngay = nd.slice(0, 4) + "-" + nd.slice(4, 6) + "-" + nd.slice(6, 8);
  let ten = "?";
  try {
    ten = new TextDecoder().decode(b64d(tenB));
  } catch (e) {}
  const out = { hopLe: false, ngay, ten, chuan: 0, tam: 0, giay: 0, luoi: "", kq: [] };
  if (bakHash([nd, tenB, dung, body].join(".")) !== chk) return { ...out, lyDo: "Mã bị sai hoặc bị sửa" };
  if (body.length !== TT_SO * 11) return { ...out, lyDo: "Mã thiếu dữ liệu" };
  const de = ttDe(ngay),
    ds = [];
  for (let k = 0; k < TT_SO; k++) {
    const s = body.slice(k * 11, k * 11 + 11),
      kq = +s[0],
      c = s.slice(1, 7).split("").map(Number),
      den = parseInt(s.slice(7, 9), 36),
      xong = parseInt(s.slice(9, 11), 36);
    if (!(kq >= 0 && kq <= 3)) return { ...out, lyDo: "Mã sai ở khách " + (k + 1) };
    if (kq <= 1) {
      const d = de[k];
      const dung1 =
        TT_BASE[c[0]] === d.base &&
        TT_FLAV[c[1]] === (d.flav || null) &&
        TT_TOP[c[2]] === (d.tops[0] || null) &&
        SUGAR[c[3]] === d.sugar &&
        ICE[c[4]] === d.ice &&
        TT_SIZE[c[5]] === d.size;
      if (!dung1) return { ...out, lyDo: "Khách " + (k + 1) + " được ghi là pha đúng nhưng công thức không khớp đề" };
      if (xong - den < 3 || xong - den > TT_CHO + 1) return { ...out, lyDo: "Thời gian pha của khách " + (k + 1) + " không hợp lý" };
    }
    ds.push({ kq, den, xong });
  }
  for (let k = 0; k < TT_SO; k++) {
    const x = ds[k];
    if (k && x.den < ds[k - 1].den + 1) return { ...out, lyDo: "Khách " + (k + 1) + " tới sớm hơn luật cho phép" };
    const dangCho = ds.slice(0, k).filter((y) => y.den <= x.den && y.xong > x.den).length;
    if (dangCho > 2) return { ...out, lyDo: "Quầy chỉ có 3 chỗ, mã có quá nhiều khách cùng lúc" };
    if (x.kq === 3 && dung === "x" && x.xong - x.den < TT_CHO - 2)
      return { ...out, lyDo: "Khách " + (k + 1) + " bỏ về sớm hơn luật cho phép" };
  }
  const chuan = ds.filter((x) => x.kq === 0).length,
    tam = ds.filter((x) => x.kq === 1).length,
    giay = Math.max(...ds.map((x) => x.xong)),
    luoi = [0, 1, 2, 3, 4].map((r) => ds.slice(r * 8, r * 8 + 8).map((x) => TT_O[x.kq]).join("")).join("\n");
  return { ...out, hopLe: true, chuan, tam, giay, luoi, kq: ds };
}
const ttGio = (g) => Math.floor(g / 60) + ":" + String(g % 60).padStart(2, "0");
const ttLink = (ma) => location.origin + location.pathname + "#c=" + ma;
function ttChuChiaSe(kq, ma) {
  return `Tiệm Trà Nhỏ 🧋 Thử thách ${ttNgayDep(kq.ngay)}\n${kq.chuan}/${TT_SO} ly chuẩn · ${kq.tam} tạm · ${ttGio(kq.giay)}\n${kq.luoi}\nChơi rồi so với mình: ${ttLink(ma)}`;
}
async function chiaSe(chu, tieuDe) {
  try {
    if (navigator.share) {
      await navigator.share({ title: tieuDe || "Tiệm Trà Nhỏ", text: chu });
      return true;
    }
  } catch (e) {
    if (e && e.name === "AbortError") return false;
  }
  try {
    await navigator.clipboard.writeText(chu);
    toast("Đã chép, dán vào nhóm Zalo hoặc Messenger nhé");
    return true;
  } catch (e) {}
  return false;
}
function ttHienKetQua(kq, ma, lanDau) {
  const chu = ttChuChiaSe(kq, ma);
  ask(
    `<div class="pbig">${ico("trophy")}</div><h2>Thử thách ${ttNgayDep(kq.ngay)}</h2><p class="ttdiem"><b>${kq.chuan}/${TT_SO}</b> ly chuẩn</p><p>${kq.tam} ly tạm · ${ttGio(kq.giay)}</p><pre class="ttluoi">${kq.luoi}</pre><p class="note">${
      lanDau ? "Đây là kết quả chính thức hôm nay." : "Hôm nay bạn đã có kết quả chính thức, lượt này chỉ để luyện tay."
    } 🟩 chuẩn · 🟨 tạm · 🟥 sai · ⬜ bỏ về</p><textarea id="ttChu" class="rpin" readonly style="min-height:80px;font-size:12px!important">${esc(chu)}</textarea>`,
    [
      ["Để sau", () => {}],
      ["Chia sẻ ảnh", () => anhThuThach(kq, ma)],
      ["Chia sẻ kết quả", () => chiaSe(chu, "Thử thách Tiệm Trà Nhỏ"), 1],
    ],
  );
}

/* ---------- bảng bạn bè trên máy ---------- */
function ttLuuBang(kq, cuaMinh) {
  if (!kq.hopLe) return false;
  S.bb = S.bb || {};
  const ds = (S.bb[kq.ngay] = S.bb[kq.ngay] || []),
    ten = cuaMinh ? "Bạn" : kq.ten,
    cu = ds.find((x) => x.ten === ten && !!x.minh === !!cuaMinh);
  const dong = { ten, chuan: kq.chuan, tam: kq.tam, giay: kq.giay, minh: !!cuaMinh };
  if (cu) {
    if (cuaMinh) return false; /* kết quả chính thức của mình không bị ghi đè bằng lượt luyện */
    Object.assign(cu, dong);
  } else ds.push(dong);
  /* chỉ giữ 14 ngày gần nhất */
  Object.keys(S.bb)
    .sort()
    .slice(0, -14)
    .forEach((k) => delete S.bb[k]);
  return true;
}
function ttNhapMa(ma) {
  const kq = ttDoc(ma);
  if (!kq.hopLe) {
    toast("⚠️ " + (kq.lyDo || "Mã không đọc được"), 4000, 1);
    return false;
  }
  ttLuuBang(kq, false);
  save();
  toast(`✅ Đã kiểm chứng: ${kq.ten} ${kq.chuan}/${TT_SO} ly chuẩn ngày ${ttNgayDep(kq.ngay)}`, 4000, 1);
  return true;
}
const ttXep = (a, b) => b.chuan - a.chuan || b.tam - a.tam || a.giay - b.giay;
function paneThuThach() {
  const ngay = homNayVN(),
    minh = (S.ttKq || {})[ngay],
    hom = [...((S.bb || {})[ngay] || [])].sort(ttXep);
  /* tuần này: cộng ly chuẩn của mỗi người qua 7 ngày gần nhất */
  const tuan = {};
  Object.entries(S.bb || {})
    .filter(([d]) => cachNgayLich(ngay, d) < 7)
    .forEach(([, ds]) =>
      ds.forEach((x) => {
        const k = x.minh ? "Bạn" : x.ten;
        tuan[k] = tuan[k] || { ten: k, chuan: 0, ngay: 0, minh: x.minh };
        tuan[k].chuan += x.chuan;
        tuan[k].ngay++;
      }),
    );
  const dongBang = (x, i) =>
    `<div class="crow${x.minh ? " minh" : ""}"><span>${i + 1}. ${esc(x.ten)}</span><span>${x.chuan}/${TT_SO}${x.giay != null ? " · " + ttGio(x.giay) : " · " + x.ngay + " ngày"}</span></div>`;
  return `<div class="ttcard"><b>Thử thách ${ttNgayDep(ngay)}</b><p>${TT_SO} khách giống nhau cho mọi người, cùng vốn và menu. Không ảnh hưởng tiệm của bạn.</p>${
    minh ? `<p class="ttdiem"><b>${minh.chuan}/${TT_SO}</b> ly chuẩn · ${minh.tam} tạm · ${ttGio(minh.giay)}</p>` : ""
  }<div class="askbtns"><button class="big" id="ttGo">${minh ? "Chơi lại để luyện tay" : "Bắt đầu thử thách"}</button>${
    minh ? '<button class="sbtn ghost" id="ttShare">Chia sẻ kết quả</button><button class="sbtn ghost" id="ttAnh">Chia sẻ ảnh</button>' : ""
  }</div></div>
  <div class="sec">Bảng hôm nay</div>${hom.length ? hom.map(dongBang).join("") : '<p class="note">Chưa có ai. Chơi xong rồi rủ bạn bè dán mã vào đây.</p>'}
  <div class="sec">Tuần này</div>${
    Object.values(tuan).length
      ? Object.values(tuan)
          .sort((a, b) => b.chuan - a.chuan)
          .map(dongBang)
          .join("")
      : '<p class="note">Cộng ly chuẩn của 7 ngày gần nhất.</p>'
  }
  <div class="sec">Thêm kết quả của bạn bè</div><textarea id="ttMaBan" class="rpin" placeholder="Dán link hoặc mã TT1… bạn gửi" style="min-height:60px;font-size:12px!important"></textarea><div class="askbtns"><button class="sbtn ghost" id="ttNhap">Kiểm chứng và thêm vào bảng</button></div>
  <p class="note">Mã chứa công thức từng ly và thời gian. Máy bạn tự tạo lại đề và kiểm tra, mã bịa hoặc bị sửa sẽ bị từ chối.</p>`;
}
function ttGan() {
  if ($("ttGo")) $("ttGo").onclick = () => ttBatDau();
  if ($("ttShare"))
    $("ttShare").onclick = () => {
      const m = S.ttKq[homNayVN()];
      chiaSe(ttChuChiaSe(ttDoc(m.ma), m.ma), "Thử thách Tiệm Trà Nhỏ");
    };
  if ($("ttAnh"))
    $("ttAnh").onclick = () => {
      const m = S.ttKq[homNayVN()];
      anhThuThach(ttDoc(m.ma), m.ma);
    };
  if ($("ttNhap"))
    $("ttNhap").onclick = () => {
      const v = $("ttMaBan").value,
        ma = (v.match(/TT1\.[^\s#&]+/) || [v])[0];
      if (ttNhapMa(ma)) renderPrep();
    };
}

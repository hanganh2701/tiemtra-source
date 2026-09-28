/* Mô phỏng tiền trong két qua 70 ngày để cân bằng.
   Hai kiểu người chơi máy:
   - nhanh (mặc định, dùng để so các nhánh truyện): sáng nào cũng nấu đủ hàng, pha đúng mọi ly ngay khi khách chờ đủ vài giây,
     kể cả đơn nhiều ly; không mua gì, không thuê nhân viên, không ra mặt tiền. Nhanh hơn người thật nhiều.
   - nguoi (giống người chơi thật): mỗi lúc chỉ pha một ly, mỗi ly mất vài giây (thuê phụ quầy thì nhanh hơn),
     tự mua trang bị, trang trí, góp hẻm, ra mặt tiền, mở chi nhánh, sắm đời sống (nhà, xe, quà), thuê Linh, nhân viên pha chế và nhân viên đơn online, mua tablet khi mở online.
   Chạy: node tools/mo-phong-kinh-te.mjs            (các kịch bản nhánh truyện, kiểu nhanh)
         node tools/mo-phong-kinh-te.mjs 2          (chỉ kịch bản nhánh số 2)
         node tools/mo-phong-kinh-te.mjs nguoi      (người chơi giỏi và người chơi vừa, kiểu nguoi)
         node tools/mo-phong-kinh-te.mjs nguoi 1    (chỉ kịch bản người chơi số 1) */
import { boot } from "../tests/harness.mjs";

const doi = (ms) => new Promise((r) => setTimeout(r, ms));
const CHO_GIAY = 6; /* kiểu nhanh: phục vụ khi khách đã chờ bấy nhiêu giây */

/* kiểu nguoi: một người pha lần lượt từng ly; nhân viên pha chế của game tự làm phần của mình */
const NGUOI = `
window.__ng = { dang: null, ban: 0 };
const __giayLy = (g) => g * (S.upg.staff1 || S.upg.staff3 ? 0.7 : 1) * (S.upg.sealer ? 0.9 : 1) * (0.8 + Math.random() * 0.4);
function __lamLyNguoi(o) {
  cup = newCup(); cup.size = o.size; useCup();
  [o.base, ...(o.flav ? [o.flav] : []), ...o.tops].forEach((k) => { if (qty(k)) consume(k); });
  Object.assign(cup, { base: o.base, flav: o.flav || null, tops: [...o.tops], cheese: !!o.cheese, sugar: o.sugar, ice: o.ice, fill: 0.8, used: true });
}
function __nguoiNhip(giay) {
  const N = window.__ng;
  const tim = () => {
    const quay = R.slots.filter((x) => x && !(R.st2 && R.st2.id === x.id) && x.max - x.pat >= 1.5).sort((a, b) => a.pat - b.pat);
    if (quay[0]) return { loai: "quay", id: quay[0].id };
    if (!S.upg.staffOn && R.online.length) return { loai: "online", id: R.online[0].id };
    return null;
  };
  if (!N.dang) {
    N.dang = tim();
    if (!N.dang) return;
    if (N.dang.loai === "quay") R.focus = N.dang.id;
    N.ban = __giayLy(giay);
    return;
  }
  N.ban -= 0.1;
  if (N.ban > 0) return;
  if (N.dang.loai === "quay") {
    const i = R.slots.findIndex((x) => x && x.id === N.dang.id), c = R.slots[i];
    if (!c || (R.st2 && R.st2.id === c.id)) return (N.dang = null);
    const o = c.cups[c.done.indexOf(false)];
    if (!o) return (N.dang = null);
    if (!needs(o).every((k) => qty(k) > 0)) { decline(i); return (N.dang = null); }
    __lamLyNguoi(o);
    serve(i);
    if (R.slots[i] === c) N.ban = __giayLy(giay); else N.dang = null;
  } else {
    const j = R.online.findIndex((x) => x.id === N.dang.id), c = R.online[j];
    if (!c) return (N.dang = null);
    const o = c.cups[c.done.indexOf(false)];
    if (!o) return (N.dang = null);
    if (!needs(o).every((k) => qty(k) > 0)) { declineOnline(j); return (N.dang = null); }
    __lamLyNguoi(o);
    serveOnline(j);
    if (R.online[j] === c) N.ban = __giayLy(giay); else N.dang = null;
  }
}
/* sáng: mua như người chơi, luôn chừa một khoản để nấu hàng */
function __muaSam(kieu) {
  const chua = 900000, mua = (gia) => S.money >= gia + chua && ((S.money -= gia), true), ghi = (n, v) => S.cur.equip.push({ n, v });
  ["sign", "seats", "slot4", "ads", "ac", "sealer"].forEach((id) => { const u = UPG.find((x) => x.id === id); if (!S.upg[id] && mua(u.cost)) { S.upg[id] = true; ghi(u.n, u.cost); window.__muaNgay[id] = S.day; } });
  if (kieu.matTien && buoc() < 2 && dkMatTien().every((x) => x.ok) && mua(tienCoc() + MAT_TIEN.trangTri)) {
    S.coc = tienCoc(); S.buoc = 2; S.hd = { bd: S.day, gia: MAT_TIEN.thue }; ghi("Mặt tiền", tienCoc() + MAT_TIEN.trangTri); window.__muaNgay.matTien = S.day;
  }
  const thue = (id) => { const u = STAFF.find((x) => x.id === id); if (!S.upg[id] && mua(u.cost)) { S.upg[id] = true; (S.hired = S.hired || {})[id] = true; nvThue(id); ghi(u.n, u.cost); window.__muaNgay[id] = S.day; } };
  if (kieu.nv && TT().co.linh_lam) thue("staff1");
  if (kieu.nv && S.day >= 30 && buoc() >= 2) thue("staff2");
  if (kieu.nv && S.online) thue("staffOn");
  if (S.online && !(S.tablets > 0) && mua(CFG.tablet)) { S.tablets = 1; ghi("Tablet", CFG.tablet); window.__muaNgay.tablet = S.day; }
  if (typeof TRANG_TRI !== "undefined") TRANG_TRI.forEach((t) => { if (!coTri(t.id) && mua(t.gia)) { (S.tri = S.tri || []).push(t.id); ghi(t.ten, t.gia); } });
  if (!S.upg.brandKit && S.upg.sealer && mua(BRAND_COST)) { S.upg.brandKit = true; ghi("Thương hiệu", BRAND_COST); window.__muaNgay.brand = S.day; }
  if (kieu.cn && typeof moChiNhanh === "function" && !S.cn && dkChiNhanh().every((x) => x.ok) && S.money >= cnTien(CN_LOAI.find((x) => x.id === kieu.cn)) + chua && moChiNhanh(kieu.cn)) { window.__muaNgay.chiNhanh = S.day; $("modal").hidden = true; }
  /* đời sống: mua dần khi dư, chừa 5 triệu; không mua đồ đắt cho bản thân */
  if (kieu.ds && typeof muaDs === "function") {
    const du = (gia) => S.money >= gia + 5000000;
    [["xe", "xe_so"], ["o", "tro_rieng"], ["dt", "dt_tot"], ["qua", "qua_ao_dai"], ["qua", "qua_dong_ho"], ["do", "dong_ho"], ["xe", "xe_ga"],
     ["o", "can_ho_thue"], ["dt", "dt_xin"], ["qua", "qua_may_giat"], ["qua", "qua_du_lich"], ["xe", "o_to_cu"], ["qua", "qua_mai_nha"],
     ["o", "can_ho"], ["xe", "o_to"], ["o", "nha_hem"]].forEach(([loai, id]) => {
      const ds = loai === "do" ? DS_DO : loai === "qua" ? DS_QUA : DS_DONG[loai], x = ds.find((y) => y.id === id);
      const can = loai === "do" || loai === "qua" ? x.gia : dsCan(loai, x);
      if (du(can) && muaDs(loai, id)) { window.__muaNgay[id] = S.day; $("modal").hidden = true; }
    });
  }
  if (typeof GOP_HEM !== "undefined") GOP_HEM.forEach((d) => { if (!daGop(d.id) && gopMo(d) && mua(d.gia)) { (S.gopHem = S.gopHem || {})[d.id] = S.day; ghi(d.ten, d.gia); window.__muaNgay[d.id] = S.day; } });
}`;

async function choi(ten, chon, kieu = {}, soNgay = kieu.ngay || 70) {
  const g = boot();
  const t0 = Date.now();
  try {
    g.run(`closeSplash(); S.shopName = "Mô phỏng"; S.tr = { che: "tat" }; S.coach = false; S.bakOff = true;
      window.__chon = ${JSON.stringify(chon)}; window.__muaNgay = {};
      /* ngã rẽ: chọn thẳng nhánh đã định, không hiện hộp thoại */
      const goc = hienCanh;
      hienCanh = (m, xong, xl) => {
        if (m.reRe && !xl) {
          const ds = m.luaChon, k = Object.keys(ds[0].nhanh)[0];
          const moi = apDung(m, ds[__chon[k] || 0]);
          return hienTrangMoi(moi, xong);
        }
        return goc(m, xong, xl);
      };`);
    if (kieu.giay) g.run(NGUOI);
    const ngay = [];
    for (let d = 1; d <= soNgay * 2 && g.run("S.day") <= soNgay; d++) {
      for (let k = 0; k < 6; k++) {
        g.run("__closeDialogs(12); prepChecks(); __closeDialogs(12)");
        await doi(2);
      }
      if (kieu.giay) g.run(`__muaSam(${JSON.stringify(kieu)})`);
      /* nấu hàng: bù cho đủ mức, hoặc hơn hôm qua dùng một chút như người thật nhìn cột "hôm qua dùng";
         nhánh bắt tay Mây Tea nấu dư trân châu cho đơn sỉ */
      g.run(`(() => {
        const muc = (k) => Math.max(k === "cup" ? 90 : ITEMS[k].type === "base" ? 30 : 25, Math.ceil(((S.used || {})[k] || 0) * 1.25)) + (k === "tcden" && nhanhMay() === "A" ? 30 : 0);
        R.plan = {};
        [...BASE_KEYS, ...TOP_KEYS, "cup"].forEach((k) => { if ((k === "cup" || S.unlocked[k]) && qty(k) < muc(k)) R.plan[k] = muc(k) - qty(k); });
        while (planTotal() > S.money && Object.keys(R.plan).length) { const k = Object.keys(R.plan)[0]; R.plan[k] = Math.floor(R.plan[k] / 2); if (!R.plan[k]) delete R.plan[k]; }
        if (Object.keys(R.plan).length && planTotal() <= S.money) cook();
      })()`);
      const truoc = g.run("S.day");
      g.run("truyenLuc('mo_cua', () => { startDay(); clearInterval(timer); })");
      for (let k = 0; k < 20 && !g.run("R.running") && g.run("S.day") === truoc; k++) {
        g.run("__closeDialogs(1)");
        await doi(420);
      }
      if (!g.run("R.running")) {
        /* ngày nghỉ (về quê): cảnh nghỉ kế tiếp tự hiện */
        await doi(450);
        g.run("__closeDialogs(12)");
        ngay.push({ ngay: truoc, tien: g.run("S.money"), nghi: true });
        continue;
      }
      if (kieu.giay) g.run("window.__ng = { dang: null, ban: 0 }");
      for (let n = 0; n < 20000 && g.run("R.running"); n++) {
        g.run(
          kieu.giay
            ? `tick(); if (R.paused && typeof resumeGame === "function") resumeGame(); __nguoiNhip(${kieu.giay})`
            : `tick(); if (R.paused && typeof resumeGame === "function") resumeGame();
          R.slots.forEach((c, i) => { if (c && c.max - c.pat >= ${CHO_GIAY}) __serveSlot(i); })`,
        );
      }
      const x = JSON.parse(
        g.run("JSON.stringify((() => { const r = S.history[S.history.length - 1]; return { rev: recRev(r), cost: recCost(r), ban: R.today.served, mat: R.today.lost, het: R.today.soldLost || 0 }; })())"),
      );
      g.run("__closeDialogs(12)");
      await doi(5);
      ngay.push({ ngay: truoc, tien: g.run("S.money"), rev: x.rev, loi: x.rev - x.cost, ban: x.ban, mat: x.mat, het: x.het });
    }
    const T = JSON.parse(g.run("JSON.stringify({ nhanh: TT().nhanh, trang: TT().trang.length, ket: (TT().ket || {}).id, mua: window.__muaNgay, sao: +rating().toFixed(2), hang: hangMinh() })"));
    return { ten, chon, ngay, T, err: g.errors.map(String), giay: Math.round((Date.now() - t0) / 1000) };
  } finally {
    g.close();
  }
}
const tb = (ds, a, b, k) => {
  const x = ds.filter((d) => d.ngay >= a && d.ngay <= b && !d.nghi);
  return x.length ? Math.round(x.reduce((s, d) => s + (d[k] || 0), 0) / x.length / (["ban", "mat", "het"].includes(k) ? 1 : 1000)) : 0;
};
const tienNgay = (ds, n) => {
  const x = ds.filter((d) => d.ngay <= n).pop();
  return x ? Math.round(x.tien / 1000) : "–";
};

const KICH_BAN = [
  ["Mây Tea bắt tay · Hana ghi tên · Tết ở lại", { linh: 1, hana: 0, may: 0, tet: 1 }],
  ["Mây Tea bắt tay · Hana giữ kín · Tết ở lại", { linh: 1, hana: 1, may: 0, tet: 1 }],
  ["Giữ hẻm · Hana ghi tên · Tết ở lại", { linh: 1, hana: 0, may: 1, tet: 1 }],
  ["Giữ hẻm · Hana giữ kín · Tết ở lại", { linh: 1, hana: 1, may: 1, tet: 1 }],
  ["Giữ hẻm · Hana giữ kín · Tết về quê", { linh: 1, hana: 1, may: 1, tet: 0 }],
  ["Mây Tea bắt tay · Hana ghi tên · Tết về quê", { linh: 1, hana: 0, may: 0, tet: 0 }],
];
/* kiểu nguoi: Linh ở lại (để thuê Linh), giữ hẻm, Hana ghi tên, ở lại Tết */
const NGUOI_CHOI = [
  ["Người chơi giỏi (7 giây mỗi ly), mặt tiền, thuê người, chi nhánh gần trường, sắm đời sống", { giay: 7, matTien: true, nv: true, cn: "truong", ds: true }],
  ["Người chơi vừa (11 giây mỗi ly), mặt tiền, thuê người, chi nhánh gần trường, sắm đời sống", { giay: 11, matTien: true, nv: true, cn: "truong", ds: true }],
  ["Người chơi giỏi (7 giây mỗi ly), ở trong hẻm, không thuê", { giay: 7 }],
  ["Người chơi giỏi, mặt tiền, thuê người, chi nhánh văn phòng, Hana giữ kín", { giay: 7, matTien: true, nv: true, cn: "vp" }, { hana: 1 }],
  ["Người chơi giỏi 100 ngày, mặt tiền, chi nhánh gần trường, sắm đời sống", { giay: 7, matTien: true, nv: true, cn: "truong", ds: true, ngay: 100 }],
];
const arg = process.argv[2];
if (arg === "nguoi") {
  console.log("Nghìn đồng. Két theo ngày · lãi trung bình mỗi ngày bán · ly bán và khách mất mỗi ngày\n");
  for (const [ten, kieu, doi] of NGUOI_CHOI.filter((x, i) => !process.argv[3] || String(i) === process.argv[3])) {
    const kq = await choi(ten, { linh: 0, hana: 0, may: 1, tet: 1, ...doi }, kieu);
    const n = kq.ngay;
    console.log(`${ten}  (${kq.giay}s, ${kq.T.trang} trang, kết ${kq.T.ket || "–"}, cuối cùng ${kq.T.sao}★ hạng ${kq.T.hang} Phố Trà)`);
    console.log(`  két: ${[10, 20, 30, 40, 50, 60, 70, 85, 100].filter((d) => d <= (kieu.ngay || 70)).map((d) => `ngày${d} ${tienNgay(n, d)}`).join(" · ")}`);
    console.log(`  lãi/ngày: 1–20 ${tb(n, 1, 20, "loi")} · 21–40 ${tb(n, 21, 40, "loi")} · 41–60 ${tb(n, 41, 60, "loi")} · 61–70 ${tb(n, 61, 70, "loi")}`);
    console.log(`  ly/ngày: 1–20 ${tb(n, 1, 20, "ban")} · 21–40 ${tb(n, 21, 40, "ban")} · 41–70 ${tb(n, 41, 70, "ban")} (46–55 ${tb(n, 46, 55, "ban")})   khách mất/ngày: 21–40 ${tb(n, 21, 40, "mat")} · 41–70 ${tb(n, 41, 70, "mat")} (vì hết hàng ${tb(n, 41, 70, "het")})`);
    console.log(`  mua (ngày): ${Object.entries(kq.T.mua || {}).map(([k, v]) => k + " " + v).join(", ") || "–"}`);
    if (kq.err.length) console.log("  LỖI:", kq.err.slice(0, 3));
  }
} else {
  const chi = arg ? KICH_BAN.filter((k, i) => String(i) === arg) : KICH_BAN;
  console.log("Nghìn đồng. Két ngày 30/50/60/70 · lãi và doanh thu trung bình mỗi ngày bán theo giai đoạn\n");
  for (const [ten, chon] of chi) {
    const kq = await choi(ten, chon);
    const n = kq.ngay;
    console.log(`${ten}  (${kq.giay}s, nhánh ${JSON.stringify(kq.T.nhanh)}, ${kq.T.trang} trang, kết ${kq.T.ket || "–"})`);
    console.log(`  két: ngày30 ${tienNgay(n, 30)} · ngày50 ${tienNgay(n, 50)} · ngày60 ${tienNgay(n, 60)} · ngày70 ${tienNgay(n, 70)}`);
    console.log(`  lãi/ngày: 31–50 ${tb(n, 31, 50, "loi")} · 51–60 ${tb(n, 51, 60, "loi")} · 61–70 ${tb(n, 61, 70, "loi")}   doanh thu/ngày 51–60 ${tb(n, 51, 60, "rev")}`);
    if (kq.err.length) console.log("  LỖI:", kq.err.slice(0, 3));
  }
}
process.exit(0);

/* Mô phỏng tiền trong két qua 70 ngày cho từng tổ hợp ngã rẽ, để cân bằng các nhánh.
   Người chơi máy: sáng nào cũng nấu đủ hàng (trả tiền như người thật), pha đúng mọi ly sau khi khách chờ vài giây,
   không thuê nhân viên, không ra mặt tiền, không nhận đơn app.
   Chạy: node tools/mo-phong-kinh-te.mjs          (tất cả kịch bản)
         node tools/mo-phong-kinh-te.mjs 2        (chỉ kịch bản số 2) */
import { boot } from "../tests/harness.mjs";

const doi = (ms) => new Promise((r) => setTimeout(r, ms));
const CHO_GIAY = 6; /* phục vụ khi khách đã chờ bấy nhiêu giây */

async function choi(ten, chon, soNgay = 70) {
  const g = boot();
  const t0 = Date.now();
  try {
    g.run(`closeSplash(); S.shopName = "Mô phỏng"; S.tr = { che: "tat" }; S.coach = false;
      window.__chon = ${JSON.stringify(chon)};
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
    const ngay = [];
    for (let d = 1; d <= soNgay * 2 && g.run("S.day") <= soNgay; d++) {
      for (let k = 0; k < 6; k++) {
        g.run("__closeDialogs(12); prepChecks(); __closeDialogs(12)");
        await doi(2);
      }
      /* nấu hàng: bù cho đủ mức; nhánh bắt tay Mây Tea nấu dư trân châu cho đơn sỉ */
      g.run(`(() => {
        const muc = (k) => (k === "cup" ? 90 : ITEMS[k].type === "base" ? 30 : 25) + (k === "tcden" && nhanhMay() === "A" ? 30 : 0);
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
      for (let n = 0; n < 20000 && g.run("R.running"); n++) {
        g.run(`tick(); if (R.paused && typeof resumeGame === "function") resumeGame();
          R.slots.forEach((c, i) => { if (c && c.max - c.pat >= ${CHO_GIAY}) __serveSlot(i); })`);
      }
      const x = JSON.parse(g.run("JSON.stringify((() => { const r = S.history[S.history.length - 1]; return { rev: recRev(r), cost: recCost(r) }; })())"));
      g.run("__closeDialogs(12)");
      await doi(5);
      ngay.push({ ngay: truoc, tien: g.run("S.money"), rev: x.rev, loi: x.rev - x.cost });
    }
    const T = JSON.parse(g.run("JSON.stringify({ nhanh: TT().nhanh, trang: TT().trang.length, ket: (TT().ket || {}).id })"));
    return { ten, chon, ngay, T, err: g.errors.map(String), giay: Math.round((Date.now() - t0) / 1000) };
  } finally {
    g.close();
  }
}
const tb = (ds, a, b, k) => {
  const x = ds.filter((d) => d.ngay >= a && d.ngay <= b && !d.nghi);
  return x.length ? Math.round(x.reduce((s, d) => s + (d[k] || 0), 0) / x.length / 1000) : 0;
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
const chi = process.argv[2] ? KICH_BAN.filter((k, i) => String(i) === process.argv[2]) : KICH_BAN;
console.log("Nghìn đồng. Két ngày 30/50/60/70 · lãi và doanh thu trung bình mỗi ngày bán theo giai đoạn\n");
for (const [ten, chon] of chi) {
  const kq = await choi(ten, chon);
  const n = kq.ngay;
  console.log(`${ten}  (${kq.giay}s, nhánh ${JSON.stringify(kq.T.nhanh)}, ${kq.T.trang} trang, kết ${kq.T.ket || "–"})`);
  console.log(`  két: ngày30 ${tienNgay(n, 30)} · ngày50 ${tienNgay(n, 50)} · ngày60 ${tienNgay(n, 60)} · ngày70 ${tienNgay(n, 70)}`);
  console.log(`  lãi/ngày: 31–50 ${tb(n, 31, 50, "loi")} · 51–60 ${tb(n, 51, 60, "loi")} · 61–70 ${tb(n, 61, 70, "loi")}   doanh thu/ngày 51–60 ${tb(n, 51, 60, "rev")}`);
  if (kq.err.length) console.log("  LỖI:", kq.err.slice(0, 3));
}
process.exit(0);

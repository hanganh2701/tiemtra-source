/* Test thử thách hôm nay, mã chia sẻ, Phố Trà, danh thiếp tiệm, giá app. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const doi = (ms) => new Promise((r) => setTimeout(r, ms));

/* chơi hết thử thách hôm nay, pha đúng mọi ly */
async function choiThuThach(g) {
  g.run("ttBatDau(); clearInterval(timer)");
  for (let n = 0; n < 2000 && g.run("!!R.challenge"); n++) {
    g.run("tick()");
    g.run("R.slots.forEach((c, i) => { if (c && c.tt != null && (R.challenge.t - c.ttDen) > 4) __serveSlot(i); })");
    if (n % 50 === 0) await doi(1);
  }
  await doi(5);
}

test("đề thử thách giống nhau trên mọi máy trong cùng ngày, khác ngày thì khác", () => {
  const a = boot(), b = boot();
  try {
    const d1 = a.run("JSON.stringify(ttDe('2026-09-28'))");
    assert.equal(d1, b.run("JSON.stringify(ttDe('2026-09-28'))"));
    assert.notEqual(d1, a.run("JSON.stringify(ttDe('2026-09-29'))"));
    assert.equal(a.run("ttDe('2026-09-28').length"), 40);
  } finally {
    a.close();
    b.close();
  }
});

test("chơi thử thách không đụng tiệm thật, ra kết quả chính thức và mã hợp lệ", async () => {
  const g = boot();
  try {
    g.run("S.day = 17; S.money = 1234000; save()");
    const truoc = g.w.localStorage.getItem("tsShop2");
    await choiThuThach(g);
    assert.equal(g.run("R.challenge"), null);
    assert.equal(g.run("S.day"), 17);
    assert.equal(g.run("S.money"), 1234000);
    const kq = g.run("S.ttKq[homNayVN()]");
    assert.equal(kq.chuan, 40);
    const doc = g.run(`ttDoc(${JSON.stringify(kq.ma)})`);
    assert.equal(doc.hopLe, true, doc.lyDo);
    assert.equal(doc.chuan, 40);
    assert.equal(JSON.parse(g.w.localStorage.getItem("tsShop2")).money, JSON.parse(truoc).money);
    assert.match(g.w.document.getElementById("card").textContent, /40\/40/);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("mã thử thách bị sửa hoặc bịa bị từ chối", async () => {
  const g = boot();
  try {
    await choiThuThach(g);
    const ma = g.run("S.ttKq[homNayVN()].ma");
    /* sửa một chữ số công thức mà không tính lại mã kiểm tra */
    const parts = ma.split(".");
    const body = parts[4];
    const sua = body.slice(0, 1) + ((+body[1] + 1) % 5) + body.slice(2);
    assert.equal(g.run(`ttDoc(${JSON.stringify([...parts.slice(0, 4), sua, parts[5]].join("."))}).hopLe`), false);
    /* bịa mã có mã kiểm tra đúng nhưng công thức sai */
    const bia = g.run(`(() => { const p = ${JSON.stringify(parts)}; const b = p[4].slice(0, 1) + ((+p[4][1] + 1) % 5) + p[4].slice(2); const nd = [p[1], p[2], p[3], b].join("."); return "TT1." + nd + "." + bakHash(nd); })()`);
    assert.match(g.run(`ttDoc(${JSON.stringify(bia)}).lyDo`), /không khớp đề/);
    /* bịa 40 ly chuẩn cùng lúc: vượt 3 chỗ ở quầy */
    const dong = g.run(`(() => { const de = ttDe(homNayVN()); const body = de.map((o) => "0" + [TT_BASE.indexOf(o.base), TT_FLAV.indexOf(o.flav || null), TT_TOP.indexOf(o.tops[0] || null), SUGAR.indexOf(o.sugar), ICE.indexOf(o.ice), TT_SIZE.indexOf(o.size)].join("") + "0005").join(""); const nd = [homNayVN().replace(/-/g, ""), b64e(new TextEncoder().encode("Gian")), "x", body].join("."); return "TT1." + nd + "." + bakHash(nd); })()`);
    assert.equal(g.run(`ttDoc(${JSON.stringify(dong)}).hopLe`), false);
  } finally {
    g.close();
  }
});

test("dán mã bạn bè: vào bảng hôm nay, mã không hợp lệ thì báo lý do", async () => {
  const a = boot();
  let ma;
  try {
    a.run("S.shopName = 'Quán Bạn'; save()");
    await choiThuThach(a);
    ma = a.run("S.ttKq[homNayVN()].ma");
  } finally {
    a.close();
  }
  const b = boot();
  try {
    assert.equal(b.run(`ttNhapMa(${JSON.stringify(ma)})`), true);
    const ds = b.run("S.bb[homNayVN()]");
    assert.equal(ds[0].ten, "Quán Bạn");
    assert.equal(b.run("ttNhapMa('TT1.xyz')"), false);
    b.run("R.tab = 'hem'; R.sub = { hem: 4 }; renderPrep()");
    assert.match(b.w.document.getElementById("pane").innerHTML, /Quán Bạn/);
  } finally {
    b.close();
  }
});

test("mở game bằng link kết quả: hỏi thêm vào bảng, đã kiểm chứng", async () => {
  const a = boot();
  let ma;
  try {
    await choiThuThach(a);
    ma = a.run("S.ttKq[homNayVN()].ma");
  } finally {
    a.close();
  }
  const b = boot({ url: "http://localhost/#c=" + ma });
  try {
    b.run("closeSplash()");
    await doi(1000);
    assert.match(b.w.document.getElementById("card").textContent, /Đã kiểm chứng/);
    assert.equal(b.w.location.hash, "");
  } finally {
    b.close();
  }
});

test("danh thiếp tiệm: đọc lại được, bạn vào Phố Trà và ghé làm khách VIP, sổ vẫn khớp két", () => {
  const a = boot();
  let ma;
  try {
    a.run("S.shopName = 'Quán Mây'; S.day = 20; S.tr = { mon: { 'tra||tcden|': 30 } }");
    ma = a.run("maQuan()");
    assert.equal(a.run(`docMaQuan(${JSON.stringify(ma)}).ten`), "Quán Mây");
    assert.equal(a.run(`docMaQuan(${JSON.stringify(ma.slice(0, -1) + "z")})`), null);
  } finally {
    a.close();
  }
  const b = boot();
  try {
    assert.equal(b.run(`nhapMaQuan(${JSON.stringify(ma)})`), true);
    assert.ok(b.run("bangPhoTra().some((x) => x.ten === 'Quán Mây')"));
    b.run("__openDay(); R.slots = R.slots.map(() => null); spawnBan(0, S.banBe[0])");
    assert.equal(b.run("R.slots[0].name"), "Chủ tiệm Quán Mây");
    const m0 = b.run("S.money"), r0 = b.run("recRev(S.cur)");
    b.run("R.slots[0].pat = R.slots[0].max; __serveSlot(0)");
    assert.equal(b.run("S.money") - m0, b.run("recRev(S.cur)") - r0);
    assert.equal(b.run("S.banGhe[S.banBe[0].id]"), b.run("S.day"));
  } finally {
    b.close();
  }
});

test("Phố Trà: có tiệm máy, tiệm mình, hạng và điểm cần để vượt", () => {
  const g = boot();
  try {
    g.run("S.day = 35");
    const bang = g.run("bangPhoTra()");
    assert.ok(bang.length >= 9);
    assert.ok(bang.some((x) => x.minh));
    assert.ok(bang.some((x) => x.id === "may"));
    g.run("R.tab = 'hem'; R.sub = { hem: 5 }; renderPrep()");
    assert.match(g.w.document.getElementById("pane").innerHTML, /Phố Trà · hạng/);
  } finally {
    g.close();
  }
});

test("giá trên app: phụ thu ghi riêng trong sổ, tiền vào két khớp doanh thu trừ phí sàn", () => {
  const g = boot();
  try {
    g.run("__openDay(); S.appMk = 20; const o = genOrder(); o.so = null; R.online = [mkOnline(APPS[0], [o])]");
    const m0 = g.run("S.money"), r0 = g.run("recRev(S.cur)"), f0 = g.run("S.cur.fee");
    g.run(`(() => { const c = R.online[0], o = c.cups[0]; cup = newCup(); cup.size = o.size; useCup();
      [o.base, ...(o.flav ? [o.flav] : []), ...o.tops].forEach((k) => { if (!qty(k)) addStock(k, 5); consume(k); });
      Object.assign(cup, { base: o.base, flav: o.flav || null, tops: [...o.tops], cheese: !!o.cheese, sugar: o.sugar, ice: o.ice, fill: 0.8, used: true });
      serveOnline(0); })()`);
    const dm = g.run("S.money") - m0, dr = g.run("recRev(S.cur)") - r0, df = g.run("S.cur.fee") - f0;
    assert.ok(g.run("S.cur.sales.app.a") > 0);
    assert.equal(Math.round(dm + df), dr);
    assert.equal(g.run("CFG.commission"), 25);
  } finally {
    g.close();
  }
});

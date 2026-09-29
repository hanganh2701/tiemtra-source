/* Test bản 5.3: sửa sau 8 lượt chơi thử theo nhiều hướng. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const doi = (ms) => new Promise((r) => setTimeout(r, ms));
const card = (g) => g.w.document.getElementById("card");

test("thử thách đóng cửa sớm: mã vẫn hợp lệ, khách chưa tới ghi nối tiếp nhau cách 2 giây", async () => {
  const g = boot();
  try {
    g.run("ttBatDau(); clearInterval(timer)");
    for (let n = 0; n < 400 && g.run("!!R.challenge"); n++) {
      g.run("tick()");
      g.run("R.slots.forEach((c, i) => { if (c && c.tt != null && (R.challenge.t - c.ttDen) > 4) __serveSlot(i); })");
      if (n % 50 === 0) await doi(1);
    }
    assert.ok(g.run("!!R.challenge"), "còn đang chơi, chưa hết khách");
    g.run("ttKetThuc(true)");
    await doi(5);
    const kq = g.run("S.ttKq[homNayVN()]");
    assert.ok(kq, "đóng sớm vẫn có kết quả chính thức");
    const doc = g.run(`ttDoc(${JSON.stringify(kq.ma)})`);
    assert.equal(doc.hopLe, true, doc.lyDo);
    const den = doc.kq.map((x) => x.den);
    assert.ok(den.every((d, k) => !k || d >= den[k - 1] + 2), "giờ tới tăng dần, cách ít nhất 2 giây");
  } finally {
    g.close();
  }
});

test("mã thử thách có khách tới cách nhau 1 giây bị từ chối, cách 2 giây thì được", () => {
  const g = boot();
  try {
    const ma = (buoc) =>
      g.run(`ttMa(homNayVN(), "Lan", Array.from({ length: TT_SO }, (_, k) => ({ kq: 3, den: k * ${buoc}, xong: k * ${buoc}, o: null })), true)`);
    assert.equal(g.run(`ttDoc(${JSON.stringify(ma(1))}).hopLe`), false);
    assert.equal(g.run(`ttDoc(${JSON.stringify(ma(2))}).hopLe`), true);
  } finally {
    g.close();
  }
});

test("bảng tuần của thử thách ghi tổng ly chuẩn, không ghi kiểu 55/40", () => {
  const g = boot();
  try {
    g.run("S.bb = { [homNayVN()]: [{ ten: 'Lan', chuan: 30, tam: 5, giay: 200 }], '2000-01-01': [] }");
    g.run("R.tab = 'hem'; R.sub = { hem: HEM_TAB.findIndex((x) => x[1] === paneThuThach) }; renderPrep()");
    const txt = g.w.document.getElementById("pane").textContent;
    assert.match(txt, /Tuần này.*Lan30 ly chuẩn · 1 ngày/s);
  } finally {
    g.close();
  }
});

test("danh thiếp tiệm: nhận bạn theo mã riêng, cập nhật không trùng, hai tiệm cùng tên vẫn giữ cả hai, xoá được", () => {
  const a = boot(),
    c = boot(),
    b = boot();
  try {
    a.run("S.shopName = 'Tiệm Trà Nhỏ'; S.day = 20");
    c.run("S.shopName = 'Tiệm Trà Nhỏ'; S.day = 25");
    const ma1 = a.run("maQuan()"),
      maC = c.run("maQuan()");
    assert.equal(b.run(`nhapMaQuan(${JSON.stringify(ma1)})`), true);
    assert.equal(b.run(`nhapMaQuan(${JSON.stringify(maC)})`), true);
    assert.equal(b.run("S.banBe.length"), 2, "hai tiệm khác nhau cùng tên");
    /* a đổi tên, gửi lại danh thiếp: b cập nhật chứ không thêm dòng mới */
    a.run("S.shopName = 'Quán Mây'; S.day = 40");
    assert.equal(b.run(`nhapMaQuan(${JSON.stringify(a.run("maQuan()"))})`), true);
    assert.equal(b.run("S.banBe.length"), 2);
    assert.ok(b.run("S.banBe.some((x) => x.ten === 'Quán Mây' && x.ngay === 40)"));
    /* danh thiếp của chính mình thì không thêm */
    assert.equal(a.run(`nhapMaQuan(${JSON.stringify(a.run("maQuan()"))})`), false);
    /* xoá bạn trong tab Phố Trà */
    b.run("R.tab = 'hem'; R.sub = { hem: HEM_TAB.findIndex((x) => x[1] === panePhoTra) }; renderPrep()");
    const nut = b.w.document.querySelectorAll("[data-xoaban]");
    assert.equal(nut.length, 2);
    nut[0].click();
    assert.equal(b.run("S.banBe.length"), 1);
    assert.deepEqual(b.errors.map(String), []);
  } finally {
    a.close();
    b.close();
    c.close();
  }
});

test("danh thiếp bản cũ (không có mã riêng) vẫn đọc được, gửi lại thì thay theo tên", () => {
  const g = boot();
  try {
    const cu = g.run(`(() => { const body = b64e(new TextEncoder().encode(JSON.stringify({ v: 1, n: "Quán Cũ", d: 9, r: 4.5, m: "tra||tcden|", p: 40 }))); return "QN1." + body + "." + bakHash(body); })()`);
    assert.equal(g.run(`nhapMaQuan(${JSON.stringify(cu)})`), true);
    const cu2 = g.run(`(() => { const body = b64e(new TextEncoder().encode(JSON.stringify({ v: 1, n: "Quán Cũ", d: 15, r: 4.6, m: "tra||tcden|", p: 50 }))); return "QN1." + body + "." + bakHash(body); })()`);
    assert.equal(g.run(`nhapMaQuan(${JSON.stringify(cu2)})`), true);
    assert.equal(g.run("S.banBe.length"), 1);
    assert.equal(g.run("S.banBe[0].ngay"), 15);
  } finally {
    g.close();
  }
});

test("huy hiệu Top 3 Phố Trà chỉ từ ngày 7; gửi về quê đủ 6 lần có huy hiệu", () => {
  const g = boot();
  try {
    g.run("S.day = 3");
    assert.equal(g.run("HUY_HIEU.find((h) => h.id === 'top3').dk(S.kl || {}, TT())"), false);
    assert.equal(g.run("HUY_HIEU.find((h) => h.id === 'top1').dk(S.kl || {}, TT())"), false);
    g.run("dsS().guiThang = 5");
    assert.equal(g.run("HUY_HIEU.find((h) => h.id === 'gui_6').dk(S.kl || {}, TT())"), false);
    g.run("dsS().guiThang = 6");
    assert.equal(g.run("HUY_HIEU.find((h) => h.id === 'gui_6').dk(S.kl || {}, TT())"), true);
  } finally {
    g.close();
  }
});

test("phá sản: giữ mã tiệm và danh sách như Hẻm 42 lần nữa, bỏ cờ nhà xe, tiền gửi, chi nhánh của tiệm cũ", () => {
  const g = boot();
  try {
    g.run("S.shopName = 'Quán Phá'; S.maTiem = 'abc12345'; S.tr = { khat: { 0: true }, trang: [1], than: {}, co: { c0_meo: 'vuot', ds_wave: true, gui_da: true, chi_nhanh: true } }; S.gopY = { hoi: 1 }; __openDay(); S.money = 1000; closeEarly()");
    const saved = JSON.parse(g.w.localStorage.getItem("tsShop2"));
    assert.equal(saved.day, 1);
    assert.equal(saved.maTiem, "abc12345");
    assert.deepEqual(saved.gopY, { hoi: 1 });
    assert.equal(saved.tr.co.c0_meo, "vuot");
    assert.equal(saved.tr.co.ds_wave, undefined);
    assert.equal(saved.tr.co.gui_da, undefined);
    assert.equal(saved.tr.co.chi_nhanh, undefined);
  } finally {
    g.close();
  }
});

test("giá cả ly: tăng giá topping, hương, size L cũng làm khách vắng; size L ít người chọn dần theo phụ thu", () => {
  const g = boot();
  try {
    g.run("S.day = 30; [...BASE_KEYS, ...FLAV_KEYS, ...TOP_KEYS].forEach((k) => (S.unlocked[k] = true)); S.sell = { ...DEF_SELL }");
    assert.ok(Math.abs(g.run("giaTB()") - 1) < 1e-9);
    const k0 = g.run("traffic()");
    g.run("[...FLAV_KEYS, ...TOP_KEYS].forEach((k) => (S.sell[k] = Math.round(DEF_SELL[k] * 1.3))); S.sell.L = Math.round(DEF_SELL.L * 1.3)");
    const i = g.run("giaTB()");
    assert.ok(i > 1.05 && i < 1.2, "chỉ tăng phần thêm thì giá cả ly tăng vừa phải: " + i);
    assert.ok(g.run("traffic()") < k0 * 0.97, "khách vắng hơn");
    /* size L: đúng giá gợi ý khoảng 1/3 ly; phụ thu gấp đôi còn một nửa; quá 15k thì hầu như không ai */
    g.run("S.sell.L = DEF_SELL.L");
    assert.ok(Math.abs(g.run("lChance()") - 0.35) < 1e-9);
    g.run("S.sell.L = DEF_SELL.L * 2");
    assert.ok(Math.abs(g.run("lChance()") - 0.175) < 1e-9);
    g.run("S.sell.L = 16000");
    assert.equal(g.run("lChance()"), 0.035);
    /* phụ thu L gấp đôi không lãi hơn đáng kể so với giá gợi ý */
    const thuL = (L) => g.run(`(S.sell.L = ${L}, lChance() * S.sell.L)`);
    assert.ok(thuL(14000) <= thuL(7000) * 1.05);
  } finally {
    g.close();
  }
});

test("khách bỏ đi vì phần thêm đắt tăng dần theo mức đắt, tối đa 80%; ly hơi đắt không được khen rẻ", () => {
  const g = boot();
  try {
    g.run("S.day = 30; S.unlocked.tcden = true; S.sell = { ...DEF_SELL }");
    const o = JSON.stringify({ base: "tra", flav: null, tops: ["tcden"], cheese: false, size: "M" });
    g.run("S.sell.tcden = Math.ceil(DEF_SELL.tcden * 1.31)");
    const a = g.run(`tiLeBoDiGia(${o})`);
    g.run("S.sell.tcden = DEF_SELL.tcden * 2");
    const b = g.run(`tiLeBoDiGia(${o})`);
    assert.ok(a >= 0.25 && a < 0.3, "vừa chạm mức đắt: " + a);
    assert.ok(b > a + 0.2, "đắt gấp đôi thì nhiều người bỏ hơn: " + b);
    g.run("S.sell.tra = 100000");
    assert.equal(g.run(`tiLeBoDiGia(${o})`), 0.8);
    /* ly hơi đắt (dear): không chọn câu khen giá rẻ */
    assert.equal(g.run("reviewFits('Giá hợp lý, sẽ quay lại', 'great', { rf: { dear: true } })"), false);
    assert.equal(g.run("reviewFits('Giá hợp lý, sẽ quay lại', 'great', { rf: {} })"), true);
  } finally {
    g.close();
  }
});

test("bản lưu cũ để giá cao: trước lần mở cửa đầu hỏi một lần, chọn về giá gợi ý", () => {
  let saved;
  const a = boot();
  try {
    a.run("S.day = 20; BASE_KEYS.forEach((k) => S.unlocked[k] && (S.sell[k] = Math.round(DEF_SELL[k] * 1.4))); save()");
    const d = JSON.parse(a.w.localStorage.getItem("tsShop2"));
    delete d.soV53;
    saved = JSON.stringify(d);
  } finally {
    a.close();
  }
  const b = boot({ storage: { tsShop2: saved } });
  try {
    assert.equal(b.run("S.giaHoi"), 1);
    b.run("R.cookAt = -1e9; tryOpen()");
    assert.match(card(b).textContent, /Khách giờ nhìn giá cả ly/);
    [...card(b).querySelectorAll("button")].find((x) => /Về giá gợi ý/.test(x.textContent)).click();
    assert.equal(b.run("BASE_KEYS.every((k) => S.sell[k] === DEF_SELL[k])"), true);
    assert.equal(b.run("S.giaHoi"), undefined);
    assert.deepEqual(b.errors.map(String), []);
  } finally {
    b.close();
  }
  /* bản lưu mới thì không hỏi */
  const c = boot();
  try {
    assert.equal(c.run("S.giaHoi"), undefined);
  } finally {
    c.close();
  }
});

test("mở bản lưu cũ: đồ đời sống ghi trong trang bị được tách sang chi tiêu, lợi nhuận tích luỹ cộng lại khoản đó", () => {
  let saved;
  const a = boot();
  try {
    a.run("S.day = 12; S.history = [newRec(11)]; S.history[0].equip = [{ n: 'Mua Honda Wave Alpha', v: 22500000 }, { n: 'Máy lạnh 1,5 HP', v: 12000000 }]; S.totalProfit = -30000000; save()");
    const d = JSON.parse(a.w.localStorage.getItem("tsShop2"));
    delete d.soV53;
    saved = JSON.stringify(d);
  } finally {
    a.close();
  }
  const b = boot({ storage: { tsShop2: saved } });
  try {
    assert.equal(b.run("S.history[0].equip.map((e) => e.n).join('|')"), "Máy lạnh 1,5 HP");
    assert.equal(b.run("S.history[0].caNhan.map((e) => e.n).join('|')"), "Mua Honda Wave Alpha");
    assert.equal(b.run("S.totalProfit"), -30000000 + 22500000);
    assert.equal(b.run("S.soV53"), 1);
  } finally {
    b.close();
  }
  /* mở lại lần nữa không tách hay cộng lần hai */
  let lai;
  const c = boot({ storage: { tsShop2: saved } });
  try {
    c.run("save()");
    lai = c.w.localStorage.getItem("tsShop2");
  } finally {
    c.close();
  }
  const e = boot({ storage: { tsShop2: lai } });
  try {
    assert.equal(e.run("S.totalProfit"), -30000000 + 22500000);
  } finally {
    e.close();
  }
});

test("Thư giãn ghi đủ những gì được miễn", () => {
  const g = boot();
  try {
    g.run("S.thuGian = true; showSettings()");
    assert.match(g.w.document.getElementById("sRelax").textContent, /không thuế, không tiền sinh hoạt/);
  } finally {
    g.close();
  }
});

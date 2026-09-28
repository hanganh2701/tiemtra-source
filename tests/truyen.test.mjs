/* Test cốt truyện Hẻm 42. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const card = (g) => g.w.document.getElementById("card");
const modalOpen = (g) => !g.w.document.getElementById("modal").hidden;
const click = (g, sel) => {
  const el = card(g).querySelector(sel);
  assert.ok(el, "không thấy nút " + sel);
  el.click();
};

test("ngày 1: cảnh bà Sáu hiện trước khi mở cửa, lựa chọn đặt cờ rồi mới bán", () => {
  const g = boot();
  try {
    g.run("window.__open = 0; truyenLuc('mo_cua', () => window.__open++)");
    assert.ok(modalOpen(g));
    assert.match(card(g).textContent, /Bà Sáu/);
    assert.equal(g.run("__open"), 0);
    click(g, "#trNext");
    click(g, "#trNext");
    click(g, '[data-ch="0"]');
    click(g, "#trOk");
    assert.equal(g.run("__open"), 1);
    assert.equal(g.run("S.tr.co.c0_meo"), "vuot");
    assert.equal(g.run("S.tr.than.sau"), 1);
    assert.equal(g.run("S.tr.xem.c0_chia_khoa"), 1);
  } finally {
    g.close();
  }
});

test("mỗi ngày tối đa một cảnh, cảnh đã xem không lặp lại", () => {
  const g = boot();
  try {
    g.run("S.tr = { che: 'tat' }; truyenLuc('mo_cua'); window.__n = 0; truyenLuc('mo_cua', () => __n++)");
    assert.equal(g.run("__n"), 1);
    assert.equal(g.run("Object.keys(S.tr.xem).length"), 1);
  } finally {
    g.close();
  }
});

test("bỏ qua: áp lựa chọn đầu, hiện tóm tắt", () => {
  const g = boot();
  try {
    g.run("truyenLuc('mo_cua')");
    click(g, "#trSkip");
    assert.equal(g.run("S.tr.co.c0_meo"), "vuot");
    assert.match(g.w.document.getElementById("toast").textContent, /Bà Sáu giao chìa khoá/);
  } finally {
    g.close();
  }
});

test("chế độ Tắt: không hiện cảnh nhưng vẫn nhận trang sổ công thức", () => {
  const g = boot();
  try {
    g.run("S.day = 6; S.tr = { che: 'tat', xem: { c0_chia_khoa: 1, c0_chu_tu: 2, c0_khoa: 3, c0_me: 4, c0_co_hanh: 5 } }; truyenLuc('mo_cua')");
    assert.deepEqual([...g.run("S.tr.trang")], [1]);
    assert.match(card(g).textContent, /Trang 1: Trà ủ đủ lâu/);
  } finally {
    g.close();
  }
});

test("cảnh sau giờ đóng cửa tính theo ngày vừa bán", () => {
  const g = boot();
  try {
    g.run("S.day = 5; S.tr = { che: 'tat', xem: { c0_chia_khoa: 1, c0_chu_tu: 2, c0_khoa: 3 } }; truyenLuc('dong_cua')");
    assert.equal(g.run("S.tr.xem.c0_me"), 4);
  } finally {
    g.close();
  }
});

test("khách gọi người chơi theo anh hoặc chị", () => {
  const g = boot();
  try {
    assert.equal(g.run("xungGoi('Chị ơi, cho em')"), "Chị ơi, cho em");
    g.run("S.xung = 'anh'");
    assert.equal(g.run("xungGoi('Chị ơi, cho em')"), "Anh ơi, cho em");
    assert.equal(g.run("thayTen('{Ban} ơi, {ban} khoẻ hông')"), "Anh ơi, anh khoẻ hông");
  } finally {
    g.close();
  }
});

test("khách quen: ghé quầy với bảng tên, phục vụ tốt thì thân thêm, bỏ về thì hẹn lần sau", () => {
  const g = boot();
  try {
    g.run("S.day = 5; __openDay(); R.slots = R.slots.map(() => null); spawnQuen(0, 'khoa')");
    assert.equal(g.run("R.slots[0].reg"), "khoa");
    assert.equal(g.run("R.slots[0].who"), g.run("NHAN_VAT.khoa.mat"));
    assert.match(g.w.document.getElementById("q3say").innerHTML, /♥ Khoa/);
    g.run("R.slots[0].pat = R.slots[0].max; __serveSlot(0)");
    assert.equal(g.run("S.tr.lan.khoa"), 1);
    assert.equal(g.run("S.tr.ghe.khoa"), 5);
    assert.ok(g.run("S.tr.than.khoa") >= 0);
    g.run("spawnQuen(1, 'tu'); R.slots[1].pat = 0; tick()");
    assert.equal(g.run("S.tr.ghe.tu"), 5);
    assert.equal(g.run("sapGhe('tu', 6)"), false);
    assert.equal(g.run("sapGhe('tu', 7)"), true);
  } finally {
    g.close();
  }
});

test("đủ thân thì khách quen kể chuyện sau giờ đóng cửa", () => {
  const g = boot();
  try {
    g.run("S.day = 12; S.tr = { che: 'tat', than: { khoa: 2 }, xem: { c0_chia_khoa: 1, c0_chu_tu: 2, c0_khoa: 3, c0_me: 4, c0_co_hanh: 5, c0_tien_nha: 6 } }; truyenLuc('dong_cua')");
    assert.equal(g.run("S.tr.xem.khoa_1"), 11);
  } finally {
    g.close();
  }
});

test("tab Hẻm 42 hiện khách quen, sổ công thức, sổ tay, kỷ lục; thẻ Ngày mai gợi ý", () => {
  const g = boot();
  try {
    g.run("S.day = 4; S.tr = { lan: { tu: 2 }, than: { tu: 3 }, trang: [1], xem: { c0_chia_khoa: 1 } }; R.tab = 'hem'; renderPrep()");
    const html = g.w.document.getElementById("pane").innerHTML;
    assert.match(html, /Chú Tư/);
    assert.match(html, /Trang 1: Trà ủ đủ lâu/);
    assert.match(html, /Bà Sáu giao chìa khoá/);
    assert.match(html, /Ngày doanh thu cao nhất/);
    assert.match(g.run("ngayMaiHTML()"), /Ngày mai/);
  } finally {
    g.close();
  }
});

test("quà mở khoá: ngày 2 có hồng trà miễn phí; bản lưu cũ đã qua mốc không bị dồn quà", () => {
  const g = boot();
  try {
    g.run("S.day = 2; S.unlocked.hong = false");
    assert.equal(g.run("quaMoKhoa()"), true);
    assert.equal(g.run("S.unlocked.hong"), true);
    assert.match(g.w.document.getElementById("card").textContent, /Quà ngày 2/);
    g.run("S.day = 50; S.tr = {}");
    assert.equal(g.run("quaMoKhoa()"), false);
  } finally {
    g.close();
  }
});

test("món đặc trưng khi đủ 12 trang: thêm 10k, sổ vẫn khớp két", () => {
  const g = boot();
  try {
    g.run("S.tr = { trang: [1,2,3,4,5,6,7,8,9,10,11,12] }; ['hong','f_vai','cunang'].forEach((k) => { S.unlocked[k] = true; addStock(k, 50); }); __openDay()");
    const o = "({ base: 'hong', flav: 'f_vai', tops: ['cunang'], cheese: false, size: 'M', sugar: null, ice: null })";
    assert.equal(g.run(`laDacTrung(${o})`), true);
    assert.equal(g.run(`price(${o}) - price(${o}, S.sell) + 0`), 0);
    const i = g.run("__fillSlot()");
    g.run(`R.slots[${i}].cups = [${o}]; R.slots[${i}].done = [false]; R.slots[${i}].order = R.slots[${i}].cups[0]; R.slots[${i}].brat = null; R.slots[${i}].star = null`);
    const m0 = g.run("S.money"), r0 = g.run("recRev(S.cur)");
    g.run(`__serveSlot(${i})`);
    assert.equal(g.run("S.money") - m0, g.run("recRev(S.cur)") - r0);
    assert.equal(g.run("S.cur.sales.dactrung.a"), 10000);
  } finally {
    g.close();
  }
});

test("những ngày đầu chưa có khách khó chiều, chưa có lời mời vay ngân hàng", () => {
  const g = boot();
  try {
    g.run("S.day = 5");
    for (let n = 0; n < 50; n++) assert.equal(g.run("pickBrat()"), null);
    g.run("S.money = 1000");
    assert.doesNotMatch(g.run("loanCard()"), /Két sắp cạn/);
    g.run("S.day = 10");
    assert.match(g.run("loanCard()"), /Két sắp cạn/);
  } finally {
    g.close();
  }
});

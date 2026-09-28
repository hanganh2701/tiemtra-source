/* Test mốc 4: chế độ Thư giãn, thành tích, mục tiêu tuần, trang trí, thẻ khoe tiệm, lời mời cài. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

test("chế độ Thư giãn: khách không bỏ về, không khách khó, không sự cố, không thuế", () => {
  const g = boot();
  try {
    g.run("S.day = 20; S.thuGian = true; __openDay(); clearInterval(timer); R.slots = R.slots.map(() => null); spawn()");
    const i = g.run("R.slots.findIndex(Boolean)");
    assert.ok(i >= 0);
    for (let n = 0; n < 400; n++) g.run("tick()");
    assert.ok(g.run(`R.slots[${i}] && R.slots[${i}].pat > 0`), "khách vẫn đứng chờ");
    assert.ok(g.run(`R.slots[${i}].pat`) >= g.run(`R.slots[${i}].max * CHO_THU_GIAN`) - 1e-9);
    for (let n = 0; n < 200; n++) assert.equal(g.run("pickBrat()"), null);
    /* sự cố tới hạn: đánh dấu đã qua, không trừ tiền */
    g.run("S.badPlan = mkBadPlan(1); S.badPlan.ev.forEach((e) => (e.d = S.day)); S.money = 5000000");
    for (let n = 0; n < 20; n++) assert.equal(g.run("badCheck()"), false);
    assert.equal(g.run("S.money"), 5000000);
    assert.ok(g.run("S.badPlan.ev.filter((e) => e.d <= S.day).every((e) => e.done)"));
    /* tắt thì khách lại bỏ về */
    g.run("S.thuGian = false");
    for (let n = 0; n < 2000 && g.run(`!!R.slots[${i}]`); n++) g.run("tick()");
    assert.equal(g.run(`R.slots[${i}]`), null);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("chế độ Thư giãn không áp vào thử thách hôm nay", () => {
  const g = boot();
  try {
    g.run("S.thuGian = true; ttBatDau(); clearInterval(timer)");
    assert.equal(g.run("thuGian()"), false);
  } finally {
    g.close();
  }
});

test("huy hiệu: khoảng 40 cái, id không trùng, phục vụ khách đầu tiên thì có huy hiệu", () => {
  const g = boot();
  try {
    const n = g.run("HUY_HIEU.length");
    assert.ok(n >= 40, "có " + n);
    assert.equal(g.run("new Set(HUY_HIEU.map((h) => h.id)).size"), n);
    /* mọi điều kiện chạy được trên bản lưu mới */
    assert.equal(g.run("HUY_HIEU.filter((h) => { try { h.dk(KL(), TT()); return false; } catch (e) { return true; } }).map((h) => h.id).join()"), "");
    g.run("__openDay(); const i = __fillSlot(); R.slots[i].pat = R.slots[i].max; __serveSlot(i)");
    assert.ok(g.run("S.huyHieu.ly_dau"));
    g.run("R.tab = 'hem'; R.sub = { hem: HEM_TAB.findIndex((x) => x[1] === paneHuyHieu) }; renderPrep()");
    assert.match(g.w.document.getElementById("pane").innerHTML, /Huy hiệu · \d+\/\d+/);
    assert.match(g.w.document.getElementById("pane").innerHTML, /Mục tiêu tuần 1/);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("mục tiêu tuần: 3 mục, xong thì thưởng vào két và sổ khớp, sang tuần mới thì đổi", () => {
  const g = boot();
  try {
    g.run("S.day = 3; __openDay()");
    assert.equal(g.run("tuanNay().muc.length"), 3);
    const m = g.run("JSON.stringify(tuanNay().muc[0])");
    const muc = JSON.parse(m);
    const m0 = g.run("S.money"), gift0 = g.run("S.cur.gift || 0");
    g.run(`demTuan(${JSON.stringify(muc.k)}, ${muc.n}, ${muc.k === "chuoi"})`);
    assert.equal(g.run(`tuanNay().xong[${JSON.stringify(muc.k)}]`), true);
    assert.equal(g.run("S.money") - m0, muc.thuong);
    assert.equal(g.run("S.cur.gift") - gift0, muc.thuong);
    /* đạt lại không thưởng lần hai */
    g.run(`demTuan(${JSON.stringify(muc.k)}, ${muc.n}, ${muc.k === "chuoi"})`);
    assert.equal(g.run("S.money") - m0, muc.thuong);
    g.run("S.day = 8");
    assert.equal(g.run("tuanNay().so"), 1);
    assert.equal(g.run("Object.keys(tuanNay().xong).length"), 0);
  } finally {
    g.close();
  }
});

test("thử thách hôm nay không cộng huy hiệu hay mục tiêu tuần vào tiệm thật", () => {
  const g = boot();
  try {
    g.run("ttBatDau(); clearInterval(timer)");
    assert.deepEqual(JSON.parse(g.run("JSON.stringify(xetHuyHieu())")), []);
    g.run("demTuan('khach', 999)");
    g.run("ttKetThuc(true)");
    assert.ok(!g.run("S.tuan && S.tuan.dem.khach"));
  } finally {
    g.close();
  }
});

test("trang trí: mua một lần, trừ két ghi vào trang bị, có ưu đãi, hiện trước tiệm", () => {
  const g = boot();
  try {
    g.run("S.day = 10; S.money = 2000000; save(); R.tab = 'nangcap'; renderPrep()");
    const cho0 = g.run("heSoCho()"), tip0 = g.run("heSoTipTri()");
    assert.equal(g.run("muaTri('cay')"), true);
    assert.equal(g.run("muaTri('cay')"), false);
    assert.equal(g.run("muaTri('den')"), true);
    assert.equal(g.run("S.money"), 2000000 - 300000 - 500000);
    assert.equal(g.run("S.cur.equip.filter((x) => x.n.startsWith('Trang trí')).reduce((a, x) => a + x.v, 0)"), 800000);
    assert.ok(Math.abs(g.run("heSoCho()") - cho0 - 0.03) < 1e-9);
    assert.ok(Math.abs(g.run("heSoTipTri()") - tip0 - 0.05) < 1e-9);
    g.run("R.tab = 'kho'; renderPrep()");
    assert.match(g.w.document.getElementById("view").innerHTML, /tridai.*tt_cay\.svg/s);
    assert.equal(g.run("TRANG_TRI.every((t) => t.gia > 0 && t.uuDai)"), true);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("ảnh khoe tiệm: số liệu đúng, máy không có canvas thì báo nhẹ, không lỗi", async () => {
  const g = boot();
  try {
    g.run("S.shopName = 'Quán Gió'; S.day = 12; TT().mon = { 'tra||tcden|': 9 }");
    const d = JSON.parse(g.run("JSON.stringify(soLieuKhoe())"));
    assert.equal(d.ten, "Quán Gió");
    assert.equal(d.ngay, 12);
    assert.equal(d.mon, "Trà sữa, trân châu đen");
    await g.run("khoeTiem()");
    assert.deepEqual(g.errors.map(String).filter((e) => !/getContext|Not implemented/.test(e)), []);
  } finally {
    g.close();
  }
});

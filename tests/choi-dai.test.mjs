/* Chơi liên tục nhiều ngày để bắt lỗi khi các tính năng chạy cùng nhau. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

test("chơi liền 12 ngày: không lỗi, có truyện, có quà, có khách quen", async () => {
  const g = boot();
  try {
    g.run("closeSplash(); S.shopName = 'Quán Dài'; S.tr = { che: 'tat' }; S.money = 3000000");
    for (let d = 1; d <= 12; d++) {
      for (let k = 0; k < 4; k++) g.run("__closeDialogs(); prepChecks(); __closeDialogs()");
      g.run("['tra','matcha','hong','luc','tcden','thach','tcvang','cunang','cup'].forEach((k) => { if (S.unlocked[k] || k === 'cup') addStock(k, 40); })");
      g.run("truyenLuc('mo_cua', () => { startDay(); clearInterval(timer); }); __closeDialogs(); if (!R.running) { startDay(); clearInterval(timer); } __closeDialogs()");
      for (let n = 0; n < 12; n++) {
        g.run("(() => { const i = __fillSlot(); if (R.slots[i]) { R.slots[i].pat = R.slots[i].max; __serveSlot(i); } })()");
      }
      for (let t = 0; t < 30; t++) g.run("tick()");
      g.run("closeEarly()");
      g.run("__closeDialogs(12)");
      await new Promise((r) => setTimeout(r, 5));
    }
    assert.deepEqual(g.errors.map(String), []);
    assert.ok(g.run("S.day") >= 12, "ngày hiện tại: " + g.run("S.day"));
    assert.ok(g.run("Object.keys(S.tr.xem).length") >= 5, "số cảnh đã xem: " + g.run("Object.keys(S.tr.xem).length"));
    assert.ok(g.run("Object.keys(S.tr.qua).length") >= 5);
    assert.ok(g.run("Object.keys(S.tr.lan).length") >= 2, "khách quen đã ghé: " + g.run("JSON.stringify(S.tr.lan)"));
    assert.ok(g.run("S.kl.khach") > 50);
  } finally {
    g.close();
  }
});

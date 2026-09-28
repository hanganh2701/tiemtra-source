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

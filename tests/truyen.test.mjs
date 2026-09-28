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

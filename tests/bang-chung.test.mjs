/* Test bảng xếp hạng chung (bản 5.7): luật kiểm điểm của máy chủ và phần trong game. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";
import { kiemDiem, lamSachTen, tranLai } from "../may-chu/bxh/worker.js";

const KHOA = "123e4567-e89b-42d3-a456-426614174000";
const gui = (o) => ({ khoa: KHOA, ten: "Tiệm Trà Nhỏ", lai: 5000000, ngay: 10, sao: 4.6, ban: "5.7", ...o });

test("máy chủ: nhận số hợp lý, chặn số vô lý so với số ngày, khoá sai, sao sai", () => {
  const t = 1e12;
  assert.equal(kiemDiem(gui(), null, t).ok, true);
  assert.equal(kiemDiem(gui({ lai: tranLai(10) + 1 }), null, t).loi, "số tiền vô lý so với số ngày");
  assert.equal(kiemDiem(gui({ lai: 5e9, ngay: 10 }), null, t).ok, false, "ngày 10 mà 5 tỷ");
  assert.equal(kiemDiem(gui({ khoa: "abc" }), null, t).ok, false);
  assert.equal(kiemDiem(gui({ sao: 7 }), null, t).ok, false);
  assert.equal(kiemDiem(gui({ ngay: 0 }), null, t).ok, false);
});

test("máy chủ: giữ lãi cao nhất, chơi lại từ đầu không làm mất hạng, chặn chơi nhanh hơn game cho phép", () => {
  const t0 = 1e12;
  const a = kiemDiem(gui({ lai: 8000000, ngay: 10 }), null, t0).dong;
  /* 2 ngày sau, 10 phút đời thực: hợp lệ */
  const b = kiemDiem(gui({ lai: 9000000, ngay: 12 }), a, t0 + 10 * 60000);
  assert.equal(b.ok, true);
  assert.equal(b.dong.lai, 9000000);
  /* 40 ngày trong 10 phút đời thực: quá nhanh */
  assert.equal(kiemDiem(gui({ lai: 9000000, ngay: 50 }), b.dong, t0 + 20 * 60000).loi, "tiến độ nhanh hơn game cho phép");
  /* chơi lại từ đầu (ngày lùi), lãi thấp hơn: giữ dòng cao nhất, theo dõi lượt mới */
  const c = kiemDiem(gui({ lai: 100000, ngay: 2, ten: "Tiệm Mới" }), b.dong, t0 + 30 * 60000);
  assert.equal(c.ok, true);
  assert.equal(c.dong.lai, 9000000);
  assert.equal(c.dong.ten, "Tiệm Trà Nhỏ");
  assert.equal(c.dong.rn0, 2);
  /* gửi dồn trong 30 giây thì chặn */
  assert.equal(kiemDiem(gui({ ngay: 3 }), c.dong, t0 + 30 * 60000 + 5000).loi, "gửi dồn quá nhanh");
});

test("máy chủ: tên tiệm bỏ thẻ HTML, ký tự lạ, tối đa 24 ký tự", () => {
  assert.equal(lamSachTen("<b>Quán</b>   Mây"), "bQuán/b Mây");
  assert.equal(lamSachTen(""), "Tiệm Trà Nhỏ");
  assert.equal(lamSachTen("a".repeat(40)).length, 24);
});

test("game: chưa tham gia thì không gửi gì; tham gia thì cuối ngày gửi tên tiệm, lãi tích luỹ, ngày, sao; rời bảng thì xoá khoá", async () => {
  const g = boot();
  try {
    const goi = [];
    g.w.fetch = (url, o) => {
      goi.push({ url, body: JSON.parse(o.body) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, hang: 3, tong: 10, bang: [], minh: null }) });
    };
    g.run("S.day = 12; S.totalProfit = 7500000; S.cur = newRec(12); __openDay(); closeEarly()");
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(goi.filter((x) => /\/diem$/.test(x.url)).length, 0, "chưa tham gia");
    g.run("$('modal').hidden = true; R.tab = 'hem'; R.sub = { hem: HEM_TAB.findIndex((x) => x[1] === paneBangChung) }; renderPrep()");
    assert.match(g.run("document.getElementById('pane').textContent"), /Tham gia bảng chung/);
    g.run("document.getElementById('bxhVao').click()");
    await new Promise((r) => setTimeout(r, 20));
    const d = goi.find((x) => /\/diem$/.test(x.url));
    assert.ok(d, "tham gia thì gửi liền");
    assert.equal(d.url, "https://bxh.meomeo.app/diem");
    assert.deepEqual(Object.keys(d.body).sort(), ["ban", "khoa", "lai", "ngay", "sao", "ten"]);
    assert.equal(d.body.lai, g.run("S.totalProfit"));
    assert.ok(!JSON.stringify(g.run("JSON.parse(localStorage.getItem('tsShop2'))")).includes(d.body.khoa), "khoá không nằm trong bản lưu");
    /* cuối ngày gửi lại */
    const n0 = goi.length;
    g.run("$('modal').hidden = true; S.cur = newRec(S.day); __openDay(); closeEarly()");
    await new Promise((r) => setTimeout(r, 20));
    assert.ok(goi.slice(n0).some((x) => /\/diem$/.test(x.url)));
    /* rời bảng */
    g.run("$('modal').hidden = true; bxhRoi()");
    [...g.w.document.querySelectorAll("#card button")].find((b) => /Rời bảng/.test(b.textContent)).click();
    await new Promise((r) => setTimeout(r, 20));
    assert.ok(goi.some((x) => /\/roi$/.test(x.url)));
    assert.equal(g.run("localStorage.getItem('tsBxhKhoa')"), null);
  } finally {
    g.close();
  }
});

test("game: tab Bảng chung vẽ bảng tải về, tiệm mình nổi lên; mất mạng thì báo nhẹ", async () => {
  const g = boot();
  try {
    g.w.fetch = () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tong: 120, bang: [{ hang: 1, ten: "Quán <Mây>", lai: 900000000, ngay: 210, sao: 4.9, minh: false }], minh: { hang: 37, lai: 52000000, ngay: 80 } }),
      });
    g.run("localStorage.setItem('tsBxhKhoa', '123e4567-e89b-42d3-a456-426614174000'); R.tab = 'hem'; R.sub = { hem: HEM_TAB.findIndex((x) => x[1] === paneBangChung) }; renderPrep()");
    await new Promise((r) => setTimeout(r, 20));
    const t = g.run("document.getElementById('bxhDs').innerHTML");
    assert.match(t, /Top 1 trên 120 tiệm/);
    assert.match(t, /Quán &lt;Mây&gt;/, "tên tiệm người khác được thoát HTML");
    assert.match(t, /<b>37\.<\/b>/, "hạng của tiệm mình");
    g.w.fetch = () => Promise.reject(new Error("mất mạng"));
    g.run("R.bxh = null; renderPrep()"); /* bỏ bảng đã nhớ để tải lại */
    await new Promise((r) => setTimeout(r, 20));
    assert.match(g.run("document.getElementById('bxhDs').textContent"), /Chưa tải được bảng/);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

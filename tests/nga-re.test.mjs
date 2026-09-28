/* Test ngã rẽ lớn, hệ quả trong cách chơi, kết truyện, bản lưu cũ. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

/* đánh dấu mọi cảnh đã xem trừ các cảnh cần thử */
const xemHet = (tru) => `MAU_CHUYEN.forEach((m) => { if (!${JSON.stringify(tru)}.includes(m.id)) TT().xem[m.id] = 1; })`;
const card = (g) => g.w.document.getElementById("card");
const bam = (g, sel) => g.run(`document.querySelector(${JSON.stringify(sel)}).click()`);

test("ngã rẽ Mây Tea: có nhãn Ngã rẽ, Bỏ qua không chọn thay, chọn xong thì ghi nhánh", () => {
  const g = boot();
  try {
    g.run(`S.day = 50; ${xemHet(["c2_nga_re", "c2_ket", "c3_ket"])}; TT().homNay = 0; truyenLuc("mo_cua")`);
    assert.match(card(g).innerHTML, /Ngã rẽ/);
    bam(g, "#trSkip");
    assert.equal(g.run("TT().nhanh.may"), undefined);
    assert.match(card(g).innerHTML, /trrew/);
    assert.equal(g.run("document.querySelectorAll('#card [data-ch]').length"), 2);
    bam(g, '#card [data-ch="1"]');
    assert.equal(g.run("TT().nhanh.may"), "B");
    assert.equal(g.run("KL().reDaDi.may.B"), 50);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("chế độ Tắt vẫn hỏi ở ngã rẽ, còn cảnh thường thì tự chọn", () => {
  const g = boot();
  try {
    g.run(`S.day = 50; TT().che = "tat"; ${xemHet(["c2_nga_re", "c2_ket", "c3_ket"])}; TT().homNay = 0; truyenLuc("mo_cua")`);
    assert.equal(g.run("document.getElementById('modal').hidden"), false);
    assert.equal(g.run("document.querySelectorAll('#card [data-ch]').length"), 2);
    assert.equal(g.run("TT().nhanh.may"), undefined);
    bam(g, '#card [data-ch="0"]');
    assert.equal(g.run("TT().nhanh.may"), "A");
  } finally {
    g.close();
  }
});

test("nhánh bắt tay: sáng nào xe Mây Tea cũng lấy trân châu, tiền vào két khớp sổ", () => {
  const g = boot();
  try {
    g.run("S.day = 52; TT().nhanh.may = 'A'; TT().xem.c2_nga_re = 50; addStock('tcden', 40)");
    const q0 = g.run("qty('tcden')"), m0 = g.run("S.money"), r0 = g.run("recRev(S.cur)");
    g.run("startDay(); clearInterval(timer)");
    assert.equal(q0 - g.run("qty('tcden')"), 30);
    assert.equal(g.run("S.cur.sales.si.q"), 30);
    assert.equal(g.run("S.money") - m0, 150000);
    assert.equal(g.run("recRev(S.cur)") - r0, 150000);
    assert.equal(g.run("heSoQuenNhanh()"), 0.75);
    assert.match(g.run("ngayMaiNhanh()"), /Mây Tea/);
    /* hết trân châu thì không giao, không lỗi */
    g.run("endDay(); __closeDialogs(); S.stock.tcden = []; startDay(); clearInterval(timer)");
    assert.equal(g.run("(S.cur.sales.si || { q: 0 }).q"), 0);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("nhánh giữ hẻm: 14 ngày phá giá khách lạ ít hơn, khách quen ghé nhiều hơn, lập hội xong tip cao hơn", () => {
  const g = boot();
  try {
    g.run("TT().nhanh.may = 'B'; TT().xem.c2_nga_re = 50; S.day = 55");
    assert.equal(g.run("heSoKhachNhanh()"), 0.85);
    assert.equal(g.run("heSoQuenNhanh()"), 1.3);
    assert.equal(g.run("heSoTipNhanh()"), 1);
    g.run("S.day = 65; TT().xem.c2_ket = 56");
    assert.equal(g.run("heSoKhachNhanh()"), 1);
    assert.equal(g.run("heSoTipNhanh()"), 1.1);
  } finally {
    g.close();
  }
});

test("giao thừa: hiện tên kết và hậu truyện, ghi vào sơ đồ ngã rẽ trong Sổ tay", () => {
  const g = boot();
  try {
    g.run(`S.day = 68; ${xemHet(["c3_ket"])}; TT().xem.hana_3 = 45; TT().nhanh.may = "A"; TT().co.c0_meo = "vuot"; TT().trang = [1,2,3,4,5,6,7,8,9,10,11]; TT().homNay = 0; truyenLuc("dong_cua")`);
    for (let k = 0; k < 10 && !g.run("!!document.getElementById('kcOk')"); k++) g.run("__closeDialogs(1)");
    assert.match(card(g).textContent, /Thương hiệu từ con hẻm/);
    assert.match(card(g).textContent, /Mướp vẫn nằm đúng chỗ/);
    assert.match(card(g).textContent, /Đã thấy 1\/4 kết/);
    bam(g, "#kcOk");
    assert.equal(g.run("TT().ket.id"), "thuong_hieu");
    assert.ok(g.run("TT().trang.includes(12)"));
    g.run("R.tab = 'hem'; R.sub = { hem: 2 }; renderPrep()");
    const pane = g.w.document.getElementById("pane").innerHTML;
    assert.match(pane, /Bắt tay với Mây Tea/);
    assert.match(pane, /\?\?\?/);
    assert.match(pane, /Xem lại kết truyện/);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("bản lưu cũ: đã xem Hội ghé tiệm thì vào nhánh giữ hẻm, đã hết truyện thì có kết", () => {
  const g = boot();
  try {
    g.run("S.tr = { xem: { c2_ket: 54, c3_ket: 67 } }");
    assert.equal(g.run("TT().nhanh.may"), "B");
    assert.equal(g.run("TT().xem.c2_nga_re"), 54);
    assert.equal(g.run("TT().ket.id"), "tiem_cua_xom");
    assert.equal(g.run("KL().ket.tiem_cua_xom"), 67);
    /* ngã rẽ không hỏi lại */
    g.run("S.day = 60; TT().homNay = 0");
    assert.equal(g.run("hopCanh(MAU_CHUYEN.find((m) => m.id === 'c2_nga_re'), 'mo_cua')"), false);
  } finally {
    g.close();
  }
});

test("hạn chót: cảnh chốt chương vẫn tới dù thiếu trang hay bỏ lỡ cảnh trước", () => {
  const g = boot();
  try {
    const hop = (id, luc) => g.run(`hopCanh(MAU_CHUYEN.find((m) => m.id === ${JSON.stringify(id)}), ${JSON.stringify(luc)})`);
    g.run("TT().trang = [1]; TT().nhanh.may = 'B'; TT().xem.c2_nga_re = 50; S.day = 57");
    assert.equal(hop("c2_ket", "mo_cua"), false);
    g.run("S.day = 59");
    assert.equal(hop("c2_ket", "mo_cua"), true);
    assert.equal(hop("c2_ket_a", "mo_cua"), false);
    g.run("S.day = 76");
    assert.equal(hop("c3_ket", "dong_cua"), true);
  } finally {
    g.close();
  }
});

test("câu hồi âm theo lựa chọn cũ: mỗi cờ chỉ hiện đúng một câu", () => {
  const g = boot();
  try {
    g.run("TT().co.c0_meo = 'vuot'; TT().co.c1_vay = 'tu'");
    const ds = JSON.parse(g.run("JSON.stringify(locDong(MAU_CHUYEN.find((m) => m.id === 'c2_ba_sau').thoai).map((d) => d[1]))"));
    assert.equal(ds.length, 6);
    assert.ok(ds.some((c) => /vuốt nó/.test(c)));
    assert.ok(ds.some((c) => /Cứng đầu/.test(c)));
    assert.ok(!ds.some((c) => /mẹ con gửi/.test(c)));
  } finally {
    g.close();
  }
});

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
    g.run(`S.day = 68; ${xemHet(["c3_ket"])}; TT().xem.hana_3 = 45; TT().nhanh.hana = "A"; TT().nhanh.may = "A"; TT().co.c0_meo = "vuot"; TT().trang = [1,2,3,4,5,6,7,8,9,10,11]; TT().homNay = 0; truyenLuc("dong_cua")`);
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

test("ngã rẽ Tết về quê: ba ngày nghỉ không tốn tiền nhà, cảnh quê hiện liền nhau, có trang 11", async () => {
  const g = boot();
  try {
    g.run(`S.day = 63; ${xemHet(["que_1", "que_2", "que_3", "c3_ket", "c2_ket"])}; TT().nhanh.tet = "A"; TT().xem.c3_vang = 62; TT().trang = TT().trang.filter((x) => x !== 11); TT().homNay = 0; S.money = 1000000`);
    const m0 = g.run("S.money");
    g.run("truyenLuc('mo_cua', startDay)");
    for (let k = 0; k < 30 && g.run("S.day") < 66; k++) {
      g.run("__closeDialogs(1)");
      await new Promise((r) => setTimeout(r, 400));
    }
    for (let k = 0; k < 6 && !g.run("document.getElementById('modal').hidden"); k++) {
      g.run("__closeDialogs(1)");
      await new Promise((r) => setTimeout(r, 400));
    }
    assert.equal(g.run("S.day"), 66);
    assert.ok(!g.run("R.running"), "không mở bán ngày nào");
    assert.ok(g.run("TT().trang.includes(11)"));
    assert.equal(g.run("S.history.slice(-3).every((r) => r.nghi)"), true);
    assert.equal(g.run("S.money") - m0, 300000);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("ngã rẽ giữa chừng: thoát trước khi chọn thì lần sau hỏi lại", () => {
  const g = boot();
  try {
    g.run(`S.day = 50; ${xemHet(["c2_nga_re", "c2_ket", "c3_ket"])}; TT().homNay = 0; truyenLuc("mo_cua")`);
    assert.equal(g.run("TT().xem.c2_nga_re"), undefined);
    g.run("TT().homNay = 0; document.getElementById('modal').hidden = true");
    assert.equal(g.run("hopCanh(MAU_CHUYEN.find((m) => m.id === 'c2_nga_re'), 'mo_cua')"), true);
  } finally {
    g.close();
  }
});

test("ngã rẽ Linh: ở lại thì Linh vào nghề sẵn, đi Đà Lạt thì gửi trà olong về", () => {
  const g = boot();
  try {
    g.run("TT().nhanh.linh = 'A'; TT().co.linh_lam = true; nvThue('staff1')");
    assert.equal(g.run("S.nv.staff1.ten"), "Linh");
    assert.equal(g.run("S.nv.staff1.kn"), 2);
    g.run("linhLenNghe()");
    assert.equal(g.run("S.nv.staff1.kn"), 3);
  } finally {
    g.close();
  }
  const g2 = boot();
  try {
    g2.run("S.unlocked.olong = false; TT().nhanh.linh = 'B'; apDung(MAU_CHUYEN.find((m) => m.id === 'linh_b1'), null)");
    assert.equal(g2.run("S.unlocked.olong"), true);
    assert.ok(g2.run("qty('olong')") >= 20);
  } finally {
    g2.close();
  }
});

test("chọn bằng ly pha: Linh ghé trước giờ thi, pha thêm thạch thì ghi cờ, sổ vẫn khớp két", () => {
  const g = boot();
  try {
    g.run("S.day = 16; S.seenLv = 9; S.unlocked.hong = true; S.unlocked.f_dao = true; S.unlocked.thach = true; TT().xem.linh_2 = 13; TT().than.linh = 5");
    g.run("__openDay(); ['hong', 'f_dao', 'thach'].forEach((k) => addStock(k, 20)); R.slots = R.slots.map(() => null); R.t = 100");
    assert.ok(g.run("level() >= 2"), "cần bậc 2");
    const dt = g.run("(donTruyenDen() || {}).id") || g.run("(() => { for (let n = 0; n < 60; n++) { const d = donTruyenDen(); if (d) return d.id; } })()");
    assert.equal(dt, "linh_thi");
    g.run("spawnTruyen(0, DON_TRUYEN[0])");
    assert.equal(g.run("R.slots[0].name"), "Linh");
    const m0 = g.run("S.money"), r0 = g.run("recRev(S.cur)");
    g.run(`(() => { const o = { base: "hong", flav: "f_dao", tops: ["thach"], sugar: 50, ice: "Ít đá" };
      cup = newCup(); cup.size = "M"; useCup(); [o.base, o.flav, ...o.tops].forEach((k) => consume(k));
      Object.assign(cup, { base: o.base, flav: o.flav, tops: o.tops, cheese: false, sugar: o.sugar, ice: o.ice, fill: 0.8, used: true });
      R.slots[0].pat = R.slots[0].max; serve(0); })()`);
    assert.equal(g.run("TT().co.linh_ly"), "thach");
    assert.ok(g.run("TT().dt.linh_thi"));
    assert.equal(g.run("S.money") - m0, g.run("recRev(S.cur)") - r0);
    assert.equal(g.run("donTruyenDen()"), null);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

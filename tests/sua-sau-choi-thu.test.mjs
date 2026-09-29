/* Test các lỗi tìm ra trong đợt chơi thử bản 4.6. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const doi = (ms) => new Promise((r) => setTimeout(r, ms));
/* pha một ly theo công thức vào biến cup của game */
const phaLy = (g, o) =>
  g.run(`(() => { const o = ${JSON.stringify(o)};
    ["hong", "f_dao", "thach", "tra", "tcden", "cup"].forEach((k) => { S.unlocked[k] = true; if (qty(k) < 5) addStock(k, 10); });
    cup = newCup(); cup.size = o.size || "M"; cup.cho = o.cho; useCup(); [o.base, o.flav, ...(o.tops || [])].filter(Boolean).forEach((k) => consume(k));
    Object.assign(cup, { base: o.base, flav: o.flav || null, tops: o.tops || [], cheese: false, sugar: o.sugar, ice: o.ice, fill: 0.8, used: true }); })()`);

test("chọn bằng ly pha: pha phương án thứ hai khi khách truyện chưa đứng đầu hàng vẫn giao đúng khách", async () => {
  const g = boot();
  try {
    g.run("S.day = 16; S.seenLv = 9; TT().xem.linh_2 = 13; ['hong', 'f_dao', 'thach', 'tra', 'tcden'].forEach((k) => { S.unlocked[k] = true; addStock(k, 20); })");
    g.run("__openDay(); R.slots = R.slots.map(() => null); spawnQuen(0, 'tu'); spawnTruyen(1, DON_TRUYEN[0])");
    assert.ok(g.run("level() >= 2"));
    assert.equal(g.run("focusCust().name"), "Chú Tư");
    const sai0 = g.run("R.today.wrong");
    phaLy(g, { base: "hong", flav: "f_dao", tops: ["thach"], sugar: 50, ice: "Ít đá" });
    g.run("sealServe()");
    await doi(1700);
    assert.equal(g.run("R.today.wrong"), sai0, "không bị tính sai");
    assert.equal(g.run("TT().co.linh_ly"), "thach");
    assert.equal(g.run("R.slots[1]"), null, "Linh đã nhận ly");
    assert.equal(g.run("R.slots[0].name"), "Chú Tư");
    /* gợi ý nằm luôn trên bong bóng thoại */
    g.run("spawnTruyen(2, DON_TRUYEN[1]); R.focus = R.slots[2].id");
    assert.match(g.run("sentence(R.slots[2])"), /goiyb/);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("ly của khách đã bỏ về không bị giao nhầm cho khách sau", async () => {
  const g = boot();
  try {
    g.run("__openDay(); R.slots = R.slots.map(() => null); spawnQuen(0, 'tu')");
    const sai0 = g.run("R.today.wrong");
    /* ly pha cho một khách (id 999) đã về, không khớp món chú Tư */
    phaLy(g, { base: "hong", tops: ["thach"], sugar: 70, ice: "Ít đá", size: "L", cho: 999 });
    g.run("sealServe()");
    await doi(1700);
    assert.equal(g.run("R.today.wrong"), sai0);
    assert.equal(g.run("cup.base"), "hong", "ly vẫn còn trên thớt");
    assert.match(g.w.document.getElementById("toast").textContent, /đã về/);
    /* ly pha sai cho chính khách đang đứng thì vẫn tính sai như cũ */
    phaLy(g, { base: "hong", tops: ["thach"], sugar: 70, ice: "Ít đá", size: "L", cho: g.run("R.slots[0].id") });
    g.run("sealServe()");
    await doi(1700);
    assert.equal(g.run("R.today.wrong"), sai0 + 1);
  } finally {
    g.close();
  }
});

test("điểm sao lúc mới mở có đệm; hai ngày đầu khách kiên nhẫn hơn", () => {
  const g = boot();
  try {
    g.run("S.reviews = [{ s: 1, t: 'x' }]");
    assert.ok(g.run("rating()") > 3, "một đánh giá 1 sao không kéo tiệm xuống 1 sao: " + g.run("rating()"));
    g.run("S.reviews = Array.from({ length: 20 }, () => ({ s: 5, t: 'x' }))");
    assert.equal(g.run("rating()"), 5);
    g.run("S.day = 1");
    const c1 = g.run("heSoCho()");
    g.run("S.day = 3");
    assert.ok(c1 - g.run("heSoCho()") > 0.3);
  } finally {
    g.close();
  }
});

test("thẻ Ngày mai không nhắc Hana trước khi Hana xuất hiện; Linh đi Đà Lạt thì không ghé tiệm", () => {
  const g = boot();
  try {
    g.run("S.day = 1");
    assert.doesNotMatch(g.run("goiYThan()"), /Hana/);
    g.run("S.day = 40; TT().nhanh.linh = 'B'; TT().ghe.linh = 1");
    assert.equal(g.run("sapGhe('linh')"), false);
    assert.doesNotMatch(g.run("goiYThan()"), /Linh/);
    g.run("TT().lan.linh = 3");
    assert.match(g.run("paneQuen()"), /đang học ở Đà Lạt/);
    g.run("TT().nhanh.linh = 'A'");
    assert.equal(g.run("sapGhe('linh')"), true);
  } finally {
    g.close();
  }
});

test("khách vãng lai không trùng tên nhân vật truyện", () => {
  const g = boot();
  try {
    const trung = g.run("(() => { const ra = []; for (let i = 0; i < 400; i++) { const n = PNAME[[0, 1, 3, 4, 7][i % 5]](); if (TEN_TRUYEN.has(n.split(' ').pop())) ra.push(n); } return ra.join(); })()");
    assert.equal(trung, "");
  } finally {
    g.close();
  }
});

test("về quê: nút thành Lên xe về quê, không đòi nấu hàng, cảnh quê hiện liền", async () => {
  const g = boot();
  try {
    g.run("S.day = 63; MAU_CHUYEN.forEach((m) => { if (!/^que_|c3_ket|c2_ket$/.test(m.id)) TT().xem[m.id] = 1; }); TT().nhanh.tet = 'A'; TT().xem.c3_vang = 62; TT().homNay = 0");
    g.run("Object.keys(S.stock).forEach((k) => (S.stock[k] = [])); R.tab = 'kho'; renderPrep(); document.getElementById('modal').hidden = true");
    assert.match(g.w.document.getElementById("obar").textContent, /Lên xe về quê/);
    g.run("R.cookAt = -9999; tryOpen()"); /* bỏ chặn chạm đúp 0,5 giây đầu */
    assert.match(g.w.document.getElementById("card").textContent, /Xe đò/);
    assert.match(g.run("MAU_CHUYEN.find((m) => m.id === 'c3_vang').reRe"), /hết hạn/);
  } finally {
    g.close();
  }
});

test("hướng dẫn cho người mới chỉ 4 trang; bấm Tiếp lúc trang đang trượt vẫn sang trang sau", () => {
  const g = boot();
  try {
    g.run("showTour(true)");
    assert.equal(g.run("document.querySelectorAll('#tw .tpage').length"), 4);
    g.run("document.getElementById('tNext').click(); document.getElementById('tNext').click()");
    assert.equal(g.run("[...document.querySelectorAll('#tDots i')].findIndex((d) => d.classList.contains('on'))"), 2);
    assert.doesNotMatch(g.run("document.getElementById('tw').textContent"), /vắng hẳn/);
    g.run("showTour(false, true)");
    assert.ok(g.run("document.querySelectorAll('#tw .tpage').length") >= 9, "Cài đặt > Hướng dẫn vẫn đủ trang");
  } finally {
    g.close();
  }
});

test("màn chuẩn bị nhắc thử thách hôm nay từ ngày 3, bấm vào mở đúng tab", () => {
  const g = boot();
  try {
    g.run("S.day = 2; R.tab = 'kho'; renderPrep()");
    assert.equal(g.run("!!document.querySelector('[data-ttnhac]')"), false);
    g.run("S.day = 3; renderPrep()");
    g.run("document.querySelector('[data-ttnhac]').click()");
    assert.equal(g.run("R.tab"), "hem");
    assert.equal(g.run("HEM_TAB[R.sub.hem][1] === paneThuThach"), true);
    g.run("S.ttKq = { [homNayVN()]: { chuan: 30 } }; R.tab = 'kho'; renderPrep()");
    assert.equal(g.run("!!document.querySelector('[data-ttnhac]')"), false);
  } finally {
    g.close();
  }
});

test("Phố Trà: chơi giỏi không lên hạng 1 ngay ngày 2; cuối game Mây Tea mạnh, bán vừa thì cần chi nhánh, bán rất đông thì không cần", () => {
  const g = boot();
  try {
    const hang = (d, mt, cn, dt = 800000) =>
      g.run(`(() => { S.day = ${d}; S.reviews = Array.from({ length: 40 }, (_, i) => ({ s: i < 32 ? 5 : 4 }));
        S.history = Array.from({ length: 7 }, () => { const r = newRec(1); r.sales = { tra: { q: 1, a: ${dt} } }; return r; });
        S.tr = { trang: Array.from({ length: Math.min(12, Math.floor(${d} / 6)) }, (_, i) => i + 1) }; S.buoc = ${mt} ? 2 : 1;
        S.cn = ${cn} ? { loai: "truong" } : null; return hangMinh(); })()`);
    assert.ok(hang(2, false, false) > 1);
    assert.equal(hang(150, true, false), 2, "chỉ có mặt tiền thì thua Mây Tea");
    assert.equal(hang(150, true, true), 1);
    assert.equal(hang(150, true, false, 3000000), 1, "bán 3 triệu mỗi ngày thì không cần chi nhánh");
    assert.ok(hang(10, false, false, 1000000) > 1, "ngày 10 chưa đứng đầu");
  } finally {
    g.close();
  }
});

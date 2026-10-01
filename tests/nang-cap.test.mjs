/* Test tab Nâng cấp bố cục mới (bản 5.5): Menu · Quầy · Người · Mở rộng, chai hương ở Kho. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const trang = (g, i) => g.run(`document.getElementById("sw-upg").children[${i}].textContent`);
const moTab = (g) => g.run("R.tab = 'nangcap'; renderPrep()");

test("Nâng cấp có bốn mục một hàng: Menu, Quầy, Người, Mở rộng", () => {
  const g = boot();
  try {
    moTab(g);
    const nut = g.run("[...document.querySelectorAll('[data-st=\"upg\"] .stab')].map((b) => b.textContent.trim()).join('|')");
    assert.equal(nut, "Menu|Quầy|Người|Mở rộng");
    assert.equal(g.run("document.querySelector('[data-st=\"upg\"]').classList.contains('w3')"), false, "một hàng nút");
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("Menu: món mở thêm xếp từ rẻ tới đắt, mua được; món đang bán gọn một dòng, bỏ rồi thêm lại", () => {
  const g = boot();
  try {
    g.run("S.money = 5000000");
    moTab(g);
    const gia = JSON.parse(g.run("JSON.stringify([...document.getElementById('sw-upg').children[0].querySelectorAll('[data-un]')].map((b) => ITEMS[b.dataset.un]).filter((x) => x.type === 'base').map((x) => x.unlock))"));
    assert.deepEqual(gia, [...gia].sort((a, b) => a - b));
    const k = g.run("document.querySelector('[data-un]').dataset.un"), m0 = g.run("S.money");
    g.run(`document.querySelector('[data-un="${k}"]').click()`);
    assert.equal(g.run(`S.unlocked["${k}"]`), true);
    assert.equal(m0 - g.run("S.money"), g.run(`ITEMS["${k}"].unlock`));
    /* đang bán: bỏ khỏi menu rồi thêm lại miễn phí */
    g.run(`document.querySelector('[data-moff="${k}"]').click()`);
    assert.equal(g.run(`S.unlocked["${k}"]`), false);
    assert.match(trang(g, 0), /Đã bỏ khỏi menu/);
    g.run(`document.querySelector('[data-mon="${k}"]').click()`);
    assert.equal(g.run(`S.unlocked["${k}"]`), true);
    assert.match(trang(g, 0), /Hương \(siro\) mua theo chai ở tab Kho/);
  } finally {
    g.close();
  }
});

test("Quầy: trang bị và trang trí chưa có lên trước, món đã có gom vào Đã có; mua trang trí ngay tại đây", () => {
  const g = boot();
  try {
    g.run("S.money = 20000000; S.upg.sign = true; S.tri = ['chuong']");
    moTab(g);
    const q = g.run("document.getElementById('sw-upg').children[1].innerHTML");
    assert.match(q, /Đã có 1 món/);
    assert.ok(g.run("!!document.querySelector('#sw-upg details.ncdaco [data-up]') === false"), "món đã có không còn nút Mua");
    assert.ok(g.run("[...document.querySelectorAll('#sw-upg details.ncdaco')].some((d) => /Biển hiệu đèn LED/.test(d.textContent))"));
    g.run("document.querySelector('[data-tri=\"cay\"]').click()");
    assert.ok(g.run("coTri('cay')"));
    assert.match(g.run("document.getElementById('sw-upg').children[1].textContent"), /Đã có 2 món/);
  } finally {
    g.close();
  }
});

test("Người: nhân viên đang làm lên đầu kèm tính nết, giải thích lương và tip nằm trong ⓘ", () => {
  const g = boot();
  try {
    g.run("S.money = 5000000; S.day = 12");
    moTab(g);
    g.run("document.querySelector('[data-hire=\"staff1\"]').click()");
    assert.ok(g.run("S.upg.staff1"));
    const t = trang(g, 2);
    assert.match(t, /Lương, tiền tip, cho nghỉ/);
    assert.match(t, /Đang làm.*Nhân viên phụ quầy.*Thuê thêm/s);
    assert.ok(g.run("!!document.querySelector('#sw-upg [data-fire=\"staff1\"]')"));
  } finally {
    g.close();
  }
});

test("Mở rộng: chuỗi nấc góc dưới gác, mặt tiền, đơn online, chi nhánh; nấc kế tiếp mở ra, nấc xa chỉ có tên", () => {
  const g = boot();
  try {
    g.run("S.day = 6");
    moTab(g);
    const t = trang(g, 3);
    assert.match(t, /Góc dưới gác bà Sáu.*Mặt tiền đầu hẻm.*Thuê mặt tiền.*Đơn onlineMở từ ngày 40.*Chi nhánhRa mặt tiền trước/s);
    assert.equal(g.run("document.querySelectorAll('#sw-upg .nac.xong').length"), 1);
    assert.ok(g.run("document.querySelector('#sw-upg .nac.toi .nacb [data-mattien]') !== null"));
    /* đã ra mặt tiền, mở online: nấc mặt tiền gọn một dòng, online có tablet để mua, chi nhánh hiện điều kiện */
    g.run("S.buoc = 2; S.hd = { bd: 3, gia: 330000, ky: 0 }; S.online = true; S.money = 9000000; renderPrep()");
    const t2 = trang(g, 3);
    assert.match(t2, /Mặt tiền đầu hẻmTiền nhà 330k\/ngày/);
    assert.ok(g.run("!!document.querySelector('#sw-upg [data-tablet]')"));
    assert.match(t2, /Ra mặt tiền được 14 ngày/);
    assert.equal(g.run("document.querySelectorAll('#sw-upg [data-mattien]').length"), 0);
  } finally {
    g.close();
  }
});

test("Kho có mục Hương: mua chai ở đây, vị lên menu; thiếu topping thì mở đúng mục Topping của Kho", () => {
  const g = boot();
  try {
    g.run("S.money = 2000000; R.tab = 'kho'; renderPrep()");
    const nut = g.run("[...document.querySelectorAll('[data-st=\"kho\"] .stab')].map((b) => b.textContent.trim()).join('|')");
    assert.equal(nut, "Trà|Hương|Topping|Ly");
    const k = g.run("FLAV_KEYS[0]");
    g.run(`document.querySelector('[data-bottle="${k}"]').click()`);
    assert.equal(g.run(`qty("${k}")`), g.run("CFG.bottleN"));
    assert.equal(g.run(`S.unlocked["${k}"]`), true);
    /* thiếu topping: nút mở cửa đưa tới mục Topping (số 2) */
    g.run("TOP_KEYS.forEach((t) => (S.stock[t] = [])); BASE_KEYS.forEach((t) => S.unlocked[t] && addStock(t, 10)); addStock('cup', 20); R.cookAt = -1e9; tryOpen()");
    assert.equal(g.run("R.sub.kho"), 2);
  } finally {
    g.close();
  }
});

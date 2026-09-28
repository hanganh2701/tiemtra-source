/* Test mặt tiền, nhân viên, đơn nhóm, lễ Tết và Noel, cảnh Chương 1 cuối. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const card = (g) => g.w.document.getElementById("card");
const clickText = (g, re) => {
  const b = [...card(g).querySelectorAll("button")].find((x) => re.test(x.textContent));
  assert.ok(b, "không thấy nút " + re);
  b.click();
};
const saoTot = "S.reviews = Array.from({ length: 30 }, () => ({ s: 5, t: 'ngon', k: Math.random(), d: 1 }))";

test("mặt tiền đầu hẻm: đủ điều kiện mới thuê được, tiền nhà, chỗ ở quầy, khách đông hơn", () => {
  const g = boot();
  try {
    g.run("S.day = 10; S.money = 100000");
    assert.equal(g.run("dkMatTien().every((x) => x.ok)"), false);
    g.run(`S.day = 25; S.money = 10000000; ${saoTot}`);
    const k1 = g.run("traffic()");
    g.run("thueMatTien()");
    clickText(g, /Thuê luôn/);
    assert.equal(g.run("S.buoc"), 2);
    assert.equal(g.run("S.money"), 10000000 - g.run("MAT_TIEN.thue * MAT_TIEN.cocNgay + MAT_TIEN.trangTri"));
    assert.equal(g.run("fixed().rent"), g.run("MAT_TIEN.thue"));
    assert.equal(g.run("soCho()"), 4);
    assert.ok(g.run("traffic()") > k1 * 1.5);
    g.run("__openDay()");
    assert.equal(g.run("R.slots.length"), 4);
  } finally {
    g.close();
  }
});

test("mặt tiền: tới kỳ gia hạn thì tiền nhà tăng và tổng kết báo", () => {
  const g = boot();
  try {
    g.run(`S.day = 40; S.buoc = 2; S.hd = { bd: 13, gia: 115000 }; S.money = 5000000; ${saoTot}; S.tr = { che: 'tat' }; __openDay(); closeEarly()`);
    assert.equal(g.run("S.hd.gia"), 127000);
    assert.match(card(g).textContent, /Gia hạn hợp đồng mặt tiền/);
  } finally {
    g.close();
  }
});

test("nhân viên: có tên và đặc điểm, lên nghề thì xin tăng lương, Linh xin làm thêm", () => {
  const g = boot();
  try {
    g.run("S.day = 35; S.upg.staff2 = true; nvThue('staff2')");
    const n = g.run("S.nv.staff2");
    assert.ok(n.ten && g.run(`!!NV_DD['${n.dd}']`));
    const w0 = g.run("wageDay()");
    for (let d = 0; d < 7; d++) g.run("nvCuoiNgay({ ot: 0 }, 100000, 4.8)");
    assert.equal(g.run("S.nv.staff2.kn"), 2);
    assert.equal(g.run("nvSuKien()"), true);
    assert.match(card(g).textContent, /lên nghề/);
    clickText(g, /Tăng lương/);
    assert.ok(g.run("wageDay()") > w0);
    g.run("S.tr = { co: { linh_lam: true } }; S.upg.staff1 = true; nvThue('staff1')");
    assert.equal(g.run("S.nv.staff1.ten"), "Linh");
  } finally {
    g.close();
  }
});

test("nhân viên đi trễ vắng đầu ca, trưởng ca giúp người khác ít sai", () => {
  const g = boot();
  try {
    g.run("S.day = 35; S.buoc = 2; S.upg.staff2 = true; S.upg.staff1 = true; nvThue('staff2'); nvThue('staff1'); S.nv.staff1.dd = 'di_tre'; S.nv.staff2.dd = 'nhanh'; __openDay(); R.nvTre = { staff1: true }");
    assert.equal(g.run("nvRanh('staff1')"), false);
    g.run("R.t = 10");
    assert.equal(g.run("nvRanh('staff1')"), true);
    const truoc = g.run("nvSai('staff1')");
    g.run("S.truongCa = 'staff2'");
    assert.ok(g.run("nvSai('staff1')") < truoc);
    assert.ok(g.run("nvToc('staff2')") > 1);
  } finally {
    g.close();
  }
});

test("đơn nhóm: nhận đơn, tới giờ cả nhóm tới, phục vụ xong sổ vẫn khớp két", () => {
  const g = boot();
  try {
    g.run("S.day = 35; S.dnKe = 35; S.tr = { che: 'tat' }");
    assert.equal(g.run("donNhomCheck()"), true);
    clickText(g, /Nhận đơn/);
    g.run("['tra','matcha','tcden','thach','cup'].forEach((k) => addStock(k, 50)); startDay(); clearInterval(timer); R.slots = R.slots.map(() => null); R.t = 1");
    g.run("donNhomNhip()");
    const i = g.run("R.slots.findIndex((c) => c && c.nhom)");
    assert.ok(i >= 0);
    assert.equal(g.run(`R.slots[${i}].cups.length`), g.run("S.dnHom.n"));
    const m0 = g.run("S.money"), r0 = g.run("recRev(S.cur)");
    g.run(`__serveSlot(${i})`);
    assert.equal(g.run("S.money") - m0, g.run("recRev(S.cur)") - r0);
  } finally {
    g.close();
  }
});

test("lịch lễ: Noel, Tết, Trung Thu theo ngày thật", () => {
  const g = boot();
  try {
    assert.equal(g.run("leHoiNay('2026-12-24')"), "noel");
    assert.equal(g.run("leHoiNay('2027-01-20')"), "tet");
    assert.equal(g.run("leHoiNay('2027-02-14')"), "tet");
    assert.equal(g.run("leHoiNay('2027-02-15')"), null);
    assert.equal(g.run("leHoiNay('2027-09-15')"), "trungThu");
    assert.equal(g.run("leHoiNay('2026-10-10')"), null);
  } finally {
    g.close();
  }
});

test("Tết: bà Sáu lì xì một lần, mùng 1 chọn nghỉ Tết thì qua ngày không tốn tiền nhà", () => {
  const g = boot();
  try {
    g.run("window.__ngay = '2027-02-06'; S.day = 20; S.money = 500000");
    assert.equal(g.run("leHoiCheck()"), true);
    clickText(g, /cảm ơn bà/);
    assert.equal(g.run("S.money"), 700000);
    assert.equal(g.run("leHoiCheck()"), true);
    clickText(g, /Nghỉ Tết/);
    assert.equal(g.run("S.day"), 21);
    assert.equal(g.run("S.money"), 700000);
    assert.equal(g.run("S.history[S.history.length - 1].nghi"), true);
  } finally {
    g.close();
  }
});

test("Tết: mở cửa thì khách đông, lương gấp 3; Noel có trang trí và cảnh riêng", () => {
  const g = boot();
  try {
    g.run("window.__ngay = '2027-02-07'; S.day = 20; S.liXi = { '2027-02-06': true }; S.upg.staff1 = true; nvThue('staff1')");
    const w = g.run("wageDay()"), k = g.run("traffic()");
    assert.equal(g.run("leHoiCheck()"), true);
    clickText(g, /Mở cửa/);
    assert.equal(g.run("wageDay()"), w * 3);
    assert.ok(g.run("traffic()") > k * 2);
    g.run("window.__ngay = '2026-12-24'; renderPrep()");
    assert.ok(g.w.document.body.classList.contains("le-noel"));
    g.run("S.tr = { che: 'tat' }; truyenLuc('mo_cua')");
    assert.ok(g.run("S.tr.xem['le_noel@2026']") != null);
  } finally {
    g.close();
  }
});

test("Chương 1 cuối: két cạn thì mẹ nhắn gửi tiền; đủ 3 trang thì bà Sáu đưa trang 5", () => {
  const g = boot();
  try {
    g.run("S.day = 13; S.money = 100000; S.tr = { xem: { c0_chia_khoa: 1, c0_chu_tu: 2, c0_khoa: 3, c0_me: 4, c0_co_hanh: 5, c0_tien_nha: 6 } }; truyenLuc('dong_cua')");
    assert.match(card(g).textContent, /Mẹ/);
    for (let k = 0; k < 4 && !card(g).querySelector("[data-ch]"); k++) card(g).querySelector("#trNext").click();
    card(g).querySelector('[data-ch="0"]').click();
    assert.equal(g.run("S.money"), 1100000);
    g.run("S.day = 27; S.tr.trang = [1, 2, 3]; S.tr.homNay = null; S.tr.che = 'tat'; S.tr.xem.c1_sang_nhuong = 20; truyenLuc('mo_cua')");
    assert.ok(g.run("S.tr.trang.includes(5)"));
  } finally {
    g.close();
  }
});

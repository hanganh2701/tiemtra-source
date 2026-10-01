/* Test các chỗ sửa sau lần chơi thử thứ hai (bản 4.8). Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const card = (g) => g.w.document.getElementById("card");
const clickText = (g, re) => {
  const b = [...card(g).querySelectorAll("button")].find((x) => re.test(x.textContent));
  assert.ok(b, "không thấy nút " + re);
  b.click();
};
const canh = (g, id) => `MAU_CHUYEN.find((m) => m.id === '${id}')`;

test("thẻ sự kiện giữ dấu % khi sự kiện không gắn món, vẫn điền tên món khi có", () => {
  const g = boot();
  try {
    assert.equal(g.run("evText({ id: 'weekend' })"), "Khách đông hơn 25%, nhiều người mua 2 ly");
    assert.match(g.run("evText({ id: 'rain' })"), /ít hơn 30%/);
    assert.match(g.run("evText({ id: 'trend', k: 'matcha' })"), /^Matcha được gọi/);
  } finally {
    g.close();
  }
});

test("nhãn chương theo ngày xem: cảnh mặt tiền ngày 20 thuộc Chương 1, nhật ký không lùi chương", () => {
  const g = boot();
  try {
    g.run(`S.day = 20; hienCanh(${canh(g, "c2_mat_tien")}, () => {}, false)`);
    assert.match(card(g).textContent, /Chương 1 · Người trong hẻm/);
    g.run("TT().xem.c0_tien_nha = 6; TT().xem.c2_mat_tien = 20; TT().xem.c1_ket = 26; TT().xem.c2_may = 33");
    const nhan = g.run("[...paneSoTay().matchAll(/Ngày \\d+ · Chương (\\d)/g)].map((m) => +m[1]).join()");
    assert.equal(nhan, "0,1,1,2");
    /* xem lại từ Sổ tay: nhãn theo ngày đã xem, không theo hôm nay */
    g.run(`S.day = 50; hienCanh(${canh(g, "c2_mat_tien")}, () => {}, true)`);
    assert.match(card(g).textContent, /Chương 1/);
  } finally {
    g.close();
  }
});

test("trang 7 luôn tới trước trang 8: Trung Thu ngày 41, cảnh của Vy cần trang 7", () => {
  const g = boot();
  try {
    assert.equal(g.run(`${canh(g, "c2_trung_thu")}.dieuKien.ngay`), 41);
    g.run("S.day = 44; TT().xem.c2_may = 33; TT().trang = [1, 2, 3, 4, 5, 6]");
    assert.equal(g.run(`hopCanh(${canh(g, "c2_vy")}, 'dong_cua')`), false);
    g.run("TT().trang.push(7)");
    assert.equal(g.run(`hopCanh(${canh(g, "c2_vy")}, 'dong_cua')`), true);
  } finally {
    g.close();
  }
});

test("Linh đi Đà Lạt: cảnh chung chỉ có tin nhắn của Linh; cảnh lễ không chen vào tuần đầu", () => {
  const g = boot();
  try {
    const cau = (id) => g.run(`locDong(${canh(g, id)}.thoai).map((d) => d[0] + ':' + d[1]).join('|')`);
    g.run("TT().nhanh.linh = 'B'");
    assert.doesNotMatch(cau("c2_trung_thu"), /linh:Hồi nhỏ em cũng rước đèn/);
    assert.match(cau("c2_trung_thu"), /tin:Linh: Hồi nhỏ em rước đèn/);
    assert.match(cau("le_noel"), /tin:Linh: Đà Lạt Noel/);
    g.run("TT().nhanh.linh = 'A'");
    assert.equal(g.run(`locDong(${canh(g, "c2_mat_tien")}.thoai).filter((d) => d[0] === 'linh').length`), 1);
    assert.equal(g.run(`locDong(${canh(g, "c2_mat_tien")}.thoai).filter((d) => d[0] === 'tin').length`), 0);
    /* Noel theo lịch thật mà mới ngày 2: chưa có cảnh lễ, cảnh chú Tư vẫn tới đúng ngày */
    g.run("window.__ngay = '2026-12-24'; TT().xem.c0_chia_khoa = 1; TT().homNay = 0; S.day = 2");
    assert.equal(g.run("canhKe('mo_cua').id"), "c0_chu_tu");
    g.run("S.day = 8; TT().xem.c0_chu_tu = 2");
    assert.equal(g.run("canhKe('mo_cua').id"), "le_noel");
  } finally {
    g.close();
  }
});

test("lượt 2: bà Sáu nói về Mướp theo lựa chọn ngày 1", () => {
  const g = boot();
  try {
    const cau = () => g.run(`locDong(${canh(g, "lan2_meo")}.thoai).map((d) => d[1]).join('|')`);
    g.run("TT().co.c0_meo = 'vuot'");
    assert.match(cau(), /bữa đầu nó chịu con liền/);
    assert.doesNotMatch(cau(), /chưa cho ai vuốt/);
    g.run("TT().co.c0_meo = 'hoi'");
    assert.match(cau(), /chưa cho ai vuốt/);
  } finally {
    g.close();
  }
});

test("Hẻm 42 lần nữa giữ thời gian bán mỗi ngày, chỉ dẫn và các câu đã hỏi", () => {
  const g = boot();
  try {
    g.run("S.shopName = 'Quán Thử'; S.dayLen = 6; S.coach = false; S.moiCai = 5; S.bakOff = true; S.gopY = { diem: '5' }; TT().ket = { id: 'len_ban_do', ngay: 68 }; S.day = 68");
    g.run("choiLai()");
    assert.equal(g.run("S.day"), 1);
    assert.equal(g.run("S.dayLen"), 6);
    assert.equal(g.run("S.coach"), false);
    assert.equal(g.run("S.moiCai"), 5);
    assert.equal(g.run("S.bakOff"), true);
    assert.equal(g.run("S.gopY.diem"), "5");
  } finally {
    g.close();
  }
});

test("sự cố thường không đổ cho người chơi: không lên kế hoạch tiền ảo, kế hoạch cũ đổi thành tủ mát hư", () => {
  const g = boot();
  try {
    const coCoin = g.run("Array.from({ length: 200 }, () => mkBadPlan(1)).some((p) => p.ev.some((e) => e.id === 'coin'))");
    assert.equal(coCoin, false);
    g.run("S.day = 30; S.money = 5000000; S.badPlan = { start: 1, ev: [{ d: 30, id: 'coin', done: false }] }; R.mode = 'prep'; badCheck()");
    assert.match(card(g).textContent, /Tủ mát hư/);
    assert.doesNotMatch(card(g).textContent, /tiền ảo/);
    assert.match(g.run("BAD.find((b) => b.id === 'coin').all"), /tiền ảo/, "két gian lận vẫn có thể gặp");
  } finally {
    g.close();
  }
});

test("nhắc sao lưu: Để sau thì lần sau cách xa hơn, Đừng nhắc nữa thì thôi hẳn", () => {
  const g = boot();
  try {
    g.run("S.day = 10; bakRemind()");
    assert.match(card(g).textContent, /Sao lưu tiến trình nhé/);
    clickText(g, /Để sau/);
    g.run("S.day = 17; bakRemind()");
    assert.equal(g.run("$('modal').hidden"), true, "chưa tới 14 ngày thì chưa nhắc lại");
    g.run("S.day = 24; bakRemind()");
    assert.match(card(g).textContent, /Sao lưu tiến trình nhé/);
    clickText(g, /Đừng nhắc nữa/);
    g.run("S.day = 90; $('modal').hidden = true; bakRemind()");
    assert.equal(g.run("$('modal').hidden"), true);
  } finally {
    g.close();
  }
});

test("tablet chỉ mua được khi đã mở online; online mở từ ngày 40", () => {
  const g = boot();
  try {
    assert.equal(g.run("CFG.online.fromDay"), 40);
    g.run("S.day = 30; S.money = 50000000; R.tab = 'nangcap'; renderPrep()");
    assert.equal(g.run("!!document.querySelector('[data-tablet]')"), false);
    assert.match(g.w.document.getElementById("pane").textContent, /Đơn onlineMở từ ngày 40/, "nấc Đơn online ở mục Mở rộng báo ngày mở");
    g.run("S.online = true; renderPrep()");
    assert.equal(g.run("!!document.querySelector('[data-tablet]')"), true);
  } finally {
    g.close();
  }
});

test("góp sức cho Hẻm 42: mở theo truyện, góp thì trừ tiền, có ưu đãi, lời cảm ơn, huy hiệu và hiện trước tiệm", () => {
  const g = boot();
  try {
    g.run("S.day = 10; S.money = 20000000; R.mode = 'prep'");
    assert.equal(g.run("GOP_HEM.some(gopMo)"), false);
    assert.equal(g.run("moiGopHem()"), false);
    g.run("S.day = 15");
    assert.equal(g.run("moiGopHem()"), true, "bà Sáu rủ góp lần đầu");
    assert.match(card(g).textContent, /Góp sức cho Hẻm 42/);
    clickText(g, /Xem/);
    assert.equal(g.run("HEM_TAB[R.sub.hem][1] === paneGopHem"), true);
    assert.equal(g.run("moiGopHem()"), false, "chỉ rủ một lần");
    const k0 = g.run("heSoKhachTri()");
    assert.equal(g.run("gopHem('ghe_da')"), false, "chưa thân chú Tư thì chưa góp được");
    assert.equal(g.run("gopHem('den')"), true);
    assert.equal(g.run("S.money"), 17000000);
    assert.ok(g.run("heSoKhachTri()") > k0);
    assert.match(card(g).textContent, /Tối về hẻm sáng trưng/);
    assert.ok(g.run("S.huyHieu.gop_1"));
    g.run("$('modal').hidden = true; R.tab = 'kho'; renderPrep()");
    assert.match(g.w.document.querySelector(".tridai").innerHTML, /Đèn cho con hẻm/);
    assert.equal(g.run("document.body.classList.contains('hem-den')"), true);
    /* mái che mưa: ngày mưa bớt vắng */
    g.run("S.day = 30; S.ev = { id: 'rain' }; S.evDay = 30");
    const mua0 = g.run("heSoKhachTri()");
    g.run("gopHem('mai_che')");
    assert.ok(g.run("heSoKhachTri()") > mua0 * 1.15);
  } finally {
    g.close();
  }
});

test("ra mặt tiền thì giao diện tiệm đổi", () => {
  const g = boot();
  try {
    g.run("R.tab = 'kho'; renderPrep()");
    assert.equal(g.run("document.body.classList.contains('mat-tien')"), false);
    g.run("S.buoc = 2; S.hd = { bd: 20, gia: MAT_TIEN.thue }; renderPrep()");
    assert.equal(g.run("document.body.classList.contains('mat-tien')"), true);
  } finally {
    g.close();
  }
});

test("lời cảm ơn góp hẻm vừa màn hình, nhân vật có thật", () => {
  const g = boot();
  try {
    const bad = g.run(`GOP_HEM.flatMap((d) => d.cam.filter(([ai, cau]) => (ai !== "_" && ai !== "tin" && !NHAN_VAT[ai]) || cau.replace(/\\{\\w+\\}/g, "anh").length > 72).map(() => d.id)).join()`);
    assert.equal(bad, "");
  } finally {
    g.close();
  }
});

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
    assert.match(g.run("evText({ id: 'trend', k: 'matcha' })"), /^matcha được gọi/);
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

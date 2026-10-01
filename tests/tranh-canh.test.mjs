/* Test tranh cảnh truyện (bản 5.6). Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

test("bảng bối cảnh chỉ nhắc cảnh có thật và bối cảnh có vẽ", () => {
  const g = boot();
  try {
    const sai = g.run(`Object.entries(TRANH_CANH).filter(([id, t]) => !MAU_CHUYEN.some((m) => m.id === id) || (t.nen && !TC_NEN[t.nen])).map(([id]) => id).join(",")`);
    assert.equal(sai, "");
  } finally {
    g.close();
  }
});

test("mọi cảnh truyện đều có tranh, không lỗi; tin nhắn là điện thoại, về quê là quê, Tết có hoa mai, tối có trăng", () => {
  const g = boot();
  try {
    const kq = JSON.parse(
      g.run(`JSON.stringify(MAU_CHUYEN.map((m) => { const h = tranhCanh(m); const t = tranhCua(m); return { id: m.id, ok: /<svg class="tcsvg"/.test(h) && /<\\/svg>/.test(h), nen: t.nen, gio: t.gio, them: t.them, nguoi: t.nguoi }; }))`),
    );
    assert.ok(kq.length >= 85, "đủ mọi cảnh: " + kq.length);
    assert.deepEqual(kq.filter((x) => !x.ok).map((x) => x.id), []);
    const tim = (id) => kq.find((x) => x.id === id);
    assert.equal(tim("c0_me").nen, "dienthoai");
    assert.equal(tim("que_2").nen, "que");
    assert.equal(tim("que_1").nen, "benxe");
    assert.ok(tim("que_1").them.includes("tet"));
    assert.ok(tim("le_trung_thu").them.includes("trungthu"));
    assert.ok(tim("khoa_2").them.includes("mua"), "cảnh ngày mưa của Khoa");
    assert.equal(tim("khoa_1").gio, "toi", "cảnh sau giờ đóng cửa là buổi tối");
    assert.equal(tim("c0_chia_khoa").gio, "sang");
    assert.ok(kq.every((x) => x.nguoi.length <= 4));
    assert.deepEqual(tim("c0_chia_khoa").nguoi, ["sau"]);
    assert.deepEqual(tim("gui_1").nguoi, ["me_gap"], "tin nhắn của mẹ hiện mặt mẹ");
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("tranh theo diễn biến: đầu hẻm trước khi Mây Tea mở là mặt bằng cho thuê; ra mặt tiền rồi thì quầy là kiosk có tên tiệm", () => {
  const g = boot();
  try {
    const m = "MAU_CHUYEN.find((x) => x.id === 'c1_sang_nhuong')";
    assert.match(g.run(`tranhCanh(${m})`), /CHO THUÊ/);
    g.run("TT().xem.c2_may = 33");
    assert.match(g.run(`tranhCanh(${m})`), /Mây Tea/);
    g.run("S.shopName = 'Quán Mây Hồng'");
    const q = "MAU_CHUYEN.find((x) => x.id === 'khoa_1')";
    assert.equal(g.run(`tranhCua(${q}).nen`), "quay");
    g.run("S.buoc = 2");
    assert.equal(g.run(`tranhCua(${q}).nen`), "mattien");
    assert.match(g.run(`tranhCanh(${q})`), /Quán Mây Hồng/);
  } finally {
    g.close();
  }
});

test("thẻ truyện có tranh ở cả hai kiểu đọc; đọc từng câu thì người đang nói nhô lên", () => {
  const g = boot();
  try {
    g.run("S.tr = S.tr || {}; S.tr.che = 'day'; S.kl = S.kl || {}; S.kl.daDoc = {}; hienCanh(MAU_CHUYEN.find((m) => m.id === 'c0_khoa'), () => {}, false)");
    assert.ok(g.run("!!document.querySelector('#card .tctranh svg')"));
    assert.equal(g.run("document.querySelector('#card .tcmat.noi').dataset.ai"), "khoa");
    g.run("$('modal').hidden = true; S.tr.che = 'gon'; hienCanh(MAU_CHUYEN.find((m) => m.id === 'c2_nga_re'), () => {}, false)");
    assert.ok(g.run("!!document.querySelector('#card .tctranh svg')"));
    assert.equal(g.run("[...document.querySelectorAll('#card .tcmat')].map((x) => x.dataset.ai).join(',')"), "vy,hanh");
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

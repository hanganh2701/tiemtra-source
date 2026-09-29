/* Test các chỗ sửa sau lần chơi thử bản 5.2 của Claude (bản 5.2.1). Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const card = (g) => g.w.document.getElementById("card");
const pane = (g) => g.w.document.getElementById("pane");
const clickText = (g, re) => {
  const b = [...card(g).querySelectorAll("button")].find((x) => re.test(x.textContent));
  assert.ok(b, "không thấy nút " + re);
  b.click();
};
/* tiệm có thu nhập đều 7 ngày gần nhất: mỗi ngày lãi khoảng 3 triệu */
const coThuNhap = `S.history = Array.from({ length: 7 }, (_, i) => { const r = newRec(i + 1); r.sales = { tra: { q: 100, a: 5000000 } }; r.ing = { tra: { q: 100, v: 2000000 } }; r.rent = 0; r.util = 0; r.fee = 0; r.tax = 0; r.served = 100; return r; })`;

test("mua xe là chi tiêu của bạn, không phải lỗ của tiệm: thẻ cuối ngày và tổng kết tách riêng, có tên món", () => {
  const g = boot();
  try {
    g.run("S.money = 30000000; muaDs('xm', 'wave'); $('modal').hidden = true");
    assert.equal(g.run("S.cur.equip.length"), 0, "xe không nằm trong trang bị của tiệm");
    assert.equal(g.run("recCaNhan(S.cur)"), 22500000);
    g.run("S.tr = { che: 'tat' }; __openDay(); R.slots = R.slots.map(() => null); closeEarly()");
    const t = card(g).textContent;
    assert.match(t, /Lãi của tiệm/);
    assert.match(t, /Chi tiêu của bạn/);
    assert.match(t, /Mua Honda Wave Alpha/);
    const r = g.run("S.history[S.history.length - 1]");
    assert.ok(g.run(`recCost(${JSON.stringify(r)})`) < 1000000, "chi phí của tiệm không gồm tiền xe");
    g.run("$('modal').hidden = true; R.tab = 'tongket'; R.sumMode = 'day'; R.sumIdx = null; renderPrep()");
    const p = pane(g).textContent;
    assert.match(p, /Lợi nhuận của tiệm/);
    assert.match(p, /Mua sắm, quà cho ba mẹ/);
    assert.match(p, /Còn lại sau chi tiêu/);
    assert.doesNotMatch(p.split("Chi tiêu của bạn")[0], /Honda Wave/, "xe không nằm trong mục máy móc, trang bị");
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("mua đúng món mục tiêu: mục tiêu xong, thanh mục tiêu ở màn chuẩn bị biến mất; mục tiêu trả góp mở sẵn Trả góp", () => {
  const g = boot();
  try {
    g.run("S.money = 10000000; S.ds = null; dsS().muc = { dong: 'xm', id: 'wave', gop: false }; R.tab = 'kho'; renderPrep()");
    assert.ok(g.run("!!document.querySelector('.dsmucnho')"));
    g.run("S.money = 30000000; muaDs('xm', 'wave')");
    clickText(g, /Tiếp tục/);
    assert.equal(g.run("S.ds.muc"), null);
    assert.equal(g.run("!!document.querySelector('.dsmucnho')"), false, "không còn thanh 'Đủ tiền rồi'");
    /* mục tiêu ô tô trả góp: bấm vào thì bảng chi tiết mở ở Trả góp */
    g.run(coThuNhap);
    g.run("S.money = 50000000; R.dsCach = 'thang'; dsS().muc = { dong: 'ot', id: 'vf3', gop: true }; refreshPrep(1)");
    g.run("document.querySelector('.dsmucnho [data-dsxem]').click()");
    assert.match(card(g).textContent, /Góp mỗi ngày trong 5 năm/);
  } finally {
    g.close();
  }
});

test("tiêu đề khối nói rõ: thiếu tiền trả trước khi vay, hay đã tính tiền bán xe cũ", () => {
  const g = boot();
  try {
    g.run(coThuNhap);
    g.run("S.money = 60000000; R.tab = 'doisong'; R.dsMo = null; renderPrep()");
    const ot = g.run("document.getElementById('dsk-ot').textContent");
    assert.match(ot, /Tiếp: VinFast VF 3 · 315 triệu · trả trước 94,5tr/);
    assert.match(ot, /Thiếu 34,5tr trả trước/);
    g.run("muaDs('xm', 'wave'); $('modal').hidden = true; S.money = 20000000; renderPrep()");
    assert.match(g.run("document.getElementById('dsk-xm').textContent"), /Tiếp: Honda Vision · 33 triệu · bán xe cũ được 15,8tr/);
  } finally {
    g.close();
  }
});

test("ngân hàng và ước lượng số ngày bỏ qua ngày nghỉ Tết", () => {
  const g = boot();
  try {
    g.run(coThuNhap);
    const truoc = g.run("thuNhapNgay()");
    g.run("[8, 9, 10].forEach((d) => { const r = newRec(d); r.nghi = true; S.history.push(r); })");
    assert.equal(g.run("thuNhapNgay()"), truoc);
  } finally {
    g.close();
  }
});

test("sao của tiệm đông: một buổi kẹt khách không kéo tụt sao cả tiệm", () => {
  const g = boot();
  try {
    /* hai ngày gần nhất 240 đánh giá 5 sao, rồi 40 đánh giá 1 sao cuối buổi */
    g.run(`S.day = 50; S.reviews = [];
      for (let i = 0; i < 240; i++) S.reviews.unshift({ s: 5, d: i < 120 ? 48 : 49 });
      for (let i = 0; i < 40; i++) S.reviews.unshift({ s: 1, d: 49 });`);
    assert.ok(g.run("rating()") > 4.3, "sao " + g.run("rating()"));
    /* tiệm nhỏ vẫn tính 40 đánh giá gần nhất */
    g.run("S.reviews = S.reviews.slice(0, 30).concat(Array.from({ length: 60 }, () => ({ s: 5, d: 10 })))");
    assert.equal(g.run("Math.round(rating() * 100) / 100"), Math.round(((30 * 1 + 10 * 5) / 40) * 100) / 100);
  } finally {
    g.close();
  }
});

test("thuê mặt tiền: nhắc khi thuê xong két còn ít, thông báo đúng là mở cửa ở chỗ mới ngay", () => {
  const g = boot();
  try {
    g.run("S.day = 25; S.reviews = Array.from({ length: 40 }, () => ({ s: 5, d: 24 })); S.money = tienCoc() + MAT_TIEN.trangTri + 200000; thueMatTien()");
    assert.match(card(g).textContent, /có thể không đủ nấu hàng/);
    clickText(g, /Thuê luôn/);
    assert.match(g.w.document.body.textContent, /Mở cửa là bán ở chỗ mới/);
    g.run("S.buoc = 1; S.money = tienCoc() + MAT_TIEN.trangTri + 5000000; thueMatTien()");
    assert.doesNotMatch(card(g).textContent, /không đủ nấu hàng/);
  } finally {
    g.close();
  }
});

test("chuyện nhà ở quê: nhãn riêng, không lặp câu ba xách giỏ, hậu truyện của mẹ nhắc cả Tết lẫn tiền gửi", () => {
  const g = boot();
  try {
    assert.equal(g.run("MAU_CHUYEN.filter((m) => /^gui_/.test(m.id)).every((m) => m.nhan === 'Chuyện nhà ở quê')"), true);
    g.run("TT().co.ba_khoe = true");
    const q1 = g.run("locDong(MAU_CHUYEN.find((m) => m.id === 'que_1').thoai).map((d) => d[1]).join('|')");
    assert.equal((q1.match(/giỏ/g) || []).length, 1, q1);
    g.run("TT().co.gui_da = true; TT().nhanh.tet = 'A'");
    assert.match(g.run("hauTruyen().find((h) => h.ai === 'me_gap').chu"), /Tết sau.*mứt gừng/);
    g.run("TT().nhanh.tet = 'B'; TT().co.me_len = true");
    assert.match(g.run("hauTruyen().find((h) => h.ai === 'me_gap').chu"), /Mẹ lên thăm về.*Lưng ba khỏi hẳn/);
  } finally {
    g.close();
  }
});

test("tăng giá đồ uống: khách vắng dần theo giá, không nhảy bậc ở 40k; ly đắt hơn gợi ý trên 20% thì có người bỏ đi; tab Giá bán báo", () => {
  const g = boot();
  try {
    const hs = (i) => g.run(`heSoGiaKhach(${i})`);
    assert.equal(hs(1), 1);
    assert.ok(hs(0.85) > 1.15 && hs(0.85) < 1.2, "rẻ hơn 15% thì đông hơn khoảng 18%");
    assert.ok(hs(1.1) > 0.88 && hs(1.1) < 0.92, "đắt hơn 10% thì bớt khoảng 10%");
    assert.ok(hs(1.3) > 0.55 && hs(1.3) < 0.62, "đắt hơn 30% thì bớt khoảng 42%");
    assert.equal(hs(1.6), 0.3);
    /* trà 39k (sát mức 40k cũ) không còn là mẹo: khách vắng hẳn */
    g.run("S.day = 30; S.unlocked = { ...S.unlocked, tra: true }; BASE_KEYS.forEach((k) => S.sell[k] = DEF_SELL[k])");
    const k0 = g.run("traffic()");
    g.run("BASE_KEYS.forEach((k) => { if (S.unlocked[k]) S.sell[k] = k === 'matcha' ? 49000 : 39000; })");
    assert.ok(g.run("traffic()") < k0 * 0.5, "giá sát 40k thì khách còn chưa tới một nửa");
    assert.ok(g.run("itemPricey('tra')"), "trà 39k là đắt (130% giá gợi ý)");
    /* một ly đắt hơn gợi ý 25%: có khoảng 6% khách bỏ đi; đúng giá gợi ý thì không ai bỏ đi vì giá */
    const o = { base: "tra", flav: null, tops: [], cheese: false, size: "M" };
    g.run("BASE_KEYS.forEach((k) => S.sell[k] = DEF_SELL[k])");
    assert.equal(g.run(`tiLeBoDiGia(${JSON.stringify(o)})`), 0);
    g.run("S.sell.tra = Math.round(DEF_SELL.tra * 1.25)");
    assert.ok(Math.abs(g.run(`tiLeBoDiGia(${JSON.stringify(o)})`) - 0.06) < 0.01);
    g.run("R.tab = 'gia'; renderPrep()");
    assert.match(g.w.document.getElementById("giaWarn").textContent, /cao hơn giá gợi ý \d+% · khách ghé ít hơn khoảng \d+%/);
  } finally {
    g.close();
  }
});

test("giá nhập: giáp Tết tăng 20%, qua Tết còn 10% và báo một lần; Thư giãn không đổi", () => {
  const g = boot();
  try {
    g.run("S.day = 62");
    assert.equal(g.run("heSoGiaNhap()"), 1.2);
    g.run("TT().xem.c3_ket = 68; S.day = 69");
    assert.equal(g.run("heSoGiaNhap()"), 1.1);
    assert.match(g.run("doKhoCuoiNgay()"), /Qua Tết/);
    assert.equal(g.run("doKhoCuoiNgay()"), "");
    g.run("delete TT().xem.c3_ket; S.day = 80");
    assert.equal(g.run("heSoGiaNhap()"), 1.1, "từ ngày 75 cũng tính là qua Tết");
    g.run("S.thuGian = true");
    assert.equal(g.run("heSoGiaNhap()"), 1);
  } finally {
    g.close();
  }
});

test("trang bị và mặt bằng theo giá ngoài đời, cùng thang với tab Đời sống", () => {
  const g = boot();
  try {
    const gia = (id) => g.run(`UPG.find((u) => u.id === '${id}').cost`);
    assert.ok(gia("ac") >= 8000000, "máy lạnh cho tiệm không rẻ hơn máy lạnh tặng ba mẹ quá nhiều");
    assert.ok(gia("sealer") >= 5000000 && gia("sign") >= 2000000 && gia("slot4") >= 5000000);
    assert.ok(g.run("MAT_TIEN.thue * 30") >= 8000000, "mặt tiền từ 8 triệu/tháng");
    assert.ok(g.run("CN_LOAI.every((L) => cnTien(L) >= 40000000)"), "mở chi nhánh cỡ vài chục triệu trở lên");
    assert.equal(g.run("MAT_TIEN.hopDong"), 180);
  } finally {
    g.close();
  }
});

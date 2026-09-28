/* Test tab Đời sống: chỗ ở, đi lại, điện thoại, đồ cho bản thân, quà cho gia đình, tiền sinh hoạt (bản 5.0). Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const card = (g) => g.w.document.getElementById("card");
const clickText = (g, re) => {
  const b = [...card(g).querySelectorAll("button")].find((x) => re.test(x.textContent));
  assert.ok(b, "không thấy nút " + re);
  b.click();
};

test("mới vào game: ở ghép phòng trọ, đi xe đạp, mỗi ngày tốn 40k; Thư giãn thì miễn", () => {
  const g = boot();
  try {
    assert.equal(g.run("dsHien('o').id"), "tro_ghep");
    assert.equal(g.run("dsHien('xe').id"), "xe_dap");
    assert.equal(g.run("dsTienNgay()"), 40000);
    g.run("S.thuGian = true");
    assert.equal(g.run("dsTienNgay()"), 0);
  } finally {
    g.close();
  }
});

test("tiền sinh hoạt trừ lúc đóng cửa, ghi vào sổ, thẻ cuối ngày và tổng kết có dòng riêng", () => {
  const g = boot();
  try {
    g.run("S.tr = { che: 'tat' }; __openDay(); R.slots = R.slots.map(() => null)");
    g.run("closeEarly()");
    const r = g.run("S.history[S.history.length - 1]");
    assert.equal(r.song, 40000);
    assert.match(card(g).textContent, /Sinh hoạt: ăn, ở, đi lại/);
    g.run("$('modal').hidden = true; R.tab = 'tongket'; R.sumMode = 'day'; R.sumIdx = null; renderPrep()");
    assert.match(g.w.document.getElementById("pane").textContent, /Sinh hoạt của bạn/);
  } finally {
    g.close();
  }
});

test("dọn nhà: trả cọc chỗ mới, lấy lại cọc chỗ cũ; có chỗ rộng thì Tết ba mẹ ở lại; không dọn xuống nấc thấp", () => {
  const g = boot();
  try {
    g.run("S.money = 10000000");
    assert.equal(g.run("muaDs('o', 'tro_rieng')"), true);
    assert.equal(g.run("S.money"), 10000000 - 900000);
    assert.match(card(g).textContent, /bà cũng kêu con dậy nấu hàng/);
    g.run("$('modal').hidden = true");
    assert.equal(g.run("muaDs('o', 'can_ho_thue')"), true);
    assert.equal(g.run("S.money"), 10000000 - 3300000, "cọc phòng trọ đã lấy lại");
    assert.equal(g.run("dsTienNgay()"), 20000 + 110000);
    assert.equal(g.run("TT().co.ds_nha_rong"), true);
    assert.equal(g.run("muaDs('o', 'tro_rieng')"), false);
    assert.equal(g.run("locDong(MAU_CHUYEN.find((m) => m.id === 'le_tet').thoai).filter((d) => /ngủ lại nhà con/.test(d[1])).length"), 1);
  } finally {
    g.close();
  }
});

test("đổi xe bán lại xe cũ một nửa; xe máy làm giá nhập rẻ hơn, ô tô đỡ tiền hàng chi nhánh", () => {
  const g = boot();
  try {
    g.run("S.money = 100000000");
    const gia0 = g.run("ecost('tra')");
    g.run("muaDs('xe', 'xe_so'); $('modal').hidden = true");
    assert.equal(g.run("S.money"), 100000000 - 3500000);
    assert.equal(g.run("ecost('tra')"), Math.round(gia0 * 0.97 * 1000) / 1000);
    g.run("muaDs('xe', 'o_to_cu'); $('modal').hidden = true");
    assert.equal(g.run("S.money"), 100000000 - 3500000 - (60000000 - 1750000));
    assert.equal(g.run("dsHangCn()"), 0.9);
    assert.ok(g.run("S.cur.equip.some((e) => e.v === -1750000)"), "tiền bán lại xe cũ trừ vào chi phí");
    assert.equal(g.run("TT().co.ds_o_to"), true);
  } finally {
    g.close();
  }
});

test("điện thoại chụp ảnh đẹp: khách đặt app chờ lâu hơn, khách ghé nhiều hơn", () => {
  const g = boot();
  try {
    g.run("S.money = 20000000; S.day = 20");
    const t0 = g.run("traffic()");
    g.run("muaDs('dt', 'dt_xin'); $('modal').hidden = true");
    assert.equal(g.run("dsChoOnl()"), 1.1);
    assert.ok(g.run("traffic()") > t0 * 1.02);
  } finally {
    g.close();
  }
});

test("đồ cho bản thân có người trong hẻm nhận xét; quà gia đình có tin nhắn mẹ, đủ 3 món thì có huy hiệu, hậu truyện nhắc", () => {
  const g = boot();
  try {
    g.run("S.money = 100000000");
    assert.equal(g.run("muaDs('do', 'dong_ho_xin')"), true);
    assert.match(card(g).textContent, /mấy trăm ly trà sữa/);
    assert.equal(g.run("muaDs('do', 'dong_ho_xin')"), false, "mua một lần");
    ["qua_ao_dai", "qua_dong_ho", "qua_mai_nha"].forEach((id) => g.run(`$('modal').hidden = true; muaDs('qua', '${id}')`));
    assert.match(card(g).textContent, /Mẹ: Mưa bão mà nhà hết dột/);
    assert.ok(g.run("S.huyHieu.hieu_thao"));
    assert.match(g.run("hauTruyen().find((h) => h.ai === 'me_gap').chu"), /Mưa lớn mà ba ngủ ngon/);
    assert.equal(g.run("locDong(MAU_CHUYEN.find((m) => m.id === 'que_2').thoai).length"), 6, "về quê thấy mái nhà mới");
  } finally {
    g.close();
  }
});

test("tab Đời sống vẽ được, bấm mua trong tab chạy; làm mới tab Hẻm 42 không lỗi", () => {
  const g = boot();
  try {
    g.run("S.money = 5000000; R.tab = 'kho'; renderPrep()");
    g.run("document.querySelector('[data-tab=\"doisong\"]').click()");
    assert.match(g.w.document.getElementById("pane").textContent, /Chỗ ở.*Đi lại.*Điện thoại.*Cho bản thân.*Quà cho gia đình/s);
    g.run("document.querySelector('[data-ds=\"xe:xe_so\"]').click()");
    assert.equal(g.run("dsHien('xe').id"), "xe_so");
    clickText(g, /Tiếp tục/);
    assert.match(g.w.document.getElementById("pane").textContent, /Đang dùng/);
    /* trước bản 5.0, làm mới lúc đang ở tab Hẻm 42 (góp hẻm xong bấm Tiếp tục) bị lỗi */
    g.run("R.tab = 'hem'; renderPrep(); refreshPrep()");
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("câu nhận xét và tin nhắn mẹ vừa màn hình, nhân vật có thật", () => {
  const g = boot();
  try {
    const bad = g.run(`[...DS_O, ...DS_XE, ...DS_DT, ...DS_DO].filter((x) => x.phan).map((x) => [x.id, x.phan])
      .concat(DS_QUA.map((x) => [x.id, ["tin", x.tin]]))
      .filter(([, [ai, cau]]) => (ai !== "_" && ai !== "tin" && !NHAN_VAT[ai]) || cau.replace(/\\{\\w+\\}/g, "anh").length > 72)
      .map(([id]) => id).join()`);
    assert.equal(bad, "");
  } finally {
    g.close();
  }
});

/* Test tab Đời sống: thuê chỗ ở, mua nhà, xe máy, ô tô (giá thật, trả góp), điện thoại, đồ cho bản thân,
   quà cho gia đình, tiền sinh hoạt (bản 5.0, 5.1). Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const card = (g) => g.w.document.getElementById("card");
const clickText = (g, re) => {
  const b = [...card(g).querySelectorAll("button")].find((x) => re.test(x.textContent));
  assert.ok(b, "không thấy nút " + re);
  b.click();
};
/* tiệm có thu nhập đều 7 ngày gần nhất: mỗi ngày lãi khoảng 3 triệu */
const coThuNhap = `S.history = Array.from({ length: 7 }, (_, i) => { const r = newRec(i + 1); r.sales = { tra: { q: 100, a: 5000000 } }; r.ing = { tra: { q: 100, v: 2000000 } }; r.rent = 0; r.util = 0; r.fee = 0; r.tax = 0; return r; })`;

test("mới vào game: ở ghép phòng trọ, đi xe đạp, chưa có nhà, xe hơi; mỗi ngày tốn 40k; Thư giãn thì miễn", () => {
  const g = boot();
  try {
    assert.equal(g.run("dsO().id"), "tro_ghep");
    assert.equal(g.run("dsXm().id"), "xe_dap");
    assert.equal(g.run("dsNha()"), null);
    assert.equal(g.run("dsOt()"), null);
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
    g.run("S.tr = { che: 'tat' }; __openDay(); R.slots = R.slots.map(() => null); closeEarly()");
    assert.equal(g.run("S.history[S.history.length - 1].song"), 40000);
    assert.match(card(g).textContent, /Sinh hoạt: ăn, ở, đi lại/);
    g.run("$('modal').hidden = true; R.tab = 'tongket'; R.sumMode = 'day'; R.sumIdx = null; renderPrep()");
    assert.match(g.w.document.getElementById("pane").textContent, /Sinh hoạt của bạn/);
  } finally {
    g.close();
  }
});

test("thuê chỗ ở: trả cọc chỗ mới, lấy lại cọc chỗ cũ; có chỗ rộng thì Tết ba mẹ ở lại", () => {
  const g = boot();
  try {
    g.run("S.money = 10000000");
    assert.equal(g.run("muaDs('tro', 'tro_rieng')"), true);
    assert.equal(g.run("S.money"), 10000000 - 900000);
    assert.match(card(g).textContent, /bà cũng kêu con dậy nấu hàng/);
    g.run("$('modal').hidden = true; muaDs('tro', 'can_ho_thue')");
    assert.equal(g.run("S.money"), 10000000 - 3300000, "cọc phòng trọ đã lấy lại");
    assert.equal(g.run("TT().co.ds_nha_rong"), true);
    assert.equal(g.run("muaDs('tro', 'tro_rieng')"), false, "không dọn xuống nấc thấp");
    assert.equal(g.run("locDong(MAU_CHUYEN.find((m) => m.id === 'le_tet').thoai).filter((d) => /ngủ lại nhà con/.test(d[1])).length"), 1);
  } finally {
    g.close();
  }
});

test("nhà có diện tích, số phòng, giá thật; mua thẳng thì trả đủ giá, lấy lại cọc chỗ thuê, dọn khỏi chỗ thuê", () => {
  const g = boot();
  try {
    const nha = g.run("DS_NHA.find((x) => x.id === 'ch44')");
    assert.equal(nha.dt, 44);
    assert.ok(nha.gia >= 2e9, "giá căn hộ theo giá ngoài đời");
    g.run("S.money = 3000000000; muaDs('tro', 'tro_rieng'); $('modal').hidden = true");
    const m0 = g.run("S.money");
    assert.equal(g.run("muaDs('nha', 'ch44')"), true);
    assert.equal(g.run("S.money"), m0 - 2200000000 + 900000);
    assert.equal(g.run("dsO().id"), "ch44");
    assert.equal(g.run("dsTienNgay()"), 20000 + 25000);
    assert.equal(g.run("TT().co.ds_co_nha"), true);
    assert.ok(g.run("S.huyHieu.an_cu"));
    assert.equal(g.run("muaDs('tro', 'can_ho_thue')"), false, "đã có nhà thì không thuê");
  } finally {
    g.close();
  }
});

test("trả góp: trả trước 30%, góp mỗi ngày có lãi, ngân hàng chỉ cho góp tới nửa thu nhập; trả hết nợ được", async () => {
  const g = boot();
  try {
    g.run("S.money = 200000000");
    assert.match(g.run("dsKhongDuoc('ot', DS_OT.find((x) => x.id === 'morning'), true)"), /nửa thu nhập/, "chưa có thu nhập thì chưa cho vay");
    g.run(coThuNhap);
    assert.equal(g.run("dsKhongDuoc('ot', DS_OT.find((x) => x.id === 'morning'), true)"), "");
    const t = g.run("dsTinh('ot', DS_OT.find((x) => x.id === 'morning'), true)");
    assert.equal(t.can + t.vay, 389000000);
    assert.equal(t.vay, Math.round((389000000 * 0.7) / 1000) * 1000);
    assert.ok(t.gop > 150000 && t.gop < 250000, "góp mỗi ngày: " + t.gop);
    /* hỏi lại trước khi mua, bấm Vay và mua */
    g.run("hoiMuaDs('ot', 'morning', true)");
    assert.match(card(g).textContent, /Góp mỗi ngày/);
    clickText(g, /Vay và mua/);
    await new Promise((ok) => setTimeout(ok, 80));
    assert.equal(g.run("dsOt().id"), "morning");
    assert.equal(g.run("S.ds.vay.ot.con"), t.vay);
    /* một ngày góp: nợ giảm, sổ ghi tiền góp */
    g.run("$('modal').hidden = true; window.__r = newRec(S.day); doiSongCuoiNgay(__r)");
    assert.equal(g.run("__r.gop"), t.gop);
    assert.ok(g.run("S.ds.vay.ot.con") < t.vay);
    /* nhà quá sức thì không cho */
    assert.match(g.run("dsKhongDuoc('nha', DS_NHA.find((x) => x.id === 'ch100'), true)"), /nửa thu nhập|Chưa đủ tiền/);
    g.run("S.money = 1000000000; traHetVay('ot')");
    assert.equal(g.run("S.ds.vay.ot"), undefined);
  } finally {
    g.close();
  }
});

test("đổi xe bán lại xe cũ 70%; xe máy làm giá nhập rẻ hơn, ô tô đỡ tiền hàng chi nhánh, Porsche 911 hai cửa thì không", () => {
  const g = boot();
  try {
    g.run("S.money = 20000000000");
    const gia0 = g.run("ecost('tra')");
    g.run("muaDs('xm', 'wave'); $('modal').hidden = true");
    assert.equal(g.run("ecost('tra')"), Math.round(gia0 * 0.97 * 1000) / 1000);
    const m0 = g.run("S.money");
    g.run("muaDs('xm', 'sh'); $('modal').hidden = true");
    assert.equal(m0 - g.run("S.money"), 95000000 - Math.round(18500000 * 0.7 / 1000) * 1000);
    g.run("muaDs('ot', 'vios'); $('modal').hidden = true");
    assert.equal(g.run("dsHangCn()"), 0.9);
    g.run("muaDs('ot', 'p911'); $('modal').hidden = true");
    assert.equal(g.run("dsHangCn()"), 1);
    assert.equal(g.run("muaDs('ot', 'vios')"), false, "không đổi xuống xe rẻ hơn");
    assert.equal(g.run("TT().co.ds_o_to"), true);
  } finally {
    g.close();
  }
});

test("bản lưu 5.0 đã mua nhà xe giá cũ: hoàn lại tiền, báo một lần", () => {
  const g = boot();
  try {
    g.run("S.money = 1000000; S.ds = { o: 'can_ho', xe: 'o_to_cu', dt: 'dt_tot', do: {}, qua: { qua_ao_dai: 5 }, coc: 0 }");
    assert.equal(g.run("dsO().id"), "can_ho_thue");
    assert.equal(g.run("dsOt()"), null);
    assert.equal(g.run("S.money"), 1000000 + 180000000 + 60000000);
    assert.equal(g.run("S.ds.qua.qua_ao_dai"), 5, "quà đã tặng vẫn giữ");
    g.run("R.mode = 'prep'");
    assert.equal(g.run("dsBaoHoan()"), true);
    assert.match(card(g).textContent, /240 triệu/);
    assert.equal(g.run("dsBaoHoan()"), false);
  } finally {
    g.close();
  }
});

test("quà gia đình có tin nhắn mẹ, đủ 3 món thì có huy hiệu, hậu truyện nhắc; đồ cho bản thân có người nhận xét", () => {
  const g = boot();
  try {
    g.run("S.money = 100000000");
    assert.equal(g.run("muaDs('do', 'dong_ho_xin')"), true);
    assert.match(card(g).textContent, /mấy trăm ly trà sữa/);
    ["qua_ao_dai", "qua_dong_ho", "qua_mai_nha"].forEach((id) => g.run(`$('modal').hidden = true; muaDs('qua', '${id}')`));
    assert.match(card(g).textContent, /Mẹ: Mưa bão mà nhà hết dột/);
    assert.ok(g.run("S.huyHieu.hieu_thao"));
    assert.match(g.run("hauTruyen().find((h) => h.ai === 'me_gap').chu"), /Mưa lớn mà ba ngủ ngon/);
  } finally {
    g.close();
  }
});

test("tab Đời sống có hình nhà xe, bấm mua chạy; làm mới tab Hẻm 42 không lỗi", () => {
  const g = boot();
  try {
    g.run("S.money = 50000000; R.tab = 'kho'; renderPrep()");
    g.run("document.querySelector('[data-tab=\"doisong\"]').click()");
    const pane = g.w.document.getElementById("pane");
    assert.match(pane.textContent, /Thuê chỗ ở.*Mua nhà.*Xe máy.*Ô tô.*Điện thoại.*Cho bản thân.*Quà cho gia đình/s);
    assert.match(pane.textContent, /Porsche 911 Carrera/);
    assert.match(pane.textContent, /44m² · 1 phòng ngủ/);
    assert.ok(pane.querySelectorAll("svg.dshinh").length >= DS_count(g), "mỗi nhà, xe có hình");
    g.run("document.querySelector('[data-ds=\"xm:wave\"]').click()");
    assert.equal(g.run("dsXm().id"), "wave");
    clickText(g, /Tiếp tục/);
    g.run("R.tab = 'hem'; renderPrep(); refreshPrep()");
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});
const DS_count = (g) => g.run("DS_TRO.length + DS_NHA.length + DS_XM.length + DS_OT.length");

test("câu nhận xét và tin nhắn mẹ vừa màn hình, nhân vật có thật; hình vẽ không lỗi", () => {
  const g = boot();
  try {
    const bad = g.run(`[...DS_TRO, ...DS_NHA, ...DS_XM, ...DS_OT, ...DS_DT, ...DS_DO].filter((x) => x.phan).map((x) => [x.id, x.phan])
      .concat(DS_QUA.map((x) => [x.id, ["tin", x.tin]]))
      .filter(([, [ai, cau]]) => (ai !== "_" && ai !== "tin" && !NHAN_VAT[ai]) || cau.replace(/\\{\\w+\\}/g, "anh").length > 72)
      .map(([id]) => id).join()`);
    assert.equal(bad, "");
    assert.equal(g.run("[...DS_TRO, ...DS_NHA].every((x) => /<svg/.test(hinhNha(x)) && !/NaN|undefined/.test(hinhNha(x)))"), true);
    assert.equal(g.run("[...DS_XM, ...DS_OT].every((x) => /<svg/.test(hinhXe(x)) && !/NaN|undefined/.test(hinhXe(x)))"), true);
  } finally {
    g.close();
  }
});

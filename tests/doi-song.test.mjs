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
    assert.match(g.run("dsKhongDuoc('ot', DS_OT.find((x) => x.id === 'morning'), true)"), /Ngân hàng cần xem thu nhập/, "chưa có thu nhập thì chưa cho vay");
    g.run(coThuNhap);
    assert.equal(g.run("dsKhongDuoc('ot', DS_OT.find((x) => x.id === 'morning'), true)"), "");
    const t = g.run("dsTinh('ot', DS_OT.find((x) => x.id === 'morning'), true)");
    assert.equal(t.can + t.vay, 389000000);
    assert.equal(t.vay, Math.round((389000000 * 0.7) / 1000) * 1000);
    assert.ok(t.gop > 150000 && t.gop < 250000, "góp mỗi ngày: " + t.gop);
    /* bảng chi tiết: chọn Trả góp thì hiện tiền vay, tiền góp mỗi ngày; bấm Vay và mua */
    g.run("xemDs('ot', 'morning')");
    clickText(g, /^Trả góp/);
    assert.match(card(g).textContent, /Góp mỗi ngày trong 5 năm/);
    clickText(g, /^Vay và mua · trả 116,7 triệu/);
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
    assert.equal(m0 - g.run("S.money"), 95000000 - Math.round(22500000 * 0.7 / 1000) * 1000);
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
    g.run("S.money = 1000000; S.ds = { o: 'can_ho', xe: 'o_to_cu', dt: 'dt_tot', do: { ao: 3, dong_ho_xin: 4 }, qua: { qua_ao_dai: 5 }, coc: 0 }");
    assert.equal(g.run("dsO().id"), "can_ho_thue");
    assert.equal(g.run("dsOt()"), null);
    assert.equal(g.run("dsDt().id"), "dt_cu");
    assert.equal(g.run("S.money"), 1000000 + 180000000 + 60000000 + 1500000 + 25000000, "hoàn cả điện thoại và đồng hồ xịn không còn bán");
    assert.equal(g.run("Object.keys(S.ds.do).join()"), "ao", "áo khoác vẫn còn trong danh sách thì giữ");
    assert.equal(g.run("S.ds.qua.qua_ao_dai"), 5, "quà đã tặng vẫn giữ");
    g.run("R.mode = 'prep'");
    assert.equal(g.run("dsBaoHoan()"), true);
    assert.match(card(g).textContent, /266,5 triệu/);
    assert.equal(g.run("dsBaoHoan()"), false);
  } finally {
    g.close();
  }
});

test("quà gia đình có tin nhắn mẹ, đủ 3 món thì có huy hiệu, hậu truyện nhắc; đồ cho bản thân có người nhận xét", () => {
  const g = boot();
  try {
    g.run("S.money = 100000000");
    assert.equal(g.run("muaDs('do', 'giay')"), true);
    assert.match(card(g).textContent, /Giày trắng tinh/);
    assert.ok(g.run("!!document.querySelector('#card svg.dshinh')"), "hộp mua xong có hình món");
    ["qua_ao_dai", "qua_dong_ho", "qua_mai_nha"].forEach((id) => g.run(`$('modal').hidden = true; muaDs('qua', '${id}')`));
    assert.match(card(g).textContent, /Mẹ: Mưa bão mà nhà hết dột/);
    assert.ok(g.run("S.huyHieu.hieu_thao"));
    assert.match(g.run("hauTruyen().find((h) => h.ai === 'ba').chu"), /mưa lớn mà ba ngủ ngon/);
    assert.match(g.run("hauTruyen().find((h) => h.ai === 'me_gap').chu"), /áo dài con may/);
  } finally {
    g.close();
  }
});

test("tab Đời sống: 6 khối thu gọn vừa một màn hình; mở khối thấy hàng gọn hay lưới 3 cột; nấc đã qua gom lại; làm mới tab Hẻm 42 không lỗi", () => {
  const g = boot();
  try {
    g.run("S.money = 50000000; R.tab = 'kho'; renderPrep()");
    g.run("document.querySelector('[data-tab=\"doisong\"]').click()");
    const pane = g.w.document.getElementById("pane");
    const q = (sel) => g.run(`document.querySelectorAll('${sel}').length`);
    assert.equal(g.run("[...document.querySelectorAll('.dskhtt > b')].map((b) => b.textContent).join('|')"), "Chỗ ở|Xe máy|Ô tô|Điện thoại|Cho bản thân|Quà cho ba mẹ");
    assert.equal(q(".dskb"), 0, "chưa có mục tiêu thì khối nào cũng đóng");
    assert.equal(g.run("[...document.querySelectorAll('[data-dskhoi]')].every((b) => b.getAttribute('aria-expanded') === 'false')"), true);
    const xm = g.run("document.getElementById('dsk-xm').textContent");
    assert.match(xm, /Đang dùng: Xe đạp/);
    assert.match(xm, /Tiếp: Honda Wave Alpha · 22,5 triệu/);
    assert.equal(g.run("document.querySelector('#dsk-xm .dskhtt .st').textContent"), "Mua được");
    /* mở khối Xe máy: mỗi nấc một hàng có hình */
    g.run("document.querySelector('[data-dskhoi=\"xm\"]').click()");
    assert.equal(q("#dsk-xm .dsrow"), g.run("DS_XM.length"));
    assert.ok(g.run("[...document.querySelectorAll('.dsrow')].every((t) => t.querySelector('svg.dshinh'))"), "hàng nào cũng có hình");
    /* bấm Wave: bảng chi tiết trượt từ dưới lên, bấm Mua */
    g.run("document.querySelector('[data-dsxem=\"xm:wave\"]').click()");
    assert.equal(g.run("$('modal').classList.contains('sheet')"), true);
    assert.match(card(g).textContent, /Honda Wave Alpha/);
    assert.match(card(g).textContent, /Chi phí mỗi ngày 0k → 8k \(\+8k\)/);
    clickText(g, /^Mua · /);
    return new Promise((ok) => setTimeout(ok, 60)).then(() => {
      assert.equal(g.run("dsXm().id"), "wave");
      assert.equal(g.run("$('modal').classList.contains('sheet')"), false, "hộp mua xong không còn là bảng trượt");
      clickText(g, /Tiếp tục/);
      /* xe đạp đã qua: gom thành một dòng, bấm hiện lại */
      assert.equal(g.run("!!document.querySelector('[data-dsxem=\"xm:xe_dap\"]')"), false);
      assert.match(pane.textContent, /1 nấc đã qua/);
      g.run("document.querySelector('[data-dsqua]').click()");
      assert.equal(g.run("!!document.querySelector('[data-dsxem=\"xm:xe_dap\"]')"), true);
      /* mở khối khác thì khối cũ đóng; đồ cho bản thân và quà là lưới theo nhóm */
      g.run("document.querySelector('[data-dskhoi=\"do\"]').click()");
      assert.equal(q(".dskb"), 1);
      assert.equal(q("#dsk-do .dstile"), g.run("DS_DO.length"));
      assert.equal(q("#dsk-do .dsphan"), g.run("DS_DO_NHOM.length"));
      assert.ok(g.run("DS_DO.every((x) => DS_DO_NHOM.some(([n]) => n === x.nhom)) && DS_QUA.every((x) => DS_QUA_NHOM.some(([n]) => n === x.nhom))"), "món nào cũng thuộc một nhóm");
      g.run("document.querySelector('[data-dskhoi=\"qua\"]').click()");
      assert.equal(q("#dsk-qua .dstile"), g.run("DS_QUA.length"));
      assert.ok(g.run("[...document.querySelectorAll('.dstile')].every((t) => t.querySelector('svg.dshinh'))"), "ô nào cũng có hình");
      /* bảng chi tiết: vuốt lui (popstate) hay bấm Đóng đều đóng */
      g.run("xemDs('qua', 'qua_ao_dai')");
      assert.equal(g.run("$('modal').hidden"), false);
      g.run("window.dispatchEvent(new PopStateEvent('popstate'))");
      assert.equal(g.run("$('modal').hidden"), true);
      g.run("xemDs('ot', 'vf3')");
      clickText(g, /^Đóng$/);
      assert.equal(g.run("$('modal').hidden"), true);
      g.run("R.tab = 'hem'; renderPrep(); refreshPrep()");
      assert.deepEqual(g.errors.map(String), []);
      g.close();
    });
  } catch (e) {
    g.close();
    throw e;
  }
});

test("mục tiêu để dành: đặt từ bảng chi tiết, thanh tiến độ ở tab và màn chuẩn bị có ước lượng số ngày, đủ tiền thì báo một lần, cuối ngày có dòng tiến độ", () => {
  const g = boot();
  try {
    g.run(coThuNhap);
    g.run("S.money = 10000000; R.tab = 'doisong'; renderPrep(); xemDs('xm', 'sh')");
    clickText(g, /Đặt làm mục tiêu/);
    assert.equal(g.run("S.ds.muc.dong + ':' + S.ds.muc.id"), "xm:sh");
    assert.match(g.w.document.getElementById("pane").textContent, /🎯 Honda SH 160i/);
    assert.equal(g.run("R.dsMo"), "xm", "khối có món mục tiêu tự mở");
    g.run("R.tab = 'kho'; renderPrep()");
    assert.match(g.w.document.querySelector(".dsmucnho").textContent, /10 triệu \/ 95 triệu · ~\d+ ngày/);
    g.run("document.querySelector('.dsmucnho [data-dsxem]').click()");
    assert.equal(g.run("R.tab"), "doisong");
    assert.match(card(g).textContent, /Bỏ mục tiêu/);
    /* đủ tiền: đầu ngày báo một lần; thẻ cuối ngày có dòng tiến độ */
    g.run("$('modal').hidden = true; S.money = 100000000; R.mode = 'prep'");
    assert.equal(g.run("dsMucDu()"), true);
    assert.match(card(g).textContent, /Đủ tiền mua Honda SH 160i/);
    assert.equal(g.run("dsMucDu()"), false);
    assert.match(g.run("dsMucCuoiNgay()"), /Mục tiêu Honda SH 160i: 100%/);
    /* mua xong thì mục tiêu tự hết */
    g.run("$('modal').hidden = true; muaDs('xm', 'sh')");
    assert.equal(g.run("dsMucTieu()"), null);
  } finally {
    g.close();
  }
});

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
    assert.equal(g.run("[...DS_DT, ...DS_DO, ...DS_QUA].filter((x) => !/<svg/.test(hinhDo(x)) || /NaN|undefined/.test(hinhDo(x))).map((x) => x.id).join()"), "");
    assert.equal(g.run("[...DS_DT, ...DS_DO, ...DS_QUA].map((x) => x.id).filter((id, i, a) => a.indexOf(id) !== i).join()"), "", "không trùng mã món");
  } finally {
    g.close();
  }
});

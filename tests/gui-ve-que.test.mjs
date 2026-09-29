/* Test gửi tiền về quê mỗi tháng và chuyện nhà ở quê (bản 5.2): cảnh ba trặc lưng mở tính năng, gửi lúc đóng cửa
   mỗi 30 ngày, két không dư thì thôi, chế độ Tắt không tự gửi, thùng xoài sau 3 tháng, mẹ gửi lại khi con mua nhà. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const xemHet = (tru) => `MAU_CHUYEN.forEach((m) => { if (!${JSON.stringify(tru)}.includes(m.id)) TT().xem[m.id] = 1; })`;
const card = (g) => g.w.document.getElementById("card");
const bam = (g, sel) => g.run(`document.querySelector(${JSON.stringify(sel)}).click()`);
/* đóng cửa ngày S.day (chỉ phần đời sống), trả về bản ghi của ngày */
const dongCua = (g) => g.run("(() => { const r = newRec(S.day); doiSongCuoiNgay(r); guiVeCuoiNgay(r); return r; })()");

test("ba trặc lưng: ngày 36 két có 3 triệu thì mẹ nhắn; chọn gửi 2 triệu thì gửi lúc đóng cửa, 30 ngày sau gửi tiếp", () => {
  const g = boot();
  try {
    g.run(`S.day = 30; S.money = 5000000; ${xemHet(["gui_1"])}; TT().homNay = 0`);
    assert.equal(g.run("canhKe('dong_cua')"), null, "chưa tới ngày 36");
    g.run("S.day = 37; S.money = 2000000");
    assert.equal(g.run("canhKe('dong_cua')"), null, "két chưa tới 3 triệu");
    g.run("S.day = 53");
    assert.equal(g.run("canhKe('dong_cua').id"), "gui_1", "tới hạn chót thì hiện dù két ít");
    g.run("S.day = 37; S.money = 5000000; TT().che = 'gon'; truyenLuc('dong_cua')");
    assert.match(card(g).textContent, /Ba trặc lưng hôm gặt lúa/);
    assert.equal(g.run("document.querySelectorAll('#card [data-ch]').length"), 3);
    bam(g, '#card [data-ch="0"]');
    assert.match(card(g).textContent, /mẹ cất để ba đi châm cứu/);
    assert.equal(g.run("TT().co.gui_ve"), "hai");
    assert.equal(g.run("S.ds.gui"), 2000000);
    assert.equal(g.run("S.ds.guiToi"), 37);
    /* đóng cửa ngày 37: gửi, sổ ghi, mẹ nhắn */
    const m0 = g.run("S.money");
    const r = dongCua(g);
    assert.equal(r.gui, 2000000);
    assert.equal(g.run("S.money"), m0 - 2000000 - r.song);
    assert.equal(g.run(`recCaNhan(${JSON.stringify(r)})`), 2000000 + r.song, "gửi về quê nằm trong chi tiêu cá nhân");
    assert.equal(g.run(`recCost(${JSON.stringify(r)})`) < 2000000, true, "không tính vào chi phí của tiệm");
    assert.match(g.run(`dsGuiCuoiNgay(${JSON.stringify(r)})`), /Đã gửi về quê 2 triệu\. Mẹ: Nhận rồi con/);
    assert.equal(g.run("TT().co.gui_da"), true);
    assert.equal(g.run("S.ds.guiToi"), 67);
    g.run("S.day = 38");
    assert.equal(dongCua(g).gui, undefined, "chưa tới tháng sau");
    g.run("S.day = 67");
    assert.equal(dongCua(g).gui, 2000000);
    assert.equal(g.run("S.ds.guiThang"), 2);
    assert.equal(g.run("S.ds.guiTong"), 4000000);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("đóng cửa thật: thẻ cuối ngày có dòng gửi về quê trong sổ và tin nhắn của mẹ; tổng kết có dòng riêng", () => {
  const g = boot();
  try {
    g.run("S.money = 10000000; TT().co.gui_ve = 'hai'; dsGuiDat(2000000); S.tr.che = 'tat'; __openDay(); R.slots = R.slots.map(() => null); closeEarly()");
    assert.match(card(g).textContent, /Gửi về quê cho ba mẹ/);
    assert.match(card(g).textContent, /Đã gửi về quê 2 triệu/);
    g.run("$('modal').hidden = true; R.tab = 'tongket'; R.sumMode = 'day'; R.sumIdx = null; renderPrep()");
    assert.match(g.w.document.getElementById("pane").textContent, /Gửi về quê cho ba mẹ/);
  } finally {
    g.close();
  }
});

test("két không còn dư 500 nghìn sau khi gửi thì chờ thêm 3 ngày, vẫn không dư thì tháng đó thôi, không trừ tiền, mẹ nhắn không sao", () => {
  const g = boot();
  try {
    g.run("S.day = 40; S.money = 5200000; TT().co.gui_ve = 'nam'; dsGuiDat(5000000)");
    const r1 = dongCua(g);
    assert.equal(r1.gui, undefined);
    assert.equal(r1.guiCho, 1, "chưa dư thì mai gửi lại");
    assert.match(g.run(`dsGuiCuoiNgay(${JSON.stringify(r1)})`), /mai gửi/);
    assert.equal(g.run("S.ds.guiToi"), 41);
    g.run("S.day = 41; S.money = 5200000");
    dongCua(g);
    g.run("S.day = 42; S.money = 5200000");
    dongCua(g);
    g.run("S.day = 43; S.money = 5200000");
    const r = dongCua(g);
    assert.equal(r.gui, undefined);
    assert.equal(r.guiLo, 1);
    assert.equal(g.run("S.money"), 5200000 - r.song);
    assert.equal(g.run("S.ds.guiBo"), 1);
    assert.equal(g.run("S.ds.guiToi"), 70, "hẹn tháng sau tính từ ngày hẹn gốc");
    assert.match(g.run(`dsGuiCuoiNgay(${JSON.stringify(r)})`), /Tháng này con kẹt thì thôi/);
    /* chờ một ngày mà két dư thì gửi, hẹn vẫn tính từ ngày hẹn gốc */
    g.run("S.day = 70; S.money = 5200000");
    dongCua(g);
    g.run("S.day = 71; S.money = 20000000");
    assert.equal(dongCua(g).gui, 5000000);
    assert.equal(g.run("S.ds.guiToi"), 100);
  } finally {
    g.close();
  }
});

test("Bỏ qua hay chế độ Tắt không tự gửi tiền; khung gửi về quê chỉ hiện sau cảnh, đổi mức hay tạm dừng được", () => {
  const g = boot();
  try {
    g.run("S.money = 50000000; R.tab = 'doisong'; R.dsMo = 'qua'; renderPrep()");
    assert.equal(g.run("!!document.querySelector('.dsgui')"), false, "chưa có cảnh thì chưa có khung");
    g.run(`S.day = 40; ${xemHet(["gui_1"])}; TT().homNay = 0; TT().che = 'tat'; truyenLuc('dong_cua')`);
    assert.equal(g.run("TT().co.gui_ve"), "chua");
    assert.equal(g.run("S.ds.gui || 0"), 0);
    g.run("$('modal').hidden = true; R.tab = 'doisong'; R.dsMo = 'qua'; renderPrep()");
    assert.equal(g.run("document.querySelectorAll('.dsgui [data-dsgui]').length"), 6);
    assert.match(g.run("document.querySelector('.dsgui').textContent"), /Chưa gửi/);
    bam(g, '.dsgui [data-dsgui="3000000"]');
    assert.equal(g.run("S.ds.gui"), 3000000);
    assert.equal(g.run("S.ds.guiToi"), 40);
    assert.match(g.run("document.getElementById('dsk-qua').textContent"), /gửi về quê 3 triệu\/tháng/);
    dongCua(g);
    g.run("S.day = 45");
    bam(g, '.dsgui [data-dsgui="0"]');
    assert.equal(g.run("S.ds.gui"), 0);
    bam(g, '.dsgui [data-dsgui="1000000"]');
    assert.equal(g.run("S.ds.guiToi"), 70, "tạm dừng rồi bật lại trong tháng thì giữ hẹn cũ");
    /* Bỏ qua ở chế độ Đầy đủ cũng chọn Để con tính đã */
    const g2 = boot();
    try {
      g2.run(`S.day = 40; S.money = 50000000; ${xemHet(["gui_1"])}; TT().homNay = 0; truyenLuc('dong_cua')`);
      bam(g2, "#trSkip");
      assert.equal(g2.run("TT().co.gui_ve"), "chua");
      assert.equal(g2.run("S.ds.gui || 0"), 0);
    } finally {
      g2.close();
    }
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("ba khoẻ lại dù có gửi hay không; gửi đủ 3 tháng thì quê gửi lên thùng xoài; mua nhà thì mẹ gửi lại một nửa", () => {
  const g = boot();
  try {
    const thoai = (id) => g.run(`locDong(MAU_CHUYEN.find((m) => m.id === '${id}').thoai).map((d) => d[1]).join('|')`);
    assert.match(thoai("gui_2"), /Chú Năm bên nhà gặt giùm/);
    g.run("S.day = 40; S.money = 100000000; TT().co.gui_ve = 'hai'; dsGuiDat(2000000)");
    for (let k = 0; k < 3; k++) {
      dongCua(g);
      g.run("S.day += 30");
    }
    assert.match(thoai("gui_2"), /ba đi châm cứu/);
    assert.equal(g.run("TT().co.gui_3thang"), true);
    /* thùng hàng quê: tiệm chưa bán xoài thì không mở vị mới (60% khách sẽ gọi vị đó rồi hết giữa ngày) */
    g.run(`S.unlocked.f_xoai = false; S.stock.f_xoai = []; ${xemHet(["gui_3"])}; TT().homNay = 0; TT().che = 'gon'; truyenLuc('mo_cua')`);
    assert.match(card(g).textContent, /xoài cát/);
    bam(g, "#trOk");
    assert.equal(g.run("S.unlocked.f_xoai"), false);
    assert.equal(g.run("qty('f_xoai')"), 0);
    /* đang bán xoài thì thêm một chai */
    g.run("addStock('f_xoai', 10); syncFlav(); guiVeXoai()");
    assert.equal(g.run("qty('f_xoai')"), g.run("10 + CFG.bottleN"));
    /* mua nhà: mẹ gửi lại một nửa số đã gửi (6 triệu) */
    g.run("$('modal').hidden = true; TT().co.ds_co_nha = true; TT().xem.gui_so = undefined; delete TT().xem.gui_so; TT().homNay = 0");
    const m0 = g.run("S.money");
    g.run("truyenLuc('dong_cua')");
    assert.match(card(g).textContent, /mẹ để dành một nửa/);
    bam(g, "#trOk");
    assert.equal(g.run("S.money"), m0 + 3000000);
    assert.equal(g.run("S.ds.guiTraLai"), 3000000);
    g.run("guiVeTraLai()");
    assert.equal(g.run("S.money"), m0 + 3000000, "chỉ gửi lại một lần");
    assert.match(g.run("hauTruyen().find((h) => h.ai === 'me_gap').chu"), /sổ tiết kiệm/);
    assert.deepEqual(g.errors.map(String), []);
  } finally {
    g.close();
  }
});

test("thoại chuyện nhà ở quê vừa màn hình, mẹ không nói tự hào; tin nhắn mỗi tháng xoay vòng không hết", () => {
  const g = boot();
  try {
    const dai = g.run(`MAU_CHUYEN.filter((m) => /^gui_/.test(m.id)).flatMap((m) => m.thoai.concat(...(m.luaChon || []).map((c) => c.thoai || [])))
      .filter((d) => d[1].length > 72 || (/^(tin|me_gap)$/.test(d[0]) && /tự hào/.test(d[1]))).map((d) => d[1]).join('|')`);
    assert.equal(dai, "");
    assert.equal(g.run("[1, 2, 7, 8, 9, 10, 11, 50].every((n) => typeof dsGuiTin(n) === 'string' && dsGuiTin(n).startsWith('Mẹ: '))"), true);
    assert.equal(g.run("DS_GUI_TIN.concat(DS_GUI_KET).every((t) => t.length <= 72)"), true);
  } finally {
    g.close();
  }
});

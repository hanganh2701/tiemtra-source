/* Test chi nhánh, độ khó theo chương và các chỗ sửa sau lần chơi thử thứ ba (bản 4.9). Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const card = (g) => g.w.document.getElementById("card");
const clickText = (g, re) => {
  const b = [...card(g).querySelectorAll("button")].find((x) => re.test(x.textContent));
  assert.ok(b, "không thấy nút " + re);
  b.click();
};
const saoTot = "S.reviews = Array.from({ length: 40 }, () => ({ s: 5, t: 'ngon', k: Math.random(), d: 1 }))";
/* tiệm đã ra mặt tiền từ ngày 30, bán 3 ngày gần nhất mỗi ngày 100 ly, 4,5 triệu */
const tiemLon = `S.day = 50; S.money = 30000000; ${saoTot}; S.buoc = 2; S.hd = { bd: 30, gia: 220000 };
  S.history = Array.from({ length: 3 }, (_, i) => { const r = newRec(47 + i); r.sales = { tra: { q: 100, a: 4500000 } }; r.served = 100; r.ing = { tra: { q: 100, v: 900000 } }; return r; });
  TT().co.chi_nhanh_mo = true`;

test("chi nhánh: chưa đủ điều kiện thì chưa mở được; đủ thì mở, trừ cọc và trang trí, có quản lý và huy hiệu", () => {
  const g = boot();
  try {
    g.run("S.day = 50; S.money = 30000000; S.buoc = 2; S.hd = { bd: 45, gia: 220000 }");
    assert.equal(g.run("moChiNhanh('truong')"), false, "mới ra mặt tiền 5 ngày, chưa nghe Vy kể");
    g.run(tiemLon);
    assert.equal(g.run("dkChiNhanh().every((x) => x.ok)"), true);
    g.run("R.tab = 'nangcap'; R.sub = { upg: 3 }; renderPrep()");
    assert.equal(g.run("document.querySelectorAll('[data-cnmo]').length"), 3);
    const m0 = g.run("S.money");
    g.run("document.querySelector('[data-cnmo=\"truong\"]').click()");
    assert.equal(g.run("S.cn.loai"), "truong");
    assert.equal(m0 - g.run("S.money"), g.run("cnTien(CN_LOAI[0])"));
    assert.ok(g.run("CN_TEN_QL.includes(S.cn.ql.ten)"));
    assert.equal(g.run("TT().co.chi_nhanh"), "truong");
    assert.ok(g.run("S.huyHieu.chi_nhanh"));
    assert.match(card(g).textContent, /Khai trương chi nhánh gần trường/);
  } finally {
    g.close();
  }
});

test("chi nhánh tính sổ lúc đóng cửa: tiền vào két khớp sổ, lấy hàng dư sắp hết hạn, tổng kết có dòng chi nhánh", () => {
  const g = boot();
  try {
    g.run(tiemLon + "; moChiNhanh('kiosk'); $('modal').hidden = true; Math.random = () => 0.5");
    g.run("S.stock.tra = [{ q: 12, exp: S.day }, { q: 30, exp: S.day + 2 }]");
    const m0 = g.run("S.money");
    g.run("chiNhanhCuoiNgay(S.cur)");
    const cn = g.run("S.cur.sales.cn"),
      chi = g.run("S.cur.cnChi");
    assert.ok(cn.q > 40 && cn.q <= 85, "kiosk bán có hạn: " + cn.q);
    assert.equal(g.run("S.money") - m0, cn.a - chi);
    assert.equal(g.run("qty('tra')"), 30, "12 phần trà hết hạn hôm nay đã chở qua chi nhánh");
    assert.ok(g.run("recCost(S.cur)") >= chi);
    assert.equal(g.run("S.cn.hq.ly"), cn.q);
    g.run("S.history.push(S.cur); R.tab = 'tongket'; R.sumMode = 'day'; R.sumIdx = null; renderPrep()");
    assert.match(g.w.document.getElementById("pane").textContent, /Chi nhánh: tiền nhà, lương, hàng/);
  } finally {
    g.close();
  }
});

test("chi nhánh gần trường vắng cuối tuần, kiosk cuối tuần đông hơn; thuê người phụ thì bán thêm", () => {
  const g = boot();
  try {
    const ban = (loai, ngay, phu) =>
      g.run(`(() => { ${tiemLon}; S.cn = null; moChiNhanh('${loai}'); $('modal').hidden = true; Math.random = () => 0.5;
        S.day = ${ngay}; S.ev = null; S.cn.phu = ${phu}; const r = newRec(${ngay}); chiNhanhCuoiNgay(r); return r.sales.cn.q; })()`);
    assert.ok(ban("truong", 57, false) > ban("truong", 56, false) * 2, "ngày 56 là cuối tuần");
    assert.ok(ban("kiosk", 56, false) >= ban("kiosk", 57, false));
    assert.ok(ban("vp", 58, true) > ban("vp", 58, false), "văn phòng ngày thường đông hơn sức một quản lý");
  } finally {
    g.close();
  }
});

test("sáng hôm sau có báo cáo chi nhánh, rồi tình huống hai lựa chọn; chọn tốn tiền thì ghi vào sổ", () => {
  const g = boot();
  try {
    g.run(tiemLon + "; moChiNhanh('truong'); $('modal').hidden = true; chiNhanhCuoiNgay(S.cur); S.day++; S.cur = newRec(S.day); S.cn.viec = { id: 'may' }");
    assert.equal(g.run("chiNhanhSang()"), true);
    assert.match(card(g).textContent, /Chi nhánh gần trường · ngày 50/);
    clickText(g, /Xong/);
    assert.equal(g.run("chiNhanhSang()"), true);
    assert.match(card(g).textContent, /Máy dán nắp hư/);
    const m0 = g.run("S.money");
    clickText(g, /Gọi thợ sửa liền/);
    assert.equal(m0 - g.run("S.money"), 500000);
    assert.equal(g.run("S.cur.cnChi"), 500000);
    assert.equal(g.run("chiNhanhSang()"), false, "mỗi sáng chỉ một báo cáo, một tình huống");
    /* chọn cách không tốn tiền thì chi nhánh bán chậm vài ngày */
    g.run("S.cn.viec = { id: 'may' }; chiNhanhSang()");
    clickText(g, /Để cuối tuần/);
    assert.equal(g.run("cnHieu('capHs', 1)"), 0.7);
  } finally {
    g.close();
  }
});

test("sang nhượng chi nhánh: lấy lại 60% tiền trang trí, chưa hết kỳ hợp đồng thì mất cọc", () => {
  const g = boot();
  try {
    g.run(tiemLon + "; moChiNhanh('vp'); $('modal').hidden = true; S.day = 60");
    const m0 = g.run("S.money");
    g.run("sangNhuongCN()");
    assert.match(card(g).textContent, /mất cọc/);
    clickText(g, /^Sang nhượng$/);
    assert.equal(g.run("S.cn"), null);
    assert.equal(g.run("S.money") - m0, 2400000);
    assert.ok(g.run("S.cnDaMo"), "huy hiệu vẫn giữ");
  } finally {
    g.close();
  }
});

test("độ khó theo chương: từ Chương 2 giá nhập, kiên nhẫn, khách khó chiều đổi; Thư giãn thì không; sự cố tính theo két", () => {
  const g = boot();
  try {
    g.run("S.day = 20");
    const gia1 = g.run("ecost('tra')");
    assert.equal(g.run("heSoChoChuong()"), 1);
    assert.equal(g.run("tiLeKhoChieu()"), 0.12);
    g.run("S.day = 35");
    assert.equal(g.run("ecost('tra')"), Math.round(gia1 * 1.1 * 1000) / 1000);
    assert.equal(g.run("heSoChoChuong()"), 0.95);
    g.run("S.day = 62");
    assert.equal(g.run("heSoGiaNhap()"), 1.2);
    assert.equal(g.run("tiLeKhoChieu()"), 0.2);
    g.run("S.thuGian = true");
    assert.equal(g.run("heSoGiaNhap()"), 1);
    assert.equal(g.run("heSoChoChuong()"), 1);
    g.run("S.thuGian = false; S.money = 60000000");
    assert.equal(g.run("tienSuCo(300000)"), 1800000);
    g.run("S.money = 2000000");
    assert.equal(g.run("tienSuCo(300000)"), 300000);
    g.run("S.money = 900000000");
    assert.equal(g.run("tienSuCo(300000)"), 4000000);
    /* thẻ cuối ngày báo lúc sang chương */
    g.run("S.day = 30");
    assert.match(g.run("doKhoCuoiNgay()"), /Chương 2/);
    g.run("S.day = 31");
    assert.equal(g.run("doKhoCuoiNgay()"), "");
  } finally {
    g.close();
  }
});

test("cảnh mới: Vy kể chỗ sang nhượng khi đã ra mặt tiền; chợ giáp Tết ngày 60; chú Tư chở hàng qua chi nhánh", () => {
  const g = boot();
  try {
    const m = (id) => `MAU_CHUYEN.find((x) => x.id === '${id}')`;
    g.run("S.day = 57; S.buoc = 1");
    assert.equal(g.run(`hopCanh(${m("c2_chi_nhanh")}, 'mo_cua')`), false);
    g.run("S.buoc = 2; TT().nhanh.may = 'B'");
    assert.equal(g.run(`hopCanh(${m("c2_chi_nhanh")}, 'mo_cua')`), false, "Vy chưa quyết ra chợ thì chưa kể");
    g.run("TT().xem.may_b3 = 55");
    assert.equal(g.run(`hopCanh(${m("c2_chi_nhanh")}, 'mo_cua')`), true);
    assert.match(g.run(`locDong(${m("c2_chi_nhanh")}.thoai).map((d) => d[1]).join('|')`), /xe trà ra chợ/);
    g.run(`apDung(${m("c2_chi_nhanh")})`);
    assert.equal(g.run("TT().co.chi_nhanh_mo"), true);
    g.run("S.day = 60");
    assert.equal(g.run(`hopCanh(${m("c3_gia_tet")}, 'mo_cua')`), true);
    /* mở chi nhánh được hai ngày thì chú Tư nhận chở hàng qua */
    g.run(tiemLon + "; TT().homNay = 0; moChiNhanh('truong'); $('modal').hidden = true");
    assert.equal(g.run(`hopCanh(${m("cn_cho_hang")}, 'mo_cua')`), false);
    g.run("S.day += 2");
    assert.equal(g.run(`hopCanh(${m("cn_cho_hang")}, 'mo_cua')`), true);
  } finally {
    g.close();
  }
});

test("lời rủ góp hẻm nói đúng việc đang mở; trang 3 của Linh, trang 4 của Khoa, bản lưu cũ đổi số trang", () => {
  const g = boot();
  try {
    g.run("S.day = 12; TT().xem.tu_3 = 12; R.mode = 'prep'; moiGopHem()");
    assert.match(card(g).textContent, /băng ghế đá cho chú Tư/);
    assert.equal(g.run("MAU_CHUYEN.find((m) => m.id === 'linh_3').ketQua.trang"), 3);
    assert.equal(g.run("MAU_CHUYEN.find((m) => m.id === 'khoa_3').ketQua.trang"), 4);
    /* bản lưu cũ: trang 4 (Linh) và 3 (Khoa) đổi thành 3 và 4 */
    g.run("S.tr = { trang: [1, 2, 4] }");
    assert.equal(g.run("TT().trang.join()"), "1,2,3");
    assert.equal(g.run("TT().trang.join()"), "1,2,3", "chỉ đổi một lần");
  } finally {
    g.close();
  }
});

test("sau lần chơi thử thứ tư: báo cáo chi nhánh không lặp sau ngày nghỉ, chuyện không lặp sát nhau, chi nhánh hiện trước tiệm", () => {
  const g = boot();
  try {
    g.run(tiemLon + "; moChiNhanh('vp'); $('modal').hidden = true; Math.random = () => 0.5; chiNhanhCuoiNgay(S.cur); S.day++; S.cn.viec = null");
    assert.equal(g.run("chiNhanhSang()"), true);
    clickText(g, /Xong/);
    /* về quê ba ngày, không có ngày bán nào: sáng quay lại không báo lại ngày cũ */
    g.run("S.day += 3");
    assert.equal(g.run("chiNhanhSang()"), false);
    /* chuyện vừa gặp trong 7 ngày thì không gặp lại */
    g.run("Math.random = () => 0; S.cn.viec = null; S.cn.gap = { may: S.day - 3 }; chiNhanhCuoiNgay(newRec(S.day))");
    assert.ok(g.run("S.cn.viec") && g.run("S.cn.viec.id") !== "may", "chuyện: " + g.run("JSON.stringify(S.cn.viec)"));
    g.run("R.tab = 'kho'; renderPrep()");
    assert.match(g.w.document.querySelector(".tridai").innerHTML, /Chi nhánh dưới toà văn phòng/);
  } finally {
    g.close();
  }
});

test("lời kết Tiệm của xóm theo tiệm đã lớn; tổng kết đếm chi nhánh theo ly", () => {
  const g = boot();
  try {
    const k = "KET_CUC.find((x) => x.id === 'tiem_cua_xom')";
    assert.match(g.run(`theKetCuc(${k})`), /Tiệm vẫn nhỏ/);
    g.run("S.buoc = 2");
    assert.match(g.run(`theKetCuc(${k})`), /ra tới đầu hẻm/);
    g.run("TT().co.chi_nhanh = 'vp'");
    assert.match(g.run(`theKetCuc(${k})`), /có thêm chi nhánh/);
    g.run(tiemLon + "; moChiNhanh('kiosk'); $('modal').hidden = true; chiNhanhCuoiNgay(S.cur); S.history.push(S.cur); R.tab = 'tongket'; R.sumMode = 'day'; R.sumIdx = null; renderPrep()");
    assert.match(g.w.document.getElementById("pane").textContent, /Chi nhánh: \d+ ly/);
  } finally {
    g.close();
  }
});


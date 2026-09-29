/* Test cốt truyện Hẻm 42. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

const card = (g) => g.w.document.getElementById("card");
const modalOpen = (g) => !g.w.document.getElementById("modal").hidden;
const click = (g, sel) => {
  const el = card(g).querySelector(sel);
  assert.ok(el, "không thấy nút " + sel);
  el.click();
};

test("ngày 1: cảnh bà Sáu hiện trước khi mở cửa, lựa chọn đặt cờ rồi mới bán", () => {
  const g = boot();
  try {
    g.run("window.__open = 0; truyenLuc('mo_cua', () => window.__open++)");
    assert.ok(modalOpen(g));
    assert.match(card(g).textContent, /Bà Sáu/);
    assert.equal(g.run("__open"), 0);
    click(g, "#trNext");
    click(g, "#trNext");
    click(g, '[data-ch="0"]');
    click(g, "#trOk");
    assert.equal(g.run("__open"), 1);
    assert.equal(g.run("S.tr.co.c0_meo"), "vuot");
    assert.equal(g.run("S.tr.than.sau"), 1);
    assert.equal(g.run("S.tr.xem.c0_chia_khoa"), 1);
  } finally {
    g.close();
  }
});

test("mỗi ngày tối đa một cảnh, cảnh đã xem không lặp lại", () => {
  const g = boot();
  try {
    g.run("S.tr = { che: 'tat' }; truyenLuc('mo_cua'); window.__n = 0; truyenLuc('mo_cua', () => __n++)");
    assert.equal(g.run("__n"), 1);
    assert.equal(g.run("Object.keys(S.tr.xem).length"), 1);
  } finally {
    g.close();
  }
});

test("bỏ qua: áp lựa chọn đầu, hiện tóm tắt", () => {
  const g = boot();
  try {
    g.run("truyenLuc('mo_cua')");
    click(g, "#trSkip");
    assert.equal(g.run("S.tr.co.c0_meo"), "vuot");
    assert.match(g.w.document.getElementById("toast").textContent, /Bà Sáu giao chìa khoá/);
  } finally {
    g.close();
  }
});

test("chế độ Tắt: không hiện cảnh nhưng vẫn nhận trang sổ công thức", () => {
  const g = boot();
  try {
    g.run("S.day = 6; S.tr = { che: 'tat', xem: { c0_chia_khoa: 1, c0_chu_tu: 2, c0_khoa: 3, c0_me: 4, c0_co_hanh: 5 } }; truyenLuc('mo_cua')");
    assert.deepEqual([...g.run("S.tr.trang")], [1]);
    assert.match(card(g).textContent, /Trang 1: Trà ủ đủ lâu/);
  } finally {
    g.close();
  }
});

test("cảnh sau giờ đóng cửa tính theo ngày vừa bán", () => {
  const g = boot();
  try {
    g.run("S.day = 5; S.tr = { che: 'tat', xem: { c0_chia_khoa: 1, c0_chu_tu: 2, c0_khoa: 3 } }; truyenLuc('dong_cua')");
    assert.equal(g.run("S.tr.xem.c0_me"), 4);
  } finally {
    g.close();
  }
});

test("khách gọi người chơi theo anh hoặc chị", () => {
  const g = boot();
  try {
    assert.equal(g.run("xungGoi('Chị ơi, cho em')"), "Chị ơi, cho em");
    g.run("S.xung = 'anh'");
    assert.equal(g.run("xungGoi('Chị ơi, cho em')"), "Anh ơi, cho em");
    assert.equal(g.run("thayTen('{Ban} ơi, {ban} khoẻ hông')"), "Anh ơi, anh khoẻ hông");
  } finally {
    g.close();
  }
});

test("khách quen: ghé quầy với bảng tên, phục vụ tốt thì thân thêm, bỏ về thì hẹn lần sau", () => {
  const g = boot();
  try {
    g.run("S.day = 5; __openDay(); R.slots = R.slots.map(() => null); spawnQuen(0, 'khoa')");
    assert.equal(g.run("R.slots[0].reg"), "khoa");
    assert.equal(g.run("R.slots[0].who"), g.run("NHAN_VAT.khoa.mat"));
    assert.match(g.w.document.getElementById("q3say").innerHTML, /♥ Khoa/);
    g.run("R.slots[0].pat = R.slots[0].max; __serveSlot(0)");
    assert.equal(g.run("S.tr.lan.khoa"), 1);
    assert.equal(g.run("S.tr.ghe.khoa"), 5);
    assert.ok(g.run("S.tr.than.khoa") >= 0);
    g.run("spawnQuen(1, 'tu'); R.slots[1].pat = 0; tick()");
    assert.equal(g.run("S.tr.ghe.tu"), 5);
    assert.equal(g.run("sapGhe('tu', 6)"), false);
    assert.equal(g.run("sapGhe('tu', 7)"), true);
  } finally {
    g.close();
  }
});

test("đủ thân thì khách quen kể chuyện sau giờ đóng cửa", () => {
  const g = boot();
  try {
    g.run("S.day = 12; S.tr = { che: 'tat', than: { khoa: 2 }, xem: { c0_chia_khoa: 1, c0_chu_tu: 2, c0_khoa: 3, c0_me: 4, c0_co_hanh: 5, c0_tien_nha: 6 } }; truyenLuc('dong_cua')");
    assert.equal(g.run("S.tr.xem.khoa_1"), 11);
  } finally {
    g.close();
  }
});

test("tab Hẻm 42 hiện khách quen, sổ công thức, sổ tay, kỷ lục; thẻ Ngày mai gợi ý", () => {
  const g = boot();
  try {
    g.run("S.day = 4; S.tr = { lan: { tu: 2 }, than: { tu: 3 }, trang: [1], xem: { c0_chia_khoa: 1 } }; R.tab = 'hem'; renderPrep()");
    const html = g.w.document.getElementById("pane").innerHTML;
    assert.match(html, /Chú Tư/);
    assert.match(html, /Trang 1: Trà ủ đủ lâu/);
    assert.match(html, /Bà Sáu giao chìa khoá/);
    assert.match(html, /Ngày doanh thu cao nhất/);
    assert.match(g.run("ngayMaiHTML()"), /Ngày mai/);
  } finally {
    g.close();
  }
});

test("quà mở khoá: ngày 2 có hồng trà miễn phí; bản lưu cũ đã qua mốc không bị dồn quà", () => {
  const g = boot();
  try {
    g.run("S.day = 2; S.unlocked.hong = false");
    assert.equal(g.run("quaMoKhoa()"), true);
    assert.equal(g.run("S.unlocked.hong"), true);
    assert.match(g.w.document.getElementById("card").textContent, /Quà ngày 2/);
    g.run("S.day = 50; S.tr = {}");
    assert.equal(g.run("quaMoKhoa()"), false);
  } finally {
    g.close();
  }
});

test("món đặc trưng khi đủ 12 trang: thêm 10k, sổ vẫn khớp két", () => {
  const g = boot();
  try {
    g.run("S.tr = { trang: [1,2,3,4,5,6,7,8,9,10,11,12] }; ['hong','f_vai','cunang'].forEach((k) => { S.unlocked[k] = true; addStock(k, 50); }); __openDay()");
    const o = "({ base: 'hong', flav: 'f_vai', tops: ['cunang'], cheese: false, size: 'M', sugar: null, ice: null })";
    assert.equal(g.run(`laDacTrung(${o})`), true);
    assert.equal(g.run(`price(${o}) - price(${o}, S.sell) + 0`), 0);
    const i = g.run("__fillSlot()");
    g.run(`R.slots[${i}].cups = [${o}]; R.slots[${i}].done = [false]; R.slots[${i}].order = R.slots[${i}].cups[0]; R.slots[${i}].brat = null; R.slots[${i}].star = null`);
    const m0 = g.run("S.money"), r0 = g.run("recRev(S.cur)");
    g.run(`__serveSlot(${i})`);
    assert.equal(g.run("S.money") - m0, g.run("recRev(S.cur)") - r0);
    assert.equal(g.run("S.cur.sales.dactrung.a"), 10000);
  } finally {
    g.close();
  }
});

test("những ngày đầu chưa có khách khó chiều, chưa có lời mời vay ngân hàng", () => {
  const g = boot();
  try {
    g.run("S.day = 5");
    for (let n = 0; n < 50; n++) assert.equal(g.run("pickBrat()"), null);
    g.run("S.money = 1000");
    assert.doesNotMatch(g.run("loanCard()"), /Két sắp cạn/);
    g.run("S.day = 10");
    assert.match(g.run("loanCard()"), /Két sắp cạn/);
  } finally {
    g.close();
  }
});

/* mô phỏng truyện theo ngày (không bán): mỗi ngày khách quen tới hẹn thì ghé và thân thêm */
/* mô phỏng truyện theo ngày, không bán hàng. chon: nhánh chọn ở từng ngã rẽ (0 = A, 1 = B);
   cuoi: lựa chọn thường lấy phương án cuối; khongHana: không phục vụ Hana; ngheo: két cạn; luot: lượt chơi */
function moPhongTruyen(g, toiNgay, { chon = {}, cuoi = false, khongHana = false, ngheo = false, luot = 1, ketCu = [] } = {}) {
  return JSON.parse(g.run(`JSON.stringify((() => {
    S.tr = { che: "tat", luot: ${luot} }; S.day = 1; S.money = ${ngheo ? 100000 : 500000};
    S.kl = { ket: ${JSON.stringify(Object.fromEntries(ketCu.map((k) => [k, 70])))} };
    const T = TT(), xem = [], chon = ${JSON.stringify(chon)};
    const canh = (luc) => {
      const m = canhKe(luc);
      if (!m) return null;
      T.xem[m.id] = ngayCua(luc); T.homNay = ngayCua(luc);
      const ds = m.luaChon || [];
      const c = m.reRe ? ds[chon[Object.keys(ds[0].nhanh)[0]] || 0] : ds[${cuoi ? "ds.length - 1" : "0"}];
      apDung(m, c);
      /* người chơi thuê Linh sau khi Linh xin ở lại */
      if (T.nhanh.linh === "A") T.co.linh_da_lam = true;
      xem.push(m.id + "@" + ngayCua(luc));
      return m;
    };
    for (let d = 1; d <= ${toiNgay}; d++) {
      const m = canh("mo_cua");
      if (m && m.nghi) { S.history.push(newRec(S.day)); S.day++; S.cur = newRec(S.day); continue; }
      Object.keys(KHACH_QUEN).forEach((k) => {
        if (${khongHana} && k === "hana") return;
        if (sapGhe(k)) { T.ghe[k] = S.day; T.than[k] = Math.min(10, (T.than[k] || 0) + 1); }
      });
      S.history.push(newRec(S.day)); S.day++; S.cur = newRec(S.day);
      canh("dong_cua");
    }
    return { xem, trang: T.trang, co: T.co, nhanh: T.nhanh, ket: ketCucNay().id, hau: hauTruyen().length };
  })())`));
}
const ngayCanh = (kq, id) => {
  const x = kq.xem.find((v) => v.startsWith(id + "@"));
  return x ? +x.split("@")[1] : null;
};
const RIENG = {
  linh: [["linh_a1", "linh_a2"], ["linh_b1", "linh_b2"]],
  hana: [["hana_a1", "hana_a2"], ["hana_b1", "hana_b2"]],
  may: [["may_a1", "may_a2", "may_a3", "c2_ket_a"], ["may_b1", "may_b2", "may_b3", "c2_ket"]],
  tet: [["que_1", "que_2", "que_3"], ["tet_b1", "c3_me"]],
};
const KET_DUNG = { "0-0": "thuong_hieu", "0-1": "xuong_tran_chau", "1-0": "len_ban_do", "1-1": "tiem_cua_xom" };

test("16 tổ hợp ngã rẽ: đủ 12 trang, đúng kết, không lẫn cảnh nhánh kia, cảnh nào cũng có đường thấy", () => {
  const daThay = new Set();
  let gapMax = 0;
  for (let bits = 0; bits < 16; bits++) {
    const chon = { linh: bits & 1, hana: (bits >> 1) & 1, may: (bits >> 2) & 1, tet: (bits >> 3) & 1 };
    const g = boot();
    try {
      const kq = moPhongTruyen(g, 75, { chon, cuoi: chon.may === 1, ngheo: chon.tet === 1 }),
        tag = JSON.stringify(chon) + ": " + kq.xem.join(" ");
      kq.xem.forEach((x) => daThay.add(x.split("@")[0]));
      assert.deepEqual(kq.trang, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], tag);
      for (const [id, [a, b]] of Object.entries(RIENG)) {
        assert.equal(kq.nhanh[id], chon[id] ? "B" : "A", id + " · " + tag);
        for (const x of chon[id] ? b : a) assert.ok(ngayCanh(kq, x) != null, x + " chưa hiện · " + tag);
        for (const x of chon[id] ? a : b) assert.equal(ngayCanh(kq, x), null, x + " của nhánh kia lại hiện · " + tag);
      }
      for (const id of ["c2_may", "hanh_1", "hanh_2", "c2_trung_thu", "c2_vy", "c2_ba_sau", "c2_nga_re", "c3_vang", "c3_ket"])
        assert.ok(ngayCanh(kq, id) != null, id + " chưa hiện · " + tag);
      assert.ok(ngayCanh(kq, chon.may ? "c2_ket" : "c2_ket_a") < 60, tag);
      assert.ok(ngayCanh(kq, "c3_ket") >= 60);
      assert.equal(kq.ket, KET_DUNG[`${chon.may}-${chon.hana}`]);
      assert.ok(kq.hau >= 7);
      const ngay = kq.xem.map((x) => +x.split("@")[1]).filter((d) => d >= 6 && d <= ngayCanh(kq, "c3_ket"));
      for (let k = 1; k < ngay.length; k++) gapMax = Math.max(gapMax, ngay[k] - ngay[k - 1]);
      assert.deepEqual(g.errors.map(String), []);
    } finally {
      g.close();
    }
  }
  /* không thân với Hana: không có ngã rẽ Hana, kết như tiệm chưa lên video */
  const g = boot();
  try {
    const kq = moPhongTruyen(g, 75, { khongHana: true, chon: { may: 1 } });
    assert.equal(kq.nhanh.hana, undefined);
    assert.equal(kq.ket, "tiem_cua_xom");
    assert.deepEqual(kq.trang, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    /* cảnh cần gửi tiền về quê ba tháng hay mua nhà (tab Đời sống) không tới trong 75 ngày: có test riêng */
    const thieu = JSON.parse(g.run("JSON.stringify(MAU_CHUYEN.filter((m) => { const d = m.dieuKien || {}; return !d.le && !d.buoc && !d.luot && d.sau !== 'c3_ket' && !Object.keys(d.co || {}).some((k) => /^(gui_3|ds_)/.test(k)); }).map((m) => m.id))")).filter(
      (id) => !daThay.has(id),
    );
    assert.deepEqual(thieu, []);
  } finally {
    g.close();
  }
  assert.ok(gapMax <= 8, "quãng trống dài nhất " + gapMax + " ngày");
});

test("Sau Tết: qua cảnh mở hàng mùng năm vẫn có cảnh mỗi tuần tới khoảng ngày 200, đúng nhánh, nhãn Sau Tết", () => {
  const daThay = new Set();
  for (const chon of [{ linh: 0, hana: 0, may: 0, tet: 0 }, { linh: 1, hana: 1, may: 1, tet: 1 }]) {
    const g = boot();
    try {
      const kq = moPhongTruyen(g, 200, { chon, cuoi: chon.may === 1, ngheo: chon.tet === 1 }),
        tag = JSON.stringify(chon) + ": " + kq.xem.join(" "),
        ket = ngayCanh(kq, "c3_ket");
      kq.xem.forEach((x) => daThay.add(x.split("@")[0]));
      const st = kq.xem.filter((x) => x.startsWith("st_")).map((x) => +x.split("@")[1]);
      assert.ok(st.length >= 11, "ít nhất 11 cảnh Sau Tết · " + tag);
      assert.ok(st.every((d) => d > ket), tag);
      const ngay = [ket, ...st].sort((a, b) => a - b);
      for (let k = 1; k < ngay.length; k++) assert.ok(ngay[k] - ngay[k - 1] <= 13, "quãng trống sau Tết · " + tag);
      /* đúng nhánh */
      assert.equal(ngayCanh(kq, chon.linh ? "st_linh_a" : "st_linh_b"), null, tag);
      assert.equal(ngayCanh(kq, chon.may ? "st_vy_a" : "st_vy_b"), null, tag);
      assert.equal(ngayCanh(kq, chon.hana ? "st_hana_a" : "st_hana_b"), null, tag);
      /* nhãn Sau Tết trong Sổ tay */
      g.run("R.tab = 'hem'; R.sub = { hem: HEM_TAB.findIndex((x) => x[1] === paneSoTay) }; renderPrep()");
      assert.match(g.run("document.getElementById('pane').textContent"), /Sau Tết/);
      assert.deepEqual(g.errors.map(String), []);
    } finally {
      g.close();
    }
  }
  for (const id of ["st_so", "st_khoa", "st_hanh", "st_tu", "st_me", "st_muop", "st_sau", "st_mua"]) assert.ok(daThay.has(id), id + " chưa hiện");
});

test("Tết ngoài đời trùng Tết của truyện: không chen cảnh ba mẹ lên thăm, ông Táo vào đoạn ngày 55 tới mùng năm", () => {
  const g = boot();
  try {
    /* cảnh thử có cùng điều kiện với le_tet, le_ong_tao nhưng không cần đúng ngày lễ ngoài đời */
    assert.ok(g.run("['le_tet', 'le_ong_tao'].every((id) => MAU_CHUYEN.find((m) => m.id === id).dieuKien.ngoaiTetTruyen)"));
    g.run("MAU_CHUYEN.push({ id: 'thu_tet', luc: 'mo_cua', dieuKien: { ngoaiTetTruyen: true }, thoai: [] })");
    const hop = () => g.run("hopCanh(MAU_CHUYEN.find((m) => m.id === 'thu_tet'), 'mo_cua')");
    g.run("S.day = 40");
    assert.equal(hop(), true);
    g.run("S.day = 62");
    assert.equal(hop(), false);
    g.run("TT().xem.c3_ket = 67; S.day = 70");
    assert.equal(hop(), true, "qua mùng năm rồi thì Tết ngoài đời hiện bình thường");
  } finally {
    g.close();
  }
});

test("c1_vay không tới sau khi mẹ đã báo ba trặc lưng", () => {
  const g = boot();
  try {
    g.run("S.day = 40; S.money = 100000; TT().xem.gui_1 = 37");
    assert.equal(g.run("hopCanh(MAU_CHUYEN.find((m) => m.id === 'c1_vay'), 'dong_cua')"), false);
    g.run("delete TT().xem.gui_1");
    assert.equal(g.run("hopCanh(MAU_CHUYEN.find((m) => m.id === 'c1_vay'), 'dong_cua')"), true);
  } finally {
    g.close();
  }
});

test("Hẻm 42 lần nữa: lượt hai có cảnh riêng, nhắc lại kết đã thấy ở lượt trước", () => {
  const g = boot();
  try {
    const kq = moPhongTruyen(g, 50, { luot: 2, ketCu: ["thuong_hieu"] });
    assert.ok(ngayCanh(kq, "lan2_meo") != null);
    assert.ok(ngayCanh(kq, "lan2_mo") != null);
    const dong = JSON.parse(g.run("JSON.stringify(locDong(MAU_CHUYEN.find((m) => m.id === 'lan2_mo').thoai).map((d) => d[1]))"));
    assert.ok(dong.some((c) => /Mây Tea/.test(c)));
    assert.ok(!dong.some((c) => /gấp phiếu/.test(c)));
  } finally {
    g.close();
  }
  const g2 = boot();
  try {
    const kq = moPhongTruyen(g2, 50);
    assert.equal(ngayCanh(kq, "lan2_meo"), null);
  } finally {
    g2.close();
  }
});test("Hana ghé quầy bằng ảnh ngôi sao, không bị tính giá khách nổi tiếng", () => {
  const g = boot();
  try {
    g.run("S.day = 40; __openDay(); R.slots = R.slots.map(() => null); spawnQuen(0, 'hana')");
    assert.equal(g.run("R.slots[0].name"), "Hana");
    assert.equal(g.run("R.slots[0].sf"), 2);
    assert.equal(g.run("R.slots[0].star"), undefined);
    assert.match(g.run("faceOf(R.slots[0], 0, 56, 55)"), /star\.webp/);
    const m0 = g.run("S.money"), r0 = g.run("recRev(S.cur)");
    g.run("R.slots[0].pat = R.slots[0].max; __serveSlot(0)");
    assert.equal(g.run("S.money") - m0, g.run("recRev(S.cur)") - r0);
    assert.equal(g.run("TT().than.hana"), 1);
  } finally {
    g.close();
  }
});

test("video của Hana ghi tên tiệm: 3 ngày đầu rất đông, sau đó vẫn đông hơn", () => {
  const g = boot();
  try {
    g.run("S.day = 46; TT().xem.hana_3 = 45; TT().nhanh.hana = 'A'");
    assert.equal(g.run("heSoKhachTruyen()"), 1.3);
    g.run("S.day = 49");
    assert.equal(g.run("heSoKhachTruyen()"), 1.1);
    g.run("TT().nhanh.hana = 'B'");
    assert.equal(g.run("heSoKhachTruyen()"), 1);
  } finally {
    g.close();
  }
});

test("cảnh lễ lặp lại mỗi năm: năm sau có lời thoại khác, bản lưu cũ giữ năm đã xem", () => {
  const g = boot();
  try {
    const canh = (ngay) => {
      g.run(`window.__ngay = "${ngay}"; S.day = 40; TT().homNay = 0; document.getElementById("modal").hidden = true; truyenLuc("mo_cua")`);
      return g.w.document.getElementById("card").textContent;
    };
    g.run("MAU_CHUYEN.forEach((m) => { if (!m.moiNam) TT().xem[m.id] = 1; })");
    assert.match(canh("2026-12-22"), /treo dây kim tuyến/);
    assert.ok(g.run("TT().xem['le_noel@2026']") != null);
    /* cùng mùa Noel không hiện lại */
    g.run("document.getElementById('modal').hidden = true; TT().homNay = 0");
    assert.equal(g.run("(canhKe('mo_cua') || {}).id"), undefined);
    assert.match(canh("2027-12-22"), /đèn nhấp nháy/);
    /* ông Táo trước Tết 2028 (mùng 1 là 26/01/2028), Tết từ giao thừa */
    assert.match(canh("2028-01-19"), /tiễn ông Táo|thả cá chép/);
    assert.match(canh("2028-01-26"), /Tết này con có về không/);
    assert.match(canh("2027-09-15"), /Rằm tháng Tám/);
  } finally {
    g.close();
  }
  const g2 = boot();
  try {
    g2.run("S.tr = { xem: { le_noel_2026: 30, le_tet_2027: 45 } }");
    assert.equal(g2.run("TT().xem['le_noel@2026']"), 30);
    assert.equal(g2.run("TT().xem['le_tet@2027']"), 45);
    assert.equal(g2.run("TT().xem.le_noel_2026"), undefined);
  } finally {
    g2.close();
  }
});

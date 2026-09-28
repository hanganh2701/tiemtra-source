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
/* chonCuoi: luôn chọn phương án cuối (ở ngã rẽ là nhánh B); khongHana: không phục vụ Hana nên video không lên */
function moPhongTruyen(g, toiNgay, { chonCuoi = false, khongHana = false } = {}) {
  return JSON.parse(g.run(`JSON.stringify((() => {
    /* nhánh B cho két cạn để có cảnh mẹ hỏi chuyện tiền */
    S.tr = { che: "tat" }; S.day = 1; S.money = ${chonCuoi ? 100000 : 500000};
    const T = TT(), xem = [];
    const canh = (luc) => {
      const m = canhKe(luc);
      if (!m) return;
      T.xem[m.id] = ngayCua(luc); T.homNay = ngayCua(luc);
      const ds = m.luaChon || [];
      apDung(m, ${chonCuoi ? "ds[ds.length - 1]" : "ds[0]"});
      xem.push(m.id + "@" + ngayCua(luc));
    };
    for (let d = 1; d <= ${toiNgay}; d++) {
      canh("mo_cua");
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

test("mọi tổ hợp nhánh: đủ 12 trang, tới đúng kết, chương 2 xong trước ngày 60, cảnh nào cũng có người thấy", () => {
  const daThay = new Set(),
    ketDung = { "A-true": "thuong_hieu", "A-false": "xuong_tran_chau", "B-true": "len_ban_do", "B-false": "tiem_cua_xom" };
  let gapMax = 0;
  for (const chonCuoi of [false, true])
    for (const khongHana of [false, true]) {
      const g = boot();
      try {
        const kq = moPhongTruyen(g, 75, { chonCuoi, khongHana }),
          may = chonCuoi ? "B" : "A",
          tag = `${may}${khongHana ? " không Hana" : ""}: ${kq.xem.join(" ")}`;
        kq.xem.forEach((x) => daThay.add(x.split("@")[0]));
        assert.deepEqual(kq.trang, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], tag);
        assert.equal(kq.nhanh.may, may);
        const chung = ["c2_may", "hanh_1", "hanh_2", "c2_trung_thu", "c2_vy", "c2_ba_sau", "c2_nga_re", "c3_vang", "c3_me", "c3_ket"],
          rieng = may === "A" ? ["may_a1", "may_a2", "may_a3", "c2_ket_a"] : ["may_b1", "may_b2", "may_b3", "c2_ket"],
          khac = may === "A" ? ["may_b1", "c2_ket"] : ["may_a1", "c2_ket_a"];
        for (const id of [...chung, ...rieng, ...(khongHana ? [] : ["hana_1", "hana_2", "hana_3"])]) assert.ok(ngayCanh(kq, id) != null, id + " chưa hiện · " + tag);
        for (const id of khac) assert.equal(ngayCanh(kq, id), null, id + " của nhánh kia lại hiện · " + tag);
        /* nhánh diễn ra sau ngã rẽ, chốt chương trước ngày 60, kết truyện sau ngày 60 */
        assert.ok(ngayCanh(kq, rieng[0]) > ngayCanh(kq, "c2_nga_re"));
        assert.ok(ngayCanh(kq, rieng[3]) < 60, tag);
        assert.ok(ngayCanh(kq, "c3_ket") >= 60);
        assert.equal(kq.ket, ketDung[`${may}-${!khongHana}`]);
        assert.ok(kq.hau >= 6);
        assert.equal(kq.co.me_len, true);
        /* không có quãng trống truyện quá dài từ ngày 6 tới giao thừa */
        const ngay = kq.xem.map((x) => +x.split("@")[1]).filter((d) => d >= 6 && d <= ngayCanh(kq, "c3_ket"));
        for (let k = 1; k < ngay.length; k++) gapMax = Math.max(gapMax, ngay[k] - ngay[k - 1]);
        assert.deepEqual(g.errors.map(String), []);
      } finally {
        g.close();
      }
    }
  const g = boot();
  try {
    /* cảnh lễ theo lịch thật và cảnh mặt tiền (cần thuê mặt tiền) nằm ngoài mô phỏng này */
    const thieu = JSON.parse(g.run("JSON.stringify(MAU_CHUYEN.filter((m) => !(m.dieuKien || {}).le && !(m.dieuKien || {}).buoc).map((m) => m.id))")).filter((id) => !daThay.has(id));
    assert.deepEqual(thieu, []);
  } finally {
    g.close();
  }
  assert.ok(gapMax <= 8, "quãng trống dài nhất " + gapMax + " ngày");
});
test("Hana ghé quầy bằng ảnh ngôi sao, không bị tính giá khách nổi tiếng", () => {
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

test("video của Hana: 3 ngày sau đó khách đông hơn", () => {
  const g = boot();
  try {
    g.run("S.day = 46; TT().xem.hana_3 = 45");
    assert.equal(g.run("heSoKhachTruyen()"), 1.3);
    g.run("S.day = 49");
    assert.equal(g.run("heSoKhachTruyen()"), 1);
  } finally {
    g.close();
  }
});

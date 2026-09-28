/* Test hành vi chính của game. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "./harness.mjs";

test("khởi động không lỗi và dữ liệu nạp đủ", () => {
  const g = boot();
  try {
    assert.deepEqual(g.errors, []);
    assert.equal(typeof g.run("GAME_VERSION"), "string");
    assert.ok(g.run("CHANGELOG.length") > 0);
    assert.ok(g.run("Object.keys(TXT).length") > 5);
    assert.ok(g.run("STARS.length") > 0 && g.run("Object.keys(EVS).length") > 5);
    assert.equal(g.run("S.day"), 1);
    assert.ok(g.w.document.getElementById("view").innerHTML.length > 1000);
  } finally {
    g.close();
  }
});

test("doanh thu trong sổ khớp tiền vào két với mọi loại khách", () => {
  const g = boot();
  try {
    g.run("__openDay()");
    for (const kind of ["thuong", "sao", "bung", "mac"]) {
      const i = g.run("__fillSlot()");
      if (kind === "sao") g.run(`R.slots[${i}] = null; spawnStar(${i})`);
      if (kind === "bung" || kind === "mac") g.run(`R.slots[${i}].brat = "${kind}"; R.slots[${i}].star = null`);
      const m0 = g.run("S.money"), r0 = g.run("recRev(S.cur)");
      g.run(`__serveSlot(${i})`);
      const dm = g.run("S.money") - m0, dr = g.run("recRev(S.cur)") - r0;
      assert.equal(dm, dr, `khách ${kind}: két +${dm} nhưng sổ +${dr}`);
    }
    assert.deepEqual(g.errors, []);
  } finally {
    g.close();
  }
});

test("kho không bao giờ âm sau một ngày bán dày", () => {
  const g = boot();
  try {
    g.run("__openDay()");
    for (let n = 0; n < 30; n++) g.run("__serveSlot(__fillSlot())");
    const neg = g.run("Object.entries(S.stock).filter(([k, bs]) => bs.some((b) => !(b.q >= 0))).map(([k]) => k)");
    assert.deepEqual([...neg], []);
  } finally {
    g.close();
  }
});

test("lưu rồi mở lại giữ nguyên tiến trình", () => {
  const a = boot();
  let saved;
  try {
    a.run("S.day = 12; S.money = 1234000; S.shopName = 'Quán Thử'; save()");
    saved = a.w.localStorage.getItem("tsShop2");
  } finally {
    a.close();
  }
  const b = boot({ storage: { tsShop2: saved } });
  try {
    assert.equal(b.run("S.day"), 12);
    assert.equal(b.run("S.money"), 1234000);
    assert.equal(b.run("S.shopName"), "Quán Thử");
  } finally {
    b.close();
  }
});

test("save rất cũ (kho dạng số) không bị cộng hạn dùng hai lần", () => {
  const old = JSON.stringify({ day: 10, money: 500000, stock: { f_dua: 5, tra: 3 }, unlocked: { tra: true } });
  const g = boot({ storage: { tsShop2: old } });
  try {
    const exp = g.run("S.stock.f_dua[0].exp"), life = g.run("CFG.life.f_dua");
    assert.equal(exp, 10 + life - 1);
  } finally {
    g.close();
  }
});

test("két âm lần đầu trong chương: bà Sáu cho khất, không phá sản", () => {
  const g = boot();
  try {
    g.run("S.shopName = 'Quán Khất'; __openDay(); S.money = 1000; closeEarly()");
    const saved = JSON.parse(g.w.localStorage.getItem("tsShop2"));
    assert.equal(saved.day, 2);
    assert.equal(saved.money, 0);
    assert.ok(saved.noSau > 0);
    assert.match(g.w.document.getElementById("card").textContent, /Bà Sáu cho khất/);
  } finally {
    g.close();
  }
});

test("phá sản lần hai trong chương: lưu quán mới ngay, giữ tên quán và câu chuyện", () => {
  const g = boot();
  try {
    g.run("S.shopName = 'Quán Phá'; S.tr = { khat: { 0: true }, trang: [1], than: { tu: 4 } }; S.kl = { chuoiMax: 7 }; __openDay(); S.money = 1000; closeEarly()");
    const saved = JSON.parse(g.w.localStorage.getItem("tsShop2"));
    assert.equal(saved.day, 1);
    assert.equal(saved.money, g.run("CFG.startMoney"));
    assert.equal(saved.shopName, "Quán Phá");
    assert.deepEqual(saved.tr.trang, [1]);
    assert.equal(saved.tr.than.tu, 4);
    assert.equal(saved.kl.chuoiMax, 7);
    assert.match(g.w.document.getElementById("card").textContent, /Phá sản/);
  } finally {
    g.close();
  }
});

test("khôi phục bản hỏng không ghi đè tiến trình đang chơi", () => {
  const g = boot();
  try {
    g.run("S.day = 7; S.money = 777000; save()");
    g.run("applyRestore({ stock: {}, day: 3, money: 1, upg: null })");
    assert.equal(g.run("S.day"), 7);
    assert.equal(g.run("S.money"), 777000);
    assert.equal(JSON.parse(g.w.localStorage.getItem("tsShop2")).day, 7);
  } finally {
    g.close();
  }
});

test("mã sao lưu giả bị từ chối, mã thật đọc được", async () => {
  const g = boot();
  try {
    g.run(`window.__mk = async (d) => { const body = "p" + b64e(new TextEncoder().encode(JSON.stringify(d))); return "TTN1." + body + "." + bakHash(body); }`);
    const tryRead = (d) => g.run(`__mk(${JSON.stringify(d)}).then(readBackup).then(() => "ok", (e) => "loi")`);
    assert.equal(await tryRead({ stock: {}, day: "<img src=x onerror=alert(1)>", money: 1 }), "loi");
    assert.equal(await tryRead({ stock: {}, day: "5", money: 1 }), "loi");
    assert.equal(await tryRead({ stock: {}, day: 5, money: "1e9" }), "loi");
    assert.equal(await tryRead({ stock: {}, day: 5, money: 1000 }), "ok");
  } finally {
    g.close();
  }
});

test("chống gian lận: bắt save bị sửa, tha người chơi thật khi chủ game hạ giá trần", () => {
  const mkSave = (perCup) => {
    const a = boot();
    try {
      a.run(`S.day = 5; S.money = 5000000; const r = newRec(4); r.sales = { tra: { q: 10, a: ${perCup} * 10 } }; S.history = [r]; noteCaps(); save()`);
      return a.w.localStorage.getItem("tsShop2");
    } finally {
      a.close();
    }
  };
  const lowered = JSON.stringify({ itemCap: 30000, cfgVer: 39 });
  const legit = boot({ storage: { tsShop2: mkSave(90000), tsOwner: lowered } });
  try {
    assert.equal(legit.run("S.money"), 5000000);
  } finally {
    legit.close();
  }
  const cheat = boot({ storage: { tsShop2: mkSave(500000) } });
  try {
    assert.equal(cheat.run("S.money"), cheat.run("CFG.thiefLeft"));
  } finally {
    cheat.close();
  }
});

test("khôi phục cấu hình mặc định giữ phiên bản cấu hình và hạn chai hương", () => {
  const g = boot();
  try {
    g.run("ownerPanel(); document.getElementById('oReset').click()");
    assert.equal(g.run("CFG.cfgVer"), g.run("CFG_VER"));
    assert.equal(g.run("CFG.life.f_oi"), g.run("CFG.bottleLife"));
    assert.equal(g.run("CFG.cost.f_oi"), g.run("Math.round(CFG.bottle / CFG.bottleN)"));
  } finally {
    g.close();
  }
});

test("câu đánh giá: chỉ 1 câu không bao giờ được chọn (đã biết)", () => {
  const g = boot();
  try {
    const never = g.run(`(() => {
      const base = { wait: false, slow: false, pricey: false, dear: false, wrong: false, cheap: false, spill: false };
      const V = {
        great: [{ ...base }, { ...base, cheap: true }],
        ok: [{ ...base }, { ...base, cheap: true }, { ...base, slow: true }, { ...base, dear: true }, { ...base, spill: true }],
        meh: [{ ...base }, { ...base, cheap: true }, { ...base, slow: true }, { ...base, dear: true }, { ...base, spill: true }],
        bad: [{ ...base }, { ...base, slow: true }, { ...base, dear: true }, { ...base, spill: true }],
        cheap: [{ ...base, cheap: true }], wait: [{ ...base, wait: true, slow: true }], late: [{ ...base, wait: true, slow: true }],
        pricey: [{ ...base, pricey: true }, { ...base, pricey: true, wait: true, slow: true }],
        wrong: [{ ...base, wrong: true }, { ...base, wrong: true, wait: true, slow: true }],
      };
      const mk = (rf, size) => ({ rf, cups: [{ base: "tra", tops: ["tcden"], ice: "Đá thường", size }], wk: { mon: 1, size: 1, sugar: 1, ice: 1, tops: 1 } });
      const out = [];
      for (const [why, vs] of Object.entries(V))
        for (const t0 of TXT[why] || []) {
          const t = t0.replace(/\\{[Mm]on\\}/g, "trà sữa").replace(/\\{[Tt]op\\}/g, "trân châu đen").replace(/\\{shop\\}/g, "quán X").replace("%", "trà sữa");
          if (!vs.some((rf) => ["M", "L"].some((sz) => reviewFits(t, why, mk(rf, sz))))) out.push(t0);
        }
      return out;
    })()`);
    assert.deepEqual([...never], ["Cảm ơn nhân viên đã làm lại đúng ý mình"]);
  } finally {
    g.close();
  }
});

test("đo lường: chưa gắn địa chỉ thì không gửi gì, vẫn nhớ ngày chơi đầu", () => {
  const g = boot();
  try {
    let sent = 0;
    const Img = g.w.Image;
    g.w.Image = function () { sent++; return new Img(); };
    g.run('track("thu"); trackReturn()');
    assert.equal(sent, 0);
    assert.match(g.w.localStorage.getItem("tsFirst"), /^\d{4}-\d{2}-\d{2}$/);
  } finally {
    g.close();
  }
});

test("nhập mã 8 số cũ thì được hướng dẫn dùng mã dài, không gọi máy chủ", async () => {
  const g = boot();
  try {
    let fetched = 0;
    g.w.fetch = () => { fetched++; return Promise.reject(new Error("x")); };
    g.run("restoreDlg()");
    g.w.document.getElementById("rsCode").value = "1234 5678";
    g.w.document.getElementById("rsGo").click();
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(fetched, 0);
    assert.match(g.w.document.getElementById("card").textContent, /Mã 8 số chỉ dùng được ở trang gốc/);
  } finally {
    g.close();
  }
});

test("cốt truyện: id không trùng, nhân vật có thật, câu vừa màn hình", () => {
  const g = boot();
  try {
    const bad = g.run(`(() => {
      const out = [], ids = new Set();
      for (const m of MAU_CHUYEN) {
        if (ids.has(m.id)) out.push("trùng id " + m.id);
        ids.add(m.id);
        if (!["mo_cua", "dong_cua"].includes(m.luc)) out.push(m.id + ": luc sai");
        const lines = [...m.thoai, ...(m.thoaiLai || []), ...(m.luaChon || []).flatMap((c) => c.thoai || [])];
        if ((m.thoaiLai || []).length > 6) out.push(m.id + ": thoaiLai quá 6 câu");
        if (m.chuong === 0 && m.thoai.length > 3) out.push(m.id + ": chương 0 quá 3 câu");
        /* câu có điều kiện trên cùng một cờ là các phương án thay nhau, chỉ hiện một câu */
        const nhom = new Set(m.thoai.filter((d) => d[2]).map((d) => JSON.stringify(Object.entries(d[2]).map(([k, v]) => [k, Object.keys(v).sort()]))));
        if (m.thoai.filter((d) => !d[2]).length + nhom.size > 6) out.push(m.id + ": quá 6 câu");
        if (m.reRe && !((m.luaChon || []).length >= 2 && m.luaChon.every((c) => c.nhanh))) out.push(m.id + ": ngã rẽ thiếu nhánh");
        for (const [ai, cau] of lines) {
          if (ai !== "_" && ai !== "tin" && !NHAN_VAT[ai]) out.push(m.id + ": không có nhân vật " + ai);
          if (cau.replace(/\\{\\w+\\}/g, "anh").length > 72) out.push(m.id + ": câu dài " + cau.length);
        }
      }
      for (const r of NGA_RE) if (!MAU_CHUYEN.some((m) => m.id === r.canh && m.reRe)) out.push("ngã rẽ " + r.id + " không có cảnh");
      if (new Set(KET_CUC.map((k) => k.id)).size !== KET_CUC.length) out.push("trùng id kết");
      for (const [ai, ds] of HAU_TRUYEN) {
        if (!NHAN_VAT[ai]) out.push("hậu truyện: không có nhân vật " + ai);
        for (const [, chu] of ds) if (chu && chu.replace(/\{\w+\}/g, "anh").length > 100) out.push("hậu truyện " + ai + ": câu dài " + chu.length);
      }
      return out;
    })()`);
    assert.deepEqual([...bad], []);
  } finally {
    g.close();
  }
});

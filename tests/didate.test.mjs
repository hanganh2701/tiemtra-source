/* Test trang thiệp didate (may-chu/didate): dữ liệu dùng chung, API của worker (D1 giả bằng node:sqlite,
   Telegram giả), kho ảnh Telegram, tấm thiệp và trang soạn chạy trong jsdom, file tĩnh. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { JSDOM } from "jsdom";
import worker from "../may-chu/didate/worker.js";
import { luuAnh, docAnh, xoaAnh } from "../may-chu/didate/kho-anh.js";
import { MAU, TRUONG_CHU, thiepMau, chuMau, bienXung, lamSach, lamSachTraLoi, tachCho, dien, ngayDep, congNgay, LoiDuLieu } from "../may-chu/didate/public/chung.js";

const GOC = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "may-chu", "didate");
const PUB = path.join(GOC, "public");
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0xff, 0xd9]);

/* ---------- D1 giả: cùng cách gọi prepare().bind().first()/all()/run() ---------- */
function d1Gia() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(path.join(GOC, "schema.sql"), "utf8"));
  const doi = (a) => a.map((x) => (x === undefined ? null : x instanceof ArrayBuffer ? new Uint8Array(x) : typeof x === "boolean" ? Number(x) : x));
  const cau = (sql, a = []) => ({
    bind: (...b) => cau(sql, b),
    first: async (cot) => {
      const r = db.prepare(sql).get(...doi(a));
      return r ? (cot ? r[cot] : { ...r }) : null;
    },
    all: async () => ({ results: db.prepare(sql).all(...doi(a)).map((r) => ({ ...r })) }),
    run: async () => {
      const r = db.prepare(sql).run(...doi(a));
      return { success: true, meta: { changes: Number(r.changes) } };
    },
  });
  return { prepare: (sql) => cau(sql), db };
}

const ASSETS = {
  async fetch(req) {
    let p = new URL(req.url).pathname;
    if (p.endsWith("/")) p += "index.html";
    const f = path.join(PUB, p);
    if (!existsSync(f)) return new Response("không có", { status: 404 });
    return new Response(readFileSync(f), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  },
};

function moiTruong(them = {}) {
  return { DB: d1Gia(), ASSETS, KHO_ANH: "d1", ...them };
}
async function goi(env, duong, init = {}) {
  const cho = [];
  const r = await worker.fetch(new Request(`https://didate.meomeo.app${duong}`, init), env, { waitUntil: (p) => cho.push(p) });
  await Promise.all(cho);
  return r;
}
function formThiep(t, anh) {
  const f = new FormData();
  f.append("du_lieu", JSON.stringify(t));
  if (anh) f.append("anh", new Blob([anh], { type: "image/jpeg" }), "anh.jpg");
  return f;
}
const thiepThu = (o = {}) => ({ ...thiepMau("an", { gui: "Nam", nhan: "Mai" }), ...o });
async function taoThiep(env, t = thiepThu(), anh) {
  const r = await goi(env, "/api/thiep", { method: "POST", body: formThiep(t, anh) });
  assert.equal(r.status, 201, await r.clone().text());
  return r.json();
}

/* ---------- chung.js ---------- */

test("didate: mẫu nào cũng qua lamSach, đổi xưng hô thì chữ đổi theo", () => {
  for (const mau of Object.keys(MAU)) {
    for (let xung = 0; xung < 6; xung++) {
      const t = thiepMau(mau, { gui: "Nam", nhan: "Mai", xung });
      const s = lamSach(t);
      for (const k of TRUONG_CHU) assert.equal(typeof s[k], "string", `${mau}.${k}`);
      assert.ok(s.cauHoi && s.nutCo && s.chonDs.length, mau);
      assert.ok(!/undefined|null/.test(JSON.stringify(s)), `${mau} có chữ undefined`);
    }
  }
  assert.match(thiepMau("an", { nhan: "Mai" }).nhanDan, /Mai/);
  assert.match(thiepMau("an", { xung: 2 }).tieuDe, /^Tớ .* cậu/);
  assert.equal(bienXung({ xung: 0 }).da, "Dạ ");
  assert.equal(bienXung({ xung: 2 }).da, "");
  /* tắt bước chọn thì lời kết mẫu không còn chỗ {chon} */
  const t = { ...thiepMau("an"), chonBat: false, hoiGio: false };
  assert.ok(!chuMau(t).ketLoi.includes("{chon}"));
  assert.ok(!chuMau(t).ketLoi.includes("{gio}"));
  assert.ok(chuMau(t).ketLoi.includes("{ngay}"));
});

test("didate: lamSach chặn dữ liệu xấu", () => {
  assert.throws(() => lamSach(null), LoiDuLieu);
  assert.throws(() => lamSach({ ...thiepThu(), mau: "__proto__" }), /mẫu/);
  assert.throws(() => lamSach({ ...thiepThu(), nhan: "  " }), /người nhận/);
  assert.throws(() => lamSach({ ...thiepThu(), cauHoi: "" }), /câu hỏi/);
  const s = lamSach({
    ...thiepThu(),
    gui: "Na\u0000m\u202e",
    nhan: "Mai".repeat(30),
    tieuDe: "a".repeat(500),
    loiDau: "dòng 1\r\n\r\n\r\n\r\ndòng 2",
    xung: 99,
    mauSac: "den",
    gioGoiY: ["19:00", "25:00", "19:00", "07:30", 5],
    chonDs: [{ ten: "" }, null, { bieu: "🍜", ten: "Mì", moTa: "x", la: 1 }],
    la: "bỏ",
  });
  assert.equal(s.gui, "Nam");
  assert.equal(Array.from(s.nhan).length, 40);
  assert.equal(s.tieuDe.length, 120);
  assert.equal(s.loiDau, "dòng 1\n\ndòng 2");
  assert.equal(s.xung, 0);
  assert.equal(s.mauSac, "hong");
  assert.deepEqual(s.gioGoiY, ["07:30", "19:00"]);
  assert.deepEqual(s.chonDs, [{ bieu: "🍜", ten: "Mì", moTa: "x" }]);
  assert.equal(s.la, undefined);
  /* chữ gõ dạng NFD (máy Mac) thành NFC */
  assert.equal(lamSach({ ...thiepThu(), nhan: "Mai Thảo".normalize("NFD") }).nhan, "Mai Thảo".normalize("NFC"));
  /* không có món nào và không cho ý khác thì tắt bước chọn; không có nút Không thì không né */
  assert.equal(lamSach({ ...thiepThu(), chonDs: [], chonKhac: false }).chonBat, false);
  assert.equal(lamSach({ ...thiepThu(), nutKhong: "" }).ne, false);
});

test("didate: câu trả lời kiểm theo đúng thiệp", () => {
  const t = lamSach(thiepThu());
  const homNay = "2026-10-22";
  const ok = lamSachTraLoi({ dongY: true, ngay: "2026-10-25", gio: "19:00", chon: "Lẩu", soLanNe: 7.9, loiNhan: " hihi ", la: 1 }, t, homNay);
  assert.deepEqual(ok, { dongY: true, soLanNe: 7, ngay: "2026-10-25", gio: "19:00", chon: "Lẩu", loiNhan: "hihi" });
  assert.throws(() => lamSachTraLoi({ dongY: true, ngay: "2026-10-20", gio: "19:00", chon: "Lẩu" }, t, homNay), /Ngày/);
  assert.throws(() => lamSachTraLoi({ dongY: true, ngay: "2026-02-30", gio: "19:00", chon: "Lẩu" }, t, homNay), /Ngày/);
  assert.throws(() => lamSachTraLoi({ dongY: true, ngay: "2026-10-25", gio: "7h", chon: "Lẩu" }, t, homNay), /Giờ/);
  /* có cho ý khác thì nhận chữ tự viết, không cho thì chỉ nhận món trong danh sách */
  assert.equal(lamSachTraLoi({ dongY: true, ngay: "2026-10-25", gio: "19:00", chon: "Bún bò" }, t, homNay).chon, "Bún bò");
  assert.throws(() => lamSachTraLoi({ dongY: true, ngay: "2026-10-25", gio: "19:00", chon: "Bún bò" }, { ...t, chonKhac: false }, homNay), /Lựa chọn/);
  /* từ chối thì không cần chọn gì; số lần né có giới hạn */
  assert.deepEqual(lamSachTraLoi({ dongY: false, soLanNe: 1e9 }, t, homNay), { dongY: false, soLanNe: 999 });
  assert.equal(congNgay("2026-12-31", 1), "2027-01-01");
  assert.equal(ngayDep("2026-10-24", "2026-10-22"), "Thứ Bảy, 24/10");
  assert.equal(ngayDep("2027-01-01", "2026-10-22"), "Thứ Sáu, 01/01/2027");
});

test("didate: điền câu trả lời vào lời kết, bỏ gọn chỗ của bước đã tắt", () => {
  const p = tachCho("Vậy {ngay} lúc {gio} mình đi ăn {chon} nha!", { ngay: "Thứ Bảy, 24/10", gio: "19:00", chon: "Lẩu" });
  assert.deepEqual(
    p.filter((x) => x.gt).map((x) => x.chu),
    ["Thứ Bảy, 24/10", "19:00", "Lẩu"],
  );
  assert.equal(dien("Đi ăn {chon} nha!", { chon: "" }), "Đi ăn nha!");
  assert.equal(dien("{nhan} ơi {la}", { nhan: "Mai" }), "Mai ơi {la}");
});

/* ---------- worker ---------- */

test("didate: tạo thiệp, mở trang thiệp, dữ liệu không thoát được khỏi thẻ script", async () => {
  const env = moiTruong();
  const xau = "</script><img src=x onerror=alert(1)>";
  const { id, khoa, hetHan } = await taoThiep(env, thiepThu({ nhan: xau, nhanDan: `Gửi ${xau}` }));
  assert.match(id, /^[a-z2-9]{8}$/);
  assert.match(khoa, /^[A-Za-z0-9_-]{24}$/);
  assert.ok(hetHan > Date.now() + 89 * 86400000);
  /* máy chủ chỉ giữ sha256 của khoá */
  const dong = env.DB.db.prepare("SELECT khoa FROM thiep WHERE id = ?").get(id);
  assert.notEqual(dong.khoa, khoa);
  assert.equal(dong.khoa.length, 64);

  const r = await goi(env, `/${id}`);
  assert.equal(r.status, 200);
  assert.match(r.headers.get("X-Robots-Tag"), /noindex/);
  assert.match(r.headers.get("Cache-Control"), /no-transform/);
  const html = await r.text();
  assert.ok(!html.includes("<img src=x"), "chữ người dùng lọt ra thành thẻ HTML");
  assert.ok(html.includes("\\u003c/script>"));
  assert.ok(html.includes("<title>Gửi &lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;</title>"));
  const du = JSON.parse(new JSDOM(html).window.document.getElementById("du-lieu").textContent);
  assert.equal(du.id, id);
  assert.equal(du.thiep.nhan, xau);
  assert.equal(du.anh, null);
  /* CSP của trang thiệp (worker trả) giống CSP của trang tĩnh (_headers) */
  const csp = readFileSync(path.join(PUB, "_headers"), "utf8").match(/Content-Security-Policy: (.+)/)[1].trim();
  assert.equal(r.headers.get("Content-Security-Policy"), csp);
});

test("didate: ảnh lưu vào kho, chỉ nhận ảnh thật, lấy lại đúng byte", async () => {
  const env = moiTruong();
  const { id } = await taoThiep(env, thiepThu(), JPEG);
  const html = await (await goi(env, `/${id}`)).text();
  assert.ok(html.includes(`/anh/${id}?v=1`));
  const a = await goi(env, `/anh/${id}?v=1`);
  assert.equal(a.status, 200);
  assert.equal(a.headers.get("Content-Type"), "image/jpeg");
  assert.equal(a.headers.get("Cross-Origin-Resource-Policy"), "same-origin");
  assert.deepEqual(new Uint8Array(await a.arrayBuffer()), JPEG);
  const gia = await goi(env, "/api/thiep", { method: "POST", body: formThiep(thiepThu(), new TextEncoder().encode("<svg onload=alert(1)>")) });
  assert.equal(gia.status, 400);
  assert.match((await gia.json()).loi, /JPG, PNG hoặc WebP/);
  assert.equal((await goi(env, "/anh/khongcoo")).status, 404);
});

test("didate: người tạo xem, sửa, xoá bằng khoá; sai khoá thì không", async () => {
  const env = moiTruong();
  const { id, khoa } = await taoThiep(env, thiepThu(), JPEG);
  assert.equal((await goi(env, `/api/thiep/${id}`, { headers: { "X-Khoa": "x".repeat(24) } })).status, 404);
  let du = await (await goi(env, `/api/thiep/${id}`, { headers: { "X-Khoa": khoa } })).json();
  assert.equal(du.thiep.nhan, "Mai");
  assert.equal(du.traLoi, null);
  assert.equal(du.mo.soLan, 0);

  /* sửa chữ và bỏ ảnh */
  const f = formThiep(thiepThu({ tieuDe: "Tiêu đề mới" }));
  f.append("bo_anh", "1");
  assert.equal((await goi(env, `/api/thiep/${id}/sua`, { method: "POST", body: f, headers: { "X-Khoa": "sai".repeat(8) } })).status, 404);
  const s = await goi(env, `/api/thiep/${id}/sua`, { method: "POST", body: formThiep(thiepThu({ tieuDe: "Tiêu đề mới" })), headers: { "X-Khoa": khoa } });
  assert.equal(s.status, 200);
  const f2 = formThiep(thiepThu({ tieuDe: "Tiêu đề mới" }));
  f2.append("bo_anh", "1");
  await goi(env, `/api/thiep/${id}/sua`, { method: "POST", body: f2, headers: { "X-Khoa": khoa } });
  du = await (await goi(env, `/api/thiep/${id}`, { headers: { "X-Khoa": khoa } })).json();
  assert.equal(du.thiep.tieuDe, "Tiêu đề mới");
  assert.equal(du.anh, null);
  assert.equal(env.DB.db.prepare("SELECT COUNT(*) AS n FROM anh_d1").get().n, 0, "ảnh cũ chưa xoá");

  assert.equal((await goi(env, `/api/thiep/${id}/xoa`, { method: "POST", headers: { "X-Khoa": khoa } })).status, 200);
  const r = await goi(env, `/${id}`);
  assert.equal(r.status, 404);
  assert.match(await r.text(), /"khongCo":true/);
});

test("didate: người nhận mở thiệp, trả lời, nhắn lại; câu trả lời sai bị chặn", async () => {
  const env = moiTruong();
  const { id, khoa } = await taoThiep(env);
  const json = (x) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(x) });
  assert.equal((await goi(env, `/api/thiep/${id}/mo`, { method: "POST" })).status, 204);
  await goi(env, `/api/thiep/${id}/mo`, { method: "POST" });
  const ngay = congNgay(new Date().toISOString().slice(0, 10), 3);
  assert.equal((await goi(env, `/api/thiep/${id}/tra-loi`, json({ dongY: true, ngay, gio: "19:00", chon: "Lẩu", soLanNe: 9 }))).status, 200);
  assert.equal((await goi(env, `/api/thiep/${id}/tra-loi`, json({ dongY: true, ngay, gio: "19:00" }))).status, 400);
  assert.equal((await goi(env, `/api/thiep/${id}/tra-loi`, { method: "POST", body: "{x" })).status, 400);
  const du = await (await goi(env, `/api/thiep/${id}`, { headers: { "X-Khoa": khoa } })).json();
  assert.equal(du.mo.soLan, 2);
  assert.ok(du.mo.dau <= du.mo.cuoi);
  assert.deepEqual(du.traLoi, { dongY: true, soLanNe: 9, ngay, gio: "19:00", chon: "Lẩu" });
  /* trang khác không gọi được API */
  const r = await goi(env, `/api/thiep/${id}/tra-loi`, { ...json({ dongY: false }), headers: { "Content-Type": "application/json", Origin: "https://xau.example" } });
  assert.equal(r.status, 403);
  assert.equal((await goi(env, `/api/thiep/${id}/tra-loi`, json({ dongY: false }))).status, 200);
  assert.equal((await goi(env, "/api/thiep/khongcoo/tra-loi", json({ dongY: false }))).status, 404);
});

test("didate: thiệp hết hạn, bị gỡ; dọn hằng ngày xoá thiệp và ảnh quá hạn", async () => {
  const env = moiTruong();
  const a = await taoThiep(env, thiepThu(), JPEG);
  const b = await taoThiep(env);
  env.DB.db.prepare("UPDATE thiep SET het_han = ? WHERE id = ?").run(Date.now() - 1, a.id);
  env.DB.db.prepare("UPDATE thiep SET an = 1 WHERE id = ?").run(b.id);
  assert.equal((await goi(env, `/${a.id}`)).status, 410);
  assert.equal((await goi(env, `/anh/${a.id}?v=1`)).status, 404);
  assert.equal((await goi(env, `/${b.id}`)).status, 404);
  assert.equal((await goi(env, `/api/thiep/${b.id}/mo`, { method: "POST" })).status, 204);
  assert.equal(env.DB.db.prepare("SELECT so_lan_mo FROM thiep WHERE id = ?").get(b.id).so_lan_mo, 0);
  const cho = [];
  await worker.scheduled({}, env, { waitUntil: (p) => cho.push(p) });
  await Promise.all(cho);
  assert.equal(env.DB.db.prepare("SELECT COUNT(*) AS n FROM thiep").get().n, 1);
  assert.equal(env.DB.db.prepare("SELECT COUNT(*) AS n FROM anh_d1").get().n, 0);
});

test("didate: có thiệp mới thì thiệp quá hạn bị dọn luôn (không cần cron)", async () => {
  const env = moiTruong();
  const cu = await taoThiep(env, thiepThu(), JPEG);
  env.DB.db.prepare("UPDATE thiep SET het_han = ? WHERE id = ?").run(Date.now() - 1, cu.id);
  const moi = await taoThiep(env);
  const con = env.DB.db.prepare("SELECT id FROM thiep").all().map((r) => r.id);
  assert.deepEqual(con, [moi.id]);
  assert.equal(env.DB.db.prepare("SELECT COUNT(*) AS n FROM anh_d1").get().n, 0);
});

test("didate: giới hạn tốc độ, đường dẫn lạ trả trang 404", async () => {
  const env = moiTruong({ GIOI_HAN_TAO: { limit: async () => ({ success: false }) } });
  const r = await goi(env, "/api/thiep", { method: "POST", body: formThiep(thiepThu()) });
  assert.equal(r.status, 429);
  const k = await goi(env, "/khong-co-trang-nay");
  assert.equal(k.status, 404);
  assert.match(await k.text(), /Không có trang này/);
  assert.equal((await goi(env, "/api/khac")).status, 404);
});

/* ---------- kho ảnh Telegram (mạng giả) ---------- */

async function voiTelegramGia(xuLy, f) {
  const cu = globalThis.fetch;
  const goiDi = [];
  globalThis.fetch = async (u, init = {}) => {
    const url = String(u);
    goiDi.push({ url, init });
    return xuLy(url, init);
  };
  try {
    return await f(goiDi);
  } finally {
    globalThis.fetch = cu;
  }
}
const tg = (result, ok = true, status = 200, them = {}) => new Response(JSON.stringify({ ok, result, ...them }), { status, headers: { "Content-Type": "application/json" } });

test("didate: kho Telegram gửi ảnh vào kênh, đọc lại qua getFile, token không lọt ra lỗi", async () => {
  const env = { TG_TOKEN: "123:BI-MAT", TG_CHAT: "-1001", KHO_ANH: "telegram" };
  await voiTelegramGia(
    async (url, init) => {
      if (url.endsWith("/sendDocument")) {
        const f = init.body;
        assert.equal(f.get("chat_id"), "-1001");
        assert.equal(f.get("caption"), "didate abc23456");
        assert.equal(f.get("document").name, "abc23456.jpg");
        return tg({ message_id: 77, document: { file_id: "FILE1" } });
      }
      if (url.endsWith("/getFile")) {
        assert.deepEqual(JSON.parse(init.body), { file_id: "FILE1" });
        return tg({ file_path: "documents/file_1.jpg" });
      }
      if (url === "https://api.telegram.org/file/bot123:BI-MAT/documents/file_1.jpg") return new Response(JPEG);
      if (url.endsWith("/deleteMessage")) return tg(false, false, 400, { description: "Bad Request: message can't be deleted" });
      throw new Error(`gọi lạ ${url}`);
    },
    async (goiDi) => {
      const a = await luuAnh(env, "abc23456", { bytes: JPEG, kieu: "image/jpeg" });
      assert.deepEqual(a, { kho: "telegram", file: "FILE1", tin: 77, kieu: "image/jpeg" });
      const body = await docAnh(env, a);
      assert.deepEqual(new Uint8Array(await new Response(body).arrayBuffer()), JPEG);
      assert.equal(await xoaAnh(env, a), false);
      assert.ok(goiDi.every((g) => g.url.startsWith("https://api.telegram.org/")));
    },
  );
  /* Telegram báo lỗi: câu lỗi không chứa token */
  await voiTelegramGia(
    async () => tg(null, false, 401, { description: "Unauthorized" }),
    async () => {
      await assert.rejects(luuAnh(env, "abc23456", { bytes: JPEG, kieu: "image/jpeg" }), (e) => !e.message.includes("BI-MAT") && /401/.test(e.message));
    },
  );
  /* chưa cài bot thì báo rõ */
  await assert.rejects(luuAnh({ KHO_ANH: "telegram" }, "abc23456", { bytes: JPEG, kieu: "image/jpeg" }), /TG_TOKEN/);
});

test("didate: tạo thiệp có ảnh qua Telegram; Telegram lỗi thì không để lại thiệp mất ảnh", async () => {
  const env = moiTruong({ KHO_ANH: "telegram", TG_TOKEN: "1:x", TG_CHAT: "-1" });
  await voiTelegramGia(
    async () => tg(null, false, 500, { description: "Internal" }),
    async () => {
      const r = await goi(env, "/api/thiep", { method: "POST", body: formThiep(thiepThu(), JPEG) });
      assert.equal(r.status, 503);
      assert.equal(env.DB.db.prepare("SELECT COUNT(*) AS n FROM thiep").get().n, 0);
    },
  );
  /* báo thiệp xấu thì nhắn cho chủ dự án */
  const { id } = await taoThiep(env);
  await voiTelegramGia(
    async (url, init) => {
      assert.ok(url.endsWith("/sendMessage"));
      assert.match(JSON.parse(init.body).text, new RegExp(`didate.meomeo.app/${id}[\\s\\S]*quấy rối`));
      return tg({ message_id: 2 });
    },
    async (goiDi) => {
      const r = await goi(env, `/api/thiep/${id}/bao-cao`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lyDo: "quấy rối" }) });
      assert.equal(r.status, 200);
      assert.equal(goiDi.length, 1);
    },
  );
  assert.equal(env.DB.db.prepare("SELECT bao_cao FROM thiep WHERE id = ?").get(id).bao_cao, 1);
});

/* ---------- tấm thiệp và trang soạn trong jsdom ---------- */

function datDom(html, url) {
  const dom = new JSDOM(html, { url });
  const w = dom.window;
  Object.assign(globalThis, { document: w.document, location: w.location, localStorage: w.localStorage, HTMLElement: w.HTMLElement, confirm: () => true });
  return w;
}
const cho = (ms) => new Promise((r) => setTimeout(r, ms));

test("didate: tấm thiệp: mở thư, nút Không né 9 lần rồi trốn, chọn ngày giờ món, gửi câu trả lời", async () => {
  const w = datDom('<!doctype html><main id="g"></main>', "https://didate.meomeo.app/abc23456");
  const { veThiep } = await import("../may-chu/didate/public/the.js");
  const goc = w.document.getElementById("g");
  const gui = [];
  const t = lamSach(thiepThu({ nhan: "<b>Mai</b>" }));
  veThiep(goc, t, { homNay: "2026-10-22", guiTraLoi: async (tl) => gui.push(tl) });
  const man = () => [...goc.querySelectorAll(".t-man")].find((x) => !x.hidden);
  assert.ok(man().classList.contains("t-man-mo"));
  assert.match(man().textContent, /<b>Mai<\/b>/, "tên phải hiện nguyên chữ");
  assert.equal(goc.querySelector(".t-man-mo b"), null);
  goc.querySelector(".t-phong-thu").click();
  await cho(950);
  assert.ok(man().classList.contains("t-man-hoi"));

  const khong = goc.querySelector(".t-nut-khong");
  const goiY = goc.querySelector(".t-man-hoi .t-goi-y");
  for (let i = 1; i <= 9; i++) {
    khong.dispatchEvent(new w.Event("pointerdown", { bubbles: true, cancelable: true }));
    khong.click(); // cú chạm sinh thêm click: không tính hai lần
    if (i === 3) assert.equal(goiY.textContent, t.cauNe[0]);
    if (i === 6) assert.equal(goiY.textContent, t.cauNe[1]);
  }
  assert.equal(goiY.textContent, t.cauNe[2]);
  await cho(350);
  assert.equal(khong.hidden, true);

  goc.querySelector(".t-nut-co").click();
  assert.ok(man().classList.contains("t-man-chon"));
  goc.querySelector(".t-man-chon .t-nut-co").click();
  assert.match(goc.querySelector(".t-loi-chon").textContent, /ngày, giờ và một lựa chọn/);
  assert.ok(goc.querySelector('[data-ngay="2026-10-21"]').disabled, "ngày đã qua phải khoá");
  goc.querySelector('[data-ngay="2026-10-24"]').click();
  goc.querySelector('[data-gio="19:00"]').click();
  goc.querySelector('.t-mon[data-ten="Lẩu"]').click();
  goc.querySelector(".t-man-chon .t-nut-co").click();
  assert.ok(man().classList.contains("t-man-ket"));
  await cho(0);
  assert.deepEqual(gui[0], { dongY: true, soLanNe: 9, ngay: "2026-10-24", gio: "19:00", chon: "Lẩu" });
  assert.deepEqual(
    [...man().querySelectorAll(".t-loi b")].map((b) => b.textContent),
    ["Thứ Bảy, 24/10", "19:00", "Lẩu"],
  );
  assert.match(man().querySelector(".t-trang-thai").textContent, /Đã báo cho Nam/);

  man().querySelector("textarea").value = "Hẹn nha";
  man().querySelector(".t-loi-nhan .t-nut").click();
  await cho(0);
  assert.equal(gui[1].loiNhan, "Hẹn nha");
  assert.equal(gui[1].chon, "Lẩu");
});

test("didate: tấm thiệp: nút Không không né thì bấm được, xem thử không gửi gì", async () => {
  const w = datDom('<!doctype html><main id="g"></main>', "https://didate.meomeo.app/abc23456");
  const { veThiep, lichIcs } = await import("../may-chu/didate/public/the.js");
  const goc = w.document.getElementById("g");
  const gui = [];
  veThiep(goc, lamSach(thiepThu({ ne: false, moDau: "khong" })), { guiTraLoi: async (x) => gui.push(x) });
  goc.querySelector(".t-nut-khong").click();
  assert.ok(!goc.querySelector(".t-man-tu-choi").hidden);
  await cho(0);
  assert.deepEqual(gui, [{ dongY: false, soLanNe: 0 }]);
  goc.querySelector(".t-man-tu-choi > .t-nut").click();
  assert.ok(!goc.querySelector(".t-man-hoi").hidden);

  const gui2 = [];
  veThiep(goc, lamSach(thiepMau("to-tinh", { gui: "A", nhan: "B" })), { xemThu: true, manDau: "ket", guiTraLoi: async (x) => gui2.push(x) });
  assert.ok(!goc.querySelector(".t-man-ket").hidden);
  assert.equal(gui2.length, 0);
  /* lịch .ics: 19:00 giờ Việt Nam là 12:00 UTC */
  const ics = lichIcs({ gui: "Nam" }, { ngay: "2026-10-24", gio: "19:00", chon: "Lẩu, nướng" });
  assert.match(ics, /DTSTART:20261024T120000Z/);
  assert.match(ics, /SUMMARY:Hẹn với Nam 💖 · Lẩu\\, nướng/);
});

test("didate: trang soạn: đổi tên thì chữ chưa sửa đổi theo, chữ đã sửa giữ nguyên chỉ thay tên", async () => {
  const w = datDom(readFileSync(path.join(PUB, "tao", "index.html"), "utf8"), "https://didate.meomeo.app/tao/?mau=sinh-nhat");
  localStorage.clear();
  await import("../may-chu/didate/public/tao.js");
  await cho(0);
  const $ = (s) => w.document.querySelector(s);
  const go = (o, gt) => {
    o.dispatchEvent(new w.Event("focus"));
    o.value = gt;
    o.dispatchEvent(new w.Event("input", { bubbles: true }));
    o.dispatchEvent(new w.Event("change", { bubbles: true }));
  };
  assert.ok($('input[name="mau"][value="sinh-nhat"]').checked);
  go($("#nhan"), "Mai");
  go($("#gui"), "Nam");
  assert.equal($('[data-truong="nhanDan"]').value, "Hôm nay là ngày của Mai 🎂");
  go($('[data-truong="ketCuoi"]'), "Yêu Mai nhất");
  go($("#nhan"), "Lan");
  assert.equal($('[data-truong="nhanDan"]').value, "Hôm nay là ngày của Lan 🎂");
  assert.equal($('[data-truong="ketCuoi"]').value, "Yêu Lan nhất");
  /* đổi xưng hô: ô chưa sửa đổi theo */
  $("#xung").value = "2";
  $("#xung").dispatchEvent(new w.Event("change", { bubbles: true }));
  assert.match($('[data-truong="cauHoi"]').value, /^Cho tớ đưa cậu/);
  /* tắt phần chọn: lời kết mẫu bỏ chỗ {chon}; lời kết đã sửa có {chon} thì cảnh báo */
  $("#chonBat").checked = false;
  $("#chonBat").dispatchEvent(new w.Event("change", { bubbles: true }));
  assert.ok(!$("#ket-loi").value.includes("{chon}"));
  go($("#ket-loi"), "Đi ăn {chon} nha");
  assert.ok(!$("#canh-ket").hidden);
  /* bản nháp được nhớ */
  assert.equal(JSON.parse(localStorage.getItem("didate-nhap")).t.nhan, "Lan");
  await cho(250);
  assert.match($("#khung-xem").textContent, /Lan/);
});

/* ---------- file tĩnh ---------- */

test("didate: trang tĩnh không có script, style viết thẳng trong HTML (CSP chặn); trang chủ đủ mẫu", () => {
  const html = [];
  const duyet = (d) => {
    for (const f of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) duyet(p);
      else if (f.name.endsWith(".html")) html.push(p);
    }
  };
  duyet(PUB);
  assert.ok(html.length >= 7);
  for (const p of html) {
    const s = readFileSync(p, "utf8");
    assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(s), `${p}: script viết thẳng trong trang`);
    assert.ok(!/\sstyle="/.test(s) && !/<style/.test(s), `${p}: style viết thẳng trong trang`);
    for (const [, href] of s.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const f = href.endsWith("/") ? path.join(PUB, href, "index.html") : path.join(PUB, href);
      assert.ok(existsSync(f) || href === "/thiep", `${p}: ${href} không có`);
    }
  }
  const chu = readFileSync(path.join(PUB, "index.html"), "utf8");
  for (const [k, m] of Object.entries(MAU)) {
    assert.ok(chu.includes(`/tao/?mau=${k}"`) && chu.includes(`/thiep?thu=${k}"`), `trang chủ thiếu mẫu ${k}`);
    assert.ok(chu.includes(`<b>${m.ten}</b><small>${m.moTa}</small>`), `trang chủ ghi khác mô tả mẫu ${k}`);
  }
  for (const [, u] of readFileSync(path.join(PUB, "sitemap.xml"), "utf8").matchAll(/<loc>https:\/\/didate\.meomeo\.app(\/[^<]*)<\/loc>/g)) {
    assert.ok(existsSync(path.join(PUB, u, "index.html")), `sitemap: ${u}`);
  }
  assert.match(readFileSync(path.join(PUB, "thiep.html"), "utf8"), /<!--META-->[\s\S]*<!--DU_LIEU-->/);
});

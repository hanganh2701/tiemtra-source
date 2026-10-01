/* Test trang giới thiệu (index.html) và việc tách game sang choi.html (bản 5.4). Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(path.join(ROOT, "index.html"), "utf8");

function moTrang(storage = {}) {
  /* chỉ chạy script trong trang (đọc bản lưu, đổi chữ nút); data/changelog.js nạp tay */
  const vc = new VirtualConsole();
  const dom = new JSDOM(html.replace(/<script src="[^"]+"><\/script>/g, ""), { url: "https://tiemtra.meomeo.app/", runScripts: "dangerously", virtualConsole: vc,
    beforeParse(w) {
      for (const [k, v] of Object.entries(storage)) w.localStorage.setItem(k, v);
      w.Image = function () { return {}; };
    } });
  return dom.window;
}

test("trang giới thiệu: mọi nút chơi dẫn tới choi.html, không nạp code game, ảnh có thật", () => {
  assert.ok(existsSync(path.join(ROOT, "choi.html")), "game ở choi.html");
  assert.doesNotMatch(html, /src="game\.js"|src="src\//, "trang giới thiệu không nạp code game");
  const w = moTrang();
  const choi = [...w.document.querySelectorAll("[data-choi]")];
  assert.ok(choi.length >= 3);
  assert.ok(choi.every((a) => a.getAttribute("href") === "choi.html"));
  const anh = [...html.matchAll(/(?:src|href)="((?:img|fonts)\/[^"#?]+|icon-\d+\.png)"/g)].map((m) => m[1]).concat([...html.matchAll(/url\((img\/[^)]+)\)/g)].map((m) => m[1]));
  assert.ok(anh.length > 8);
  for (const f of anh) assert.ok(existsSync(path.join(ROOT, f)), "thiếu " + f);
  assert.ok(existsSync(path.join(ROOT, "img/gioi-thieu/og.jpg")), "ảnh xem trước khi chia sẻ link");
  assert.equal(w.document.querySelector("footer .ky").textContent, "Created by 1conmeo", "chân trang ghi tên tác giả");
  /* ứng dụng cài mới mở thẳng vào game */
  assert.equal(JSON.parse(readFileSync(path.join(ROOT, "manifest.webmanifest"), "utf8")).start_url, "./choi.html");
});

test("trang giới thiệu: người chơi cũ thấy nút Chơi tiếp kèm ngày, người mới thấy Mở tiệm ngay", () => {
  const moi = moTrang();
  assert.equal(moi.document.getElementById("chuChoi").textContent, "Mở tiệm ngay");
  assert.ok(moi.document.getElementById("dangCho").hidden);
  const cu = moTrang({ tsShop2: JSON.stringify({ day: 61, shopName: "Trà Hẻm Nhỏ" }) });
  assert.equal(cu.document.getElementById("chuChoi").textContent, "Chơi tiếpNgày 61");
  assert.match(cu.document.getElementById("dangCho").textContent, /Trà Hẻm Nhỏ đang chờ bạn mở cửa ngày 61/);
  assert.ok(!cu.document.getElementById("dangCho").hidden);
  /* nút cài chỉ hiện khi trình duyệt cho cài */
  assert.ok(cu.document.getElementById("nutCai").hidden);
});

test("link chia sẻ cũ (#q= danh thiếp, #c= thử thách) và ứng dụng đã cài mở thẳng game", () => {
  const dau = html.match(/<script>\s*\/\* Trang giới thiệu[\s\S]*?<\/script>/)[0].replace(/<\/?script>/g, "");
  const chay = (hash, standalone) => {
    let di = null;
    const location = { hash, replace: (u) => (di = u) };
    new Function("location", "matchMedia", "navigator", dau)(location, () => ({ matches: standalone }), {});
    return di;
  };
  assert.equal(chay("#q=QN1.abc.def", false), "choi.html#q=QN1.abc.def");
  assert.equal(chay("#c=TT1.x", false), "choi.html#c=TT1.x");
  assert.equal(chay("", true), "choi.html");
  assert.equal(chay("#hem-42", false), null, "neo trong trang thì ở lại");
});

test("trang giới thiệu: ảnh mở đầu có đầu mèo đặt đúng chỗ như màn chào của game", () => {
  /* tranh nền img/splash2.jpg không có đầu mèo; game đặt img/cathead.png (83×77) ở (446, 684) trên tranh 768×1376 */
  const w = moTrang();
  assert.ok(w.document.querySelector('.tranh img.dau-meo[src="img/cathead.png"]'), "thiếu đầu mèo trên ảnh mở đầu");
  const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
  const dt = css.slice(css.indexOf("@media (min-width:860px)"));
  const khung = (s) => +s.match(/\.tranh\{[^}]*aspect-ratio:768\/(\d+)/)[1];
  const docY = (s) => +s.match(/\.tranh img\{[^}]*object-position:50% (\d+)%/)[1] / 100;
  const dau = (s) => Object.fromEntries([...s.match(/\.tranh \.dau-meo\{([^}]*)\}/)[1].matchAll(/(left|top|width):([\d.]+)%/g)].map((m) => [m[1], +m[2]]));
  const gan = (a, b, ten) => assert.ok(Math.abs(a - b) < 0.05, `${ten}: ${a}% mà phải là ${b.toFixed(2)}%`);
  const dauDt = dau(css);
  gan(dauDt.left, (446 / 768) * 100, "left");
  gan(dauDt.width, (83 / 768) * 100, "width");
  for (const [ten, cao, y, top] of [["điện thoại", khung(css), docY(css), dauDt.top], ["máy tính", khung(dt), docY(dt), dau(dt).top]])
    gan(top, ((684 - y * (1376 - cao)) / cao) * 100, "top trên " + ten);
});

test("trang giới thiệu: phần Đời sống khớp dữ liệu game (giá, số món, trả góp, lời thoại, hình vẽ)", async () => {
  const { taoHinh, napDoiSong, FILE_HINH } = await import("../tools/hinh-gioi-thieu.mjs");
  const d = napDoiSong();
  const nguon = readFileSync(path.join(ROOT, "data/doi-song.js"), "utf8");
  const w = moTrang();
  const $$ = (s) => [...w.document.querySelectorAll(s)];
  const so = (x) => String(+x.toFixed(2)).replace(".", ",");
  const tien = (v) => (v >= 1e9 ? so(v / 1e9) + " tỷ" : v >= 1e6 ? so(v / 1e6) + " triệu" : so(v / 1e3) + " nghìn");
  const mon = Object.fromEntries([d.DS_TRO, d.DS_NHA, d.DS_XM, d.DS_OT, d.DS_DT, d.DS_DO, d.DS_QUA].flat().map((x) => [x.id, x]));

  const the = $$("#doi-song [data-ds]");
  assert.ok(the.length >= 20);
  for (const li of the) {
    const x = mon[li.dataset.ds];
    assert.ok(x, "data/doi-song.js không có món " + li.dataset.ds);
    const gia = x.gia ? tien(x.gia) : x.ngay ? tien(x.ngay) + "/ngày" : "Có sẵn";
    assert.equal(li.querySelector(".gia").textContent, gia, "giá của " + x.id);
    assert.equal(li.querySelector("use").getAttribute("href"), `${FILE_HINH}#ds-${x.id}`);
  }
  /* file hình phải tạo lại khi đổi hình vẽ trong game hay đổi món trên trang */
  assert.equal(readFileSync(path.join(ROOT, FILE_HINH), "utf8"), taoHinh(html), "chạy lại: node tools/hinh-gioi-thieu.mjs");

  const dem = { nha: d.DS_NHA.length, xe: d.DS_XM.filter((x) => x.gia).length + d.DS_OT.length, mon: [d.DS_DT, d.DS_DO, d.DS_QUA].flat().filter((x) => x.gia).length };
  for (const b of $$("[data-dem]")) assert.equal(+b.textContent, dem[b.dataset.dem], "số " + b.dataset.dem);

  /* ví dụ trả góp tính đúng như game (gopNgay trong src/doi-song.js) */
  const gopNgay = new Function(readFileSync(path.join(ROOT, "src/doi-song.js"), "utf8").match(/function gopNgay[\s\S]*?\n}/)[0] + "; return gopNgay;")();
  const xe = mon.morning, v = d.DS.vay.ot, vay = Math.round((xe.gia * (1 - v.truoc)) / 1000) * 1000;
  const o = (k) => w.document.querySelector(`[data-${k}="morning"]`).textContent;
  assert.equal(o("gia"), tien(xe.gia));
  assert.equal(o("truoc"), tien(xe.gia - vay));
  assert.equal(o("gop"), tien(gopNgay(vay, v.lai, v.ngay)));

  /* lời người trong hẻm và tin nhắn của mẹ lấy nguyên từ game */
  for (const s of $$(".noi p span")) assert.ok(nguon.includes(`"${s.textContent}"`), "không có trong game: " + s.textContent);
  for (const s of $$(".tin li span")) assert.ok(nguon.includes(`"Mẹ: ${s.textContent}"`), "mẹ không nhắn câu này: " + s.textContent);
});

test("sitemap.xml và robots.txt: sitemap có trang giới thiệu và game, robots trỏ tới sitemap", () => {
  const sitemap = readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
  const robots = readFileSync(path.join(ROOT, "robots.txt"), "utf8");
  const goc = html.match(/<link rel="canonical" href="([^"]+)">/)[1];
  const loc = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(loc, [goc, goc + "choi.html"]);
  for (const u of loc) assert.ok(existsSync(path.join(ROOT, new URL(u).pathname.slice(1) || "index.html")), "sitemap trỏ tới trang không có: " + u);
  assert.match(robots, new RegExp(`^Sitemap: ${goc}sitemap\\.xml$`, "m"));
  /* không chặn file mà trang và game cần để Google dựng trang */
  for (const d of robots.matchAll(/^Disallow: (\S+)/gm)) assert.ok(!/^\/(img|fonts|src|data|snd|game\.js|choi\.html)/.test(d[1]), "đừng chặn " + d[1]);
});

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

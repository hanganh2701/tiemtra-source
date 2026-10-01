/* Hình nhà, xe, đồ dùng cho trang giới thiệu: lấy đúng hình vẽ của tab Đời sống (src/hinh-doi-song.js),
   gom thành một file SVG có nhiều <symbol>, index.html dùng lại bằng <use href="img/gioi-thieu/doi-song.svg#ds-<id>">.
   Chỉ vẽ những món index.html nhắc tới. Sửa hình trong game hay đổi món trên trang thì chạy lại:
     node tools/hinh-gioi-thieu.mjs */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const FILE_HINH = "img/gioi-thieu/doi-song.svg";

/* dữ liệu và hàm vẽ của game, chạy riêng không cần game.js */
export function napDoiSong() {
  const ctx = vm.createContext({});
  const ma = ["data/doi-song.js", "src/hinh-doi-song.js"].map((f) => readFileSync(path.join(ROOT, f), "utf8")).join("\n");
  vm.runInContext(`${ma}\n;globalThis.ds = { DS, DS_TRO, DS_NHA, DS_XM, DS_OT, DS_DT, DS_DO, DS_QUA, DS_GUI_TIN, hinhXe, hinhNha, hinhDo };`, ctx);
  return ctx.ds;
}

/* mọi món trong data kèm hàm vẽ của nó, theo id */
export function cacMon(d = napDoiSong()) {
  const m = {};
  for (const x of [...d.DS_TRO, ...d.DS_NHA]) m[x.id] = { x, ve: d.hinhNha };
  for (const x of [...d.DS_XM, ...d.DS_OT]) m[x.id] = { x, ve: d.hinhXe };
  for (const x of [...d.DS_DT, ...d.DS_DO, ...d.DS_QUA]) m[x.id] = { x, ve: d.hinhDo };
  return m;
}

export const idTrenTrang = (html) => [...new Set([...html.matchAll(/doi-song\.svg#ds-([\w]+)/g)].map((k) => k[1]))];

export function taoHinh(html = readFileSync(path.join(ROOT, "index.html"), "utf8")) {
  const mon = cacMon();
  const ky = idTrenTrang(html).map((id) => {
    if (!mon[id]) throw new Error(`index.html nhắc tới #ds-${id} mà data/doi-song.js không có món này`);
    const { x, ve } = mon[id];
    const [, hop, noi] = ve(x).match(/^<svg [^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>$/);
    return `<symbol id="ds-${id}" viewBox="${hop}">${noi}</symbol>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg">\n<!-- Tạo bởi tools/hinh-gioi-thieu.mjs từ src/hinh-doi-song.js, đừng sửa tay -->\n${ky.join("\n")}\n</svg>\n`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const svg = taoHinh();
  writeFileSync(path.join(ROOT, FILE_HINH), svg);
  console.log(`${FILE_HINH}: ${(svg.match(/<symbol/g) || []).length} hình, ${(svg.length / 1024).toFixed(1)}KB`);
}

/* Báo cho Bing (và Yandex, Naver, Seznam… cùng dùng IndexNow) danh sách trang của snaptik để họ ghé lại sớm.
   Không cần tài khoản: khoá nằm ở public/<KHOA>.txt trên chính trang, máy tìm kiếm đọc file đó để biết đúng chủ trang.
   Google không nhận IndexNow: với Google thì gửi sitemap trong Search Console (xem README).
   Chạy sau khi deploy có trang mới hay đổi chữ nhiều: node may-chu/snaptik/indexnow.mjs */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const THU_MUC = path.dirname(fileURLToPath(import.meta.url));
export const KHOA = "563b27300eb0f3f942a9cfb735d936a7";
const MIEN = "snaptik.meomeo.app";

/* mọi trang trong sitemap.xml */
export const danhSachTrang = () => [...readFileSync(path.join(THU_MUC, "public", "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const urlList = danhSachTrang();
  const r = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: MIEN, key: KHOA, keyLocation: `https://${MIEN}/${KHOA}.txt`, urlList }),
  });
  /* 200, 202: đã nhận; 403: không đọc được file khoá; 422: link không thuộc tên miền; 429: gửi quá nhiều */
  console.log(`IndexNow: ${r.status} ${r.statusText}, ${urlList.length} trang`);
  process.exit(r.status === 200 || r.status === 202 ? 0 : 1);
}

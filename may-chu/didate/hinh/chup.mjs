/* Chụp og.png, icon-192.png, icon-512.png của didate bằng Chromium không giao diện (Playwright hoặc Chrome có sẵn trên máy).
   Chạy: node may-chu/didate/hinh/chup.mjs   (đường dẫn Chromium khác thì đặt CHROMIUM=/đường/dẫn) */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DAY = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(DAY, "..", "public");

function timChromium() {
  if (process.env.CHROMIUM) return process.env.CHROMIUM;
  /* ưu tiên chrome-headless-shell của Playwright: Chromium đầy đủ bản mới hay treo khi chụp bằng --screenshot */
  const pw = path.join(homedir(), "Library", "Caches", "ms-playwright");
  const ds = existsSync(pw) ? readdirSync(pw).filter((d) => /^chromium_headless_shell-\d+$/.test(d)).sort().reverse() : [];
  for (const d of ds) {
    const p = path.join(pw, d, "chrome-mac", "headless_shell");
    if (existsSync(p)) return p;
  }
  for (const p of ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/chromium", "/usr/bin/google-chrome"]) if (existsSync(p)) return p;
  throw new Error("Không tìm thấy Chromium, đặt CHROMIUM=/đường/dẫn");
}

const chrome = timChromium();
const chup = (trang, ra, rong, cao) => {
  execFileSync(chrome, ["--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--allow-file-access-from-files", "--virtual-time-budget=2000", `--window-size=${rong},${cao}`, `--screenshot=${ra}`, pathToFileURL(path.join(DAY, trang)).href], { stdio: "ignore", timeout: 30000 });
  console.log(ra);
};
chup("og.html", path.join(PUB, "og.png"), 1200, 630);
chup("icon.html", path.join(PUB, "icon-192.png"), 192, 192);
chup("icon.html", path.join(PUB, "icon-512.png"), 512, 512);

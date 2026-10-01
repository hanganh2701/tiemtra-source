/* Chạy game trong trình duyệt giả lập (jsdom) để test bằng Node, không cần mở trình duyệt thật. */
import { JSDOM, VirtualConsole } from "jsdom";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Mở game như lần đầu vào trang.
 * storage: dữ liệu localStorage có sẵn, ví dụ { tsShop2: "...", tsOwner: "..." }.
 * Trả về run(code): chạy code trong trang và trả kết quả (đọc được biến toàn cục của game như S, R, CFG).
 */
export function boot({ storage = {}, url = "http://localhost/" } = {}) {
  let html = readFileSync(path.join(ROOT, "choi.html"), "utf8");
  const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  html = html.replace(/<script[\s\S]*?<\/script>/g, "");

  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => {
    /* jsdom chưa hỗ trợ tải ảnh, âm thanh: bỏ qua, chỉ giữ lỗi của code game */
    if (!/Not implemented|Could not load/.test(String(e && e.message))) errors.push(e);
  });

  const dom = new JSDOM(html, {
    url,
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
  });
  const w = dom.window;

  /* những API trình duyệt jsdom không có */
  w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
  w.fetch = () => Promise.reject(new Error("không có mạng khi test"));
  w.scrollTo = () => {};
  w.TextEncoder = TextEncoder;
  w.TextDecoder = TextDecoder;
  w.HTMLCanvasElement.prototype.getContext = () => ({
    font: "",
    measureText: (s) => ({ width: String(s).length * 7 }),
    fillText() {}, drawImage() {}, fillRect() {}, clearRect() {}, beginPath() {}, arc() {}, fill() {}, stroke() {},
  });
  w.Element.prototype.animate = function () {
    return { finished: Promise.resolve(), cancel() {}, finish() {}, addEventListener() {}, set onfinish(f) { if (f) setTimeout(f, 0); } };
  };

  for (const [k, v] of Object.entries(storage)) w.localStorage.setItem(k, v);

  for (const src of srcs) {
    const el = w.document.createElement("script");
    el.textContent = readFileSync(path.join(ROOT, src), "utf8");
    w.document.body.appendChild(el);
  }

  /* hàm phụ cho test: pha đúng mọi ly của khách ở chỗ i rồi giao, như nhân viên pha chế trong game */
  w.eval(`function __serveSlot(i) {
    const c = R.slots[i];
    for (let n = 0; c && R.slots[i] === c && R.running && n < 12; n++) {
      const o = c.cups[c.done.indexOf(false)];
      needs(o).forEach((k) => { if (!qty(k)) addStock(k, 5); });
      cup = newCup(); cup.size = o.size; useCup();
      [o.base, ...(o.flav ? [o.flav] : []), ...o.tops].forEach((k) => { if (qty(k)) consume(k); });
      Object.assign(cup, { base: o.base, flav: o.flav || null, tops: [...o.tops], cheese: !!o.cheese,
        sugar: o.sugar, ice: o.ice, fill: 0.8, used: true });
      serve(i);
    }
  }
  /* bấm nút chính của các hộp thoại đang mở cho tới khi đóng hết (tối đa n lần) */
  function __closeDialogs(n = 8) {
    for (let k = 0; k < n && !$("modal").hidden; k++) {
      const b = $("card").querySelector("#trOk, #trNext, .big[data-ask], [data-ask], #go, .big");
      if (!b) break;
      b.click();
    }
  }
  function __openDay() {
    ["tra", "matcha", "tcden", "thach", "cup"].forEach((k) => addStock(k, 30));
    startDay();
    clearInterval(timer);
  }
  function __fillSlot() {
    let i = R.slots.findIndex((s) => !s);
    if (i < 0) { R.slots[0] = null; i = 0; }
    for (let n = 0; n < 200 && !R.slots[i]; n++) spawn();
    return i;
  }`);

  const run = (code) => w.eval(code);
  const close = () => { try { w.eval("clearInterval(timer)"); } catch (e) {} w.close(); };
  return { dom, w, run, errors, close };
}

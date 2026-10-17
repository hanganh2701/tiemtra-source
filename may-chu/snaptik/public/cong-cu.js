/* Hàm thuần dùng chung cho trang snaptik (không đụng tới trang, test được bằng node: tests/snaptik.test.mjs) */

/* 35200 → "35,2K", 1596000 → "1,6M" */
export function soGon(n) {
  if (n == null || !Number.isFinite(+n)) return "";
  n = +n;
  const gon = (x, d) => (Math.round(x * 10) / 10).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + d;
  if (n >= 1e9) return gon(n / 1e9, "B");
  if (n >= 1e6) return gon(n / 1e6, "M");
  if (n >= 1e3) return gon(n / 1e3, "K");
  return String(n);
}

/* số byte → "2,8 MB" */
export function coFile(b) {
  if (!(b > 0)) return "";
  if (b >= 1048576) return (Math.round((b / 1048576) * 10) / 10).toLocaleString("vi-VN") + " MB";
  return Math.max(1, Math.round(b / 1024)) + " KB";
}

/* giây → "1:05" */
export function thoiGian(s) {
  if (!(s > 0)) return "";
  s = Math.round(s);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

/* giây unix → "28/07/2019" */
export function ngayDang(t) {
  if (!(t > 0)) return "";
  const d = new Date(t * 1000);
  return [d.getDate(), d.getMonth() + 1].map((x) => String(x).padStart(2, "0")).join("/") + "/" + d.getFullYear();
}

export const linkTai = (id, loai, i = 0, xem = false) => `/api/tai?id=${encodeURIComponent(id)}&loai=${loai}` + (loai === "anh" ? `&i=${i}` : "") + (xem ? "&xem=1" : "");

/* chữ chia sẻ từ app ("Xem video này… https://vt.tiktok.com/abc/ #fyp") → link TikTok đầu tiên, hoặc chuỗi rỗng */
export function timLinkTrongChu(chu) {
  const s = String(chu || "").trim();
  if (/^\d{15,22}$/.test(s)) return s;
  const m = s.match(/(?:https?:\/\/)?(?:[\w-]+\.)*tiktok\.com\/[^\s"'<>]*/i);
  return m ? m[0].replace(/[),.!?]+$/, "") : "";
}

/* CRC-32 (dùng cho file ZIP) */
const BANG_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
export function crc32(du) {
  let c = 0xffffffff;
  for (let i = 0; i < du.length; i++) c = BANG_CRC[(c ^ du[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/* gói nhiều file thành một file ZIP không nén (ảnh JPEG/WebP đã nén sẵn, nén thêm không nhỏ đi).
   tep: [{ ten, du: Uint8Array }] → Blob application/zip */
export function taoZip(tep) {
  const enc = new TextEncoder();
  const phan = [],
    muc = [];
  let viTri = 0;
  for (const t of tep) {
    const ten = enc.encode(t.ten),
      n = t.du.length,
      crc = crc32(t.du);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x0800, true); /* tên file UTF-8 */
    h.setUint16(12, 0x21, true); /* ngày 01/01/1980 */
    h.setUint32(14, crc, true);
    h.setUint32(18, n, true);
    h.setUint32(22, n, true);
    h.setUint16(26, ten.length, true);
    phan.push(h, ten, t.du);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, n, true);
    c.setUint32(24, n, true);
    c.setUint16(28, ten.length, true);
    c.setUint32(42, viTri, true);
    muc.push(c, ten);
    viTri += 30 + ten.length + n;
  }
  const coMuc = muc.reduce((s, x) => s + x.byteLength, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, tep.length, true);
  e.setUint16(10, tep.length, true);
  e.setUint32(12, coMuc, true);
  e.setUint32(16, viTri, true);
  return new Blob([...phan, ...muc, e], { type: "application/zip" });
}

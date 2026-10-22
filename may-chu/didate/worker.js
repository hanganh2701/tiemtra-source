/* didate: thiệp mời ở didate.meomeo.app. Cloudflare tự phát trang tĩnh trong public/, worker lo phần còn lại:
     GET  /<id>                        trang thiệp (public/thiep.html kèm dữ liệu thiệp, thẻ xem trước khi chia sẻ link)
     GET  /anh/<id>?v=<n>              ảnh của thiệp, lấy từ kho ảnh (kho-anh.js), giữ 6 giờ ở bộ đệm Cloudflare
     POST /api/thiep                   tạo thiệp (form: du_lieu = JSON, anh = file) → { id, khoa, hetHan }
     GET  /api/thiep/<id>              người tạo xem thiệp và câu trả lời (header X-Khoa)
     POST /api/thiep/<id>/sua          sửa (X-Khoa; form như lúc tạo, bo_anh = 1 để bỏ ảnh)
     POST /api/thiep/<id>/xoa          xoá (X-Khoa)
     POST /api/thiep/<id>/mo           người nhận mở thiệp (đếm lượt mở)
     POST /api/thiep/<id>/tra-loi      người nhận trả lời (JSON, kiểm bằng lamSachTraLoi)
     POST /api/thiep/<id>/bao-cao      báo thiệp xấu (nhắn cho chủ dự án qua bot Telegram)
   Thiệp quá hạn 90 ngày bị xoá mỗi khi có thiệp mới (donKhiTao); hàm scheduled để dành nếu sau này bật cron.
   Không lưu IP; giới hạn tốc độ theo IP do Cloudflare đếm. */
import { lamSach, lamSachTraLoi, LoiDuLieu, HAN_NGAY, ANH_TOI_DA, chu } from "./public/chung.js";
import { luuAnh, docAnh, xoaAnh, xoaAnhHetHan, nhanChuDuAn } from "./kho-anh.js";

const NGAY = 86400000;
const MA = /^[a-z2-9]{8}$/;
const CHU_MA = "abcdefghijkmnpqrstuvwxyz23456789"; // 32 chữ, bỏ l o 0 1 cho khỏi đọc nhầm
const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

const json = (x, status = 200) => new Response(JSON.stringify(x), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
const loi = (chuLoi, status) => json({ loi: chuLoi }, status);

function ngauNhien(n) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
}
const taoMa = () => Array.from(ngauNhien(8), (x) => CHU_MA[x & 31]).join("");
/* khoá quản lý: 18 byte ngẫu nhiên (144 bit), dạng base64url 24 ký tự */
const taoKhoa = () => btoa(String.fromCharCode(...ngauNhien(18))).replace(/\+/g, "-").replace(/\//g, "_");
async function sha256(s) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(h), (x) => x.toString(16).padStart(2, "0")).join("");
}

/* nhận ra ảnh bằng mấy byte đầu, không tin kiểu file trình duyệt gửi */
function kieuAnh(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

/* JSON nằm trong thẻ <script> của trang: không để chuỗi nào đóng được thẻ */
const jsonTrongTrang = (x) => JSON.stringify(x).replace(/</g, "\\u003c");
const thuocTinh = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const dauTrang = (them = {}) => ({
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store, no-transform", // no-transform: Cloudflare không chèn script Web Analytics vào trang
  "Content-Security-Policy": CSP,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  ...them,
});

/* trang tĩnh trong public/ (theo cả chuyển hướng /x.html → /x của Cloudflare) */
async function trangTinh(env, url, duongDan) {
  let u = new URL(duongDan, url);
  for (let i = 0; i < 3; i++) {
    const r = await env.ASSETS.fetch(new Request(u));
    const di = r.status >= 300 && r.status < 400 && r.headers.get("Location");
    if (!di) return r;
    u = new URL(di, u);
  }
  throw new Error(`Không lấy được ${duongDan}`);
}

async function trang404(env, url) {
  const r = await trangTinh(env, url, "/404.html");
  return new Response(r.body, { status: 404, headers: dauTrang({ "X-Robots-Tag": "noindex" }) });
}

/* ---------- trang thiệp ---------- */

async function trangThiep(env, url, id) {
  const row = await env.DB.prepare("SELECT du_lieu, anh, anh_ver, het_han, an FROM thiep WHERE id = ?").bind(id).first();
  let status = 200;
  let du;
  if (!row || row.an) {
    status = 404;
    du = { khongCo: true };
  } else if (row.het_han <= Date.now()) {
    status = 410;
    du = { hetHan: true };
  } else {
    du = { id, thiep: JSON.parse(row.du_lieu), anh: row.anh ? `/anh/${id}?v=${row.anh_ver}` : null };
  }
  const t = du.thiep;
  /* thẻ xem trước khi dán link vào Messenger, Zalo…: không lộ ảnh và câu hỏi, chỉ tên người nhận và tiêu đề */
  const tieuDe = t ? t.nhanDan || `Gửi ${t.nhan} 💌` : "didate 💌";
  const moTa = t ? t.tieuDe || "Có người gửi bạn một tấm thiệp 💌" : "Thiệp mời dễ thương, gửi bằng một đường link";
  const meta = [
    `<title>${thuocTinh(tieuDe)}</title>`,
    `<meta property="og:title" content="${thuocTinh(tieuDe)}" />`,
    `<meta property="og:description" content="${thuocTinh(moTa)}" />`,
    `<meta property="og:image" content="${url.origin}/og.png" />`,
    `<meta property="og:type" content="website" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join("\n    ");
  const goc = await (await trangTinh(env, url, "/thiep.html")).text();
  const html = goc.replace("<!--META-->", meta).replace("<!--DU_LIEU-->", `<script id="du-lieu" type="application/json">${jsonTrongTrang(du)}</script>`);
  return new Response(html, { status, headers: dauTrang({ "X-Robots-Tag": "noindex, nofollow" }) });
}

/* ---------- ảnh ---------- */

async function layAnh(req, env, ctx, url, id) {
  const boDem = typeof caches !== "undefined" ? caches.default : null;
  const khoaDem = new Request(url.toString());
  const daCo = boDem && (await boDem.match(khoaDem));
  if (daCo) return daCo;
  const row = await env.DB.prepare("SELECT anh, het_han, an FROM thiep WHERE id = ?").bind(id).first();
  if (!row?.anh || row.an || row.het_han <= Date.now()) return new Response("Không có ảnh", { status: 404 });
  const a = JSON.parse(row.anh);
  const noiDung = await docAnh(env, a);
  if (!noiDung) return new Response("Không có ảnh", { status: 404 });
  const dau = {
    "Content-Type": a.kieu || "image/jpeg",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex",
    "Cross-Origin-Resource-Policy": "same-origin", // trang khác không nhúng ảnh được, khỏi bị mượn làm chỗ để ảnh
  };
  if (!boDem) return new Response(noiDung, { headers: { ...dau, "Cache-Control": "private, max-age=86400" } });
  const banDem = new Response(noiDung, { headers: { ...dau, "Cache-Control": "public, max-age=21600" } });
  ctx.waitUntil(boDem.put(khoaDem, banDem.clone()));
  return new Response(banDem.body, { headers: { ...dau, "Cache-Control": "private, max-age=86400" } });
}

/* ---------- API ---------- */

async function quaNhanh(env, ten, req) {
  if (!env[ten]) return false;
  const { success } = await env[ten].limit({ key: req.headers.get("CF-Connecting-IP") || "?" });
  return !success;
}

/* form tạo/sửa thiệp: du_lieu (JSON), anh (file, không bắt buộc), bo_anh */
async function docForm(req) {
  if (Number(req.headers.get("Content-Length") || 0) > ANH_TOI_DA + 64 * 1024) throw new LoiDuLieu("Ảnh lớn quá, tối đa 2 MB");
  let f;
  try {
    f = await req.formData();
  } catch {
    throw new LoiDuLieu("Dữ liệu gửi lên không đúng");
  }
  const tho = f.get("du_lieu");
  if (typeof tho !== "string" || tho.length > 30000) throw new LoiDuLieu("Dữ liệu thiệp không đúng");
  let d;
  try {
    d = JSON.parse(tho);
  } catch {
    throw new LoiDuLieu("Dữ liệu thiệp không đúng");
  }
  const thiep = lamSach(d);
  const tep = f.get("anh");
  let anh = null;
  if (tep && typeof tep === "object" && tep.size > 0) {
    if (tep.size > ANH_TOI_DA) throw new LoiDuLieu("Ảnh lớn quá, tối đa 2 MB");
    const bytes = new Uint8Array(await tep.arrayBuffer());
    const kieu = kieuAnh(bytes);
    if (!kieu) throw new LoiDuLieu("Chỉ nhận ảnh JPG, PNG hoặc WebP");
    anh = { bytes, kieu };
  }
  return { thiep, anh, boAnh: f.get("bo_anh") === "1" };
}

async function docJson(req, toiDa = 4096) {
  const s = await req.text();
  if (s.length > toiDa) throw new LoiDuLieu("Dữ liệu gửi lên dài quá");
  try {
    return JSON.parse(s);
  } catch {
    throw new LoiDuLieu("Dữ liệu gửi lên không đúng");
  }
}

/* dòng thiệp khi khoá quản lý đúng, sai thì null */
async function voiKhoa(req, env, id) {
  const khoa = req.headers.get("X-Khoa") || "";
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(khoa)) return null;
  const row = await env.DB.prepare("SELECT * FROM thiep WHERE id = ?").bind(id).first();
  return row && row.khoa === (await sha256(khoa)) ? row : null;
}

const linkAnh = (id, row) => (row.anh ? `/anh/${id}?v=${row.anh_ver}` : null);

async function taoThiep(req, env, ctx) {
  if (await quaNhanh(env, "GIOI_HAN_TAO", req)) return loi("Bạn tạo nhanh quá, chờ một phút rồi thử lại nha", 429);
  const { thiep, anh } = await docForm(req);
  const khoa = taoKhoa();
  const bam = await sha256(khoa);
  const luc = Date.now();
  const hetHan = luc + HAN_NGAY * NGAY;
  let id;
  for (let lan = 0; ; lan++) {
    id = taoMa();
    try {
      await env.DB.prepare("INSERT INTO thiep (id, khoa, mau, du_lieu, tao_luc, sua_luc, het_han) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(id, bam, thiep.mau, JSON.stringify(thiep), luc, luc, hetHan)
        .run();
      break;
    } catch (e) {
      if (lan >= 2 || !/UNIQUE|constraint/i.test(String(e?.message))) throw e;
    }
  }
  if (anh) {
    try {
      const a = await luuAnh(env, id, anh);
      await env.DB.prepare("UPDATE thiep SET anh = ?, anh_ver = 1 WHERE id = ?").bind(JSON.stringify(a), id).run();
    } catch (e) {
      console.error("lưu ảnh:", e?.message);
      await env.DB.prepare("DELETE FROM thiep WHERE id = ?").bind(id).run();
      return loi("Chưa lưu được ảnh, thử lại sau một chút nha", 503);
    }
  }
  ctx.waitUntil(donKhiTao(env));
  return json({ id, khoa, hetHan }, 201);
}

/* người tạo xoá thiệp hay đổi ảnh: xoá ảnh cũ. Ảnh Telegram quá 48 giờ bot không xoá được, nên nhắn chủ dự án
   (trả lời thẳng vào tin có ảnh) để xoá tay */
async function boAnhCu(env, id, a) {
  if (await xoaAnh(env, a)) return;
  if (a.kho === "telegram") await nhanChuDuAn(env, `🗑️ Người tạo vừa xoá hoặc đổi ảnh của thiệp ${id}. Bot không xoá được ảnh này vì đã quá 48 giờ, xoá tay giúp nha.`, a.tin);
}

async function xemThiep(req, env, id) {
  const row = await voiKhoa(req, env, id);
  if (!row) return loi("Link quản lý không đúng, hoặc thiệp đã bị xoá", 404);
  if (row.het_han <= Date.now()) return loi("Thiệp đã hết hạn", 410);
  return json({
    id,
    thiep: JSON.parse(row.du_lieu),
    anh: linkAnh(id, row),
    taoLuc: row.tao_luc,
    suaLuc: row.sua_luc,
    hetHan: row.het_han,
    an: !!row.an,
    mo: { dau: row.mo_dau, cuoi: row.mo_cuoi, soLan: row.so_lan_mo },
    traLoi: row.tra_loi ? JSON.parse(row.tra_loi) : null,
    traLoiLuc: row.tra_loi_luc,
  });
}

async function suaThiep(req, env, ctx, id) {
  const row = await voiKhoa(req, env, id);
  if (!row) return loi("Link quản lý không đúng, hoặc thiệp đã bị xoá", 404);
  if (row.het_han <= Date.now()) return loi("Thiệp đã hết hạn", 410);
  const { thiep, anh, boAnh } = await docForm(req);
  let anhMoi = row.anh;
  let ver = row.anh_ver;
  if (anh) {
    try {
      anhMoi = JSON.stringify(await luuAnh(env, id, anh));
      ver++;
    } catch (e) {
      console.error("lưu ảnh:", e?.message);
      return loi("Chưa lưu được ảnh, thử lại sau một chút nha", 503);
    }
  } else if (boAnh) anhMoi = null;
  await env.DB.prepare("UPDATE thiep SET mau = ?, du_lieu = ?, anh = ?, anh_ver = ?, sua_luc = ? WHERE id = ?")
    .bind(thiep.mau, JSON.stringify(thiep), anhMoi, ver, Date.now(), id)
    .run();
  if (row.anh && anhMoi !== row.anh) ctx.waitUntil(boAnhCu(env, id, JSON.parse(row.anh)));
  return json({ ok: true, anh: anhMoi ? `/anh/${id}?v=${ver}` : null });
}

async function xoaThiep(req, env, ctx, id) {
  const row = await voiKhoa(req, env, id);
  if (!row) return loi("Link quản lý không đúng, hoặc thiệp đã bị xoá", 404);
  await env.DB.prepare("DELETE FROM thiep WHERE id = ?").bind(id).run();
  if (row.anh) ctx.waitUntil(boAnhCu(env, id, JSON.parse(row.anh)));
  return json({ ok: true });
}

/* dòng thiệp người nhận đang xem được (chưa gỡ, chưa hết hạn) */
async function thiepDangMo(env, id) {
  const row = await env.DB.prepare("SELECT du_lieu, het_han, an FROM thiep WHERE id = ?").bind(id).first();
  return row && !row.an && row.het_han > Date.now() ? row : null;
}

async function moThiep(req, env, id) {
  if (await quaNhanh(env, "GIOI_HAN_GHI", req)) return loi("Chậm lại một xíu nha", 429);
  const luc = Date.now();
  await env.DB.prepare("UPDATE thiep SET so_lan_mo = so_lan_mo + 1, mo_dau = COALESCE(mo_dau, ?), mo_cuoi = ? WHERE id = ? AND an = 0 AND het_han > ?")
    .bind(luc, luc, id, luc)
    .run();
  return new Response(null, { status: 204 });
}

async function traLoi(req, env, id) {
  if (await quaNhanh(env, "GIOI_HAN_GHI", req)) return loi("Chậm lại một xíu nha", 429);
  const d = await docJson(req);
  const row = await thiepDangMo(env, id);
  if (!row) return loi("Thiệp này không còn nữa", 404);
  const r = lamSachTraLoi(d, JSON.parse(row.du_lieu));
  await env.DB.prepare("UPDATE thiep SET tra_loi = ?, tra_loi_luc = ? WHERE id = ?").bind(JSON.stringify(r), Date.now(), id).run();
  return json({ ok: true });
}

async function baoCao(req, env, ctx, url, id) {
  if (await quaNhanh(env, "GIOI_HAN_GHI", req)) return loi("Chậm lại một xíu nha", 429);
  const d = await docJson(req);
  const lyDo = chu(d?.lyDo, 300, true) || "(không ghi lý do)";
  const r = await env.DB.prepare("UPDATE thiep SET bao_cao = bao_cao + 1, bao_cao_ly_do = ? WHERE id = ?").bind(lyDo, id).run();
  if (!r.meta?.changes) return loi("Thiệp này không còn nữa", 404);
  ctx.waitUntil(
    nhanChuDuAn(
      env,
      `⚠️ Có người báo thiệp ${url.origin}/${id}\nLý do: ${lyDo}\n\nGỡ thiệp: npx wrangler d1 execute didate --remote --command "UPDATE thiep SET an = 1 WHERE id = '${id}'"`,
    ),
  );
  return json({ ok: true });
}

async function api(req, env, ctx, url) {
  /* chỉ trang của didate gọi được (trình duyệt luôn gửi Origin với POST) */
  const nguon = req.headers.get("Origin");
  if (req.method === "POST" && nguon && nguon !== url.origin) return loi("Không cho phép", 403);
  const [, , loai, id, viec] = url.pathname.split("/");
  if (loai !== "thiep") return loi("Không có", 404);
  if (!id && req.method === "POST") return taoThiep(req, env, ctx);
  if (!MA.test(id || "")) return loi("Không có", 404);
  if (!viec && req.method === "GET") return xemThiep(req, env, id);
  if (req.method !== "POST") return loi("Không có", 404);
  if (viec === "sua") return suaThiep(req, env, ctx, id);
  if (viec === "xoa") return xoaThiep(req, env, ctx, id);
  if (viec === "mo") return moThiep(req, env, id);
  if (viec === "tra-loi") return traLoi(req, env, id);
  if (viec === "bao-cao") return baoCao(req, env, ctx, url, id);
  return loi("Không có", 404);
}

/* có thiệp mới thì dọn luôn thiệp quá hạn: một lần đọc theo chỉ mục het_han, chỉ xoá khi có */
async function donKhiTao(env) {
  try {
    if (await env.DB.prepare("SELECT 1 FROM thiep WHERE het_han <= ? LIMIT 1").bind(Date.now()).first()) await donDep(env, 1);
  } catch (e) {
    console.error("dọn thiệp:", e?.message);
  }
}

/* xoá thiệp quá hạn và ảnh trong D1 của chúng, mỗi vòng 200 thiệp */
async function donDep(env, soVong = 20) {
  const luc = Date.now();
  for (let vong = 0; vong < soVong; vong++) {
    const { results } = await env.DB.prepare("SELECT id, anh FROM thiep WHERE het_han <= ? LIMIT 200").bind(luc).all();
    if (!results.length) return;
    await xoaAnhHetHan(env, results.filter((r) => r.anh).map((r) => JSON.parse(r.anh)));
    const ids = results.map((r) => r.id);
    await env.DB.prepare(`DELETE FROM thiep WHERE id IN (${ids.map(() => "?").join(",")})`).bind(...ids).run();
  }
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const laApi = url.pathname.startsWith("/api/");
    try {
      if (laApi) return await api(req, env, ctx, url);
      const doc = req.method === "GET" || req.method === "HEAD";
      const thiep = url.pathname.match(/^\/([a-z2-9]{8})\/?$/);
      if (thiep && doc) return await trangThiep(env, url, thiep[1]);
      const anh = url.pathname.match(/^\/anh\/([a-z2-9]{8})$/);
      if (anh && doc) return await layAnh(req, env, ctx, url, anh[1]);
      return await trang404(env, url);
    } catch (e) {
      if (e instanceof LoiDuLieu) return loi(e.message, 400);
      console.error(e?.stack || e);
      return laApi ? loi("Máy chủ đang trục trặc, thử lại sau một chút nha", 500) : new Response("Máy chủ đang trục trặc, thử lại sau một chút nha", { status: 500 });
    }
  },
  async scheduled(_ev, env, ctx) {
    ctx.waitUntil(donDep(env));
  },
};

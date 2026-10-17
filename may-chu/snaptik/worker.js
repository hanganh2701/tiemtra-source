/* snaptik: trang tải video TikTok không logo ở snaptik.meomeo.app (Cloudflare Worker + trang tĩnh trong public/).
   Máy chủ chỉ đọc trang công khai của TikTok rồi chuyển tiếp file từ máy chủ TikTok về trình duyệt.
   Không lưu video, không lưu link người dùng dán, không ghi IP.
     GET /api/thong-tin?url=…                         thông tin bài đăng (video hoặc bài ảnh) và các bản tải được
     GET /api/tai?id=…&loai=video|hd|mp3|anh|bia|avt&i=…  tải file (avt: ảnh đại diện người đăng); thêm xem=1 để phát hoặc xem ngay trên trang
   /api/tai chỉ nhận id bài đăng, không nhận link tuỳ ý, nên không ai mượn được máy chủ để tải thứ khác. */

import { LOI } from "./loi-dich.js";

/* chỉ export hàm: Cloudflare coi mỗi export của file này là một điểm vào, export chuỗi hay mảng thì Worker không chạy */
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const GIU_GIAY = 600; /* giữ thông tin một bài 10 phút ở bộ đệm Cloudflare: bấm tải không phải đọc lại trang TikTok */
const LOAI = ["video", "hd", "mp3", "anh", "bia", "avt"];
/* lỗi trả về là mã (khoá trong dich/<tiếng>.js › loi); câu báo theo tiếng do noiLoi dựng lúc trả cho trình duyệt */
const LOI_TRANG = "khongDocDuoc";
const LOI_CHAN = "biChan";

/* kiểu file nhận từ máy chủ TikTok cho từng loại; khác kiểu (trang lỗi HTML, SVG…) thì bỏ, không gửi về trình duyệt */
const KIEU_DUNG = {
  video: /^(video\/|application\/octet-stream)/i,
  hd: /^(video\/|application\/octet-stream)/i,
  mp3: /^(audio\/|video\/mp4|application\/octet-stream)/i,
  anh: /^image\/(jpeg|jpg|webp|png|heic|heif|avif)/i,
  bia: /^image\/(jpeg|jpg|webp|png|heic|heif|avif)/i,
  avt: /^image\/(jpeg|jpg|webp|png|heic|heif|avif)/i,
};
const KIEU_MAC_DINH = { video: "video/mp4", hd: "video/mp4", mp3: "audio/mpeg", anh: "image/jpeg", bia: "image/jpeg", avt: "image/jpeg" };
const DUOI = {
  "video/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/png": "png",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/avif": "avif",
};
const DUOI_MAC_DINH = { video: "mp4", hd: "mp4", mp3: "mp3", anh: "jpg", bia: "jpg", avt: "jpg" };

export const laTikTok = (host) => /(^|\.)tiktok\.com$/i.test(host || "");
const laH265 = (codec) => /265|hevc|hvc1|bytevc1/i.test(codec || "");

/* đọc chữ người dùng dán (chữ chia sẻ từ app thường kèm câu chữ quanh link).
   Trả { id, kieu } khi thấy id bài, { ngan } khi là link rút gọn cần mở, { loi } khi không dùng được */
export function docLink(chu) {
  const s = String(chu || "").trim();
  if (/^\d{15,22}$/.test(s)) return { id: s, kieu: "video" };
  if (/douyin\.com/i.test(s) && !/tiktok\.com/i.test(s)) return { loi: "douyin" };
  for (const m of s.matchAll(/(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}\/[^\s"'<>]*/gi)) {
    let u;
    try {
      const tho = m[0].replace(/[),.!?]+$/, "");
      u = new URL(/^https?:\/\//i.test(tho) ? tho : "https://" + tho);
    } catch {
      continue;
    }
    if (!laTikTok(u.hostname)) continue;
    const p = u.pathname.match(/\/(video|photo|v|embed(?:\/v2)?)\/(\d{15,22})(?:\D|$)/);
    if (p) return { id: p[2], kieu: p[1] === "photo" ? "photo" : "video" };
    for (const k of ["item_id", "share_item_id", "aweme_id"]) {
      const q = u.searchParams.get(k) || "";
      if (/^\d{15,22}$/.test(q)) return { id: q, kieu: "video" };
    }
    if (/^(vm|vt)\.tiktok\.com$/i.test(u.hostname) || /^\/t\/[\w-]+/.test(u.pathname)) return { ngan: `https://${u.hostname.toLowerCase()}${u.pathname}` };
    if (/^\/@[\w.-]+\/?$/.test(u.pathname)) return { loi: "trangCaNhan" };
    if (/\/live\/?$/.test(u.pathname)) return { loi: "live" };
    return { loi: "khongPhaiBai" };
  }
  return { loi: "khongCoLink" };
}

/* lấy dữ liệu bài đăng từ HTML trang TikTok; trả { bai } hoặc { loi, ma } */
export function docTrang(html) {
  const m = String(html).match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
  if (m) {
    let j;
    try {
      j = JSON.parse(m[1]);
    } catch {
      return { loi: LOI_TRANG };
    }
    const d = j?.__DEFAULT_SCOPE__?.["webapp.video-detail"];
    if (d?.itemInfo?.itemStruct?.id) return { bai: d.itemInfo.itemStruct };
    if (d && d.statusCode) return { loi: "khongXemDuoc", ma: d.statusCode };
  }
  const s = String(html).match(/<script[^>]+id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/);
  if (s) {
    try {
      const it = Object.values(JSON.parse(s[1]).ItemModule || {})[0];
      if (it?.id) return { bai: it };
    } catch {
      /* rơi xuống lỗi chung */
    }
  }
  /* trang "Please wait…" TikTok đưa khi nghi máy tự động (thử thật 17/10/2026: SlardarWAF, thẻ _wafchallengeid) */
  if (/_wafchallengeid|"slardarClient"\s*:\s*"SlardarWAF"/.test(html)) return { loi: LOI_CHAN, chan: true };
  return { loi: LOI_TRANG };
}

/* cookie TikTok đặt cho người xem (tt_chain_token…): máy chủ video đòi cookie này như khi trình duyệt xem trên tiktok.com */
export function layCookie(headers) {
  const ds = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  return ds
    .map((c) => c.split(";")[0].trim())
    .filter((c) => /^[\w.-]+=/.test(c))
    .join("; ");
}

const chuoi = (x) => (typeof x === "string" ? x : "");
const so = (x) => (x == null || x === "" || !Number.isFinite(Number(x)) ? null : Number(x));
/* ảnh JPEG trước (mở được ở mọi máy), WebP/HEIC sau */
const sapAnh = (ds) => [...ds].sort((a, b) => /jpe?g/i.test(b) - /jpe?g/i.test(a));

/* định dạng nhạc ghi trên nút tải (MP3, M4A…), tính như lúc tải (kieuGui): theo kiểu file máy chủ TikTok trả nếu đã hỏi,
   không thì theo tham số mime_type của link (nhạc gốc: audio_mpeg); không rõ thì MP3 */
export function dinhDangNhac(link, kieu = "") {
  const k = kieuGui("mp3", kieu || "video/mp4", link).split(";")[0].trim().toLowerCase();
  return (DUOI[k] || "mp3").toUpperCase();
}

/* nhạc trong kho nhạc TikTok (sf16-ies-music…/obj/…) không có đuôi hay mime_type, có bài là M4A (thử thật 17/10/2026, bài @patrox):
   hỏi máy chủ TikTok 1 byte để biết kiểu thật. Hỏi không được thì giữ MP3 */
async function hoiDinhDangNhac(kq) {
  const link = kq.ng.mp3[0];
  if (!link || /[?&]mime_type=/.test(link)) return;
  try {
    const hdr = { "User-Agent": UA, Referer: "https://www.tiktok.com/", Accept: "*/*", Range: "bytes=0-0" };
    if (kq.cookie) hdr.Cookie = kq.cookie;
    const r = await fetch(link, { headers: hdr, signal: AbortSignal.timeout(2500) });
    await r.body?.cancel();
    const kieu = r.headers.get("Content-Type") || "";
    if ((r.ok || r.status === 206) && KIEU_DUNG.mp3.test(kieu)) kq.tt.ban.nhac = dinhDangNhac(link, kieu);
  } catch {
    /* hết giờ hoặc lỗi mạng: giữ MP3 */
  }
}

/* gọn dữ liệu TikTok thành: tt = thông tin gửi cho trang, ng = link file gốc chỉ máy chủ dùng */
export function chuanBi(b) {
  const v = b.video || {};
  const tg = typeof b.author === "string" ? { uniqueId: b.author, nickname: b.nickname, avatarThumb: b.avatarThumb } : b.author || {};
  const st = b.stats || b.statsV2 || {};
  const m = b.music || {};
  const anh = (b.imagePost?.images || [])
    .map((im) => ({ ds: (im.imageURL?.urlList || im.displayImage?.urlList || []).filter((u) => chuoi(u)), w: so(im.imageWidth), h: so(im.imageHeight) }))
    .filter((a) => a.ds.length);
  const cacBan = (v.bitrateInfo || [])
    .map((x) => ({
      w: so(x.PlayAddr?.Width) || 0,
      h: so(x.PlayAddr?.Height) || 0,
      br: so(x.Bitrate) || 0,
      codec: chuoi(x.CodecType),
      co: so(x.PlayAddr?.DataSize),
      ds: (x.PlayAddr?.UrlList || []).filter((u) => chuoi(u)),
    }))
    .filter((x) => x.ds.length);
  const tot = (a, b) => b.w * b.h - a.w * a.h || laH265(a.codec) - laH265(b.codec) || b.br - a.br;

  /* bản thường = bản tiktok.com phát trên web (không logo); bản HD = bản nét nhất, chỉ có khi nét hơn bản thường */
  let thuong = null,
    hd = null;
  if (!anh.length) {
    const playAddr = chuoi(v.playAddr);
    if (playAddr) {
      const khop = cacBan.find((x) => x.ds.includes(playAddr));
      thuong = {
        w: khop?.w || so(v.width) || 0,
        h: khop?.h || so(v.height) || 0,
        codec: khop?.codec || chuoi(v.codecType) || "h264",
        co: khop?.co ?? null,
        ds: [...new Set([playAddr, ...(khop?.ds || []), ...(v.PlayAddrStruct?.UrlList || []).filter((u) => chuoi(u))])],
      };
    } else {
      const h264 = cacBan.filter((x) => !laH265(x.codec));
      thuong = [...(h264.length ? h264 : cacBan)].sort(tot)[0] || null;
    }
    const cao = [...cacBan].sort(tot)[0];
    if (thuong && cao && cao.w * cao.h > thuong.w * thuong.h) hd = cao;
  }
  const nhacUrl = chuoi(m.playUrl) || chuoi(m.playUrl?.urlList?.[0]) || chuoi(m.playUrl?.UrlList?.[0]);
  const bia = [v.originCover, v.cover, v.dynamicCover, b.imagePost?.cover?.imageURL?.urlList?.[0], anh[0]?.ds[0]].filter((u) => chuoi(u));
  /* ảnh đại diện: bản lớn trước (TikTok để 1080×1080), không có thì bản vừa, bản nhỏ */
  const avt = [tg.avatarLarger, tg.avatarMedium, tg.avatarThumb, b.avatarLarger].filter((u) => chuoi(u));
  const banGon = (x) => x && { w: x.w, h: x.h, codec: laH265(x.codec) ? "h265" : "h264", co: x.co };

  return {
    tt: {
      id: String(b.id),
      loai: anh.length ? "anh" : "video",
      moTa: chuoi(b.desc),
      luc: so(b.createTime),
      thoiLuong: so(v.duration) || null,
      tacGia: { ten: chuoi(tg.uniqueId), tenHienThi: chuoi(tg.nickname), anh: chuoi(tg.avatarThumb) || chuoi(tg.avatarMedium) },
      soLieu: { xem: so(st.playCount), thich: so(st.diggCount), binhLuan: so(st.commentCount), chiaSe: so(st.shareCount), luu: so(st.collectCount) },
      nhac: m.title || m.authorName ? { ten: chuoi(m.title), tacGia: chuoi(m.authorName), thoiLuong: so(m.duration) } : null,
      bia: bia[0] || "",
      anh: anh.map((a) => ({ xem: sapAnh(a.ds)[0], w: a.w, h: a.h })),
      ban: { video: banGon(thuong), hd: banGon(hd), mp3: !!nhacUrl, nhac: nhacUrl ? dinhDangNhac(nhacUrl) : null, bia: bia.length > 0, avt: avt.length > 0 },
    },
    ng: { video: thuong?.ds || [], hd: hd?.ds || [], mp3: nhacUrl ? [nhacUrl] : [], bia, avt, anh: anh.map((a) => sapAnh(a.ds)) },
  };
}

/* mở link rút gọn (vt.tiktok.com/…, tiktok.com/t/…): chỉ đi theo chuyển hướng trong tiktok.com */
export async function moLinkNgan(link) {
  let u = link;
  for (let i = 0; i < 5; i++) {
    const r = await fetch(u, { redirect: "manual", headers: { "User-Agent": UA } });
    const toi = r.headers.get("Location");
    await r.body?.cancel();
    if (!toi && (r.status === 403 || r.status === 429)) return { loi: LOI_CHAN, chan: true };
    if (!toi) break;
    const t = new URL(toi, u);
    if (!laTikTok(t.hostname)) break;
    const d = docLink(t.href);
    if (d.id) return d;
    u = t.href;
  }
  return { loi: "linkNganHong" };
}

/* đọc trang công khai của bài đăng; tên tài khoản để trống TikTok vẫn mở đúng bài */
export async function layBai(id, kieu = "video") {
  let loi = LOI_TRANG,
    ma,
    chan = false;
  for (const k of kieu === "photo" ? ["photo", "video"] : ["video", "photo"]) {
    let r;
    try {
      r = await fetch(`https://www.tiktok.com/@/${k}/${id}`, {
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml", "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8" },
      });
    } catch {
      continue;
    }
    if (!r.ok) {
      await r.body?.cancel();
      if (r.status === 403 || r.status === 429) {
        loi = LOI_CHAN;
        chan = true;
        break;
      }
      continue;
    }
    const d = docTrang(await r.text());
    if (d.bai) {
      const kq = { ...chuanBi(d.bai), cookie: layCookie(r.headers) };
      await hoiDinhDangNhac(kq);
      return kq;
    }
    loi = d.loi;
    ma = d.ma;
    chan = !!d.chan;
    if (ma || chan) break; /* TikTok đã nói rõ bài không xem được, hoặc đang chặn: khỏi thử kiểu kia */
  }
  return ma ? { loi, ma } : chan ? { loi, chan } : { loi };
}

/* như layBai, có giữ 10 phút ở bộ đệm Cloudflare (mỗi trạm một bản; chạy thử trên máy thì không có bộ đệm) */
async function layCoDem(id, kieu, ctx) {
  const dem = typeof caches !== "undefined" ? caches.default : null;
  const khoa = `https://snaptik.meomeo.app/__dem/bai4/${id}`; /* đổi số khi đổi dạng thông tin (bai4: thêm ảnh đại diện) */
  if (dem) {
    const c = await dem.match(khoa);
    if (c) return c.json();
  }
  const r = await layBai(id, kieu);
  if (dem && !r.loi) {
    const luu = dem.put(khoa, new Response(JSON.stringify(r), { headers: { "Content-Type": "application/json", "Cache-Control": `max-age=${GIU_GIAY}` } }));
    if (ctx?.waitUntil) ctx.waitUntil(luu);
    else await luu;
  }
  return r;
}

/* tiếng của câu báo lỗi: tham số hl (trang gửi kèm, theo tiếng của trang), không có thì Accept-Language, rồi tiếng Việt */
export function maNgonNgu(l) {
  l = String(l || "").toLowerCase();
  if (/^(fil|tl)\b/.test(l)) return "fil";
  if (/^in\b/.test(l)) return "id";
  const g = l.split(/[-_]/)[0];
  return LOI[g] ? g : null;
}
export function chonNgonNgu(req, url) {
  const hl = url.searchParams.get("hl");
  if (LOI[hl]) return hl;
  for (const phan of (req.headers.get("Accept-Language") || "").split(",")) {
    const ma = maNgonNgu(phan.split(";")[0].trim());
    if (ma) return ma;
  }
  return "vi";
}
/* câu báo của một mã lỗi theo tiếng; {ma} thay bằng mã lỗi TikTok */
export function noiLoi(khoa, nn = "vi", ts = {}) {
  return String(LOI[nn]?.[khoa] || LOI.vi[khoa] || khoa).replace(/\{(\w+)\}/g, (_, k) => ts[k] ?? "");
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });

/* chặn một máy gọi dồn (cần khai báo GIOI_HAN trong wrangler.toml; không có thì bỏ qua). Khoá chỉ nằm trong bộ đếm của Cloudflare, trang không lưu */
async function quaNhanh(req, env) {
  if (!env?.GIOI_HAN) return false;
  try {
    const { success } = await env.GIOI_HAN.limit({ key: req.headers.get("CF-Connecting-IP") || "?" });
    return !success;
  } catch {
    return false;
  }
}

/* bài không xem được 404, TikTok đang chặn 503, còn lại 502 */
const maLoi = (r) => (r.ma ? 404 : r.chan ? 503 : 502);

async function thongTin(req, url, env, ctx, nn) {
  if (await quaNhanh(req, env)) return json({ ok: false, loi: noiLoi("quaNhanh", nn) }, 429);
  let d = docLink(url.searchParams.get("url"));
  if (d.ngan) d = await moLinkNgan(d.ngan);
  if (d.loi) return json({ ok: false, loi: noiLoi(d.loi, nn, d) }, d.chan ? 503 : 400);
  const r = await layCoDem(d.id, d.kieu, ctx);
  if (r.loi) return json({ ok: false, loi: noiLoi(r.loi, nn, r) }, maLoi(r));
  return json({ ok: true, ...r.tt });
}

/* tên file: tiktok_<tài khoản>_<id>[_hd|_nhac|_anh3|_bia].<đuôi>; ảnh đại diện: tiktok_<tài khoản>_anhdaidien.<đuôi> */
export function tenFile(tt, loai, i, kieu) {
  const ten = (tt.tacGia?.ten || "").replace(/[^\w.-]/g, "").slice(0, 40);
  const duoi = DUOI[String(kieu).split(";")[0].trim().toLowerCase()] || DUOI_MAC_DINH[loai];
  if (loai === "avt") return `tiktok_${ten || tt.id}_anhdaidien.${duoi}`;
  const hau = { video: "", hd: "_hd", mp3: "_nhac", anh: `_anh${i + 1}`, bia: "_bia" }[loai];
  return `tiktok_${ten ? ten + "_" : ""}${tt.id}${hau}.${duoi}`;
}

/* kiểu file gửi về trình duyệt. TikTok gửi nhạc kèm Content-Type video/mp4 dù file là MP3; kiểu thật nằm ở tham số mime_type=audio_mpeg của link */
export function kieuGui(loai, kieu, link) {
  if (/octet-stream/i.test(kieu)) kieu = KIEU_MAC_DINH[loai];
  if (loai === "mp3" && !/^audio\//i.test(kieu)) {
    let m = "";
    try {
      m = (new URL(link).searchParams.get("mime_type") || "").replace("_", "/");
    } catch {
      /* link lạ: dùng kiểu mặc định */
    }
    kieu = /^audio\/[\w.+-]+$/.test(m) ? m : KIEU_MAC_DINH.mp3;
  }
  return kieu;
}

async function tai(req, url, ctx, nn) {
  /* trang khác nhúng thẳng file của trang này (thẻ video, ảnh) thì chặn; bấm link mở từ trang khác vẫn được */
  if (req.headers.get("Sec-Fetch-Site") === "cross-site" && req.headers.get("Sec-Fetch-Dest") !== "document") return json({ ok: false, loi: noiLoi("khongNhung", nn) }, 403);
  const id = url.searchParams.get("id") || "",
    loai = url.searchParams.get("loai") || "video",
    i = Math.floor(+url.searchParams.get("i") || 0),
    xem = url.searchParams.get("xem") === "1";
  if (!/^\d{15,22}$/.test(id) || !LOAI.includes(loai) || !(i >= 0 && i < 100)) return json({ ok: false, loi: noiLoi("yeuCauSai", nn) }, 400);
  const r = await layCoDem(id, "video", ctx);
  if (r.loi) return json({ ok: false, loi: noiLoi(r.loi, nn, r) }, maLoi(r));
  const ds = loai === "anh" ? r.ng.anh[i] || [] : r.ng[loai] || [];
  if (!ds.length) return json({ ok: false, loi: noiLoi("khongCoBan", nn) }, 404);

  const hdr = { "User-Agent": UA, Referer: "https://www.tiktok.com/", Accept: "*/*" };
  if (r.cookie) hdr.Cookie = r.cookie;
  const range = req.headers.get("Range");
  if (range && /^bytes=\d*-\d*$/.test(range)) hdr.Range = range;
  for (const link of ds) {
    if (!/^https:\/\//i.test(link)) continue;
    let up;
    try {
      up = await fetch(link, { headers: hdr });
    } catch {
      continue;
    }
    const kieu = up.headers.get("Content-Type") || KIEU_MAC_DINH[loai];
    if (!(up.ok || up.status === 206) || !KIEU_DUNG[loai].test(kieu)) {
      await up.body?.cancel();
      continue;
    }
    const h = new Headers();
    h.set("Content-Type", kieuGui(loai, kieu, link));
    for (const k of ["Content-Length", "Content-Range", "Accept-Ranges", "Last-Modified", "ETag"]) {
      const x = up.headers.get(k);
      if (x) h.set(k, x);
    }
    h.set("Content-Disposition", `${xem ? "inline" : "attachment"}; filename="${tenFile(r.tt, loai, i, h.get("Content-Type"))}"`);
    h.set("Cache-Control", "private, max-age=600");
    h.set("X-Content-Type-Options", "nosniff");
    h.set("Content-Security-Policy", "default-src 'none'; sandbox");
    return new Response(up.body, { status: up.status, headers: h });
  }
  return json({ ok: false, loi: noiLoi("khongTraFile", nn) }, 502);
}

/* trang 404 lấy từ public/[<tiếng>/]404.html theo tiếng của đường dẫn (/en/… → /en/404.html),
   kèm no-transform để Cloudflare không chèn script Web Analytics */
async function trang404(req, env) {
  if (!env?.ASSETS) return new Response("Không có.", { status: 404 });
  const tien = new URL(req.url).pathname.match(/^\/([a-z]{2,3})\//)?.[1];
  const tep = tien && tien !== "vi" && LOI[tien] ? `/${tien}/404.html` : "/404.html";
  const r = await env.ASSETS.fetch(new Request(new URL(tep, req.url)));
  const h = new Headers(r.headers);
  h.set("Cache-Control", "no-store, no-transform");
  return new Response(r.body, { status: 404, headers: h });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) {
      const nn = chonNgonNgu(req, url);
      if (req.method !== "GET") return json({ ok: false, loi: noiLoi("chiGet", nn) }, 405);
      try {
        if (url.pathname === "/api/thong-tin") return await thongTin(req, url, env, ctx, nn);
        if (url.pathname === "/api/tai") return await tai(req, url, ctx, nn);
      } catch {
        return json({ ok: false, loi: noiLoi("mayChuLoi", nn) }, 500);
      }
      return json({ ok: false, loi: noiLoi("khongCo", nn) }, 404);
    }
    /* trang tĩnh có file thì Cloudflare trả thẳng, không chạy tới đây: tới đây là đường dẫn không có trang nào */
    return trang404(req, env);
  },
};

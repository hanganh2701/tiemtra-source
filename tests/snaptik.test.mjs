/* Test trang tải video TikTok (may-chu/snaptik): đọc link, đọc trang TikTok, API của worker (mạng giả), hàm dùng chung, file tĩnh. Chạy: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import worker, { docLink, docTrang, chuanBi, layCookie, tenFile, kieuGui } from "../may-chu/snaptik/worker.js";
import { soGon, coFile, thoiGian, linkTai, timLinkTrongChu, crc32, taoZip } from "../may-chu/snaptik/public/cong-cu.js";

const PUB = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "may-chu", "snaptik", "public");
const ID = "7234567890123456789";

/* bài video giả, dựng theo cấu trúc trang TikTok (rút gọn) */
const baiVideo = (o = {}) => ({
  id: ID,
  desc: "Mèo nhà mình #meo",
  createTime: "1700000000",
  author: { uniqueId: "meo.nha", nickname: "Mèo Nhà", avatarThumb: "https://p16.tiktokcdn.com/avt.jpeg" },
  stats: { playCount: 159600, diggCount: 35200, commentCount: 5841, shareCount: 1511, collectCount: "649" },
  music: { title: "nhạc gốc", authorName: "Mèo Nhà", duration: 10, playUrl: "https://v16m.tiktokcdn.com/nhac" },
  video: {
    width: 576,
    height: 1024,
    duration: 10,
    cover: "https://p16.tiktokcdn.com/bia.jpeg",
    originCover: "https://p16.tiktokcdn.com/bia-goc.jpeg",
    playAddr: "https://v16-webapp.tiktok.com/thuong",
    bitrateInfo: [
      { Bitrate: 2240963, CodecType: "h264", PlayAddr: { Width: 576, Height: 1024, DataSize: "2953029", UrlList: ["https://v16-webapp.tiktok.com/thuong", "https://v19-webapp.tiktok.com/thuong"] } },
      { Bitrate: 1504834, CodecType: "h265_hvc1", PlayAddr: { Width: 720, Height: 1280, DataSize: "2004627", UrlList: ["https://v16-webapp.tiktok.com/hd265"] } },
      { Bitrate: 1800000, CodecType: "h264", PlayAddr: { Width: 720, Height: 1280, DataSize: "2500000", UrlList: ["https://v16-webapp.tiktok.com/hd264"] } },
    ],
  },
  ...o,
});
const baiAnh = () =>
  baiVideo({
    video: { playAddr: "", duration: 0, cover: "" },
    imagePost: {
      images: [
        { imageURL: { urlList: ["https://p16.tiktokcdn.com/a1.webp", "https://p16.tiktokcdn.com/a1.jpeg"] }, imageWidth: 1080, imageHeight: 1440 },
        { imageURL: { urlList: ["https://p16.tiktokcdn.com/a2.jpeg"] } },
      ],
    },
  });
const trang = (scope) => `<html><head><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: scope })}</script></head><body></body></html>`;
const trangBai = (b) => trang({ "webapp.video-detail": { itemInfo: { itemStruct: b }, statusCode: 0 } });

function traTrang(html) {
  const h = new Headers({ "Content-Type": "text/html; charset=utf-8" });
  h.append("Set-Cookie", "tt_chain_token=abc; Path=/; Domain=.tiktok.com; HttpOnly");
  h.append("Set-Cookie", "ttwid=xyz; Path=/");
  return new Response(html, { headers: h });
}
/* thay fetch bằng mạng giả trong lúc chạy f */
async function voiMangGia(xuLy, f) {
  const goi = [];
  const cu = globalThis.fetch;
  globalThis.fetch = async (u, init = {}) => {
    const url = String(u);
    goi.push({ url, init });
    return xuLy(url, init);
  };
  try {
    await f(goi);
  } finally {
    globalThis.fetch = cu;
  }
}
const goiWorker = (duong, init) => worker.fetch(new Request("https://snaptik.meomeo.app" + duong, init), {}, { waitUntil() {} });

test("đọc link: link đầy đủ, link ảnh, link rút gọn, chữ chia sẻ có link, id trần", () => {
  assert.deepEqual(docLink(`https://www.tiktok.com/@meo.nha/video/${ID}?is_from_webapp=1`), { id: ID, kieu: "video" });
  assert.deepEqual(docLink(`https://www.tiktok.com/@meo.nha/photo/${ID}`), { id: ID, kieu: "photo" });
  assert.deepEqual(docLink(`https://m.tiktok.com/v/${ID}.html`), { id: ID, kieu: "video" });
  assert.deepEqual(docLink(`tiktok.com/@a/video/${ID}`), { id: ID, kieu: "video" });
  assert.deepEqual(docLink(`https://www.tiktok.com/embed/v2/${ID}`), { id: ID, kieu: "video" });
  assert.deepEqual(docLink(ID), { id: ID, kieu: "video" });
  assert.deepEqual(docLink("https://vt.tiktok.com/ZSabc123/"), { ngan: "https://vt.tiktok.com/ZSabc123/" });
  assert.deepEqual(docLink("https://www.tiktok.com/t/ZTabc/"), { ngan: "https://www.tiktok.com/t/ZTabc/" });
  assert.deepEqual(docLink("Xem video này nha 😂 https://vm.tiktok.com/ZMabc/, #fyp"), { ngan: "https://vm.tiktok.com/ZMabc/" });
  assert.deepEqual(docLink(`xem https://example.com/a rồi https://www.tiktok.com/@a/video/${ID}`), { id: ID, kieu: "video" });
});

test("đọc link: báo lỗi dễ hiểu cho link không dùng được", () => {
  assert.match(docLink("").loi, /Chưa thấy link TikTok/);
  assert.match(docLink("https://youtube.com/watch?v=abc").loi, /Chưa thấy link TikTok/);
  assert.match(docLink(`https://nottiktok.com/@a/video/${ID}`).loi, /Chưa thấy link TikTok/);
  assert.match(docLink("https://www.tiktok.com/@meo.nha").loi, /trang cá nhân/);
  assert.match(docLink("https://www.tiktok.com/@meo.nha/live").loi, /trực tiếp/);
  assert.match(docLink("https://www.douyin.com/video/7234567890123456789").loi, /Douyin/);
});

test("đọc trang TikTok: bài video, bản HD ưu tiên H.264, nhạc, số liệu", () => {
  const d = docTrang(trangBai(baiVideo()));
  const { tt, ng } = chuanBi(d.bai);
  assert.equal(tt.id, ID);
  assert.equal(tt.loai, "video");
  assert.equal(tt.tacGia.ten, "meo.nha");
  assert.equal(tt.soLieu.luu, 649, "số dạng chuỗi đổi thành số");
  assert.deepEqual(tt.ban.video, { w: 576, h: 1024, codec: "h264", co: 2953029 });
  assert.deepEqual(tt.ban.hd, { w: 720, h: 1280, codec: "h264", co: 2500000 }, "cùng 720p thì chọn H.264");
  assert.equal(tt.ban.mp3, true);
  assert.equal(tt.bia, "https://p16.tiktokcdn.com/bia-goc.jpeg");
  assert.deepEqual(ng.video, ["https://v16-webapp.tiktok.com/thuong", "https://v19-webapp.tiktok.com/thuong"]);
  assert.deepEqual(ng.hd, ["https://v16-webapp.tiktok.com/hd264"]);
  assert.equal(JSON.stringify(tt).includes("v16-webapp"), false, "link file gốc không gửi cho trang");
});

test("đọc trang TikTok: không có bản nét hơn thì không có nút HD; chỉ có H.265 thì HD là H.265", () => {
  const mot = baiVideo();
  mot.video.bitrateInfo = mot.video.bitrateInfo.slice(0, 1);
  assert.equal(chuanBi(mot).tt.ban.hd, null);
  const hai = baiVideo();
  hai.video.bitrateInfo = hai.video.bitrateInfo.slice(0, 2);
  assert.equal(chuanBi(hai).tt.ban.hd.codec, "h265");
});

test("đọc trang TikTok: bài ảnh ưu tiên JPEG, có nhạc, không có nút video", () => {
  const { tt, ng } = chuanBi(docTrang(trangBai(baiAnh())).bai);
  assert.equal(tt.loai, "anh");
  assert.equal(tt.anh.length, 2);
  assert.equal(tt.anh[0].xem, "https://p16.tiktokcdn.com/a1.jpeg");
  assert.deepEqual(ng.anh[0], ["https://p16.tiktokcdn.com/a1.jpeg", "https://p16.tiktokcdn.com/a1.webp"]);
  assert.equal(tt.ban.video, null);
  assert.equal(tt.ban.hd, null);
  assert.equal(tt.ban.mp3, true);
  assert.equal(tt.bia, "https://p16.tiktokcdn.com/a1.webp", "không có ảnh bìa video thì lấy ảnh đầu");
});

test("đọc trang TikTok: bài riêng tư báo mã lỗi, trang lạ báo lỗi chung, trang kiểu cũ SIGI_STATE vẫn đọc được", () => {
  const rieng = docTrang(trang({ "webapp.video-detail": { statusCode: 10216, statusMsg: "" } }));
  assert.equal(rieng.ma, 10216);
  assert.match(rieng.loi, /riêng tư/);
  assert.match(docTrang("<html>captcha</html>").loi, /Không đọc được trang TikTok/);
  const cu = `<script id="SIGI_STATE" type="application/json">${JSON.stringify({ ItemModule: { [ID]: { ...baiVideo(), author: "meo.nha" } } })}</script>`;
  assert.equal(chuanBi(docTrang(cu).bai).tt.tacGia.ten, "meo.nha");
});

test("kiểu file: nhạc TikTok gửi kèm video/mp4 thì lấy kiểu thật từ mime_type của link (thử thật 17/10/2026)", () => {
  assert.equal(kieuGui("mp3", "video/mp4", "https://v16m.tiktokcdn.com/x/?a=1&mime_type=audio_mpeg&rc=1"), "audio/mpeg");
  assert.equal(kieuGui("mp3", "video/mp4", "https://v16m.tiktokcdn.com/x/"), "audio/mpeg");
  assert.equal(kieuGui("mp3", "audio/mp4", "https://v16m.tiktokcdn.com/x/"), "audio/mp4");
  assert.equal(kieuGui("mp3", "video/mp4", "https://v16m.tiktokcdn.com/x/?mime_type=video_<script>"), "audio/mpeg", "tham số lạ thì bỏ");
  assert.equal(kieuGui("video", "application/octet-stream", "https://x/"), "video/mp4");
  assert.equal(kieuGui("video", "video/mp4", "https://x/?mime_type=audio_mpeg"), "video/mp4", "chỉ sửa kiểu cho nhạc");
});

test("cookie và tên file", () => {
  const h = new Headers();
  h.append("Set-Cookie", "tt_chain_token=abc; Path=/; HttpOnly");
  h.append("Set-Cookie", "ttwid=xyz; Path=/");
  assert.equal(layCookie(h), "tt_chain_token=abc; ttwid=xyz");
  const tt = { id: ID, tacGia: { ten: "meo.nha" } };
  assert.equal(tenFile(tt, "video", 0, "video/mp4"), `tiktok_meo.nha_${ID}.mp4`);
  assert.equal(tenFile(tt, "mp3", 0, "audio/mp4"), `tiktok_meo.nha_${ID}_nhac.m4a`);
  assert.equal(tenFile(tt, "anh", 2, "image/webp"), `tiktok_meo.nha_${ID}_anh3.webp`);
  assert.equal(tenFile({ id: ID, tacGia: { ten: 'a"b/c' } }, "hd", 0, "video/mp4"), `tiktok_abc_${ID}_hd.mp4`, "bỏ ký tự phá tên file");
});

test("API thông tin: mở link rút gọn, đọc trang, trả thông tin không kèm link file gốc", async () => {
  await voiMangGia(
    (url) => {
      if (url === "https://vt.tiktok.com/ZSabc/") return new Response(null, { status: 301, headers: { Location: `https://www.tiktok.com/@meo.nha/video/${ID}?_r=1` } });
      if (url === `https://www.tiktok.com/@/video/${ID}`) return traTrang(trangBai(baiVideo()));
      return new Response("không có", { status: 404 });
    },
    async (goi) => {
      const r = await goiWorker("/api/thong-tin?url=" + encodeURIComponent("Xem nè https://vt.tiktok.com/ZSabc/"));
      assert.equal(r.status, 200);
      const j = await r.json();
      assert.equal(j.ok, true);
      assert.equal(j.id, ID);
      assert.equal(j.ban.hd.h, 1280);
      assert.equal(goi[0].init.redirect, "manual");
      assert.equal(JSON.stringify(j).includes("v16-webapp"), false);
    },
  );
});

test("API thông tin: link sai, chuyển hướng ra ngoài TikTok, bài riêng tư, TikTok chặn", async () => {
  await voiMangGia(
    (url) => {
      if (url.startsWith("https://vt.tiktok.com/")) return new Response(null, { status: 302, headers: { Location: "https://evil.example/" } });
      if (url.includes("/video/7000000000000000001")) return traTrang(trang({ "webapp.video-detail": { statusCode: 10216 } }));
      return new Response("chặn", { status: 403 });
    },
    async (goi) => {
      let r = await goiWorker("/api/thong-tin?url=" + encodeURIComponent("https://youtube.com/x"));
      assert.equal(r.status, 400);
      r = await goiWorker("/api/thong-tin?url=" + encodeURIComponent("https://vt.tiktok.com/ZSx/"));
      assert.equal(r.status, 400);
      assert.equal(goi.some((g) => g.url.includes("evil.example")), false, "không đi theo chuyển hướng ra ngoài TikTok");
      r = await goiWorker("/api/thong-tin?url=" + encodeURIComponent("https://www.tiktok.com/@a/video/7000000000000000001"));
      assert.equal(r.status, 404);
      assert.match((await r.json()).loi, /riêng tư/);
      r = await goiWorker("/api/thong-tin?url=" + encodeURIComponent("https://www.tiktok.com/@a/video/7000000000000000002"));
      assert.equal(r.status, 502);
      assert.equal((await r.json()).ok, false);
    },
  );
});

test("API tải: gửi cookie và Referer của TikTok, chuyển tiếp Range, đặt tên file, bỏ phản hồi không phải video", async () => {
  await voiMangGia(
    (url) => {
      if (url === `https://www.tiktok.com/@/video/${ID}`) return traTrang(trangBai(baiVideo()));
      if (url === "https://v16-webapp.tiktok.com/thuong") return new Response("<html>lỗi</html>", { headers: { "Content-Type": "text/html" } });
      if (url === "https://v19-webapp.tiktok.com/thuong")
        return new Response(new Uint8Array([1, 2, 3]), { status: 206, headers: { "Content-Type": "video/mp4", "Content-Range": "bytes 0-2/3", "Content-Length": "3" } });
      return new Response("không có", { status: 404 });
    },
    async (goi) => {
      const r = await goiWorker(`/api/tai?id=${ID}&loai=video`, { headers: { Range: "bytes=0-" } });
      assert.equal(r.status, 206);
      assert.equal(r.headers.get("Content-Type"), "video/mp4");
      assert.equal(r.headers.get("Content-Range"), "bytes 0-2/3");
      assert.equal(r.headers.get("Content-Disposition"), `attachment; filename="tiktok_meo.nha_${ID}.mp4"`);
      assert.deepEqual([...new Uint8Array(await r.arrayBuffer())], [1, 2, 3]);
      const lay = goi.find((g) => g.url === "https://v19-webapp.tiktok.com/thuong").init.headers;
      assert.equal(lay.Cookie, "tt_chain_token=abc; ttwid=xyz");
      assert.equal(lay.Referer, "https://www.tiktok.com/");
      assert.equal(lay.Range, "bytes=0-");
    },
  );
});

test("API tải: xem ngay (inline), ảnh thứ i, yêu cầu sai, bản không có, nhúng từ trang khác", async () => {
  await voiMangGia(
    (url) => {
      if (url.startsWith("https://www.tiktok.com/@/video/")) return traTrang(trangBai(baiAnh()));
      if (url === "https://p16.tiktokcdn.com/a2.jpeg") return new Response(new Uint8Array([9]), { headers: { "Content-Type": "image/jpeg" } });
      return new Response("không có", { status: 404 });
    },
    async () => {
      let r = await goiWorker(`/api/tai?id=${ID}&loai=anh&i=1&xem=1`);
      assert.equal(r.status, 200);
      assert.equal(r.headers.get("Content-Disposition"), `inline; filename="tiktok_meo.nha_${ID}_anh2.jpg"`);
      assert.match(r.headers.get("Content-Security-Policy"), /sandbox/);
      assert.equal((await goiWorker(`/api/tai?id=${ID}&loai=video`)).status, 404, "bài ảnh không có video");
      assert.equal((await goiWorker(`/api/tai?id=${ID}&loai=anh&i=5`)).status, 404);
      assert.equal((await goiWorker(`/api/tai?id=abc&loai=video`)).status, 400);
      assert.equal((await goiWorker(`/api/tai?id=${ID}&loai=exe`)).status, 400);
      assert.equal((await goiWorker(`/api/tai?id=${ID}&loai=anh&i=1`, { headers: { "Sec-Fetch-Site": "cross-site", "Sec-Fetch-Dest": "video" } })).status, 403);
    },
  );
});

test("worker.js chỉ export hàm (Cloudflare coi mỗi export là một điểm vào; export chuỗi, mảng thì Worker không khởi động)", async () => {
  const m = await import("../may-chu/snaptik/worker.js");
  for (const [k, v] of Object.entries(m)) assert.ok(typeof v === "function" || (k === "default" && typeof v.fetch === "function"), "export không phải hàm: " + k);
});

test("wrangler.toml: /api/* chạy worker trước trang tĩnh (không thì bấm nút tải nhận trang 404, thử thật 17/10/2026)", () => {
  const toml = readFileSync(path.join(PUB, "..", "wrangler.toml"), "utf8");
  assert.match(toml, /^run_worker_first = \[[^\]]*"\/api\/\*"[^\]]*\]$/m);
});

test("wrangler.toml: worker.js luôn chạy ở Singapore (trạm Hồng Kông chỉ nhận trang báo khu vực của TikTok, thử thật trên Cloudflare 17/10/2026)", () => {
  const toml = readFileSync(path.join(PUB, "..", "wrangler.toml"), "utf8");
  assert.match(toml, /^\[placement\]\nregion = "aws:ap-southeast-1"$/m);
});

test("_headers: mọi trang có no-transform để Cloudflare không chèn script Web Analytics (CSP chặn nó, console báo lỗi; thử thật 17/10/2026)", () => {
  const h = readFileSync(path.join(PUB, "_headers"), "utf8");
  assert.match(h, /^\/\*\n(  .+\n)*  Cache-Control: [^\n]*no-transform/m);
});

test("API: chỉ nhận GET, đường lạ trả 404, ngoài /api/ chuyển cho trang tĩnh", async () => {
  assert.equal((await goiWorker("/api/thong-tin", { method: "POST" })).status, 405);
  assert.equal((await goiWorker("/api/khac")).status, 404);
  const r = await worker.fetch(new Request("https://snaptik.meomeo.app/mp3/"), { ASSETS: { fetch: async () => new Response("trang mp3") } }, {});
  assert.equal(await r.text(), "trang mp3");
});

test("hàm dùng chung của trang: định dạng số, dung lượng, thời gian, link tải, tìm link trong chữ", () => {
  assert.equal(soGon(35200), "35,2K");
  assert.equal(soGon(1596000), "1,6M");
  assert.equal(soGon(999), "999");
  assert.equal(soGon(null), "");
  assert.equal(coFile(2953029), "2,8 MB");
  assert.equal(coFile(5000), "5 KB");
  assert.equal(thoiGian(65), "1:05");
  assert.equal(linkTai(ID, "anh", 3, true), `/api/tai?id=${ID}&loai=anh&i=3&xem=1`);
  assert.equal(linkTai(ID, "mp3"), `/api/tai?id=${ID}&loai=mp3`);
  assert.equal(timLinkTrongChu("Xem nè https://vt.tiktok.com/ZSabc/, hay lắm"), "https://vt.tiktok.com/ZSabc/");
  assert.equal(timLinkTrongChu("không có link"), "");
});

test("file ZIP: CRC-32 chuẩn, cấu trúc đọc lại được", async () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
  const tep = [
    { ten: "ảnh1.jpg", du: new Uint8Array([1, 2, 3, 4]) },
    { ten: "anh2.jpg", du: new Uint8Array([5, 6]) },
  ];
  const b = new Uint8Array(await taoZip(tep).arrayBuffer());
  const v = new DataView(b.buffer);
  const cuoi = b.length - 22;
  assert.equal(v.getUint32(cuoi, true), 0x06054b50);
  assert.equal(v.getUint16(cuoi + 10, true), 2);
  let p = v.getUint32(cuoi + 16, true);
  for (const t of tep) {
    assert.equal(v.getUint32(p, true), 0x02014b50);
    const n = v.getUint16(p + 28, true),
      vt = v.getUint32(p + 42, true);
    assert.equal(new TextDecoder().decode(b.subarray(p + 46, p + 46 + n)), t.ten);
    assert.equal(v.getUint32(vt, true), 0x04034b50);
    const du = b.subarray(vt + 30 + v.getUint16(vt + 26, true), vt + 30 + v.getUint16(vt + 26, true) + v.getUint32(vt + 18, true));
    assert.deepEqual([...du], [...t.du]);
    assert.equal(v.getUint32(vt + 14, true), crc32(t.du));
    p += 46 + n;
  }
});

test("trang tĩnh: mọi link nội bộ có file, manifest và service worker trỏ đúng file, sitemap đủ trang", () => {
  const coFileTinh = (duong) => {
    const p = path.join(PUB, decodeURIComponent(duong.split(/[?#]/)[0]));
    return duong.endsWith("/") ? existsSync(path.join(p, "index.html")) : existsSync(p) && statSync(p).isFile();
  };
  const html = [];
  const quet = (d) => {
    for (const f of readdirSync(d)) {
      const p = path.join(d, f);
      if (statSync(p).isDirectory()) quet(p);
      else if (f.endsWith(".html")) html.push(p);
    }
  };
  quet(PUB);
  assert.ok(html.length >= 7);
  for (const f of html) {
    const s = readFileSync(f, "utf8");
    assert.match(s, /<html lang="vi">/, f);
    assert.match(s, /<title>[^<]+<\/title>/, f);
    assert.doesNotMatch(s, /<script(?![^>]*\bsrc=)[^>]*>/, "không có script viết thẳng trong trang (CSP chặn): " + f);
    assert.doesNotMatch(s, /\sstyle="/, "không có style viết thẳng trong thẻ (CSP chặn): " + f);
    for (const m of s.matchAll(/(?:href|src)="(\/[^"]*)"/g)) assert.ok(coFileTinh(m[1]), `${path.relative(PUB, f)} trỏ tới ${m[1]} không có`);
  }
  const mf = JSON.parse(readFileSync(path.join(PUB, "manifest.webmanifest"), "utf8"));
  for (const i of mf.icons) assert.ok(coFileTinh(i.src), i.src);
  assert.equal(mf.share_target.action, "/");
  const sw = readFileSync(path.join(PUB, "sw.js"), "utf8");
  for (const m of sw.match(/const VO = \[([^\]]+)\]/)[1].matchAll(/"([^"]+)"/g)) assert.ok(coFileTinh(m[1]), "sw.js giữ file không có: " + m[1]);
  for (const m of readFileSync(path.join(PUB, "sitemap.xml"), "utf8").matchAll(/<loc>https:\/\/snaptik\.meomeo\.app([^<]*)<\/loc>/g))
    assert.ok(coFileTinh(m[1]), "sitemap trỏ tới trang không có: " + m[1]);
});

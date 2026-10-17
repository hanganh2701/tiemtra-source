/* Canh snaptik.meomeo.app: mở trang chủ, tìm một video công khai, tải thử 1 byte của video. Hỏng thì thoát mã 1.
   GitHub Actions chạy mỗi ngày (.github/workflows/canh-snaptik.yml): lượt chạy đỏ thì GitHub gửi email báo.
   Trang dựa vào trang công khai của TikTok nên có thể hỏng bất cứ lúc nào (TikTok đổi trang, chặn máy chủ).
   Chạy tay: node may-chu/snaptik/canh.mjs */
import { pathToFileURL } from "node:url";

const GOC = "https://snaptik.meomeo.app";
/* video công khai lâu năm: một bài bị xoá thì bài kia vẫn kiểm được, chỉ báo hỏng khi cả hai cùng hỏng */
export const BAI = ["6718335390845095173", "6742501081818877190"];

async function kiemBai(id, f) {
  const r = await f(`${GOC}/api/thong-tin?url=${id}`);
  const j = await r.json().catch(() => null);
  if (!j?.ok) return `tìm bài ${id}: ${r.status} ${j?.loi || "không đọc được phản hồi"}`;
  if (!j.ban?.video) return `bài ${id}: không có bản video`;
  const t = await f(`${GOC}/api/tai?id=${id}&loai=video`, { headers: { Range: "bytes=0-0" } });
  await t.body?.cancel();
  const kieu = t.headers.get("Content-Type") || "";
  if (t.status !== 206 || !kieu.startsWith("video/")) return `tải video ${id}: ${t.status} ${kieu}`;
  return "";
}

/* trả { ok, loi: [các lỗi gặp trên đường] } */
export async function kiemTra(f = fetch) {
  const loi = [];
  try {
    const trang = await f(GOC + "/");
    const html = await trang.text();
    if (!trang.ok || !html.includes("snaptik")) return { ok: false, loi: [`trang chủ: ${trang.status}`] };
  } catch (e) {
    return { ok: false, loi: [`trang chủ: ${e.message}`] };
  }
  for (const id of BAI) {
    const l = await kiemBai(id, f).catch((e) => `bài ${id}: ${e.message}`);
    if (!l) return { ok: true, loi };
    loi.push(l);
  }
  return { ok: false, loi };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const { ok, loi } = await kiemTra();
  for (const l of loi) console.log("  " + l);
  console.log(ok ? "snaptik chạy tốt" : "snaptik đang hỏng");
  process.exit(ok ? 0 : 1);
}

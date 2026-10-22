/* Kho ảnh của didate. Thiệp có ảnh thì cột thiep.anh giữ JSON cho biết ảnh nằm ở kho nào:
     {"kho":"telegram","file":"<file_id>","tin":<message_id>,"kieu":"image/jpeg"}
     {"kho":"d1","ma":"<khoá trong bảng anh_d1>","kieu":"image/jpeg"}
   Ảnh mới vào kho ghi ở biến KHO_ANH (wrangler.toml); ảnh cũ vẫn đọc từ kho cũ, nên đổi kho không hỏng thiệp đang có.
   - telegram: bot (secret TG_TOKEN) gửi ảnh dạng file vào kênh riêng tư (secret TG_CHAT). Token chỉ nằm trong worker,
     link tải file của Telegram có token nên trang không bao giờ lấy ảnh thẳng từ Telegram.
     Ảnh trên Telegram không bao giờ bị xoá (chủ dự án chốt 22/10/2026): thiệp bị xoá, đổi ảnh hay hết hạn 90 ngày thì ảnh
     vẫn nằm trong kênh. Cần xoá thì chủ dự án xoá tay trong kênh (tìm "didate <id>").
     Điều khoản bot của Telegram không cho dùng bot làm kho lưu trữ; chủ dự án biết và tự nhận rủi ro (22/10/2026).
   - d1: ảnh nằm thẳng trong bảng anh_d1. Dùng khi chạy thử trên máy (không cần bot), hoặc khi thôi dùng Telegram. */

const TG = "https://api.telegram.org";
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

export const coTelegram = (env) => !!(env.TG_TOKEN && env.TG_CHAT);

/* gọi Bot API; bị giới hạn tốc độ (429) mà chỉ phải chờ vài giây thì chờ rồi thử lại một lần */
async function goiTG(env, phuongThuc, body) {
  for (let lan = 0; ; lan++) {
    const laForm = body instanceof FormData;
    const r = await fetch(`${TG}/bot${env.TG_TOKEN}/${phuongThuc}`, {
      method: "POST",
      headers: laForm ? undefined : { "Content-Type": "application/json" },
      body: laForm ? body : JSON.stringify(body),
    });
    const j = await r.json().catch(() => null);
    if (j?.ok) return j.result;
    const cho = j?.parameters?.retry_after;
    if (r.status === 429 && lan === 0 && cho > 0 && cho <= 5) {
      await ngu(cho * 1000);
      continue;
    }
    /* không đưa link (có token) vào lỗi */
    throw new Error(`Telegram ${phuongThuc}: ${r.status} ${j?.description || ""}`.trim());
  }
}

/* lưu ảnh của thiệp id, trả về thông tin để ghi vào cột thiep.anh */
export async function luuAnh(env, id, { bytes, kieu }) {
  if ((env.KHO_ANH || "telegram") === "d1") {
    const ma = `${id}-${Date.now().toString(36)}`;
    await env.DB.prepare("INSERT INTO anh_d1 (ma, du_lieu, kieu) VALUES (?, ?, ?)").bind(ma, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), kieu).run();
    return { kho: "d1", ma, kieu };
  }
  if (!coTelegram(env)) throw new Error("Chưa cài TG_TOKEN, TG_CHAT cho kho ảnh Telegram");
  const f = new FormData();
  f.append("chat_id", env.TG_CHAT);
  f.append("document", new Blob([bytes], { type: kieu }), `${id}.${kieu === "image/png" ? "png" : kieu === "image/webp" ? "webp" : "jpg"}`);
  f.append("caption", `didate ${id}`);
  f.append("disable_notification", "true");
  f.append("disable_content_type_detection", "true");
  const tin = await goiTG(env, "sendDocument", f);
  const tep = tin.document || tin.animation || tin.sticker || tin.photo?.at(-1);
  if (!tep?.file_id) throw new Error("Telegram không trả mã file");
  return { kho: "telegram", file: tep.file_id, tin: tin.message_id, kieu };
}

/* nội dung ảnh (Uint8Array hoặc luồng), không có thì null */
export async function docAnh(env, a) {
  if (a.kho === "d1") {
    const r = await env.DB.prepare("SELECT du_lieu FROM anh_d1 WHERE ma = ?").bind(a.ma).first();
    return r ? new Uint8Array(r.du_lieu) : null;
  }
  if (a.kho === "telegram") {
    const f = await goiTG(env, "getFile", { file_id: a.file });
    const r = await fetch(`${TG}/file/bot${env.TG_TOKEN}/${f.file_path}`);
    if (!r.ok) throw new Error(`Telegram tải file: ${r.status}`);
    return r.body;
  }
  return null;
}

/* người tạo xoá thiệp hay đổi ảnh: chỉ xoá ảnh trong D1 (chỗ có hạn), ảnh Telegram giữ lại */
export async function xoaAnh(env, a) {
  if (a.kho !== "d1") return;
  try {
    await env.DB.prepare("DELETE FROM anh_d1 WHERE ma = ?").bind(a.ma).run();
  } catch (e) {
    console.error("xoá ảnh:", e?.message);
  }
}

/* xoá ảnh trong D1 của các thiệp quá hạn; ảnh Telegram giữ lại */
export async function xoaAnhHetHan(env, ds) {
  const ma = ds.filter((a) => a?.kho === "d1").map((a) => a.ma);
  for (let i = 0; i < ma.length; i += 50) {
    const nhom = ma.slice(i, i + 50);
    await env.DB.prepare(`DELETE FROM anh_d1 WHERE ma IN (${nhom.map(() => "?").join(",")})`).bind(...nhom).run();
  }
}

/* nhắn cho chủ dự án qua bot (báo thiệp xấu). Chưa cài bot thì thôi */
export async function nhanChuDuAn(env, noiDung) {
  if (!coTelegram(env)) return false;
  try {
    await goiTG(env, "sendMessage", { chat_id: env.TG_BAO || env.TG_CHAT, text: noiDung, link_preview_options: { is_disabled: true } });
    return true;
  } catch {
    return false;
  }
}

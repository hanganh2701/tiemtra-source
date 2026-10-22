/* Tìm mã kênh Telegram (TG_CHAT) cho didate. Trước khi chạy: thêm bot vào kênh riêng tư làm quản trị
   (có quyền đăng và xoá tin), rồi đăng một tin bất kỳ trong kênh. Chạy:
     node may-chu/didate/lay-chat-id.mjs
   Script hỏi token của bot (không lưu, không gửi đi đâu ngoài Telegram), gọi getUpdates, in mã các kênh/nhóm bot thấy. */
import { createInterface } from "node:readline/promises";

let token = process.env.TG_TOKEN;
if (!token) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  token = (await rl.question("Token của bot (lấy ở @BotFather): ")).trim();
  rl.close();
}
const j = await (await fetch(`https://api.telegram.org/bot${token}/getUpdates`)).json();
if (!j.ok) {
  console.error(`Telegram báo lỗi: ${j.description}`);
  process.exit(1);
}
const thay = new Map();
for (const u of j.result) {
  const c = (u.channel_post || u.edited_channel_post || u.message || u.my_chat_member)?.chat;
  if (c) thay.set(c.id, `${c.type} · ${c.title || c.username || c.first_name || ""}`);
}
if (!thay.size) console.log("Chưa thấy kênh nào. Thêm bot vào kênh làm quản trị, đăng một tin trong kênh rồi chạy lại.");
for (const [id, ten] of thay) console.log(`${id}   ${ten}`);

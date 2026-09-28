/* ---------- GẮN BÓ: chế độ Thư giãn, lời mời cài game lên màn hình chính ----------
   Nạp trước game.js. */

/* Thư giãn: khách không bỏ về (kiên nhẫn dừng ở 35%), không sự cố, không thuế, không khách khó chiều.
   Thử thách hôm nay vẫn chơi như thường để kết quả so được với bạn bè. */
const thuGian = () => !!(S && S.thuGian) && !(R && R.challenge);
const CHO_THU_GIAN = 0.35;
/* trừ kiên nhẫn một nhịp; chế độ Thư giãn thì không xuống dưới mức sàn */
function truCho(c, dt) {
  c.pat = thuGian() ? Math.max(Math.min(c.pat, c.max * CHO_THU_GIAN), c.pat - dt) : c.pat - dt;
}

/* ---------- ĐỘ KHÓ THEO CHƯƠNG ----------
   Chế độ thường khó dần: từ Chương 2 (ngày 30) khách bớt kiên nhẫn, nhiều khách khó chiều hơn, giá nhập tăng;
   Chương 3 (ngày 60, giáp Tết) tăng thêm. Chế độ Thư giãn và thử thách hôm nay giữ nguyên như đầu game.
   Sự cố mất tiền tính theo tiền trong két để két dày vẫn thấy xót. Nạp trước game.js. */

const DO_KHO = {
  2: { cho: 0.95, kho: 0.16, gia: 1.1, chu: "giá nhập tăng 10%, khách bớt kiên nhẫn và nhiều khách khó chiều hơn" },
  3: { cho: 0.9, kho: 0.2, gia: 1.2, chu: "giáp Tết giá nhập tăng 20%, khách vội và khó chiều hơn nữa" },
};
const doKho = () => (!S || thuGian() || (R && R.challenge) ? null : DO_KHO[chuongNay()] || null);
/* nhân vào độ kiên nhẫn của khách vãng lai */
const heSoChoChuong = () => (doKho() || {}).cho || 1;
/* tỉ lệ khách khó chiều ngày thường (ngày khách khó ở, ngày khách vui vẫn theo mức riêng) */
const tiLeKhoChieu = () => (doKho() || {}).kho || 0.12;
/* nhân vào giá nhập nguyên liệu và giá chai hương */
const heSoGiaNhap = () => (doKho() || {}).gia || 1;
/* sự cố mất tiền: ít nhất như cũ (200k–900k), két dày thì mất khoảng 3% két, tối đa 4 triệu, không quá một phần ba két */
const tienSuCo = (v0) =>
  Math.min(Math.max(v0, Math.round((S.money * 0.03) / 50000) * 50000), 4000000, Math.floor(S.money / 3 / 1000) * 1000);
/* cuối ngày: sang chương mới thì báo trước trong thẻ tổng kết */
function doKhoCuoiNgay() {
  const d = DO_KHO[chuongNay()];
  if (!d || thuGian() || chuongLuc(S.day - 1) === chuongNay()) return "";
  return `<p class="lvup">📈 Từ hôm nay (Chương ${chuongNay()}): ${d.chu}. Chế độ Thư giãn thì không đổi.</p>`;
}

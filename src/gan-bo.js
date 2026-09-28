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

/* ---------- mời cài game lên màn hình chính: từ ngày 4, hỏi một lần ---------- */
let caiSuKien = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  caiSuKien = e;
});
window.addEventListener("appinstalled", () => {
  caiSuKien = null;
  if (typeof track === "function") track("cai-app");
});
const dangChayApp = () => (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
const laIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const coTheCai = () => !dangChayApp() && !!(caiSuKien || laIOS());
/* đầu ngày (prepChecks); trả true nếu đang hỏi */
function moiCai() {
  if (S.day < 4 || S.moiCai || R.challenge || !coTheCai()) return false;
  S.moiCai = S.day;
  save();
  hienCai();
  return true;
}
function hienCai() {
  if (caiSuKien)
    return ask(
      `<div class="pbig">📲</div><h2>Cài Tiệm Trà Nhỏ lên màn hình chính?</h2><p>Mở nhanh như ứng dụng, toàn màn hình, không phải tìm lại link. Tiến trình vẫn là tiến trình trên máy này.</p>`,
      [
        ["Để sau", () => {}],
        [
          "Cài ngay",
          async () => {
            const e = caiSuKien;
            caiSuKien = null;
            if (!e) return;
            e.prompt();
            try {
              const r = await e.userChoice;
              if (typeof track === "function") track(r.outcome === "accepted" ? "cai-dong-y" : "cai-tu-choi");
            } catch (x) {}
          },
          1,
        ],
      ],
    );
  ask(
    `<div class="pbig">📲</div><h2>Thêm vào màn hình chính</h2><p>Mở game bằng Safari, bấm nút <b>Chia sẻ</b> (ô vuông có mũi tên lên) rồi chọn <b>Thêm vào MH chính</b>.</p><p class="note">Trên iPhone, bản ngoài màn hình chính có bộ nhớ riêng. Muốn mang tiệm sang: vào Cài đặt, Sao lưu tiến trình để lấy mã, rồi mở bản mới, Khôi phục từ mã.</p>`,
    [["Đã hiểu", () => {}, 1]],
  );
}

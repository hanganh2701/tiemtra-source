/* ---------- CẢM GIÁC PHA: bọt khi rót, dấu "Hoàn hảo!", rung nhẹ ----------
   Chỉ thêm phản hồi, không đổi luật chơi. Nạp trước game.js. */

/* rung trên máy hỗ trợ (Android); iPhone bỏ qua */
function rung(p) {
  try {
    if (navigator.vibrate) navigator.vibrate(p);
  } catch (e) {}
}
/* bọt nổi trong ly lúc đang rót trà */
function botRot(on) {
  const c = document.getElementById("q3cup");
  if (c) c.classList.toggle("q3sui", !!on);
}
/* dấu đóng "Hoàn hảo!" giữa quầy khi khách chấm 5 sao */
function dauHoanHao(chu) {
  const st = document.getElementById("q3stage");
  if (!st) return;
  const d = document.createElement("div");
  d.className = "q3stamp";
  d.textContent = chu || "Hoàn hảo!";
  st.appendChild(d);
  setTimeout(() => d.remove(), 1200);
}

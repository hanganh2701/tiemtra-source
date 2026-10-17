/* Chọn tiếng cho snaptik. Nạp đồng bộ trong <head> (không defer) để chuyển trang trước khi vẽ, khỏi nháy chữ.
   - Đã bấm chọn ở nút ngôn ngữ (lưu trong trình duyệt) thì theo lựa chọn đó.
   - Chưa chọn thì theo ngôn ngữ của máy (navigator.languages); máy dùng tiếng trang chưa có thì tiếng Anh.
   - Máy tìm kiếm (Googlebot…) không bị chuyển: mỗi tiếng có trang riêng, đã khai hreflang.
   Tiếng Việt ở /, tiếng khác ở /<mã>/ cùng tên trang. Danh sách mã giữ giống sinh-trang.mjs (test so). */
(() => {
  const CO = ["vi", "en", "id", "th", "ms", "fil", "es", "pt", "ja", "ko"];
  const KHOA = "snaptik-ngon-ngu";
  const hien = document.documentElement.lang || "vi";

  /* "vi-VN" → "vi", "tl"/"fil-PH" → "fil", "in" (Android cũ) → "id"; tiếng chưa có → null */
  const maCua = (l) => {
    l = String(l || "").toLowerCase();
    if (/^(fil|tl)\b/.test(l)) return "fil";
    if (/^in\b/.test(l)) return "id";
    const g = l.split(/[-_]/)[0];
    return CO.includes(g) ? g : null;
  };
  const goc = (ma) => (ma === "vi" ? "/" : "/" + ma + "/");

  let chon = null;
  try {
    chon = localStorage.getItem(KHOA);
  } catch {
    /* chế độ ẩn danh chặn bộ nhớ: coi như chưa chọn */
  }
  if (!CO.includes(chon)) chon = null;

  const may = /bot|crawl|spider|slurp|lighthouse|headless/i.test(navigator.userAgent);
  const muon = chon || (may ? null : (navigator.languages || [navigator.language]).map(maCua).find(Boolean) || "en");
  if (muon && muon !== hien) {
    const duong = location.pathname.replace(hien === "vi" ? /^\// : new RegExp("^/" + hien + "/"), "/");
    location.replace(goc(muon) + duong.slice(1) + location.search + location.hash);
    return;
  }

  /* bấm chọn tiếng: nhớ lại để lần sau không tự đổi theo máy */
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("[data-ngon-ngu]");
    if (a) {
      try {
        localStorage.setItem(KHOA, a.dataset.ngonNgu);
      } catch {
        /* không lưu được thì lần sau lại theo ngôn ngữ máy */
      }
      return;
    }
    /* bấm ra ngoài thì đóng danh sách tiếng */
    for (const d of document.querySelectorAll("details.ngon-ngu[open]")) if (!d.contains(e.target)) d.open = false;
  });
})();

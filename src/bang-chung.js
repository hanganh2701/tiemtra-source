/* ---------- BẢNG XẾP HẠNG CHUNG (bản 5.7) ----------
   Tính năng máy chủ duy nhất của game (chủ dự án chốt 01/10/2026): may-chu/bxh, Cloudflare Worker + D1 ở bxh.meomeo.app.
   Người chơi tự bấm tham gia. Cuối mỗi ngày gửi tên tiệm, lãi tích luỹ của tiệm, ngày, sao. Rời bảng thì xoá dòng trên máy chủ.
   Khoá bí mật nằm trong localStorage (tsBxhKhoa), không nằm trong bản lưu nên mã sao lưu không lộ khoá. Nạp trước game.js. */

const BXH_URL = "https://bxh.meomeo.app";
const bxhKhoa = () => {
  try {
    return localStorage.getItem("tsBxhKhoa") || "";
  } catch (e) {
    return "";
  }
};
const bxhCo = () => !!bxhKhoa();
function bxhGoi(duong, body) {
  /* text/plain để trình duyệt khỏi hỏi trước (CORS preflight) */
  return fetch(BXH_URL + duong, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(body), keepalive: true }).then((r) =>
    r.json().then((j) => (r.ok ? j : Promise.reject(new Error(j.loi || "lỗi " + r.status)))),
  );
}
/* cuối ngày (endDay): gửi lãi tích luỹ nếu đã tham gia; lỗi mạng thì thôi, mai gửi lại */
function bxhGui() {
  if (!bxhCo() || R.challenge) return Promise.resolve(null);
  /* ngay = số ngày đã mở cửa (lúc gửi cuối ngày, S.day đã sang ngày mới) */
  return bxhGoi("/diem", { khoa: bxhKhoa(), ten: shopName(), lai: Math.round(S.totalProfit || 0), ngay: Math.max(1, S.day - 1), sao: +rating().toFixed(2), ban: GAME_VERSION })
    .then((j) => {
      S.bxhHang = j.hang;
      return j;
    })
    .catch(() => null);
}
function bxhThamGia() {
  try {
    const k = crypto.randomUUID ? crypto.randomUUID() : [...crypto.getRandomValues(new Uint8Array(16))].map((x) => x.toString(16).padStart(2, "0")).join("");
    localStorage.setItem("tsBxhKhoa", k);
  } catch (e) {
    toast("Máy này không lưu được khoá, chưa tham gia được");
    return;
  }
  if (typeof track === "function") track("bxh-tham-gia");
  R.bxh = null;
  bxhGui().then((j) => {
    toast(j ? `🏆 Đã lên bảng chung: hạng ${j.hang}` : "Đã tham gia. Chưa gửi được, cuối ngày game sẽ gửi lại", 3500, 1);
    renderPrep();
  });
}
function bxhRoi() {
  ask(`<h2>Rời bảng xếp hạng chung?</h2><p>Dòng của tiệm bạn trên bảng sẽ bị xoá. Muốn tham gia lại lúc nào cũng được.</p>`, [
    ["Ở lại", () => {}],
    [
      "Rời bảng",
      () => {
        const k = bxhKhoa();
        try {
          localStorage.removeItem("tsBxhKhoa");
        } catch (e) {}
        delete S.bxhHang;
        R.bxh = null;
        save();
        bxhGoi("/roi", { khoa: k })
          .then(() => toast("Đã rời bảng chung"))
          .catch(() => toast("Đã rời bảng trên máy này. Máy chủ chưa xoá được dòng, thử lại khi có mạng"));
        renderPrep();
      },
      1,
    ],
  ]);
}
/* tab Hẻm 42 › Bảng chung: vẽ khung trước, tải bảng sau. Tự gắn nút và tải bảng sau khi vẽ (không nhờ hemBind của pho-tra.js:
   sau mỗi lần cập nhật, trình duyệt có thể còn giữ bản cũ của file khác vài phút) */
function paneBangChung() {
  setTimeout(bxhGan, 0);
  const co = bxhCo();
  return `<div class="ttcard"><b>Bảng xếp hạng chung</b><p>Tiệm nào kiếm được nhiều tiền nhất: xếp theo lãi tích luỹ của tiệm (doanh thu trừ chi phí từ ngày khai trương). Tiền mua nhà, xe không làm tụt hạng.</p>${
    co
      ? `<p class="okline">✓ Tiệm bạn đang trên bảng${S.bxhHang ? ` · hạng ${S.bxhHang}` : ""}. Cuối mỗi ngày tự gửi số mới.</p><div class="askbtns"><button class="sbtn ghost" id="bxhRoi">Rời bảng</button></div>`
      : `<p class="note">Tham gia thì cuối mỗi ngày game gửi lên máy chủ: tên tiệm, lãi tích luỹ, số ngày, sao. Không gửi tên thật, số điện thoại hay bản lưu. Rời bảng lúc nào cũng được, dòng của bạn bị xoá.</p><div class="askbtns"><button class="big" id="bxhVao">Tham gia bảng chung</button></div>`
  }</div><div id="bxhDs"><p class="note" style="text-align:center">Đang tải bảng…</p></div>`;
}
function bxhVe(j) {
  let el = null;
  try {
    el = document.getElementById("bxhDs"); /* tải xong mà trang đã đóng (test) hay tab đã đổi thì thôi */
  } catch (e) {}
  if (!el) return;
  if (!j || !j.bang) {
    el.innerHTML = `<p class="note" style="text-align:center">Chưa tải được bảng. Kiểm tra mạng rồi mở lại tab này.</p>`;
    return;
  }
  const dong = (x) =>
    `<div class="crow ptr${x.minh ? " minh" : ""}"><span><b>${x.hang}.</b> ${esc(x.ten)}<small>${x.ngay} ngày mở cửa · ${String(x.sao).replace(".", ",")}★</small></span><span>${fmtBig(x.lai)}</span></div>`;
  el.innerHTML =
    (j.bang.length
      ? `<div class="sec">Top ${j.bang.length} trên ${j.tong} tiệm</div>${j.bang.map(dong).join("")}`
      : '<p class="note" style="text-align:center">Chưa có tiệm nào trên bảng. Tiệm bạn có thể là tiệm đầu tiên!</p>') +
    (j.minh && !j.bang.some((x) => x.minh) ? `<div class="sec">Tiệm bạn</div>${dong({ hang: j.minh.hang, ten: shopName(), lai: j.minh.lai, ngay: j.minh.ngay, sao: rating().toFixed(1), minh: true })}` : "");
  if (j.minh) S.bxhHang = j.minh.hang;
  const sw = $("sw-hem");
  sw && sw._fit && sw._fit();
}
/* mở tab Hẻm 42 là vẽ cả các mục con: bảng tải về giữ 1 phút, mở lại trong 1 phút thì khỏi gọi máy chủ */
function bxhGan() {
  if (!$("bxhDs")) return;
  if ($("bxhVao")) $("bxhVao").onclick = bxhThamGia;
  if ($("bxhRoi")) $("bxhRoi").onclick = bxhRoi;
  if (R.bxh && Date.now() - R.bxh.luc < 60000 && R.bxh.khoa === bxhKhoa()) return bxhVe(R.bxh.j);
  bxhGoi("/bang", { khoa: bxhKhoa() || undefined, n: 50 })
    .then((j) => {
      R.bxh = { j, luc: Date.now(), khoa: bxhKhoa() };
      bxhVe(j);
    })
    .catch(() => bxhVe(null));
}
HEM_TAB.push([() => "🌏 Bảng chung", paneBangChung]);

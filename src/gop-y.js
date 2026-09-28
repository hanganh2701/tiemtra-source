/* ---------- GÓP Ý CHO ĐỢT CHƠI THỬ ----------
   Game không có máy chủ: người chơi trả lời vài câu, game ghép thành một đoạn chữ kèm tóm tắt tiến trình
   (không có tên tiệm hay thông tin cá nhân). Người chơi tự chép hoặc chia sẻ qua Zalo, Messenger. Nạp trước game.js. */

const GOP_Y_HOI = [
  { id: "ai", chu: "Bạn là", chon: ["Học sinh", "Sinh viên", "Đi làm", "Khác"] },
  { id: "thich", chu: "Bạn thích nhất điều gì?", viet: true },
  { id: "buc", chu: "Chỗ nào khó hiểu hay làm bạn bực?", viet: true },
  { id: "nho", chu: "Nhân vật có nhắc lại lựa chọn cũ của bạn không?", chon: ["Có, tôi để ý", "Hình như có", "Không thấy"] },
  { id: "lai", chu: "Bạn có muốn chơi lại để thử đường khác?", chon: ["Có", "Có thể", "Không"] },
  { id: "diem", chu: "Chấm điểm game", chon: ["1", "2", "3", "4", "5"] },
];

/* tóm tắt tiến trình kèm theo góp ý: không có tên tiệm, không có mã định danh */
function tomTatTienTrinh() {
  const T = TT(),
    nr = NGA_RE.map((r) => `${r.ten}: ${T.nhanh[r.id] ? r.nhanh[T.nhanh[r.id]] : "chưa tới"}`).join("; "),
    may = /Mobi|Android|iPhone|iPad/.test(navigator.userAgent) ? "điện thoại" : "máy tính";
  return [
    `Bản ${GAME_VERSION} · ngày ${S.day} · chương ${chuongNay()} · ${T.trang.length}/12 trang · ${Object.keys(S.huyHieu || {}).length} huy hiệu`,
    `Ngã rẽ: ${nr}`,
    `Kết đã thấy: ${soKetDaThay()}/${KET_CUC.length} · lượt chơi ${T.luot || 1}`,
    `Cách chơi: truyện ${CHE_DO_TEN[cheDo()]}, Thư giãn ${S.thuGian ? "bật" : "tắt"}, ${may}${typeof dangChayApp === "function" && dangChayApp() ? ", đã cài lên màn hình chính" : ""}`,
  ];
}
function chuGopY() {
  const d = S.gopY || {};
  return [
    "Góp ý Tiệm Trà Nhỏ",
    ...tomTatTienTrinh().map((x) => "· " + x),
    ...GOP_Y_HOI.map((h) => `- ${h.chu.replace(/\?$/, "")}: ${d[h.id] ? d[h.id] : "(bỏ trống)"}`),
  ].join("\n");
}
function moGopY() {
  S.gopY = S.gopY || {};
  const d = S.gopY,
    hoi = GOP_Y_HOI.map(
      (h) =>
        `<div class="gyq"><b>${esc(h.chu)}</b>${
          h.viet
            ? `<textarea class="rpin gyv" data-gy="${h.id}" maxlength="400">${esc(d[h.id] || "")}</textarea>`
            : `<div class="gyc">${h.chon.map((c) => `<button class="chip${d[h.id] === c ? " on" : ""}" data-gyc="${h.id}" data-v="${esc(c)}">${esc(c)}</button>`).join("")}</div>`
        }</div>`,
    ).join("");
  $("card").onchange = null;
  $("card").innerHTML = `<h2>Góp ý cho tiệm</h2><p class="note">Không có gì tự gửi đi. Trả lời xong bấm Chia sẻ hoặc Chép, rồi gửi cho người rủ bạn chơi qua Zalo, Messenger. Góp ý không kèm tên tiệm hay thông tin cá nhân.</p>${hoi}<details class="gytt"><summary>Kèm theo tóm tắt tiến trình</summary><pre>${esc(
    tomTatTienTrinh().join("\n"),
  )}</pre></details><div class="askbtns"><button class="big" id="gyShare">Chia sẻ góp ý</button><button class="sbtn ghost" id="gyCopy">Chép góp ý</button><button class="sbtn ghost" id="gyClose">Đóng</button></div>`;
  $("modal").hidden = false;
  const card = $("card");
  card.querySelectorAll("[data-gyc]").forEach(
    (b) =>
      (b.onclick = () => {
        d[b.dataset.gyc] = b.dataset.v;
        card.querySelectorAll(`[data-gyc="${b.dataset.gyc}"]`).forEach((x) => x.classList.toggle("on", x === b));
        save();
      }),
  );
  card.querySelectorAll("[data-gy]").forEach((t) => (t.oninput = () => (d[t.dataset.gy] = t.value.slice(0, 400))));
  const xong = () => {
    save();
    if (typeof track === "function") track("gop-y");
  };
  $("gyShare").onclick = () => {
    xong();
    chiaSe(chuGopY(), "Góp ý Tiệm Trà Nhỏ");
  };
  $("gyCopy").onclick = async () => {
    xong();
    try {
      await navigator.clipboard.writeText(chuGopY());
      toast("Đã chép góp ý, dán vào Zalo hoặc Messenger nhé");
    } catch (e) {
      /* máy không cho chép tự động: hiện đoạn chữ để người chơi tự chọn và chép */
      card.querySelector(".gytt").open = true;
      card.querySelector(".gytt pre").textContent = chuGopY();
      toast("Nhấn giữ đoạn chữ bên dưới để chép", 3500);
    }
  };
  $("gyClose").onclick = () => {
    save();
    $("modal").hidden = true;
  };
}
/* đầu ngày (prepChecks): đi hết truyện thì mời góp ý một lần; trả true nếu đang hỏi */
function moiGopY() {
  if (S.gopYMoi || R.challenge || !TT().ket) return false;
  S.gopYMoi = S.day;
  save();
  ask(
    `<div class="pbig">💌</div><h2>Bạn vừa đi hết Hẻm 42</h2><p>Trả lời vài câu góp ý giúp tiệm nha? Mất chừng một phút, không có gì tự gửi đi.</p>`,
    [
      ["Để sau", () => {}],
      ["Góp ý", () => setTimeout(moGopY, 50), 1],
    ],
  );
  return true;
}

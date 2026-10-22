/* didate: vẽ tấm thiệp từ dữ liệu, dùng ở trang thiệp (/<id>) và khung xem thử lúc soạn.
   Chữ người dùng chỉ đi vào textContent, không bao giờ vào innerHTML. Không dùng thuộc tính style (CSP chặn),
   chỗ nào cần vị trí thì đặt qua el.style.

   veThiep(goc, t, tuy) với tuy:
     anh          link ảnh hoặc null
     xemThu       không gửi gì lên máy chủ (người tạo bấm thử, khung soạn thiệp, thiệp mẫu)
     manDau       màn bắt đầu: "mo" | "hoi" | "chon" | "ket" | "tu-choi" (mặc định: "mo" nếu có phong thư/hộp quà)
     guiTraLoi    async (traLoi) => …, ném lỗi khi không gửi được
     banner       nút DOM đặt trên cùng (vd "đây là thiệp của bạn")
     giuTapTrung  true thì không chuyển tiêu điểm khi đổi màn (khung soạn, đang gõ bên trái)
     homNay       "YYYY-MM-DD" (test)
   Trả về { den(man), the }. */
import { bienXung, tachCho, ngayDep, homNayVN, thuCua, laGio, SO_CAU_NE, MOI_CAU_NE } from "./chung.js?v=6";

export function h(ten, tt = {}, ...con) {
  const el = document.createElement(ten);
  for (const [k, v] of Object.entries(tt)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  el.append(...con.flat(Infinity).filter((c) => c != null && c !== false && c !== ""));
  return el;
}

const pad = (n) => String(n).padStart(2, "0");
const giamChuyenDong = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const khungHinh = (f) => (typeof requestAnimationFrame === "function" ? requestAnimationFrame(f) : setTimeout(f, 0));
const noiDs = (ds) => (ds.length < 2 ? ds.join("") : `${ds.slice(0, -1).join(", ")} và ${ds.at(-1)}`);

const TRANG_TRI = {
  an: ["💗", "💕", "✨", "🍡"],
  "to-tinh": ["💗", "💘", "💖", "✨"],
  "xin-loi": ["🌷", "💗", "🍀", "✨"],
  "sinh-nhat": ["🎈", "🎉", "✨", "🎂"],
};

/* lịch hẹn dạng file .ics (giờ Việt Nam không đổi mùa: UTC+7) */
export function lichIcs(t, tl, id = "thu") {
  const ngay = tl.ngay.replace(/-/g, "");
  const thoat = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  let bd;
  if (tl.gio) {
    const [y, m, d] = tl.ngay.split("-").map(Number);
    const [gh, gp] = tl.gio.split(":").map(Number);
    bd = `DTSTART:${new Date(Date.UTC(y, m - 1, d, gh - 7, gp)).toISOString().replace(/[-:]/g, "").slice(0, 15)}Z\r\nDURATION:PT2H`;
  } else bd = `DTSTART;VALUE=DATE:${ngay}\r\nDURATION:P1D`;
  const bayGio = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//didate//VI",
    "BEGIN:VEVENT",
    `UID:${id}-${ngay}@didate.meomeo.app`,
    `DTSTAMP:${bayGio}`,
    bd,
    `SUMMARY:${thoat(`Hẹn với ${t.gui} 💖${tl.chon ? ` · ${tl.chon}` : ""}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function veThiep(goc, t, tuy = {}) {
  const v = bienXung(t);
  const homNay = tuy.homNay || homNayVN();
  const st = { man: null, soLanNe: 0, ngay: "", gio: "", gioKhac: false, chon: "", khac: false, traLoi: null, lucNe: 0 };
  const coBuocChon = t.hoiNgay || t.hoiGio || t.chonBat;

  goc.replaceChildren();
  goc.classList.add("t-trang");
  goc.dataset.mau = t.mauSac;

  const bay = TRANG_TRI[t.mau] || TRANG_TRI.an;
  const tim = h("div", { class: "t-tim-bay", "aria-hidden": "true" }, Array.from({ length: 10 }, (_, i) => h("span", { class: "t-tim" }, bay[i % bay.length])));
  const the = h("div", { class: "t-the" });
  goc.append(...[tim, tuy.banner, the].filter(Boolean));

  /* ----- màn mở: phong thư hoặc hộp quà ----- */
  const laQua = t.moDau === "qua";
  const nutMo = h(
    "button",
    { type: "button", class: laQua ? "t-hop" : "t-phong-thu", "aria-label": laQua ? "Mở hộp quà" : "Mở thư", onclick: () => moRa() },
    laQua
      ? [h("span", { class: "t-hop-nap" }), h("span", { class: "t-hop-than" }), h("span", { class: "t-hop-no", "aria-hidden": "true" }, "🎀")]
      : [h("span", { class: "t-thu-giay" }, "💌"), h("span", { class: "t-thu-than" }), h("span", { class: "t-thu-nap" }), h("span", { class: "t-thu-tim", "aria-hidden": "true" }, "💗")],
  );
  const manMo = h(
    "section",
    { class: "t-man t-man-mo" },
    h("h1", { class: "t-nhan-dan", tabindex: "-1" }, laQua ? `Có quà cho ${v.nhan} nè 🎁` : `Gửi ${v.nhan} 💌`),
    nutMo,
    h("p", { class: "t-goi-y" }, laQua ? "Chạm vào hộp quà để mở" : "Chạm vào phong thư để mở"),
  );
  function moRa() {
    if (nutMo.disabled) return;
    nutMo.disabled = true;
    nutMo.classList.add("t-dang-mo");
    setTimeout(() => den("hoi"), giamChuyenDong() || tuy.xemThu ? 350 : 900);
  }

  /* ----- màn hỏi ----- */
  const nutCo = h("button", { type: "button", class: "t-nut t-nut-co", onclick: () => dongY() }, t.nutCo);
  const nutKhong = t.nutKhong ? h("button", { type: "button", class: "t-nut t-nut-khong" }, t.nutKhong) : null;
  const goiY = h("p", { class: "t-goi-y", "aria-live": "polite" }, t.ne && nutKhong ? "Nút còn lại hơi khó bấm một xíu nha 😌" : "");
  const anh = tuy.anh
    ? h(
        "figure",
        { class: "t-polaroid" },
        h("img", { src: tuy.anh, alt: `Ảnh ${t.gui} gửi ${t.nhan}`, decoding: "async", onerror: (e) => e.target.parentElement.remove() }),
      )
    : null;
  const manHoi = h(
    "section",
    { class: "t-man t-man-hoi" },
    t.nhanDan && h("p", { class: "t-nhan-dan" }, t.nhanDan),
    h("h1", { class: "t-tieu-de", tabindex: "-1" }, t.tieuDe || t.cauHoi),
    t.loiDau && h("p", { class: "t-loi" }, t.loiDau),
    anh,
    t.tieuDe && h("h2", { class: "t-cau-hoi" }, t.cauHoi),
    h("div", { class: "t-hai-nut" }, nutCo, nutKhong),
    goiY,
  );

  /* nút Không né: chuột lướt tới hay ngón tay chạm vào là chạy chỗ khác; né đủ 9 lần thì trốn luôn */
  function ne(e) {
    e?.preventDefault?.();
    st.lucNe = Date.now();
    st.soLanNe++;
    diChuyen();
    /* to dần nhưng không vượt mép thiệp: tính từ tâm nút (nút có thể nằm lệch tâm thiệp) */
    const r = nutCo.getBoundingClientRect();
    const k = the.getBoundingClientRect();
    const tam = r.left + r.width / 2;
    const toiDa = nutCo.offsetWidth ? Math.max(1, Math.min(tam - k.left - 8, k.right - 8 - tam) / (nutCo.offsetWidth / 2)) : 2;
    nutCo.style.transform = `scale(${Math.min(1 + Math.min(st.soLanNe, 8) * 0.06, toiDa).toFixed(3)})`;
    if (st.soLanNe % MOI_CAU_NE === 0) {
      const cau = t.cauNe[st.soLanNe / MOI_CAU_NE - 1];
      if (cau) goiY.textContent = cau;
    }
    if (st.soLanNe >= SO_CAU_NE * MOI_CAU_NE) {
      nutKhong.classList.add("t-tron");
      nutCo.classList.add("t-nhay");
      setTimeout(() => (nutKhong.hidden = true), 300);
    }
  }
  function diChuyen() {
    const k = the.getBoundingClientRect();
    const n = nutKhong.getBoundingClientRect();
    const c = nutCo.getBoundingClientRect();
    if (!nutKhong.classList.contains("t-dang-ne")) {
      /* giữ chỗ cũ của nút: trang không ngắn lại, nút Có không trượt vào chỗ ngón tay vừa chạm */
      const cho = h("span", { class: "t-cho-nut", "aria-hidden": "true" });
      cho.style.width = `${n.width}px`;
      cho.style.height = `${n.height}px`;
      nutKhong.after(cho);
      nutKhong.style.left = `${n.left - k.left}px`;
      nutKhong.style.top = `${n.top - k.top}px`;
      nutKhong.classList.add("t-dang-ne");
    }
    /* chỉ chạy trong phần thiệp đang thấy trên màn hình */
    const caoMH = typeof innerHeight === "number" && innerHeight > 0 ? innerHeight : k.bottom;
    const y0 = Math.max(0, -k.top) + 8;
    const y1 = Math.min(k.height, caoMH - k.top) - n.height - 8;
    const x1 = k.width - n.width - 8;
    let x = 8;
    let y = y0;
    for (let i = 0; i < 16; i++) {
      x = 8 + Math.random() * Math.max(0, x1 - 8);
      y = y0 + Math.random() * Math.max(0, y1 - y0);
      const trung = x < c.right - k.left + 12 && x + n.width > c.left - k.left - 12 && y < c.bottom - k.top + 12 && y + n.height > c.top - k.top - 12;
      if (!trung && Math.hypot(x - (n.left - k.left), y - (n.top - k.top)) > 70) break;
    }
    khungHinh(() => {
      nutKhong.style.left = `${Math.round(x)}px`;
      nutKhong.style.top = `${Math.round(y)}px`;
    });
  }
  if (nutKhong) {
    nutKhong.addEventListener("pointerenter", (e) => {
      if (t.ne && e.pointerType === "mouse") ne(e);
    });
    nutKhong.addEventListener("pointerdown", (e) => {
      if (t.ne && e.pointerType !== "touch") ne(e); // chuột, bút
    });
    /* ngón tay: chặn ngay từ touchstart. Không chặn thì Safari trên iPhone bắn một cú click giả vào chỗ vừa chạm
       sau khi nhấc tay, lúc đó nút đã chạy đi và cú click rơi vào nút Có */
    nutKhong.addEventListener(
      "touchstart",
      (e) => {
        if (t.ne) ne(e);
      },
      { passive: false },
    );
    nutKhong.addEventListener("click", (e) => {
      if (!t.ne) return xong(false);
      if (Date.now() - st.lucNe < 700) return e.preventDefault();
      ne(e); // bấm bằng bàn phím
    });
  }

  function dongY() {
    if (Date.now() - st.lucNe < 700) return; // cú chạm vừa làm nút Không né đi, không phải bấm Có
    if (coBuocChon) den("chon");
    else xong(true);
  }

  /* ----- màn chọn ngày, giờ, món ----- */
  const loiChon = h("p", { class: "t-loi-chon", role: "alert" });
  const daChonNgay = h("p", { class: "t-da-chon", "aria-live": "polite" });
  const manChon = h(
    "section",
    { class: "t-man t-man-chon" },
    h("p", { class: "t-nhan-dan" }, "Chốt kèo thôi ✨"),
    h("h1", { class: "t-tieu-de", tabindex: "-1" }, `${v.Ban} chọn giúp ${v.toi} nha 💕`),
    t.hoiNgay && khoi("Ngày nào?", lich(), daChonNgay),
    t.hoiGio && khoi("Mấy giờ?", chonGio()),
    t.chonBat && khoi(t.chonTieuDe || "Chọn một nha", chonMon()),
    loiChon,
    h("button", { type: "button", class: "t-nut t-nut-co t-nut-rong", onclick: () => chot() }, "Chốt luôn 💗"),
  );
  function khoi(tieuDe, ...noi) {
    const id = `t-k-${Math.random().toString(36).slice(2, 8)}`;
    return h("div", { class: "t-khoi", role: "group", "aria-labelledby": id }, h("h2", { id }, tieuDe), ...noi);
  }

  function lich() {
    const [y0, m0] = homNay.split("-").map(Number);
    let y = y0;
    let m = m0;
    const thang = h("p", { class: "t-lich-thang", "aria-live": "polite" });
    const truoc = h("button", { type: "button", class: "t-lich-nut", "aria-label": "Tháng trước", onclick: () => lui(-1) }, "‹");
    const sau = h("button", { type: "button", class: "t-lich-nut", "aria-label": "Tháng sau", onclick: () => lui(1) }, "›");
    const luoi = h("div", { class: "t-lich-luoi" });
    function lui(n) {
      m += n;
      if (m < 1) [m, y] = [12, y - 1];
      if (m > 12) [m, y] = [1, y + 1];
      ve();
    }
    function ve() {
      const dangTrong = luoi.contains(document.activeElement);
      thang.textContent = `Tháng ${m}, ${y}`;
      truoc.disabled = y === y0 && m === m0;
      sau.disabled = (y - y0) * 12 + (m - m0) >= 12;
      luoi.replaceChildren(...["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((x) => h("span", { class: "t-lich-thu", "aria-hidden": "true" }, x)));
      const lech = (thuCua(`${y}-${pad(m)}-01`) + 6) % 7;
      for (let i = 0; i < lech; i++) luoi.append(h("span"));
      const soNgay = new Date(Date.UTC(y, m, 0)).getUTCDate();
      for (let d = 1; d <= soNgay; d++) {
        const iso = `${y}-${pad(m)}-${pad(d)}`;
        luoi.append(
          h(
            "button",
            {
              type: "button",
              class: iso === homNay ? "t-ngay t-hom-nay" : "t-ngay",
              disabled: iso < homNay,
              "aria-pressed": String(iso === st.ngay),
              "aria-label": `${ngayDep(iso, homNay)}${iso === homNay ? " (hôm nay)" : ""}`,
              "data-ngay": iso,
              onclick: () => {
                st.ngay = iso;
                daChonNgay.textContent = `Đã chọn: ${ngayDep(iso, homNay)}`;
                ve();
              },
            },
            String(d),
          ),
        );
      }
      if (dangTrong) (luoi.querySelector('[aria-pressed="true"]') || luoi.querySelector("button:not(:disabled)"))?.focus();
    }
    ve();
    return h("div", { class: "t-lich" }, h("div", { class: "t-lich-dau" }, truoc, thang, sau), luoi);
  }

  function chonGio() {
    const o = h("input", { type: "time", class: "t-o t-o-gio", "aria-label": "Giờ khác", hidden: t.gioGoiY.length > 0 });
    o.addEventListener("input", () => {
      st.gio = o.value;
    });
    const nhom = h("div", { class: "t-chip-nhom" });
    const ve = () => {
      for (const b of nhom.querySelectorAll("[data-gio]")) b.setAttribute("aria-pressed", String(!st.gioKhac && b.dataset.gio === st.gio));
      nhom.querySelector("[data-khac]")?.setAttribute("aria-pressed", String(st.gioKhac));
    };
    for (const g of t.gioGoiY) {
      nhom.append(
        h(
          "button",
          {
            type: "button",
            class: "t-chip",
            "data-gio": g,
            "aria-pressed": "false",
            onclick: () => {
              Object.assign(st, { gio: g, gioKhac: false });
              o.hidden = true;
              ve();
            },
          },
          g,
        ),
      );
    }
    if (t.gioGoiY.length) {
      nhom.append(
        h(
          "button",
          {
            type: "button",
            class: "t-chip",
            "data-khac": "1",
            "aria-pressed": "false",
            onclick: () => {
              Object.assign(st, { gio: o.value, gioKhac: true });
              o.hidden = false;
              o.focus();
              ve();
            },
          },
          "Giờ khác",
        ),
      );
    } else st.gioKhac = true;
    return h("div", {}, nhom, o);
  }

  function chonMon() {
    const ds = h("div", { class: "t-mon-ds" });
    const o = h("input", { type: "text", class: "t-o", maxlength: "60", placeholder: `${v.Ban} viết vào đây nha…`, "aria-label": "Ý khác", hidden: true });
    o.addEventListener("input", () => {
      st.chon = o.value.trim();
    });
    const ve = () => ds.querySelectorAll(".t-mon").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.khac ? st.khac : !st.khac && b.dataset.ten === st.chon)));
    const the1 = (bieu, ten, moTa, tt) => h("button", { type: "button", class: "t-mon", "aria-pressed": "false", ...tt }, bieu && h("span", { class: "t-mon-bieu", "aria-hidden": "true" }, bieu), h("span", { class: "t-mon-chu" }, h("b", {}, ten), moTa && h("small", {}, moTa)));
    for (const m of t.chonDs) {
      ds.append(
        the1(m.bieu, m.ten, m.moTa, {
          "data-ten": m.ten,
          onclick: () => {
            Object.assign(st, { chon: m.ten, khac: false });
            o.hidden = true;
            ve();
          },
        }),
      );
    }
    if (t.chonKhac) {
      ds.append(
        the1("✍️", "Ý khác", `${v.Ban} tự viết nha`, {
          "data-khac": "1",
          onclick: () => {
            Object.assign(st, { chon: o.value.trim(), khac: true });
            o.hidden = false;
            o.focus();
            ve();
          },
        }),
      );
    }
    return h("div", {}, ds, o);
  }

  function chot() {
    const thieu = [];
    if (t.hoiNgay && !st.ngay) thieu.push("ngày");
    if (t.hoiGio && !laGio(st.gio)) thieu.push("giờ");
    if (t.chonBat && !st.chon) thieu.push(st.khac ? "ý của mình" : "một lựa chọn");
    if (thieu.length) {
      loiChon.textContent = `${v.Ban} chọn giúp ${v.toi} ${noiDs(thieu)} nha 💕`;
      return;
    }
    loiChon.textContent = "";
    xong(true);
  }

  /* ----- màn kết, màn từ chối ----- */
  const ketLoi = h("p", { class: "t-loi" });
  const tomTat = h("dl", { class: "t-tom-tat" });
  const ttKet = h("p", { class: "t-trang-thai", "aria-live": "polite" });
  const ttTuChoi = h("p", { class: "t-trang-thai", "aria-live": "polite" });
  const nutLich = h("button", { type: "button", class: "t-nut t-nut-phu", hidden: true, onclick: () => taiLich() }, "📅 Thêm vào lịch");
  const manKet = h(
    "section",
    { class: "t-man t-man-ket" },
    h("p", { class: "t-nhan-dan" }, "Yayyy 💖"),
    h("h1", { class: "t-tieu-de", tabindex: "-1" }, t.ketTieuDe || "Được rồi nhaaa ✨"),
    ketLoi,
    tomTat,
    t.ketCuoi && h("p", { class: "t-loi t-loi-cuoi" }, t.ketCuoi),
    nutLich,
    oLoiNhan(),
    ttKet,
  );
  const manTuChoi = h(
    "section",
    { class: "t-man t-man-tu-choi" },
    h("h1", { class: "t-tieu-de", tabindex: "-1" }, t.tuChoiTieuDe || "Không sao đâu 🥹"),
    t.tuChoiLoi && h("p", { class: "t-loi" }, t.tuChoiLoi),
    oLoiNhan(),
    ttTuChoi,
    h("button", { type: "button", class: "t-nut t-nut-phu", onclick: () => den("hoi") }, "Ơ, nghĩ lại rồi 🙈"),
  );

  function oLoiNhan() {
    const o = h("textarea", { class: "t-o", rows: "3", maxlength: "500", placeholder: `Nhắn gì cho ${t.gui} nè…` });
    const nut = h(
      "button",
      {
        type: "button",
        class: "t-nut t-nut-phu",
        onclick: async () => {
          const s = o.value.trim();
          if (!s) return o.focus();
          nut.disabled = true;
          if (await gui({ loiNhan: s })) nut.textContent = "Gửi lại 💌";
          nut.disabled = false;
        },
      },
      "Gửi lời nhắn 💌",
    );
    return h("div", { class: "t-loi-nhan" }, h("label", {}, h("span", {}, `Nhắn lại cho ${t.gui}`), o), nut);
  }

  function veKet() {
    const tl = st.traLoi;
    const gt = { ngay: tl.ngay && ngayDep(tl.ngay, homNay), gio: tl.gio, chon: tl.chon, gui: t.gui, nhan: t.nhan };
    ketLoi.replaceChildren(...tachCho(t.ketLoi, gt).map((p) => (p.gt ? h("b", {}, p.chu) : p.chu)));
    const dong = [t.hoiNgay && ["Ngày", gt.ngay], t.hoiGio && ["Giờ", gt.gio], t.chonBat && ["Lựa chọn", gt.chon]].filter(Boolean);
    tomTat.replaceChildren(...dong.map(([k, x]) => h("div", {}, h("dt", {}, k), h("dd", {}, x))));
    tomTat.hidden = !dong.length;
    nutLich.hidden = !tl.ngay;
  }

  function taiLich() {
    const tep = new Blob([lichIcs(t, st.traLoi, tuy.id)], { type: "text/calendar" });
    const a = h("a", { href: URL.createObjectURL(tep), download: "hen-didate.ics" });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  function xong(dy) {
    st.traLoi = { dongY: dy, soLanNe: st.soLanNe };
    if (dy) {
      if (t.hoiNgay) st.traLoi.ngay = st.ngay;
      if (t.hoiGio) st.traLoi.gio = st.gio;
      if (t.chonBat) st.traLoi.chon = st.chon;
      veKet();
      den("ket");
      phaoHoa();
    } else den("tu-choi");
    gui();
  }

  async function gui(them = {}) {
    Object.assign(st.traLoi, them);
    const tt = st.man === "tu-choi" ? ttTuChoi : ttKet;
    if (tuy.xemThu || !tuy.guiTraLoi) {
      tt.textContent = tuy.xemThu ? "Bản xem thử: câu trả lời không được gửi đi đâu." : "";
      return true;
    }
    tt.textContent = "Đang gửi…";
    try {
      await tuy.guiTraLoi({ ...st.traLoi });
      tt.textContent = them.loiNhan ? `Đã gửi lời nhắn cho ${t.gui} 💌` : `Đã báo cho ${t.gui} rồi nha 💌`;
      return true;
    } catch (e) {
      tt.replaceChildren(`Chưa gửi được cho ${t.gui}: ${e?.message || "mất mạng"}. `, h("button", { type: "button", class: "t-lien-ket", onclick: () => gui(them) }, "Thử lại"));
      return false;
    }
  }

  function phaoHoa() {
    if (giamChuyenDong() || tuy.giuTapTrung) return;
    const p = h("div", { class: "t-phao-hoa", "aria-hidden": "true" }, Array.from({ length: 18 }, (_, i) => h("span", {}, ["💖", "✨", "🎉", "💗", "🌸", "⭐"][i % 6])));
    goc.append(p);
    setTimeout(() => p.remove(), 2600);
  }

  const cacMan = { mo: manMo, hoi: manHoi, chon: manChon, ket: manKet, "tu-choi": manTuChoi };
  the.append(...Object.values(cacMan));

  function den(man) {
    if (man === "ket" && !st.traLoi) {
      /* khung soạn xem thẳng màn kết: dùng lựa chọn đầu tiên làm ví dụ */
      st.traLoi = { dongY: true, soLanNe: 0, ngay: t.hoiNgay ? homNay : undefined, gio: t.hoiGio ? t.gioGoiY[0] || "19:00" : undefined, chon: t.chonBat ? t.chonDs[0]?.ten || "Ý khác" : undefined };
      veKet();
    }
    st.man = man;
    for (const [k, el] of Object.entries(cacMan)) el.hidden = k !== man;
    if (!tuy.giuTapTrung) {
      cacMan[man].querySelector('[tabindex="-1"]')?.focus({ preventScroll: true });
      if (typeof scrollTo === "function") scrollTo(0, 0);
    }
  }
  den(tuy.manDau || (t.moDau !== "khong" ? "mo" : "hoi"));
  return { den, the };
}

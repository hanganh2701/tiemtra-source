/* Phần chạy trên trang của snaptik: tìm bài, vẽ kết quả, nút tải, tải ZIP ảnh, ghép ảnh thành video, lịch sử, cài ứng dụng */
import { soGon, coFile, thoiGian, ngayDang, linkTai, timLinkTrongChu, taoZip } from "./cong-cu.js";
import { ganMeo, meo } from "./meo.js";

/* chữ theo tiếng của trang (<html lang>): public/chu/<tiếng>.js, sinh từ dich/<tiếng>.js */
const NN = document.documentElement.lang || "vi";
const CHU = (await import(`./chu/${NN}.js`).catch(() => import("./chu/vi.js"))).default;
/* chữ đã thay số: c("dangTaiAnh", { i: 2, n: 5 }) */
const c = (khoa, so = {}) => String(CHU[khoa] ?? khoa).replace(/\{(\w+)\}/g, (_, k) => so[k] ?? "");

const $ = (s) => document.querySelector(s);
const CHE_DO = document.body.dataset.cheDo || "video";
const KHOA_LICH_SU = "meotai-lich-su";

function el(the, thuoc = {}, ...con) {
  const e = document.createElement(the);
  for (const [k, v] of Object.entries(thuoc)) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const c of con.flat()) if (c != null && c !== false && c !== "") e.append(c);
  return e;
}

function luuBlob(blob, ten) {
  const u = URL.createObjectURL(blob);
  const a = el("a", { href: u, download: ten });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 60000);
}
const tenTuDau = (r) => (r.headers.get("Content-Disposition") || "").match(/filename="([^"]+)"/)?.[1] || "";
const tenGon = (j) => `tiktok_${j.tacGia.ten ? j.tacGia.ten + "_" : ""}${j.id}`;

/* ---------- ô tìm ---------- */
const form = $("#o-tim"),
  o = $("#link"),
  nutDan = $("#nut-dan"),
  nutTim = $("#nut-tim"),
  hopLoi = $("#loi"),
  ketQua = $("#ket-qua");

/* ẩn thẻ kết quả; video xem trước đang phát thì dừng (ẩn đi nó vẫn phát tiếng) */
function anKetQua() {
  ketQua.querySelector("video")?.pause();
  ketQua.hidden = true;
}
function baoLoi(chu) {
  if (!hopLoi) return;
  hopLoi.textContent = chu;
  hopLoi.hidden = !chu;
  if (!chu) return;
  meo("buon");
  anKetQua(); /* thẻ của bài trước còn đó thì dễ tưởng bài vừa dán vẫn tải được */
}
function dangTim(co) {
  nutTim.disabled = co;
  nutTim.classList.toggle("dang-chay", co);
  nutTim.textContent = co ? c("dangTim") : c("tai");
  if (co) meo("tim");
}
const capNhatNutDan = () => (nutDan.textContent = o.value ? c("xoa") : c("dan"));

async function tim(chu) {
  const link = timLinkTrongChu(chu) || String(chu || "").trim();
  if (!link) return baoLoi(c("chuaDan"));
  if (!/tiktok\.com|^\d{15,22}$/i.test(link)) return baoLoi(c("khongPhaiLink"));
  o.value = link;
  capNhatNutDan();
  baoLoi("");
  dangTim(true);
  try {
    const r = await fetch("/api/thong-tin?url=" + encodeURIComponent(link) + "&hl=" + NN); /* hl: câu báo lỗi theo tiếng của trang */
    const j = await r.json().catch(() => null);
    if (!j) return baoLoi(c("mayChuBan"));
    if (!j.ok) return baoLoi(j.loi || c("khongLayDuoc"));
    ve(j);
    meo("vui");
    ghiLichSu(j);
  } catch {
    baoLoi(c("khongKetNoi"));
  } finally {
    dangTim(false);
  }
}

/* ---------- kết quả ---------- */
const moTaBan = (b) => [Math.min(b.w, b.h) ? Math.min(b.w, b.h) + "p" : "", b.codec === "h265" ? "H.265" : "", coFile(b.co, NN)].filter(Boolean).join(" · ");

function nutTai(href, chu, phu, chinh) {
  return el("a", { class: "nut" + (chinh ? " nut-chinh" : ""), href, download: "" }, el("span", { class: "bieu-tuong tai" }), el("span", {}, chu, phu ? el("small", {}, phu) : null));
}

function ve(j) {
  const b = j.ban;
  const tienDo = el("p", { class: "tien-do", "aria-live": "polite" });

  /* ảnh bìa và xem trước */
  const hinh = el(
    "div",
    { class: "the-hinh" },
    j.bia ? el("img", { class: "bia", src: j.bia, alt: c("anhBia"), referrerpolicy: "no-referrer" }) : el("div", { class: "bia trong" }),
    j.loai === "video" && j.thoiLuong ? el("span", { class: "nhan-gio" }, thoiGian(j.thoiLuong)) : null,
    j.loai === "anh" ? el("span", { class: "nhan-gio" }, c("soAnh", { n: j.anh.length })) : null,
  );
  if (j.loai === "video" && b.video) {
    const nutXem = el("button", { type: "button", class: "nut-xem", "aria-label": c("xemTruoc") }, el("span", { class: "bieu-tuong phat" }));
    nutXem.addEventListener("click", () => {
      hinh.parentElement?.classList.add("dang-xem"); /* điện thoại: thẻ chuyển một cột, video lên đầu */
      hinh.replaceChildren(el("video", { class: "bia", src: linkTai(j.id, "video", 0, true), controls: true, autoplay: true, playsinline: true }));
    });
    hinh.append(nutXem);
  }

  /* chủ bài, mô tả, số liệu */
  const tacGia = el(
    "div",
    { class: "tac-gia" },
    j.tacGia.anh ? el("img", { src: j.tacGia.anh, alt: "", referrerpolicy: "no-referrer", width: 44, height: 44 }) : el("span", { class: "anh-trong" }),
    el("div", {}, el("b", {}, j.tacGia.tenHienThi || j.tacGia.ten || c("nguoiDung")), el("span", {}, (j.tacGia.ten ? "@" + j.tacGia.ten : "") + (j.luc ? " · " + ngayDang(j.luc, NN) : ""))),
  );
  const moTa = el("p", { class: "mo-ta" }, j.moTa || c("khongMoTa"));
  const nutChep = j.moTa
    ? el("button", { type: "button", class: "nut-chu" }, c("chepMoTa"))
    : null;
  nutChep?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(j.moTa);
      nutChep.textContent = c("daChep");
    } catch {
      nutChep.textContent = c("khongChep");
    }
    setTimeout(() => (nutChep.textContent = c("chepMoTa")), 2000);
  });
  const soLieu = el(
    "ul",
    { class: "so-lieu" },
    [
      ["xem", c("luotXem")],
      ["thich", c("thich")],
      ["binhLuan", c("binhLuan")],
      ["chiaSe", c("chiaSe")],
    ]
      .filter(([k]) => j.soLieu[k] != null)
      .map(([k, chu]) => el("li", {}, el("b", {}, soGon(j.soLieu[k], NN)), " " + chu)),
  );
  /* tên nhạc gốc của TikTok thường đã kèm tên người đăng ("nhạc nền - Mèo Nhà"): khỏi ghi lại lần nữa */
  const tenNhac = j.nhac && (j.nhac.ten.includes(j.nhac.tacGia) ? j.nhac.ten : [j.nhac.ten, j.nhac.tacGia].filter(Boolean).join(" – "));
  const nhac = tenNhac ? el("p", { class: "nhac" }, el("span", { class: "bieu-tuong not-nhac" }), tenNhac) : null;

  /* nút tải: trang MP3 đưa nhạc lên đầu */
  const nut = [];
  if (b.video) nut.push(["video", linkTai(j.id, "video"), c("taiVideo"), moTaBan(b.video)]);
  if (b.hd) nut.push(["hd", linkTai(j.id, "hd"), c("taiHd"), moTaBan(b.hd)]);
  /* có bài TikTok để nhạc dạng M4A: máy chủ đọc định dạng thật (b.nhac); thông tin cũ trong bộ đệm chưa có thì ghi MP3 */
  if (b.mp3) nut.push(["mp3", linkTai(j.id, "mp3"), c("taiNhac", { dinhDang: b.nhac || "MP3" }), j.nhac?.thoiLuong ? thoiGian(j.nhac.thoiLuong) : ""]);
  if (CHE_DO === "mp3") nut.sort((a, c) => (c[0] === "mp3") - (a[0] === "mp3"));
  const cacNut = el(
    "div",
    { class: "cac-nut" },
    nut.map(([, href, chu, phu], i) => nutTai(href, chu, phu, i === 0 && j.loai !== "anh")),
  );

  let phanAnh = null;
  if (j.loai === "anh") {
    const nutZip = el("button", { type: "button", class: "nut nut-chinh" }, el("span", { class: "bieu-tuong tai" }), el("span", {}, c("taiCaAnh", { n: j.anh.length }), el("small", {}, c("tepZip"))));
    nutZip.addEventListener("click", () => taiZip(j, nutZip, tienDo));
    cacNut.prepend(nutZip);
    if (window.MediaRecorder && HTMLCanvasElement.prototype.captureStream) {
      const nutGhep = el("button", { type: "button", class: "nut" }, el("span", { class: "bieu-tuong phim" }), el("span", {}, c("ghepVideo"), el("small", {}, b.mp3 ? c("coNhac") : c("khongNhac"))));
      nutGhep.addEventListener("click", () => ghepVideo(j, nutGhep, tienDo));
      cacNut.append(nutGhep);
    }
    phanAnh = el(
      "div",
      { class: "luoi-anh" },
      j.anh.map((a, i) =>
        el(
          "figure",
          {},
          el("img", { src: a.xem, alt: c("anhThu", { i: i + 1 }), loading: "lazy", referrerpolicy: "no-referrer" }),
          el("a", { class: "nut nut-nho", href: linkTai(j.id, "anh", i), download: "" }, el("span", { class: "bieu-tuong tai" }), c("anhThu", { i: i + 1 })),
        ),
      ),
    );
  }
  if (b.bia) cacNut.append(el("a", { class: "nut nut-phu", href: linkTai(j.id, "bia"), download: "" }, el("span", { class: "bieu-tuong anh" }), el("span", {}, c("taiBia"))));
  if (b.avt) cacNut.append(el("a", { class: "nut nut-phu", href: linkTai(j.id, "avt"), download: "" }, el("span", { class: "bieu-tuong nguoi" }), el("span", {}, c("taiAnhDaiDien"))));

  const nutLai = el("button", { type: "button", class: "nut-chu" }, c("taiBaiKhac"));
  nutLai.addEventListener("click", () => {
    anKetQua();
    meo("");
    o.value = "";
    capNhatNutDan();
    o.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  ketQua.replaceChildren(
    ...[el("div", { class: "the" }, hinh, el("div", { class: "the-noi-dung" }, tacGia, moTa, nutChep, soLieu, nhac, cacNut, tienDo, nutLai)), phanAnh].filter(Boolean),
  );
  /* ảnh lấy thẳng từ TikTok mà không hiện (link hết hạn, bị chặn nhúng) thì lấy qua máy chủ của trang; vẫn hỏng thì để khung trống */
  const quaMayChu = (img, href) =>
    img?.addEventListener("error", () => {
      if (img.dataset.daThu) return img.replaceWith(el("div", { class: (img.className + " trong").trim() }));
      img.dataset.daThu = "1";
      img.src = href;
    });
  if (b.bia) quaMayChu(hinh.querySelector("img.bia"), linkTai(j.id, "bia", 0, true));
  phanAnh?.querySelectorAll("img").forEach((img, i) => quaMayChu(img, linkTai(j.id, "anh", i, true)));
  tacGia.querySelector("img")?.addEventListener("error", (e) => e.target.replaceWith(el("span", { class: "anh-trong" })));
  ketQua.hidden = false;
  ketQua.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- bài ảnh: tải ZIP, ghép video ---------- */
async function taiAnh(j, i, xem) {
  const r = await fetch(linkTai(j.id, "anh", i, xem));
  if (!r.ok) throw new Error("tải ảnh " + (i + 1));
  return r;
}

async function taiZip(j, nut, tienDo) {
  nut.disabled = true;
  try {
    const tep = [];
    for (let i = 0; i < j.anh.length; i++) {
      tienDo.textContent = c("dangTaiAnh", { i: i + 1, n: j.anh.length });
      const r = await taiAnh(j, i);
      tep.push({ ten: tenTuDau(r) || `${tenGon(j)}_anh${i + 1}.jpg`, du: new Uint8Array(await r.arrayBuffer()) });
    }
    luuBlob(taoZip(tep), `${tenGon(j)}_anh.zip`);
    tienDo.textContent = c("xongZip");
  } catch {
    tienDo.textContent = c("loiTaiAnh");
  } finally {
    nut.disabled = false;
  }
}

/* ghép ngay trên trình duyệt: mỗi ảnh 2,5 giây, chuyển mờ dần, nhạc gốc chạy nền. Ghi theo thời gian thật nên phải giữ trang mở */
async function ghepVideo(j, nut, tienDo) {
  const kieu = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((k) =>
    MediaRecorder.isTypeSupported(k),
  );
  if (!kieu) return (tienDo.textContent = c("chuaGhepDuoc"));
  nut.disabled = true;
  /* tạo bộ âm thanh ngay lúc bấm thì trình duyệt mới cho phát */
  const ac = j.ban.mp3 && window.AudioContext ? new AudioContext() : null;
  let nguonAm = null;
  try {
    const hinh = [];
    for (let i = 0; i < j.anh.length; i++) {
      tienDo.textContent = c("dangTaiAnh", { i: i + 1, n: j.anh.length });
      hinh.push(await createImageBitmap(await (await taiAnh(j, i, true)).blob()));
    }
    const W = 1080,
      H = 1920;
    const cv = el("canvas", { width: W, height: H });
    const g = cv.getContext("2d");
    const luong = cv.captureStream(30);
    if (ac) {
      try {
        tienDo.textContent = c("dangTaiNhac");
        const r = await fetch(linkTai(j.id, "mp3", 0, true));
        nguonAm = ac.createBufferSource();
        nguonAm.buffer = await ac.decodeAudioData(await r.arrayBuffer());
        nguonAm.loop = true;
        const dich = ac.createMediaStreamDestination();
        nguonAm.connect(dich);
        luong.addTrack(dich.stream.getAudioTracks()[0]);
      } catch {
        nguonAm = null; /* không tải được nhạc thì ghép không tiếng */
      }
    }
    const veAnh = (im, mo) => {
      const tl = Math.min(W / im.width, H / im.height),
        w = im.width * tl,
        h = im.height * tl;
      const tlNen = Math.max(W / im.width, H / im.height);
      g.globalAlpha = mo * 0.35;
      g.drawImage(im, (W - im.width * tlNen) / 2, (H - im.height * tlNen) / 2, im.width * tlNen, im.height * tlNen);
      g.globalAlpha = mo;
      g.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
      g.globalAlpha = 1;
    };
    const MOI = 2500,
      CHUYEN = 400,
      tong = hinh.length * MOI;
    const ghi = new MediaRecorder(luong, { mimeType: kieu, videoBitsPerSecond: 5e6 });
    const khuc = [];
    ghi.ondataavailable = (e) => e.data.size && khuc.push(e.data);
    const daDung = new Promise((ok) => (ghi.onstop = ok));
    await ac?.resume();
    ghi.start(1000);
    nguonAm?.start();
    const t0 = performance.now();
    await new Promise((ok) => {
      const buoc = () => {
        const t = performance.now() - t0;
        if (t >= tong) return ok();
        const k = Math.min(hinh.length - 1, Math.floor(t / MOI)),
          du = t - k * MOI;
        g.fillStyle = "#000";
        g.fillRect(0, 0, W, H);
        veAnh(hinh[k], 1);
        if (k + 1 < hinh.length && du > MOI - CHUYEN) veAnh(hinh[k + 1], (du - (MOI - CHUYEN)) / CHUYEN);
        tienDo.textContent = c("dangGhep", { phan: Math.round((t / tong) * 100) });
        setTimeout(buoc, 1000 / 30);
      };
      buoc();
    });
    ghi.stop();
    nguonAm?.stop();
    await daDung;
    const mp4 = kieu.startsWith("video/mp4");
    luuBlob(new Blob(khuc, { type: kieu.split(";")[0] }), `${tenGon(j)}_slide.${mp4 ? "mp4" : "webm"}`);
    tienDo.textContent = mp4 ? c("xongMp4") : c("xongWebm");
  } catch {
    tienDo.textContent = c("loiGhep");
  } finally {
    nut.disabled = false;
    ac?.close();
  }
}

/* ---------- lịch sử (chỉ nằm trên máy này) ---------- */
function docLichSu() {
  try {
    return JSON.parse(localStorage.getItem(KHOA_LICH_SU)) || [];
  } catch {
    return [];
  }
}
function ghiLichSu(j) {
  const ds = docLichSu().filter((x) => x.id !== j.id);
  ds.unshift({ id: j.id, loai: j.loai, ten: j.tacGia.ten, moTa: j.moTa.slice(0, 140), bia: j.bia });
  try {
    localStorage.setItem(KHOA_LICH_SU, JSON.stringify(ds.slice(0, 20)));
  } catch {
    /* chế độ ẩn danh hoặc đầy bộ nhớ: bỏ qua */
  }
  veLichSu();
}
function veLichSu() {
  const hop = $("#lich-su");
  if (!hop) return;
  const ds = docLichSu();
  hop.hidden = !ds.length;
  const nutXoa = el("button", { type: "button", class: "nut-chu" }, c("xoaLichSu"));
  nutXoa.addEventListener("click", () => {
    try {
      localStorage.removeItem(KHOA_LICH_SU);
    } catch {
      /* bỏ qua */
    }
    veLichSu();
  });
  hop.replaceChildren(
    el("div", { class: "dau-muc" }, el("h2", {}, c("daTimGanDay")), nutXoa),
    el(
      "ul",
      {},
      ds.map((x) => {
        const b = el(
          "button",
          { type: "button" },
          x.bia ? el("img", { src: x.bia, alt: "", loading: "lazy", referrerpolicy: "no-referrer" }) : el("span", { class: "bia trong" }),
          el("span", {}, el("b", {}, x.ten ? "@" + x.ten : "TikTok"), el("span", {}, x.moTa || (x.loai === "anh" ? c("baiAnh") : c("video")))),
        );
        b.querySelector("img")?.addEventListener("error", (e) => e.target.replaceWith(el("span", { class: "bia trong" })));
        b.addEventListener("click", () => {
          tim(`https://www.tiktok.com/@${x.ten}/${x.loai === "anh" ? "photo" : "video"}/${x.id}`);
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
        return el("li", {}, b);
      }),
    ),
    el("p", { class: "nho" }, c("lichSuNho")),
  );
}

/* ---------- gắn sự kiện ---------- */
ganMeo();
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    tim(o.value);
  });
  o.addEventListener("input", () => {
    capNhatNutDan();
    if (document.body.dataset.meo === "buon") meo("");
  });
  nutDan.addEventListener("click", async () => {
    if (o.value) {
      o.value = "";
      capNhatNutDan();
      baoLoi("");
      meo("");
      return o.focus();
    }
    try {
      const chu = await navigator.clipboard.readText();
      if (!chu.trim()) return baoLoi(c("boNhoTrong"));
      tim(chu);
    } catch {
      o.focus();
      baoLoi(c("khongDocBoNho"));
    }
  });
  veLichSu();

  /* mở từ nút chia sẻ của điện thoại (đã cài ứng dụng), nút đánh dấu, hoặc link ?url=… */
  const q = new URLSearchParams(location.search);
  const chia = [q.get("url"), q.get("text"), q.get("title")].map(timLinkTrongChu).find(Boolean);
  if (chia) {
    history.replaceState(null, "", location.pathname);
    tim(chia);
  }
}

/* nút đánh dấu ở trang hướng dẫn: để kéo lên thanh dấu trang, bấm thẳng thì chỉ nhắc */
for (const a of document.querySelectorAll("[data-danh-dau]"))
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const nhac = document.getElementById(a.dataset.danhDau);
    if (nhac) nhac.hidden = false;
  });

/* cài lên màn hình chính */
let hoiCai = null;
const nutCai = $("#nut-cai");
addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  hoiCai = e;
  if (nutCai) nutCai.hidden = false;
});
nutCai?.addEventListener("click", async () => {
  if (!hoiCai) return;
  hoiCai.prompt();
  await hoiCai.userChoice.catch(() => null);
  hoiCai = null;
  nutCai.hidden = true;
});
addEventListener("appinstalled", () => nutCai && (nutCai.hidden = true));

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

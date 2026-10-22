/* didate: trang soạn thiệp /tao/. ?mau=<mẫu> chọn sẵn mẫu; #sua=<id>.<khoá> sửa thiệp đã tạo.
   Chữ của mẫu đổi theo tên, xưng hô và các bước đang bật. Ô nào người dùng đã sửa (daSua) thì giữ nguyên,
   chỉ thay tên cũ bằng tên mới khi rời ô tên. Bản đang soạn được nhớ trong trình duyệt (không kèm ảnh). */
import { MAU, MAU_SAC, MO_DAU, XUNG_HO, TRUONG_CHU, thiepMau, chuMau, bienXung, lamSach, choDung, laGio } from "./chung.js?v=4";
import { veThiep, h } from "./the.js?v=4";
import { goiApi, themCuaToi, docManh, linkThiep, linkQuanLy, nutChep, chiaSe } from "./trang.js?v=4";

const $ = (s, g = document) => g.querySelector(s);
const $$ = (s, g = document) => [...g.querySelectorAll(s)];
const KHOA_NHAP = "didate-nhap";
const CHU_GHEP = [...TRUONG_CHU, "cauNe", "chonDs"]; // những thứ lấy từ mẫu, đổi theo tên và xưng hô
const TEN_CHO = { ngay: "ngày", gio: "giờ", chon: "lựa chọn" };

let t; // thiệp đang soạn
const daSua = new Set();
const anh = { blob: null, url: null, bo: false, cu: null }; // cu: link ảnh đang có khi sửa thiệp
let sua = null; // { id, khoa } khi sửa
let manXem = "hoi";

/* ---------- ảnh: thu nhỏ còn cạnh dài 1280px, JPEG, bỏ hết thông tin EXIF (vị trí chụp…) ---------- */
export async function nenAnh(tep, canh = 1280) {
  if (tep.type && !tep.type.startsWith("image/")) throw new Error("Chọn một tấm ảnh nha");
  const url = URL.createObjectURL(tep);
  try {
    const img = new Image();
    img.src = url;
    try {
      await img.decode();
    } catch {
      throw new Error("Máy này không đọc được ảnh đó (ảnh HEIC chẳng hạn). Thử ảnh JPG hoặc PNG nha");
    }
    const tl = Math.min(1, canh / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.naturalWidth * tl));
    c.height = Math.max(1, Math.round(img.naturalHeight * tl));
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    for (const q of [0.86, 0.76, 0.62, 0.5]) {
      const b = await new Promise((r) => c.toBlob(r, "image/jpeg", q));
      if (b && b.size <= 1.5 * 1024 * 1024) return b;
    }
    throw new Error("Ảnh lớn quá, thử ảnh khác nha");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ---------- bản nháp ---------- */
function luuNhap() {
  if (sua) return;
  try {
    localStorage.setItem(KHOA_NHAP, JSON.stringify({ t, daSua: [...daSua], luc: Date.now() }));
  } catch {
    /* không lưu được thì thôi */
  }
}
function docNhap() {
  try {
    const n = JSON.parse(localStorage.getItem(KHOA_NHAP) || "null");
    if (n?.t && Object.hasOwn(MAU, n.t.mau) && Array.isArray(n.daSua) && Date.now() - n.luc < 7 * 86400000) return n;
  } catch {
    /* hỏng thì bỏ */
  }
  return null;
}
function xoaNhap() {
  try {
    localStorage.removeItem(KHOA_NHAP);
  } catch {
    /* thôi */
  }
}

/* ---------- vẽ các ô chọn ---------- */
function veLuaChon() {
  $("#ds-mau").replaceChildren(
    ...Object.entries(MAU).map(([k, m]) =>
      h(
        "label",
        { class: "the-mau" },
        h("input", { type: "radio", name: "mau", value: k }),
        h("span", { class: "the-mau-bieu", "aria-hidden": "true" }, m.bieu),
        h("span", { class: "the-mau-chu" }, h("b", {}, m.ten), h("small", {}, m.moTa)),
      ),
    ),
  );
  $("#xung").replaceChildren(...XUNG_HO.map(([toi, ban], i) => h("option", { value: String(i) }, `Bạn xưng “${toi}”, gọi người ấy là “${ban}”`)));
  $("#ds-mau-sac").replaceChildren(
    ...Object.entries(MAU_SAC).map(([k, ten]) => h("label", { class: `o-mau o-mau-${k}` }, h("input", { type: "radio", name: "mauSac", value: k }), h("span", { class: "cham", "aria-hidden": "true" }), ten)),
  );
  $("#ds-mo-dau").replaceChildren(...Object.entries(MO_DAU).map(([k, ten]) => h("label", { class: "chip" }, h("input", { type: "radio", name: "moDau", value: k }), ten)));
}

function veDsGio() {
  $("#ds-gio").replaceChildren(
    ...t.gioGoiY.map((g) => h("span", { class: "chip" }, g, h("button", { type: "button", class: "bo", "aria-label": `Bỏ giờ ${g}`, "data-gio": g }, "✕"))),
    t.gioGoiY.length ? null : h("span", { class: "nho" }, "Chưa có giờ gợi ý, người ấy tự chọn giờ."),
  );
  $("#them-gio").disabled = t.gioGoiY.length >= 8;
}

function veDsChon() {
  const n = t.chonDs.length;
  $("#ds-chon").replaceChildren(
    ...t.chonDs.map((m, i) =>
      h(
        "div",
        { class: "dong-chon" },
        h("input", { class: "o-bieu", value: m.bieu, maxlength: "16", "aria-label": `Biểu tượng lựa chọn ${i + 1}`, "data-i": i, "data-k": "bieu" }),
        h("input", { value: m.ten, maxlength: "40", placeholder: "Tên", "aria-label": `Tên lựa chọn ${i + 1}`, "data-i": i, "data-k": "ten" }),
        h("input", { class: "o-mo-ta", value: m.moTa, maxlength: "100", placeholder: "Mô tả ngắn (không bắt buộc)", "aria-label": `Mô tả lựa chọn ${i + 1}`, "data-i": i, "data-k": "moTa" }),
        h(
          "span",
          { class: "nut-dong" },
          h("button", { type: "button", "aria-label": `Đưa lựa chọn ${i + 1} lên`, disabled: i === 0, "data-i": i, "data-viec": "len" }, "↑"),
          h("button", { type: "button", "aria-label": `Đưa lựa chọn ${i + 1} xuống`, disabled: i === n - 1, "data-i": i, "data-viec": "xuong" }, "↓"),
          h("button", { type: "button", "aria-label": `Bỏ lựa chọn ${i + 1}`, "data-i": i, "data-viec": "xoa" }, "✕"),
        ),
      ),
    ),
  );
  $("#them-chon").disabled = n >= 10;
}

function veAnh() {
  const khung = $("#xem-anh");
  const img = $("img", khung);
  khung.hidden = !anh.url;
  if (anh.url) img.src = anh.url;
  else img.removeAttribute("src");
  $("#bo-anh").hidden = !anh.url;
}

function canhKet() {
  const tat = choDung(t.ketLoi).filter((k) => (k === "ngay" && !t.hoiNgay) || (k === "gio" && !t.hoiGio) || (k === "chon" && !t.chonBat));
  const el = $("#canh-ket");
  el.hidden = !tat.length;
  el.textContent = tat.length ? `Lời kết có chỗ chèn ${tat.map((k) => TEN_CHO[k]).join(", ")} nhưng phần đó đang tắt, chỗ đó sẽ để trống.` : "";
}

function hienKhoi() {
  $("#khoi-ne").hidden = !t.ne;
  $("#khoi-gio").hidden = !t.hoiGio;
  $("#khoi-chon").hidden = !t.chonBat;
  $("#khoi-tu-choi").hidden = t.ne && !!t.nutKhong;
}

/* chữ trong các ô theo t (bỏ qua ô đang gõ cho khỏi nhảy con trỏ) */
function dienChu() {
  for (const o of $$("[data-truong]")) {
    const k = o.dataset.truong;
    if (o === document.activeElement || k === "xung") continue;
    o.value = t[k] ?? "";
  }
  for (const o of $$("[data-ne]")) if (o !== document.activeElement) o.value = t.cauNe[o.dataset.ne] || "";
  if (!$("#ds-chon").contains(document.activeElement)) veDsChon();
  canhKet();
}

function dienForm() {
  for (const o of $$('input[name="mau"]')) o.checked = o.value === t.mau;
  for (const o of $$('input[name="mauSac"]')) o.checked = o.value === t.mauSac;
  for (const o of $$('input[name="moDau"]')) o.checked = o.value === t.moDau;
  $("#xung").value = String(t.xung);
  for (const k of ["ne", "hoiNgay", "hoiGio", "chonBat", "chonKhac"]) $(`#${k}`).checked = !!t[k];
  dienChu();
  veDsGio();
  veAnh();
  hienKhoi();
}

/* chữ lấy lại từ mẫu cho những ô chưa sửa */
function capNhatChu() {
  const moi = chuMau(t);
  for (const k of CHU_GHEP) if (!daSua.has(k)) t[k] = structuredClone(moi[k]);
  dienChu();
}

/* rời ô tên: thay tên cũ bằng tên mới trong những ô đã sửa tay */
function thayTen(cu, moi) {
  if (!cu || cu.length < 2 || !moi || cu === moi) return;
  const thay = (s) => (typeof s === "string" ? s.split(cu).join(moi) : s);
  for (const k of daSua) {
    if (k === "cauNe") t.cauNe = t.cauNe.map(thay);
    else if (k === "chonDs") t.chonDs = t.chonDs.map((m) => ({ bieu: m.bieu, ten: thay(m.ten), moTa: thay(m.moTa) }));
    else t[k] = thay(t[k]);
  }
  dienChu();
}

/* ---------- xem thử ---------- */
let henXem = 0;
function doi({ nhap = true } = {}) {
  clearTimeout(henXem);
  henXem = setTimeout(veXem, 180);
  if (nhap) luuNhap();
}
function banXem() {
  const v = bienXung(t);
  const x = { ...t, gui: t.gui || v.gui, nhan: t.nhan || v.nhan, cauHoi: t.cauHoi || "…", nutCo: t.nutCo || "Có" };
  try {
    return lamSach(x);
  } catch {
    return x;
  }
}
function veXem() {
  const x = banXem();
  const khong = { mo: x.moDau === "khong", chon: !(x.hoiNgay || x.hoiGio || x.chonBat), "tu-choi": x.ne || !x.nutKhong };
  if (khong[manXem]) manXem = "hoi";
  for (const b of $$("#tab-xem [data-man]")) {
    b.disabled = !!khong[b.dataset.man];
    b.setAttribute("aria-selected", String(b.dataset.man === manXem));
  }
  veThiep($("#khung-xem"), x, { anh: anh.url, xemThu: true, chan: false, giuTapTrung: true, manDau: manXem });
}

/* ---------- gửi ---------- */
function loiO(sel, chuLoi) {
  const o = $(sel);
  o.setAttribute("aria-invalid", "true");
  o.focus();
  $("#trang-thai").textContent = chuLoi;
}

async function guiThiep() {
  const tt = $("#trang-thai");
  $$('[aria-invalid="true"]').forEach((o) => o.removeAttribute("aria-invalid"));
  if (!t.gui.trim()) return loiO("#gui", "Nhập tên của bạn nha");
  if (!t.nhan.trim()) return loiO("#nhan", "Nhập tên người ấy nha");
  if (!t.cauHoi.trim()) return loiO('[data-truong="cauHoi"]', "Thiệp cần có câu hỏi nha");
  if (!t.nutCo.trim()) return loiO('[data-truong="nutCo"]', "Nút đồng ý cần có chữ nha");
  let sach;
  try {
    sach = lamSach(t);
  } catch (e) {
    tt.textContent = e.message;
    return;
  }
  const f = new FormData();
  f.append("du_lieu", JSON.stringify(sach));
  if (anh.blob) f.append("anh", anh.blob, "anh.jpg");
  else if (sua && anh.bo) f.append("bo_anh", "1");
  const nut = $("#gui-thiep");
  nut.disabled = true;
  tt.textContent = sua ? "Đang lưu…" : anh.blob ? "Đang tạo thiệp và gửi ảnh…" : "Đang tạo thiệp…";
  try {
    if (sua) {
      await goiApi(`/api/thiep/${sua.id}/sua`, { form: f, khoa: sua.khoa });
      themCuaToi({ id: sua.id, khoa: sua.khoa, gui: sach.gui, nhan: sach.nhan, mau: sach.mau });
      location.href = `/quan-ly/?luu=1#${sua.id}.${sua.khoa}`;
      return;
    }
    const r = await goiApi("/api/thiep", { form: f });
    themCuaToi({ id: r.id, khoa: r.khoa, gui: sach.gui, nhan: sach.nhan, mau: sach.mau, taoLuc: Date.now(), hetHan: r.hetHan });
    xoaNhap();
    tt.textContent = "";
    hienXong(r, sach);
  } catch (e) {
    tt.textContent = e.message;
  } finally {
    nut.disabled = false;
  }
}

function hienXong(r, sach) {
  const lt = linkThiep(r.id);
  const lq = linkQuanLy(r.id, r.khoa);
  $("#xong-nhan").textContent = sach.nhan;
  $("#link-thiep").value = lt;
  $("#link-quan-ly").value = lq;
  $("#mo-thu").href = lt;
  $("#den-quan-ly").href = lq;
  $("#chia-se").onclick = async () => {
    const kq = await chiaSe(lt, sach.nhan);
    if (kq === "chep") $("#chia-se").textContent = "Đã chép link ✓ Dán vào tin nhắn nha";
  };
  $("#xong").hidden = false;
  document.body.classList.add("dang-xong");
  $("#xong-td").focus();
}

/* ---------- bắt đầu ---------- */
async function batDau() {
  veLuaChon();
  const q = new URLSearchParams(location.search);
  const mauQ = Object.hasOwn(MAU, q.get("mau") || "") ? q.get("mau") : null;
  const manhSua = location.hash.startsWith("#sua=") ? docManh(`#${location.hash.slice(5)}`) : null;
  const thongBao = $("#thong-bao-nhap");
  if (manhSua) {
    try {
      const r = await goiApi(`/api/thiep/${manhSua.id}`, { phuongThuc: "GET", khoa: manhSua.khoa });
      sua = manhSua;
      t = r.thiep;
      anh.cu = anh.url = r.anh;
      CHU_GHEP.forEach((k) => daSua.add(k));
      document.title = "Sửa thiệp | didate";
      $("#tieu-de-trang").textContent = `Sửa thiệp gửi ${t.nhan}`;
      $("#gui-thiep").textContent = "Lưu thay đổi 💾";
    } catch (e) {
      thongBao.hidden = false;
      thongBao.textContent = `Không mở được thiệp để sửa: ${e.message}`;
    }
  }
  if (!t) {
    const nhap = docNhap();
    if (nhap && (!mauQ || nhap.t.mau === mauQ)) {
      t = { ...thiepMau(nhap.t.mau), ...nhap.t };
      nhap.daSua.filter((k) => CHU_GHEP.includes(k)).forEach((k) => daSua.add(k));
      thongBao.hidden = false;
      thongBao.replaceChildren(
        "Đã mở lại bản bạn đang soạn dở (ảnh thì chọn lại nha). ",
        h(
          "button",
          {
            type: "button",
            class: "nut-chu",
            onclick: () => {
              xoaNhap();
              t = thiepMau(t.mau, { gui: t.gui, nhan: t.nhan, xung: t.xung });
              daSua.clear();
              thongBao.hidden = true;
              dienForm();
              doi({ nhap: false });
            },
          },
          "Bắt đầu lại",
        ),
      );
    } else t = thiepMau(mauQ || "an");
  }
  dienForm();
  veXem();
  ganSuKien();
}

function ganSuKien() {
  const form = $("#form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    guiThiep();
  });

  $("#ds-mau").addEventListener("change", (e) => {
    const m = e.target.value;
    if (m === t.mau) return;
    if (daSua.size && !confirm("Đổi mẫu thì những chữ bạn đã sửa sẽ thay bằng chữ của mẫu mới. Đổi nha?")) {
      e.target.checked = false;
      $(`input[name="mau"][value="${t.mau}"]`).checked = true;
      return;
    }
    t = thiepMau(m, { gui: t.gui, nhan: t.nhan, xung: t.xung });
    daSua.clear();
    dienForm();
    doi();
  });

  let tenCu = "";
  for (const k of ["gui", "nhan"]) {
    const o = $(`#${k}`);
    o.addEventListener("focus", () => (tenCu = bienXung(t)[k]));
    o.addEventListener("input", () => {
      t[k] = o.value;
      o.removeAttribute("aria-invalid");
      capNhatChu();
      doi();
    });
    o.addEventListener("change", () => {
      thayTen(tenCu, bienXung(t)[k]);
      tenCu = bienXung(t)[k];
      doi();
    });
  }
  $("#xung").addEventListener("change", (e) => {
    t.xung = Number(e.target.value);
    capNhatChu();
    doi();
  });
  $("#ds-mau-sac").addEventListener("change", (e) => {
    t.mauSac = e.target.value;
    doi();
  });
  $("#ds-mo-dau").addEventListener("change", (e) => {
    t.moDau = e.target.value;
    if (t.moDau !== "khong") manXem = "mo";
    doi();
  });

  form.addEventListener("input", (e) => {
    const o = e.target;
    const k = o.dataset.truong;
    if (k && TRUONG_CHU.includes(k)) {
      t[k] = o.value;
      daSua.add(k);
      o.removeAttribute("aria-invalid");
      if (k === "ketLoi") canhKet();
      if (k === "nutKhong") hienKhoi();
      doi();
    } else if (o.dataset.ne !== undefined) {
      t.cauNe[o.dataset.ne] = o.value;
      daSua.add("cauNe");
      doi();
    }
  });

  for (const k of ["ne", "hoiNgay", "hoiGio", "chonBat", "chonKhac"]) {
    $(`#${k}`).addEventListener("change", (e) => {
      t[k] = e.target.checked;
      if (k === "chonBat" && t.chonBat && !t.chonDs.length) t.chonDs = [{ bieu: "✨", ten: "", moTa: "" }];
      capNhatChu();
      hienKhoi();
      if (k === "ne") manXem = "hoi";
      doi();
    });
  }

  $("#them-gio").addEventListener("click", () => {
    const g = $("#gio-moi").value;
    if (!laGio(g)) return $("#gio-moi").focus();
    t.gioGoiY = [...new Set([...t.gioGoiY, g])].sort().slice(0, 8);
    $("#gio-moi").value = "";
    veDsGio();
    doi();
  });
  $("#ds-gio").addEventListener("click", (e) => {
    const g = e.target.closest("[data-gio]")?.dataset.gio;
    if (!g) return;
    t.gioGoiY = t.gioGoiY.filter((x) => x !== g);
    veDsGio();
    doi();
  });

  $("#ds-chon").addEventListener("input", (e) => {
    const { i, k } = e.target.dataset;
    if (i === undefined) return;
    t.chonDs[i][k] = e.target.value;
    daSua.add("chonDs");
    doi();
  });
  $("#ds-chon").addEventListener("click", (e) => {
    const b = e.target.closest("[data-viec]");
    if (!b) return;
    const i = Number(b.dataset.i);
    const ds = t.chonDs;
    if (b.dataset.viec === "xoa") ds.splice(i, 1);
    else {
      const j = b.dataset.viec === "len" ? i - 1 : i + 1;
      [ds[i], ds[j]] = [ds[j], ds[i]];
    }
    daSua.add("chonDs");
    veDsChon();
    doi();
  });
  $("#them-chon").addEventListener("click", () => {
    if (t.chonDs.length >= 10) return;
    t.chonDs.push({ bieu: "✨", ten: "", moTa: "" });
    daSua.add("chonDs");
    veDsChon();
    $("#ds-chon .dong-chon:last-child [data-k='ten']")?.focus();
    doi();
  });

  for (const b of $$("[data-chen]")) {
    b.addEventListener("click", () => {
      const o = $("#ket-loi");
      const dau = o.selectionStart ?? o.value.length;
      o.setRangeText(b.dataset.chen, dau, o.selectionEnd ?? dau, "end");
      o.dispatchEvent(new Event("input", { bubbles: true }));
      o.focus();
    });
  }

  $("#dat-lai").addEventListener("click", () => {
    if (!confirm("Đặt lại mọi chữ theo mẫu? Những chữ bạn đã sửa sẽ mất.")) return;
    daSua.clear();
    capNhatChu();
    doi();
  });

  $("#anh").addEventListener("change", async (e) => {
    const tep = e.target.files?.[0];
    e.target.value = "";
    if (!tep) return;
    const loi = $("#loi-anh");
    loi.textContent = "Đang thu nhỏ ảnh…";
    try {
      const b = await nenAnh(tep);
      if (anh.url?.startsWith("blob:")) URL.revokeObjectURL(anh.url);
      Object.assign(anh, { blob: b, url: URL.createObjectURL(b), bo: false });
      loi.textContent = "";
    } catch (err) {
      loi.textContent = err.message;
    }
    veAnh();
    doi({ nhap: false });
  });
  $("#bo-anh").addEventListener("click", () => {
    if (anh.url?.startsWith("blob:")) URL.revokeObjectURL(anh.url);
    Object.assign(anh, { blob: null, url: null, bo: !!anh.cu });
    veAnh();
    doi({ nhap: false });
  });

  $("#tab-xem").addEventListener("click", (e) => {
    const man = e.target.closest("[data-man]")?.dataset.man;
    if (!man) return;
    manXem = man;
    veXem();
  });
  $("#xem-dt").addEventListener("click", () => {
    document.body.classList.add("dang-xem");
    veXem();
    $("#dong-xem").focus();
  });
  $("#dong-xem").addEventListener("click", () => {
    document.body.classList.remove("dang-xem");
    $("#xem-dt").focus();
  });
  /* điện thoại: bàn phím bật lên thì thanh Xem thử/Tạo link nổi giữa màn hình, che ô đang gõ. Ẩn thanh khi bàn phím
     thật sự đang mở (vùng nhìn thấy thấp hẳn đi), không dựa vào tiêu điểm: trên Android tắt bàn phím bằng nút quay lại
     thì ô vẫn giữ tiêu điểm, thanh sẽ ẩn mãi và cuối trang chỉ còn khoảng trắng */
  const vv = globalThis.visualViewport;
  let caoDay = vv ? vv.height : 0;
  const xemBanPhim = () => {
    if (!vv) return;
    caoDay = Math.max(caoDay, vv.height);
    const o = document.activeElement;
    const dangGo = vv.height < caoDay * 0.75 && form.contains(o) && o.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea, select');
    document.body.classList.toggle("dang-go", dangGo);
  };
  vv?.addEventListener("resize", xemBanPhim);
  form.addEventListener("focusin", () => setTimeout(xemBanPhim, 400)); // chờ bàn phím trồi lên xong
  form.addEventListener("focusout", () => setTimeout(xemBanPhim, 0));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("dang-xem")) $("#dong-xem").click();
  });

  nutChep($("#chep-thiep"), () => $("#link-thiep").value);
  nutChep($("#chep-quan-ly"), () => $("#link-quan-ly").value);
}

if (document.getElementById("form")) batDau();

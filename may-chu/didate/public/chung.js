/* didate: phần dùng chung giữa trang và worker (ES module, không đụng DOM).
   Mẫu thiệp, làm sạch dữ liệu thiệp và câu trả lời, thay {ngay} {gio} {chon} trong chữ, ngày theo giờ Việt Nam. */

export const HAN_NGAY = 90; // thiệp tự xoá sau 90 ngày
export const ANH_TOI_DA = 2 * 1024 * 1024; // ảnh đã nén trên máy người tạo, tối đa 2 MB

/* [người gửi tự xưng, người gửi gọi người nhận, người nhận tự xưng, người nhận gọi người gửi] */
export const XUNG_HO = [
  ["anh", "em", "em", "anh"],
  ["em", "anh", "anh", "em"],
  ["tớ", "cậu", "tớ", "cậu"],
  ["mình", "bạn", "mình", "bạn"],
  ["chị", "em", "em", "chị"],
  ["em", "chị", "chị", "em"],
];
export const MAU_SAC = { hong: "Hồng", do: "Đỏ", "bac-ha": "Bạc hà", kem: "Kem", tim: "Tím", troi: "Xanh trời" };
export const MO_DAU = { thu: "Phong thư", qua: "Hộp quà", khong: "Vào thẳng" };

/* độ dài tối đa của từng ô chữ; ô có * được xuống dòng */
export const DAI = {
  nhanDan: 60,
  tieuDe: 120,
  "loiDau*": 600,
  cauHoi: 160,
  nutCo: 40,
  nutKhong: 40,
  chonTieuDe: 100,
  ketTieuDe: 100,
  "ketLoi*": 600,
  "ketCuoi*": 200,
  tuChoiTieuDe: 100,
  "tuChoiLoi*": 600,
};
export const TRUONG_CHU = Object.keys(DAI).map((k) => k.replace("*", ""));
export const SO_CAU_NE = 3; // câu hiện sau 3, 6, 9 lần né; né đủ 9 lần thì nút Không trốn luôn
export const MOI_CAU_NE = 3;

export class LoiDuLieu extends Error {}

const hoa = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/* các chữ xưng hô theo cặp đã chọn, kèm tên (chưa nhập tên thì dùng chữ thay) */
export function bienXung(t = {}) {
  const [toi, ban, nt, ng] = XUNG_HO[t.xung] || XUNG_HO[0];
  return { toi, Toi: hoa(toi), ban, Ban: hoa(ban), nt, Nt: hoa(nt), ng, gui: t.gui || hoa(toi), nhan: t.nhan || "người ấy", da: nt === "em" ? "Dạ " : "" };
}

/* "{ngay} lúc {gio} " theo các bước đang bật, để ghép vào lời kết */
const luc = (c) => (c.ngay ? "{ngay} " : "") + (c.gio ? "lúc {gio} " : "");

export const MAU = {
  an: {
    ten: "Rủ đi ăn, đi chơi",
    bieu: "🍜",
    moTa: "Hỏi có đi không, rồi cho người ấy chọn ngày, giờ và món.",
    mauSac: "hong",
    moDau: "thu",
    ne: true,
    hoiNgay: true,
    hoiGio: true,
    gioGoiY: ["11:30", "18:00", "19:00", "20:00"],
    chonBat: true,
    chonKhac: true,
    chu: (v) => ({
      nhanDan: `Dành riêng cho ${v.nhan} 💌`,
      tieuDe: `${v.Toi} có chuyện muốn nói với ${v.ban}...`,
      loiDau: `Không phải chuyện gì to tát đâu, chỉ là ${v.toi} muốn rủ ${v.ban} đi ăn theo cách dễ thương một xíu thôi 💕`,
      cauHoi: `Hôm nào mình đi ăn với nhau nha? 🍽️🥺`,
      nutCo: v.da ? "Dạ cóoo 💖" : "Cóoo 💖",
      nutKhong: `Để ${v.nt} nghĩ đã 🙈`,
      cauNe: ["Ơ kìa 😝", "Bấm “có” đi mà 🥺", "Nút này trốn mất tiêu rồi 😌"],
      chonTieuDe: `Chọn món ${v.ban} muốn ăn`,
      chonDs: [
        { bieu: "🍜", ten: "Mì cay", moTa: "Cay xè cho cuộc đời thêm đậm vị" },
        { bieu: "🍢", ten: "Xiên que", moTa: "Ăn lai rai, tám chuyện không dứt" },
        { bieu: "🥘", ten: "Đồ Hàn", moTa: "Thịt nướng, canh kim chi, chuẩn bài" },
        { bieu: "🍲", ten: "Lẩu", moTa: "Ngồi lâu, nói nhiều, ấm bụng" },
      ],
      ketTieuDe: "Chốt kèo rồi nhaaa ✨",
      ketCuoi: `Hứa rồi đó, không được bùng kèo đâu 😌💗`,
      tuChoiTieuDe: "Không sao đâu 🥹",
      tuChoiLoi: `${v.Toi} hiểu mà. Khi nào ${v.ban} rảnh thì nói ${v.toi} nghe nha, lời mời vẫn còn đó 💌`,
    }),
    ketLoi: (v, c) => `Vậy ${luc(c)}mình đi ăn${c.chon ? " {chon}" : ""} nha 💖 ${v.Ban} chỉ cần chuẩn bị xinh xinh thôi, còn lại để ${v.toi} lo ✨`,
  },
  "to-tinh": {
    ten: "Tỏ tình",
    bieu: "💘",
    moTa: "Nói ra điều giấu lâu nay, nút Không thì… hơi khó bấm.",
    mauSac: "do",
    moDau: "thu",
    ne: true,
    hoiNgay: true,
    hoiGio: true,
    gioGoiY: ["09:00", "15:00", "19:00", "20:00"],
    chonBat: true,
    chonKhac: true,
    chu: (v) => ({
      nhanDan: `Gửi ${v.nhan} 💗`,
      tieuDe: `${v.Toi} thích ${v.ban} lâu rồi đó...`,
      loiDau: `Nói ra thì hơi ngại, nên ${v.toi} viết vào đây. Mỗi lần nói chuyện với ${v.ban} là ${v.toi} vui cả ngày. ${v.Toi} muốn được ở cạnh ${v.ban} nhiều hơn nữa 💕`,
      cauHoi: `Làm người yêu ${v.toi} nha? 🥺👉👈`,
      nutCo: `Đồng ýyy 💖`,
      nutKhong: `Không đâu 🙈`,
      cauNe: ["Bấm nhầm rồi kìa 😝", "Nghĩ lại đi mà 🥺", "Nút này không cho bấm đâu 😌"],
      chonTieuDe: "Buổi hẹn đầu tiên mình đi đâu?",
      chonDs: [
        { bieu: "☕", ten: "Đi cà phê", moTa: "Ngồi tám chuyện cả buổi" },
        { bieu: "🎬", ten: "Xem phim", moTa: "Bắp rang bơ, ngồi cạnh nhau" },
        { bieu: "🌙", ten: "Đi dạo buổi tối", moTa: "Đi chầm chậm, nói chuyện nhỏ nhỏ" },
        { bieu: "🍝", ten: "Ăn tối", moTa: "Một chỗ xinh xinh cho hai người" },
      ],
      ketTieuDe: "Yayyy, chính thức rồi nha 💖",
      ketCuoi: `Thương ${v.ban} nhiều 💗`,
      tuChoiTieuDe: "Cảm ơn đã đọc tới đây 🌷",
      tuChoiLoi: `Không sao đâu, ${v.toi} vẫn vui vì đã nói ra được. Mình vẫn là bạn tốt nha 💌`,
    }),
    ketLoi: (v, c) => {
      const hen = [c.chon && "{chon}", c.ngay && "{ngay}", c.gio && "lúc {gio}"].filter(Boolean).join(", ");
      return `Từ giờ ${v.ban} là người yêu của ${v.toi} rồi đó 💖${hen ? ` Buổi hẹn đầu tiên: ${hen} nha ✨` : ""}`;
    },
  },
  "xin-loi": {
    ten: "Xin lỗi, làm lành",
    bieu: "🥺",
    moTa: "Lời xin lỗi đàng hoàng, kèm cách chuộc lỗi để người ấy chọn.",
    mauSac: "bac-ha",
    moDau: "thu",
    ne: true,
    hoiNgay: true,
    hoiGio: false,
    gioGoiY: ["18:00", "19:00", "20:00"],
    chonBat: true,
    chonKhac: true,
    chu: (v) => ({
      nhanDan: `Thư xin lỗi gửi ${v.nhan} 🥺`,
      tieuDe: `${v.Toi} biết lỗi rồi...`,
      loiDau: `Hôm đó ${v.toi} sai thật. ${v.Toi} không muốn ${v.ban} buồn thêm chút nào nữa, nên viết thư này để xin lỗi ${v.ban} cho đàng hoàng nè 🙇`,
      cauHoi: `${v.Ban} tha lỗi cho ${v.toi} nha? 🥺`,
      nutCo: `Thôi được rồi, tha đó 😤💖`,
      nutKhong: `Còn giận lắm 😤`,
      cauNe: ["Giận thì giận mà thương thì thương 😝", "Tha cho người ta đi mà 🥺", "Hết giận rồi nên nút này đi mất rồi 😌"],
      chonTieuDe: `Chọn cách ${v.toi} chuộc lỗi`,
      chonDs: [
        { bieu: "🧋", ten: "Trà sữa full topping", moTa: "Size L, bao nhiêu ly cũng được" },
        { bieu: "🍱", ten: "Một bữa thật ngon", moTa: `Món ${v.ban} thích, ${v.toi} bao` },
        { bieu: "🛍️", ten: "Làm người xách đồ một ngày", moTa: "Xách đồ, chụp ảnh, nghe lời tuyệt đối" },
        { bieu: "🛵", ten: "Đưa đón cả tuần", moTa: "Mưa nắng gì cũng có mặt" },
      ],
      ketTieuDe: `Cảm ơn ${v.ban} nhiều lắm 🥹💖`,
      ketCuoi: `Hết giận rồi thì cười một cái nha 😊`,
      tuChoiTieuDe: `Không sao, ${v.toi} chờ được 🥺`,
      tuChoiLoi: `Khi nào hết giận thì nói ${v.toi} biết nha. ${v.Toi} vẫn ở đây 💌`,
    }),
    ketLoi: (v, c) =>
      `${v.Toi} hứa sẽ không để chuyện đó lặp lại nữa.${c.ngay || c.gio || c.chon ? ` Hẹn ${v.ban} ${luc(c)}để ${v.toi} chuộc lỗi${c.chon ? " bằng {chon}" : ""} nha ✨` : ""}`,
  },
  "sinh-nhat": {
    ten: "Chúc sinh nhật",
    bieu: "🎂",
    moTa: "Lời chúc, ảnh, rồi hẹn ngày đi ăn mừng và chọn quà.",
    mauSac: "kem",
    moDau: "qua",
    ne: true,
    hoiNgay: true,
    hoiGio: true,
    gioGoiY: ["12:00", "18:00", "19:00", "20:00"],
    chonBat: true,
    chonKhac: true,
    chu: (v) => ({
      nhanDan: `Hôm nay là ngày của ${v.nhan} 🎂`,
      tieuDe: `Chúc mừng sinh nhật ${v.ban}! 🎉`,
      loiDau: `Chúc ${v.ban} tuổi mới thật nhiều niềm vui, ăn hoài không mập, lúc nào cũng được thương thật nhiều. Cảm ơn ${v.ban} vì đã xuất hiện 💛`,
      cauHoi: `Cho ${v.toi} đưa ${v.ban} đi ăn mừng sinh nhật nha? 🥳`,
      nutCo: v.da ? "Dạ, đi liềnnn 🥳" : "Đi liềnnn 🥳",
      nutKhong: `Thôi khỏi 🙈`,
      cauNe: ["Sinh nhật mà, đừng từ chối 😝", "Đi mà, đi mà 🥺", "Nút này đi ăn sinh nhật mất rồi 😌"],
      chonTieuDe: `Chọn món quà ${v.ban} thích nhất`,
      chonDs: [
        { bieu: "🎂", ten: "Bánh kem", moTa: "Thổi nến, ước một điều thật to" },
        { bieu: "🎁", ten: "Quà bí mật", moTa: "Không nói trước đâu 🤫" },
        { bieu: "🍣", ten: "Đi ăn buffet", moTa: `Ăn cho đã, ${v.toi} bao` },
        { bieu: "🎡", ten: "Đi chơi cả ngày", moTa: `Đi đâu ${v.ban} chọn` },
      ],
      ketTieuDe: `Hẹn ${v.ban} ngày đó nha 🎂`,
      ketCuoi: `Sinh nhật vui vẻ nha ${v.nhan} 💛`,
      tuChoiTieuDe: `Vậy ${v.toi} gửi lời chúc ở đây nha 🎈`,
      tuChoiLoi: `Chúc ${v.ban} sinh nhật thật vui. Khi nào rảnh thì ${v.toi} vẫn nợ ${v.ban} một bữa đó 💛`,
    }),
    ketLoi: (v, c) => `Vậy ${luc(c)}${v.toi} đưa ${v.ban} đi ăn mừng${c.chon ? ", kèm {chon} nữa nha 🎁" : " nha 🎁"}`,
  },
};

/* chữ của mẫu theo tên, xưng hô và các bước đang bật của thiệp t (dùng khi đổi tên/xưng hô trong lúc soạn) */
export function chuMau(t) {
  const m = MAU[t.mau] || MAU.an;
  const v = bienXung(t);
  return { ...m.chu(v), ketLoi: m.ketLoi(v, { ngay: t.hoiNgay, gio: t.hoiGio, chon: t.chonBat }) };
}

/* thiệp mới theo mẫu */
export function thiepMau(mau, { gui = "", nhan = "", xung = 0 } = {}) {
  const m = MAU[mau] || MAU.an;
  const t = {
    mau: MAU[mau] ? mau : "an",
    gui,
    nhan,
    xung,
    mauSac: m.mauSac,
    moDau: m.moDau,
    ne: m.ne,
    hoiNgay: m.hoiNgay,
    hoiGio: m.hoiGio,
    gioGoiY: [...m.gioGoiY],
    chonBat: m.chonBat,
    chonKhac: m.chonKhac,
  };
  return { ...t, ...chuMau(t) };
}

/* ---------- làm sạch (worker gọi trước khi lưu; trang gọi trước khi gửi để báo lỗi sớm) ---------- */

const DIEU_KHIEN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f‪-‮⁦-⁩]/g;

/* chuỗi gọn: bỏ ký tự điều khiển, chuẩn NFC (gõ tiếng Việt trên máy Mac hay ra NFD), cắt theo số ký tự thật */
export function chu(x, max, nhieuDong = false) {
  if (typeof x !== "string") return "";
  let s = x.normalize("NFC").replace(/\r\n?/g, "\n");
  s = nhieuDong ? s.replace(/[\t\u000b\u000c]/g, " ").replace(DIEU_KHIEN, "").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ").replace(DIEU_KHIEN, "");
  s = s.trim();
  const ky = Array.from(s);
  return ky.length > max ? ky.slice(0, max).join("").trim() : s;
}

export const laGio = (x) => typeof x === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(x);
export const laNgay = (x) => {
  if (typeof x !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const [y, m, d] = x.split("-").map(Number);
  const n = new Date(Date.UTC(y, m - 1, d));
  return n.getUTCFullYear() === y && n.getUTCMonth() === m - 1 && n.getUTCDate() === d;
};

export function lamSach(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) throw new LoiDuLieu("Dữ liệu thiệp không đúng");
  if (!Object.hasOwn(MAU, d.mau)) throw new LoiDuLieu("Không có mẫu thiệp này");
  const t = { mau: d.mau, gui: chu(d.gui, 40), nhan: chu(d.nhan, 40) };
  if (!t.gui) throw new LoiDuLieu("Thiếu tên người gửi");
  if (!t.nhan) throw new LoiDuLieu("Thiếu tên người nhận");
  t.xung = Number.isInteger(d.xung) && d.xung >= 0 && d.xung < XUNG_HO.length ? d.xung : 0;
  t.mauSac = Object.hasOwn(MAU_SAC, d.mauSac) ? d.mauSac : MAU[d.mau].mauSac;
  t.moDau = Object.hasOwn(MO_DAU, d.moDau) ? d.moDau : "khong";
  for (const [k, max] of Object.entries(DAI)) {
    const ten = k.replace("*", "");
    t[ten] = chu(d[ten], max, k.endsWith("*"));
  }
  if (!t.cauHoi) throw new LoiDuLieu("Thiếu câu hỏi");
  if (!t.nutCo) throw new LoiDuLieu("Thiếu chữ trên nút đồng ý");
  t.ne = d.ne === true && !!t.nutKhong;
  t.cauNe = (Array.isArray(d.cauNe) ? d.cauNe : []).slice(0, SO_CAU_NE).map((x) => chu(x, 80));
  t.hoiNgay = d.hoiNgay === true;
  t.hoiGio = d.hoiGio === true;
  t.gioGoiY = [...new Set((Array.isArray(d.gioGoiY) ? d.gioGoiY : []).filter(laGio))].sort().slice(0, 8);
  t.chonDs = (Array.isArray(d.chonDs) ? d.chonDs : [])
    .filter((x) => x && typeof x === "object")
    .map((x) => ({ bieu: chu(x.bieu, 16), ten: chu(x.ten, 40), moTa: chu(x.moTa, 100) }))
    .filter((x) => x.ten)
    .slice(0, 10);
  t.chonKhac = d.chonKhac === true;
  t.chonBat = d.chonBat === true && (t.chonDs.length > 0 || t.chonKhac);
  return t;
}

/* câu trả lời của người nhận, kiểm theo đúng thiệp t */
export function lamSachTraLoi(d, t, homNay = homNayVN()) {
  if (!d || typeof d !== "object" || Array.isArray(d)) throw new LoiDuLieu("Câu trả lời không đúng");
  const r = { dongY: d.dongY === true, soLanNe: Math.max(0, Math.min(999, Math.floor(Number(d.soLanNe)) || 0)) };
  if (r.dongY) {
    if (t.hoiNgay) {
      if (!laNgay(d.ngay) || d.ngay < congNgay(homNay, -1) || d.ngay > congNgay(homNay, 400)) throw new LoiDuLieu("Ngày hẹn không đúng");
      r.ngay = d.ngay;
    }
    if (t.hoiGio) {
      if (!laGio(d.gio)) throw new LoiDuLieu("Giờ hẹn không đúng");
      r.gio = d.gio;
    }
    if (t.chonBat) {
      const c = chu(d.chon, 60);
      if (!c || (!t.chonKhac && !t.chonDs.some((x) => x.ten === c))) throw new LoiDuLieu("Lựa chọn không đúng");
      r.chon = c;
    }
  }
  const loiNhan = chu(d.loiNhan, 500, true);
  if (loiNhan) r.loiNhan = loiNhan;
  return r;
}

/* ---------- chữ có chỗ trống ---------- */

const CHO = /\{(ngay|gio|chon|gui|nhan)\}/g;

/* tách chữ thành từng đoạn, đoạn thay từ chỗ trống có gt = true (trang in đậm đoạn đó) */
export function tachCho(s, gt) {
  s = s || "";
  const ra = [];
  const them = (x, laGt = false) => {
    if (!x) return;
    const truoc = ra[ra.length - 1];
    if (!laGt && truoc && !truoc.gt) truoc.chu += x;
    else ra.push(laGt ? { chu: x, gt: true } : { chu: x });
  };
  let cuoi = 0;
  for (const k of s.matchAll(CHO)) {
    them(s.slice(cuoi, k.index));
    if (gt[k[1]]) them(String(gt[k[1]]), true);
    cuoi = k.index + k[0].length;
  }
  them(s.slice(cuoi));
  /* chỗ trống của bước đã tắt bị bỏ đi, để lại khoảng trắng thừa */
  for (const x of ra) if (!x.gt) x.chu = x.chu.replace(/ {2,}/g, " ").replace(/ +([,.!?])/g, "$1");
  return ra;
}
export const dien = (s, gt) => tachCho(s, gt).map((x) => x.chu).join("");
export const choDung = (s) => [...new Set([...(s || "").matchAll(CHO)].map((k) => k[1]))];

/* ---------- ngày theo giờ Việt Nam ---------- */

export const THU = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const DD_VN = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" });

export const homNayVN = (d = new Date()) => DD_VN.format(d);
export function congNgay(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
export function thuCua(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
/* "Thứ Bảy, 25/10" (cùng năm với homNay) hoặc "Thứ Bảy, 25/10/2027" */
export function ngayDep(iso, homNay = homNayVN()) {
  const [y, m, d] = iso.split("-");
  return `${THU[thuCua(iso)]}, ${d}/${m}${y === homNay.slice(0, 4) ? "" : `/${y}`}`;
}
/* giờ phút theo giờ Việt Nam từ mốc thời gian (ms): "21:03, 22/10/2026" */
export function lucVN(ms) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric", hourCycle: "h23" })
      .formatToParts(new Date(ms))
      .map((x) => [x.type, x.value]),
  );
  return `${p.hour}:${p.minute}, ${p.day}/${p.month}/${p.year}`;
}

/* didate: trang thiệp /<id>. Worker đặt dữ liệu thiệp vào <script id="du-lieu">; /thiep?thu=<mẫu> là thiệp mẫu ở trang chủ. */
import { veThiep, h } from "./the.js?v=3";
import { MAU, thiepMau } from "./chung.js?v=3";
import { goiApi, timCuaToi, linkQuanLy } from "./trang.js?v=3";

const goc = document.getElementById("thiep");
let du = null;
try {
  du = JSON.parse(document.getElementById("du-lieu")?.textContent || "null");
} catch {
  du = null;
}
const thu = new URLSearchParams(location.search).get("thu");

/* lượt mở: mỗi máy đếm lại sau 30 phút, tải lại trang không tính thêm */
function demLuotMo(id) {
  const khoa = `didate-mo-${id}`;
  try {
    if (Date.now() - Number(localStorage.getItem(khoa) || 0) < 30 * 60000) return;
    localStorage.setItem(khoa, String(Date.now()));
  } catch {
    /* không lưu được thì vẫn đếm */
  }
  fetch(`/api/thiep/${id}/mo`, { method: "POST", keepalive: true }).catch(() => {});
}

if (du?.thiep) {
  const cuaToi = timCuaToi(du.id);
  document.title = du.thiep.nhanDan || "didate 💌";
  if (cuaToi) {
    /* người tạo mở thiệp của mình: bấm thử thoải mái, không tính là câu trả lời, không đếm lượt mở */
    veThiep(goc, du.thiep, {
      id: du.id,
      anh: du.anh,
      xemThu: true,
      banner: h("p", { class: "t-banner" }, "Đây là thiệp bạn tạo, bấm thử không tính là câu trả lời. ", h("a", { href: linkQuanLy(du.id, cuaToi.khoa) }, "Xem người ấy trả lời →")),
    });
  } else {
    veThiep(goc, du.thiep, {
      id: du.id,
      anh: du.anh,
      guiTraLoi: (traLoi) => goiApi(`/api/thiep/${du.id}/tra-loi`, { json: traLoi }),
      baoCao: (lyDo) => goiApi(`/api/thiep/${du.id}/bao-cao`, { json: { lyDo } }),
    });
    demLuotMo(du.id);
  }
} else if (thu && Object.hasOwn(MAU, thu)) {
  document.title = `Thiệp mẫu: ${MAU[thu].ten} | didate`;
  veThiep(goc, thiepMau(thu, { gui: "Nam", nhan: "Mai" }), {
    anh: "/anh-mau.svg",
    xemThu: true,
    banner: h("p", { class: "t-banner" }, "Thiệp mẫu, bấm thử thoải mái. ", h("a", { href: `/tao/?mau=${thu}` }, "Tạo thiệp như này →")),
  });
} else {
  goc.classList.add("t-trang");
  goc.replaceChildren(
    h(
      "div",
      { class: "t-the" },
      h(
        "section",
        { class: "t-man" },
        h("p", { class: "t-nhan-dan" }, "didate 💌"),
        h("h1", { class: "t-tieu-de" }, du?.hetHan ? "Thiệp này hết hạn rồi" : "Không tìm thấy thiệp này"),
        h(
          "p",
          { class: "t-loi" },
          du?.hetHan
            ? "Thiệp trên didate tự xoá sau 90 ngày. Nhờ người gửi tạo thiệp mới nha."
            : "Có thể link bị thiếu chữ, hoặc người gửi đã xoá thiệp. Kiểm tra lại link nha.",
        ),
        h("a", { class: "t-nut t-nut-co", href: "/" }, "Tạo thiệp của bạn 💌"),
      ),
    ),
  );
}

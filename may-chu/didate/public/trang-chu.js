/* didate: trang chủ. Chỉ hiện số thiệp đã tạo trên trình duyệt này cạnh mục Thiệp của tôi. */
import { docCuaToi } from "./trang.js?v=3";

const so = docCuaToi().length;
const el = document.getElementById("so-thiep");
if (so && el) {
  el.textContent = String(so);
  el.hidden = false;
}

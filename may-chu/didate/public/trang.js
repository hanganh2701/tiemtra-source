/* didate: việc chung của các trang (không dùng ở worker). Thiệp đã tạo được nhớ trong trình duyệt của người tạo
   (khoá "didate-cua-toi": id, khoá quản lý, tên), chỉ máy này biết; xoá dữ liệu trình duyệt là mất, nên trang luôn nhắc lưu link quản lý. */

const KHOA_LUU = "didate-cua-toi";

export function docCuaToi() {
  try {
    const ds = JSON.parse(localStorage.getItem(KHOA_LUU) || "[]");
    return Array.isArray(ds) ? ds.filter((x) => x && typeof x.id === "string" && typeof x.khoa === "string") : [];
  } catch {
    return [];
  }
}
function ghiCuaToi(ds) {
  try {
    localStorage.setItem(KHOA_LUU, JSON.stringify(ds.slice(0, 50)));
  } catch {
    /* trình duyệt chặn lưu (chế độ riêng tư): vẫn chạy, chỉ không nhớ */
  }
}
export const themCuaToi = (m) => ghiCuaToi([{ ...docCuaToi().find((x) => x.id === m.id), ...m }, ...docCuaToi().filter((x) => x.id !== m.id)]);
export const boCuaToi = (id) => ghiCuaToi(docCuaToi().filter((x) => x.id !== id));
export const timCuaToi = (id) => docCuaToi().find((x) => x.id === id);

export const linkThiep = (id) => `${location.origin}/${id}`;
export const linkQuanLy = (id, khoa) => `${location.origin}/quan-ly/#${id}.${khoa}`;

/* "#<id>.<khoá>" trong link quản lý */
export function docManh(manh = location.hash) {
  const k = /^#?([a-z2-9]{8})\.([A-Za-z0-9_-]{20,64})$/.exec(manh || "");
  return k ? { id: k[1], khoa: k[2] } : null;
}

/* gọi API, lỗi thì ném Error có câu báo tiếng Việt của máy chủ */
export async function goiApi(duong, { phuongThuc = "POST", json, form, khoa } = {}) {
  const headers = {};
  if (khoa) headers["X-Khoa"] = khoa;
  if (json !== undefined) headers["Content-Type"] = "application/json";
  let r;
  try {
    r = await fetch(duong, { method: phuongThuc, headers, body: form || (json !== undefined ? JSON.stringify(json) : undefined) });
  } catch {
    throw new Error("Mất kết nối mạng, thử lại nha");
  }
  if (r.status === 204) return {};
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.loi || `Máy chủ báo lỗi ${r.status}`), { status: r.status });
  return j;
}

/* chép chữ, trả về true nếu được */
export async function chep(s) {
  try {
    await navigator.clipboard.writeText(s);
    return true;
  } catch {
    const o = document.createElement("textarea");
    o.value = s;
    o.setAttribute("readonly", "");
    o.className = "an-han";
    document.body.append(o);
    o.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    o.remove();
    return ok;
  }
}

/* nút "Chép": đổi chữ một lúc cho biết đã chép */
export function nutChep(nut, layChu) {
  const cu = nut.textContent;
  nut.addEventListener("click", async () => {
    nut.textContent = (await chep(layChu())) ? "Đã chép ✓" : "Chép không được, giữ ngón tay lên link để chép";
    setTimeout(() => (nut.textContent = cu), 2200);
  });
}

/* chia sẻ link qua menu của máy (điện thoại); máy không có thì chép */
export async function chiaSe(link, ten) {
  if (navigator.share) {
    try {
      await navigator.share({ title: "didate 💌", text: `${ten} ơi, có thư cho nè 💌`, url: link });
      return "chia-se";
    } catch (e) {
      if (e?.name === "AbortError") return "huy";
    }
  }
  return (await chep(link)) ? "chep" : "loi";
}

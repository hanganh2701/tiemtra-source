/* didate: trang quản lý /quan-ly/#<id>.<khoá>: người tạo xem người nhận đã mở thiệp chưa, chọn gì, nhắn gì; sửa, xoá.
   Không có khoá trên đường dẫn thì liệt kê thiệp đã tạo trên trình duyệt này. Khoá nằm sau dấu #, không đi tới máy chủ
   theo đường dẫn mà chỉ đi trong header X-Khoa. */
import { MAU, ngayDep, lucVN, homNayVN } from "./chung.js?v=4";
import { h } from "./the.js?v=4";
import { goiApi, docCuaToi, themCuaToi, boCuaToi, docManh, linkThiep, linkQuanLy, nutChep, chiaSe } from "./trang.js?v=4";

const goc = document.getElementById("noi-dung");
const daLuu = new URLSearchParams(location.search).get("luu") === "1";

function oLink(nhan, link) {
  const o = h("input", { readonly: true, value: link, "aria-label": nhan });
  const nut = h("button", { type: "button", class: "nut nut-phu" }, "Chép");
  nutChep(nut, () => link);
  return h("div", { class: "o-link" }, o, nut);
}

function veDanhSach() {
  document.title = "Thiệp của tôi | didate";
  const ds = docCuaToi();
  const oDan = h("input", { type: "url", placeholder: "https://didate.meomeo.app/quan-ly/#…", "aria-label": "Link quản lý" });
  const loiDan = h("p", { class: "loi", role: "alert" });
  goc.replaceChildren(
    h("h1", {}, "Thiệp của tôi"),
    ds.length
      ? h(
          "ul",
          { class: "ds-thiep" },
          ds.map((x) =>
            h(
              "li",
              {},
              h(
                "a",
                { href: linkQuanLy(x.id, x.khoa) },
                h("span", { class: "the-mau-bieu", "aria-hidden": "true" }, MAU[x.mau]?.bieu || "💌"),
                h("span", {}, h("b", {}, `Gửi ${x.nhan || "?"}`), h("small", {}, [MAU[x.mau]?.ten, x.taoLuc && `tạo lúc ${lucVN(x.taoLuc)}`].filter(Boolean).join(" · "))),
              ),
            ),
          ),
        )
      : h("p", {}, "Trình duyệt này chưa tạo thiệp nào. ", h("a", { href: "/tao/" }, "Tạo thiệp đầu tiên 💌")),
    h("p", { class: "nho" }, "Danh sách chỉ nằm trên trình duyệt này. Đổi máy hay xoá dữ liệu trình duyệt thì mở bằng link quản lý đã chép lại."),
    h(
      "form",
      {
        class: "dan-link",
        onsubmit: (e) => {
          e.preventDefault();
          const m = docManh(new URL(oDan.value.trim() || "x:", location.href).hash);
          if (!m) return (loiDan.textContent = "Link này không phải link quản lý của didate");
          location.href = linkQuanLy(m.id, m.khoa); // đổi phần sau # thì trang tự tải lại (hashchange ở dưới)
        },
      },
      h("label", {}, "Có link quản lý? Dán vào đây", oDan),
      h("button", { class: "nut nut-phu", type: "submit" }, "Mở"),
      loiDan,
    ),
  );
}

function dongTraLoi(du) {
  const tl = du.traLoi;
  const t = du.thiep;
  if (!tl) return h("div", { class: "o-trang-thai" }, h("p", { class: "lon" }, "⏳ Chưa trả lời"), h("p", { class: "nho" }, "Khi người ấy chọn xong, câu trả lời hiện ở đây. Bấm Làm mới để xem."));
  const dong = [
    tl.ngay && ["Ngày", ngayDep(tl.ngay, homNayVN())],
    tl.gio && ["Giờ", tl.gio],
    tl.chon && ["Lựa chọn", tl.chon],
    tl.soLanNe > 0 && ["Cố bấm từ chối", `${tl.soLanNe} lần 😝`],
  ].filter(Boolean);
  return h(
    "div",
    { class: `o-trang-thai ${tl.dongY ? "dong-y" : "tu-choi"}` },
    h("p", { class: "lon" }, tl.dongY ? `💖 ${t.nhan} đồng ý rồi!` : `🥹 ${t.nhan} đã bấm từ chối`),
    dong.length ? h("dl", { class: "bang" }, dong.map(([k, v]) => h("div", {}, h("dt", {}, k), h("dd", {}, v)))) : null,
    tl.loiNhan ? h("blockquote", {}, h("p", {}, tl.loiNhan), h("cite", {}, `Lời nhắn của ${t.nhan}`)) : null,
    du.traLoiLuc ? h("p", { class: "nho" }, `Trả lời lúc ${lucVN(du.traLoiLuc)}`) : null,
  );
}

async function veThiepCuaToi(m) {
  let du;
  try {
    du = await goiApi(`/api/thiep/${m.id}`, { phuongThuc: "GET", khoa: m.khoa });
  } catch (e) {
    goc.replaceChildren(
      h("h1", {}, "Không mở được thiệp"),
      h("p", {}, e.message),
      e.status === 404 || e.status === 410
        ? h(
            "button",
            {
              type: "button",
              class: "nut nut-phu",
              onclick: () => {
                boCuaToi(m.id);
                location.href = "/quan-ly/";
              },
            },
            "Bỏ khỏi Thiệp của tôi",
          )
        : h("button", { type: "button", class: "nut nut-phu", onclick: () => veThiepCuaToi(m) }, "Thử lại"),
      h("p", {}, h("a", { href: "/quan-ly/" }, "← Thiệp của tôi")),
    );
    return;
  }
  const t = du.thiep;
  themCuaToi({ id: m.id, khoa: m.khoa, gui: t.gui, nhan: t.nhan, mau: t.mau, taoLuc: du.taoLuc, hetHan: du.hetHan });
  document.title = `Thiệp gửi ${t.nhan} | didate`;
  const lt = linkThiep(m.id);
  const nutGui = h(
    "button",
    {
      type: "button",
      class: "nut nut-chinh",
      onclick: async () => {
        if ((await chiaSe(lt, t.nhan)) === "chep") nutGui.textContent = "Đã chép link ✓";
      },
    },
    "Gửi link 💌",
  );
  const ttXoa = h("p", { class: "loi", role: "alert" });
  const cacKhoi = [
    h("p", {}, h("a", { href: "/quan-ly/" }, "← Thiệp của tôi")),
    daLuu ? h("p", { class: "thong-bao" }, "Đã lưu thay đổi ✓") : null,
    du.an ? h("p", { class: "thong-bao canh" }, "Thiệp này đã bị gỡ vì vi phạm điều khoản, người nhận không mở được nữa.") : null,
    h("h1", {}, `${MAU[t.mau]?.bieu || "💌"} Thiệp gửi ${t.nhan}`),
    h("section", { class: "hop" }, h("h2", {}, "Người ấy trả lời"), dongTraLoi(du), h("p", { class: "nho" }, du.mo.dau ? `Đã mở ${du.mo.soLan} lần. Lần đầu lúc ${lucVN(du.mo.dau)}, gần nhất lúc ${lucVN(du.mo.cuoi)}.` : "Chưa mở thiệp."), h("button", { type: "button", class: "nut nut-phu", onclick: () => veThiepCuaToi(m) }, "↻ Làm mới")),
    h("section", { class: "hop" }, h("h2", {}, "Link thiệp"), h("p", { class: "nho" }, `Gửi link này cho ${t.nhan}.`), oLink("Link thiệp", lt), h("div", { class: "hang-nut" }, nutGui, h("a", { class: "nut nut-phu", href: lt, target: "_blank", rel: "noopener" }, "Mở thiệp"))),
    h(
      "section",
      { class: "hop" },
      h("h2", {}, "Link quản lý"),
      h("p", { class: "nho" }, "Link của riêng bạn để quay lại trang này từ máy khác. Đừng gửi cho ai."),
      oLink("Link quản lý", linkQuanLy(m.id, m.khoa)),
    ),
    h(
      "section",
      { class: "hop" },
      h("h2", {}, "Sửa, xoá"),
      h("p", { class: "nho" }, `Tạo lúc ${lucVN(du.taoLuc)}. Thiệp tự xoá ngày ${lucVN(du.hetHan).split(", ")[1]}.`),
      h(
        "div",
        { class: "hang-nut" },
        h("a", { class: "nut nut-phu", href: `/tao/#sua=${m.id}.${m.khoa}` }, "✏️ Sửa thiệp"),
        h(
          "button",
          {
            type: "button",
            class: "nut nut-nguy",
            onclick: async (e) => {
              if (!confirm(`Xoá hẳn thiệp gửi ${t.nhan}? Link thiệp sẽ không mở được nữa.`)) return;
              e.target.disabled = true;
              try {
                await goiApi(`/api/thiep/${m.id}/xoa`, { khoa: m.khoa });
                boCuaToi(m.id);
                goc.replaceChildren(h("h1", {}, "Đã xoá thiệp"), h("p", {}, h("a", { href: "/quan-ly/" }, "← Thiệp của tôi"), " · ", h("a", { href: "/tao/" }, "Tạo thiệp mới")));
              } catch (err) {
                ttXoa.textContent = err.message;
                e.target.disabled = false;
              }
            },
          },
          "🗑️ Xoá thiệp",
        ),
      ),
      ttXoa,
    ),
  ];
  goc.replaceChildren(...cacKhoi.filter(Boolean));
}

const m = docManh();
if (m) {
  veThiepCuaToi(m);
  /* quay lại tab thì tự làm mới, xem người ấy trả lời chưa */
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && goc.querySelector(".o-trang-thai")) veThiepCuaToi(m);
  });
} else veDanhSach();
window.addEventListener("hashchange", () => location.reload());

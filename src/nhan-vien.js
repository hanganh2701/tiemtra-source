/* ---------- NHÂN VIÊN SÂU VỪA ĐỦ ----------
   Mỗi nhân viên: tên, một đặc điểm, kỹ năng 1–5, tâm trạng 0–100. Không xếp ca theo giờ.
   Làm cạnh người chơi (phụ quầy) thì lên nghề nhanh hơn. Lên nghề thì đòi tăng lương.
   Tối đa một chuyện nhân viên mỗi 14 ngày. Nạp trước game.js. */

function nvThue(id) {
  S.nv = S.nv || {};
  if (S.nv[id]) return;
  const T = TT();
  let ten = rnd(NV_TEN[id] || ["Bạn nhân viên"]),
    dd = rnd(Object.keys(NV_DD)),
    kn = 1;
  /* Linh thi xong xin làm thêm: vị trí phụ quầy đầu tiên thuê sau đó là Linh */
  if ((id === "staff1" || id === "staff3") && T.co.linh_lam && !T.co.linh_da_lam) {
    ten = "Linh";
    dd = "sinh_vien";
    T.co.linh_da_lam = true;
    /* Linh chọn ở lại làm thêm: đã phụ tiệm mấy tháng nên vào nghề sẵn */
    if (T.nhanh.linh === "A") kn = 2;
  }
  S.nv[id] = { ten, dd, kn, tt: 80, xp: 0, luong: 1, vao: S.day };
}
const nvCo = (id) => (S.upg[id] && S.nv && S.nv[id]) || null;
/* tốc độ làm (nhân vào tốc độ gốc) */
function nvToc(id) {
  const n = nvCo(id);
  if (!n) return 1;
  return (1 + (n.kn - 1) * 0.1) * (n.dd === "nhanh" ? 1.2 : 1) * (n.tt < 30 ? 0.85 : 1);
}
/* tỉ lệ làm sai (nhân vào tỉ lệ gốc) */
function nvSai(id) {
  const n = nvCo(id);
  if (!n) return 1;
  return (n.dd === "can_than" ? 0.5 : n.dd === "vung" ? 2 : 1) * (S.truongCa && S.truongCa !== id && nvCo(S.truongCa) ? 0.7 : 1) * (n.tt < 30 ? 1.5 : 1);
}
/* có mặt lúc này không (đi trễ thì vắng 20% đầu ngày, sinh viên nghỉ mùa thi) */
function nvRanh(id) {
  if (R.nvVang && R.nvVang[id]) return false;
  if (R.nvTre && R.nvTre[id] && R.t > dayLen() * 60 * 0.8) return false;
  return true;
}
function heSoChoNv() {
  let f = 1;
  STAFF.forEach((u) => {
    const n = nvCo(u.id);
    if (n && nvRanh(u.id)) f += n.dd === "deo_mieng" ? 0.08 : n.dd === "vui_ve" ? 0.05 : 0;
  });
  return f;
}
const luongNv = (id) => ((S.nv && S.nv[id] && S.nv[id].luong) || 1) * (S.truongCa === id ? 1.5 : 1);

/* đầu ngày: ai đi trễ, ai nghỉ thi */
function nvDauNgay() {
  R.nvVang = {};
  R.nvTre = {};
  const ds = [];
  STAFF.forEach((u) => {
    const n = nvCo(u.id);
    if (!n) return;
    if (n.dd === "sinh_vien" && S.day % 30 >= 25 && S.day % 30 <= 27) {
      R.nvVang[u.id] = true;
      ds.push(n.ten + " nghỉ ôn thi hôm nay");
    } else if (n.dd === "di_tre" && Math.random() < 0.25) {
      R.nvTre[u.id] = true;
      ds.push(n.ten + " đi trễ, gần trưa mới tới");
    }
  });
  if (ds.length) setTimeout(() => toast(ds.join(". "), 4500, 1), 1200);
}
/* cuối ngày: kinh nghiệm, tâm trạng, lên nghề; chuyện nhân viên để đầu ngày sau hỏi */
function nvCuoiNgay(rec, loi, sao) {
  S.nvHoi = S.nvHoi || [];
  STAFF.forEach((u) => {
    const n = nvCo(u.id);
    if (!n || (R.nvVang && R.nvVang[u.id])) return;
    n.xp += 1 + (u.id === "staff1" || u.id === "staff3" ? 1 : 0); /* phụ quầy làm cạnh bạn: kèm cặp */
    n.tt += -(n.dd === "cham_chi" ? 1 : 3) + (loi > 0 && sao >= 4.5 ? 5 : 0) - (u.id === "staff2" && rec.ot ? 5 : 0) + (n.dd === "vui_ve" ? 2 : 0);
    n.tt = Math.max(0, Math.min(100, n.tt));
    if (n.kn < 5 && n.xp >= n.kn * 6) {
      n.kn++;
      n.xp = 0;
      S.nvHoi.push({ id: u.id, loai: "luong" });
    } else if (n.tt < 25 && Math.random() < 0.15) S.nvHoi.push({ id: u.id, loai: "nghi" });
  });
}
/* đầu ngày: hỏi chuyện nhân viên (tối đa một chuyện mỗi 14 ngày); trả true nếu đang hỏi */
function nvSuKien() {
  const ds = (S.nvHoi || []).filter((x) => nvCo(x.id));
  S.nvHoi = ds;
  if (!ds.length || S.day - (S.nvSk || -99) < 14) return false;
  const x = ds.shift(),
    n = nvCo(x.id),
    u = STAFF.find((y) => y.id === x.id);
  S.nvSk = S.day;
  save();
  if (x.loai === "luong") {
    const moi = Math.round(CFG[u.wage] * (n.luong + 0.1) * (S.truongCa === x.id ? 1.5 : 1));
    ask(
      `<div class="pbig">${ico("people")}</div><h2>${esc(n.ten)} lên nghề</h2><p>${esc(n.ten)} (${u.n.toLowerCase()}) giờ tay nghề ${n.kn}/5, làm nhanh hơn. Xin tăng lương lên ${fmt(moi)}/ngày.</p>`,
      [
        ["Chưa tăng", () => { n.tt = Math.max(0, n.tt - 20); save(); toast(n.ten + " hơi buồn"); }],
        ["Tăng lương", () => { n.luong = Math.round((n.luong + 0.1) * 10) / 10; n.tt = Math.min(100, n.tt + 10); save(); toast(n.ten + " vui ra mặt"); }, 1],
      ],
    );
  } else {
    ask(
      `<div class="pbig">${ico("sad")}</div><h2>${esc(n.ten)} muốn nghỉ</h2><p>Dạo này ${esc(n.ten)} mệt và chán. Giữ lại thì phải tăng lương, không thì cho nghỉ.</p>`,
      [
        ["Cho nghỉ", () => { S.upg[x.id] = false; delete (S.hired || {})[x.id]; delete S.nv[x.id]; if (S.truongCa === x.id) S.truongCa = null; save(); renderPrep(); }],
        ["Tăng lương giữ lại", () => { n.luong = Math.round((n.luong + 0.2) * 10) / 10; n.tt = 70; save(); }, 1],
      ],
    );
  }
  return true;
}
/* dòng thông tin trong danh sách nhân viên */
function nvDong(id) {
  const n = nvCo(id);
  if (!n) return "";
  const d = NV_DD[n.dd],
    tc = S.truongCa === id;
  return `<div class="sub nvd"><b>${esc(n.ten)}</b>${tc ? " · <b>trưởng ca</b>" : ""} · <span class="nvdd ${d.tot ? "tot" : "xau"}" title="${esc(d.mo)}">${esc(d.ten)}</span> · tay nghề ${"★".repeat(n.kn)}${"☆".repeat(5 - n.kn)}<span class="nvtt"><i style="width:${n.tt}%;background:${n.tt < 30 ? "var(--warn)" : n.tt < 60 ? "var(--gold)" : "var(--mint)"}"></i></span><small>${esc(d.mo)}</small>${
    buoc() >= 2 && !tc ? `<button class="sbtn" data-tc="${id}">Làm trưởng ca</button>` : ""
  }</div>`;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-tc]");
  if (!b || typeof S === "undefined" || !S) return;
  e.stopPropagation();
  S.truongCa = b.dataset.tc;
  save();
  toast(S.nv[S.truongCa].ten + " làm trưởng ca: nhân viên khác ít sai hơn, lương trưởng ca gấp rưỡi");
  refreshPrep();
});

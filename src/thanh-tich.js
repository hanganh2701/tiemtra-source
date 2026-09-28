/* ---------- HUY HIỆU VÀ MỤC TIÊU TUẦN ----------
   Dữ liệu ở data/thanh-tich.js. Không chạy trong lúc chơi thử thách (S lúc đó là bản tạm). Nạp trước game.js. */

/* xét huy hiệu mới; im = không báo (dùng khi vẽ bảng) */
function xetHuyHieu(im) {
  if (typeof R === "undefined" || !R || R.challenge || !S) return [];
  const K = KL(),
    T = TT(),
    H = (S.huyHieu = S.huyHieu || {}),
    moi = [];
  HUY_HIEU.forEach((h) => {
    if (H[h.id]) return;
    let ok = false;
    try {
      ok = !!h.dk(K, T);
    } catch (e) {
      ok = false;
    }
    if (ok) {
      H[h.id] = S.day;
      moi.push(h);
    }
  });
  if (moi.length && !im) {
    sfx("lvup");
    toast(
      moi.length === 1 ? `🏅 Huy hiệu mới: ${moi[0].ic} ${moi[0].ten}` : `🏅 ${moi.length} huy hiệu mới: ${moi.map((h) => h.ic).join(" ")}`,
      3800,
      1,
    );
    if (typeof track === "function") moi.forEach((h) => track("huy-hieu-" + h.id));
  }
  return moi;
}

/* ---------- mục tiêu tuần ---------- */
const soTuan = (ngay) => Math.floor(((ngay == null ? S.day : ngay) - 1) / 7);
function tuanNay() {
  const so = soTuan();
  if (!S.tuan || S.tuan.so !== so) {
    const bac = S.day < 15 ? 0 : S.day < 45 ? 1 : 2,
      ds = MUC_TIEU_TUAN.filter((m) => {
        try {
          return !m.khi || m.khi();
        } catch (e) {
          return false;
        }
      });
    for (let i = ds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ds[i], ds[j]] = [ds[j], ds[i]];
    }
    S.tuan = { so, bac, muc: ds.slice(0, 3).map((m) => ({ k: m.k, n: m.n[bac], thuong: THUONG_TUAN[bac] })), dem: {}, xong: {} };
  }
  return S.tuan;
}
/* cộng tiến độ; max = lấy giá trị lớn nhất thay vì cộng dồn */
function demTuan(k, v, max) {
  if (typeof R === "undefined" || !R || R.challenge || !S) return;
  const W = tuanNay();
  v = v == null ? 1 : v;
  W.dem[k] = max ? Math.max(W.dem[k] || 0, v) : (W.dem[k] || 0) + v;
  W.muc.forEach((m) => {
    if (W.xong[m.k] || (W.dem[m.k] || 0) < m.n) return;
    W.xong[m.k] = true;
    S.money += m.thuong;
    S.cur.gift = (S.cur.gift || 0) + m.thuong;
    KL().tuanMuc = (KL().tuanMuc || 0) + 1;
    sfx("coin");
    toast(`🎯 Xong mục tiêu tuần: ${chuMuc(m)} · thưởng ${fmt(m.thuong)}`, 4000, 1);
    if (typeof track === "function") track("muc-tieu-tuan");
    head();
  });
}
function chuMuc(m) {
  const d = MUC_TIEU_TUAN.find((x) => x.k === m.k);
  return d ? d.chu.replace("{n}", d.tien ? fmtBig(m.n) : m.n) : m.k;
}
/* gọi từ serveOnline khi giao xong một đơn app */
function ghiDonApp(sao) {
  if (R.challenge) return;
  const K = KL();
  K.app = (K.app || 0) + 1;
  demTuan("app");
  if (sao >= 5) demTuan("sao5");
  xetHuyHieu();
}

/* ---------- tab Huy hiệu ---------- */
function paneHuyHieu() {
  xetHuyHieu(true);
  const W = tuanNay(),
    H = S.huyHieu || {},
    co = HUY_HIEU.filter((h) => H[h.id]).length,
    dau = W.so * 7 + 1;
  const muc = W.muc
    .map((m) => {
      const d = MUC_TIEU_TUAN.find((x) => x.k === m.k) || {},
        v = Math.min(m.n, W.dem[m.k] || 0),
        pt = Math.round((v / m.n) * 100);
      return `<div class="mtt${W.xong[m.k] ? " xong" : ""}"><span>${W.xong[m.k] ? "✓" : "○"} ${esc(chuMuc(m))}<small>${d.tien ? fmtBig(v) + " / " + fmtBig(m.n) : v + " / " + m.n} · thưởng ${fmt(m.thuong)}</small></span><i><b style="width:${pt}%"></b></i></div>`;
    })
    .join("");
  const nhom = [...new Set(HUY_HIEU.map((h) => h.nhom))];
  return `<div class="ttcard"><b>Mục tiêu tuần ${W.so + 1} · ngày ${dau}–${dau + 6}</b>${muc}<p class="note" style="margin:6px 0 0">Tuần tính theo ngày trong game. Nghỉ chơi không mất gì, tuần sau có mục tiêu mới.</p></div>
  <div class="sec">Huy hiệu · ${co}/${HUY_HIEU.length}</div>${nhom
    .map(
      (g) =>
        `<div class="hhnhom">${esc(g)}</div><div class="hhluoi">${HUY_HIEU.filter((h) => h.nhom === g)
          .map(
            (h) =>
              `<div class="hh${H[h.id] ? "" : " khoa"}" title="${esc(h.mo)}"><span class="hhic">${h.ic}</span><b>${esc(h.ten)}</b><small>${H[h.id] ? "Ngày " + H[h.id] : esc(h.mo)}</small></div>`,
          )
          .join("")}</div>`,
    )
    .join("")}`;
}
HEM_TAB.push([() => "🏅 Huy hiệu", paneHuyHieu]);

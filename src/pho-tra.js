/* ---------- PHỐ TRÀ: bảng xếp hạng với tiệm máy, danh thiếp tiệm, bạn bè thành khách VIP ----------
   Chạy hoàn toàn trên máy: bạn bè trao đổi mã qua Zalo, Messenger hoặc link. Nạp trước game.js. */

/* ---------- điểm tiệm ---------- */
function diemTiem() {
  const H = (S.history || []).slice(-7),
    tb = H.length ? H.reduce((a, r) => a + recRev(r), 0) / H.length : 0,
    trang = S.tr && S.tr.trang ? S.tr.trang.length : 0;
  return Math.round(
    rating() * 12 + Math.min(35, tb / 20000) + Math.min(25, Math.max(0, S.day - 1) * 0.4) + trang * 1.5 + ((S.buoc || 1) >= 2 ? 10 : 0),
  );
}
function diemMay(t, ngay) {
  let d = t.goc + t.tang * ngay;
  if (t.mot) d += t.mot.cao * Math.exp(-(((ngay - t.mot.dinh) / t.mot.rong) ** 2));
  return Math.round(d);
}
/* danh sách xếp hạng: tiệm máy, bạn bè (điểm lúc chia sẻ danh thiếp) và tiệm của mình */
function bangPhoTra() {
  const ds = PHO_TRA.filter((t) => !t.tuNgay || S.day >= t.tuNgay).map((t) => ({ id: t.id, ten: t.ten, diem: diemMay(t, S.day), tinh: t.tinh }));
  (S.banBe || []).forEach((b) => ds.push({ id: "ban-" + b.id, ten: b.ten, diem: b.diem || 0, tinh: "Tiệm của bạn bè · ngày " + b.ngay, ban: true }));
  ds.push({ id: "minh", ten: shopName(), diem: diemTiem(), minh: true });
  return ds.sort((a, b) => b.diem - a.diem);
}
const hangMinh = () => bangPhoTra().findIndex((x) => x.minh) + 1;
/* cuối ngày: báo khi lên hạng */
function phoTraCuoiNgay() {
  const h = hangMinh(),
    cu = S.hangCu || h;
  S.hangCu = h;
  return h < cu ? `<p class="lvup">🏆 Phố Trà: tiệm bạn lên hạng ${h} (trước là ${cu})</p>` : "";
}

/* ---------- danh thiếp tiệm ---------- */
function monTuHao() {
  const mon = (S.tr && S.tr.mon) || {},
    k = Object.entries(mon).sort((a, b) => b[1] - a[1])[0];
  return k ? k[0] : "tra||tcden|";
}
function maQuan() {
  const d = { v: 1, n: shopName().slice(0, 24), d: S.day, r: Math.round(rating() * 10) / 10, m: monTuHao(), p: diemTiem() },
    body = b64e(new TextEncoder().encode(JSON.stringify(d)));
  return "QN1." + body + "." + bakHash(body);
}
function docMaQuan(ma) {
  const m = String(ma || "").trim().match(/^QN1\.([A-Za-z0-9_-]+)\.([0-9a-z]+)$/);
  if (!m || bakHash(m[1]) !== m[2]) return null;
  try {
    const d = JSON.parse(new TextDecoder().decode(b64d(m[1])));
    if (!d || typeof d.n !== "string" || !Number.isInteger(d.d) || typeof d.m !== "string") return null;
    const [b] = d.m.split("|");
    if (!ITEMS[b]) return null;
    return { id: m[2], ten: d.n.slice(0, 24), ngay: d.d, sao: Math.max(1, Math.min(5, +d.r || 4)), mon: d.m, diem: Math.max(0, Math.min(200, Math.round(+d.p || 0))) };
  } catch (e) {
    return null;
  }
}
function nhapMaQuan(ma) {
  const b = docMaQuan(ma);
  if (!b) {
    toast("⚠️ Mã quán không đọc được", 3500, 1);
    return false;
  }
  S.banBe = (S.banBe || []).filter((x) => x.ten !== b.ten);
  S.banBe.unshift(b);
  S.banBe = S.banBe.slice(0, 20);
  save();
  toast(`🏠 Đã thêm tiệm ${b.ten}. Chủ tiệm sẽ ghé uống thử món ruột của họ!`, 4000, 1);
  return true;
}
const linkQuan = () => location.origin + location.pathname + "#q=" + maQuan();

/* ---------- bạn bè ghé làm khách VIP ---------- */
function banDen() {
  if (R.challenge || !R.running || R.t < 30 || !(S.banBe || []).length) return null;
  if (R.slots.some((c) => c && c.ban)) return null;
  S.banGhe = S.banGhe || {};
  const ds = S.banBe.filter((b) => !(S.day - (S.banGhe[b.id] || -99) < 3));
  if (!ds.length || Math.random() > 0.06) return null;
  return rnd(ds);
}
function spawnBan(i, b) {
  const [base, flav, tp, ch] = b.mon.split("|"),
    tops = tp ? tp.split("+") : [],
    can = [base, flav, ...tops].filter(Boolean),
    lv = level();
  let o;
  if (can.every((k) => ITEMS[k] && S.unlocked[k] && qty(k) > 0) && tops.length <= (lv >= 3 ? 4 : 1) && !ch)
    o = { base, flav: flav || null, tops, cheese: false, size: "M", so: null, sugar: lv >= 2 ? 50 : null, ice: lv >= 2 ? "Ít đá" : null };
  else {
    o = genOrder();
    for (let t = 0; t < 8 && o.so; t++) o = genOrder();
    o.so = null;
  }
  const max = (55 + (lv >= 2 ? 8 : 0)) * 1.4 * (S.upg.seats ? 1.25 : 1) * heSoCho();
  let h = 0;
  for (let k = 0; k < b.id.length; k++) h = (h * 31 + b.id.charCodeAt(k)) >>> 0;
  S.banGhe = S.banGhe || {};
  S.banGhe[b.id] = S.day;
  R.slots[i] = {
    ban: b.id,
    born: performance.now(),
    id: ++uid,
    who: h % 9,
    face: "🙂",
    name: "Chủ tiệm " + b.ten,
    say: thayTen("{Ban} ơi, mình là chủ tiệm " + b.ten + ". Cho mình", true),
    end: " để thử tay nghề nha!",
    cups: [o],
    done: [false],
    order: o,
    pat: max,
    max,
    wrong: 0,
    paid: 0,
  };
  renderStreet();
  sfx("bell");
  toast("🏠 Chủ tiệm " + b.ten + " ghé thăm!", 3500, 1);
}

/* ---------- tab Phố Trà ---------- */
function panePhoTra() {
  const bang = bangPhoTra(),
    i = bang.findIndex((x) => x.minh),
    tren = bang[i - 1];
  return `<div class="ttcard"><b>Phố Trà · hạng ${i + 1}/${bang.length}</b><p>Điểm tiệm ${bang[i].diem}: sao đánh giá, doanh thu 7 ngày, số ngày mở cửa, trang sổ công thức${(S.buoc || 1) >= 2 ? ", mặt tiền" : ""}.</p>${
    tren ? `<p class="lvup">Còn ${tren.diem - bang[i].diem + 1} điểm nữa là vượt ${esc(tren.ten)}</p>` : '<p class="lvup">Tiệm bạn đang đứng đầu Phố Trà!</p>'
  }</div>${bang
    .map(
      (x, k) =>
        `<div class="crow ptr${x.minh ? " minh" : ""}${x.ban ? " ban" : ""}"><span><b>${k + 1}.</b> ${esc(x.ten)}${x.tinh ? `<small>${esc(x.tinh)}</small>` : ""}</span><span>${x.diem}</span></div>`,
    )
    .join("")}
  <div class="sec">Danh thiếp tiệm</div><p class="note">Gửi danh thiếp cho bạn bè. Họ dán vào game thì tiệm bạn vào bảng Phố Trà của họ, và bạn thỉnh thoảng ghé tiệm họ làm khách VIP gọi món ruột của bạn.</p>
  <div class="askbtns"><button class="big" id="qnShare">Gửi danh thiếp tiệm</button></div>
  <textarea id="qnMa" class="rpin" placeholder="Dán link hoặc mã QN1… của bạn bè" style="min-height:60px;font-size:12px!important"></textarea><div class="askbtns"><button class="sbtn ghost" id="qnNhap">Thêm tiệm bạn bè</button></div>
  ${(S.banBe || []).length ? `<p class="note">Bạn bè: ${S.banBe.map((b) => esc(b.ten)).join(", ")}</p>` : ""}`;
}
function phoTraGan() {
  if ($("qnShare"))
    $("qnShare").onclick = () =>
      chiaSe(`Tiệm ${shopName()} 🧋 ngày ${S.day} · ${rating().toFixed(1).replace(".", ",")}★ · hạng ${hangMinh()} Phố Trà\nGhé tiệm mình trong Tiệm Trà Nhỏ: ${linkQuan()}`, "Danh thiếp tiệm");
  if ($("qnNhap"))
    $("qnNhap").onclick = () => {
      const v = $("qnMa").value,
        ma = (v.match(/QN1\.[^\s#&]+/) || [v])[0];
      if (nhapMaQuan(ma)) renderPrep();
    };
}
function hemBind() {
  ttGan();
  phoTraGan();
}
HEM_TAB.push([() => "🎯 Thử thách", paneThuThach], [() => "🏆 Phố Trà", panePhoTra]);

/* ---------- mở game bằng link có mã (#c= kết quả thử thách, #q= danh thiếp tiệm) ---------- */
function moTuLink() {
  const h = decodeURIComponent(location.hash || "");
  const c = h.match(/^#c=(TT1\.[^\s&]+)/),
    q = h.match(/^#q=(QN1\.[^\s&]+)/);
  if (!c && !q) return;
  try {
    history.replaceState(null, "", location.pathname + location.search);
  } catch (e) {}
  const lam = () => {
    if (!$("splash").hidden || !$("modal").hidden) return setTimeout(lam, 600);
    if (c) {
      const kq = ttDoc(c[1]);
      ask(
        kq.hopLe
          ? `<div class="pbig">${ico("trophy")}</div><h2>${esc(kq.ten)} rủ bạn so tài</h2><p>Thử thách ${ttNgayDep(kq.ngay)}: <b>${kq.chuan}/${TT_SO}</b> ly chuẩn · ${ttGio(kq.giay)}</p><pre class="ttluoi">${kq.luoi}</pre><p class="okline">✅ Đã kiểm chứng trên máy bạn</p>`
          : `<div class="pbig">${ico("warn")}</div><h2>Mã không hợp lệ</h2><p>${esc(kq.lyDo || "")}</p>`,
        kq.hopLe
          ? [
              ["Để sau", () => {}],
              [
                "Thêm vào bảng và chơi",
                () => {
                  ttLuuBang(kq, false);
                  save();
                  R.tab = "hem";
                  R.sub = R.sub || {};
                  R.sub.hem = HEM_TAB.findIndex((x) => x[1] === paneThuThach);
                  renderPrep();
                },
                1,
              ],
            ]
          : [["Đóng", () => {}, 1]],
      );
    } else if (q) {
      const b = docMaQuan(q[1]);
      ask(
        b
          ? `<div class="pbig">🏠</div><h2>Danh thiếp tiệm ${esc(b.ten)}</h2><p>Ngày ${b.ngay} · ${String(b.sao).replace(".", ",")}★ · ${b.diem} điểm Phố Trà</p><p>Thêm vào bảng Phố Trà? Chủ tiệm sẽ thỉnh thoảng ghé tiệm bạn gọi món ruột.</p>`
          : `<div class="pbig">${ico("warn")}</div><h2>Mã quán không hợp lệ</h2>`,
        b ? [["Để sau", () => {}], ["Thêm tiệm bạn", () => nhapMaQuan(q[1]) && renderPrep(), 1]] : [["Đóng", () => {}, 1]],
      );
    }
  };
  setTimeout(lam, 800);
}


/* ---------- HÌNH NHÀ VÀ XE (tab Đời sống) ----------
   Vẽ bằng SVG theo nét của game (viền nâu, màu dịu). Xe nhìn ngang, đầu xe bên phải; không vẽ logo hãng.
   hinhXe(x) và hinhNha(x) nhận một mục trong data/doi-song.js (kieu, mau, ...). Nạp trước game.js. */

const HV = 'stroke="#5b3a29" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
const hSvg = (w, h, noi, nhan) =>
  `<svg class="dshinh" viewBox="0 0 ${w} ${h}" role="img" aria-label="${nhan || ""}" xmlns="http://www.w3.org/2000/svg">${noi}</svg>`;
const banh = (x, y, r) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#3b3a40" ${HV}/><circle cx="${x}" cy="${y}" r="${r * 0.42}" fill="#d9d6d0" stroke="#5b3a29" stroke-width="1.6"/>`;
const banhDap = (x, y, r) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#3b3a40" stroke-width="3.2"/><circle cx="${x}" cy="${y}" r="2.4" fill="#5b3a29"/>`;
const bong = (x1, x2, y) => `<ellipse cx="${(x1 + x2) / 2}" cy="${y}" rx="${(x2 - x1) / 2}" ry="3.5" fill="#5b3a29" opacity=".15"/>`;

/* thân ô tô theo kiểu: [thân, kính, bánh sau, bánh trước, bán kính bánh] */
const THAN_OTO = {
  mini: ["M34 68L34 48Q34 42 40 40L50 38L58 22Q60 18 66 18L108 18Q116 18 118 24L124 40Q132 42 132 50L132 68Z", "M62 24L106 24Q111 24 113 28L118 38L56 38Z", 54, 112, 12],
  hatch: ["M22 68L22 52Q22 44 32 42L52 40L66 26Q70 22 78 22L112 22Q120 22 124 30L134 44Q140 46 140 54L140 68Z", "M70 28L110 28Q116 28 119 33L126 42L60 42Z", 44, 118, 12],
  sedan: ["M14 68L14 54Q14 48 24 46L50 44L66 28Q70 24 78 24L108 24Q114 24 118 28L130 42L146 44Q152 46 152 54L152 68Z", "M70 30L106 30Q111 30 114 34L122 42L60 42Z", 38, 128, 12],
  suv: ["M16 68L16 50Q16 42 26 40L48 38L62 20Q66 16 74 16L118 16Q126 16 130 22L140 36Q148 38 148 48L148 68Z", "M66 22L116 22Q122 22 125 27L132 36L56 36Z", 40, 124, 13],
  suv7: ["M10 68L10 48Q10 40 20 38L40 36L52 16Q55 12 62 12L134 12Q142 12 144 18L148 34Q154 36 154 46L154 68Z", "M56 18L132 18Q138 18 140 22L143 34L46 34Z", 36, 128, 13],
  sang: ["M10 68L10 56Q10 50 22 48L50 46L68 30Q72 26 82 26L110 26Q118 26 124 32L136 44L150 46Q156 48 156 56L156 68Z", "M72 32L110 32Q116 32 120 36L128 44L62 44Z", 36, 132, 12],
  suv_tt: ["M14 68L14 50Q14 42 24 40L46 38L62 22Q68 18 78 18L104 18Q116 18 126 28L142 40Q150 42 150 50L150 68Z", "M68 24L104 24Q113 24 120 30L128 38L56 38Z", 40, 126, 13],
  the_thao: ["M12 68L12 58Q12 50 22 46Q40 30 62 26Q78 24 90 26Q104 30 118 42L144 48Q152 50 152 58L152 68Z", "M50 36Q62 30 76 30Q88 30 98 34L108 42L44 42Z", 36, 128, 12],
};
function hinhOto(x) {
  const [than, kinh, b1, b2, r] = THAN_OTO[x.kieu] || THAN_OTO.sedan,
    dau = { mini: 128, hatch: 136, sedan: 148, suv: 144, suv7: 150, sang: 152, suv_tt: 146, the_thao: 146 }[x.kieu] || 146,
    duoi = { mini: 36, hatch: 24, sedan: 16, suv: 18, suv7: 12, sang: 12, suv_tt: 16, the_thao: 14 }[x.kieu] || 16,
    denTruoc =
      x.kieu === "the_thao"
        ? `<circle cx="${dau - 4}" cy="52" r="4" fill="#fff4b0" ${HV}/>`
        : `<rect x="${dau - 7}" y="50" width="8" height="5" rx="2" fill="#fff4b0" stroke="#5b3a29" stroke-width="1.6"/>`,
    tru = x.kieu === "the_thao" ? "" : `<path d="M${(b1 + b2) / 2 + 4} ${x.kieu === "suv7" ? 18 : 24}V${x.kieu === "sang" ? 44 : 40}" stroke="#5b3a29" stroke-width="2.4"/>`,
    vien = x.kieu === "sang" ? `<path d="M22 58H148" stroke="#e8e6e0" stroke-width="2"/>` : x.kieu === "mini" ? `<path d="M40 56H126" stroke="#ffffff" stroke-width="2" opacity=".7"/>` : "";
  return hSvg(
    160,
    90,
    `${bong(b1 - r - 6, b2 + r + 6, 84)}<path d="${than}" fill="${x.mau}" ${HV}/><path d="${kinh}" fill="${x.kinh || "#cfe8f5"}" ${HV}/>${tru}${vien}${denTruoc}<rect x="${duoi - 2}" y="50" width="5" height="6" rx="1.5" fill="#e84a5f" stroke="#5b3a29" stroke-width="1.6"/>${banh(b1, 70, r)}${banh(b2, 70, r)}`,
    x.ten,
  );
}
/* xe hai bánh */
function hinhXeMay(x) {
  const m = x.mau,
    ngoi = (a, b, y) => `<path d="M${a} ${y}Q${a} ${y - 6} ${a + 6} ${y - 6}L${b - 4} ${y - 6}Q${b} ${y - 6} ${b} ${y}Z" fill="#4a3a35" ${HV}/>`;
  let than;
  if (x.kieu === "dap")
    than = `${banhDap(44, 66, 16)}${banhDap(116, 66, 16)}<path d="M44 66L70 40L106 40L116 66M70 40L82 66L106 40M82 66L44 66M66 34L76 34M104 30L110 40M100 30L112 30" fill="none" stroke="${m}" stroke-width="4" stroke-linecap="round"/><path d="M44 66L70 40L106 40L116 66" fill="none" ${HV} opacity=".35"/>`;
  else if (x.kieu === "so")
    than = `${banh(46, 68, 13)}${banh(116, 68, 13)}<path d="M116 68L110 30M104 26L120 24" fill="none" ${HV}/><path d="M34 54Q44 42 66 44L92 44Q100 44 104 36L110 28L118 34L110 50L94 56L60 58Z" fill="${m}" ${HV}/><rect x="70" y="50" width="24" height="12" rx="4" fill="#a9a6a0" ${HV}/>${ngoi(52, 90, 42)}`;
  else if (x.kieu === "con_tay")
    than = `${banh(46, 68, 13)}${banh(116, 68, 13)}<path d="M116 68L108 30M100 26L118 26" fill="none" ${HV}/><path d="M36 50L58 42L84 38Q96 34 102 28L112 26L118 38L108 52L86 58L62 58Z" fill="${m}" ${HV}/><path d="M70 40Q84 30 98 32L100 42L72 46Z" fill="${x.mau2 || "#2d2f36"}" ${HV}/><rect x="70" y="52" width="22" height="10" rx="4" fill="#a9a6a0" ${HV}/>${ngoi(44, 72, 42)}`;
  else {
    /* tay ga: yếm trước cao, sàn để chân thấp, yên trên bánh sau; cao cấp thì bánh to, có viền crôm */
    const r = x.kieu === "ga_cao" ? 15 : 13,
      y = 67;
    than = `<path d="M117 ${y}L112 26" fill="none" ${HV}/><path d="M24 58Q24 42 46 40L84 40Q90 40 90 47L92 55L102 55Q100 38 110 26L114 21L121 22Q127 36 124 50L116 52Q108 55 102 60L40 60Q26 60 24 58Z" fill="${m}" ${HV}/><path d="M46 40Q46 32 54 32L80 32Q86 32 86 40Z" fill="#4a3a35" ${HV}/><path d="M113 22L110 15M103 14L120 13" fill="none" ${HV}/><rect x="119" y="28" width="6" height="5" rx="1.5" fill="#fff4b0" stroke="#5b3a29" stroke-width="1.4"/>${
      x.kieu === "ga_cao" ? `<path d="M30 52Q52 50 88 50" stroke="#e8e6e0" stroke-width="3" fill="none"/>` : ""
    }${banh(44, y, r)}${banh(118, y, r)}`;
  }
  return hSvg(160, 90, `${bong(24, 138, 84)}${than}`, x.ten);
}
const hinhXe = (x) => (["dap", "so", "ga", "ga_cao", "con_tay"].includes(x.kieu) ? hinhXeMay(x) : hinhOto(x));

/* cửa sổ lưới cho toà nhà; o = những ô sáng (căn của bạn) */
function luoiCua(x0, y0, cot, hang, w, h, gx, gy, sang) {
  let s = "";
  for (let i = 0; i < hang; i++)
    for (let j = 0; j < cot; j++) {
      const k = i * cot + j;
      s += `<rect x="${x0 + j * gx}" y="${y0 + i * gy}" width="${w}" height="${h}" rx="1.5" fill="${sang.includes(k) ? "#ffd76a" : "#cfe0ea"}" stroke="#5b3a29" stroke-width="1.4"/>`;
    }
  return s;
}
const cay = (x, y, r) => `<path d="M${x} ${y}V${y - r}" stroke="#8a5a3b" stroke-width="3"/><circle cx="${x}" cy="${y - r - r * 0.6}" r="${r}" fill="#7cc38f" ${HV}/>`;
function hinhNha(x) {
  const m = x.mau || "#f3e3c8",
    dat = `<path d="M0 92H160" stroke="#5b3a29" stroke-width="2.4"/>`;
  let noi = "";
  if (x.kieu === "tro") {
    /* dãy phòng trọ một tầng, cửa sắt xanh */
    const phong = x.phong || 4;
    noi = `<rect x="18" y="46" width="124" height="46" fill="${m}" ${HV}/><path d="M12 48L80 30L148 48Z" fill="#c9a27a" ${HV}/>${Array.from({ length: phong }, (_, i) => {
      const cx = 24 + i * (116 / phong);
      return `<rect x="${cx + 4}" y="60" width="${116 / phong - 14}" height="32" fill="${i === (x.sang ?? 0) ? "#7fb7a4" : "#9fb8c4"}" ${HV}/>`;
    }).join("")}${dat}`;
  } else if (x.kieu === "can_ho") {
    /* chung cư: căn của bạn là mấy ô cửa sáng (có ban công nếu bancong); cao thì có toà tháp bên cạnh, song thì có sông */
    const tang = Math.min(x.tang || 6, 8),
      w = x.rong || 60,
      cx = x.cao ? 70 : 80,
      x0 = cx - w / 2,
      h = tang * 10 + 8,
      y0 = 92 - h,
      cot = Math.floor((w - 8) / 12),
      sang = x.sang || [cot + 1];
    let cua = "";
    for (let i = 0; i < tang - 1; i++)
      for (let j = 0; j < cot; j++) {
        const k = i * cot + j,
          wx = x0 + 6 + j * 12 + (w - 8 - cot * 12) / 2,
          wy = y0 + 6 + i * 10,
          on = sang.includes(k);
        cua += `<rect x="${wx}" y="${wy}" width="8" height="6" rx="1.2" fill="${on ? "#ffd76a" : "#cfe0ea"}" stroke="#5b3a29" stroke-width="1.3"/>`;
        if (on && x.bancong) cua += `<path d="M${wx - 1.5} ${wy + 8.5}H${wx + 9.5}" stroke="#5b3a29" stroke-width="1.8"/><circle cx="${wx + 9}" cy="${wy + 6.5}" r="2" fill="#7cc38f" stroke="#5b3a29" stroke-width="1.1"/>`;
      }
    noi = `${x.song ? `<rect x="0" y="82" width="160" height="10" fill="#9fd0e6"/><path d="M8 87q5 -3 10 0t10 0M118 88q5 -3 10 0t10 0" stroke="#fff" stroke-width="1.6" fill="none"/>` : cay(18, 92, 9) + cay(144, 92, 8)}${
      x.cao ? `<rect x="${x0 + w + 6}" y="10" width="22" height="${x.song ? 72 : 82}" fill="#dbe6ee" ${HV}/><path d="M${x0 + w + 12} 18V${x.song ? 76 : 86}M${x0 + w + 22} 18V${x.song ? 76 : 86}" stroke="#9fb5c4" stroke-width="2"/>` : ""
    }<rect x="${x0 + 6}" y="${y0 - 6}" width="12" height="6" fill="#d9d2c4" stroke="#5b3a29" stroke-width="1.6"/><rect x="${x0}" y="${y0}" width="${w}" height="${h - (x.song ? 10 : 0)}" fill="${m}" ${HV}/>${cua}<path d="M${cx - 10} ${x.song ? 76 : 82}H${cx + 10}" stroke="#5b3a29" stroke-width="2.4"/><rect x="${cx - 5}" y="${x.song ? 76 : 82}" width="10" height="${x.song ? 6 : 10}" fill="#c8986a" stroke="#5b3a29" stroke-width="1.6"/>${dat}`;
  } else if (x.kieu === "nha_hem") {
    /* nhà ống 1 trệt 2 lầu, ban công có chậu cây, Mướp nằm trước cửa */
    noi = `<rect x="18" y="40" width="30" height="52" fill="#e6d2b5" ${HV}/><rect x="112" y="46" width="30" height="46" fill="#d9c4a4" ${HV}/><rect x="52" y="18" width="56" height="74" fill="${m}" ${HV}/><rect x="52" y="12" width="56" height="8" fill="#c96f5a" ${HV}/>${[24, 48].map((y) => `<rect x="60" y="${y}" width="40" height="14" fill="#cfe0ea" ${HV}/><path d="M56 ${y + 18}H104" stroke="#5b3a29" stroke-width="2"/><circle cx="62" cy="${y + 14}" r="3" fill="#7cc38f" stroke="#5b3a29" stroke-width="1.4"/><circle cx="98" cy="${y + 14}" r="3" fill="#f07c95" stroke="#5b3a29" stroke-width="1.4"/>`).join("")}<rect x="62" y="70" width="36" height="22" fill="#8fb6a8" ${HV}/><path d="M80 70V92" stroke="#5b3a29" stroke-width="1.6"/><g transform="translate(110 88)"><path d="M-9 1q-5 -4 -3 -8" fill="none" stroke="#5b3a29" stroke-width="1.6"/><ellipse cx="-2" cy="0" rx="7" ry="4" fill="#f0a64a" stroke="#5b3a29" stroke-width="1.4"/><path d="M3 -3l1 -5l2 2l2 -2l1 5z" fill="#f0a64a" stroke="#5b3a29" stroke-width="1.2" stroke-linejoin="round"/><circle cx="6" cy="-2" r="3.6" fill="#f0a64a" stroke="#5b3a29" stroke-width="1.4"/></g>${dat}`;
  } else if (x.kieu === "nha_pho") {
    noi = `<rect x="34" y="10" width="92" height="82" fill="${m}" ${HV}/>${luoiCua(42, 16, 4, 3, 16, 12, 20, 16, [5])}<path d="M30 64H130L124 72H36Z" fill="#ef6f8e" ${HV}/><rect x="42" y="72" width="76" height="20" fill="#9aa3ab" ${HV}/><path d="M42 77H118M42 82H118M42 87H118" stroke="#5b3a29" stroke-width="1.2"/>${cay(20, 92, 8)}${dat}`;
  } else {
    /* biệt thự sân vườn */
    noi = `${cay(16, 92, 10)}${cay(146, 92, 9)}<rect x="28" y="44" width="104" height="48" fill="${m}" ${HV}/><path d="M20 46L80 18L140 46Z" fill="#b2573f" ${HV}/><rect x="36" y="54" width="18" height="14" fill="#ffd76a" ${HV}/><rect x="106" y="54" width="18" height="14" fill="#cfe0ea" ${HV}/><rect x="70" y="62" width="20" height="30" rx="8" fill="#c8986a" ${HV}/><rect x="96" y="86" width="44" height="6" rx="3" fill="#8fd3ea" stroke="#5b3a29" stroke-width="1.6"/>${dat}`;
  }
  return hSvg(160, 100, noi, x.ten);
}

/* ---------- hình đồ dùng và quà (80 x 80): kieu = loại hình, mau = màu chính ---------- */
function hinhDo(x) {
  if (x.kieu === "so" || x.kieu === "ga" || x.kieu === "dap") return hinhXe(x); /* quà là xe máy */
  const m = x.mau || "#9fb5c4",
    m2 = x.mau2 || "#5b3a29";
  let s = "";
  switch (x.kieu) {
    case "dt": /* điện thoại: cam = số ống kính, gap = màn gập */
      s = x.gap
        ? `<rect x="14" y="14" width="24" height="52" rx="5" fill="${m}" ${HV}/><rect x="40" y="14" width="24" height="52" rx="5" fill="${m}" ${HV}/><rect x="18" y="19" width="42" height="42" rx="2" fill="#cfe8f5" stroke="#5b3a29" stroke-width="1.4"/><path d="M39 16V64" stroke="#5b3a29" stroke-width="1.6"/>`
        : `<rect x="24" y="8" width="32" height="64" rx="7" fill="${m}" ${HV}/><rect x="28" y="13" width="24" height="52" rx="3" fill="#cfe8f5" stroke="#5b3a29" stroke-width="1.4"/><rect x="36" y="15" width="8" height="2.5" rx="1.2" fill="#5b3a29"/>${
            x.cam ? `<rect x="56" y="12" width="${x.cam > 2 ? 14 : 10}" height="${x.cam > 2 ? 16 : 12}" rx="3" fill="${m}" stroke="#5b3a29" stroke-width="1.4"/>${Array.from({ length: x.cam }, (_, i) => `<circle cx="${60 + (i % 2) * 5}" cy="${16 + Math.floor(i / 2) * 6}" r="1.8" fill="#3b3a40"/>`).join("")}` : ""
          }`;
      break;
    case "laptop":
      s = `<rect x="16" y="16" width="48" height="32" rx="3" fill="${m}" ${HV}/><rect x="20" y="20" width="40" height="24" rx="1.5" fill="#cfe8f5" stroke="#5b3a29" stroke-width="1.3"/><path d="M8 54H72L66 60H14Z" fill="${m}" ${HV}/>`;
      break;
    case "dong_ho": /* tron hoặc vuông, dây màu m2 */
      s = `<rect x="32" y="6" width="16" height="68" rx="6" fill="${m2}" ${HV}/>${
        x.vuong ? `<rect x="22" y="24" width="36" height="34" rx="9" fill="${m}" ${HV}/><rect x="27" y="29" width="26" height="24" rx="6" fill="#2d2f36"/>` : `<circle cx="40" cy="40" r="19" fill="${m}" ${HV}/><circle cx="40" cy="40" r="14" fill="${x.mat || "#fffaf0"}" stroke="#5b3a29" stroke-width="1.3"/><path d="M40 40V30M40 40L47 44" stroke="#5b3a29" stroke-width="2"/>`
      }`;
      break;
    case "tui": /* dang: tote | flap | birkin */
      s =
        x.dang === "flap"
          ? `<path d="M26 18Q40 4 54 18" fill="none" stroke="#c9a24a" stroke-width="3"/><rect x="14" y="28" width="52" height="38" rx="6" fill="${m}" ${HV}/><path d="M14 30H66V44Q40 54 14 44Z" fill="${m}" ${HV}/><rect x="36" y="42" width="8" height="6" rx="1.5" fill="#e3c26a" stroke="#5b3a29" stroke-width="1.2"/>`
          : x.dang === "birkin"
            ? `<path d="M28 30Q28 14 40 14Q52 14 52 30" fill="none" ${HV}/><path d="M12 32H68L64 68H16Z" fill="${m}" ${HV}/><path d="M12 32L24 44H56L68 32" fill="${m}" ${HV}/><rect x="36" y="42" width="8" height="8" rx="1.5" fill="#e3c26a" stroke="#5b3a29" stroke-width="1.2"/>`
            : `<path d="M28 30Q28 12 40 12Q52 12 52 30" fill="none" ${HV}/><path d="M14 28H66L62 70H18Z" fill="${m}" ${HV}/>${x.hoaVan ? `<path d="M20 38H60M22 50H58M24 62H56" stroke="#c9a24a" stroke-width="2" stroke-dasharray="2 4"/>` : ""}`;
      break;
    case "ao":
      s = `<path d="M26 12L14 20L8 38L18 42L22 32V70H58V32L62 42L72 38L66 20L54 12Q40 22 26 12Z" fill="${m}" ${HV}/><path d="M40 20V70" stroke="#5b3a29" stroke-width="1.6"/>`;
      break;
    case "giay":
      s = `<path d="M8 50Q10 34 24 34L36 36Q44 44 60 46Q72 48 72 58L72 62H8Z" fill="${m}" ${HV}/><path d="M8 62H72" stroke="#5b3a29" stroke-width="4"/><path d="M28 40L40 50M34 38L44 48" stroke="#fff" stroke-width="2"/>`;
      break;
    case "nuoc_hoa":
      s = `<rect x="34" y="10" width="12" height="10" rx="2" fill="#e3c26a" ${HV}/><rect x="22" y="20" width="36" height="48" rx="6" fill="${m}" ${HV} opacity=".9"/><rect x="30" y="36" width="20" height="14" rx="2" fill="#fffaf0" stroke="#5b3a29" stroke-width="1.3"/>`;
      break;
    case "tv":
      s = `<rect x="6" y="12" width="68" height="44" rx="4" fill="#2d2f36" ${HV}/><rect x="10" y="16" width="60" height="36" rx="2" fill="${m}"/><path d="M30 64L40 56L50 64" fill="none" ${HV}/><path d="M24 66H56" ${HV}/>`;
      break;
    case "tu_lanh":
      s = `<rect x="20" y="6" width="40" height="68" rx="5" fill="${m}" ${HV}/><path d="M20 30H60" stroke="#5b3a29" stroke-width="2"/><path d="M26 16V24M26 36V48" stroke="#5b3a29" stroke-width="3"/>`;
      break;
    case "may_lanh":
      s = `<rect x="6" y="18" width="68" height="26" rx="6" fill="${m}" ${HV}/><path d="M12 38H68" stroke="#5b3a29" stroke-width="1.6"/><path d="M20 52q4 6 0 12M40 52q4 6 0 12M60 52q4 6 0 12" fill="none" stroke="#8fd3ea" stroke-width="2.4"/>`;
      break;
    case "may_giat":
      s = `<rect x="14" y="8" width="52" height="64" rx="6" fill="${m}" ${HV}/><path d="M14 22H66" stroke="#5b3a29" stroke-width="2"/><circle cx="40" cy="46" r="16" fill="#cfe8f5" ${HV}/><circle cx="56" cy="15" r="3" fill="#5b3a29"/>`;
      break;
    case "loc_nuoc":
      s = `<rect x="22" y="8" width="36" height="64" rx="6" fill="${m}" ${HV}/><rect x="28" y="16" width="24" height="18" rx="3" fill="#8fd3ea" stroke="#5b3a29" stroke-width="1.3"/><path d="M40 44V52M36 52H44" ${HV}/><path d="M40 56q-4 6 0 8q4 -2 0 -8z" fill="#8fd3ea" stroke="#5b3a29" stroke-width="1.2"/>`;
      break;
    case "ghe":
      s = `<path d="M18 12Q18 6 26 6H46Q54 6 54 14V44H18Z" fill="${m}" ${HV}/><path d="M12 44H62Q68 44 66 52L62 58H16L12 52Z" fill="${m}" ${HV}/><path d="M22 58L18 72M56 58L60 72" ${HV}/><path d="M26 16H46M26 26H46M26 36H46" stroke="#5b3a29" stroke-width="1.4"/>`;
      break;
    case "vang": /* nhẫn hoặc dây chuyền */
      s = x.day
        ? `<path d="M16 12Q40 70 64 12" fill="none" stroke="#e3b93c" stroke-width="4" stroke-dasharray="3 2"/><circle cx="40" cy="58" r="8" fill="#f2cf5b" ${HV}/>`
        : `<circle cx="40" cy="46" r="18" fill="none" stroke="#e3b93c" stroke-width="7"/><circle cx="40" cy="46" r="18" fill="none" stroke="#5b3a29" stroke-width="1.6"/><path d="M34 26L40 18L46 26Z" fill="#f2cf5b" ${HV}/>`;
      break;
    case "may_bay":
      s = `<path d="M8 44L30 40L52 14Q58 8 62 12Q64 16 58 22L46 42L68 58L64 62L40 52L26 62L20 60L26 48L10 48Z" fill="${m}" ${HV}/>`;
      break;
    case "nha_que":
      s = `<rect x="16" y="36" width="48" height="34" fill="${m}" ${HV}/><path d="M8 38L40 14L72 38Z" fill="${x.mau2 || "#b2573f"}" ${HV}/><rect x="34" y="50" width="12" height="20" fill="#c8986a" stroke="#5b3a29" stroke-width="1.4"/><rect x="22" y="44" width="8" height="8" fill="#ffd76a" stroke="#5b3a29" stroke-width="1.3"/>`;
      break;
    case "suc_khoe":
      s = `<path d="M40 70Q8 48 10 26Q14 10 30 12Q38 14 40 22Q42 14 50 12Q66 10 70 26Q72 48 40 70Z" fill="${m}" ${HV}/><path d="M40 30V52M29 41H51" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
      break;
    case "phong_bi":
      s = `<rect x="14" y="14" width="52" height="56" rx="4" fill="${m}" ${HV}/><path d="M14 18L40 38L66 18" fill="none" ${HV}/><circle cx="40" cy="50" r="7" fill="#f2cf5b" stroke="#5b3a29" stroke-width="1.4"/>`;
      break;
    default:
      s = `<circle cx="40" cy="40" r="26" fill="${m}" ${HV}/>`;
  }
  return hSvg(80, 80, s, x.ten);
}

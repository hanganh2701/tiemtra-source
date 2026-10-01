/* ---------- TRANH CẢNH: tranh nhỏ ở đầu mỗi cảnh truyện (bản 5.6) ----------
   Mỗi cảnh = bối cảnh vẽ bằng SVG (quầy dưới gác, mặt tiền, con hẻm, căn gác, chợ, quê, bến xe, đầu hẻm, cổng trường, điện thoại)
   + giờ (cảnh trước giờ mở cửa là buổi sáng, sau giờ đóng cửa là buổi tối) + thời tiết, mùa lễ (mưa, Trung Thu, Tết)
   + mặt những người đang nói trong cảnh (ảnh gốc của game: img/faces.webp, img/star.webp, Mướp, mẹ).
   Bối cảnh từng cảnh: TRANH_CANH (data/tranh-canh.js), cảnh không ghi thì đoán theo luật trong tranhCua. Nạp trước game.js. */

const TC_W = 320,
  TC_H = 140,
  TC_NET = "#6e5143"; /* màu nét viền, cùng tông nâu với tranh của game */
let tcSo = 0; /* id gradient không trùng giữa các tranh */

/* ---------- mảnh dùng chung ---------- */
const tcNet = (w = 1.4) => `stroke="${TC_NET}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
function tcTroi(gio, id) {
  const dem = gio === "toi";
  const may = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="${dem ? "#8a7db0" : "#fffaf3"}" opacity="${dem ? 0.55 : 0.95}"><ellipse cx="0" cy="0" rx="16" ry="7"/><ellipse cx="10" cy="-4" rx="10" ry="7"/><ellipse cx="-9" cy="-3" rx="8" ry="5"/></g>`;
  return `<defs><linearGradient id="tr${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dem ? "#2f2c5c" : "#ffd9c2"}"/><stop offset="1" stop-color="${dem ? "#7d6a9c" : "#fff3e6"}"/></linearGradient></defs>
  <rect width="${TC_W}" height="${TC_H}" fill="url(#tr${id})"/>
  ${
    dem
      ? `<circle cx="276" cy="22" r="10" fill="#fff3c4"/><circle cx="272" cy="20" r="2" fill="#efe0a8"/><g fill="#fff8dc">${[
          [30, 14], [62, 30], [110, 10], [160, 22], [208, 12], [240, 34], [300, 44], [14, 40],
        ]
          .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 0.9 : 1.4}"/>`)
          .join("")}</g>`
      : `<circle cx="280" cy="22" r="11" fill="#ffd27a" opacity=".9"/>`
  }${may(60, 20, 1)}${may(200, 14, 0.8)}`;
}
const tcDat = (mau = "#ecdcc8") => `<rect y="112" width="${TC_W}" height="${TC_H - 112}" fill="${mau}"/><path d="M0 112H320" ${tcNet(1.2)}/>`;
function tcLy(x, y, mau) {
  return `<g transform="translate(${x} ${y})"><path d="M-5 -14H5L4 0H-4Z" fill="${mau}" ${tcNet(1)}/><ellipse cx="0" cy="-14" rx="6" ry="1.8" fill="#fffaf2" ${tcNet(0.9)}/><path d="M1 -14L3 -21" ${tcNet(1.2)}/><g fill="#5a3d2e"><circle cx="-2" cy="-3" r="1"/><circle cx="1" cy="-2" r="1"/><circle cx="2.5" cy="-4" r="1"/></g></g>`;
}
/* mái hiên sọc có viền lượn sóng */
function tcMaiHien(x0, x1, y, cao, m1, m2) {
  const n = Math.round((x1 - x0) / 18),
    w = (x1 - x0) / n;
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = x0 + i * w;
    s += `<path d="M${x} ${y}h${w}v${cao}a${w / 2} ${w / 3} 0 0 1 ${-w} 0z" fill="${i % 2 ? m2 : m1}" ${tcNet(1.1)}/>`;
  }
  return s;
}
function tcCay(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-7 -12H7L5 0H-5Z" fill="#f2a385" ${tcNet(1)}/><g fill="#7fbf8e" ${tcNet(1)}><ellipse cx="-5" cy="-18" rx="4" ry="8" transform="rotate(-25 -5 -18)"/><ellipse cx="5" cy="-18" rx="4" ry="8" transform="rotate(25 5 -18)"/><ellipse cx="0" cy="-22" rx="4" ry="9"/></g></g>`;
}
function tcDenLong(x, y, mau = "#f6a8a0") {
  return `<g transform="translate(${x} ${y})"><path d="M0 -10V-4" ${tcNet(1)}/><ellipse cx="0" cy="3" rx="6" ry="8" fill="${mau}" ${tcNet(1)}/><path d="M-4 -4h8M-4 10h8M0 11v4" ${tcNet(1)}/></g>`;
}
function tcMeo(x, y) {
  /* Mướp nằm cuộn tròn ngủ: mình kem, đốm cam */
  return `<g transform="translate(${x} ${y})"><path d="M-14 0Q-16 -12 -2 -12Q12 -13 13 -3Q14 0 10 0Z" fill="#fff6ea" ${tcNet(1.1)}/><path d="M-6 -11Q-1 -14 4 -11Q2 -6 -4 -7Z" fill="#f2b06b"/><circle cx="10" cy="-7" r="5.5" fill="#fff6ea" ${tcNet(1.1)}/><path d="M7 -11L8 -15L11 -12M12 -12L14 -15L14 -10" fill="#fff6ea" ${tcNet(1)}/><path d="M8 -7q1 1 2 0M11.5 -7q1 1 2 0" ${tcNet(0.8)} fill="none"/><path d="M-14 -1Q-20 -3 -16 -8" fill="none" ${tcNet(1.3)}/><text x="-6" y="-16" font-size="6" fill="${TC_NET}" font-family="Baloo 2,sans-serif">z</text></g>`;
}

/* mặt bằng đầu hẻm trước khi chuỗi Mây Tea mở (Chương 0–1): cửa cuốn, tấm bảng cho thuê */
function tcChoThue() {
  return `<rect x="138" y="26" width="176" height="86" fill="#efe6dc" ${tcNet()}/><rect x="150" y="44" width="152" height="68" fill="#d8d4cf" ${tcNet(1)}/>${Array.from({ length: 8 }, (_, i) => `<path d="M150 ${52 + i * 8}h152" stroke="#b8b0a8" stroke-width="1"/>`).join("")}
    <rect x="186" y="58" width="80" height="22" rx="2" fill="#fffaf2" ${tcNet(1)}/><text x="226" y="73" text-anchor="middle" font-size="9" font-weight="800" font-family="Baloo 2,sans-serif" fill="#e8504a">CHO THUÊ</text>`;
}
/* ---------- bối cảnh: mỗi cái trả về hình và các điểm đèn để buổi tối toả sáng ---------- */
const TC_NEN = {
  /* tiệm dưới căn gác của bà Sáu */
  quay: () => ({
    hinh: `${tcDat()}<rect x="36" y="12" width="248" height="100" fill="#f7e2cc" ${tcNet()}/>
      <rect x="118" y="20" width="10" height="30" fill="#9cc5a8" ${tcNet(1)}/><rect x="192" y="20" width="10" height="30" fill="#9cc5a8" ${tcNet(1)}/>
      <rect x="128" y="20" width="64" height="30" rx="2" fill="#cfe6ea" class="kinh" ${tcNet()}/><path d="M160 20V50M128 35H192" ${tcNet(1)}/>
      <rect x="124" y="50" width="72" height="6" fill="#c98f6b" ${tcNet(1)}/><g fill="#ef6f8e">${[130, 140, 150, 170, 180, 190].map((x) => `<circle cx="${x}" cy="49" r="2.4"/>`).join("")}</g>
      <rect x="72" y="74" width="176" height="18" fill="#f1d5b8" ${tcNet(1)}/>
      <g>${[84, 100, 116, 196, 212, 228].map((x, i) => `<rect x="${x}" y="78" width="9" height="12" rx="2" fill="${["#e9b48a", "#cfe3cf", "#f6c3c3"][i % 3]}" ${tcNet(0.9)}/>`).join("")}</g>
      ${tcMaiHien(54, 266, 60, 10, "#f29bb0", "#fff3ea")}
      ${tcDenLong(62, 82)}${tcDenLong(258, 82)}
      <rect x="66" y="92" width="188" height="6" fill="#c9976b" ${tcNet()}/>
      ${["#f3c9c9", "#cfe3cf", "#f6e0b5", "#d9d2ef", "#f3c9c9", "#cfe3cf", "#f6e0b5", "#d9d2ef"].map((c, i) => `<rect x="${72 + i * 22}" y="98" width="22" height="14" fill="${c}" ${tcNet(1)}/>`).join("")}
      ${tcLy(96, 92, "#c58f62")}${tcLy(110, 92, "#9fcf8a")}${tcLy(124, 92, "#f2a7b4")}
      <rect x="40" y="84" width="22" height="26" rx="2" fill="#2f4a3a" ${tcNet()}/><path d="M44 90h12M44 95h9M44 100h13M44 105h7" stroke="#f4efe2" stroke-width="1"/>
      ${tcCay(272, 112)}`,
    den: [[62, 85, 18], [258, 85, 18], [160, 35, 26], [160, 82, 34]],
    meo: [222, 92],
  }),
  /* mặt tiền đầu hẻm: bảng hiệu tên tiệm, mái hiên xanh, cửa kính */
  mattien: () => ({
    hinh: `${tcDat()}<rect x="18" y="14" width="284" height="98" fill="#fbe7d3" ${tcNet()}/>
      <rect x="64" y="18" width="192" height="26" rx="6" fill="#fffaf2" ${tcNet()}/>
      <text x="160" y="36" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="${Math.max(9, Math.min(15, 210 / Math.max(8, String(shopName()).length)))}" fill="#3a2317">${esc(shopName())}</text>
      ${tcMaiHien(26, 294, 48, 10, "#8fcfb3", "#f4fff9")}
      <rect x="28" y="66" width="52" height="46" fill="#d7ecef" class="kinh" ${tcNet()}/><path d="M36 74l10 -6M36 84l18 -12" stroke="#fff" stroke-width="2" opacity=".7"/>
      <rect x="240" y="64" width="44" height="48" fill="#c9976b" ${tcNet()}/><rect x="248" y="70" width="28" height="22" fill="#d7ecef" class="kinh" ${tcNet(1)}/>
      <rect x="88" y="66" width="144" height="22" fill="#f1d5b8" ${tcNet(1)}/>
      <rect x="84" y="88" width="152" height="6" fill="#c9976b" ${tcNet()}/>
      ${["#cfe3cf", "#f6e0b5", "#d9d2ef", "#f3c9c9", "#cfe3cf", "#f6e0b5", "#d9d2ef"].map((c, i) => `<rect x="${90 + i * 20}" y="94" width="20" height="18" fill="${c}" ${tcNet(1)}/>`).join("")}
      ${tcLy(108, 88, "#c58f62")}${tcLy(122, 88, "#9fcf8a")}${tcLy(136, 88, "#f2a7b4")}${tcCay(30, 112, 0.9)}`,
    den: [[160, 31, 30], [54, 88, 26], [262, 82, 20], [160, 76, 34]],
    meo: [206, 88],
  }),
  /* con hẻm: nhà ống san sát, dây điện, xe máy, ghế nhựa */
  hem: () => ({
    hinh: `${tcDat("#e6d6c2")}
      <rect x="4" y="34" width="86" height="78" fill="#f6d9c8" ${tcNet()}/><rect x="14" y="44" width="30" height="20" fill="#cfe6ea" class="kinh" ${tcNet(1)}/><path d="M8 66H86" ${tcNet(1)}/><path d="M8 70h78" stroke="${TC_NET}" stroke-width="1" stroke-dasharray="3 3"/>
      <rect x="18" y="80" width="56" height="32" fill="#d8d4cf" ${tcNet(1)}/><path d="M18 86h56M18 92h56M18 98h56M18 104h56" stroke="#b8b0a8" stroke-width="1"/>
      <rect x="90" y="20" width="82" height="92" fill="#d9e7d6" ${tcNet()}/><rect x="104" y="30" width="22" height="22" fill="#cfe6ea" class="kinh" ${tcNet(1)}/><rect x="136" y="30" width="22" height="22" fill="#cfe6ea" class="kinh" ${tcNet(1)}/>
      <rect x="100" y="52" width="62" height="5" fill="#c98f6b" ${tcNet(1)}/><rect x="116" y="74" width="30" height="38" fill="#c9976b" ${tcNet(1)}/><circle cx="141" cy="94" r="1.4" fill="${TC_NET}"/>
      <rect x="172" y="40" width="76" height="72" fill="#f3e6b9" ${tcNet()}/><rect x="184" y="50" width="52" height="18" fill="#cfe6ea" class="kinh" ${tcNet(1)}/><rect x="190" y="78" width="40" height="34" fill="#e2b48e" ${tcNet(1)}/>
      <rect x="248" y="28" width="68" height="84" fill="#e3d5ee" ${tcNet()}/><rect x="262" y="40" width="40" height="24" fill="#cfe6ea" class="kinh" ${tcNet(1)}/><path d="M256 68h52" ${tcNet(1)}/>
      <path d="M0 22Q80 36 160 18T320 26M0 28Q90 44 170 26T320 34" fill="none" stroke="#5a4a40" stroke-width="1"/>
      <g fill="#5a4a40"><path d="M120 27q2 -3 4 0q2 -3 4 0"/><path d="M210 22q2 -3 4 0q2 -3 4 0"/></g>
      <g transform="translate(206 112)"><circle cx="-14" cy="-6" r="6" fill="#5a4a40"/><circle cx="16" cy="-6" r="6" fill="#5a4a40"/><circle cx="-14" cy="-6" r="2.5" fill="#d8d0c8"/><circle cx="16" cy="-6" r="2.5" fill="#d8d0c8"/><path d="M-18 -10Q-12 -22 4 -18L14 -18L20 -10Z" fill="#e8706a" ${tcNet(1)}/><path d="M10 -18L14 -28h6" ${tcNet(1.3)} fill="none"/></g>
      <g transform="translate(62 112)"><path d="M-7 -12H7L9 0M-7 -12L-9 0M-5 -6h10" fill="none" stroke="#d94a4a" stroke-width="2.4"/><rect x="-8" y="-14" width="16" height="3" rx="1" fill="#e85a5a"/></g>
      ${tcCay(96, 112, 0.8)}${tcCay(250, 112, 0.8)}`,
    den: [[29, 54, 18], [126, 41, 22], [210, 59, 22], [282, 52, 20]],
  }),
  /* căn gác của bà Sáu: hình ông, ấm trà, cuốn sổ */
  gac: (gio) => ({
    hinh: `<rect width="${TC_W}" height="${TC_H}" fill="#f3dcc0"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${16 + i * 32} 22V112" stroke="#e2c4a2" stroke-width="1"/>`).join("")}
      <path d="M0 0H320V22L160 8L0 22Z" fill="#b98a5e" ${tcNet()}/>
      <g><rect x="206" y="30" width="72" height="50" fill="${gio === "toi" ? "#3d3768" : "#cfe6ea"}" ${tcNet()}/>${gio === "toi" ? `<circle cx="258" cy="44" r="7" fill="#fff3c4"/>` : `<circle cx="258" cy="44" r="7" fill="#ffd27a"/>`}<path d="M242 30V80M206 55H278" ${tcNet(1.2)}/></g>
      <rect x="56" y="30" width="38" height="44" fill="#fff6e8" ${tcNet(2)}/><rect x="56" y="30" width="38" height="44" fill="none" stroke="#b98a5e" stroke-width="4"/>
      <path d="M63 74Q75 60 87 74Z" fill="#8a7a6a" ${tcNet(1)}/><path d="M71 64l4 4l4 -4" fill="#fff6e8" ${tcNet(0.8)}/>
      <circle cx="75" cy="50" r="10" fill="#f3d6bd" ${tcNet(1)}/><path d="M65 48Q66 38 75 38Q84 38 85 48Q80 42 75 43Q70 42 65 48Z" fill="#d8d4cf" ${tcNet(0.9)}/>
      <path d="M70.5 47.5h2.5M77 47.5h2.5" ${tcNet(1)}/><circle cx="72" cy="50" r="0.9" fill="${TC_NET}"/><circle cx="78" cy="50" r="0.9" fill="${TC_NET}"/>
      <path d="M71 54.5q2 -1.6 4 0q2 -1.6 4 0" fill="#d8d4cf" ${tcNet(0.8)}/><path d="M73 57q2 1.2 4 0" fill="none" ${tcNet(0.8)}/>
      <rect y="112" width="${TC_W}" height="${TC_H - 112}" fill="#d9b994"/><path d="M0 112H320" ${tcNet(1.2)}/>
      <rect x="40" y="96" width="200" height="6" fill="#c08a5c" ${tcNet()}/><path d="M50 102V120M230 102V120" ${tcNet(2.5)}/>
      <g transform="translate(86 96)"><ellipse cx="0" cy="-8" rx="12" ry="9" fill="#e9b48a" ${tcNet()}/><path d="M11 -10q8 -2 9 -10" fill="none" ${tcNet(1.6)}/><path d="M-11 -12q-6 2 -5 8" fill="none" ${tcNet(1.6)}/><ellipse cx="0" cy="-17" rx="5" ry="2" fill="#c98f6b" ${tcNet(1)}/></g>
      ${tcLy(112, 96, "#c58f62")}
      <g transform="translate(176 96)"><path d="M-26 -2L0 -6L0 0L-26 2Z" fill="#fffaf2" ${tcNet(1)}/><path d="M26 -2L0 -6L0 0L26 2Z" fill="#fffaf2" ${tcNet(1)}/><path d="M-20 -3l14 -2M-20 -1l14 -2M6 -5l14 2M6 -3l14 2" stroke="#b8a898" stroke-width=".8"/></g>`,
    den: [[86, 80, 30], [176, 88, 26]],
    meo: [140, 96],
  }),
  /* chợ: ba sạp hàng có mái sọc */
  cho: () => ({
    hinh: `${tcDat("#e8d6bf")}<rect x="0" y="16" width="${TC_W}" height="10" fill="#c9976b" ${tcNet(1)}/>
      ${[
        [6, "#e8706a"],
        [110, "#f0b43c"],
        [214, "#7fbf8e"],
      ]
        .map(
          ([x, m]) => `${tcMaiHien(x, x + 100, 34, 10, m, "#fff6ea")}<path d="M${x + 6} 50V112M${x + 94} 50V112" ${tcNet(2)}/>
        <rect x="${x + 4}" y="84" width="92" height="8" fill="#c9976b" ${tcNet()}/><rect x="${x + 10}" y="92" width="80" height="20" fill="#e9d0b0" ${tcNet(1)}/>
        ${[0, 1, 2, 3, 4, 5].map((k) => `<circle cx="${x + 18 + k * 13}" cy="${80 - (k % 2) * 3}" r="5" fill="${["#f29b6b", "#9fcf8a", "#f6d36b", "#e86a7a", "#c7a0e0", "#f2a7b4"][(k + x) % 6]}" ${tcNet(0.9)}/>`).join("")}`,
        )
        .join("")}`,
    den: [[56, 60, 24], [160, 60, 24], [264, 60, 24]],
  }),
  /* quê: ruộng lúa, nhà mái tôn, hàng dừa, núi xa */
  que: () => ({
    hinh: `<path d="M0 74Q50 50 100 66T200 58T320 70V112H0Z" fill="#c9bde0" opacity=".8"/>
      <path d="M0 84H320V${TC_H}H0Z" fill="#b9d98c"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M0 ${92 + i * 11}Q160 ${86 + i * 11} 320 ${92 + i * 11}" stroke="#9cc46f" stroke-width="3" fill="none"/>`).join("")}
      <path d="M0 84H320" ${tcNet(1)}/>
      <rect x="34" y="62" width="84" height="40" fill="#e9d2b0" ${tcNet()}/><path d="M26 64L76 40L126 64Z" fill="#a9b8c9" ${tcNet()}/><path d="M40 57L76 40M52 62L76 46M100 62L76 46M112 57L76 40" stroke="#8c9db1" stroke-width="1"/>
      <rect x="66" y="76" width="20" height="26" fill="#c9976b" ${tcNet(1)}/><rect x="42" y="72" width="16" height="12" fill="#cfe6ea" class="kinh" ${tcNet(1)}/><rect x="94" y="72" width="16" height="12" fill="#cfe6ea" class="kinh" ${tcNet(1)}/>
      ${[
        [240, 1],
        [280, 0.85],
      ]
        .map(
          ([x, s]) => `<g transform="translate(${x} 96) scale(${s})"><path d="M0 0Q4 -30 -2 -58" fill="none" stroke="#a07a52" stroke-width="4"/><g fill="#6fb07c" ${tcNet(1)}><path d="M-2 -58Q-24 -64 -36 -50Q-20 -58 -2 -56Z"/><path d="M-2 -58Q20 -66 34 -52Q16 -58 -2 -56Z"/><path d="M-2 -58Q-14 -76 -28 -78Q-14 -70 -2 -58Z"/><path d="M-2 -58Q12 -78 26 -76Q12 -70 -2 -58Z"/></g></g>`,
        )
        .join("")}
      <path d="M150 96Q164 74 178 96Z" fill="#e8c26a" ${tcNet(1)}/>`,
    den: [[50, 78, 16], [102, 78, 16]],
  }),
  /* bến xe: xe đò đậu, mái chờ */
  benxe: () => ({
    hinh: `<rect y="104" width="${TC_W}" height="${TC_H - 104}" fill="#d8d0c8"/><path d="M0 104H320" ${tcNet(1)}/><path d="M0 124H320" stroke="#fffaf2" stroke-width="2" stroke-dasharray="14 10"/>
      <g><rect x="34" y="52" width="190" height="52" rx="10" fill="#f4b860" ${tcNet()}/><rect x="34" y="84" width="190" height="6" fill="#ef6f8e"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${46 + i * 26}" y="60" width="20" height="16" rx="2" fill="#cfe6ea" class="kinh" ${tcNet(1)}/>`).join("")}<rect x="206" y="58" width="14" height="22" rx="2" fill="#cfe6ea" class="kinh" ${tcNet(1)}/>
      <circle cx="70" cy="104" r="9" fill="#5a4a40"/><circle cx="190" cy="104" r="9" fill="#5a4a40"/><circle cx="70" cy="104" r="3.5" fill="#d8d0c8"/><circle cx="190" cy="104" r="3.5" fill="#d8d0c8"/></g>
      <path d="M244 46H316L310 54H250Z" fill="#9cc5a8" ${tcNet()}/><path d="M252 54V104M308 54V104" ${tcNet(2)}/><rect x="258" y="84" width="44" height="5" fill="#c9976b" ${tcNet(1)}/><rect x="262" y="30" width="40" height="12" rx="2" fill="#fffaf2" ${tcNet(1)}/><text x="282" y="39" text-anchor="middle" font-size="7.5" font-weight="800" font-family="Baloo 2,sans-serif" fill="#3a2317">BẾN XE</text>`,
    den: [[129, 68, 40], [282, 60, 20]],
  }),
  /* đầu hẻm: cổng Hẻm 42 bên trái, chuỗi Mây Tea mới mở bên phải */
  dauhem: () => ({
    hinh: `${tcDat()}<rect x="18" y="56" width="96" height="56" fill="#f3e2cf" opacity=".7"/>${TT().xem.c2_may == null ? tcChoThue() : ""}
      <path d="M22 42V112M110 42V112" ${tcNet(5)}/><rect x="12" y="28" width="108" height="16" rx="3" fill="#fdf0d9" ${tcNet()}/><text x="66" y="40" text-anchor="middle" font-size="10" font-weight="800" font-family="Baloo 2,sans-serif" fill="#3a2317">HẺM 42</text>
      <rect x="34" y="62" width="30" height="50" fill="#f6d9c8" ${tcNet(1)}/><rect x="68" y="56" width="36" height="56" fill="#d9e7d6" ${tcNet(1)}/>
      ${TT().xem.c2_may == null ? "" : `<rect x="138" y="20" width="176" height="92" fill="#f5f8fb" ${tcNet()}/><rect x="138" y="22" width="176" height="22" fill="#8ec5e8" ${tcNet()}/>
      <g fill="#fff"><ellipse cx="166" cy="34" rx="9" ry="5"/><ellipse cx="172" cy="31" rx="6" ry="5"/></g><text x="236" y="38" text-anchor="middle" font-size="13" font-weight="800" font-family="Baloo 2,sans-serif" fill="#fff">Mây Tea</text>
      <rect x="146" y="52" width="110" height="60" fill="#cfe6f4" class="kinh" ${tcNet(1)}/><path d="M156 62l18 -8M156 76l30 -14" stroke="#fff" stroke-width="2" opacity=".7"/><rect x="266" y="52" width="38" height="60" fill="#cfe6f4" class="kinh" ${tcNet(1)}/>
      <g transform="translate(212 112)"><rect x="-34" y="-26" width="44" height="20" rx="2" fill="#fff" ${tcNet(1)}/><path d="M10 -20H24L30 -12V-6H10Z" fill="#8ec5e8" ${tcNet(1)}/><circle cx="-24" cy="-5" r="5" fill="#5a4a40"/><circle cx="20" cy="-5" r="5" fill="#5a4a40"/><g fill="#8ec5e8"><ellipse cx="-14" cy="-17" rx="6" ry="3.5"/></g></g>`}`,
    den: [[66, 36, 26], [200, 80, 40], [285, 80, 22]],
  }),
  /* cổng trường: hai cột, bảng tên, hàng cây, xe đạp */
  truong: () => ({
    hinh: `${tcDat()}<g fill="#8fcf9a" ${tcNet(1)}><circle cx="28" cy="58" r="22"/><circle cx="296" cy="56" r="24"/><circle cx="56" cy="70" r="16"/></g><path d="M28 80V112M296 80V112" ${tcNet(3)}/>
      <path d="M0 96H320" stroke="${TC_NET}" stroke-width="1.2"/>${Array.from({ length: 16 }, (_, i) => `<path d="M${6 + i * 20} 96V112" stroke="${TC_NET}" stroke-width="1.2"/>`).join("")}
      <rect x="84" y="40" width="16" height="72" fill="#f3e6b9" ${tcNet()}/><rect x="220" y="40" width="16" height="72" fill="#f3e6b9" ${tcNet()}/><rect x="76" y="26" width="168" height="18" rx="3" fill="#fffaf2" ${tcNet()}/>
      <text x="160" y="39" text-anchor="middle" font-size="9.5" font-weight="800" font-family="Baloo 2,sans-serif" fill="#3a2317">TRƯỜNG THPT</text>
      <path d="M160 26V6" ${tcNet(1.4)}/><path d="M160 6h18v11h-18Z" fill="#e8504a"/><path d="M169 9l1 2.4h2.6l-2 1.6l.8 2.5l-2.4 -1.6l-2.4 1.6l.8 -2.5l-2 -1.6h2.6Z" fill="#f6d36b"/>
      ${[118, 150].map((x) => `<g transform="translate(${x} 112)"><circle cx="-7" cy="-7" r="6" fill="none" ${tcNet(1.3)}/><circle cx="9" cy="-7" r="6" fill="none" ${tcNet(1.3)}/><path d="M-7 -7L0 -16L9 -7M0 -16H-3M2 -16l2 -4" fill="none" stroke="#4f8cc9" stroke-width="1.6"/></g>`).join("")}`,
    den: [[160, 34, 30]],
  }),
  /* tin nhắn: điện thoại và mấy bong bóng chat */
  dienthoai: () => ({
    hinh: `<rect width="${TC_W}" height="${TC_H}" fill="#fde7ea"/>${[
      [40, 30], [80, 100], [250, 26], [286, 92], [30, 76], [220, 118],
    ]
      .map(([x, y], i) => (i % 2 ? `<circle cx="${x}" cy="${y}" r="3" fill="#f6b8c4"/>` : `<path d="M${x} ${y + 3}l-4 -4a2.6 2.6 0 0 1 4 -3a2.6 2.6 0 0 1 4 3Z" fill="#f29bb0"/>`))
      .join("")}
      <rect x="122" y="8" width="76" height="132" rx="12" fill="#3a2a2a" ${tcNet()}/><rect x="128" y="18" width="64" height="122" rx="4" fill="#fffaf2"/>
      <rect x="132" y="28" width="40" height="14" rx="6" fill="#cfe8dc"/><rect x="146" y="48" width="42" height="14" rx="6" fill="#f6c3cf"/><rect x="132" y="68" width="48" height="20" rx="6" fill="#cfe8dc"/>
      <path d="M136 35h30M150 55h32M136 75h38M136 81h26" stroke="#7a5a48" stroke-width="1.2" opacity=".55"/>
      <g fill="#c9b8a8"><circle cx="138" cy="100" r="2"/><circle cx="145" cy="100" r="2"/><circle cx="152" cy="100" r="2"/></g>`,
    den: [],
    khongDem: true,
  }),
};

/* ---------- lớp phủ: tối, mưa, Trung Thu, Tết ---------- */
function tcDem(den, id) {
  return `<defs><radialGradient id="dn${id}"><stop offset="0" stop-color="#ffd98a" stop-opacity=".75"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient></defs>
    <rect width="${TC_W}" height="${TC_H}" fill="#1d1840" opacity=".3"/>${den.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#dn${id})"/>`).join("")}`;
}
function tcMua(id) {
  return `<defs><pattern id="mu${id}" width="14" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(12)"><path d="M3 0v8M10 9v8" stroke="#a9c3e0" stroke-width="1.2" stroke-linecap="round"/></pattern></defs>
    <rect width="${TC_W}" height="${TC_H}" fill="#5f6f86" opacity=".18"/><rect width="${TC_W}" height="${TC_H}" fill="url(#mu${id})" opacity=".9"/>
    ${[40, 120, 200, 280].map((x) => `<ellipse cx="${x}" cy="126" rx="14" ry="2.5" fill="#bcd2ea" opacity=".7"/>`).join("")}`;
}
function tcTrungThu() {
  const sao = (x, y, m) =>
    `<g transform="translate(${x} ${y})"><path d="M0 -10V-4" ${tcNet(1)}/><path d="M0 -4l2.4 5h5.4l-4.4 3.4l1.7 5.4l-5.1 -3.3l-5.1 3.3l1.7 -5.4l-4.4 -3.4h5.4Z" fill="${m}" ${tcNet(1)}/></g>`;
  return `<circle cx="44" cy="26" r="15" fill="#fff1b8" opacity=".95"/><path d="M0 8Q80 26 160 10T320 14" fill="none" stroke="#5a4a40" stroke-width="1"/>${[
    [70, 22, "#e8504a"], [118, 16, "#f6d36b"], [170, 12, "#ef6f8e"], [222, 14, "#e8504a"], [270, 14, "#f6d36b"],
  ]
    .map(([x, y, m]) => sao(x, y + 8, m))
    .join("")}`;
}
function tcTet() {
  const hoa = (x, y) => `<g transform="translate(${x} ${y})" fill="#f6d36b" ${tcNet(0.6)}>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(3 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(3 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" r="2.2"/>`).join("")}<circle r="1.2" fill="#e8504a"/></g>`;
  return `<path d="M0 6Q30 14 44 30M20 12Q18 26 10 34M36 22Q50 20 62 12" fill="none" stroke="#7a5236" stroke-width="2.2" stroke-linecap="round"/>${[
    [44, 30], [10, 34], [62, 12], [28, 16], [52, 22], [18, 26],
  ]
    .map(([x, y]) => hoa(x, y))
    .join("")}${[274, 300].map((x, i) => `<g transform="translate(${x} ${14 + i * 8})"><path d="M0 -14V-6" ${tcNet(1)}/><ellipse cx="0" cy="1" rx="8" ry="7" fill="#e8504a" ${tcNet(1)}/><path d="M-6 1h12" stroke="#f6d36b" stroke-width="1"/><path d="M0 8v6" stroke="#f6d36b" stroke-width="1.6"/></g>`).join("")}`;
}

/* ---------- ai có mặt trong cảnh ---------- */
const TC_TIN = { Mẹ: "me_gap", Linh: "linh", Hana: "hana", Khoa: "khoa", Vy: "vy" };
function tcNguoi(dong) {
  const ds = [];
  dong.forEach(([ai, cau]) => {
    let k = ai;
    if (ai === "tin") {
      const m = String(cau).match(/^([^:]{1,6}):/);
      k = m && TC_TIN[m[1].trim()];
    }
    if (k && k !== "_" && k !== "ba" && NHAN_VAT[k] && !ds.includes(k)) ds.push(k);
  });
  return ds.slice(0, 4);
}
function tcMat(ai, noi) {
  const nv = NHAN_VAT[ai],
    s = 44;
  const bg = nv.anh
    ? `background-image:url(${IMG}${nv.anh}${nv.anh.includes(".") ? "" : ".png"});background-size:cover`
    : nv.mat != null
      ? faceBg(nv.mat, noi ? 1 : 0, s, s - 1)
      : nv.ngoiSao != null
        ? starBg(nv.ngoiSao, noi ? 1 : 0, s, s - 1)
        : "";
  return `<span class="tcmat${noi ? " noi" : ""}" data-ai="${ai}" style="${bg}" title="${esc(nv.ten)}"></span>`;
}

/* ---------- chọn bối cảnh cho một cảnh ---------- */
function tranhCua(m) {
  const g = (typeof TRANH_CANH !== "undefined" && TRANH_CANH[m.id]) || {},
    dong = locDong(m.thoai),
    tin = dong.filter((d) => d[0] === "tin").length,
    chu = dong.map((d) => d[1]).join(" ");
  let nen = g.nen;
  if (!nen) {
    if (dong.length && tin >= dong.length - (dong.some((d) => d[0] === "_") ? 1 : 0)) nen = "dienthoai";
    else if (/^que_/.test(m.id)) nen = "que";
    else nen = "quay";
  }
  if (nen === "quay" && buoc() >= 2) nen = "mattien"; /* ra mặt tiền rồi thì chuyện ở quầy diễn ra trước kiosk đầu hẻm */
  const le = (m.dieuKien || {}).le;
  const them = [...(g.them || [])];
  if (le === "tet" || /^(c3_|tet_|que_)/.test(m.id) || m.id === "le_ong_tao") them.includes("tet") || them.push("tet");
  if (le === "trungThu" || m.id === "c2_trung_thu") them.includes("trungthu") || them.push("trungthu");
  if ((m.dieuKien || {}).thoiTiet === "rain") them.includes("mua") || them.push("mua");
  const gio = g.gio || (m.nghi ? "sang" : m.luc === "dong_cua" ? "toi" : "sang");
  const meo = g.meo != null ? g.meo : /Mướp|mèo/.test(chu);
  return { nen, gio, them, meo, nguoi: tcNguoi(dong) };
}

/* người đang nói của một câu (tin nhắn thì lấy tên trước dấu hai chấm) */
function tcAiNoi(d) {
  if (!d) return null;
  if (d[0] !== "tin") return d[0];
  const m = String(d[1]).match(/^([^:]{1,6}):/);
  return (m && TC_TIN[m[1].trim()]) || null;
}
/* tranh SVG + hàng mặt người; noi = người đang nói (cảnh hiện từng câu) */
function tranhCanh(m, noi) {
  if (!m) return "";
  const t = tranhCua(m),
    id = ++tcSo,
    N = (TC_NEN[t.nen] || TC_NEN.quay)(t.gio),
    toi = t.gio === "toi" && !N.khongDem;
  const svg = `<svg class="tcsvg" viewBox="0 0 ${TC_W} ${TC_H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${N.khongDem ? "" : tcTroi(t.gio, id)}${N.hinh}${
    t.meo && N.meo ? tcMeo(N.meo[0], N.meo[1]) : ""
  }${t.them.includes("trungthu") ? tcTrungThu() : ""}${t.them.includes("tet") ? tcTet() : ""}${toi ? tcDem(N.den, id) : ""}${t.them.includes("mua") ? tcMua(id) : ""}</svg>`;
  return `<div class="tctranh" data-nen="${t.nen}">${svg}${t.nguoi.length ? `<div class="tcnguoi">${t.nguoi.map((ai) => tcMat(ai, ai === noi)).join("")}</div>` : ""}</div>`;
}

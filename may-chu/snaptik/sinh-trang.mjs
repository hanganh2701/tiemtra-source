/* Sinh các trang của snaptik cho 10 tiếng từ file dịch dich/<tiếng>.js:
     public/…              tiếng Việt (trang gốc ở /)
     public/<tiếng>/…      tiếng khác (/en/, /id/…), cùng tên trang với tiếng Việt
     public/chu/<tiếng>.js chữ app.js dùng lúc chạy (nút, câu báo, tiến độ…)
     public/sitemap.xml, public/[<tiếng>/]manifest.webmanifest
     loi-dich.js           câu báo lỗi worker.js trả về, theo tiếng
   Sửa chữ trong dich/ hoặc khung trang ở đây thì chạy lại: node may-chu/snaptik/sinh-trang.mjs (test báo khi quên).
   Chữ trong file dịch là HTML (được dùng <b>, <a>, <code>); {goc} là gốc đường dẫn của tiếng đó ("/" hay "/en/"). */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const THU_MUC = path.dirname(fileURLToPath(import.meta.url));
const MIEN = "https://snaptik.meomeo.app";

/* thứ tự này là thứ tự trong nút chọn ngôn ngữ; public/ngon-ngu.js giữ cùng danh sách mã (test so) */
export const NGON_NGU = [
  { ma: "vi", ten: "Tiếng Việt", og: "vi_VN" },
  { ma: "en", ten: "English", og: "en_US" },
  { ma: "id", ten: "Bahasa Indonesia", og: "id_ID" },
  { ma: "th", ten: "ไทย", og: "th_TH" },
  { ma: "ms", ten: "Bahasa Melayu", og: "ms_MY" },
  { ma: "fil", ten: "Filipino", og: "tl_PH" },
  { ma: "es", ten: "Español", og: "es_LA" },
  { ma: "pt", ten: "Português", og: "pt_BR" },
  { ma: "ja", ten: "日本語", og: "ja_JP" },
  { ma: "ko", ten: "한국어", og: "ko_KR" },
];
export const gocCua = (ma) => (ma === "vi" ? "/" : `/${ma}/`);

/* các trang: khoá trong file dịch, đường dẫn sau gốc, kiểu trang */
const TRANG = [
  { khoa: "trangChu", duong: "", cheDo: "video", menu: "video" },
  { khoa: "mp3", duong: "mp3/", cheDo: "mp3", menu: "mp3" },
  { khoa: "anh", duong: "anh/", cheDo: "anh", menu: "anh" },
  { khoa: "huongDan", duong: "huong-dan/", menu: "huongDan" },
  { khoa: "dieuKhoan", duong: "dieu-khoan/" },
  { khoa: "baoMat", duong: "bao-mat/" },
];

const tt = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const thut = (html, cach) => html.trim().split("\n").map((d) => (d.trim() ? cach + d : "")).join("\n");
const dien = (s, goc) => String(s).replaceAll("{goc}", goc);

function dau(t, ng, trang, { title, description, ogTitle, ogDescription, noindex }) {
  const goc = gocCua(ng.ma);
  const url = MIEN + goc + trang.duong;
  const thayThe = noindex
    ? []
    : [
        ...NGON_NGU.map((n) => `    <link rel="alternate" hreflang="${n.ma}" href="${MIEN}${gocCua(n.ma)}${trang.duong}" />`),
        `    <link rel="alternate" hreflang="x-default" href="${MIEN}${gocCua("en")}${trang.duong}" />`,
      ];
  const og = noindex
    ? []
    : [
        `    <meta property="og:type" content="website" />`,
        `    <meta property="og:site_name" content="snaptik" />`,
        `    <meta property="og:locale" content="${ng.og}" />`,
        `    <meta property="og:title" content="${tt(ogTitle || title)}" />`,
        `    <meta property="og:description" content="${tt(ogDescription || description)}" />`,
        `    <meta property="og:url" content="${url}" />`,
        /* ảnh chia sẻ có chữ theo tiếng: og.png (tiếng Việt), og-<tiếng>.png (chụp từ khung của og.png, xem README) */
        `    <meta property="og:image" content="${MIEN}/${ng.ma === "vi" ? "og.png" : `og-${ng.ma}.png`}" />`,
        `    <meta property="og:image:width" content="1200" />`,
        `    <meta property="og:image:height" content="630" />`,
        `    <meta name="twitter:card" content="summary_large_image" />`,
      ];
  return [
    "<!doctype html>",
    `<html lang="${ng.ma}">`,
    "  <head>",
    `    <meta charset="utf-8" />`,
    `    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />`,
    `    <title>${tt(title)}</title>`,
    noindex ? `    <meta name="robots" content="noindex" />` : `    <meta name="description" content="${tt(description)}" />`,
    noindex ? null : `    <link rel="canonical" href="${url}" />`,
    ...thayThe,
    `    <meta name="theme-color" content="#fff8f0" media="(prefers-color-scheme: light)" />`,
    `    <meta name="theme-color" content="#17131a" media="(prefers-color-scheme: dark)" />`,
    `    <meta name="referrer" content="no-referrer" />`,
    `    <link rel="icon" href="/icon.svg" type="image/svg+xml" />`,
    `    <link rel="apple-touch-icon" href="/icon-192.png" />`,
    noindex ? null : `    <link rel="manifest" href="${goc}manifest.webmanifest" />`,
    ...og,
    /* chạy ngay (không defer): chuyển sang tiếng của máy trước khi vẽ trang, khỏi nháy chữ */
    `    <script src="/ngon-ngu.js"></script>`,
    `    <link rel="stylesheet" href="/style.css" />`,
    noindex ? null : `    <script type="module" src="/app.js"></script>`,
    "  </head>",
  ]
    .filter((d) => d != null)
    .join("\n");
}

function dauTrang(t, ng, trang, { coNutCai = true } = {}) {
  const goc = gocCua(ng.ma);
  const menu = [
    ["video", ""],
    ["mp3", "mp3/"],
    ["anh", "anh/"],
    ["huongDan", "huong-dan/"],
  ].map(([k, d]) => `          <a href="${goc}${d}"${trang.menu === k ? ' aria-current="page"' : ""}>${t.chung.menu[k]}</a>`);
  const chon = NGON_NGU.map(
    (n) =>
      `            <li><a href="${gocCua(n.ma)}${trang.duong}" hreflang="${n.ma}" lang="${n.ma}" data-ngon-ngu="${n.ma}"${n.ma === ng.ma ? ' aria-current="true"' : ""}>${n.ten}</a></li>`,
  );
  return [
    `    <header class="dau">`,
    `      <div class="khung">`,
    `        <a class="logo" href="${goc}"><img src="/icon.svg" alt="" width="32" height="32" />snaptik</a>`,
    `        <nav class="menu" aria-label="${tt(t.chung.menuNhan)}">`,
    ...menu,
    `        </nav>`,
    `        <details class="ngon-ngu">`,
    `          <summary aria-label="${tt(t.chung.ngonNgu)}: ${tt(ng.ten)}"><span class="bieu-tuong dia-cau"></span>${ng.ma.toUpperCase()}</summary>`,
    `          <ul>`,
    ...chon,
    `          </ul>`,
    `        </details>`,
    coNutCai ? `        <button type="button" id="nut-cai" class="nut-cai" hidden>${t.chung.caiUngDung}</button>` : null,
    `      </div>`,
    `    </header>`,
  ]
    .filter((d) => d != null)
    .join("\n");
}

function chanTrang(t, ng) {
  const goc = gocCua(ng.ma);
  const c = t.chung;
  return `    <footer class="chan">
      <div class="khung">
        <p>${c.chan}</p>
        <nav aria-label="${tt(c.trangPhuNhan)}">
          <a href="${goc}huong-dan/">${c.chanLink.huongDan}</a>
          <a href="${goc}dieu-khoan/">${c.chanLink.dieuKhoan}</a>
          <a href="${goc}bao-mat/">${c.chanLink.baoMat}</a>
        </nav>
      </div>
    </footer>`;
}

function trangCongCu(t, ng, trang) {
  const p = t[trang.khoa];
  const goc = gocCua(ng.ma);
  const buoc = p.buoc.map(([h, c]) => `          <li>\n            <h3>${h}</h3>\n            <p>${dien(c, goc)}</p>\n          </li>`).join("\n");
  const tinhNang = p.tinhNang
    ? `\n\n      <section class="muc">
        <h2>${p.tinhNangTieuDe}</h2>
        <div class="o-tinh-nang">
${p.tinhNang.map(([h, c]) => `          <div>\n            <h3>${h}</h3>\n            <p>${dien(c, goc)}</p>\n          </div>`).join("\n")}
        </div>
      </section>`
    : "";
  const hoiDap = p.hoiDap.map(([h, c]) => `        <details>\n          <summary>${h}</summary>\n          <p>${dien(c, goc)}</p>\n        </details>`).join("\n");
  return `    <main>
      <section class="dau-trang">
        <div class="khung">
          <h1>${p.h1}</h1>
          <p class="phu">${dien(p.phu, goc)}</p>
          <form id="o-tim" class="o-tim" autocomplete="off">
            <label class="an-chu" for="link">${p.nhanO}</label>
            <div class="o-nhap">
              <input id="link" name="url" type="text" inputmode="url" enterkeyhint="go" placeholder="${tt(p.goiY)}" spellcheck="false" />
              <button type="button" id="nut-dan" class="nut-dan">${t.chung.dan}</button>
            </div>
            <button type="submit" id="nut-tim" class="nut-chinh">${t.chung.tai}</button>
          </form>
          <p id="loi" class="loi" role="alert" hidden></p>
          <p class="nho">${dien(p.nho, goc)}</p>
        </div>
      </section>

      <section id="ket-qua" class="ket-qua" hidden></section>
      <section id="lich-su" class="lich-su" hidden></section>

      <section class="muc">
        <h2>${p.buocTieuDe}</h2>
        <ol class="buoc">
${buoc}
        </ol>
      </section>${tinhNang}

      <section class="muc hoi-dap">
        <h2>${p.hoiDapTieuDe}</h2>
${hoiDap}
      </section>
    </main>`;
}

function trangBaiViet(t, ng, trang) {
  return `    <main class="bai-viet">\n${thut(dien(t[trang.khoa].noiDung, gocCua(ng.ma)), "      ")}\n    </main>`;
}

const MEO_NGU = `      <svg class="meo meo-ngu" viewBox="0 0 220 130" aria-hidden="true" focusable="false">
        <ellipse class="long" cx="112" cy="88" rx="68" ry="31" />
        <path class="soc" d="M104 60 Q110 70 104 80 M124 60 Q130 70 124 80 M144 64 Q149 73 144 82" />
        <path class="duoi-vien" d="M176 94 C186 112 150 122 112 120 C100 119 92 117 86 114" />
        <path class="duoi" d="M176 94 C186 112 150 122 112 120 C100 119 92 117 86 114" />
        <path class="long" d="M42 72 L38 44 L60 58 Z M72 56 L90 44 L88 70 Z" />
        <path class="hong" d="M45 64 L43 50 L55 58 Z M76 57 L86 51 L85 64 Z" />
        <circle class="long" cx="64" cy="82" r="27" />
        <ellipse class="kem" cx="60" cy="93" rx="15" ry="10" />
        <path class="net" d="M46 81 Q52 86 58 81 M68 79 Q74 84 80 79" />
        <path class="mui" d="M57 89 H63 L60 92 Z" />
        <ellipse class="kem vien" cx="86" cy="113" rx="15" ry="6.5" />
        <text class="zzz" x="96" y="44">z</text><text class="zzz" x="110" y="30">z</text><text class="zzz" x="126" y="16">z</text>
      </svg>`;

function trang404(t, ng) {
  const p = t.loi404;
  const trang = { duong: "" }; /* nút chọn tiếng trên trang 404 về trang chủ của tiếng kia */
  return [
    dau(t, ng, trang, { title: p.title, noindex: true }),
    "  <body>",
    dauTrang(t, ng, trang, { coNutCai: false }),
    `    <main class="bai-viet trang-404">`,
    MEO_NGU,
    `      <h1>${p.h1}</h1>`,
    `      <p>${dien(p.p, gocCua(ng.ma))}</p>`,
    `    </main>`,
    "  </body>",
    "</html>",
    "",
  ].join("\n");
}

function motTrang(t, ng, trang) {
  const p = t[trang.khoa];
  const than = trang.cheDo ? trangCongCu(t, ng, trang) : trangBaiViet(t, ng, trang);
  return [
    dau(t, ng, trang, p),
    trang.cheDo ? `  <body data-che-do="${trang.cheDo}">` : "  <body>",
    dauTrang(t, ng, trang),
    "",
    than,
    "",
    chanTrang(t, ng),
    "  </body>",
    "</html>",
    "",
  ].join("\n");
}

function manifest(t, ng) {
  const goc = gocCua(ng.ma);
  const m = t.ungDung;
  return (
    JSON.stringify(
      {
        name: m.ten,
        short_name: "snaptik",
        description: m.moTa,
        lang: ng.ma,
        id: "/",
        start_url: goc,
        scope: "/",
        display: "standalone",
        background_color: "#fff8f0",
        theme_color: "#f0682a",
        icons: [
          { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        share_target: { action: goc, method: "GET", params: { title: "title", text: "text", url: "url" } },
        shortcuts: [
          { name: m.loiTatMp3, url: goc + "mp3/" },
          { name: m.loiTatAnh, url: goc + "anh/" },
        ],
      },
      null,
      2,
    ) + "\n"
  );
}

function sitemap() {
  const dong = [];
  for (const trang of TRANG)
    for (const ng of NGON_NGU) {
      dong.push(`  <url>`, `    <loc>${MIEN}${gocCua(ng.ma)}${trang.duong}</loc>`);
      for (const n of NGON_NGU) dong.push(`    <xhtml:link rel="alternate" hreflang="${n.ma}" href="${MIEN}${gocCua(n.ma)}${trang.duong}" />`);
      dong.push(`  </url>`);
    }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${dong.join("\n")}
</urlset>
`;
}

/* so bản dịch với bản tiếng Việt: đủ khoá, mảng cùng số mục, cùng các thẻ HTML, cùng href/class/id, cùng chỗ thay ({goc}, {n}…).
   Trả danh sách lỗi (rỗng là được). Thứ tự thẻ được đổi theo ngữ pháp từng tiếng, nên chỉ so tập thẻ */
export function soDich(goc, dich, duong = "") {
  if (typeof goc === "string") {
    if (typeof dich !== "string" || !dich.trim()) return [`${duong}: thiếu`];
    const loi = [];
    const tap = (s, re) => [...s.matchAll(re)].map((m) => m[0]).sort().join(" ");
    if (tap(goc, /<\/?[a-z0-9]+/gi) !== tap(dich, /<\/?[a-z0-9]+/gi)) loi.push(`${duong}: thẻ HTML khác bản gốc`);
    if (tap(goc, /\b(?:href|class|id|data-[\w-]+|for)="[^"]*"/g) !== tap(dich, /\b(?:href|class|id|data-[\w-]+|for)="[^"]*"/g)) loi.push(`${duong}: href, class, id khác bản gốc`);
    if (tap(goc, /\{\w+\}/g) !== tap(dich, /\{\w+\}/g)) loi.push(`${duong}: chỗ thay ({goc}, {n}…) khác bản gốc`);
    return loi;
  }
  if (Array.isArray(goc)) {
    if (!Array.isArray(dich) || dich.length !== goc.length) return [`${duong}: số mục khác bản gốc`];
    return goc.flatMap((x, i) => soDich(x, dich[i], `${duong}[${i}]`));
  }
  const loi = Object.keys(goc).flatMap((k) => soDich(goc[k], dich?.[k], duong ? `${duong}.${k}` : k));
  for (const k of Object.keys(dich || {})) if (!(k in goc)) loi.push(`${duong ? duong + "." : ""}${k}: thừa`);
  return loi;
}

export async function napDich() {
  const d = {};
  for (const ng of NGON_NGU) d[ng.ma] = (await import(pathToFileURL(path.join(THU_MUC, "dich", ng.ma + ".js")).href)).default;
  return d;
}

/* tất cả file sinh ra: { đường dẫn tương đối với thư mục may-chu/snaptik: nội dung } */
export async function sinhTatCa(dich) {
  dich ||= await napDich();
  const tep = {};
  const loi = {};
  for (const ng of NGON_NGU) {
    const t = dich[ng.ma];
    const thuMuc = ng.ma === "vi" ? "public/" : `public/${ng.ma}/`;
    for (const trang of TRANG) tep[thuMuc + trang.duong + "index.html"] = motTrang(t, ng, trang);
    tep[thuMuc + "404.html"] = trang404(t, ng);
    tep[thuMuc + "manifest.webmanifest"] = manifest(t, ng);
    tep[`public/chu/${ng.ma}.js`] = `/* sinh bởi sinh-trang.mjs từ dich/${ng.ma}.js (chay): đừng sửa tay */\nexport default ${JSON.stringify(t.chay, null, 2)};\n`;
    loi[ng.ma] = t.loi;
  }
  tep["public/sitemap.xml"] = sitemap();
  tep["loi-dich.js"] = `/* sinh bởi sinh-trang.mjs từ dich/<tiếng>.js (loi): câu báo lỗi worker.js trả về theo tiếng. Đừng sửa tay */\nexport const LOI = ${JSON.stringify(loi, null, 2)};\n`;
  return tep;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const tep = await sinhTatCa();
  let doi = 0;
  for (const [duong, noiDung] of Object.entries(tep)) {
    const day = path.join(THU_MUC, duong);
    let cu = null;
    try {
      cu = readFileSync(day, "utf8");
    } catch {
      /* file mới */
    }
    if (cu === noiDung) continue;
    mkdirSync(path.dirname(day), { recursive: true });
    writeFileSync(day, noiDung);
    doi++;
    console.log("ghi " + duong);
  }
  console.log(`${Object.keys(tep).length} file, ${doi} file đổi`);
}

/* Mèo của snaptik: mèo ngó qua mép ô tìm và mèo ngồi trên mép chân trang. Chỉ để trang trí (aria-hidden).
   Nét mặt theo body[data-meo]: không có = ngồi chờ (chớp mắt), "tim" = đảo mắt, đạp chân; "vui" = cười tít mắt; "buon" = cụp tai.
   Màu và chuyển động ở style.css, mục "mèo" */

const MEO_NGO = `<svg class="meo meo-ngo" viewBox="0 0 200 132" aria-hidden="true" focusable="false">
  <g class="meo-tai meo-tai-trai"><path class="long" d="M42 64 L52 12 Q55 3 63 9 L96 36 Z"/><path class="hong" d="M54 52 L60 22 L84 38 Z"/></g>
  <g class="meo-tai meo-tai-phai"><path class="long" d="M158 64 L148 12 Q145 3 137 9 L104 36 Z"/><path class="hong" d="M146 52 L140 22 L116 38 Z"/></g>
  <path class="long" d="M26 118 C19 74 54 30 100 30 C146 30 181 74 174 118 Z"/>
  <path class="soc" d="M100 35 V50 M85 38 L88 50 M115 38 L112 50 M34 68 H46 M30 78 H43 M166 68 H154 M170 78 H157"/>
  <ellipse class="kem" cx="100" cy="101" rx="34" ry="17"/>
  <g class="meo-mat">
    <ellipse class="mat" cx="74" cy="76" rx="9.5" ry="11.5"/><ellipse class="mat" cx="126" cy="76" rx="9.5" ry="11.5"/>
    <ellipse class="con-ngoi" cx="74" cy="76" rx="2.6" ry="9"/><ellipse class="con-ngoi" cx="126" cy="76" rx="2.6" ry="9"/>
    <circle class="sang" cx="77.5" cy="71.5" r="3"/><circle class="sang" cx="129.5" cy="71.5" r="3"/>
  </g>
  <path class="net meo-mat-cuoi" d="M64 79 Q74 67 84 79 M116 79 Q126 67 136 79"/>
  <ellipse class="ma" cx="55" cy="95" rx="8" ry="5"/><ellipse class="ma" cx="145" cy="95" rx="8" ry="5"/>
  <path class="mui" d="M94 92 H106 L100 98 Z"/>
  <path class="net" d="M100 99 Q96 107 89 103 M100 99 Q104 107 111 103"/>
  <path class="rau" d="M48 92 L16 86 M48 99 L18 104 M152 92 L184 86 M152 99 L182 104"/>
  <g class="meo-chan meo-chan-trai"><ellipse class="kem vien" cx="64" cy="120" rx="19" ry="11"/><path class="ngon" d="M58 113 V120 M70 113 V120"/></g>
  <g class="meo-chan meo-chan-phai"><ellipse class="kem vien" cx="136" cy="120" rx="19" ry="11"/><path class="ngon" d="M130 113 V120 M142 113 V120"/></g>
</svg>`;

/* nhìn từ sau lưng, ngồi trên mép chân trang, đuôi thả xuống */
const MEO_NGOI = `<svg class="meo meo-ngoi" viewBox="0 0 110 100" aria-hidden="true" focusable="false">
  <path class="duoi meo-duoi" d="M74 72 C92 74 98 86 92 98"/>
  <path class="long" d="M30 78 C24 54 38 38 55 38 C72 38 86 54 80 78 Z"/>
  <circle class="long" cx="55" cy="30" r="17"/>
  <path class="long" d="M40 25 L41 7 L54 17 Z M70 25 L69 7 L56 17 Z"/>
  <path class="soc" d="M45 50 Q55 46 65 50 M42 60 Q55 56 68 60 M42 70 Q55 66 68 70 M55 15 V22 M48 17 L50 23 M62 17 L60 23"/>
</svg>`;

/* gắn mèo vào trang (gọi một lần lúc nạp) */
export function ganMeo() {
  document.querySelector(".o-tim")?.insertAdjacentHTML("afterbegin", MEO_NGO);
  document.querySelector(".chan")?.insertAdjacentHTML("afterbegin", MEO_NGOI);
}

/* đổi nét mặt mèo: "tim", "vui", "buon"; bỏ trống là ngồi chờ */
export function meo(trangThai) {
  if (trangThai) document.body.dataset.meo = trangThai;
  else delete document.body.dataset.meo;
}

/* Bảng xếp hạng chung của Tiệm Trà Nhỏ: Cloudflare Worker + D1 (bản 5.7).
   Chỉ lưu tên tiệm, lãi tích luỹ cao nhất, ngày, sao, phiên bản. Không lưu tên thật, số điện thoại, địa chỉ IP.
   Người chơi giữ một khoá bí mật trên máy; máy chủ chỉ lưu sha256 của khoá nên không ai gửi đè được dòng của người khác.
   Chống gian lận được tới đâu hay tới đó (game chạy trên máy người chơi): chặn số vô lý so với số ngày, chặn chơi nhanh hơn
   tốc độ thật của game, chủ dự án ẩn được dòng gian lận (cột an). */

const NGUON = ["https://tiemtra.meomeo.app", "https://hanganh2701.github.io", "http://localhost:8765"];
const MOI_NGAY = 15000000; /* cùng mức trần game tự kiểm (sanitize trong game.js): két không quá 15 triệu mỗi ngày */
const PHUT_MOI_NGAY = 3; /* một ngày bán ngắn nhất 4 phút, chừa 1 phút */
const GUI_CACH = 30000; /* hai lần gửi của cùng một người cách nhau ít nhất 30 giây */

/* trần lãi tích luỹ theo ngày */
export const tranLai = (ngay) => MOI_NGAY * ngay + 5000000;
/* tên tiệm: bỏ ký tự điều khiển và dấu < >, gọn khoảng trắng, tối đa 24 ký tự */
export function lamSachTen(t) {
  const s = String(t || "")
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
  return s || "Tiệm Trà Nhỏ";
}
/* kiểm một lần gửi; cu = dòng đang lưu (hoặc null); tra { ok, loi, dong } */
export function kiemDiem(b, cu, bayGio) {
  const ngay = Math.floor(+b.ngay),
    lai = Math.round(+b.lai),
    sao = +b.sao;
  if (!(typeof b.khoa === "string" && /^[0-9a-f-]{32,40}$/i.test(b.khoa))) return { ok: false, loi: "khoá không hợp lệ" };
  if (!(ngay >= 1 && ngay <= 100000)) return { ok: false, loi: "ngày không hợp lệ" };
  if (!Number.isFinite(lai) || lai < -1e10 || lai > tranLai(ngay)) return { ok: false, loi: "số tiền vô lý so với số ngày" };
  if (!(sao >= 1 && sao <= 5)) return { ok: false, loi: "sao không hợp lệ" };
  if (cu && bayGio - cu.sua < GUI_CACH) return { ok: false, loi: "gửi dồn quá nhanh" };
  /* lượt đang chơi: ngày lùi lại là chơi lại từ đầu, bắt đầu theo dõi lại */
  const luotMoi = !cu || ngay < cu.rn;
  const rn0 = luotMoi ? ngay : cu.rn0,
    rt0 = luotMoi ? bayGio : cu.rt0;
  if (!luotMoi && ngay - rn0 > (bayGio - rt0) / 60000 / PHUT_MOI_NGAY + 3) return { ok: false, loi: "tiến độ nhanh hơn game cho phép" };
  const hon = !cu || lai > cu.lai;
  return {
    ok: true,
    dong: {
      ten: hon ? lamSachTen(b.ten) : cu.ten,
      lai: hon ? lai : cu.lai,
      ngay: hon ? ngay : cu.ngay,
      sao: hon ? Math.round(sao * 10) / 10 : cu.sao,
      ban: String(b.ban || "").slice(0, 12),
      tao: cu ? cu.tao : bayGio,
      sua: bayGio,
      rn: ngay,
      rn0,
      rt0,
    },
  };
}

async function bam(khoa) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(khoa));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
function traLoi(body, req, status = 200) {
  const o = req.headers.get("Origin") || "";
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": NGUON.includes(o) ? o : NGUON[0],
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
      Vary: "Origin",
    },
  });
}
async function bang(env, n, id) {
  const top = await env.DB.prepare("SELECT id, ten, lai, ngay, sao FROM diem WHERE an = 0 ORDER BY lai DESC, sua ASC LIMIT ?").bind(n).all();
  const tong = await env.DB.prepare("SELECT COUNT(*) AS n FROM diem WHERE an = 0").first();
  let minh = null;
  if (id) {
    const r = await env.DB.prepare("SELECT lai, ngay, an FROM diem WHERE id = ?").bind(id).first();
    if (r && !r.an) {
      const h = await env.DB.prepare("SELECT COUNT(*) AS n FROM diem WHERE an = 0 AND lai > ?").bind(r.lai).first();
      minh = { hang: h.n + 1, lai: r.lai, ngay: r.ngay };
    }
  }
  return {
    tong: tong.n,
    bang: (top.results || []).map((r, i) => ({ hang: i + 1, ten: r.ten, lai: r.lai, ngay: r.ngay, sao: r.sao, minh: !!id && r.id === id })),
    minh,
  };
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return traLoi({}, req);
    const url = new URL(req.url),
      duong = url.pathname.replace(/\/+$/, "");
    try {
      if (req.method === "GET" && (duong === "" || duong === "/bang")) {
        const n = Math.min(100, Math.max(1, +url.searchParams.get("n") || 50));
        return traLoi(await bang(env, n, null), req);
      }
      if (req.method !== "POST") return traLoi({ loi: "không có" }, req, 404);
      const b = await req.json().catch(() => ({}));
      const id = typeof b.khoa === "string" && b.khoa.length >= 32 ? await bam(b.khoa) : null;
      if (duong === "/bang") return traLoi(await bang(env, Math.min(100, Math.max(1, +b.n || 50)), id), req);
      if (!id) return traLoi({ loi: "khoá không hợp lệ" }, req, 400);
      if (duong === "/roi") {
        await env.DB.prepare("DELETE FROM diem WHERE id = ?").bind(id).run();
        return traLoi({ ok: true }, req);
      }
      if (duong === "/diem") {
        const cu = await env.DB.prepare("SELECT * FROM diem WHERE id = ?").bind(id).first();
        const k = kiemDiem(b, cu, Date.now());
        if (!k.ok) return traLoi({ loi: k.loi }, req, 422);
        const d = k.dong;
        await env.DB.prepare(
          `INSERT INTO diem (id, ten, lai, ngay, sao, ban, tao, sua, rn, rn0, rt0) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET ten = excluded.ten, lai = excluded.lai, ngay = excluded.ngay, sao = excluded.sao, ban = excluded.ban,
           sua = excluded.sua, rn = excluded.rn, rn0 = excluded.rn0, rt0 = excluded.rt0`,
        )
          .bind(id, d.ten, d.lai, d.ngay, d.sao, d.ban, d.tao, d.sua, d.rn, d.rn0, d.rt0)
          .run();
        const h = await env.DB.prepare("SELECT COUNT(*) AS n FROM diem WHERE an = 0 AND lai > ?").bind(d.lai).first();
        return traLoi({ ok: true, hang: h.n + 1, lai: d.lai }, req);
      }
      return traLoi({ loi: "không có" }, req, 404);
    } catch (e) {
      return traLoi({ loi: "máy chủ lỗi" }, req, 500);
    }
  },
};

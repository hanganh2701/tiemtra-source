# Máy chủ bảng xếp hạng chung

Cloudflare Worker + D1, chạy ở https://bxh.meomeo.app. Đây là tính năng máy chủ duy nhất của game (chủ dự án chốt 01/10/2026).

## Đưa lên lần đầu
```
cd may-chu/bxh
npx wrangler login                      # chủ dự án tự đăng nhập Cloudflare
npx wrangler d1 create tiemtra-bxh      # dán database_id vào wrangler.toml
npx wrangler d1 execute tiemtra-bxh --remote --file=schema.sql
npx wrangler deploy
```

## Việc thường gặp
- Xem bảng: `curl https://bxh.meomeo.app/bang?n=20`
- Ẩn một dòng gian lận: `npx wrangler d1 execute tiemtra-bxh --remote --command "UPDATE diem SET an = 1 WHERE ten = 'Tên tiệm'"`
- Hiện lại: đổi `an = 1` thành `an = 0`.

## Lưu gì
Tên tiệm, lãi tích luỹ cao nhất của tiệm, ngày trong game, sao, phiên bản, giờ gửi. Không lưu tên thật, số điện thoại hay địa chỉ IP.
Người chơi giữ khoá bí mật trên máy, máy chủ chỉ lưu sha256 của khoá.

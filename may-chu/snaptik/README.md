# Mèo Tải: trang tải video TikTok

Trang riêng, không thuộc game Tiệm Trà Nhỏ. Chạy ở https://snaptik.meomeo.app bằng một Cloudflare Worker (gói miễn phí) kèm trang tĩnh. Chủ dự án yêu cầu ngày 16/10/2026.

Tên hiện trên trang là **Mèo Tải**, không dùng tên hay logo SnapTik (tên đó là thương hiệu của người khác). Tên miền con vẫn là `snaptik` theo yêu cầu; muốn tránh hẳn rủi ro nhãn hiệu thì đổi tên miền con trong `wrangler.toml` và các link `snaptik.meomeo.app` trong `public/`.

## Làm được gì
- Dán link TikTok (link đầy đủ, link rút gọn `vt.tiktok.com`/`vm.tiktok.com`/`tiktok.com/t/…`, chữ chia sẻ có kèm link, hoặc id bài)
- Video không logo, bản HD khi TikTok có bản nét hơn (ưu tiên H.264, chỉ có H.265 thì ghi rõ), nhạc MP3, ảnh bìa
- Bài ảnh (slide): tải từng ảnh, tải cả bộ thành file ZIP, ghép ảnh và nhạc thành video ngay trên trình duyệt
- Xem trước video, sao chép mô tả, số lượt xem/thích/bình luận/chia sẻ
- Lịch sử 20 bài gần nhất (chỉ trên máy người dùng), trang MP3 và trang Ảnh riêng, trang hướng dẫn, điều khoản, bảo mật
- Cài lên màn hình chính (PWA); trên Android, đã cài thì Mèo Tải hiện trong nút Chia sẻ của TikTok
- Nút đánh dấu (bookmarklet) cho máy tính, giao diện sáng/tối theo máy
- Không quảng cáo, không tài khoản, không theo dõi

## Cách chạy
```
public/            trang tĩnh: index.html (video), mp3/, anh/, huong-dan/, dieu-khoan/, bao-mat/, 404.html,
                   app.js (chạy trên trang), cong-cu.js (hàm thuần, ZIP), style.css, sw.js, manifest, icon
worker.js          API: /api/thong-tin?url=… và /api/tai?id=…&loai=video|hd|mp3|anh|bia&i=…[&xem=1]
```
- `/api/thong-tin` đọc trang công khai `https://www.tiktok.com/@/video/<id>`, lấy dữ liệu trong thẻ `__UNIVERSAL_DATA_FOR_REHYDRATION__` (trang kiểu cũ: `SIGI_STATE`). Thông tin bài và cookie người xem TikTok cấp được giữ 10 phút ở bộ đệm Cloudflare.
- `/api/tai` chỉ nhận id bài, không nhận link tuỳ ý, nên không ai mượn máy chủ tải thứ khác được. Worker lấy file từ máy chủ TikTok (gửi kèm cookie và `Referer: https://www.tiktok.com/` như trình duyệt) rồi chuyển thẳng về người dùng, có hỗ trợ `Range` để tua video xem trước. Chỉ nhận kiểu file đúng loại (video/âm thanh/ảnh), trang lỗi HTML hay SVG thì bỏ.
- Mỗi máy tìm tối đa 20 lần mỗi phút (`[[ratelimits]]` trong `wrangler.toml`; xoá khối đó thì worker bỏ qua giới hạn).
- Test: `npm test` ở gốc kho (file `tests/snaptik.test.mjs`, mạng giả, không gọi TikTok).

## Đưa lên lần đầu
```
cd may-chu/snaptik
npx wrangler login        # chủ dự án tự đăng nhập Cloudflare (cùng tài khoản đang giữ meomeo.app)
npx wrangler deploy
```
Chạy thử trên máy: `npx wrangler dev` rồi mở http://localhost:8787.

Sau khi lên, thử thật vài link: một video thường, một video có bản 1080p, một bài ảnh, một link rút gọn từ app.

## Chưa thử được, cần thử khi đưa lên
- **Tải file thật từ máy chủ TikTok**: lúc làm chưa chạy được bước này (môi trường làm việc không cho), mới thử bằng dữ liệu giả. Cách làm giống yt-dlp (cookie `tt_chain_token` + Referer), nhưng TikTok có thể chặn dải IP của Cloudflare. Nếu `/api/thong-tin` hay `/api/tai` báo lỗi liên tục thì đó là chỗ cần xem trước.
- **Bài ảnh**: đọc theo cấu trúc `imagePost.images[].imageURL.urlList` mà các công cụ mã nguồn mở đang dùng; chưa thử với một bài ảnh thật.
- **`wrangler.toml`**: chưa chạy `wrangler deploy --dry-run` được. Nếu wrangler báo lỗi ở khối `[[ratelimits]]` thì xoá khối đó (trang vẫn chạy, chỉ mất giới hạn).

## Nên biết trước
- TikTok không cho phép tải nội dung bằng công cụ ngoài trong điều khoản của họ; TikTok có thể chặn bất cứ lúc nào. Người dùng tải gì, dùng vào việc gì là trách nhiệm của họ, trang điều khoản đã ghi rõ phải tôn trọng bản quyền người làm video.
- Điều khoản dịch vụ của Cloudflare có hạn chế việc dùng mạng của họ để phát nhiều video. Nên đọc lại khi trang đông người dùng.
- Gói Workers miễn phí: 100.000 lượt gọi mỗi ngày. Mỗi lần tìm là 1 lượt, mỗi lần bấm tải là 1 lượt (xem trước video có thể vài lượt vì tua).

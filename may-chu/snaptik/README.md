# snaptik: trang tải video TikTok, kiểu mèo

Trang riêng, không thuộc game Tiệm Trà Nhỏ. Chạy ở https://snaptik.meomeo.app bằng một Cloudflare Worker (gói miễn phí) kèm trang tĩnh. Chủ dự án yêu cầu ngày 16/10/2026.

Tên hiện trên trang là **snaptik** (viết thường). Ban đầu trang tên Mèo Tải để tránh tên SnapTik, vốn là tên của trang tải TikTok khác; ngày 17/10/2026 chủ dự án chốt dùng tên snaptik và tự nhận rủi ro nhãn hiệu. Logo, hình mèo, chữ đều tự làm, không lấy logo hay nội dung của các trang SnapTik khác. Chân trang và mục hỏi đáp ghi rõ trang không liên kết với TikTok, ByteDance hay các trang SnapTik khác. Muốn đổi tên lại thì sửa chữ `snaptik` trong `public/` (tên Worker `meotai-snaptik` và khoá lịch sử `meotai-lich-su` là tên nội bộ, để nguyên).

## Làm được gì
- Dán link TikTok (link đầy đủ, link rút gọn `vt.tiktok.com`/`vm.tiktok.com`/`tiktok.com/t/…`, chữ chia sẻ có kèm link, hoặc id bài)
- Video không logo, bản HD khi TikTok có bản nét hơn (ưu tiên H.264, chỉ có H.265 thì ghi rõ), nhạc MP3, ảnh bìa
- Bài ảnh (slide): tải từng ảnh, tải cả bộ thành file ZIP, ghép ảnh và nhạc thành video ngay trên trình duyệt
- Xem trước video, sao chép mô tả, số lượt xem/thích/bình luận/chia sẻ
- Lịch sử 20 bài gần nhất (chỉ trên máy người dùng), trang MP3 và trang Ảnh riêng, trang hướng dẫn, điều khoản, bảo mật
- Cài lên màn hình chính (PWA); trên Android, đã cài thì snaptik hiện trong nút Chia sẻ của TikTok
- Nút đánh dấu (bookmarklet) cho máy tính, giao diện sáng/tối theo máy
- Không quảng cáo, không tài khoản, không theo dõi

## Cách chạy
```
public/            trang tĩnh: index.html (video), mp3/, anh/, huong-dan/, dieu-khoan/, bao-mat/, 404.html,
                   app.js (chạy trên trang), cong-cu.js (hàm thuần, ZIP), meo.js (hình mèo), style.css, sw.js,
                   manifest, icon.svg + icon-*.png, og.png (ảnh hiện khi chia sẻ link)
worker.js          API: /api/thong-tin?url=… và /api/tai?id=…&loai=video|hd|mp3|anh|bia&i=…[&xem=1]
```
- `/api/thong-tin` đọc trang công khai `https://www.tiktok.com/@/video/<id>`, lấy dữ liệu trong thẻ `__UNIVERSAL_DATA_FOR_REHYDRATION__` (trang kiểu cũ: `SIGI_STATE`). Thông tin bài và cookie người xem TikTok cấp được giữ 10 phút ở bộ đệm Cloudflare.
- `/api/tai` chỉ nhận id bài, không nhận link tuỳ ý, nên không ai mượn máy chủ tải thứ khác được. Worker lấy file từ máy chủ TikTok (gửi kèm cookie và `Referer: https://www.tiktok.com/` như trình duyệt) rồi chuyển thẳng về người dùng, có hỗ trợ `Range` để tua video xem trước. Chỉ nhận kiểu file đúng loại (video/âm thanh/ảnh), trang lỗi HTML hay SVG thì bỏ.
- Mỗi máy tìm tối đa 20 lần mỗi phút (`[[ratelimits]]` trong `wrangler.toml`; xoá khối đó thì worker bỏ qua giới hạn).
- `worker.js` luôn chạy ở Singapore (`[placement] region = "aws:ap-southeast-1"`). Người ở Việt Nam lúc vào trạm Cloudflare Hồng Kông, lúc vào Singapore; TikTok không hoạt động ở Hồng Kông nên trạm đó chỉ nhận trang báo khu vực. Trang tĩnh vẫn phát từ trạm gần nhất. Header `cf-placement: remote-SIN` cho biết yêu cầu đã được chuyển sang Singapore.
- `_headers` gắn `no-transform` cho mọi trang để Cloudflare không chèn script Web Analytics của tên miền meomeo.app (trang hứa không theo dõi).
- Test: `npm test` ở gốc kho (file `tests/snaptik.test.mjs`, mạng giả, không gọi TikTok).

## Giao diện kiểu mèo (17/10/2026)
Chủ dự án muốn trang mang "vibe" con mèo. Mọi hình đều tự vẽ bằng SVG:
- Màu mèo mướp: cam `#c2410c` cho nút và link (chữ trắng trên nền cam đạt 5,2:1), nền kem, hồng đệm chân. Chế độ tối nền tím than, nút cam sáng chữ nâu, mắt mèo sáng màu hổ phách
- Mèo ngó qua mép ô tìm, hai chân gác lên ô (`meo.js`, gắn lúc nạp `app.js`). Nét mặt theo `body[data-meo]`: ngồi chờ thì chớp mắt, giật tai; đang tìm thì đảo mắt, đạp chân; tìm thấy thì cười tít mắt; gặp lỗi thì cụp tai. Không đổi gì khi máy bật giảm chuyển động
- Mèo cười ngó trên mép thẻ kết quả, mèo ngồi quay lưng trên mép chân trang vẫy đuôi, mèo cuộn tròn ngủ ở trang 404
- Nền đầu trang có dấu chân mèo, số bước in trên đệm chân, tiêu đề tính năng có dấu chân, vòng chờ là cuộn len lăn, nút tìm ghi "Mèo đang tìm…"
- Điện thoại (≤700px): thẻ kết quả gọn (ảnh nhỏ 96px bên trái; tên, mô tả 3 dòng, số liệu bên phải) để cả 4 nút tải hiện ngay sau khi tìm, không phải cuộn (375×812: nút cuối ở 622px; 320×640: thấy 3 nút đầu). Bấm xem trước thì thẻ chuyển một cột, video lên đầu. Đầu trang không dính (cao gần 100px, che thẻ). Nút bấm cao ít nhất 44px, chừa chỗ tai thỏ khi xoay ngang (`--le`, `env(safe-area-inset-*)`)
- Logo: mặt mèo kem trên nền cam, góc có nút tải. `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` và `og.png` (1200×630) chụp từ SVG bằng Chromium headless; sửa `icon.svg` thì chụp lại

## Đưa lên lần đầu
```
cd may-chu/snaptik
npx wrangler login        # chủ dự án tự đăng nhập Cloudflare (cùng tài khoản đang giữ meomeo.app)
npx wrangler deploy
```
Chạy thử trên máy: `npx wrangler dev` rồi mở http://localhost:8787.

Sau khi lên, thử thật vài link: một video thường, một video có bản 1080p, một bài ảnh, một link rút gọn từ app.

## Đã thử thật (17/10/2026)
Chạy `wrangler dev` (bộ chạy workerd của Cloudflare) trên máy làm việc, gọi TikTok thật:
- `wrangler deploy --dry-run` qua: đọc 24 file tĩnh, nhận `ASSETS` và `GIOI_HAN`; `_headers` (CSP…) được áp dụng
- Trang chạy trong Chromium với CSP bật đủ, không lỗi; dán chữ chia sẻ có link → thẻ kết quả đủ thông tin, ảnh bìa lấy thẳng từ TikTok vẫn hiện
- Tải trọn video 540p (MP4 2,9 MB, H.264), xem 2 khung hình: không có logo TikTok hay tên tài khoản; tải nhạc ra MP3 thật; bản HD 720p (H.265), ảnh bìa JPEG, tua (Range 206) đều được
- Lần thử thật tìm ra 3 lỗi đã sửa: Worker không khởi động vì export hằng (Cloudflare coi mỗi export là điểm vào); bấm nút tải nhận trang 404 vì trang tĩnh chặn lượt mở trang trước Worker (`run_worker_first`); TikTok gửi nhạc kèm kiểu `video/mp4` nên file nhạc thành `.mp4`. Mỗi lỗi có test giữ.

## Đã lên (17/10/2026)
`wrangler deploy` bằng tài khoản Cloudflare đang giữ meomeo.app, Worker `meotai-snaptik` chạy ở https://snaptik.meomeo.app. Thử thật trên trang đã lên:
- Dán chữ chia sẻ có link vào trang trong trình duyệt → thẻ kết quả đủ thông tin; bấm 4 nút tải đều nhận file: video không logo 576p H.264 (xem khung hình: không logo, đúng video của ảnh bìa), HD 720p H.265, MP3 thật (ID3, 44,1 kHz), ảnh bìa JPEG. Xem trước tua được (Range 206), trang khác nhúng file thì bị chặn (403); bài đã xoá báo mã 10204
- Lần thử thật tìm ra 2 lỗi đã sửa, mỗi lỗi có test giữ:
  - lượt nào vào trạm Hồng Kông cũng báo "Không đọc được trang TikTok" (TikTok trả trang khu vực `__REGION__DATA__INJECTED__`), kể cả bấm tải ngay sau khi tìm thấy bài (bộ đệm tách theo trạm). Sửa: đặt Worker chạy ở Singapore
  - Cloudflare chèn script Web Analytics vào mọi trang, CSP chặn nên console báo lỗi. Sửa: `no-transform`
- Lúc thử, TikTok tạm chặn IP máy làm việc (trang "Please wait…", oEmbed trả 429) sau nhiều lượt thử liên tiếp. Máy chủ ở Singapore không bị. Nếu sau này TikTok chặn cả máy chủ thì trang chỉ báo lỗi; không làm cách vượt lớp chặn bot của TikTok.

## Còn chưa thử
- **Bài ảnh (slide) và link rút gọn thật**: chưa có link thật để thử. Bài ảnh đọc theo cấu trúc `imagePost.images[].imageURL.urlList` mà các công cụ mã nguồn mở đang dùng. Chủ dự án dán một link bài ảnh và một link `vt.tiktok.com` chép từ app là thử được.

## Nên biết trước
- TikTok không cho phép tải nội dung bằng công cụ ngoài trong điều khoản của họ; TikTok có thể chặn bất cứ lúc nào. Người dùng tải gì, dùng vào việc gì là trách nhiệm của họ, trang điều khoản đã ghi rõ phải tôn trọng bản quyền người làm video.
- Điều khoản dịch vụ của Cloudflare có hạn chế việc dùng mạng của họ để phát nhiều video. Nên đọc lại khi trang đông người dùng.
- Gói Workers miễn phí: 100.000 lượt gọi mỗi ngày. Mỗi lần tìm là 1 lượt, mỗi lần bấm tải là 1 lượt (xem trước video có thể vài lượt vì tua).

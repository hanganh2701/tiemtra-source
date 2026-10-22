# didate: thiệp mời dễ thương, gửi bằng một đường link

Trang riêng, không thuộc game Tiệm Trà Nhỏ, chạy ở https://didate.meomeo.app bằng một Cloudflare Worker (gói miễn phí) kèm D1 và trang tĩnh. Chủ dự án yêu cầu ngày 22/10/2026, lấy ý từ một trang rủ đi ăn có nút "Không" biết né.

## Làm được gì
- 4 mẫu: rủ đi ăn/đi chơi, tỏ tình, xin lỗi/làm lành, chúc sinh nhật. Mẫu nào cũng sửa được hết: tên hai người, xưng hô (6 cặp), ảnh, màu (6 màu), lúc mở (phong thư, hộp quà, vào thẳng), mọi câu chữ, nút từ chối có né hay không và 3 câu khi né, hỏi ngày, hỏi giờ (giờ gợi ý), danh sách lựa chọn (tối đa 10, có ý khác), lời kết có chỗ chèn câu trả lời
- Trang soạn có bản xem thử bên cạnh (điện thoại: nút Xem thử toàn màn hình), xem được từng màn; chữ của mẫu đổi theo tên và xưng hô, ô nào đã sửa tay thì giữ; bản đang soạn nhớ trong trình duyệt
- Người nhận: mở phong thư/hộp quà, nút từ chối né chuột và ngón tay (9 lần thì trốn, nút đồng ý to dần), chọn ngày trên lịch (giờ Việt Nam, không chọn ngày đã qua), giờ, lựa chọn; màn kết điền câu trả lời, thêm vào lịch (.ics), nhắn lại cho người gửi
- Người gửi: link quản lý riêng để xem đã mở chưa (mấy lần), trả lời gì, cố bấm từ chối mấy lần, lời nhắn; sửa, xoá thiệp. Trình duyệt nhớ các thiệp đã tạo ở mục Thiệp của tôi
- Người tạo mở thiệp của mình thì là bản xem thử, không tính câu trả lời, không đếm lượt mở
- Báo thiệp xấu ở cuối thiệp: bot nhắn cho chủ dự án kèm lệnh gỡ
- Thiệp tự xoá sau 90 ngày. Không quảng cáo, không tài khoản, không theo dõi

## Cách chạy
```
public/              trang tĩnh: index.html (trang chủ), tao/ (soạn), quan-ly/ (quản lý, Thiệp của tôi), thiep.html (khung trang thiệp),
                     bao-mat/, dieu-khoan/, 404.html; chung.js (mẫu, làm sạch dữ liệu: dùng chung với worker), the.js + the.css (tấm thiệp),
                     tao.js, quan-ly.js, thiep.js, trang-chu.js, trang.js (việc chung của trang), style.css, fonts/ (Baloo 2 rút gọn, OFL)
worker.js            /<id> trang thiệp (dữ liệu đặt vào thiep.html), /anh/<id> ảnh, /api/thiep… (xem đầu file); có thiệp mới thì dọn thiệp quá hạn
kho-anh.js           chỗ để ảnh: "telegram" hoặc "d1" (biến KHO_ANH). Đổi kho chỉ sửa file này; ảnh cũ vẫn đọc từ kho cũ
schema.sql           bảng thiep, anh_d1
hinh/                nguồn og.png, icon-*.png; chụp lại: node may-chu/didate/hinh/chup.mjs
lay-chat-id.mjs      tìm mã kênh Telegram cho TG_CHAT
```
- Link thiệp `didate.meomeo.app/<8 ký tự a-z 2-9>` (32^8 khả năng, máy tìm kiếm không lưu). Link quản lý `…/quan-ly/#<id>.<khoá>`: khoá 144 bit nằm sau dấu # nên không đi theo đường dẫn, trang gửi trong header `X-Khoa`; máy chủ chỉ giữ sha256 của khoá.
- Chữ người dùng chỉ vào `textContent`; dữ liệu thiệp đặt trong `<script type="application/json">` có thoát `<`. CSP chặn script và style viết thẳng trong trang (test kiểm). API chỉ nhận POST từ chính trang (kiểm `Origin`).
- Ảnh được thu nhỏ trên máy người tạo (cạnh dài 1280px, JPEG, tối đa 1,5 MB), vẽ lại qua canvas nên mất hết EXIF (vị trí chụp). Worker kiểm byte đầu, chỉ nhận JPG/PNG/WebP tới 2 MB. Ảnh trả về có `Cross-Origin-Resource-Policy: same-origin` (trang khác không mượn làm chỗ để ảnh được), giữ 6 giờ ở bộ đệm Cloudflare.
- Mỗi máy tạo tối đa 6 thiệp/phút; mở, trả lời, báo cáo tối đa 40 lần/phút (`[[ratelimits]]`).
- Test: `npm test` ở gốc kho (file `tests/didate.test.mjs`: D1 giả bằng `node:sqlite`, Telegram giả, tấm thiệp và trang soạn trong jsdom).
- Chạy thử trên máy: `npx wrangler d1 execute didate --local --file=may-chu/didate/schema.sql --config may-chu/didate/wrangler.toml` một lần, rồi `npx wrangler dev --config may-chu/didate/wrangler.toml --port 8788 --var KHO_ANH:d1` và mở http://localhost:8788 (ảnh nằm trong D1 trên máy, không cần bot).

## Kho ảnh Telegram (chủ dự án chốt 22/10/2026, tự nhận rủi ro)
Bot gửi ảnh dạng file vào một kênh riêng tư; D1 giữ mã file. Mỗi lần ảnh chưa có trong bộ đệm, worker gọi `getFile` rồi tải file (link tải có token nên chỉ worker gọi, trang không bao giờ thấy token).
- **Trái điều khoản bot của Telegram** (mục 5.2(e): không dùng bot làm kho lưu trữ đám mây). Telegram có thể xoá ảnh hay khoá bot bất cứ lúc nào (mục 6.3, 10). Khi đó mọi thiệp mất ảnh cùng lúc, phần chữ vẫn chạy. Muốn thôi Telegram: đổi `KHO_ANH = "d1"` rồi `wrangler deploy`, ảnh mới vào D1 (500 MB mỗi cơ sở dữ liệu).
- **Bot chỉ xoá được tin trong 48 giờ.** Người tạo xoá thiệp hay đổi ảnh sau đó thì bot nhắn vào kênh (trả lời thẳng tin có ảnh) để chủ dự án xoá tay. Thiệp hết hạn 90 ngày thì ảnh vẫn nằm trong kênh; thỉnh thoảng dọn kênh bằng Telegram trên máy tính (chọn nhiều tin, xoá). Trang Bảo mật đã ghi rõ điều này.
- Chủ dự án thấy mọi ảnh trong kênh (trang Bảo mật đã ghi). Mỗi ảnh có chú thích `didate <id>`, tìm trong kênh theo id thiệp được.
- Gửi vào cùng một kênh, Telegram cho khoảng 1 tin/giây; bị chặn (429) mà chỉ phải chờ ≤ 5 giây thì worker chờ rồi thử lại một lần, lâu hơn thì báo người dùng thử lại.

## Đưa lên lần đầu
Chủ dự án tự làm phần Telegram (token là của bạn, đừng dán vào chat):
1. Telegram › @BotFather › `/newbot`, đặt tên (vd "didate kho ảnh"), lấy token.
2. Tạo kênh **riêng tư** (vd "didate ảnh"), thêm bot làm quản trị với quyền đăng tin và xoá tin. Đăng một tin bất kỳ trong kênh.
3. `node may-chu/didate/lay-chat-id.mjs` (dán token khi được hỏi) để lấy mã kênh, dạng `-100…`.

Rồi:
```
cd may-chu/didate
npx wrangler d1 create didate                       # dán database_id vào wrangler.toml
npx wrangler d1 execute didate --remote --file=schema.sql
npx wrangler secret put TG_TOKEN                    # dán token bot
npx wrangler secret put TG_CHAT                     # dán mã kênh -100…
npx wrangler deploy
```
Báo cáo thiệp xấu muốn về kênh khác (vd chat riêng với bot) thì thêm secret `TG_BAO`.

Sau khi lên: tạo một thiệp có ảnh, mở bằng trình duyệt khác (hoặc cửa sổ ẩn danh) trả lời thử, xem trang quản lý; dán link thiệp vào Messenger/Zalo xem thẻ xem trước. Đã làm 22/10/2026, xem mục Đã lên.

## Việc thường gặp
- Gỡ thiệp xấu: `npx wrangler d1 execute didate --remote --command "UPDATE thiep SET an = 1 WHERE id = '<id>'"` (hiện lại: `an = 0`). Xoá hẳn: `DELETE FROM thiep WHERE id = '<id>'`, rồi xoá tay ảnh trong kênh.
- Thiệp bị báo: `npx wrangler d1 execute didate --remote --command "SELECT id, bao_cao, bao_cao_ly_do FROM thiep WHERE bao_cao > 0"`
- Số thiệp: `… --command "SELECT mau, COUNT(*) FROM thiep GROUP BY mau"`

## Đã thử (22/10/2026)
Trên máy bằng `wrangler dev` (ảnh vào D1 trên máy), trong trình duyệt của app: tạo thiệp có ảnh, mở như người nhận (phong thư mở, nút từ chối né theo chuột, 9 lần thì trốn, nút đồng ý to dần), chọn ngày giờ món, màn kết điền đúng câu trả lời, gửi lời nhắn; trang quản lý thấy lượt mở, câu trả lời, số lần cố bấm từ chối, lời nhắn; sửa thiệp (đổi màu) rồi lưu; người tạo mở thiệp của mình thì là bản xem thử. Bề ngang 375px: trang soạn, nút Xem thử toàn màn hình, tấm thiệp không tràn ngang.

## Đã lên (22/10/2026)
- Telegram (Claude làm trên Telegram Web, chủ dự án tự đăng nhập): bot **@didate_anh_bot** ("didate kho ảnh"), kênh riêng tư **didate ảnh**; bot là quản trị kênh, chỉ có quyền đăng tin và xoá tin. Chủ dự án tự đặt secret `TG_TOKEN`; `TG_CHAT` là mã kênh.
- D1 `didate` (vùng APAC), `wrangler deploy` bằng tài khoản Cloudflare đang giữ meomeo.app, Worker `didate` chạy ở https://didate.meomeo.app.
- Cron bị Cloudflare từ chối (lỗi 10063: tài khoản chưa có tên miền workers.dev), nên bỏ cron: thiệp quá hạn được dọn mỗi khi có thiệp mới. Muốn bật lại cron thì mở trang Workers trên bảng điều khiển Cloudflare một lần (tự tạo tên miền workers.dev) rồi thêm `[triggers]` vào `wrangler.toml`.
- Thử trên trang thật: trang chủ, trang soạn, 404; đường dẫn `/<id>` tới được worker (không cần `run_worker_first`); tạo thiệp có ảnh trong trình duyệt, ảnh vào kênh với chú thích `didate <id>`; ảnh tải từ Telegram lần đầu 2,7 giây, lần sau lấy từ bộ đệm 0,13 giây; tạo thiệp có ảnh khoảng 2 giây (lần đầu sau khi deploy 10 giây); mở thiệp, trả lời, trang quản lý thấy đủ; trang khác gọi API bị chặn (403); thẻ xem trước có `og:title` theo tên người nhận. Xoá thiệp (bằng API và bằng trang quản lý) thì bot xoá luôn ảnh trong kênh. Đã xoá hết thiệp thử, D1 thật đang trống.

## Máy tìm kiếm (22/10/2026)
- Title trang chủ: "Tạo thiệp mời dễ thương Online - Đi date, đi ăn, sinh nhật, tỏ tình". Chân trang các trang ghi "Created by 1conmeo".
- Google Search Console: gửi `https://didate.meomeo.app/sitemap.xml` trong thuộc tính Miền `meomeo.app` (đã xác minh từ lúc làm snaptik), Google đọc thành công, thấy 4 trang; đã yêu cầu lập chỉ mục `https://didate.meomeo.app/`. Trang thiệp `/<id>` và `/quan-ly/` không vào chỉ mục (noindex, robots.txt).
- Bing chưa gửi (dùng IndexNow như snaptik, hoặc nhập lại từ Search Console).

## Còn chưa thử
- Điện thoại thật (iPhone, Android): né bằng ngón tay, chọn ảnh HEIC trên iPhone, file .ics.
- Dán link thiệp vào Messenger, Zalo xem thẻ xem trước.

## Nên biết trước
- Gói Workers miễn phí: 100.000 lượt gọi worker mỗi ngày (file tĩnh không tính). Mỗi lần mở thiệp tốn 2–3 lượt (trang, lượt mở, ảnh nếu chưa có trong bộ đệm), trả lời thêm 1–2 lượt. Vượt thì trang báo lỗi tới 7 giờ sáng hôm sau.
- D1 miễn phí: 5 GB, 100.000 dòng ghi mỗi ngày; mỗi thiệp chỉ vài KB chữ.
- Người dùng tải ảnh người thật lên: điều khoản cấm quấy rối, giả mạo, ảnh người khác chưa đồng ý; có nút báo thiệp xấu.

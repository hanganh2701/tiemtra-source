/* Tiếng Việt: bản gốc, các tiếng khác dịch theo đúng khoá của file này.
   Chữ là HTML (được dùng <b>, <a>, <code>); {goc} là gốc đường dẫn của tiếng ("/" hay "/en/").
   Sửa xong chạy: node may-chu/snaptik/sinh-trang.mjs */
export default {
  chung: {
    menu: {
      video: "Video",
      mp3: "MP3",
      anh: "Ảnh",
      huongDan: "Hướng dẫn",
    },
    menuNhan: "Công cụ",
    trangPhuNhan: "Trang phụ",
    caiUngDung: "Cài ứng dụng",
    ngonNgu: "Ngôn ngữ",
    dan: "Dán",
    tai: "Tải về",
    chan: "© 2026 snaptik · Không liên kết với TikTok, ByteDance hay các trang SnapTik khác.",
    chanLink: {
      huongDan: "Hướng dẫn",
      dieuKhoan: "Điều khoản",
      baoMat: "Bảo mật",
    },
  },
  ungDung: {
    ten: "snaptik: tải video TikTok không logo",
    moTa: "Tải video TikTok không logo, bản HD, nhạc MP3 và ảnh slide.",
    loiTatMp3: "Tải nhạc MP3",
    loiTatAnh: "Tải ảnh slide",
  },
  trangChu: {
    title: "Tải video TikTok không logo, nét HD, miễn phí | snaptik",
    description: "Tải video TikTok không logo, bản HD, nhạc MP3 và ảnh slide về điện thoại hay máy tính. Miễn phí, không quảng cáo, không cần đăng nhập.",
    ogTitle: "snaptik: tải video TikTok không logo",
    ogDescription: "Dán link TikTok, nhận video không logo, bản HD, nhạc MP3 và ảnh slide. Miễn phí, không quảng cáo.",
    h1: "Tải video TikTok không logo",
    phu: "Dán link TikTok, mèo tha về cho bạn file MP4 không logo, bản HD, nhạc MP3 hoặc ảnh slide. Miễn phí, không quảng cáo, không cần đăng nhập.",
    nhanO: "Link video TikTok",
    goiY: "Dán link TikTok vào đây",
    nho: "Trên điện thoại: mở TikTok › Chia sẻ › Sao chép liên kết, rồi quay lại đây bấm Dán.",
    buocTieuDe: "Tải video TikTok trong ba bước",
    buoc: [
      ["Sao chép link", "Trong app TikTok, mở video, bấm nút Chia sẻ rồi chọn Sao chép liên kết. Trên máy tính, chép địa chỉ trên thanh trình duyệt."],
      ["Dán vào ô", "Quay lại snaptik, bấm Dán (hoặc nhấn giữ vào ô rồi chọn Dán). Trang tự tìm video ngay."],
      ["Chọn bản tải", "Bấm Tải video không logo, Tải video HD hoặc Tải nhạc MP3. File lưu vào thư mục Tải xuống của máy."],
    ],
    tinhNangTieuDe: "snaptik làm được gì",
    tinhNang: [
      ["Không logo", "Video tải về sạch, không có logo TikTok và tên tài khoản chạy quanh khung hình."],
      ["Bản HD khi có", "Nếu TikTok giữ bản nét hơn (720p, 1080p), trang hiện thêm nút Tải video HD kèm dung lượng."],
      ["Nhạc MP3", "Lấy riêng âm thanh gốc của video để làm nhạc chuông, nghe lại hay dựng video mới."],
      ["Bài ảnh (slide)", "Tải từng ảnh, tải cả bộ trong một file ZIP, hoặc ghép các ảnh và nhạc thành một video."],
      ["Mọi thiết bị", "Chạy trên Android, iPhone, iPad và máy tính. Cài lên màn hình chính để mở nhanh như một ứng dụng."],
      ["Riêng tư", "Không cần tài khoản, không lưu video, không theo dõi. Lịch sử tìm chỉ nằm trên máy của bạn."],
    ],
    hoiDapTieuDe: "Câu hỏi thường gặp",
    hoiDap: [
      ["snaptik có mất tiền không?", "Không. Trang miễn phí, không quảng cáo, không bắt đăng ký hay đăng nhập."],
      ["Video tải về có còn logo TikTok không?", "Không. snaptik lấy bản video mà TikTok phát trên web, bản này không gắn logo và tên tài khoản."],
      ["Tải trên iPhone thế nào?", "Dùng Safari, bấm nút tải rồi chọn Tải về. File nằm trong ứng dụng Tệp › Tải về. Mở file, bấm Chia sẻ › Lưu video để đưa vào ứng dụng Ảnh. Xem thêm ở trang <a href=\"{goc}huong-dan/\">Hướng dẫn</a>."],
      ["Video tải về nằm ở đâu?", "Android: thư mục Download (mở bằng ứng dụng Tệp hoặc Thư viện). Máy tính: thư mục Tải xuống, hoặc thư mục bạn đã chọn trong trình duyệt."],
      ["Sao có video không tải được?", "Thường do video để riêng tư, đã bị xoá, bị chặn ở khu vực, hoặc TikTok đang tạm chặn máy chủ. Kiểm tra link mở được trên TikTok không, rồi thử lại sau ít phút."],
      ["Có tải được video của tài khoản riêng tư không?", "Không. snaptik chỉ đọc được những gì ai cũng xem được trên TikTok mà không cần đăng nhập."],
      ["Tải video Story được không?", "Chưa chắc. Story còn hạn (24 giờ) của tài khoản công khai có link giống link video nên dán vào có thể tìm được, nhưng snaptik chưa được thử với story. Story đã hết hạn thì không tải được nữa."],
      ["Tôi có được đăng lại video tải về không?", "Video thuộc về người làm ra nó. Hãy chỉ tải để xem riêng, hoặc khi đã được chủ video đồng ý. Muốn đăng lại thì xin phép và ghi rõ nguồn. Xem <a href=\"{goc}dieu-khoan/\">Điều khoản</a>."],
      ["snaptik có phải của TikTok hay SnapTik không?", "Không. snaptik ở snaptik.meomeo.app là trang nhỏ làm cho vui, có mèo trông. Trang không liên kết với TikTok, ByteDance hay các trang mang tên SnapTik khác."],
    ],
  },
  mp3: {
    title: "Tải nhạc TikTok MP3, lấy âm thanh gốc của video | snaptik",
    description: "Tách nhạc từ video TikTok thành file MP3: dán link, bấm tải. Miễn phí, không quảng cáo, chạy trên điện thoại và máy tính.",
    ogTitle: "snaptik: tải nhạc TikTok MP3",
    ogDescription: "Dán link TikTok, lấy riêng âm thanh gốc thành file MP3.",
    h1: "Tải nhạc TikTok MP3",
    phu: "Lấy riêng âm thanh gốc của một video hay bài ảnh TikTok thành file nhạc. Dán link rồi bấm Tải nhạc MP3.",
    nhanO: "Link TikTok",
    goiY: "Dán link TikTok vào đây",
    nho: "Dùng được cả link video lẫn link bài ảnh có nhạc.",
    buocTieuDe: "Lấy nhạc từ TikTok",
    buoc: [
      ["Chép link bài đăng", "Mở video có đoạn nhạc bạn thích, bấm Chia sẻ › Sao chép liên kết."],
      ["Dán vào ô phía trên", "Bấm Dán, trang tìm bài và hiện tên bản nhạc, người đăng, độ dài."],
      ["Bấm Tải nhạc MP3", "File nhạc lưu vào thư mục Tải xuống, mở được bằng mọi trình nghe nhạc."],
    ],
    hoiDapTieuDe: "Hỏi đáp về nhạc TikTok",
    hoiDap: [
      ["Nhạc tải về là bản nào?", "Là âm thanh gốc gắn với bài đăng trên TikTok: có thể là bài hát người đăng chọn, hoặc tiếng thu thẳng trong video."],
      ["Sao có bài không hiện nút Tải nhạc MP3?", "Với một số bài hát có bản quyền, TikTok không cho lấy file nhạc riêng. Khi đó bạn vẫn tải được video, rồi dùng app chỉnh video để tách tiếng."],
      ["File nhạc có đuôi .m4a thay vì .mp3?", "snaptik giữ nguyên file TikTok gửi về, không chuyển định dạng để khỏi giảm chất lượng. Đa số là MP3; nếu là M4A thì điện thoại và máy tính vẫn mở bình thường."],
      ["Dùng nhạc tải về thế nào cho đúng?", "Nhạc có bản quyền của nhạc sĩ, ca sĩ hoặc người thu. Nghe riêng thì thoải mái; đưa vào video đăng công khai hay dùng kiếm tiền thì cần xin phép. Xem <a href=\"{goc}dieu-khoan/\">Điều khoản</a>."],
    ],
  },
  anh: {
    title: "Tải ảnh TikTok, slide ảnh không logo | snaptik",
    description: "Tải ảnh từ bài slide TikTok: từng ảnh, cả bộ trong một file ZIP, hoặc ghép ảnh và nhạc thành video. Miễn phí, không quảng cáo.",
    ogTitle: "snaptik: tải ảnh slide TikTok",
    ogDescription: "Tải từng ảnh, cả bộ ZIP, hoặc ghép ảnh slide TikTok thành video.",
    h1: "Tải ảnh TikTok (bài slide)",
    phu: "Dán link bài ảnh TikTok để tải từng ảnh gốc, cả bộ trong một file ZIP, hoặc ghép ảnh và nhạc thành video.",
    nhanO: "Link bài ảnh TikTok",
    goiY: "Dán link bài ảnh TikTok vào đây",
    nho: "Link bài ảnh thường có dạng tiktok.com/@ten/photo/… hoặc link rút gọn vt.tiktok.com/…",
    buocTieuDe: "Tải ảnh slide TikTok",
    buoc: [
      ["Chép link bài ảnh", "Mở bài ảnh trên TikTok, bấm Chia sẻ › Sao chép liên kết."],
      ["Dán vào ô phía trên", "Trang hiện tất cả ảnh trong bài theo đúng thứ tự."],
      ["Chọn cách tải", "Tải từng ảnh, tải cả bộ (.zip), hoặc bấm Ghép ảnh thành video để có một video kèm nhạc."],
    ],
    hoiDapTieuDe: "Hỏi đáp về bài ảnh",
    hoiDap: [
      ["Ảnh tải về có logo không?", "Không. Đây là ảnh gốc người đăng tải lên, không gắn logo TikTok."],
      ["Mở file ZIP trên điện thoại thế nào?", "Android: mở ứng dụng Tệp, chạm vào file ZIP › Giải nén. iPhone: mở ứng dụng Tệp, chạm vào file ZIP là máy tự giải nén thành thư mục."],
      ["Ghép ảnh thành video hoạt động ra sao?", "Trình duyệt của bạn tự ghép, mỗi ảnh hiện 2,5 giây, chuyển cảnh mờ dần, nhạc gốc chạy nền. Việc ghép chạy theo thời gian thật (bài 10 ảnh mất khoảng 25 giây), nên giữ trang mở tới khi xong. Chrome và Safari bản mới ra MP4, trình duyệt khác có thể ra WebM."],
      ["Ảnh có đuôi .webp mở không được?", "snaptik ưu tiên bản JPEG; chỉ khi TikTok không có JPEG mới tải bản WebP. Máy tính và điện thoại đời mới đều mở được WebP."],
    ],
  },
  huongDan: {
    title: "Hướng dẫn tải video TikTok trên Android, iPhone, máy tính | snaptik",
    description: "Cách tải video TikTok không logo trên Android, iPhone, iPad và máy tính; cài snaptik lên màn hình chính; tải nhanh bằng nút chia sẻ và nút đánh dấu.",
    noiDung: `
<h1>Hướng dẫn tải video TikTok</h1>
<p>Cách nào cũng bắt đầu bằng link của bài đăng. Trong app TikTok: mở video hoặc bài ảnh, bấm nút <b>Chia sẻ</b> (mũi tên cong) rồi chọn <b>Sao chép liên kết</b>. Trên máy tính: mở video trên tiktok.com rồi chép địa chỉ trên thanh trình duyệt.</p>

<h2 id="android">Trên điện thoại Android</h2>
<ol>
  <li>Chép link video trong app TikTok.</li>
  <li>Mở <a href="{goc}">snaptik.meomeo.app</a> bằng Chrome, bấm <b>Dán</b>. Lần đầu Chrome có thể hỏi quyền đọc bộ nhớ tạm, chọn Cho phép.</li>
  <li>Bấm <b>Tải video không logo</b> (hoặc bản HD, nhạc MP3).</li>
  <li>File nằm trong thư mục <b>Download</b>; ứng dụng Thư viện hoặc Google Photos sẽ thấy video sau vài giây.</li>
</ol>

<h2 id="iphone">Trên iPhone, iPad</h2>
<ol>
  <li>Chép link video trong app TikTok.</li>
  <li>Mở <a href="{goc}">snaptik.meomeo.app</a> bằng <b>Safari</b>, bấm <b>Dán</b> rồi chọn Cho phép dán.</li>
  <li>Bấm nút tải, Safari hỏi thì chọn <b>Tải về</b>. Biểu tượng mũi tên xanh trên thanh địa chỉ cho biết tiến độ.</li>
  <li>Mở ứng dụng <b>Tệp</b> › <b>Tải về</b>, chạm vào video, bấm <b>Chia sẻ</b> › <b>Lưu video</b> để đưa vào ứng dụng Ảnh.</li>
</ol>
<p class="nho">Cần iOS 13 trở lên. Trình duyệt khác trên iPhone (Chrome, Cốc Cốc) cũng tải được, file vẫn vào ứng dụng Tệp.</p>

<h2 id="may-tinh">Trên máy tính</h2>
<ol>
  <li>Mở video trên tiktok.com, chép địa chỉ trên thanh trình duyệt (Ctrl+L rồi Ctrl+C, máy Mac dùng ⌘).</li>
  <li>Mở <a href="{goc}">snaptik.meomeo.app</a>, dán vào ô (Ctrl+V) rồi bấm <b>Tải về</b>.</li>
  <li>Chọn bản muốn tải. File vào thư mục Tải xuống.</li>
</ol>

<h2 id="cai-dat">Cài snaptik lên màn hình chính</h2>
<p>snaptik cài được như một ứng dụng nhỏ, không qua kho ứng dụng, gần như không tốn bộ nhớ.</p>
<ul>
  <li><b>Android (Chrome):</b> bấm nút <b>Cài ứng dụng</b> trên đầu trang, hoặc menu ⋮ › <b>Thêm vào màn hình chính</b>.</li>
  <li><b>iPhone, iPad (Safari):</b> bấm nút Chia sẻ › <b>Thêm vào MH chính</b>.</li>
  <li><b>Máy tính (Chrome, Edge):</b> bấm biểu tượng cài đặt ở cuối thanh địa chỉ.</li>
</ul>

<h2 id="chia-se">Tải thẳng từ nút Chia sẻ (Android)</h2>
<p>Sau khi cài snaptik bằng Chrome trên Android, snaptik hiện trong danh sách chia sẻ của điện thoại. Trong TikTok, bấm <b>Chia sẻ</b> › <b>Khác</b> (hoặc biểu tượng ba chấm) › <b>snaptik</b>: trang mở ra và tự tìm video, không cần chép dán.</p>

<h2 id="phim-tat">Tải thẳng từ nút Chia sẻ (iPhone, iPad)</h2>
<p>iPhone không cho trang web nằm trong nút Chia sẻ như Android, nhưng ứng dụng <b>Phím tắt</b> có sẵn trên máy làm được việc này. Tạo một lần:</p>
<ol>
  <li>Mở ứng dụng <b>Phím tắt</b> (Shortcuts), bấm <b>+</b> để tạo phím tắt mới, đặt tên “Tải bằng snaptik”.</li>
  <li>Mở phần cài đặt của phím tắt (biểu tượng ⓘ), bật <b>Hiển thị trong Bảng chia sẻ</b> (Show in Share Sheet). Ở mục nhận đầu vào, chỉ chọn <b>URL</b> và <b>Văn bản</b>.</li>
  <li>Thêm tác vụ <b>Mã hoá URL</b> (URL Encode) với đầu vào là <b>Đầu vào phím tắt</b> (Shortcut Input).</li>
  <li>Thêm tác vụ <b>URL</b>, gõ <code>https://snaptik.meomeo.app{goc}?url=</code> rồi chèn biến <b>URL đã mã hoá</b> (URL Encoded Text) ngay sau dấu <code>=</code>.</li>
  <li>Thêm tác vụ <b>Mở URL</b> (Open URLs), rồi bấm Xong.</li>
</ol>
<p>Từ đó, trong TikTok bấm <b>Chia sẻ</b> › <b>Khác</b> (biểu tượng ba chấm) › <b>Tải bằng snaptik</b>: Safari mở snaptik và tự tìm video, không cần chép dán.</p>
<p class="nho">Tên các mục có thể hơi khác tuỳ bản iOS và ngôn ngữ của máy.</p>

<h2 id="danh-dau">Nút đánh dấu cho máy tính</h2>
<p>Kéo nút dưới đây lên thanh dấu trang của trình duyệt. Khi đang xem một video trên tiktok.com, bấm vào dấu trang đó là snaptik mở ra với đúng video ấy.</p>
<p>
  <a class="danh-dau" data-danh-dau="nhac-keo" href="javascript:location.href='https://snaptik.meomeo.app{goc}?url='+encodeURIComponent(location.href)">Tải bằng snaptik</a>
</p>
<p id="nhac-keo" class="nhac-keo" hidden>Nút này để kéo lên thanh dấu trang (Ctrl+Shift+B để hiện thanh dấu trang), không phải để bấm ở đây.</p>

<h2 id="loi">Khi không tải được</h2>
<ul>
  <li>Mở lại link trên TikTok xem bài còn không, có để riêng tư không.</li>
  <li>Link phải là link bài đăng (có <code>/video/</code>, <code>/photo/</code> hoặc link rút gọn <code>vt.tiktok.com</code>), không phải link trang cá nhân.</li>
  <li>TikTok thỉnh thoảng tạm chặn máy chủ: chờ vài phút rồi thử lại.</li>
  <li>Nút tải không phản hồi trên iPhone: kiểm tra Cài đặt › Safari › Tải về, và còn dung lượng trống.</li>
</ul>
`,
  },
  dieuKhoan: {
    title: "Điều khoản sử dụng và bản quyền | snaptik",
    description: "Điều khoản sử dụng snaptik: tôn trọng bản quyền người làm video, trang không lưu trữ nội dung.",
    noiDung: `
<h1>Điều khoản sử dụng</h1>
<p class="nho">Cập nhật ngày 16/10/2026.</p>

<h2>snaptik là gì</h2>
<p>snaptik là công cụ miễn phí giúp bạn lưu về máy những video, ảnh và âm thanh đang được chia sẻ công khai trên TikTok. Trang làm cho vui, không kinh doanh, không quảng cáo, và không liên kết với TikTok hay ByteDance. TikTok là nhãn hiệu của ByteDance.</p>

<h2>Bản quyền thuộc về người làm nội dung</h2>
<ul>
  <li>Video, ảnh, nhạc bạn tải về thuộc quyền của người đăng, nhạc sĩ, ca sĩ hoặc bên giữ bản quyền. snaptik không cấp cho bạn bất kỳ quyền nào với nội dung đó.</li>
  <li>Hãy chỉ tải để xem riêng, để lưu nội dung của chính bạn, hoặc khi đã được chủ nội dung đồng ý.</li>
  <li>Không dùng nội dung tải về để đăng lại như của mình, cắt bỏ tên tác giả, bán, hay làm việc trái pháp luật. Muốn đăng lại thì xin phép và ghi rõ nguồn.</li>
  <li>Bạn tự chịu trách nhiệm về cách mình dùng nội dung đã tải.</li>
</ul>

<h2>Trang không lưu trữ nội dung</h2>
<p>snaptik không lưu video, ảnh hay nhạc trên máy chủ của mình. Khi bạn bấm tải, máy chủ lấy file từ máy chủ của TikTok và chuyển thẳng về trình duyệt của bạn. Nội dung riêng tư, đã bị xoá hoặc bị gỡ trên TikTok thì snaptik cũng không tải được.</p>
<p>Nếu bạn là chủ một nội dung và không muốn người khác tải về, hãy để bài ở chế độ riêng tư, tắt quyền tải xuống, hoặc báo cáo vi phạm bản quyền trực tiếp với TikTok. Khi bài bị gỡ khỏi TikTok, snaptik không còn tải được bài đó nữa.</p>

<h2>Không bảo đảm</h2>
<p>snaptik dựa vào trang công khai của TikTok, nên có lúc không chạy được khi TikTok đổi cách hoạt động hoặc chặn máy chủ. Trang được cung cấp nguyên trạng, không bảo đảm luôn hoạt động hay phù hợp với một mục đích cụ thể.</p>

<h2>Dùng đúng mức</h2>
<p>Không dùng chương trình tự động gọi trang liên tục. Máy chủ có giới hạn số lần tìm mỗi phút để ai cũng dùng được.</p>
`,
  },
  baoMat: {
    title: "Chính sách bảo mật | snaptik",
    description: "snaptik không cần tài khoản, không lưu video, không theo dõi người dùng. Lịch sử tìm chỉ nằm trên máy bạn.",
    noiDung: `
<h1>Chính sách bảo mật</h1>
<p class="nho">Cập nhật ngày 16/10/2026.</p>

<h2>Ngắn gọn</h2>
<p>snaptik không cần tài khoản, không đặt cookie theo dõi, không có quảng cáo hay công cụ đo lượt truy cập, và không lưu video bạn tải.</p>

<h2>Máy chủ nhận gì</h2>
<ul>
  <li><b>Link bạn dán:</b> máy chủ dùng link để mở trang TikTok tương ứng rồi trả kết quả cho bạn. Link không được ghi lại.</li>
  <li><b>Thông tin công khai của bài đăng</b> (mô tả, tên tài khoản, link file trên máy chủ TikTok): được giữ tạm 10 phút ở bộ đệm của Cloudflare để lần bấm tải sau khỏi phải đọc lại TikTok, rồi tự xoá.</li>
  <li><b>Địa chỉ IP:</b> chỉ dùng tức thời để giới hạn số lần tìm mỗi phút, snaptik không lưu.</li>
  <li>snaptik chạy trên Cloudflare. Cloudflare có thể ghi nhật ký kỹ thuật (giờ truy cập, IP) theo chính sách riêng của họ để vận hành và chống tấn công.</li>
</ul>

<h2>Trên máy của bạn</h2>
<ul>
  <li><b>Lịch sử tìm</b> (tối đa 20 bài gần nhất: id bài, tên tài khoản, ảnh bìa, đoạn mô tả) lưu trong bộ nhớ của trình duyệt trên máy bạn, không gửi đi đâu. Bấm <b>Xoá lịch sử</b> trên trang chủ để xoá.</li>
  <li>Khi cài snaptik lên màn hình chính, trình duyệt giữ bản sao các trang để mở nhanh hơn.</li>
  <li><b>Ngôn ngữ bạn chọn</b> bằng nút chọn ngôn ngữ cũng lưu trong trình duyệt, để lần sau mở đúng tiếng. Chưa chọn thì trang theo ngôn ngữ của máy.</li>
</ul>

<h2>Ảnh từ TikTok</h2>
<p>Ảnh bìa, ảnh đại diện và ảnh xem trước được trình duyệt của bạn tải thẳng từ máy chủ của TikTok. snaptik tắt việc gửi địa chỉ trang (referrer) khi tải những ảnh này.</p>
`,
  },
  loi404: {
    title: "Không có trang này | snaptik",
    h1: "Không có trang này",
    p: "Mèo lục khắp nơi rồi mà không thấy trang này, nên lăn ra ngủ luôn. Quay về <a href=\"{goc}\">trang chủ</a> để tải video TikTok nhé.",
  },
  /* chữ app.js dùng lúc chạy; {n}, {i}, {phan} được thay bằng số */
  chay: {
    chuaDan: "Dán link TikTok vào ô trước đã nhé.",
    khongPhaiLink: "Đây không phải link TikTok. Link đúng có dạng https://www.tiktok.com/@ten/video/… hoặc https://vt.tiktok.com/…",
    mayChuBan: "Máy chủ đang bận, thử lại sau ít phút.",
    khongLayDuoc: "Không lấy được bài này.",
    khongKetNoi: "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.",
    dangTim: "Mèo đang tìm…",
    tai: "Tải về",
    dan: "Dán",
    xoa: "Xoá",
    boNhoTrong: "Bộ nhớ tạm đang trống. Sao chép link TikTok trước đã nhé.",
    khongDocBoNho: "Trình duyệt không cho đọc bộ nhớ tạm: nhấn giữ vào ô rồi chọn Dán.",
    anhBia: "Ảnh bìa bài đăng",
    xemTruoc: "Xem trước video",
    soAnh: "{n} ảnh",
    nguoiDung: "Người dùng TikTok",
    khongMoTa: "(không có mô tả)",
    chepMoTa: "Sao chép mô tả",
    daChep: "Đã chép",
    khongChep: "Không chép được",
    luotXem: "lượt xem",
    thich: "thích",
    binhLuan: "bình luận",
    chiaSe: "chia sẻ",
    taiVideo: "Tải video không logo",
    taiHd: "Tải video HD",
    taiNhac: "Tải nhạc {dinhDang}",
    taiCaAnh: "Tải cả {n} ảnh",
    tepZip: "file .zip",
    ghepVideo: "Ghép ảnh thành video",
    coNhac: "có nhạc",
    khongNhac: "không nhạc",
    anhThu: "Ảnh {i}",
    taiBia: "Tải ảnh bìa",
    taiAnhDaiDien: "Tải ảnh đại diện",
    taiBaiKhac: "← Tải bài khác",
    dangTaiAnh: "Đang tải ảnh {i}/{n}…",
    xongZip: "Xong, file ZIP đã tải về.",
    loiTaiAnh: "Tải ảnh bị lỗi, thử lại nhé.",
    chuaGhepDuoc: "Trình duyệt này chưa ghép video được, thử Chrome hoặc Safari bản mới.",
    dangTaiNhac: "Đang tải nhạc…",
    dangGhep: "Đang ghép video… {phan}% (giữ trang này mở)",
    xongMp4: "Xong, video MP4 đã tải về.",
    xongWebm: "Xong, video đã tải về dạng WebM (trình duyệt này chưa ghi được MP4).",
    loiGhep: "Ghép video bị lỗi, thử lại nhé.",
    daTimGanDay: "Đã tìm gần đây",
    xoaLichSu: "Xoá lịch sử",
    baiAnh: "Bài ảnh",
    video: "Video",
    lichSuNho: "Lịch sử chỉ lưu trên trình duyệt này, máy chủ không giữ.",
  },
  /* câu báo lỗi worker.js trả về (sinh ra loi-dich.js); {ma} là mã lỗi TikTok */
  loi: {
    khongCoLink: "Chưa thấy link TikTok. Link có dạng https://www.tiktok.com/@ten/video/123… hoặc https://vt.tiktok.com/abc…",
    douyin: "Trang chỉ tải được TikTok, chưa tải được Douyin.",
    trangCaNhan: "Đây là link trang cá nhân. Hãy mở một video rồi bấm Chia sẻ › Sao chép liên kết.",
    live: "Trang chưa tải được video phát trực tiếp (live).",
    khongPhaiBai: "Link này không phải link video hay bài ảnh TikTok.",
    khongDocDuoc: "Không đọc được trang TikTok (TikTok có thể đang chặn máy chủ hoặc vừa đổi trang). Thử lại sau ít phút.",
    khongXemDuoc: "TikTok báo không xem được bài này (mã {ma}): bài để riêng tư, đã bị xoá, hoặc bị chặn ở khu vực.",
    biChan: "TikTok đang tạm chặn máy chủ của trang (nghi là máy tự động). Đợi vài phút rồi thử lại nhé.",
    linkNganHong: "Link rút gọn này không mở ra video nào (link sai hoặc bài đã bị xoá).",
    quaNhanh: "Bạn tìm hơi nhanh, chờ một phút rồi thử lại nhé.",
    chiGet: "Chỉ nhận GET.",
    yeuCauSai: "Yêu cầu tải không hợp lệ.",
    khongCoBan: "Bài này không có bản tải đó.",
    khongTraFile: "Máy chủ TikTok không trả file lúc này. Thử lại sau ít phút.",
    khongNhung: "Không nhúng từ trang khác.",
    mayChuLoi: "Máy chủ lỗi, thử lại sau.",
    khongCo: "Không có.",
  },
};

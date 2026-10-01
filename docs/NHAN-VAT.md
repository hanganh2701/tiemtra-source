# Bible nhân vật: Hẻm 42

Tài liệu gốc để viết mọi câu thoại. Viết cảnh mới phải khớp giọng nói và cung truyện ở đây.

## Bối cảnh

- **Nơi chốn:** Hẻm 42, một con hẻm ở Sài Gòn còn nếp làng xóm. Tiệm trà của người chơi nằm dưới căn gác của bà Sáu, chỗ ngày xưa bà bán quán nước.
- **Người chơi:** bỏ việc văn phòng để mở tiệm. Người khác gọi người chơi là `{ban}` (anh hoặc chị, người chơi chọn khi đặt tên tiệm). Tên tiệm là `{shop}`.
- **Động lực:** chứng minh với gia đình và với chính mình rằng một giấc mơ nhỏ vẫn đủ trả tiền nhà.
- **Mục tiêu dài hạn:** ghép lại *Sổ công thức của bà Sáu*, 12 trang bị xé rải khắp xóm. Mỗi nhân vật đi hết câu chuyện trả lại một trang. Đủ 12 trang thì có món "Trà của bà Sáu".
- **Giọng chung:** ấm, ngắn, giọng Nam nhẹ ("nè", "hông", "nghen") nhưng không lạm dụng, không chế giễu phương ngữ.

## Luật viết

- Tối đa 6 câu mỗi cảnh, mỗi câu khoảng 60 ký tự để vừa màn hình điện thoại. Chương 0 tối đa 3 câu.
- Cảnh chỉ diễn ra trước giờ mở cửa (`mo_cua`) hoặc sau giờ đóng cửa (`dong_cua`). Giữa giờ bán chỉ được một bong bóng thoại.
- Mỗi cảnh có một tranh ở đầu thẻ (bản 5.6, `src/tranh-canh.js`): bối cảnh, giờ (mở cửa là sáng, đóng cửa là tối), mưa, Trung Thu, Tết, và mặt những người đang nói. Cảnh mới không diễn ra ở quầy thì ghi bối cảnh trong `data/tranh-canh.js` (hẻm, căn gác, chợ, quê, bến xe, đầu hẻm, cổng trường); cảnh toàn tin nhắn tự thành điện thoại.
- Truyện làm dịu áp lực tiền bạc, không bao giờ doạ người chơi. Ngày tệ thì có cảnh tử tế.
- Lựa chọn nhỏ đặt cờ rồi quay về mạch chính. Lựa chọn nào cũng phải được nhắc lại ít nhất một lần về sau (câu thoại có điều kiện hoặc hậu truyện).
- Ngã rẽ lớn (`reRe`) mới được tách nhánh thật: hai điều tốt đánh đổi nhau, không có phương án "sai". Mỗi nhánh 3–5 cảnh riêng, đổi cả cách chơi, rồi hợp lại ở cảnh chốt cuối chương. Mỗi nhân vật chỉ có một ngã rẽ đang mở. Cảnh chốt có hạn chót (`chot`) để truyện không kẹt.
- Kết truyện: ngày mùng năm hẻm mở hàng lại (cảnh `c3_ket`, sau đoạn về quê hay ở lại ăn Tết), tên kết theo các ngã rẽ lớn, rồi mỗi nhân vật một thẻ hậu truyện (`HAU_TRUYEN`). Không có kết xấu. Trước bản 5.3 cảnh kết là đêm giao thừa nên tới sau mùng một; đừng viết lại cảnh giao thừa sau đoạn Tết.
- Tết ngoài đời trùng đoạn Tết của truyện (ngày 55 tới cảnh mở hàng mùng năm) thì cảnh lễ Tết (`le_tet`, `le_ong_tao`) không chen vào (`ngoaiTetTruyen`).
- Nhân vật có đời sống riêng không xoay quanh người chơi. Có chuyện người chơi không giải quyết được.
- Không dùng tên thương hiệu thật cho tiệm, chuỗi, nhãn hàng trong truyện. Chuỗi đối thủ là tên hư cấu. Riêng món mua sắm trong tab Đời sống (xe, điện thoại, máy tính, đồng hồ, túi, quần áo, điện máy làm quà) ghi tên hãng và mẫu thật dạng chữ để giá sát ngoài đời (chủ dự án chốt 29/09/2026), không vẽ logo, không ai trong truyện quảng cáo cho hãng; khu vực nhà là tên gọi quen, không nêu dự án thật.

## Nhân vật

Cột "Mặt" là hàng trong `img/faces.webp` (mỗi hàng 3 biểu cảm: bình thường, vui, bực).

| Nhân vật | Mặt | Vai trò | Bắt đầu | Kết thúc | Nối vào cơ chế |
|---|---|---|---|---|---|
| **Mướp** (mèo) | `img/cathead.png` | Mèo của bà Sáu | Nằm chình ình trên quầy | Mèo của tiệm | Ngồi cạnh nhân vật có chuyện hôm nay |
| **Bà Sáu** | 6 | Chủ nhà, 70 tuổi | Người thu tiền nhà khó tính | Trao sổ công thức, kể vì sao quán nước đóng cửa | Tiền nhà, cho khất một lần mỗi chương |
| **Chú Tư** | 2 | Chạy xe ôm ở đầu hẻm | Càm ràm app gọi xe | Học dùng app, thành người giao hàng tin cậy | Đơn online |
| **Linh** | 7 | Học sinh lớp 12 | Căng thẳng ôn thi | Thi xong, đi làm thêm ở tiệm | Mùa thi, nhân viên |
| **Khoa** | 4 | Shipper, 20 tuổi | Chạy đơn giữa nắng mưa | Bạn thân; tiệm có góc trà đá cho shipper | Ngày mưa, đơn app |
| **Cô Hạnh** | 3 | Bán bánh mì bên kia hẻm | Đối thủ, dòm ngó | Bạn làm ăn, combo bánh mì + trà | Sự kiện đối thủ |
| **Mẹ** | tin nhắn; `img/me.svg` khi lên thăm | Mẹ của người chơi, ở quê | "Nghỉ việc thiệt hả con?" | Lên thăm dịp Tết; hoá ra viết đánh giá 5 sao ẩn danh | Đánh giá, cuối ngày, tiền gửi về quê |
| **Hana** | hàng 2 `img/star.webp` | Vlogger nước ngoài, khách quen từ ngày 34 | Nói qua nhãn [Dịch tự động] | Nhãn dịch rụng dần khi cô học tiếng Việt; video làm tiệm nổi | Khách quen, tip |
| **Vy** | 0 | Quản lý chuỗi Mây Tea đầu hẻm, cháu cô Hạnh | Bị công ty bắt mở cạnh tiệm | Trả lại trang 8, nhớ quán nước bà Sáu | Phố Trà |

## Giọng từng người

- **Bà Sáu:** xưng "bà", gọi người chơi là "con". Câu ngắn, nói ngược để thương ("Trễ một bữa bà hông la… trễ hai bữa thì la."). Không bao giờ nói thẳng là mình quý ai.
- **Chú Tư:** xưng "chú", gọi "{ban}" hoặc "con". Hay càm ràm công nghệ, nhưng tốt bụng. Món quen là trà sữa ít ngọt, ghét ngọt; trà đá miễn phí của tiệm thì uống hoài.
- **Linh:** xưng "em", gọi "{ban}". Lễ phép, hay lo, nói nhanh rồi tự trấn an. Gọi món "trà đào ít đá như cũ".
- **Khoa:** xưng "em", gọi "{ban}". Luôn vội, nói tắt, hay đùa để giấu mệt. Nhắc tiền xăng, nắng, mưa.
- **Cô Hạnh:** xưng "cô" với người chơi, gọi "{ban}" hoặc "con". Sắc sảo, soi giá, khen kiểu chê ("Ly cũng được… mà hơi mắc.").
- **Mẹ:** chỉ qua tin nhắn. Nhắn ngắn, nhiều dấu chấm, lo ăn uống. Không bao giờ nói "mẹ tự hào về con" cho tới cuối Chương 3.
- **Ba:** không nhắn tin, không có chân dung. Chỉ hiện qua lời mẹ, tấm hình mẹ gửi, hay lúc người chơi về quê. Hậu truyện có một dòng về ba, viết như lời mẹ kể và hiện biểu tượng tin nhắn (bản 5.3). Ít nói, cứng đầu, thương con bằng việc làm ("Ba giành xách cái giỏ nặng nhất"). Mẹ hay giấu ba chuyện tiền nong.
- **Vy:** xưng "em", gọi "{ban}". Lễ phép, khó xử giữa công ty và xóm cũ. Hay xin lỗi.
- **Hana:** câu có nhãn [dịch tự động] thì hơi cứng ("Loại trái cây đam mê"). Khi tự nói tiếng Việt thì sai dễ thương ("Chanh… dây! Đúng hông?"). Sau `hana_3` bong bóng gọi món ở quầy bỏ nhãn dịch; sau Tết Hana nhắn tin tiếng Việt ngắn.

## Cung truyện theo chương

| Chương | Ngày trong game | Nội dung | Trang sổ |
|---|---|---|---|
| 0 · Khai trương | 1–6 | Làm quen bà Sáu, Mướp, chú Tư, Khoa, cô Hạnh, tin nhắn của mẹ; ngày 6 đóng tiền nhà lần đầu | 1 |
| 1 · Người trong hẻm | 6–30 | Thanh thân thiết, mỗi khách quen 3 cảnh; ngày mưa của Khoa; mùa thi của Linh quanh ngày 20 (ngã rẽ: ở lại làm thêm hay đi học Đà Lạt); lựa chọn vay ngân hàng hay phong bì của mẹ | 2–5 |
| 2 · Mùa trăng | 30–60 | Trung Thu; Hana ghé 3 lần (ngã rẽ: ghi tên tiệm lên video hay giữ kín); ngã rẽ chính: bắt tay Mây Tea hay giữ hẻm cùng xóm; chuỗi Mây Tea mở đầu hẻm (quản lý là Vy, cháu cô Hạnh, không phải phản diện); bà Sáu kể chuyện cũ; Vy kể về mấy chỗ sang nhượng (mở chi nhánh, chú Tư nhận chở hàng) | 6–10 |
| 3 · Về nhà ăn Tết (ngã rẽ: về quê hay ở lại) | 60–67 | Chợ giáp Tết lên giá; thành phố vắng, mở cửa cho người ở lại như Khoa; về quê hay mẹ lên thăm; mùng năm mở hàng lại, đủ 12 trang | 11–12 |
| Sau Tết (bản 5.3) | 68–190 | Mỗi tuần một cảnh nhãn "Sau Tết", tính từ ngày mở hàng: bà Sáu hỏi để cuốn sổ ở đâu, xe của Khoa, Linh năm nhất (đứng quầy, chờ được gọi hay ở Đà Lạt), cô Hạnh mở xe bánh mì thứ hai, Vy lên quản lý vùng hay xe trà ở chợ, Hana nhắn tin, chú Tư chở khách sân bay, mẹ kể ba ra đồng lại, Mướp tha quà, khách quán nước xưa dắt cháu tới, Linh về hè, Khoa chở dừa Bến Tre, đường hẻm láng lại, mưa đầu mùa, tiệm tròn nửa năm | – |

**Chuyện nhà ở quê (bản 5.2, xuyên Chương 2–3 và sau kết):** ba trặc lưng lúc gặt lúa (từ ngày 36, khi két có chút tiền). Mẹ nhắn, dặn con đừng lo, đừng gửi. Người chơi chọn gửi mỗi tháng hay để tính sau. Có gửi hay không ba vẫn khoẻ lại: có gửi thì ba đi châm cứu, không gửi thì chú Năm bên nhà gặt giùm. Truyện không bao giờ trách người chơi không gửi, tháng nào két không dư thì mẹ nhắn "kẹt thì thôi". Gửi đủ ba tháng thì quê gửi lên thùng xoài, hũ mắm; khi con mua nhà, mẹ gửi lại một nửa số tiền đã lén để dành ở bưu điện xã.

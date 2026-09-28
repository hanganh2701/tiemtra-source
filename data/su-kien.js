/* Sự kiện trong ngày, quà bất ngờ, sự cố mất tiền. Nạp trước game.js. Các hàm need() chỉ chạy lúc chơi nên được dùng S, rating, upgCount của game.js. */
const EVS = {
  hot: {
    n: "Trời nóng",
    d: "Khách đông hơn 30%, nhiều người gọi thêm đá",
    ic: "upsnow",
    mul: 1.3,
  },
  rain: {
    n: "Trời mưa",
    d: "Khách tại quán ít hơn 30%, đơn online nhiều hơn",
    ic: "warn",
    mul: 0.7,
  },
  weekend: {
    n: "Cuối tuần",
    d: "Khách đông hơn 25%, nhiều người mua 2 ly",
    ic: "calendar",
    mul: 1.25,
  },
  students: {
    n: "Học sinh tan học",
    d: "Giữa ngày có một nhóm học sinh ghé cùng lúc",
    ic: "people",
    mul: 1,
  },
  reviewer: {
    n: "Food reviewer ghé quán",
    d: "Một khách đặc biệt: pha đúng được 3 đánh giá tốt, pha sai hoặc để chờ lâu bị 3 đánh giá xấu",
    ic: "star",
    mul: 1,
  },
  trend: {
    n: "Món hot trên mạng",
    d: "% được gọi nhiều gấp đôi, nhớ nấu thêm",
    ic: "chartup",
    mul: 1.1,
  },
  sale: {
    n: "Nhà cung cấp giảm giá",
    d: "Nhập % rẻ hơn 30% trong hôm nay",
    ic: "price",
    mul: 1,
  },
  holiday: {
    n: "Ngày lễ",
    d: "Khách đông gấp đôi, tip gấp đôi",
    ic: "gift",
    mul: 2,
  },
};
const GIFTS = [
  {
    n: "Lì xì từ mạnh thường quân",
    d: "Một vị khách quen thích quán nên gửi tặng",
    min: 50000,
    max: 200000,
  },
  {
    n: "Trả lại ví cho khách",
    d: "Bạn nhặt được ví khách để quên và trả lại, khách gửi tiền cảm ơn",
    min: 50000,
    max: 150000,
  },
  {
    n: "Giải quán đẹp khu phố",
    d: "Quán được bình chọn là quán dễ thương nhất khu",
    min: 200000,
    max: 300000,
    need: () => upgCount() >= 2,
  },
  {
    n: "Nhãn hàng trà tài trợ",
    d: "Quán được đánh giá cao nên được nhãn hàng tài trợ",
    min: 400000,
    max: 600000,
    need: () => S.reviews.length >= 20 && rating() >= 4.5,
  },
  {
    n: "Bán ve chai, thùng carton",
    d: "Dọn kho bán được ít tiền",
    min: 20000,
    max: 60000,
  },
  {
    k: "bung",
    n: "Công an trả tiền khách bùng",
    d: "Công an phường bắt được nhóm khách ôm ly bỏ chạy hôm trước, trả lại tiền cho quán",
    min: 50000,
    max: 200000,
    need: () => (S.bungN || 0) > 0,
  },
  {
    n: "Vé số trúng giải",
    d: "Một khách trả tiền trà sữa bằng tờ vé số, ai ngờ trúng giải",
    min: 100000,
    max: 500000,
  },
  {
    n: "Nhà cung cấp hoàn tiền",
    d: "Lô nguyên liệu tuần trước giao thiếu, nhà cung cấp gửi trả lại tiền",
    min: 50000,
    max: 250000,
  },
  {
    n: "Quán được bình chọn",
    d: "Quán được bình chọn trên mạng là quán trà sữa được yêu thích, nhận tiền thưởng",
    min: 200000,
    max: 500000,
    need: () => S.reviews.length >= 50 && rating() >= 4.3,
  },
  {
    n: "Cọc tiệc công ty",
    d: "Một công ty gần đây đặt trà sữa cho tiệc cuối tháng, gửi trước tiền cọc",
    min: 150000,
    max: 400000,
    need: () => S.day >= 15,
  },
];

/* sự cố mất tiền: gian lận thì mất gần hết; người chơi thật 0–2 lần trong 90 ngày, mất dưới 1 triệu */
const BAD = [
  {
    id: "trom",
    n: "Trộm ghé quán!",
    ic: "sad",
    all: "Đêm qua trộm cạy két, lấy sạch tiền.",
    some: "Đêm qua trộm cạy két, lấy mất %.",
  },
  {
    id: "thue",
    n: "Rắc rối về thuế",
    ic: "receipt",
    all: "Cơ quan thuế phát hiện doanh thu không khớp sổ sách. Chủ quán trốn thuế, tài sản bị tịch thu.",
    some: "Nộp thuế chậm, quán bị phạt %.",
  },
  {
    id: "qltt",
    n: "Quản lý thị trường kiểm tra",
    ic: "warn",
    all: "Tiền mặt trong két quá lớn mà không chứng minh được nguồn gốc, bị tạm giữ toàn bộ.",
    some: "Đoàn kiểm tra nhắc lỗi vệ sinh quầy pha, quán bị phạt %.",
  },
  {
    id: "lua",
    n: "Bị lừa qua điện thoại",
    ic: "phone",
    all: "Kẻ gian giả danh ngân hàng gọi tới, chủ quán lỡ chuyển hết tiền trong két.",
    some: "Kẻ gian giả danh ngân hàng gọi tới, chủ quán lỡ chuyển %.",
  },
  {
    id: "coin",
    n: '"Đầu tư" tiền ảo',
    ic: "chartdown",
    all: "Chủ quán dồn hết tiền vào một sàn tiền ảo lạ. Sàn sập, mất trắng.",
    some: 'Chủ quán thử "đầu tư" tiền ảo trên một sàn lạ, lỗ %.',
  },
];

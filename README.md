# Metruyencv Chapter Reader

Chrome extension giúp đọc to chương truyện trên `metruyencv.com`, tự làm sạch ký tự đặc biệt và chuyển sang chương kế tiếp khi hoàn tất.

## Tính năng
- Đọc nội dung trong `#chapter-content` bằng Web Speech API.
- Highlight trực tiếp câu đang đọc ngay trên trang và auto-scroll theo.
- Cho phép chọn giọng, tốc độ, cao độ và bật/tắt làm sạch ký tự.
- Theo dõi trạng thái đọc, tạm dừng/tiếp tục/dừng ngay từ popup.
- Tự động chuyển sang chương kế tiếp (dựa trên `window.chapterData`) và tiếp tục đọc.

## Cài đặt
1. Chạy `npm install` để chuẩn bị môi trường (không bắt buộc cho extension nhưng giúp quản lý dự án).
2. Vào Chrome → `chrome://extensions`.
3. Bật **Developer mode**.
4. Bấm **Load unpacked** và trỏ đến thư mục `extension`.

## Sử dụng
1. Mở chương truyện trên `https://metruyencv.com/truyen/.../chuong-x`.
2. Nhấn biểu tượng extension “Metruyencv Reader”.
3. Chọn giọng đọc (ưu tiên giọng `vi-VN` nếu có), điều chỉnh tốc độ/cao độ, bật “Tự chuyển chương” nếu muốn.
4. Bấm **Bắt đầu** để extension đọc toàn bộ chương.
5. Dùng các nút **Tạm dừng**, **Tiếp tục**, **Dừng** để điều khiển. Khi bật auto-next, extension sẽ tự chuyển tới chương tiếp theo và đọc tiếp.

> Lưu ý: Web Speech API sử dụng giọng cài đặt trong hệ điều hành. Nếu chưa có giọng Việt, hãy cài thêm hoặc chọn giọng tiếng Anh.
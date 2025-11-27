# Privacy Policy cho Metruyencv Chapter Reader

## Privacy Policy

**Last updated: [Ngày hiện tại]**

### 1. Thông tin thu thập

Metruyencv Chapter Reader ("Extension") **KHÔNG thu thập, lưu trữ, hoặc truyền bất kỳ dữ liệu cá nhân nào** của người dùng.

### 2. Dữ liệu được xử lý

Extension chỉ xử lý dữ liệu **cục bộ trên trình duyệt** của bạn:

- **Nội dung trang web**: Extension đọc nội dung từ trang metruyencv.com để chuyển đổi thành giọng nói. Tất cả xử lý được thực hiện **cục bộ** trên máy tính của bạn.

- **Cài đặt người dùng**: Extension lưu các cài đặt của bạn (giọng đọc, tốc độ, v.v.) **cục bộ** trong trình duyệt bằng Chrome Storage API. Dữ liệu này không được gửi đến bất kỳ server nào.

### 3. Kết nối mạng

Extension chỉ kết nối mạng trong các trường hợp sau:

- **TTS Server Local (tùy chọn)**: Nếu bạn sử dụng TTS server local (localhost:5002), extension sẽ kết nối đến server này trên máy tính của bạn. Kết nối này **không đi qua internet** và chỉ hoạt động trên máy tính của bạn.

- **Tesseract.js Workers**: Extension sử dụng Tesseract.js để OCR text từ canvas. Tesseract.js có thể tải worker files từ CDN (jsdelivr.net) để xử lý OCR. Đây là thư viện mã nguồn mở và không thu thập dữ liệu.

### 4. Quyền truy cập

Extension yêu cầu các quyền sau:

- **activeTab**: Để đọc nội dung trang web hiện tại
- **scripting**: Để inject script vào trang metruyencv.com
- **storage**: Để lưu cài đặt của bạn cục bộ
- **host_permissions**: Chỉ cho phép truy cập metruyencv.com và localhost (cho TTS server)

### 5. Không thu thập dữ liệu

Extension **KHÔNG**:
- Thu thập thông tin cá nhân
- Theo dõi hành vi người dùng
- Gửi dữ liệu đến server bên thứ ba
- Sử dụng analytics hoặc tracking
- Lưu trữ nội dung đọc trên server

### 6. Bảo mật

Tất cả xử lý được thực hiện **cục bộ** trên trình duyệt của bạn. Không có dữ liệu nào được truyền qua mạng (trừ khi bạn sử dụng TTS server local trên máy của bạn).

### 7. Thay đổi Privacy Policy

Nếu có thay đổi về Privacy Policy, chúng tôi sẽ cập nhật extension và thông báo trong changelog.

### 8. Liên hệ

Nếu bạn có câu hỏi về Privacy Policy, vui lòng tạo issue trên GitHub repository của extension.

---

**Tóm tắt**: Extension này hoàn toàn **offline** và **không thu thập dữ liệu**. Tất cả xử lý được thực hiện trên máy tính của bạn.


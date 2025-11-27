# Hướng dẫn sử dụng trên Android

Extension này có thể hoạt động trên Android thông qua các trình duyệt hỗ trợ Chrome Extensions.

## 🌟 Cách 1: Kiwi Browser (Khuyến nghị)

**Kiwi Browser** là trình duyệt Android hỗ trợ đầy đủ Chrome Extensions.

### Bước 1: Cài đặt Kiwi Browser
1. Tải Kiwi Browser từ [Google Play Store](https://play.google.com/store/apps/details?id=com.kiwibrowser.browser) hoặc [APK từ trang chủ](https://kiwibrowser.com/)
2. Mở ứng dụng Kiwi Browser

### Bước 2: Cài đặt Extension
1. Mở menu (3 chấm) → **Extensions**
2. Bật **Developer mode** (góc trên bên phải)
3. Chọn **Load unpacked**
4. Chọn thư mục `extension` từ project này
   - Bạn có thể copy thư mục `extension` vào điện thoại qua USB hoặc cloud storage
   - Hoặc sử dụng file manager để giải nén file ZIP

### Bước 3: Sử dụng
1. Mở trang truyện trên metruyencv.com hoặc tangthuvien.net
2. Tap vào icon extension trên thanh địa chỉ
3. Chọn giọng đọc và bắt đầu đọc

## 🌟 Cách 2: Yandex Browser

**Yandex Browser** cũng hỗ trợ Chrome Extensions trên Android.

1. Tải Yandex Browser từ [Google Play Store](https://play.google.com/store/apps/details?id=com.yandex.browser)
2. Mở menu → **Extensions**
3. Bật Developer mode và load extension như trên

## ⚠️ Lưu ý quan trọng

### Web Speech API (Browser TTS)
- ✅ Hoạt động tốt trên Android
- ✅ Không cần cấu hình thêm
- ⚠️ Chất lượng giọng đọc phụ thuộc vào giọng mặc định của Android

### Coqui TTS Server (Local Server)
- ⚠️ **Không khả dụng** trên Android vì cần chạy server local
- 💡 **Giải pháp thay thế**: Sử dụng Web Speech API hoặc kết nối đến TTS server từ máy tính khác trong cùng mạng

### Kết nối TTS Server từ máy khác

Nếu bạn có TTS server chạy trên máy tính trong cùng mạng WiFi:

1. Tìm địa chỉ IP của máy tính:
   - Windows: `ipconfig` trong Command Prompt
   - Linux/Mac: `ifconfig` hoặc `ip addr`
   - Ví dụ: `192.168.1.100`

2. Trong extension, thay đổi Coqui URL từ `http://localhost:5002` thành:
   ```
   http://192.168.1.100:5002
   ```

3. Đảm bảo firewall trên máy tính cho phép kết nối từ mạng local

## 📱 Tối ưu cho Mobile

Extension đã được thiết kế để hoạt động tốt trên mobile:
- ✅ Popup responsive, tự động điều chỉnh kích thước
- ✅ Touch-friendly controls
- ✅ Tự động scroll đến câu đang đọc
- ✅ Highlight câu đang đọc

## 🔧 Troubleshooting

### Extension không hiển thị
- Kiểm tra xem đã bật Developer mode chưa
- Đảm bảo đang ở đúng trang (metruyencv.com hoặc tangthuvien.net)
- Thử reload trang

### Không có giọng đọc tiếng Việt
- Android có thể không có giọng đọc tiếng Việt mặc định
- Cài thêm giọng đọc từ Google Text-to-Speech trong Settings → Language & Input → Text-to-Speech

### TTS Server không kết nối được
- Kiểm tra địa chỉ IP có đúng không
- Đảm bảo cả điện thoại và máy tính cùng mạng WiFi
- Kiểm tra firewall trên máy tính
- Thử ping từ điện thoại: `ping 192.168.1.100` (thay bằng IP của bạn)

## 📝 Alternative: Progressive Web App (PWA)

Nếu muốn trải nghiệm tốt hơn, có thể phát triển thành PWA:
- Cài đặt như ứng dụng native
- Hoạt động offline
- Tích hợp sâu hơn với hệ thống Android

(Tính năng này đang trong roadmap)

## 🆘 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console log trong Kiwi Browser (Menu → More tools → Developer tools)
2. Tạo issue trên GitHub với thông tin:
   - Model điện thoại
   - Android version
   - Kiwi Browser version
   - Lỗi cụ thể


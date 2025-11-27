# Metruyencv Chapter Reader

Extension Chrome/Edge để đọc to nội dung chương truyện trên metruyencv.com với tính năng text-to-speech.

## ✨ Tính năng

- 🎤 Đọc to nội dung chương truyện với giọng đọc tự nhiên
- 🌏 Hỗ trợ nhiều giọng đọc (tiếng Việt, tiếng Anh)
- ⏭️ Tự động chuyển sang chương kế tiếp khi đọc xong
- 🎚️ Điều chỉnh tốc độ và cao độ giọng đọc
- 🔍 Hỗ trợ OCR để đọc text từ canvas elements
- ✨ Highlight câu đang được đọc

## 🚀 Cài đặt

### Từ Chrome Web Store / Edge Add-ons
(Coming soon - đang trong quá trình publish)

### Cài đặt thủ công (Developer mode)

1. Clone repository:
   ```bash
   git clone https://github.com/your-username/read-text-in-web.git
   cd read-text-in-web
   ```

2. Load extension vào Chrome/Edge:
   - Chrome: Mở `chrome://extensions/` → Bật "Developer mode" → "Load unpacked" → Chọn thư mục `extension`
   - Edge: Mở `edge://extensions/` → Bật "Developer mode" → "Load unpacked" → Chọn thư mục `extension`

## 📖 Cách sử dụng

1. Mở trang chương truyện trên [metruyencv.com](https://metruyencv.com) hoặc [tangthuvien.net](https://tangthuvien.net)
2. Click vào icon extension trên thanh công cụ
3. Chọn giọng đọc và tốc độ
4. Nhấn "Bắt đầu" để bắt đầu đọc

## 📱 Sử dụng trên Android

### Option 1: PWA (Khuyến nghị) ⭐

PWA có thể cài đặt như app native trên Android, không cần trình duyệt đặc biệt!

📖 Xem hướng dẫn: [pwa/PWA_GUIDE.md](./pwa/PWA_GUIDE.md)

**Ưu điểm:**
- ✅ Cài đặt như app native
- ✅ Hoạt động trên mọi trình duyệt (Chrome, Firefox, Safari)
- ✅ UI tối ưu cho mobile
- ✅ Hoạt động offline

**Cách cài:**
1. Host PWA lên GitHub Pages/Netlify/Vercel
2. Mở PWA trong trình duyệt
3. Menu → "Add to Home screen"
4. Cài đặt bookmarklet để sử dụng

### Option 2: Chrome Extension (Kiwi Browser)

Extension có thể hoạt động trên Android thông qua **Kiwi Browser** hoặc **Yandex Browser**.

📖 Xem hướng dẫn chi tiết: [ANDROID_GUIDE.md](./ANDROID_GUIDE.md)

**Tóm tắt:**
1. Cài đặt [Kiwi Browser](https://play.google.com/store/apps/details?id=com.kiwibrowser.browser) từ Play Store
2. Mở menu → Extensions → Bật Developer mode
3. Load extension từ thư mục `extension`
4. Sử dụng như trên desktop

⚠️ **Lưu ý:** Coqui TTS Server (local) không hoạt động trên Android. Sử dụng Web Speech API hoặc kết nối đến TTS server từ máy tính khác trong cùng mạng WiFi.

### TTS Server (Tùy chọn)

Để có chất lượng giọng đọc tốt hơn, bạn có thể chạy TTS server local:

```bash
docker-compose up
```

Sau đó chọn "Google TTS (Local Server)" trong extension.

## 🛠️ Development

### Build package để publish

**Windows:**
```bash
build-package.bat
```

**Linux/Mac:**
```bash
chmod +x build-package.sh
./build-package.sh
```

Package sẽ được tạo với tên `metruyencv-reader-v{version}.zip`

### Cấu trúc thư mục

```
extension/
├── manifest.json          # Extension manifest
├── contentScript.js       # Content script chính
├── popup.html             # UI popup
├── popup.js               # Logic popup
├── popup.css              # Styles popup
├── tesseract.min.js       # OCR library
└── icons/                 # Extension icons (cần tạo)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 📋 Publish lên Store

Xem file [PUBLISH_GUIDE.md](./PUBLISH_GUIDE.md) để biết hướng dẫn chi tiết.

Tóm tắt:
1. Tạo icons (xem [CREATE_ICONS.md](./CREATE_ICONS.md))
2. Tạo screenshots
3. Chuẩn bị Privacy Policy (xem [PRIVACY_POLICY.md](./PRIVACY_POLICY.md))
4. Build package
5. Upload lên Chrome Web Store / Edge Add-ons

## 🔒 Privacy

Extension **KHÔNG thu thập bất kỳ dữ liệu nào**. Tất cả xử lý được thực hiện cục bộ trên trình duyệt của bạn.

Xem [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) để biết chi tiết.

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub repository.

# Metruyencv Chapter Reader

Chrome extension giúp đọc to chương truyện trên `metruyencv.com`, tự làm sạch ký tự đặc biệt và chuyển sang chương kế tiếp khi hoàn tất.

## Tính năng
- **Hỗ trợ 2 TTS Engine:**
  - **Browser (Web Speech API):** Sử dụng giọng đọc có sẵn trong trình duyệt/hệ điều hành.
  - **Google TTS (Local Server):** Giọng tiếng Việt chất lượng cao từ Google chạy qua Docker.
- Đọc nội dung trong `#chapter-content`.
- Highlight trực tiếp câu đang đọc ngay trên trang và auto-scroll theo.
- Cho phép chọn giọng, tốc độ, cao độ (Browser TTS) và bật/tắt làm sạch ký tự.
- Theo dõi trạng thái đọc, tạm dừng/tiếp tục/dừng ngay từ popup.
- Tự động chuyển sang chương kế tiếp (bật mặc định, dựa trên `window.chapterData`) và tiếp tục đọc.

## Cài đặt

### 1. Chạy TTS Server (Docker)
```bash
# Clone repo và vào thư mục
cd read-text-in-web

# Chạy TTS server (Google TTS - tiếng Việt)
docker compose up -d edge-tts

# Kiểm tra server
curl "http://localhost:5002/api/tts?text=xin+chao" --output test.mp3
```

### 2. Cài Extension
1. Vào Chrome → `chrome://extensions`.
2. Bật **Developer mode**.
3. Bấm **Load unpacked** và trỏ đến thư mục `extension`.

## Sử dụng
1. Mở chương truyện trên `https://metruyencv.com/truyen/.../chuong-x`.
2. Nhấn biểu tượng extension "Metruyencv Reader".
3. **Chọn TTS Engine:**
   - **Browser:** Chọn giọng đọc (ưu tiên giọng `vi-VN` nếu có), điều chỉnh tốc độ/cao độ.
   - **Coqui TTS:** Nhập URL server (mặc định `http://localhost:5002`), nhấn "Kiểm tra" để đảm bảo server đang chạy.
4. Bật "Tự chuyển chương" nếu muốn.
5. Bấm **Bắt đầu** để extension đọc toàn bộ chương.
6. Dùng các nút **Tạm dừng**, **Tiếp tục**, **Dừng** để điều khiển.

## TTS Server

### Google TTS (Khuyên dùng)
Dự án sử dụng **gTTS** - Google Text-to-Speech với giọng tiếng Việt chất lượng cao.

```bash
# Khởi động server
docker compose up -d edge-tts

# Kiểm tra health
curl http://localhost:5002/health
# {"engine":"gtts","status":"ok"}

# Test tiếng Việt
curl "http://localhost:5002/api/tts?text=Xin+chào+bạn" --output test.mp3

# Dừng server
docker compose down
```

**API Endpoints:**
- `GET /api/tts?text=...` - Tạo audio từ text
- `GET /api/voices` - Danh sách voices
- `GET /health` - Kiểm tra server

### Coqui TTS (Alternative)
Nếu muốn dùng Coqui TTS offline:

```bash
# Chạy với profile coqui
docker compose --profile coqui up -d coqui-tts

# Server chạy trên port 5003
curl "http://localhost:5003/api/tts?text=hello" --output test.wav
```

## Lưu ý
- **Browser TTS:** Sử dụng giọng cài đặt trong hệ điều hành. Nếu chưa có giọng Việt, hãy cài thêm.
- **Google TTS:** Cần internet để hoạt động. Giọng tiếng Việt tự nhiên, không cần cấu hình phức tạp.
- **Corporate Proxy:** Server đã được cấu hình bypass SSL verification cho môi trường có proxy.

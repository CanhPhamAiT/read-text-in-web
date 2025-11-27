# Hướng dẫn Publish Extension lên Chrome Web Store / Edge Add-ons

## 📋 Yêu cầu trước khi publish

### 1. Chuẩn bị Icons
Extension cần có các icon với kích thước:
- **16x16** pixels (icon nhỏ)
- **48x48** pixels (icon trung bình)  
- **128x128** pixels (icon lớn - bắt buộc cho store)

Bạn có thể:
- Tạo icons bằng công cụ online: https://www.favicon-generator.org/
- Hoặc sử dụng icon có sẵn và resize

### 2. Chuẩn bị Screenshots
Cần ít nhất 1-5 screenshots để hiển thị trên store:
- Kích thước: 1280x800 hoặc 640x400 pixels
- Format: PNG hoặc JPEG
- Nội dung: Hiển thị extension đang hoạt động

### 3. Tài khoản Developer
- **Chrome Web Store**: Cần đăng ký tài khoản developer ($5 một lần)
  - Truy cập: https://chrome.google.com/webstore/devconsole
  - Đăng ký với Google account và thanh toán $5
  
- **Edge Add-ons**: Miễn phí
  - Truy cập: https://partner.microsoft.com/dashboard/microsoftedge
  - Đăng nhập với Microsoft account

## 📦 Bước 1: Chuẩn bị Extension Package

### Tạo file ZIP

1. **Loại bỏ các file không cần thiết**:
   - Không include: `.git`, `node_modules`, `.DS_Store`, `README.md`, `docker-compose.yml`, etc.
   - Chỉ include các file trong thư mục `extension/`

2. **Tạo ZIP file**:
   ```bash
   # Windows (PowerShell)
   Compress-Archive -Path extension\* -DestinationPath metruyencv-reader-v1.1.0.zip
   
   # Hoặc dùng Git Bash
   cd extension
   zip -r ../metruyencv-reader-v1.1.0.zip .
   ```

3. **Kiểm tra kích thước**:
   - Chrome Web Store: Tối đa 10MB cho file ZIP
   - Edge Add-ons: Tương tự

## 📝 Bước 2: Chuẩn bị Thông tin Store Listing

### Thông tin cần chuẩn bị:

1. **Tên Extension**: "Metruyencv Chapter Reader" (hoặc tên khác)

2. **Mô tả ngắn** (132 ký tự):
   ```
   Đọc to nội dung chương truyện trên metruyencv.com với giọng đọc tự nhiên, tự động chuyển chương kế tiếp.
   ```

3. **Mô tả đầy đủ**:
   ```
   Metruyencv Chapter Reader là extension giúp bạn đọc truyện một cách tiện lợi với tính năng text-to-speech.

   ✨ Tính năng chính:
   - Đọc to nội dung chương truyện với giọng đọc tự nhiên
   - Hỗ trợ nhiều giọng đọc (tiếng Việt, tiếng Anh)
   - Tự động chuyển sang chương kế tiếp khi đọc xong
   - Điều chỉnh tốc độ và cao độ giọng đọc
   - Hỗ trợ OCR để đọc text từ canvas elements
   - Highlight câu đang được đọc

   🎯 Cách sử dụng:
   1. Mở trang chương truyện trên metruyencv.com
   2. Click vào icon extension
   3. Chọn giọng đọc và tốc độ
   4. Nhấn "Bắt đầu" để bắt đầu đọc

   💡 Lưu ý:
   - Extension chỉ hoạt động trên metruyencv.com
   - Có thể sử dụng TTS server local để có chất lượng tốt hơn
   ```

4. **Category**: Productivity hoặc Entertainment

5. **Language**: Vietnamese (vi)

6. **Privacy Policy URL**: (Cần tạo - xem bên dưới)

## 🔒 Bước 3: Tạo Privacy Policy

Extension cần có Privacy Policy URL. Bạn có thể:
- Host trên GitHub Pages (miễn phí)
- Hoặc tạo trang web đơn giản

Xem file `PRIVACY_POLICY.md` để có template.

## 🚀 Bước 4: Upload lên Chrome Web Store

1. **Truy cập Developer Dashboard**:
   - https://chrome.google.com/webstore/devconsole
   - Đăng nhập và thanh toán $5 (nếu chưa)

2. **Tạo Item mới**:
   - Click "New Item"
   - Upload file ZIP đã chuẩn bị

3. **Điền thông tin**:
   - Upload icons (16x16, 48x48, 128x128)
   - Upload screenshots
   - Điền mô tả, category, language
   - Thêm Privacy Policy URL

4. **Submit để review**:
   - Chrome sẽ review trong 1-3 ngày
   - Có thể bị reject nếu vi phạm policy

## 🚀 Bước 5: Upload lên Edge Add-ons

1. **Truy cập Partner Center**:
   - https://partner.microsoft.com/dashboard/microsoftedge
   - Đăng nhập với Microsoft account

2. **Tạo submission mới**:
   - Click "Create new extension"
   - Upload file ZIP

3. **Điền thông tin tương tự Chrome**

4. **Submit để review**

## ⚠️ Lưu ý quan trọng

1. **Permissions**: 
   - Extension chỉ cần `activeTab`, `scripting`, `storage`
   - Host permissions chỉ cho metruyencv.com và localhost (cho TTS server)
   - Store có thể hỏi về localhost permission - giải thích là để kết nối TTS server local

2. **Content Security Policy**:
   - Extension sử dụng Tesseract.js - cần đảm bảo không vi phạm CSP

3. **Review Process**:
   - Chrome: Thường 1-3 ngày
   - Edge: Thường nhanh hơn
   - Có thể bị reject nếu:
     - Vi phạm copyright (nếu extension liên quan đến nội dung có bản quyền)
     - Không có privacy policy
     - Permissions không hợp lý

4. **Updates**:
   - Sau khi publish, mỗi lần update cần submit lại
   - Tăng version number trong manifest.json

## 📊 Checklist trước khi submit

- [ ] Icons đã có đủ 3 kích thước (16, 48, 128)
- [ ] Screenshots đã chuẩn bị (ít nhất 1)
- [ ] File ZIP đã tạo và test (không có file thừa)
- [ ] Privacy Policy đã tạo và có URL
- [ ] Mô tả đã viết đầy đủ
- [ ] Version number đã đúng
- [ ] Đã test extension trên Chrome/Edge thật
- [ ] Không có lỗi console

## 🔗 Links hữu ích

- Chrome Web Store Developer Dashboard: https://chrome.google.com/webstore/devconsole
- Edge Add-ons Partner Center: https://partner.microsoft.com/dashboard/microsoftedge
- Chrome Extension Policies: https://developer.chrome.com/docs/webstore/program-policies/
- Edge Extension Policies: https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/publish-extension


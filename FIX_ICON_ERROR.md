# Cách khắc phục lỗi "Could not load icon"

## Nguyên nhân
Lỗi này thường xảy ra khi:
1. File icon không tồn tại
2. Đường dẫn trong manifest.json không đúng
3. Chrome đang cache manifest cũ

## Giải pháp

### Bước 1: Kiểm tra file icons
Đảm bảo các file sau tồn tại trong thư mục `extension/icons/`:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)  
- `icon128.png` (128x128 pixels)

### Bước 2: Tạo icons nếu chưa có

**Cách 1: Sử dụng công cụ online (Khuyến nghị)**
1. Truy cập: https://www.favicon-generator.org/
2. Upload một hình ảnh (tối thiểu 260x260)
3. Tải về các kích thước 16x16, 48x48, 128x128
4. Đổi tên và đặt vào `extension/icons/`:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

**Cách 2: Sử dụng file HTML generator**
1. Mở file `create-icons.html` trong trình duyệt
2. Click nút "Create Icons"
3. Lưu các file vào `extension/icons/`

### Bước 3: Reload extension
1. Mở `chrome://extensions/` (hoặc `edge://extensions/`)
2. Tìm extension "Metruyencv Chapter Reader"
3. Click nút **Reload** (🔄)
4. Hoặc xóa extension và load lại:
   - Click "Remove"
   - Click "Load unpacked"
   - Chọn thư mục `extension`

### Bước 4: Kiểm tra lại
Nếu vẫn lỗi, thử:
1. Đóng và mở lại trình duyệt
2. Kiểm tra console để xem lỗi chi tiết
3. Đảm bảo đường dẫn trong manifest.json đúng:
   ```json
   "icons": {
     "16": "icons/icon16.png",
     "48": "icons/icon48.png",
     "128": "icons/icon128.png"
   }
   ```

### Bước 5: Tạm thời bỏ icons (nếu cần)
Nếu vẫn không được, có thể tạm thời comment out phần icons trong manifest.json để extension có thể load:

```json
{
  "manifest_version": 3,
  "name": "Metruyencv Chapter Reader",
  // Tạm thời comment out icons
  // "icons": {
  //   "16": "icons/icon16.png",
  //   "48": "icons/icon48.png",
  //   "128": "icons/icon128.png"
  // },
  ...
}
```

**Lưu ý**: Icons là bắt buộc khi publish lên store, nên bạn vẫn cần tạo chúng sau.

## Kiểm tra nhanh
Chạy lệnh sau để kiểm tra file icons:
```bash
# Windows
dir extension\icons\icon*.png

# Linux/Mac
ls -lh extension/icons/icon*.png
```

Nếu thấy 3 file (icon16.png, icon48.png, icon128.png) thì file đã có. Chỉ cần reload extension.


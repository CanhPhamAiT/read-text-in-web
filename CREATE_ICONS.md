# Hướng dẫn tạo Icons cho Extension

Extension cần có 3 icon với các kích thước:
- **16x16** pixels
- **48x48** pixels  
- **128x128** pixels

## Cách tạo Icons

### Phương pháp 1: Sử dụng công cụ online (Khuyến nghị)

1. **Favicon Generator**: https://www.favicon-generator.org/
   - Upload một hình ảnh (tối thiểu 260x260)
   - Tải về các kích thước cần thiết
   - Đổi tên thành: `icon16.png`, `icon48.png`, `icon128.png`

2. **RealFaviconGenerator**: https://realfavicongenerator.net/
   - Tương tự như trên

### Phương pháp 2: Sử dụng Photoshop/GIMP

1. Tạo một icon 128x128 pixels
2. Resize thành 48x48 và 16x16
3. Lưu với tên tương ứng

### Phương pháp 3: Sử dụng ImageMagick (Command line)

```bash
# Nếu bạn có một icon 128x128 tên là icon.png
convert icon.png -resize 48x48 icons/icon48.png
convert icon.png -resize 16x16 icons/icon16.png
cp icon.png icons/icon128.png
```

## Yêu cầu về Icon

- **Format**: PNG (khuyến nghị) hoặc JPEG
- **Nền**: Nên có nền trong suốt (transparent) hoặc nền màu
- **Nội dung**: Nên liên quan đến đọc sách/truyện
- **Màu sắc**: Rõ ràng, dễ nhìn ở kích thước nhỏ

## Gợi ý Icon

Bạn có thể sử dụng:
- Icon sách mở
- Icon loa/speaker
- Icon text với sóng âm
- Icon đọc sách

## Sau khi tạo xong

1. Đặt các file vào thư mục `extension/icons/`:
   ```
   extension/icons/icon16.png
   extension/icons/icon48.png
   extension/icons/icon128.png
   ```

2. Manifest.json đã được cấu hình sẵn để sử dụng các icon này.

3. Test bằng cách load extension vào Chrome/Edge:
   - Chrome: `chrome://extensions/` → Enable Developer mode → Load unpacked
   - Edge: `edge://extensions/` → Enable Developer mode → Load unpacked


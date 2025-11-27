# Hướng dẫn Deploy PWA lên GitHub Pages

## 🚀 Bước 1: Push code lên GitHub

Nếu chưa có repository:

```bash
# Tạo repository mới trên GitHub (không cần khởi tạo README)
# Sau đó chạy:

git init
git add .
git commit -m "Initial commit with PWA"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

Nếu đã có repository:

```bash
git add .
git commit -m "Add PWA"
git push
```

## 📦 Bước 2: Enable GitHub Pages

1. **Vào repository trên GitHub**
2. **Click Settings** (ở thanh menu trên)
3. **Scroll xuống phần "Pages"** (ở sidebar bên trái)
4. **Cấu hình:**
   - **Source**: Chọn "Deploy from a branch"
   - **Branch**: Chọn `main` (hoặc `master`)
   - **Folder**: Chọn `/pwa` (hoặc `/` nếu bạn muốn deploy từ root)
   - **Click "Save"**

## ✅ Bước 3: Kiểm tra

1. **Đợi vài phút** để GitHub build và deploy
2. **Vào URL:** `https://your-username.github.io/repo-name/pwa/`
   - Thay `your-username` = tên GitHub của bạn
   - Thay `repo-name` = tên repository
   - Thay `pwa` = tên folder chứa PWA (nếu deploy từ root thì bỏ `/pwa`)

3. **Kiểm tra PWA hoạt động:**
   - Mở DevTools (F12)
   - Application → Service Workers → Phải thấy service worker đã register
   - Application → Manifest → Phải thấy manifest.json

## 🔧 Bước 4: Cập nhật URLs (nếu cần)

Nếu PWA không hoạt động đúng, kiểm tra:

1. **Mở `pwa/app.js`**
2. **Tìm function `generateBookmarklet()`**
3. **URL sẽ tự động detect từ `window.location.origin`**
4. **Nếu cần fix thủ công, thay đổi:**
   ```javascript
   const pwaUrl = 'https://your-username.github.io/repo-name/pwa';
   ```

## ⚠️ Lưu ý về "Verified domains"

**Bạn KHÔNG cần verify domain** để deploy GitHub Pages!

- "Verified domains" chỉ dùng để **restrict** ai có thể publish lên domain đó
- Với GitHub Pages miễn phí, bạn sẽ dùng domain `*.github.io`
- Domain verification chỉ cần khi bạn dùng **custom domain** (ví dụ: `yourdomain.com`)

## 🎯 Cấu trúc thư mục

Đảm bảo cấu trúc như sau:

```
your-repo/
├── extension/          # Extension code (không deploy)
├── pwa/                # PWA code (deploy folder này)
│   ├── index.html
│   ├── app.js
│   ├── app.css
│   ├── manifest.json
│   ├── service-worker.js
│   ├── inject.js
│   └── icons/
└── README.md
```

## 📝 Checklist

- [ ] Code đã push lên GitHub
- [ ] GitHub Pages đã enable
- [ ] Branch và folder đã chọn đúng
- [ ] Đợi vài phút để deploy
- [ ] Test PWA tại URL GitHub Pages
- [ ] Test bookmarklet hoạt động
- [ ] Test service worker register

## 🆘 Troubleshooting

### PWA không load được

- Kiểm tra URL có đúng không (có `/pwa/` ở cuối)
- Kiểm tra console có lỗi không
- Đảm bảo tất cả files trong `pwa/` đã được commit

### Service Worker không register

- Kiểm tra HTTPS (GitHub Pages tự động có HTTPS)
- Clear cache và reload
- Kiểm tra `service-worker.js` có trong repo không

### Bookmarklet không hoạt động

- Kiểm tra URL trong bookmarklet có đúng domain không
- Mở console xem có lỗi load `inject.js` không
- Đảm bảo `inject.js` có thể access được từ domain

### 404 Not Found

- Kiểm tra folder path trong GitHub Pages settings
- Đảm bảo `index.html` có trong folder được chọn
- Thử reload sau vài phút (GitHub Pages cần thời gian build)

## 🎉 Sau khi deploy thành công

1. **Share link PWA** với người dùng
2. **Hướng dẫn cài đặt bookmarklet**
3. **Hướng dẫn cài đặt PWA trên mobile**
4. **Test trên nhiều trình duyệt và thiết bị**

## 📚 Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [PWA Best Practices](https://web.dev/pwa-checklist/)


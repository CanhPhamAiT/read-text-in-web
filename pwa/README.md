# Chapter Reader PWA

Progressive Web App version của Chapter Reader - có thể cài đặt như app native trên Android và iOS.

## 🚀 Quick Start

1. **Host PWA** trên HTTPS (GitHub Pages, Netlify, Vercel, hoặc server riêng)
   - **Live URL:** `https://canhphamait.github.io/read-text-in-web/pwa/`
2. **Mở PWA** trong trình duyệt (URL sẽ tự động được detect)
3. **Cài đặt bookmarklet** (kéo nút vào bookmark bar)
4. **Sử dụng** trên trang truyện

## 📱 Cài đặt trên Android

1. Mở PWA trong Chrome/Edge
2. Menu → **"Add to Home screen"** hoặc **"Install app"**
3. Icon sẽ xuất hiện trên home screen

## 📖 Chi tiết

Xem [PWA_GUIDE.md](./PWA_GUIDE.md) để biết hướng dẫn đầy đủ.

## ⚠️ Lưu ý

- PWA cần được host trên HTTPS (trừ localhost)
- Cần cài đặt bookmarklet để inject script vào trang web
- Service worker cần được register để hoạt động offline

## 🔧 Development

```bash
# Test locally
cd pwa
python -m http.server 8000
# Open http://localhost:8000
```

## 📝 TODO

- [ ] Hoàn thiện app.js (main logic)
- [ ] Tạo inject.js (content script được inject)
- [ ] Tạo icons (72, 96, 128, 144, 192, 512px)
- [ ] Test trên Android/iOS
- [ ] Deploy lên hosting


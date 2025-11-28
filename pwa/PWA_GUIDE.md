# Hướng dẫn PWA (Progressive Web App)

PWA version của Chapter Reader cho phép bạn cài đặt như một ứng dụng native trên Android và iOS.

## ✨ Ưu điểm của PWA

- ✅ **Cài đặt như app native** - Icon trên home screen
- ✅ **Hoạt động offline** - Service worker cache resources
- ✅ **Không cần Chrome Extension** - Hoạt động trên mọi trình duyệt
- ✅ **Tốt hơn trên mobile** - UI tối ưu cho màn hình nhỏ
- ✅ **Tự động update** - Service worker tự động cập nhật

## 🚀 Cài đặt PWA

### Bước 1: Host PWA

PWA cần được host trên HTTPS (hoặc localhost cho development).

**Option 1: GitHub Pages (Miễn phí)**
1. Push code lên GitHub repository
2. Vào Settings → Pages
3. Chọn branch và folder `pwa`
4. Access qua: `https://canhphamait.github.io/read-text-in-web/pwa/`

**Option 2: Netlify/Vercel (Miễn phí)**
1. Deploy folder `pwa` lên Netlify hoặc Vercel
2. Tự động có HTTPS

**Option 3: Local Server (Development)**
```bash
# Python
cd pwa
python -m http.server 8000

# Node.js
npx serve pwa

# PHP
php -S localhost:8000 -t pwa
```

### Bước 2: Cập nhật URLs

Sau khi host, cập nhật các URLs trong code:

1. **pwa/bookmarklet.js**: Thay `https://your-domain.com/pwa/inject.js` bằng URL thực tế
2. **pwa/inject.js**: (nếu cần) cập nhật URLs
3. **pwa/index.html**: Cập nhật link trong bookmarklet section

### Bước 3: Cài đặt Bookmarklet

1. Mở PWA trong trình duyệt
2. Kéo nút bookmarklet vào thanh bookmark
3. Hoặc copy link và thêm vào bookmark thủ công

### Bước 4: Sử dụng

1. Mở trang truyện (metruyencv.com hoặc tangthuvien.net)
2. Click vào bookmarklet đã cài đặt
3. Panel điều khiển sẽ xuất hiện ở góc dưới bên phải
4. Hoặc mở PWA để điều khiển chi tiết hơn

## 📱 Cài đặt trên Android

### Chrome/Edge

1. Mở PWA trong trình duyệt
2. Menu (3 chấm) → **"Add to Home screen"** hoặc **"Install app"**
3. Xác nhận cài đặt
4. Icon sẽ xuất hiện trên home screen

### Firefox

1. Mở PWA
2. Menu → **"Install"**
3. Xác nhận cài đặt

### Samsung Internet

1. Mở PWA
2. Menu → **"Add page to"** → **"Home screen"**

## 🍎 Cài đặt trên iOS (Safari)

1. Mở PWA trong Safari
2. Tap nút Share (□↑)
3. Chọn **"Add to Home Screen"**
4. Đặt tên và tap **"Add"**

## 🔧 Development

### Test locally

```bash
# Start local server
cd pwa
python -m http.server 8000

# Open http://localhost:8000
```

### Update service worker

Khi có thay đổi, service worker sẽ tự động update. Nếu không:
1. Mở DevTools → Application → Service Workers
2. Click "Update" hoặc "Unregister"
3. Reload trang

### Debug

- **Service Worker**: DevTools → Application → Service Workers
- **Manifest**: DevTools → Application → Manifest
- **Cache**: DevTools → Application → Cache Storage
- **Console**: DevTools → Console

## 📝 Cấu trúc Files

```
pwa/
├── index.html          # Main HTML page
├── app.js              # Main JavaScript logic
├── app.css             # Styles
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker for offline
├── bookmarklet.js      # Bookmarklet code
├── inject.js           # Content script (injected via bookmarklet)
└── icons/              # App icons (various sizes)
    ├── icon72.png
    ├── icon96.png
    ├── icon128.png
    ├── icon144.png
    ├── icon192.png
    └── icon512.png
```

## ⚠️ Lưu ý

1. **HTTPS Required**: PWA chỉ hoạt động trên HTTPS (trừ localhost)
2. **Bookmarklet**: Cần cài đặt bookmarklet để inject script vào trang web
3. **CORS**: Một số tính năng có thể bị giới hạn bởi CORS policy
4. **TTS Server**: Coqui TTS server cần được host riêng hoặc chạy local

## 🆘 Troubleshooting

### PWA không cài đặt được

- Kiểm tra manifest.json có hợp lệ không
- Đảm bảo đang dùng HTTPS
- Kiểm tra service worker đã register chưa

### Bookmarklet không hoạt động

- Kiểm tra URL trong bookmarklet.js có đúng không
- Một số trang web có Content Security Policy chặn inline scripts
- Thử inject script thủ công từ console

### Service Worker không update

- Clear cache và reload
- Unregister service worker và reload
- Kiểm tra console có lỗi không

## 🔗 Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)


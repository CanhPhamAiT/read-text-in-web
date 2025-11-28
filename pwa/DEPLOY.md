# Hướng dẫn Deploy PWA

## 🚀 Quick Deploy

### Option 1: GitHub Pages (Miễn phí, dễ nhất)

1. **Push code lên GitHub:**
   ```bash
   git add .
   git commit -m "Add PWA"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Vào repository → Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (hoặc `master`)
   - Folder: `/pwa` (hoặc `/` nếu PWA ở root)
   - Save

3. **Access PWA:**
   - URL: `https://canhphamait.github.io/read-text-in-web/pwa/`
   - Hoặc custom domain nếu có

4. **Cập nhật URLs trong code:**
   - Mở `pwa/app.js`
   - Tìm `generateBookmarklet()` function
   - URL sẽ tự động được detect từ `window.location.origin`

### Option 2: Netlify (Miễn phí, tự động deploy)

1. **Push code lên GitHub** (như trên)

2. **Deploy trên Netlify:**
   - Vào [netlify.com](https://netlify.com)
   - New site from Git → Chọn GitHub repo
   - Build settings:
     - Base directory: `pwa`
     - Publish directory: `pwa`
   - Deploy site

3. **Access PWA:**
   - URL: `https://your-site.netlify.app`
   - Hoặc custom domain

### Option 3: Vercel (Miễn phí, tự động deploy)

1. **Push code lên GitHub**

2. **Deploy trên Vercel:**
   - Vào [vercel.com](https://vercel.com)
   - Import project → Chọn GitHub repo
   - Root directory: `pwa`
   - Deploy

3. **Access PWA:**
   - URL: `https://your-site.vercel.app`

### Option 4: Self-hosted (VPS/Server)

1. **Upload files:**
   ```bash
   # Copy pwa folder to server
   scp -r pwa/* user@your-server.com:/var/www/pwa/
   ```

2. **Setup Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       root /var/www/pwa;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Setup SSL (Let's Encrypt):**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## ⚙️ Cấu hình sau khi deploy

### 1. Kiểm tra Service Worker

Mở DevTools → Application → Service Workers
- Phải thấy service worker đã register
- Status: activated and running

### 2. Kiểm tra Manifest

DevTools → Application → Manifest
- Phải thấy manifest.json được load
- Icons phải hiển thị đúng

### 3. Test Bookmarklet

1. Mở PWA
2. Kéo bookmarklet vào bookmark bar
3. Mở trang truyện (metruyencv.com hoặc tangthuvien.net)
4. Click bookmarklet
5. Kiểm tra panel xuất hiện

### 4. Test PWA Installation

**Android (Chrome):**
- Menu → "Add to Home screen"
- Icon xuất hiện trên home screen

**iOS (Safari):**
- Share → "Add to Home Screen"
- Icon xuất hiện trên home screen

## 🔧 Troubleshooting

### Service Worker không register

- Kiểm tra HTTPS (required cho PWA)
- Kiểm tra console có lỗi không
- Clear cache và reload

### Bookmarklet không hoạt động

- Kiểm tra URL trong bookmarklet có đúng không
- Một số trang có CSP (Content Security Policy) chặn inline scripts
- Thử inject script thủ công từ console

### Icons không hiển thị

- Kiểm tra file icons có tồn tại không
- Kiểm tra path trong manifest.json
- Clear cache

### PWA không cài đặt được

- Kiểm tra manifest.json hợp lệ
- Đảm bảo đang dùng HTTPS
- Kiểm tra service worker đã register

## 📝 Checklist trước khi deploy

- [ ] Icons đã được tạo (72, 96, 128, 144, 192, 512px)
- [ ] manifest.json đã cấu hình đúng
- [ ] service-worker.js đã cache đúng files
- [ ] inject.js có thể load được từ domain
- [ ] Test bookmarklet hoạt động
- [ ] Test PWA installation
- [ ] Test trên mobile (Android/iOS)

## 🎉 Sau khi deploy

1. Share link PWA với người dùng
2. Hướng dẫn cài đặt bookmarklet
3. Hướng dẫn cài đặt PWA trên mobile
4. Monitor errors trong console

## 📚 Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)


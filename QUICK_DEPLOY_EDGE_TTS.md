# ⚡ Quick Deploy Edge-TTS (5 phút)

## 🚀 Railway (Khuyến nghị - Dễ nhất)

1. **Đăng ký:** [railway.app](https://railway.app) → Login với GitHub

2. **Deploy:**
   - New Project → Deploy from GitHub repo
   - Chọn repo của bạn
   - Railway sẽ tự động detect `railway.json` hoặc `railway.toml`
   - **Nếu không detect:** Vào Settings → Build → Dockerfile Path → Set `Dockerfile.edge-tts.production`

3. **Lấy URL:**
   - Settings → Domains → Copy URL
   - Ví dụ: `https://edge-tts-production.up.railway.app`

4. **Cập nhật PWA:**
   - Mở PWA → Nhập URL vào field "Server URL"
   - Hoặc sửa `pwa/app.js`: `coquiUrlInput.value = 'YOUR_RAILWAY_URL'`

**Xong!** 🎉

---

## 🎯 Render (Alternative)

1. **Đăng ký:** [render.com](https://render.com) → Login với GitHub

2. **Tạo Web Service:**
   - New → Web Service
   - Connect repo
   - Settings:
     - **Name:** `edge-tts-server`
     - **Environment:** `Docker`
     - **Dockerfile Path:** `Dockerfile.edge-tts.production`
   - Click "Create Web Service"

3. **Lấy URL:** `https://edge-tts-server.onrender.com`

**Lưu ý:** Free tier sẽ sleep sau 15 phút. Request đầu tiên sau khi sleep sẽ mất ~30 giây.

---

## 📋 Checklist

- [ ] Đã deploy lên Railway/Render
- [ ] Đã copy URL server
- [ ] Đã test `/health` endpoint (phải trả về `{"status":"ok"}`)
- [ ] Đã cập nhật URL trong PWA
- [ ] Đã test TTS trong PWA

---

## 🆘 Troubleshooting

**Railway không detect Dockerfile?**
- Xem [RAILWAY_FIX.md](./RAILWAY_FIX.md) để biết cách fix
- Hoặc vào Settings → Build → Dockerfile Path → Set `Dockerfile.edge-tts.production`

**Server không hoạt động?**
- Kiểm tra logs trong Railway/Render dashboard
- Test `/health` endpoint: `curl https://your-url/health`

**CORS error?**
- Đảm bảo `flask-cors` đã được cài
- Kiểm tra `CORS(app)` trong code

**Audio không phát?**
- Kiểm tra console trong browser
- Test trực tiếp: `curl "https://your-url/api/tts?text=Hello&voice=vi-VN-HoaiMyNeural"`

---

Xem [EDGE_TTS_FREE_HOSTING.md](./EDGE_TTS_FREE_HOSTING.md) để biết chi tiết đầy đủ.


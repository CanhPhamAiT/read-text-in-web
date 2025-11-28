# 🔧 Fix Railway Deploy Issue

Nếu Railway không tự động detect Dockerfile, làm theo các bước sau:

## ✅ Giải pháp 1: Dùng Railway Config Files (Khuyến nghị)

Đã tạo sẵn các file cấu hình:
- `railway.json` - Railway config (JSON)
- `railway.toml` - Railway config (TOML)
- `nixpacks.toml` - Nixpacks config (nếu Railway dùng Nixpacks)

**Cách làm:**
1. Commit và push các file config lên GitHub
2. Railway sẽ tự động detect và dùng `Dockerfile.edge-tts.production`

---

## ✅ Giải pháp 2: Manual Config trong Railway UI

1. **Vào Railway Dashboard:**
   - Chọn project của bạn
   - Click vào service

2. **Vào Settings:**
   - Click "Settings" tab
   - Scroll xuống phần "Build"

3. **Cấu hình Build:**
   - **Build Command:** (để trống - dùng Dockerfile)
   - **Dockerfile Path:** `Dockerfile.edge-tts.production`
   - **Docker Context:** `.` (root directory)

4. **Cấu hình Deploy:**
   - **Start Command:** `python server.py`
   - **Port:** `5002` (hoặc để Railway tự detect từ EXPOSE)

5. **Environment Variables:**
   ```
   PORT=5002
   DEFAULT_VOICE=vi-VN-HoaiMyNeural
   ```

6. **Redeploy:**
   - Click "Redeploy" hoặc push code mới lên GitHub

---

## ✅ Giải pháp 3: Dùng Dockerfile trực tiếp

1. **Tạo service mới:**
   - New → "Empty Service"
   - Hoặc "Deploy from GitHub repo"

2. **Chọn Dockerfile:**
   - Settings → Build → Dockerfile Path
   - Set: `Dockerfile.edge-tts.production`

3. **Set Port:**
   - Settings → Networking
   - Expose port: `5002`

---

## ✅ Giải pháp 4: Tạo Service từ Dockerfile

1. **Trong Railway Dashboard:**
   - Click "New" → "GitHub Repo"
   - Chọn repository

2. **Chọn Dockerfile:**
   - Railway sẽ hỏi "How do you want to deploy?"
   - Chọn "Dockerfile"
   - Chọn `Dockerfile.edge-tts.production`

3. **Deploy:**
   - Railway sẽ tự động build và deploy

---

## 🆘 Nếu vẫn không được

### Kiểm tra:

1. **File có trong repo không?**
   ```bash
   git add railway.json railway.toml nixpacks.toml
   git commit -m "Add Railway config files"
   git push
   ```

2. **Railway có access repo không?**
   - Settings → Linked Accounts → GitHub
   - Đảm bảo đã authorize

3. **Check logs:**
   - Railway Dashboard → Service → Logs
   - Xem có lỗi gì không

4. **Force rebuild:**
   - Settings → Build → "Clear Build Cache"
   - Click "Redeploy"

---

## 📝 Checklist

- [ ] Đã commit `railway.json` hoặc `railway.toml`
- [ ] Đã set Dockerfile path trong Railway UI
- [ ] Đã set PORT environment variable
- [ ] Đã set DEFAULT_VOICE (optional)
- [ ] Đã redeploy service
- [ ] Test `/health` endpoint

---

## 🔗 Test sau khi deploy

```bash
# Test health endpoint
curl https://your-app.railway.app/health

# Test TTS
curl "https://agile-heart.railway.app/api/tts?text=Hello&voice=vi-VN-HoaiMyNeural" --output test.mp3
```

Nếu trả về `{"status":"ok","engine":"edge-tts"}` → ✅ Thành công!

curl https://agile-heart.railway.app/health


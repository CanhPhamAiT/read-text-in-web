# 🔧 Fix CORS Issue trên Railway

Server trên Railway đang chặn requests từ extension do CORS. Đã sửa code, cần redeploy.

## ✅ Đã sửa

1. **edge-tts-server-real.py** - CORS đã được cấu hình để cho phép tất cả origins
2. **extension/popup.js** - Code check server đã được cải thiện để handle cả text và JSON responses

## 🚀 Cách redeploy trên Railway

### Option 1: Push code mới (Khuyến nghị)

```bash
git add edge-tts-server-real.py
git commit -m "Fix CORS to allow extension access"
git push
```

Railway sẽ tự động detect và redeploy.

### Option 2: Manual redeploy trong Railway UI

1. Vào Railway Dashboard
2. Chọn service của bạn
3. Click "Redeploy" button
4. Hoặc vào Settings → Deploy → "Clear Build Cache" → "Redeploy"

## ✅ Sau khi redeploy

Test lại:

```bash
# Test health endpoint
curl -v https://agile-heart.railway.app/health

# Kiểm tra CORS headers
curl -H "Origin: chrome-extension://test" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://agile-heart.railway.app/health -v
```

Phải thấy:
```
< access-control-allow-origin: *
< access-control-allow-methods: GET, POST, OPTIONS
```

## 🧪 Test trong Extension

1. Mở extension popup
2. Chọn "Google TTS (Local Server)"
3. Chọn "Railway (Cloud)"
4. Click "Kiểm tra"
5. Phải thấy "Online ✓"

## 🆘 Nếu vẫn không được

1. **Kiểm tra logs:**
   - Railway Dashboard → Service → Logs
   - Xem có lỗi gì không

2. **Kiểm tra CORS headers:**
   - Mở DevTools → Network tab
   - Click "Kiểm tra" trong extension
   - Xem request `/health`
   - Kiểm tra response headers có `access-control-allow-origin: *` không

3. **Clear cache:**
   - Extension: Reload extension trong `chrome://extensions`
   - Browser: Hard refresh (Ctrl+Shift+R)


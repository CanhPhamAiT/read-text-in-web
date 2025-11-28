# 🚀 Hướng dẫn Deploy Edge-TTS lên Server Miễn phí

Có nhiều cách để deploy edge-tts server lên các platform miễn phí. Dưới đây là các options tốt nhất:

## 📋 Các Platform Miễn phí

### 1. Railway.app ⭐ (Khuyến nghị)

**Ưu điểm:**
- ✅ Free tier: $5 credit/tháng (đủ cho TTS server)
- ✅ Hỗ trợ Docker
- ✅ Auto-deploy từ GitHub
- ✅ HTTPS tự động
- ✅ Dễ setup

**Cách deploy:**

1. **Đăng ký Railway:**
   - Vào [railway.app](https://railway.app)
   - Đăng nhập bằng GitHub

2. **Tạo project mới:**
   - Click "New Project"
   - Chọn "Deploy from GitHub repo"
   - Chọn repository của bạn

3. **Deploy Docker:**
   
   **Option A: Tự động (khuyến nghị):**
   - Railway sẽ tự động detect `railway.json` hoặc `railway.toml`
   - File này đã được config để dùng `Dockerfile.edge-tts.production`
   - Railway sẽ tự động build và deploy
   
   **Option B: Manual:**
   - Tạo service mới → "Dockerfile" → Chọn `Dockerfile.edge-tts.production`
   - Set port: `5002`
   
   **Lưu ý:** Dùng `Dockerfile.edge-tts.production` cho production (edge-tts thực sự), 
   còn `Dockerfile.edge-tts` dùng cho local (gTTS fallback)
   
   **Nếu Railway không detect:**
   - Vào Settings → Build → Dockerfile Path
   - Set: `Dockerfile.edge-tts.production`

4. **Cấu hình Environment Variables:**
   ```
   DEFAULT_VOICE=vi-VN-HoaiMyNeural
   PORT=5002
   ```

5. **Lấy URL:**
   - Railway sẽ tự động tạo URL: `https://your-app.railway.app`
   - Update URL này vào PWA: `coquiUrl` field

**Lưu ý:** Railway free tier có thể sleep sau 30 phút không dùng. Upgrade lên Hobby ($5/tháng) để tránh sleep.

---

### 2. Render.com

**Ưu điểm:**
- ✅ Free tier có sẵn
- ✅ Hỗ trợ Docker
- ✅ Auto-deploy từ GitHub
- ⚠️ Sleep sau 15 phút không dùng (free tier)

**Cách deploy:**

1. **Đăng ký Render:**
   - Vào [render.com](https://render.com)
   - Đăng nhập bằng GitHub

2. **Tạo Web Service:**
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Chọn branch (thường là `main`)

3. **Cấu hình:**
   ```
   Name: edge-tts-server
   Environment: Docker
   Dockerfile Path: Dockerfile.edge-tts.production
   Docker Context: ./
   ```
   
   **Lưu ý:** Dùng `Dockerfile.edge-tts.production` cho production

4. **Environment Variables:**
   ```
   DEFAULT_VOICE=vi-VN-HoaiMyNeural
   PORT=5002
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Render sẽ tự động build và deploy
   - URL: `https://your-app.onrender.com`

**Lưu ý:** Free tier sẽ sleep sau 15 phút. Request đầu tiên sau khi sleep sẽ mất ~30 giây để wake up.

---

### 3. Fly.io

**Ưu điểm:**
- ✅ Free tier: 3 shared VMs
- ✅ Không sleep (nếu có traffic)
- ✅ Global edge network
- ⚠️ Setup phức tạp hơn một chút

**Cách deploy:**

1. **Cài đặt Fly CLI:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Đăng nhập:**
   ```bash
   fly auth login
   ```

3. **Tạo file `fly.toml`:**
   ```toml
   app = "edge-tts-server"
   primary_region = "sin"  # Singapore (gần VN)
   
   [build]
     dockerfile = "Dockerfile.edge-tts.production"
   
   [[services]]
     internal_port = 5002
     protocol = "tcp"
   
     [[services.ports]]
       port = 80
       handlers = ["http"]
       force_https = true
   
     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   
   [env]
     DEFAULT_VOICE = "vi-VN-HoaiMyNeural"
     PORT = "5002"
   ```

4. **Deploy:**
   ```bash
   fly launch
   fly deploy
   ```

5. **Lấy URL:**
   ```bash
   fly info
   ```
   URL sẽ là: `https://edge-tts-server.fly.dev`

---

### 4. PythonAnywhere

**Ưu điểm:**
- ✅ Free tier có sẵn
- ✅ Không cần Docker
- ⚠️ Chỉ chạy Python, không phải Docker

**Cách deploy:**

1. **Đăng ký:**
   - Vào [pythonanywhere.com](https://www.pythonanywhere.com)
   - Tạo account free

2. **Upload code:**
   - Vào "Files" tab
   - Upload `edge-tts-server.py`
   - Tạo `requirements.txt`:
     ```
     flask
     flask-cors
     edge-tts
     gtts
     ```

3. **Cài đặt packages:**
   - Vào "Consoles" → "Bash console"
   ```bash
   pip3.10 install --user flask flask-cors edge-tts gtts
   ```

4. **Tạo Web App:**
   - Vào "Web" tab
   - Click "Add a new web app"
   - Chọn Flask
   - Python version: 3.10
   - Path: `/home/yourusername/edge-tts-server.py`

5. **Cấu hình WSGI:**
   - Edit WSGI file:
   ```python
   import sys
   sys.path.insert(0, '/home/yourusername')
   from edge_tts_server import app as application
   ```

6. **Reload:**
   - Click "Reload" button
   - URL: `https://yourusername.pythonanywhere.com`

---

### 5. Replit

**Ưu điểm:**
- ✅ Free tier
- ✅ IDE online
- ✅ Dễ setup
- ⚠️ Sleep sau 5 phút không dùng (free tier)

**Cách deploy:**

1. **Tạo Repl:**
   - Vào [replit.com](https://replit.com)
   - Click "Create Repl"
   - Chọn "Python"

2. **Upload code:**
   - Copy `edge-tts-server.py` vào Repl
   - Tạo `requirements.txt`:
     ```
     flask
     flask-cors
     edge-tts
     gtts
     ```

3. **Cài đặt packages:**
   - Chạy: `pip install -r requirements.txt`

4. **Chạy server:**
   - Click "Run"
   - Replit sẽ tự động tạo URL: `https://your-app.repl.co`

5. **Keep alive (tránh sleep):**
   - Tạo file `keep_alive.py`:
   ```python
   from flask import Flask
   from threading import Thread
   import requests
   import time
   
   app = Flask('')
   
   @app.route('/')
   def home():
       return "I'm alive"
   
   def run():
       app.run(host='0.0.0.0', port=8080)
   
   def keep_alive():
       t = Thread(target=run)
       t.daemon = True
       t.start()
       while True:
           time.sleep(300)  # Ping every 5 minutes
           requests.get('https://your-app.repl.co')
   
   keep_alive()
   ```

---

## 🔧 Cập nhật PWA để dùng Server

Sau khi deploy, cập nhật URL trong PWA:

### Option 1: Cập nhật trong code

Sửa `pwa/app.js`:
```javascript
// Thay localhost bằng URL server của bạn
coquiUrlInput.value = 'https://your-server.railway.app';
```

### Option 2: Để user tự nhập

User có thể nhập URL trực tiếp trong PWA interface (đã có sẵn).

---

## 📝 Lưu ý về Edge-TTS vs gTTS

**File hiện tại:**
- `edge-tts-server.py` - Dùng gTTS (fallback vì edge-tts có vấn đề SSL với proxy)
- `edge-tts-server-real.py` - Dùng edge-tts thực sự (chất lượng tốt hơn)

**Để dùng edge-tts thực sự:**
1. Sửa `Dockerfile.edge-tts` để copy `edge-tts-server-real.py` thay vì `edge-tts-server.py`
2. Hoặc đổi tên file: `edge-tts-server-real.py` → `edge-tts-server.py`

---

## 📊 So sánh các Platform

| Platform | Free Tier | Sleep? | Setup | Khuyến nghị |
|----------|-----------|--------|-------|-------------|
| **Railway** | $5 credit/tháng | Có (free) | ⭐⭐⭐ Dễ | ⭐⭐⭐⭐⭐ |
| **Render** | Có | Có (15 phút) | ⭐⭐⭐ Dễ | ⭐⭐⭐⭐ |
| **Fly.io** | 3 VMs | Không | ⭐⭐ Trung bình | ⭐⭐⭐⭐ |
| **PythonAnywhere** | Có | Không | ⭐⭐⭐ Dễ | ⭐⭐⭐ |
| **Replit** | Có | Có (5 phút) | ⭐⭐⭐⭐ Rất dễ | ⭐⭐⭐ |

---

## 🎯 Khuyến nghị

**Cho production:** Railway hoặc Fly.io (không sleep, ổn định)

**Cho testing:** Render hoặc Replit (dễ setup, đủ dùng)

---

## 🆘 Troubleshooting

### Server sleep và wake up chậm
- **Giải pháp:** Dùng Railway Hobby plan ($5/tháng) hoặc Fly.io
- **Hoặc:** Setup keep-alive script để ping server định kỳ

### CORS errors
- **Giải pháp:** Đảm bảo `flask-cors` đã được cài và `CORS(app)` được gọi

### Port không đúng
- **Giải pháp:** Một số platform tự động map port. Kiểm tra environment variable `PORT`

### SSL/HTTPS issues
- **Giải pháp:** Tất cả platform trên đều tự động có HTTPS, không cần config thêm

---

## 📝 Lưu ý

1. **Free tier có giới hạn:**
   - Bandwidth giới hạn
   - CPU/RAM giới hạn
   - Có thể sleep nếu không dùng

2. **Production nên:**
   - Upgrade lên paid plan nếu cần ổn định
   - Hoặc dùng nhiều free accounts để load balance

3. **Security:**
   - Không expose API key trong code
   - Dùng environment variables
   - Cân nhắc thêm authentication nếu cần

---

## 🔗 Resources

- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Fly.io Documentation](https://fly.io/docs)
- [Edge-TTS GitHub](https://github.com/rany2/edge-tts)


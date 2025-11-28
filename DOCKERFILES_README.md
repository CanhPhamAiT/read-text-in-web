# 📦 Dockerfiles Guide

Project này có 2 Dockerfiles cho các mục đích khác nhau:

## 🏠 Local Development

**File:** `Dockerfile.edge-tts`

**Dùng cho:** Chạy local trên máy của bạn

**Engine:** gTTS (Google TTS)

**Lý do:** 
- edge-tts có vấn đề SSL với corporate proxy
- gTTS hoạt động ổn định hơn trong môi trường local
- Không cần cấu hình đặc biệt

**Cách dùng:**
```bash
docker-compose up
```

Hoặc:
```bash
docker build -f Dockerfile.edge-tts -t edge-tts-local .
docker run -p 5002:5002 edge-tts-local
```

---

## 🚀 Production/Deploy

**File:** `Dockerfile.edge-tts.production`

**Dùng cho:** Deploy lên Railway, Render, Fly.io, etc.

**Engine:** edge-tts (Microsoft Edge TTS thực sự)

**Lý do:**
- Chất lượng giọng đọc tốt hơn gTTS
- Hỗ trợ nhiều giọng đọc hơn
- Hoạt động tốt trên cloud (không có vấn đề proxy)

**Cách dùng:**
```bash
# Local test production version
docker build -f Dockerfile.edge-tts.production -t edge-tts-prod .
docker run -p 5002:5002 edge-tts-prod

# Hoặc dùng docker-compose production
docker-compose -f docker-compose.production.yml up
```

**Deploy lên cloud:**
- Railway: Chọn `Dockerfile.edge-tts.production`
- Render: Set Dockerfile path = `Dockerfile.edge-tts.production`
- Fly.io: Set dockerfile = `Dockerfile.edge-tts.production`

---

## 📊 So sánh

| Feature | Local (gTTS) | Production (edge-tts) |
|---------|--------------|----------------------|
| **Chất lượng** | Tốt | Tốt hơn |
| **Giọng đọc** | Hạn chế | Nhiều options |
| **Proxy issues** | Không | Có (nhưng không ảnh hưởng trên cloud) |
| **Setup** | Dễ | Dễ |
| **Rate control** | Có | Có (tốt hơn) |

---

## 🔄 Khi nào dùng cái nào?

### Dùng `Dockerfile.edge-tts` (Local):
- ✅ Development trên máy local
- ✅ Test nhanh
- ✅ Có vấn đề với proxy/firewall
- ✅ Muốn đơn giản, không cần chất lượng cao nhất

### Dùng `Dockerfile.edge-tts.production` (Production):
- ✅ Deploy lên cloud (Railway, Render, etc.)
- ✅ Cần chất lượng giọng đọc tốt nhất
- ✅ Cần nhiều options giọng đọc
- ✅ Production environment

---

## 📝 Files liên quan

- `edge-tts-server.py` - Server dùng gTTS (cho local)
- `edge-tts-server-real.py` - Server dùng edge-tts thực sự (cho production)
- `docker-compose.yml` - Compose file cho local
- `docker-compose.production.yml` - Compose file cho production

---

## 🆘 Troubleshooting

**Local không chạy được?**
- Dùng `Dockerfile.edge-tts` (gTTS version)
- Kiểm tra port 5002 có bị chiếm không

**Production deploy lỗi?**
- Đảm bảo dùng `Dockerfile.edge-tts.production`
- Kiểm tra environment variable `PORT` (một số platform tự set)

**Muốn test production version local?**
```bash
docker-compose -f docker-compose.production.yml up
```


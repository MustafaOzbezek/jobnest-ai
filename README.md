# JobNest AI 🚀

> Yapay zeka destekli iş ilanı aggregator — CV'ni yükle, mesleğini tespit et, sana özel ilanları bul.

![JobNest AI](https://img.shields.io/badge/JobNest-AI%20Powered-6366f1?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688?style=for-the-badge&logo=fastapi)

## 🎯 Ne Yapar?

1. CV'ni PDF olarak yükle
2. AI mesleğini otomatik tespit eder (Avukat, Yazılım Mühendisi, Muhasebeci...)
3. Kariyer.net + Indeed'i canlı olarak tarar
4. Sana en uygun ilanları puanlayarak sıralar

## ✨ Özellikler

- 🤖 **AI Meslek Tespiti** — CV'den otomatik meslek analizi
- 🔍 **Canlı Scraping** — Kariyer.net + Indeed eş zamanlı tarama
- 📊 **Match Score** — CV uyum puanı ile ilanları sırala
- 🔐 **JWT Auth** — Güvenli kullanıcı girişi
- ⚡ **357+ İlan** — Sürekli güncellenen ilan havuzu
- 🎨 **Modern UI** — Glassmorphism tasarım

## 🛠️ Teknolojiler

**Backend**
- FastAPI + SQLAlchemy
- PostgreSQL (Neon Cloud)
- Playwright (Web Scraping)
- JWT Authentication
- APScheduler (Otomatik scraping)

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Axios

## 🚀 Kurulum
```bash
# Backend
git clone https://github.com/MustafaOzbezek/jobnest-ai.git
cd jobnest-ai
python -m venv venv311
venv311\Scripts\activate
pip install -r requirements.txt
playwright install chromium

# .env dosyası oluştur
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key

# Başlat
uvicorn app.main:app --reload --port 8005

# Frontend
cd frontend
npm install
npm run dev
```

## 📸 Ekran Görüntüleri

> Login sayfası, ilan listesi ve CV analiz ekranı

## 👨‍💻 Geliştirici

**Mustafa Özbezek** — 3. sınıf Yazılım Mühendisliği öğrencisi

[![GitHub](https://img.shields.io/badge/GitHub-MustafaOzbezek-black?style=flat&logo=github)](https://github.com/MustafaOzbezek)
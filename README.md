# 🚀 AI Agent Template - Full Stack

Bu template, **veritabanı gerektirmeyen** AI agent projeleri için hazırlanmış tam kapsamlı bir başlangıç kitidir.

## 📁 Proje Yapısı

```
ai-agent-template/
├── backend-python/          # Flask AI Backend
│   ├── agents/             # AI Agent'ları
│   ├── documents/          # RAG için dokümanlar
│   ├── app.py             # Ana Flask uygulaması
│   └── requirements.txt   # Python bağımlılıkları
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/    # UI Bileşenleri
│   │   └── App.js        # Ana uygulama
│   └── package.json      # Node.js bağımlılıkları
└── scripts/               # Başlatma scriptleri
```

## 🚀 Hızlı Başlangıç

### 1. Backend'i Başlat
```bash
cd backend-python
python app.py
```
Backend `http://localhost:5001` adresinde çalışacak.

### 2. Frontend'i Başlat
```bash
cd frontend
npm start
```
Frontend `http://localhost:3003` adresinde çalışacak.

### 3. Tek Komutla Başlat
```bash
# Windows
start-services.bat

# Veya manuel olarak
npm start  # frontend klasöründe
python app.py  # backend-python klasöründe
```

## 🛠️ Özellikler

### Backend (Flask + AI Agents)
- ✅ **CORS Hazır**: Frontend ile otomatik iletişim
- ✅ **AI Agents**: Groq, RAG, CV Analizi
- ✅ **File Upload**: PDF/DOCX dosya yükleme
- ✅ **Error Handling**: Kapsamlı hata yönetimi
- ✅ **Hot Reload**: Geliştirme modunda otomatik yenileme

### Frontend (React + Tailwind)
- ✅ **Modern UI**: Dashboard tarzı tasarım
- ✅ **Responsive**: Tüm cihazlarda uyumlu
- ✅ **File Upload**: Drag & Drop dosya yükleme
- ✅ **Real-time**: Backend ile canlı iletişim
- ✅ **Error Handling**: Kullanıcı dostu hata mesajları

## 🔧 Özelleştirme

### Yeni AI Agent Ekleme
1. `backend-python/agents/` klasörüne yeni agent dosyası ekle
2. `app.py`'de agent'ı import et ve endpoint ekle
3. Frontend'de yeni API çağrısı ekle

### UI Değişiklikleri
1. `frontend/src/App.js` dosyasını düzenle
2. Tailwind CSS ile stil ver
3. Hot reload ile anında görüntüle

## 📝 API Endpoints

- `POST /analyze` - CV analizi
- `GET /health` - Sağlık kontrolü

## 🎨 Template Özellikleri

### Veritabanı Yok!
- ✅ **Stateless**: Her istek bağımsız
- ✅ **Hızlı**: Veritabanı bağlantısı yok
- ✅ **Basit**: Kurulum gerektirmez
- ✅ **Taşınabilir**: Her yerde çalışır

### Hazır Bileşenler
- 📊 **Dashboard Layout**: Modern panel tasarımı
- 🎯 **File Upload**: Sürükle-bırak dosya yükleme
- 📈 **Progress Indicators**: Yükleme göstergeleri
- 🎨 **Responsive Cards**: Uyumlu kart tasarımları

## 🚀 Yeni Proje Oluşturma

1. Bu template'i klonla
2. API anahtarlarını güncelle
3. Agent'ları özelleştir
4. UI'yi değiştir
5. Çalıştır!

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Backend loglarını kontrol edin
2. Frontend console'u kontrol edin
3. Port çakışması olup olmadığını kontrol edin

---

**Template Versiyonu**: 1.0  
**Son Güncelleme**: 2024
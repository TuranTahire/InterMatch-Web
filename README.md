# Intermatch Web - CV İş İlanı Eşleştirme Sistemi

## 📋 Proje Açıklaması
AI destekli CV ve iş ilanı eşleştirme sistemi. Groq AI kullanarak akıllı analiz yapar.

## 🏗️ Güncel Proje Yapısı

```
intermatch-web/
├── frontend/                # 🎨 React Frontend
│   ├── src/                # React kaynak kodları
│   ├── public/             # Statik dosyalar
│   ├── package.json        # Frontend bağımlılıkları
│   └── node_modules/       # Frontend packages
│
├── backend-python/         # 🐍 Python Backend  
│   ├── app.py             # Ana Flask server
│   ├── utils.py           # Dosya işleme yardımcıları
│   ├── agents/            # AI Agents
│   │   ├── cv_analyzer_agent.py
│   │   ├── interview_questions_agent.py
│   │   ├── cv_improvement_agent.py
│   │   └── rag_enhanced_agent.py
│   ├── matching_engine.py # RAG destekli AI analizi
│   ├── documents/         # RAG için belgeler
│   ├── chroma_db/         # Vektör veritabanı
│   ├── config.env         # Çevre değişkenleri
│   └── requirements.txt   # Python bağımlılıkları
│
├── scripts/                # 🔧 Çalıştırma scriptleri
└── README.md              # Bu dosya
```

## 🚀 Kurulum

### 1. Frontend Kurulumu
```bash
cd frontend
npm install
```

### 2. Backend Kurulumu  
```bash
cd backend-python
pip install flask flask-cors python-dotenv groq PyPDF2 python-docx
pip install langchain langchain-groq chromadb pypdf sentence-transformers
```

### 3. Çevre Değişkenleri
Backend klasöründe `config.env` dosyası oluşturun:
```env
GROQ_API_KEY=your_groq_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

## 🎯 Çalıştırma

### Geliştirme Modu
```bash
# Backend (Port 5000)
cd backend-python
python app.py

# Frontend (Port 3002) - Ayrı terminal
cd frontend
npm start
```

## 🔧 Teknolojiler

### Frontend
- **React** 18.3.1
- **Tailwind CSS** 
- **Axios** (HTTP istekleri)
- **Modern UI/UX**

### Backend
- **Flask** - Python web framework
- **Groq AI** - Hızlı LLM servisi
- **LangChain** - AI framework
- **ChromaDB** - Vektör veritabanı
- **RAG (Retrieval-Augmented Generation)** - Gelişmiş AI analizi

## 📱 Özellikler

- ✅ CV ve İş İlanı Yükleme (PDF/DOCX)
- ✅ AI Destekli Uyumluluk Analizi
- ✅ RAG Destekli Uzman Analizi
- ✅ Mülakat Soruları Üretimi
- ✅ CV İyileştirme Önerileri
- ✅ Detaylı Skor Hesaplama
- ✅ Türkçe Dil Desteği
- ✅ Modern ve Responsive UI

## 🔄 API Endpoints

- `GET /` - Ana sayfa
- `GET /api/health` - Server durumu  
- `POST /analyze` - CV-İş ilanı analizi
- `POST /generate-questions` - Mülakat soruları
- `POST /get-suggestions` - CV iyileştirme önerileri

## 🚀 Çalıştırma

### Manuel Başlatma
```bash
# Backend
cd backend-python
python app.py

# Frontend (ayrı terminal)
cd frontend
npm start
```

### Erişim
- **Frontend:** http://localhost:3002
- **Backend:** http://localhost:5000

## 🧠 AI Özellikleri

### RAG Sistemi
- Uzman bilgi tabanı
- Vektör veritabanı
- Gelişmiş analiz

### AI Agents
- CV Analiz Agent
- Mülakat Soruları Agent
- CV İyileştirme Agent

## 👥 Geliştirici Notları

Bu proje Groq AI ile çalışan, RAG destekli modern bir CV analiz sistemidir.
Temiz kod yapısı ve modüler tasarım ile geliştirilmiştir.

---
*Intermatch Web © 2025*
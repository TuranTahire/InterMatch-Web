# 🚀 AI Agent Template - Kullanım Kılavuzu

Bu template, **veritabanı gerektirmeyen** AI agent projeleri için hazırlanmış tam kapsamlı bir başlangıç kitidir.

## 📋 Template Özellikleri

### ✅ **Veritabanı Yok!**
- Her istek bağımsız çalışır
- Kurulum gerektirmez
- Hızlı ve basit

### ✅ **Hazır Bileşenler**
- Modern React UI
- Flask backend
- File upload sistemi
- Error handling
- CORS yapılandırması

### ✅ **AI Ready**
- Groq AI entegrasyonu
- LangChain framework
- RAG sistemi
- Custom agent'lar

## 🚀 Hızlı Başlangıç

### 1. Template'i Kopyala
```bash
# Bu projeyi yeni bir klasöre kopyalayın
cp -r ai-agent-template my-new-project
cd my-new-project
```

### 2. Kurulum
```bash
# Otomatik kurulum
setup-template.bat

# Veya manuel kurulum
cd backend-python
pip install -r requirements-template.txt

cd ../frontend
npm install
```

### 3. Environment Ayarla
```bash
cd backend-python
copy env.example .env
# .env dosyasında API anahtarınızı güncelleyin
```

### 4. Çalıştır
```bash
# Tek komutla
start-services.bat

# Veya manuel
# Terminal 1: backend-python/python app-template.py
# Terminal 2: frontend/npm start
```

## 🔧 Özelleştirme

### Backend Özelleştirme

#### 1. Yeni AI Agent Ekleme
```python
# backend-python/agents/my_agent.py
class MyCustomAgent:
    def __init__(self):
        self.name = "My Custom Agent"
    
    def analyze(self, data):
        # AI logic buraya
        return {"result": "analysis complete"}

# app.py'de import et
from agents.my_agent import MyCustomAgent
```

#### 2. Yeni Endpoint Ekleme
```python
@app.route('/my-endpoint', methods=['POST'])
def my_endpoint():
    try:
        data = request.get_json()
        # Your logic here
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

### Frontend Özelleştirme

#### 1. Yeni Component Ekleme
```jsx
// frontend/src/components/MyComponent.js
import React from 'react';

function MyComponent({ data }) {
  return (
    <div className="bg-white rounded-xl p-4">
      <h3>My Component</h3>
      <p>{data}</p>
    </div>
  );
}

export default MyComponent;
```

#### 2. API Çağrısı Ekleme
```jsx
const handleMyAPI = async () => {
  try {
    const response = await axios.post(`${API_URL}/my-endpoint`, {
      data: "my data"
    });
    setResult(response.data);
  } catch (error) {
    setError(error.message);
  }
};
```

## 📁 Dosya Yapısı

```
ai-agent-template/
├── backend-python/
│   ├── app-template.py          # Ana Flask uygulaması
│   ├── requirements-template.txt # Python bağımlılıkları
│   ├── env.example              # Environment örneği
│   └── agents/                  # AI Agent'ları
├── frontend/
│   ├── src/
│   │   ├── App-template.js      # Ana React uygulaması
│   │   └── components/          # UI Bileşenleri
│   ├── package-template.json    # Node.js bağımlılıkları
│   └── tailwind.config.js       # Tailwind yapılandırması
├── scripts/
│   ├── start-services.bat       # Servis başlatma
│   └── setup-template.bat       # Kurulum scripti
├── README.md                    # Ana dokümantasyon
└── TEMPLATE_GUIDE.md           # Bu dosya
```

## 🎨 UI Özelleştirme

### Tailwind CSS Kullanımı
```jsx
// Modern card tasarımı
<div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
  <h2 className="text-xl font-bold text-gray-800 mb-4">Başlık</h2>
  <p className="text-gray-600">İçerik</p>
</div>

// Gradient button
<button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform">
  Tıkla
</button>
```

### Heroicons Kullanımı
```jsx
import { SparklesIcon, DocumentIcon } from '@heroicons/react/24/outline';

<SparklesIcon className="w-6 h-6 text-blue-500" />
```

## 🔍 Debug ve Test

### Backend Debug
```python
# app.py'de logging ekleyin
import logging
logging.basicConfig(level=logging.DEBUG)

# Endpoint'lerde log ekleyin
logger.info(f"Request received: {request.json}")
```

### Frontend Debug
```jsx
// Console log ekleyin
console.log('API Response:', response.data);

// Error handling
catch (error) {
  console.error('API Error:', error);
  setError(error.message);
}
```

### API Test
```bash
# Health check
curl http://localhost:5001/health

# File upload test
curl -X POST -F "file=@test.pdf" http://localhost:5001/analyze
```

## 🚀 Production'a Hazırlama

### 1. Environment Variables
```bash
# .env dosyasında
FLASK_ENV=production
FLASK_DEBUG=False
CORS_ORIGINS=https://yourdomain.com
```

### 2. Security
```python
# CORS'u kısıtlayın
CORS(app, origins=["https://yourdomain.com"])

# Rate limiting ekleyin
from flask_limiter import Limiter
limiter = Limiter(app)
```

### 3. Build
```bash
# Frontend build
cd frontend
npm run build

# Backend için gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## 📞 Destek

### Yaygın Sorunlar

#### 1. Port Çakışması
```bash
# Port'ları kontrol edin
netstat -ano | findstr :3003
netstat -ano | findstr :5001
```

#### 2. CORS Hatası
```python
# Backend'de CORS ayarlarını kontrol edin
CORS(app, origins="*")  # Development için
```

#### 3. API Key Hatası
```bash
# .env dosyasında API key'in doğru olduğundan emin olun
GROQ_API_KEY=your_actual_api_key
```

### Debug Komutları
```bash
# Backend logları
python app-template.py

# Frontend logları
npm start

# Port kontrolü
netstat -ano | findstr :3003
netstat -ano | findstr :5001
```

---

**Template Versiyonu**: 1.0  
**Son Güncelleme**: 2024  
**Lisans**: MIT

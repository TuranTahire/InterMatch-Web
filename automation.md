# InterMatch Otomasyon ve Agent Sistemi

## Genel Bakış

Bu dokümantasyon, InterMatch projesinin 4. aşaması olan "Otomasyon ve Ajans Mantığı" kapsamında geliştirilen agent tabanlı otomasyon sistemini açıklar.

## Sistem Mimarisi

### 1. Agent Yapısı

```
agents/
├── CvAnalysisAgent.js      # CV analiz agent'ı
├── AutomationManager.js    # Otomasyon yöneticisi
└── AgentManager.js         # Ana agent koordinatörü
```

### 2. Agent Tipleri

#### CvAnalysisAgent
- **Amaç**: CV'leri analiz etmek ve detaylı raporlar oluşturmak
- **Özellikler**:
  - LangChain tabanlı prompt zincirleri
  - JSON formatında yapılandırılmış çıktılar
  - CV iyileştirme önerileri
  - Ön yazı taslağı oluşturma

#### AutomationManager
- **Amaç**: Toplu işlemler ve otomasyon görevleri
- **Özellikler**:
  - Toplu CV analizi
  - Otomatik CV iyileştirme
  - E-posta şablonu oluşturma
  - İşlem kuyruğu yönetimi

#### AgentManager
- **Amaç**: Tüm agent'ları koordine etmek
- **Özellikler**:
  - Agent yaşam döngüsü yönetimi
  - Performans izleme
  - Aktivite logları
  - Hata yönetimi

## Kullanım Örnekleri

### 1. Temel CV Analizi

```javascript
import AgentManager from './agents/AgentManager.js';

const agentManager = new AgentManager(apiKey);

// CV analiz agent'ını başlat
const agentId = await agentManager.initializeAgent('cv_analysis');

// CV analizi yap
const analysis = await agentManager.analyzeCvWithAgent(
  cvContent,
  jobDescription,
  agentId
);

console.log('Uygunluk Puanı:', analysis.suitabilityScore);
console.log('Güçlü Yönler:', analysis.strengths);
```

### 2. Otomatik CV İyileştirme

```javascript
// Otomatik CV iyileştirme
const improvement = await agentManager.autoImproveCvWithAgent(
  originalCv,
  jobDescription,
  agentId
);

console.log('İyileştirilmiş CV:', improvement.improvedCv);
console.log('Ön Yazı:', improvement.coverLetter);
```

### 3. Toplu İşlem

```javascript
const cvList = [
  { id: 'cv1', name: 'Ahmet Yılmaz', content: '...' },
  { id: 'cv2', name: 'Ayşe Demir', content: '...' },
];

const batchResult = await agentManager.batchProcessWithAgent(
  cvList,
  jobDescription,
  agentId
);

console.log('Başarı Oranı:', batchResult.summary.successRate);
```

### 4. E-posta Şablonu Oluşturma

```javascript
const email = await agentManager.generateEmailWithAgent(
  cvContent,
  jobDescription,
  'application', // emailType: application, followUp, thankYou
  agentId
);

console.log('Konu:', email.subject);
console.log('İçerik:', email.content);
```

## Otomasyon Özellikleri

### 1. İşlem Kuyruğu
- Asenkron görev yönetimi
- Rate limiting (API çağrı sınırlaması)
- Hata toleransı
- Durum takibi

### 2. Performans İzleme
- Agent aktivite logları
- Başarı/hata oranları
- İşlem süreleri
- Kaynak kullanımı

### 3. Hata Yönetimi
- Otomatik yeniden deneme
- Graceful degradation
- Detaylı hata raporlama
- Fallback mekanizmaları

## API Entegrasyonu

### Google Gemini AI
- Model: `gemini-1.5-flash`
- Temperature: 0.7
- Max tokens: 500
- JSON çıktı formatı

### LangChain Framework
- PromptTemplate kullanımı
- RunnableSequence zincirleri
- StringOutputParser
- Error handling

## Güvenlik ve Performans

### Güvenlik
- API anahtarı yönetimi
- Input validation
- Rate limiting
- Error sanitization

### Performans
- Asenkron işlemler
- Memory management
- Log rotation
- Resource cleanup

## Gelecek Geliştirmeler

### 1. Yeni Agent Tipleri
- İş ilanı analiz agent'ı
- Mülakat hazırlık agent'ı
- Kariyer planlama agent'ı

### 2. Gelişmiş Otomasyon
- Zamanlanmış görevler
- Webhook entegrasyonu
- Real-time bildirimler
- Dashboard entegrasyonu

### 3. Machine Learning
- Model fine-tuning
- A/B testing
- Performance optimization
- Custom embeddings

## Kurulum ve Çalıştırma

### Gereksinimler
```bash
npm install langchain @langchain/google-genai @langchain/core
```

### Environment Variables
```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

### Başlatma
```javascript
// Agent sistemini başlat
const agentManager = new AgentManager(process.env.REACT_APP_GEMINI_API_KEY);

// İlk agent'ı başlat
const agentId = await agentManager.initializeAgent('cv_analysis');
```

## Sorun Giderme

### Yaygın Hatalar
1. **API Key Hatası**: Gemini API anahtarını kontrol edin
2. **Rate Limiting**: İşlemler arası bekleme sürelerini artırın
3. **Memory Issues**: Log sayısını sınırlayın
4. **Network Errors**: CORS ve proxy ayarlarını kontrol edin

### Debug Modu
```javascript
// Debug loglarını etkinleştir
console.log('Agent Stats:', agentManager.getAgentStats());
console.log('Queue Status:', agentManager.getQueueStatus());
console.log('Agent History:', agentManager.getAgentHistory());
```

## Katkıda Bulunma

1. Yeni agent tipleri ekleyin
2. Mevcut agent'ları geliştirin
3. Test coverage'ı artırın
4. Dokümantasyonu güncelleyin

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
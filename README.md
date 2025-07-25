# InterMatch - AI Destekli İş ve Özgeçmiş Eşleştirme Platformu

## 📋 Proje Açıklaması

InterMatch, iş ilanları ile özgeçmişleri karşılaştırarak uygunluk analizi yapan yapay zeka destekli bir web uygulamasıdır. Google Gemini AI kullanarak detaylı analiz sonuçları üretir.

## ✨ Özellikler

- 🤖 **AI Destekli Analiz**: Google Gemini API ile profesyonel analiz
- 📊 **Uygunluk Puanı**: 0-100 arası detaylı puanlama
- 🔍 **Anahtar Kelime Analizi**: Eksik ve eşleşen becerileri tespit eder
- 💡 **Kişiselleştirilmiş Öneriler**: İyileştirme alanları ve ipuçları
- 🛡️ **Fallback Sistemi**: API hatası durumunda akıllı simülasyon
- 📱 **Responsive Tasarım**: Mobil ve masaüstü uyumlu

## 🚀 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone [repository-url]
cd intermatch-web
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Uygulamayı başlatın:**
```bash
npm start
```

4. **Tarayıcıda açın:**
```
http://localhost:3000
```

## 🎯 Kullanım

1. **İş İlanı Metnini** girin (kopyalayıp yapıştırın)
2. **Özgeçmiş Metninizi** girin
3. **"Uygunluğu Yapay Zeka ile Analiz Et"** butonuna tıklayın
4. **Detaylı analiz sonuçlarını** inceleyin

## 🔧 Teknik Detaylar

### AI Entegrasyonu
- **Primary**: Google Gemini API (gemini-1.5-flash)
- **Fallback**: Akıllı simülasyon algoritması
- **JSON Response**: Yapılandırılmış analiz sonuçları

### Teknolojiler
- **Frontend**: React.js
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Build**: Create React App

### Proje Yapısı
```
src/
├── App.js          # Ana uygulama bileşeni
├── index.js        # Giriş noktası
└── index.css       # Global stiller
```

## 📊 Analiz Sonuçları

Uygulama şu bilgileri sağlar:
- **Uygunluk Puanı**: 0-100 arası yüzde
- **Eksik Anahtar Kelimeler**: İş ilanında olup özgeçmişte olmayan beceriler
- **Vurgulanması Gereken Alanlar**: İyileştirme önerileri
- **Genel İpuçları**: Kişiselleştirilmiş tavsiyeler

## 🔑 API Konfigürasyonu

Gemini API key'i `src/App.js` dosyasında tanımlanmıştır:
```javascript
const apiKey = 'YOUR_GEMINI_API_KEY';
```

## 🛠️ Geliştirme

### Yeni Özellik Ekleme
1. `src/App.js` dosyasını düzenleyin
2. Yeni state'ler ve fonksiyonlar ekleyin
3. UI bileşenlerini güncelleyin

### Test Etme
```bash
npm test
```

### Production Build
```bash
npm run build
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📞 İletişim

https://github.com/TuranTahire/InterMatch-Web.git

---

**InterMatch** - İş ve özgeçmiş eşleştirme platformu 🚀

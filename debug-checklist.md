# 🔍 Server Hata Algılama Checklist'i

## 1. Port Çakışması Kontrolü
```bash
# Tüm portları kontrol et
netstat -ano | findstr :3000
netstat -ano | findstr :3001  
netstat -ano | findstr :3002
netstat -ano | findstr :5000
netstat -ano | findstr :5002

# Node.js process'lerini bul
tasklist | findstr node

# Tüm Node.js process'lerini sonlandır
taskkill /f /im node.exe
```

## 2. Dosya Yolu Kontrolü
```bash
# Backend dosyalarını kontrol et
dir backend\agent-server.js
dir backend\server.js
dir backend\package.json

# Frontend dosyalarını kontrol et
dir package.json
dir src\App.js
```

## 3. Dizin Kontrolü
```bash
# Hangi dizinde olduğunu kontrol et
pwd
cd backend  # Backend için
cd ..       # Ana dizin için
```

## 4. Server Başlatma Sırası
```bash
# 1. Backend başlat
cd backend
node agent-server.js

# 2. Yeni terminal aç ve frontend başlat
cd ..
npm start
```

## 5. Hata Kodları ve Çözümleri

### EADDRINUSE (Port kullanımda)
**Hata:** `Error: listen EADDRINUSE: address already in use :::5002`
**Çözüm:** 
- `taskkill /f /im node.exe`
- Port'u kontrol et: `netstat -ano | findstr :5002`

### MODULE_NOT_FOUND (Dosya bulunamadı)
**Hata:** `Error: Cannot find module 'agent-server.js'`
**Çözüm:**
- Doğru dizinde olduğunu kontrol et: `pwd`
- Dosya varlığını kontrol et: `dir agent-server.js`
- Backend dizinine geç: `cd backend`

### ERR_CONNECTION_REFUSED (Bağlantı reddedildi)
**Hata:** `Failed to load resource: net::ERR_CONNECTION_REFUSED`
**Çözüm:**
- Backend server'ın çalıştığını kontrol et
- Port'u test et: `curl http://localhost:5002/api/health`

## 6. Otomatik Test Script'leri

### Port Kontrol Script'i
```javascript
// simple-check.js
const net = require('net');

async function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve({ port, available: false });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ port, available: true });
    });
    
    socket.connect(port, 'localhost');
  });
}

// Kullanım
checkPort(5002).then(result => {
  console.log(`Port ${result.port}: ${result.available ? 'Boş' : 'Kullanımda'}`);
});
```

### Server Health Check
```javascript
// health-check.js
const http = require('http');

function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode < 400 });
    });
    
    req.on('error', () => {
      resolve({ status: 'ERROR', ok: false });
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ status: 'TIMEOUT', ok: false });
    });
  });
}

// Kullanım
checkServer('http://localhost:5002/api/health').then(result => {
  console.log(`Backend: ${result.ok ? 'Çalışıyor' : 'Çalışmıyor'}`);
});
```

## 7. Debug Komutları

### PowerShell Komutları
```powershell
# Port kontrolü
netstat -ano | findstr :5002

# Process kontrolü
tasklist | findstr node

# HTTP test
Invoke-WebRequest -Uri "http://localhost:5002/api/health" -UseBasicParsing

# Dizin kontrolü
Get-Location
```

### Node.js Debug
```javascript
// Debug modunda çalıştır
node --inspect agent-server.js

// Console.log ekle
console.log('🔍 Debug:', { port: PORT, dir: __dirname });
```

## 8. Yaygın Hata Senaryoları

### Senaryo 1: Port Çakışması
**Belirtiler:**
- `EADDRINUSE` hatası
- Server başlamıyor
- Port zaten kullanımda

**Çözüm:**
1. `taskkill /f /im node.exe`
2. Port'ları kontrol et
3. Server'ı yeniden başlat

### Senaryo 2: Yanlış Dizin
**Belirtiler:**
- `MODULE_NOT_FOUND` hatası
- Dosya bulunamıyor
- Yanlış dizinde çalıştırma

**Çözüm:**
1. `pwd` ile dizini kontrol et
2. Doğru dizine geç: `cd backend`
3. Dosya varlığını kontrol et

### Senaryo 3: Backend Çalışmıyor
**Belirtiler:**
- `ERR_CONNECTION_REFUSED`
- Frontend backend'e bağlanamıyor
- Health check başarısız

**Çözüm:**
1. Backend server'ı başlat
2. Health endpoint'ini test et
3. Port'u kontrol et

## 9. Önleyici Tedbirler

### Otomatik Temizlik
```javascript
// Her başlangıçta temizlik yap
process.on('SIGINT', () => {
  console.log('🧹 Temizlik yapılıyor...');
  // Process'leri sonlandır
  process.exit(0);
});
```

### Graceful Shutdown
```javascript
// Server'ı düzgün kapat
app.listen(PORT, () => {
  console.log(`Server çalışıyor: ${PORT}`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log('⚠️ Port kullanımda, temizlik yapılıyor...');
    // Temizlik işlemleri
  }
});
```

## 10. Monitoring ve Logging

### Log Seviyeleri
```javascript
const logLevels = {
  ERROR: '❌',
  WARN: '⚠️', 
  INFO: 'ℹ️',
  DEBUG: '🔍',
  SUCCESS: '✅'
};

function log(level, message, data = {}) {
  console.log(`${logLevels[level]} ${message}`, data);
}
```

### Health Monitoring
```javascript
// Düzenli health check
setInterval(async () => {
  try {
    const response = await fetch('http://localhost:5002/api/health');
    if (!response.ok) {
      log('ERROR', 'Backend health check başarısız');
    }
  } catch (error) {
    log('ERROR', 'Backend erişilemiyor', error.message);
  }
}, 30000); // 30 saniyede bir
``` 
// Port Checker ve Server Health Monitor
const net = require('net');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class PortChecker {
  constructor() {
    this.ports = [3000, 3001, 3002, 5000, 5002];
    this.processes = [];
  }

  // Port'un kullanımda olup olmadığını kontrol et
  async checkPort(port) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1000);

      socket.on('connect', () => {
        socket.destroy();
        resolve({ port, status: 'in-use', available: false });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ port, status: 'available', available: true });
      });

      socket.on('error', () => {
        resolve({ port, status: 'available', available: true });
      });

      socket.connect(port, 'localhost');
    });
  }

  // Tüm portları kontrol et
  async checkAllPorts() {
    console.log('🔍 Port durumları kontrol ediliyor...\n');
    
    const results = [];
    for (const port of this.ports) {
      const result = await this.checkPort(port);
      results.push(result);
      
      const status = result.available ? '✅ Boş' : '❌ Kullanımda';
      console.log(`Port ${port}: ${status}`);
    }
    
    return results;
  }

  // Node.js process'lerini bul
  async findNodeProcesses() {
    return new Promise((resolve) => {
      exec('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', (error, stdout) => {
        if (error) {
          resolve([]);
          return;
        }
        
        const lines = stdout.split('\n').slice(1); // Header'ı atla
        const processes = lines
          .filter(line => line.trim() && !line.includes('INFO'))
          .map(line => {
            const parts = line.split(',');
            return {
              name: parts[0]?.replace(/"/g, ''),
              pid: parts[1]?.replace(/"/g, ''),
              memory: parts[4]?.replace(/"/g, '')
            };
          });
        
        resolve(processes);
      });
    });
  }

  // Dosya varlığını kontrol et
  checkFileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  // Backend dosyalarını kontrol et
  checkBackendFiles() {
    const backendPath = path.join(__dirname, 'backend');
    const files = [
      'agent-server.js',
      'server.js',
      'package.json'
    ];

    console.log('\n📁 Backend dosyaları kontrol ediliyor...');
    
    const results = {};
    for (const file of files) {
      const filePath = path.join(backendPath, file);
      const exists = this.checkFileExists(filePath);
      results[file] = exists;
      
      const status = exists ? '✅ Var' : '❌ Yok';
      console.log(`${file}: ${status}`);
    }
    
    return results;
  }

  // HTTP endpoint'lerini test et
  async testEndpoints() {
    const endpoints = [
      { url: 'http://localhost:5002/api/health', name: 'Backend Health' },
      { url: 'http://localhost:3000', name: 'Frontend (3000)' },
      { url: 'http://localhost:3001', name: 'Frontend (3001)' },
      { url: 'http://localhost:3002', name: 'Frontend (3002)' }
    ];

    console.log('\n🌐 HTTP endpoint\'leri test ediliyor...');
    
    const results = [];
    for (const endpoint of endpoints) {
      try {
        // Node.js 18+ için fetch kullan, yoksa http modülü kullan
        let response;
        if (typeof fetch !== 'undefined') {
          response = await fetch(endpoint.url, { 
            method: 'GET',
            timeout: 3000 
          });
        } else {
          // Fallback için basit kontrol
          const http = require('http');
          response = await new Promise((resolve, reject) => {
            const req = http.get(endpoint.url, (res) => {
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
        
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: response.status || response.statusCode,
          available: response.ok
        });
        console.log(`${endpoint.name}: ${response.ok ? '✅ Çalışıyor' : '❌ Hata'}`);
      } catch (error) {
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'ERROR',
          available: false,
          error: error.message
        });
        console.log(`${endpoint.name}: ❌ Erişilemiyor`);
      }
    }
    
    return results;
  }

  // Kapsamlı sistem kontrolü
  async fullSystemCheck() {
    console.log('🚀 Kapsamlı Sistem Kontrolü Başlatılıyor...\n');
    
    // 1. Port kontrolü
    const portResults = await this.checkAllPorts();
    
    // 2. Node.js process'leri
    const nodeProcesses = await this.findNodeProcesses();
    console.log(`\n🤖 Node.js Process'leri: ${nodeProcesses.length} adet`);
    
    // 3. Backend dosyaları
    const fileResults = this.checkBackendFiles();
    
    // 4. HTTP endpoint'leri
    const endpointResults = await this.testEndpoints();
    
    // 5. Özet rapor
    this.generateReport(portResults, nodeProcesses, fileResults, endpointResults);
  }

  // Rapor oluştur
  generateReport(portResults, nodeProcesses, fileResults, endpointResults) {
    console.log('\n📊 SİSTEM RAPORU');
    console.log('='.repeat(50));
    
    // Port durumu
    const usedPorts = portResults.filter(p => !p.available);
    const availablePorts = portResults.filter(p => p.available);
    
    console.log(`\n🔌 Port Durumu:`);
    console.log(`   Kullanımda: ${usedPorts.length} port`);
    console.log(`   Boş: ${availablePorts.length} port`);
    
    // Process durumu
    console.log(`\n🤖 Process Durumu:`);
    console.log(`   Node.js Process'leri: ${nodeProcesses.length} adet`);
    
    // Dosya durumu
    const missingFiles = Object.entries(fileResults).filter(([file, exists]) => !exists);
    console.log(`\n📁 Dosya Durumu:`);
    console.log(`   Eksik dosyalar: ${missingFiles.length} adet`);
    
    // Endpoint durumu
    const workingEndpoints = endpointResults.filter(e => e.available);
    console.log(`\n🌐 Endpoint Durumu:`);
    console.log(`   Çalışan: ${workingEndpoints.length} endpoint`);
    console.log(`   Çalışmayan: ${endpointResults.length - workingEndpoints.length} endpoint`);
    
    // Öneriler
    console.log(`\n💡 ÖNERİLER:`);
    
    if (usedPorts.length > 0) {
      console.log(`   - Kullanımda olan portlar: ${usedPorts.map(p => p.port).join(', ')}`);
    }
    
    if (missingFiles.length > 0) {
      console.log(`   - Eksik dosyalar: ${missingFiles.map(([file]) => file).join(', ')}`);
    }
    
    if (workingEndpoints.length === 0) {
      console.log(`   - Hiçbir endpoint çalışmıyor. Server'ları başlatın.`);
    }
    
    console.log('\n' + '='.repeat(50));
  }

  // Otomatik temizlik
  async cleanup() {
    console.log('\n🧹 Otomatik temizlik başlatılıyor...');
    
    const nodeProcesses = await this.findNodeProcesses();
    if (nodeProcesses.length > 0) {
      console.log(`${nodeProcesses.length} Node.js process'i sonlandırılıyor...`);
      
      return new Promise((resolve) => {
        exec('taskkill /f /im node.exe', (error) => {
          if (error) {
            console.log('❌ Process sonlandırma hatası:', error.message);
          } else {
            console.log('✅ Tüm Node.js process'leri sonlandırıldı');
          }
          resolve();
        });
      });
    } else {
      console.log('✅ Temizlik gerekli değil - Node.js process'i yok');
    }
  }
}

// Script'i çalıştır
async function main() {
  const checker = new PortChecker();
  
  // Komut satırı argümanları
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    await checker.cleanup();
  } else if (args.includes('--ports-only')) {
    await checker.checkAllPorts();
  } else {
    await checker.fullSystemCheck();
  }
}

// Script'i çalıştır
if (require.main === module) {
  main().catch(console.error);
}

module.exports = PortChecker; 
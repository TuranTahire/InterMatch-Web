// Otomatik Server Başlatma Script'i
const { spawn } = require('child_process');
const path = require('path');
const PortChecker = require('./port-checker');

class ServerManager {
  constructor() {
    this.portChecker = new PortChecker();
    this.processes = [];
  }

  // Backend server'ı başlat
  async startBackend() {
    console.log('🚀 Backend server başlatılıyor...');
    
    return new Promise((resolve, reject) => {
      const backendPath = path.join(__dirname, 'backend');
      const backendProcess = spawn('node', ['agent-server.js'], {
        cwd: backendPath,
        stdio: 'pipe'
      });

      backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Backend] ${output.trim()}`);
        
        if (output.includes('Real LangChain Agent Server çalışıyor')) {
          console.log('✅ Backend server başarıyla başlatıldı!');
          this.processes.push({
            name: 'Backend',
            process: backendProcess,
            port: 5002
          });
          resolve(backendProcess);
        }
      });

      backendProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error(`[Backend Error] ${error.trim()}`);
        
        if (error.includes('EADDRINUSE')) {
          console.log('⚠️ Port 5002 kullanımda. Temizlik yapılıyor...');
          this.cleanup().then(() => {
            this.startBackend().then(resolve).catch(reject);
          });
        }
      });

      backendProcess.on('error', (error) => {
        console.error('❌ Backend başlatma hatası:', error.message);
        reject(error);
      });

      // 30 saniye timeout
      setTimeout(() => {
        if (!this.processes.find(p => p.name === 'Backend')) {
          backendProcess.kill();
          reject(new Error('Backend başlatma zaman aşımı'));
        }
      }, 30000);
    });
  }

  // Frontend server'ı başlat
  async startFrontend(port = 3000) {
    console.log(`🚀 Frontend server başlatılıyor (Port: ${port})...`);
    
    return new Promise((resolve, reject) => {
      const frontendProcess = spawn('npm', ['start'], {
        cwd: __dirname,
        stdio: 'pipe',
        env: { ...process.env, PORT: port.toString() }
      });

      frontendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Frontend] ${output.trim()}`);
        
        if (output.includes('Local:') && output.includes('localhost:')) {
          console.log('✅ Frontend server başarıyla başlatıldı!');
          this.processes.push({
            name: 'Frontend',
            process: frontendProcess,
            port: port
          });
          resolve(frontendProcess);
        }
      });

      frontendProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error(`[Frontend Error] ${error.trim()}`);
        
        if (error.includes('EADDRINUSE')) {
          console.log(`⚠️ Port ${port} kullanımda. Farklı port deneniyor...`);
          this.startFrontend(port + 1).then(resolve).catch(reject);
        }
      });

      frontendProcess.on('error', (error) => {
        console.error('❌ Frontend başlatma hatası:', error.message);
        reject(error);
      });

      // 60 saniye timeout
      setTimeout(() => {
        if (!this.processes.find(p => p.name === 'Frontend')) {
          frontendProcess.kill();
          reject(new Error('Frontend başlatma zaman aşımı'));
        }
      }, 60000);
    });
  }

  // Tüm server'ları başlat
  async startAllServers() {
    console.log('🎯 Tüm server\'lar başlatılıyor...\n');
    
    try {
      // 1. Sistem kontrolü
      await this.portChecker.fullSystemCheck();
      
      // 2. Temizlik (gerekirse)
      const nodeProcesses = await this.portChecker.findNodeProcesses();
      if (nodeProcesses.length > 0) {
        console.log('\n🧹 Mevcut process\'ler temizleniyor...');
        await this.portChecker.cleanup();
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekle
      }
      
      // 3. Backend başlat
      await this.startBackend();
      
      // 4. Backend'in hazır olmasını bekle
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 5. Frontend başlat
      await this.startFrontend();
      
      // 6. Final kontrol
      await this.finalCheck();
      
      console.log('\n🎉 Tüm server\'lar başarıyla başlatıldı!');
      console.log('📋 Kullanım:');
      console.log('   - Backend: http://localhost:5002');
      console.log('   - Frontend: http://localhost:3000 (veya belirtilen port)');
      
    } catch (error) {
      console.error('❌ Server başlatma hatası:', error.message);
      await this.cleanup();
      process.exit(1);
    }
  }

  // Final kontrol
  async finalCheck() {
    console.log('\n🔍 Final kontrol yapılıyor...');
    
    const endpoints = [
      { url: 'http://localhost:5002/api/health', name: 'Backend' },
      { url: 'http://localhost:3000', name: 'Frontend' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, { timeout: 5000 });
        if (response.ok) {
          console.log(`✅ ${endpoint.name} çalışıyor`);
        } else {
          console.log(`⚠️ ${endpoint.name} yanıt veriyor ama hata kodu: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name} erişilemiyor: ${error.message}`);
      }
    }
  }

  // Temizlik
  async cleanup() {
    console.log('🧹 Temizlik yapılıyor...');
    
    for (const proc of this.processes) {
      try {
        proc.process.kill();
        console.log(`✅ ${proc.name} process'i sonlandırıldı`);
      } catch (error) {
        console.log(`⚠️ ${proc.name} process'i sonlandırılamadı: ${error.message}`);
      }
    }
    
    this.processes = [];
    await this.portChecker.cleanup();
  }

  // Graceful shutdown
  async shutdown() {
    console.log('\n🛑 Server\'lar kapatılıyor...');
    await this.cleanup();
    process.exit(0);
  }
}

// Ana fonksiyon
async function main() {
  const manager = new ServerManager();
  
  // Graceful shutdown handlers
  process.on('SIGINT', () => manager.shutdown());
  process.on('SIGTERM', () => manager.shutdown());
  
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    await manager.cleanup();
  } else if (args.includes('--backend-only')) {
    await manager.startBackend();
  } else if (args.includes('--frontend-only')) {
    await manager.startFrontend();
  } else {
    await manager.startAllServers();
  }
}

// Script'i çalıştır
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ServerManager; 
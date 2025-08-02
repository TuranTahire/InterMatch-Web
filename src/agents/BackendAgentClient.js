// Backend Agent Client - Real LangChain Agent'a bağlanır
class BackendAgentClient {
  constructor(backendUrl = 'http://localhost:5002') {
    this.backendUrl = backendUrl;
    this.isReady = false;
    this.currentTask = null;
    this.connectionStatus = 'disconnected';
  }

  async initialize() {
    try {
      console.log('🤖 Backend Agent Client başlatılıyor...');
      console.log('🔗 Backend URL:', this.backendUrl);
      
      // Health check
      const response = await fetch(`${this.backendUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000 // 5 saniye timeout
      });
      
      if (!response.ok) {
        throw new Error(`Backend health check failed: ${response.status} ${response.statusText}`);
      }
      
      const health = await response.json();
      console.log('✅ Backend Agent Server:', health.message);
      console.log('📊 Server Status:', health.status);
      
      this.isReady = true;
      this.connectionStatus = 'connected';
      return true;
    } catch (error) {
      console.error('❌ Backend Agent Client başlatma hatası:', error);
      this.connectionStatus = 'error';
      this.isReady = false;
      
      // Detaylı hata bilgisi
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🌐 Ağ bağlantısı sorunu - Backend server çalışmıyor olabilir');
        console.error('💡 Çözüm: Backend server\'ı başlatın: cd backend && node agent-server.js');
      }
      
      return false;
    }
  }

  async runTask(task, context = {}) {
    try {
      if (!this.isReady) {
        await this.initialize();
      }

      console.log('🤖 Backend Agent görevi başlatılıyor:', task);
      this.currentTask = task;

      const response = await fetch(`${this.backendUrl}/api/agent/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task, context }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Backend Agent görevi tamamlandı');
      return result;
      
    } catch (error) {
      console.error('❌ Backend Agent görevi hatası:', error);
      return { error: error.message };
    }
  }

  async comprehensiveAnalysis(cvText, jobDescription, companyName = "", position = "") {
    try {
      console.log('🤖 Backend Agent kapsamlı analiz başlatılıyor...');

      const response = await fetch(`${this.backendUrl}/api/agent/comprehensive-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvText, jobDescription, companyName, position }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Backend Agent kapsamlı analiz tamamlandı');
      return result;
      
    } catch (error) {
      console.error('❌ Backend Agent kapsamlı analiz hatası:', error);
      return { error: error.message };
    }
  }

  async getConversationHistory() {
    try {
      const response = await fetch(`${this.backendUrl}/api/agent/history`);
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Conversation history alma hatası:', error);
      return [];
    }
  }

  async clearMemory() {
    try {
      const response = await fetch(`${this.backendUrl}/api/agent/clear-memory`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      const result = await response.json();
      console.log('✅ Backend Agent belleği temizlendi:', result.message);
      return result;
    } catch (error) {
      console.error('❌ Memory temizleme hatası:', error);
      return { error: error.message };
    }
  }

  getAgentStatus() {
    return {
      isReady: this.isReady,
      currentTask: this.currentTask,
      backendUrl: this.backendUrl,
      type: 'Real LangChain Agent (Backend)'
    };
  }
}

export default BackendAgentClient; 
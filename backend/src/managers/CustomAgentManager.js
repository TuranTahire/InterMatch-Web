import { CvAnalysisAgent } from '../agents/CvAnalysisAgent.js';
import { ApplicationAssistantAgent } from '../agents/ApplicationAssistantAgent.js';
import { ReActCvAnalysisAgent } from '../agents/ReActCvAnalysisAgent.js';

class CustomAgentManager {
  constructor() {
    this.agents = new Map(); // Aktif agent'ları saklamak için
    this.conversationHistory = []; // Konuşma geçmişi
    this.systemConfig = {
      maxAgents: 10,
      maxHistorySize: 1000,
      autoCleanup: true
    };
  }

  // Agent kaydetme
  registerAgent(name, agentInstance) {
    if (this.agents.size >= this.systemConfig.maxAgents) {
      throw new Error(`Maksimum agent sayısına ulaşıldı: ${this.systemConfig.maxAgents}`);
    }

    this.agents.set(name, agentInstance);
    console.log(`🤖 Agent kaydedildi: ${name}`);
    
    return {
      success: true,
      agentName: name,
      totalAgents: this.agents.size
    };
  }

  // Agent çalıştırma
  async runAgent(agentName, input, context = {}) {
    if (!this.agents.has(agentName)) {
      throw new Error(`Agent bulunamadı: ${agentName}`);
    }

    const agent = this.agents.get(agentName);
    const startTime = Date.now();

    try {
      console.log(`🚀 Agent çalıştırılıyor: ${agentName}`);
      console.log(`📝 Input uzunluğu: ${typeof input === 'string' ? input.length : JSON.stringify(input).length}`);
      
      // Agent'ı çalıştır
      const result = await agent.process(input, context);
      
      const processingTime = Date.now() - startTime;
      
      // Konuşma geçmişine ekle
      this.addToHistory({
        timestamp: new Date().toISOString(),
        agent: agentName,
        input: input,
        output: result,
        context: context,
        processingTime: processingTime,
        success: true
      });
      
      console.log(`✅ Agent tamamlandı: ${agentName} (${processingTime}ms)`);
      
      return {
        success: true,
        agent: agentName,
        result: result,
        metadata: {
          processingTime: processingTime,
          timestamp: new Date().toISOString(),
          agentStatus: agent.getStatus()
        }
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Hata durumunu geçmişe ekle
      this.addToHistory({
        timestamp: new Date().toISOString(),
        agent: agentName,
        input: input,
        error: error.message,
        context: context,
        processingTime: processingTime,
        success: false
      });
      
      console.error(`❌ Agent hatası (${agentName}):`, error);
      throw error;
    }
  }

  // Hızlı CV analizi - CV Analysis Agent için
  async quickCvAnalysis(cvText, jobText = '', analysisType = 'comprehensive') {
    const agentName = 'cv-analyzer';
    
    if (!this.agents.has(agentName)) {
      // Agent yoksa oluştur ve kaydet
      const cvAgent = new CvAnalysisAgent();
      this.registerAgent(agentName, cvAgent);
    }
    
    const input = {
      cvText: cvText,
      jobText: jobText
    };
    
    const context = {
      analysisType: analysisType
    };
    
    return await this.runAgent(agentName, input, context);
  }

  // Başvuru asistanı analizi - Application Assistant Agent için
  async applicationAnalysis(cvText, jobText, companyInfo = '', location = '', analysisType = 'comprehensive') {
    const agentName = 'basvuru-asistani';
    
    if (!this.agents.has(agentName)) {
      // Agent yoksa oluştur ve kaydet
      const appAgent = new ApplicationAssistantAgent();
      this.registerAgent(agentName, appAgent);
    }
    
    const input = {
      cvText: cvText,
      jobText: jobText,
      companyInfo: companyInfo,
      location: location
    };
    
    const context = {
      analysisType: analysisType
    };
    
    return await this.runAgent(agentName, input, context);
  }

  // Konuşma geçmişine ekleme
  addToHistory(entry) {
    this.conversationHistory.push(entry);
    
    // Geçmiş boyutunu kontrol et
    if (this.conversationHistory.length > this.systemConfig.maxHistorySize) {
      this.conversationHistory.shift(); // En eski entry'yi sil
    }
  }

  // Geçmişi alma
  getHistory(filters = {}) {
    let history = this.conversationHistory;
    
    if (filters.agent) {
      history = history.filter(entry => entry.agent === filters.agent);
    }
    
    if (filters.success !== undefined) {
      history = history.filter(entry => entry.success === filters.success);
    }
    
    if (filters.limit) {
      history = history.slice(-filters.limit);
    }
    
    return {
      history: history,
      total: history.length,
      filters: filters
    };
  }

  // Geçmişi temizleme
  clearHistory() {
    this.conversationHistory = [];
    console.log('🗑️ Konuşma geçmişi temizlendi');
  }

  // Agent durumunu alma
  getAgentStatus(agentName) {
    if (!this.agents.has(agentName)) {
      return null;
    }
    
    const agent = this.agents.get(agentName);
    return agent.getStatus();
  }

  // Tüm agent'ların durumunu alma
  getAllAgentsStatus() {
    const status = {};
    
    for (const [name, agent] of this.agents) {
      status[name] = agent.getStatus();
    }
    
    return status;
  }

  // Sistem durumunu alma
  getSystemStatus() {
    return {
      totalAgents: this.agents.size,
      registeredAgents: Array.from(this.agents.keys()),
      historySize: this.conversationHistory.length,
      systemConfig: this.systemConfig,
      timestamp: new Date().toISOString()
    };
  }

  // Agent'ı kaldırma
  removeAgent(agentName) {
    if (!this.agents.has(agentName)) {
      throw new Error(`Agent bulunamadı: ${agentName}`);
    }
    
    this.agents.delete(agentName);
    console.log(`🗑️ Agent kaldırıldı: ${agentName}`);
    
    return {
      success: true,
      removedAgent: agentName,
      remainingAgents: this.agents.size
    };
  }

  // Agent'ı sıfırlama
  resetAgent(agentName) {
    if (!this.agents.has(agentName)) {
      throw new Error(`Agent bulunamadı: ${agentName}`);
    }
    
    const agent = this.agents.get(agentName);
    agent.reset();
    
    console.log(`🔄 Agent sıfırlandı: ${agentName}`);
    
    return {
      success: true,
      resetAgent: agentName
    };
  }

  // Tüm agent'ları sıfırlama
  resetAllAgents() {
    for (const [name, agent] of this.agents) {
      agent.reset();
    }
    
    console.log('🔄 Tüm agent\'lar sıfırlandı');
    
    return {
      success: true,
      resetCount: this.agents.size
    };
  }

  // Sistem konfigürasyonunu güncelleme
  updateSystemConfig(newConfig) {
    this.systemConfig = { ...this.systemConfig, ...newConfig };
    console.log('⚙️ Sistem konfigürasyonu güncellendi');
    
    return {
      success: true,
      newConfig: this.systemConfig
    };
  }

  // Performans istatistikleri
  getPerformanceStats() {
    const stats = {
      totalRequests: this.conversationHistory.length,
      successfulRequests: this.conversationHistory.filter(entry => entry.success).length,
      failedRequests: this.conversationHistory.filter(entry => !entry.success).length,
      averageProcessingTime: 0,
      agentUsage: {}
    };
    
    if (stats.totalRequests > 0) {
      const totalTime = this.conversationHistory.reduce((sum, entry) => sum + (entry.processingTime || 0), 0);
      stats.averageProcessingTime = Math.round(totalTime / stats.totalRequests);
    }
    
    // Agent kullanım istatistikleri
    for (const [name, agent] of this.agents) {
      stats.agentUsage[name] = {
        totalUsage: agent.memory.length,
        lastUsed: agent.memory.length > 0 ? agent.memory[agent.memory.length - 1].timestamp : null
      };
    }
    
    return stats;
  }

  // Varsayılan agent'ları başlat
  async initializeDefaultAgents() {
    try {
      console.log('🚀 Varsayılan agent\'lar başlatılıyor...');
      
      // ReAct CV Analysis Agent (Gelişmiş)
      const reactCvAgent = new ReActCvAnalysisAgent();
      this.registerAgent('react-cv-analyzer', reactCvAgent);
      
      // Klasik CV Analysis Agent (Fallback)
      const cvAgent = new CvAnalysisAgent();
      this.registerAgent('cv-analyzer', cvAgent);
      
      // Application Assistant Agent
      const appAgent = new ApplicationAssistantAgent();
      this.registerAgent('basvuru-asistani', appAgent);
      
      console.log('✅ Varsayılan agent\'lar başarıyla başlatıldı');
      console.log('📋 Kayıtlı agent\'lar:', this.getRegisteredAgents());
      
    } catch (error) {
      console.error('❌ Varsayılan agent başlatma hatası:', error);
      throw error;
    }
  }

  // Kayıtlı agent'ları listele
  getRegisteredAgents() {
    return Array.from(this.agents.keys());
  }
}

// Singleton instance
const customAgentManager = new CustomAgentManager();
export { customAgentManager }; 
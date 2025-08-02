import CvAnalysisAgent from './CvAnalysisAgent';
import AutomationManager from './AutomationManager';

class AgentManager {
  constructor() {
    this.agents = new Map();
    this.activeAgent = null;
    this.conversationHistory = [];
  }

  // Agent'ları kaydet
  registerAgent(name, agent) {
    this.agents.set(name, agent);
    console.log(`🤖 Agent registered: ${name}`);
  }

  // Agent'ı aktif et
  activateAgent(name) {
    if (this.agents.has(name)) {
      this.activeAgent = this.agents.get(name);
      console.log(`🎯 Activated agent: ${name}`);
      return true;
    }
    return false;
  }

  // Mesaj gönder
  async sendMessage(message, context = {}) {
    if (!this.activeAgent) {
      throw new Error('No active agent');
    }

    // Konuşma geçmişine ekle
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      context
    });

    // Agent'a gönder
    const response = await this.activeAgent.process(message, context);
    
    // Yanıtı geçmişe ekle
    this.conversationHistory.push({
      role: 'agent',
      content: response,
      timestamp: new Date(),
      agentName: this.activeAgent.name
    });

    return response;
  }

  // Konuşma geçmişini al
  getConversationHistory() {
    return this.conversationHistory;
  }

  // Geçmişi temizle
  clearHistory() {
    this.conversationHistory = [];
  }

  // Tüm agent'ları listele
  getAvailableAgents() {
    return Array.from(this.agents.keys());
  }
}

export default AgentManager;
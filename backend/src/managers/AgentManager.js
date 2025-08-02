import { AgentExecutor } from "langchain/agents";

class AgentManager {
  constructor() {
    this.agents = new Map(); // Aktif ajanları saklamak için bir harita
    this.conversationHistory = []; // Konuşma geçmişi
  }

  // Sisteme bir ajan kaydeder
  registerAgent(name, agentInstance) {
    this.agents.set(name, agentInstance);
    console.log(`🤖 Ajan kaydedildi: ${name}`);
  }

  // Belirtilen ajanı çalıştırır
  async run(agentName, input) {
    if (!this.agents.has(agentName)) {
      throw new Error(`❌ Ajan bulunamadı: ${agentName}`);
    }

    const agent = this.agents.get(agentName);
    
    // AgentExecutor, ajanın düşünme-aksiyon döngüsünü yöneten çekirdektir.
    const agentExecutor = new AgentExecutor({
      agent,
      tools: agent.tools, // Ajanın tanımından araçları al
      verbose: true, // Ajanın "iç sesini" konsolda görmek için
    });

    console.log(`🚀 Ajan çalıştırılıyor: ${agentName}`);
    console.log(`📝 Input: ${input.substring(0, 100)}...`);
    
    try {
      const result = await agentExecutor.invoke({ input });
      
      // Konuşma geçmişine ekle
      this.conversationHistory.push({
        timestamp: new Date().toISOString(),
        agent: agentName,
        input: input,
        output: result.output,
        steps: result.intermediateSteps || []
      });
      
      console.log(`✅ Ajan tamamlandı: ${agentName}`);
      return result;
    } catch (error) {
      console.error(`❌ Ajan hatası (${agentName}):`, error);
      throw error;
    }
  }

  // Tüm kayıtlı ajanları listele
  getRegisteredAgents() {
    return Array.from(this.agents.keys());
  }

  // Konuşma geçmişini al
  getConversationHistory() {
    return this.conversationHistory;
  }

  // Konuşma geçmişini temizle
  clearConversationHistory() {
    this.conversationHistory = [];
    console.log("🗑️ Konuşma geçmişi temizlendi");
  }

  // Belirli bir ajanın geçmişini al
  getAgentHistory(agentName) {
    return this.conversationHistory.filter(entry => entry.agent === agentName);
  }

  // Ajan durumunu kontrol et
  isAgentRegistered(agentName) {
    return this.agents.has(agentName);
  }

  // Ajan sayısını al
  getAgentCount() {
    return this.agents.size;
  }

  // Sistem durumunu al
  getSystemStatus() {
    return {
      totalAgents: this.getAgentCount(),
      registeredAgents: this.getRegisteredAgents(),
      conversationHistoryLength: this.conversationHistory.length,
      status: "active"
    };
  }
}

// Singleton pattern: Uygulama boyunca tek bir yönetici örneği olmasını sağlar
const agentManager = new AgentManager();
export { agentManager }; 
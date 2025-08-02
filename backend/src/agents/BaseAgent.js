// Base Agent Class - Tüm agent'ların temel sınıfı
class BaseAgent {
  constructor(name, description, capabilities = []) {
    this.name = name;
    this.description = description;
    this.capabilities = capabilities;
    this.tools = new Map(); // Agent'ın kullanabileceği araçlar
    this.memory = []; // Agent'ın hafızası
    this.config = {
      maxMemorySize: 100, // Maksimum hafıza boyutu
      temperature: 0.3, // AI yaratıcılık seviyesi
      maxRetries: 3 // Maksimum deneme sayısı
    };
  }

  // Araç ekleme
  addTool(name, tool) {
    this.tools.set(name, tool);
    console.log(`🔧 Tool eklendi: ${name} -> ${this.name} agent'ına`);
  }

  // Araç kaldırma
  removeTool(name) {
    this.tools.delete(name);
    console.log(`🗑️ Tool kaldırıldı: ${name} -> ${this.name} agent'ından`);
  }

  // Hafızaya ekleme
  addToMemory(entry) {
    this.memory.push({
      timestamp: new Date().toISOString(),
      ...entry
    });

    // Hafıza boyutunu kontrol et
    if (this.memory.length > this.config.maxMemorySize) {
      this.memory.shift(); // En eski entry'yi sil
    }
  }

  // Hafızayı temizleme
  clearMemory() {
    this.memory = [];
    console.log(`🧹 Hafıza temizlendi: ${this.name}`);
  }

  // Hafızadan bilgi alma
  getFromMemory(query) {
    return this.memory.filter(entry => 
      entry.content && entry.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Araç çalıştırma
  async executeTool(toolName, input) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool bulunamadı: ${toolName}`);
    }

    try {
      console.log(`🔧 Tool çalıştırılıyor: ${toolName}`);
      const result = await tool.execute(input);
      
      // Hafızaya ekle
      this.addToMemory({
        type: 'tool_execution',
        tool: toolName,
        input: input,
        output: result
      });

      return result;
    } catch (error) {
      console.error(`❌ Tool hatası (${toolName}):`, error);
      throw error;
    }
  }

  // Ana işlem metodu - Her agent'ın override etmesi gereken
  async process(input, context = {}) {
    throw new Error('process() metodu override edilmeli');
  }

  // Agent durumunu alma
  getStatus() {
    return {
      name: this.name,
      description: this.description,
      capabilities: this.capabilities,
      toolsCount: this.tools.size,
      memorySize: this.memory.length,
      config: this.config
    };
  }

  // Agent'ı sıfırlama
  reset() {
    this.clearMemory();
    console.log(`🔄 Agent sıfırlandı: ${this.name}`);
  }
}

export { BaseAgent }; 
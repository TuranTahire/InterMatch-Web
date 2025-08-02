// Base Tool Class - Tüm araçların temel sınıfı
class BaseTool {
  constructor(name, description, parameters = {}) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
    this.usageCount = 0;
    this.lastUsed = null;
    this.errorCount = 0;
  }

  // Ana çalıştırma metodu - Her tool'un override etmesi gereken
  async execute(input) {
    throw new Error('execute() metodu override edilmeli');
  }

  // Tool kullanımını kaydet
  recordUsage(success = true) {
    this.usageCount++;
    this.lastUsed = new Date().toISOString();
    
    if (!success) {
      this.errorCount++;
    }
  }

  // Tool durumunu alma
  getStatus() {
    return {
      name: this.name,
      description: this.description,
      usageCount: this.usageCount,
      lastUsed: this.lastUsed,
      errorCount: this.errorCount,
      successRate: this.usageCount > 0 ? 
        ((this.usageCount - this.errorCount) / this.usageCount * 100).toFixed(2) : 0
    };
  }

  // Tool'u sıfırlama
  reset() {
    this.usageCount = 0;
    this.lastUsed = null;
    this.errorCount = 0;
    console.log(`🔄 Tool sıfırlandı: ${this.name}`);
  }

  // Input validasyonu
  validateInput(input) {
    if (!input) {
      throw new Error('Input gerekli');
    }
    return true;
  }

  // Güvenli çalıştırma wrapper'ı
  async safeExecute(input) {
    try {
      this.validateInput(input);
      const result = await this.execute(input);
      this.recordUsage(true);
      return result;
    } catch (error) {
      this.recordUsage(false);
      throw error;
    }
  }
}

export { BaseTool }; 
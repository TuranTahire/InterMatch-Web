import { BaseAgent } from './BaseAgent.js';
import { GeminiService } from '../services/geminiService.js';

// ReAct Agent - Reasoning + Acting + Learning
class ReActAgent extends BaseAgent {
  constructor(name, description, capabilities = []) {
    super(name, description, capabilities);
    
    // ReAct özel konfigürasyonu
    this.config = {
      ...this.config,
      maxReasoningSteps: 5,        // Maksimum akıl yürütme adımı
      maxActionAttempts: 3,        // Maksimum aksiyon deneme sayısı
      learningEnabled: true,       // Öğrenme aktif mi?
      reflectionEnabled: true,     // Yansıma aktif mi?
      temperature: 0.7,            // Yaratıcılık seviyesi
      reasoningPrompt: this.getDefaultReasoningPrompt()
    };
    
    // ReAct state'i
    this.reasoningChain = [];      // Akıl yürütme zinciri
    this.actionHistory = [];       // Aksiyon geçmişi
    this.learningMemory = [];      // Öğrenme hafızası
    this.reflectionLog = [];       // Yansıma log'u
    
    // AI servisi
    this.aiService = new GeminiService();
  }

  // ReAct ana işlem döngüsü
  async process(input, context = {}) {
    console.log(`🧠 ReAct Agent başlatılıyor: ${this.name}`);
    
    try {
      // 1. REASONING: Durumu analiz et ve plan oluştur
      const reasoning = await this.reason(input, context);
      
      // 2. ACTING: Planı uygula
      const action = await this.act(reasoning, input, context);
      
      // 3. LEARNING: Sonuçları öğren ve yansıma yap
      const learning = await this.learn(reasoning, action, input, context);
      
      // 4. REFLECTION: Performansı değerlendir
      const reflection = await this.reflect(reasoning, action, learning, context);
      
      // Sonucu formatla
      const result = {
        type: 'react_result',
        reasoning: reasoning,
        action: action,
        learning: learning,
        reflection: reflection,
        timestamp: new Date().toISOString(),
        agent: this.name
      };
      
      // Hafızaya ekle
      this.addToMemory({
        type: 'react_completed',
        input: input,
        result: result
      });
      
      console.log(`✅ ReAct Agent tamamlandı: ${this.name}`);
      return result;
      
    } catch (error) {
      console.error(`❌ ReAct Agent hatası: ${this.name}`, error);
      
      // Hata durumunda yansıma yap
      await this.reflectOnError(error, input, context);
      throw error;
    }
  }

  // REASONING: Akıl yürütme ve planlama
  async reason(input, context) {
    console.log(`🤔 Reasoning başlatılıyor...`);
    
    const reasoningPrompt = `
${this.config.reasoningPrompt}

GÖREV: ${context.task || 'Analiz yap'}
GİRDİ: ${JSON.stringify(input, null, 2)}
BAĞLAM: ${JSON.stringify(context, null, 2)}

MEVCUT ARAÇLAR: ${Array.from(this.tools.keys()).join(', ')}

Lütfen şu adımları takip et:
1. Durumu analiz et
2. Gerekli aksiyonları belirle
3. Araç seçimini yap
4. Plan oluştur

Yanıtını şu formatta ver:
{
  "analysis": "Durum analizi",
  "required_actions": ["aksiyon1", "aksiyon2"],
  "tool_selection": "seçilen_araç",
  "plan": "Detaylı plan",
  "confidence": 0.85
}
`;

    try {
      const reasoning = await this.aiService.generateText(reasoningPrompt);
      const parsedReasoning = this.parseReasoning(reasoning);
      
      // Reasoning zincirine ekle
      this.reasoningChain.push({
        step: this.reasoningChain.length + 1,
        input: input,
        reasoning: parsedReasoning,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Reasoning tamamlandı: ${parsedReasoning.plan}`);
      return parsedReasoning;
      
    } catch (error) {
      console.error(`❌ Reasoning hatası:`, error);
      throw new Error(`Reasoning başarısız: ${error.message}`);
    }
  }

  // ACTING: Aksiyonları uygula
  async act(reasoning, input, context) {
    console.log(`⚡ Acting başlatılıyor...`);
    
    try {
      const actions = [];
      
      // Her aksiyonu uygula
      for (const action of reasoning.required_actions) {
        console.log(`🔧 Aksiyon uygulanıyor: ${action}`);
        
        // Araç seçimi
        const toolName = reasoning.tool_selection || this.selectBestTool(action);
        const tool = this.tools.get(toolName);
        
        if (!tool) {
          throw new Error(`Araç bulunamadı: ${toolName}`);
        }
        
        // Aksiyonu uygula
        const actionResult = await this.executeToolWithRetry(toolName, {
          action: action,
          input: input,
          context: context,
          reasoning: reasoning
        });
        
        actions.push({
          action: action,
          tool: toolName,
          result: actionResult,
          success: true,
          timestamp: new Date().toISOString()
        });
      }
      
      // Aksiyon geçmişine ekle
      this.actionHistory.push({
        reasoning: reasoning,
        actions: actions,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Acting tamamlandı: ${actions.length} aksiyon`);
      return actions;
      
    } catch (error) {
      console.error(`❌ Acting hatası:`, error);
      throw new Error(`Acting başarısız: ${error.message}`);
    }
  }

  // LEARNING: Sonuçları öğren
  async learn(reasoning, actions, input, context) {
    if (!this.config.learningEnabled) {
      return { learning: false, reason: 'Learning disabled' };
    }
    
    console.log(`🧠 Learning başlatılıyor...`);
    
    try {
      const learningPrompt = `
ÖĞRENME ANALİZİ:

REASONING: ${JSON.stringify(reasoning, null, 2)}
ACTIONS: ${JSON.stringify(actions, null, 2)}
INPUT: ${JSON.stringify(input, null, 2)}
CONTEXT: ${JSON.stringify(context, null, 2)}

Bu deneyimden ne öğrendin? Şu konuları değerlendir:
1. Reasoning doğru muydu?
2. Araç seçimi uygun muydu?
3. Aksiyonlar etkili miydi?
4. Ne iyileştirilebilir?

Yanıtını şu formatta ver:
{
  "insights": ["öğrenme1", "öğrenme2"],
  "improvements": ["iyileştirme1", "iyileştirme2"],
  "success_rate": 0.85,
  "confidence_boost": 0.1
}
`;

      const learning = await this.aiService.generateText(learningPrompt);
      const parsedLearning = this.parseLearning(learning);
      
      // Öğrenme hafızasına ekle
      this.learningMemory.push({
        reasoning: reasoning,
        actions: actions,
        learning: parsedLearning,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Learning tamamlandı: ${parsedLearning.insights.length} insight`);
      return parsedLearning;
      
    } catch (error) {
      console.error(`❌ Learning hatası:`, error);
      return { learning: false, error: error.message };
    }
  }

  // REFLECTION: Performansı değerlendir
  async reflect(reasoning, actions, learning, context) {
    if (!this.config.reflectionEnabled) {
      return { reflection: false, reason: 'Reflection disabled' };
    }
    
    console.log(`🔍 Reflection başlatılıyor...`);
    
    try {
      const reflectionPrompt = `
YANSIMA ANALİZİ:

REASONING: ${JSON.stringify(reasoning, null, 2)}
ACTIONS: ${JSON.stringify(actions, null, 2)}
LEARNING: ${JSON.stringify(learning, null, 2)}
CONTEXT: ${JSON.stringify(context, null, 2)}

Genel performansı değerlendir:
1. Başarı oranı nedir?
2. Hangi alanlarda güçlü?
3. Hangi alanlarda zayıf?
4. Gelecek için öneriler?

Yanıtını şu formatta ver:
{
  "performance_score": 0.85,
  "strengths": ["güçlü_alan1", "güçlü_alan2"],
  "weaknesses": ["zayıf_alan1", "zayıf_alan2"],
  "recommendations": ["öneri1", "öneri2"],
  "overall_assessment": "Genel değerlendirme"
}
`;

      const reflection = await this.aiService.generateText(reflectionPrompt);
      const parsedReflection = this.parseReflection(reflection);
      
      // Yansıma log'una ekle
      this.reflectionLog.push({
        reasoning: reasoning,
        actions: actions,
        learning: learning,
        reflection: parsedReflection,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Reflection tamamlandı: ${parsedReflection.performance_score} puan`);
      return parsedReflection;
      
    } catch (error) {
      console.error(`❌ Reflection hatası:`, error);
      return { reflection: false, error: error.message };
    }
  }

  // Hata durumunda yansıma
  async reflectOnError(error, input, context) {
    console.log(`⚠️ Hata yansıması yapılıyor...`);
    
    const errorReflection = {
      type: 'error_reflection',
      error: error.message,
      input: input,
      context: context,
      timestamp: new Date().toISOString(),
      suggestions: [
        'Input formatını kontrol et',
        'Araçların mevcut olduğunu doğrula',
        'Bağlam bilgilerini gözden geçir'
      ]
    };
    
    this.reflectionLog.push(errorReflection);
    return errorReflection;
  }

  // Yardımcı metodlar
  getDefaultReasoningPrompt() {
    return `Sen akıllı bir AI agent'sın. Görevleri analiz et, planla ve uygula.

REASONING ADIMLARI:
1. DURUM ANALİZİ: Girdiyi ve bağlamı anla
2. HEDEF BELİRLEME: Ne yapılması gerektiğini belirle
3. ARAÇ SEÇİMİ: En uygun aracı seç
4. PLAN OLUŞTURMA: Detaylı aksiyon planı yap
5. GÜVEN DEĞERLENDİRMESİ: Planın başarı şansını değerlendir

PRENSİPLER:
- Mantıklı ve sistematik düşün
- Mevcut araçları etkin kullan
- Hata durumlarını öngör
- Öğrenmeye açık ol`;
  }

  parseReasoning(text) {
    try {
      // JSON formatında yanıt almaya çalış
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: Basit parsing
      return {
        analysis: text,
        required_actions: ['analyze'],
        tool_selection: Array.from(this.tools.keys())[0] || 'default',
        plan: text,
        confidence: 0.7
      };
    } catch (error) {
      console.warn('Reasoning parsing hatası, fallback kullanılıyor:', error);
      return {
        analysis: text,
        required_actions: ['analyze'],
        tool_selection: Array.from(this.tools.keys())[0] || 'default',
        plan: text,
        confidence: 0.5
      };
    }
  }

  parseLearning(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        insights: [text],
        improvements: ['Daha iyi parsing gerekli'],
        success_rate: 0.7,
        confidence_boost: 0.05
      };
    } catch (error) {
      return {
        insights: [text],
        improvements: ['Parsing iyileştirilmeli'],
        success_rate: 0.5,
        confidence_boost: 0.0
      };
    }
  }

  parseReflection(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        performance_score: 0.7,
        strengths: ['Analiz yapabilme'],
        weaknesses: ['Parsing zorluğu'],
        recommendations: ['JSON formatını iyileştir'],
        overall_assessment: text
      };
    } catch (error) {
      return {
        performance_score: 0.5,
        strengths: ['Temel işlevsellik'],
        weaknesses: ['Parsing sorunları'],
        recommendations: ['Format iyileştirmesi'],
        overall_assessment: text
      };
    }
  }

  selectBestTool(action) {
    // Aksiyona göre en uygun aracı seç
    const toolMap = {
      'analyze': 'cv_parser',
      'parse': 'cv_parser',
      'extract': 'cv_parser',
      'match': 'job_parser',
      'compare': 'job_parser',
      'search': 'web_search',
      'rewrite': 'content_rewriter'
    };
    
    return toolMap[action] || Array.from(this.tools.keys())[0];
  }

  async executeToolWithRetry(toolName, input, maxRetries = this.config.maxActionAttempts) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔧 Tool denemesi ${attempt}/${maxRetries}: ${toolName}`);
        return await this.executeTool(toolName, input);
      } catch (error) {
        console.warn(`⚠️ Tool hatası (${attempt}/${maxRetries}): ${error.message}`);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Kısa bekleme sonra tekrar dene
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // ReAct durumunu alma
  getReActStatus() {
    return {
      ...this.getStatus(),
      reasoningChainLength: this.reasoningChain.length,
      actionHistoryLength: this.actionHistory.length,
      learningMemoryLength: this.learningMemory.length,
      reflectionLogLength: this.reflectionLog.length,
      config: this.config
    };
  }

  // ReAct geçmişini alma
  getReActHistory() {
    return {
      reasoningChain: this.reasoningChain,
      actionHistory: this.actionHistory,
      learningMemory: this.learningMemory,
      reflectionLog: this.reflectionLog
    };
  }

  // ReAct agent'ını sıfırlama
  resetReAct() {
    this.reasoningChain = [];
    this.actionHistory = [];
    this.learningMemory = [];
    this.reflectionLog = [];
    this.clearMemory();
    console.log(`🔄 ReAct Agent sıfırlandı: ${this.name}`);
  }
}

export { ReActAgent }; 
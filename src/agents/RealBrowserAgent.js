// Real Browser-Compatible Agent System
// LangChain olmadan ama gerçek agent mantığı ile

// AI API Keys
const GEMINI_API_KEY = 'AIzaSyD3TUH96n93daZQMAgoAE9IvAIq7EVcr5I';

// Agent Tool Definitions
const AGENT_TOOLS = {
  cv_analyzer: {
    name: "cv_analyzer",
    description: "CV'yi detaylı analiz eder, güçlü yanları, eksiklikleri, uygunluk skorunu ve önerileri belirler",
    parameters: {
      cvText: "Analiz edilecek CV metni",
      jobDescription: "Hedef iş ilanı metni"
    }
  },
  interview_preparator: {
    name: "interview_preparator", 
    description: "Kapsamlı mülakat hazırlığı oluşturur - sorular, cevaplar, ipuçları ve stratejiler",
    parameters: {
      cvText: "CV metni",
      jobDescription: "İş ilanı metni",
      position: "Pozisyon adı"
    }
  },
  cover_letter_generator: {
    name: "cover_letter_generator",
    description: "Kişiselleştirilmiş, etkili ön yazı oluşturur",
    parameters: {
      cvText: "CV metni",
      jobDescription: "İş ilanı metni",
      companyName: "Şirket adı",
      position: "Pozisyon adı"
    }
  },
  email_template_generator: {
    name: "email_template_generator",
    description: "Profesyonel başvuru emaili şablonu oluşturur",
    parameters: {
      cvText: "CV metni",
      jobDescription: "İş ilanı metni",
      companyName: "Şirket adı",
      position: "Pozisyon adı"
    }
  },
  skill_gap_analyzer: {
    name: "skill_gap_analyzer",
    description: "CV ve iş ilanı arasındaki beceri boşluklarını detaylı analiz eder",
    parameters: {
      cvText: "CV metni",
      jobDescription: "İş ilanı metni"
    }
  }
};

// Agent Memory System
class AgentMemory {
  constructor() {
    this.conversationHistory = [];
    this.toolUsageHistory = [];
    this.context = {};
  }

  addMessage(role, content) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
  }

  addToolUsage(toolName, input, output) {
    this.toolUsageHistory.push({
      toolName,
      input,
      output,
      timestamp: new Date().toISOString()
    });
  }

  getRecentContext(limit = 5) {
    return this.conversationHistory.slice(-limit);
  }

  clear() {
    this.conversationHistory = [];
    this.toolUsageHistory = [];
    this.context = {};
  }
}

// Agent Tool Executor
class AgentToolExecutor {
  static async executeTool(toolName, parameters) {
    try {
      console.log(`🔧 Agent aracı çalıştırıyor: ${toolName}`);
      
      const tool = AGENT_TOOLS[toolName];
      if (!tool) {
        throw new Error(`Bilinmeyen araç: ${toolName}`);
      }

      // Tool-specific prompts
      const prompts = {
        cv_analyzer: `
          Sen bir kariyer danışmanısın. CV analizi konusunda uzmansın.
          
          CV: ${parameters.cvText}
          İş İlanı: ${parameters.jobDescription}
          
          Bu CV'yi detaylı analiz et ve şu bilgileri JSON formatında döndür:
          
          {
            "strengths": ["güçlü yan 1", "güçlü yan 2", "güçlü yan 3"],
            "weaknesses": ["eksiklik 1", "eksiklik 2", "eksiklik 3"],
            "recommendations": ["öneri 1", "öneri 2", "öneri 3", "öneri 4", "öneri 5"],
            "compatibilityScore": 85,
            "priorityActions": ["eylem 1", "eylem 2", "eylem 3"],
            "skillGaps": ["eksik beceri 1", "eksik beceri 2"],
            "experienceMatch": "uygun/orta/uygun değil",
            "overallAssessment": "Bu CV'nin genel değerlendirmesi..."
          }
          
          Sadece JSON döndür, başka açıklama ekleme.
        `,
        
        interview_preparator: `
          Sen bir mülakat koçusun. Bu pozisyon için kapsamlı mülakat hazırlığı oluştur.
          
          Pozisyon: ${parameters.position}
          CV: ${parameters.cvText}
          İş İlanı: ${parameters.jobDescription}
          
          JSON formatında şu bilgileri döndür:
          
          {
            "expectedQuestions": [
              "Beklenen soru 1",
              "Beklenen soru 2", 
              "Beklenen soru 3",
              "Beklenen soru 4",
              "Beklenen soru 5"
            ],
            "preparedAnswers": [
              "Hazır cevap 1",
              "Hazır cevap 2",
              "Hazır cevap 3", 
              "Hazır cevap 4",
              "Hazır cevap 5"
            ],
            "attentionPoints": [
              "Dikkat edilecek nokta 1",
              "Dikkat edilecek nokta 2",
              "Dikkat edilecek nokta 3"
            ],
            "questionsToAsk": [
              "Sormak için soru 1",
              "Sormak için soru 2", 
              "Sormak için soru 3"
            ],
            "behavioralTips": [
              "Davranış ipucu 1",
              "Davranış ipucu 2",
              "Davranış ipucu 3"
            ],
            "dressCode": "Giyim önerisi",
            "bodyLanguage": "Beden dili önerileri",
            "followUpStrategy": "Takip stratejisi"
          }
          
          Sadece JSON döndür.
        `,
        
        cover_letter_generator: `
          Sen bir ön yazı uzmanısın. Profesyonel ve etkili ön yazı oluştur.
          
          Şirket: ${parameters.companyName}
          Pozisyon: ${parameters.position}
          CV: ${parameters.cvText}
          İş İlanı: ${parameters.jobDescription}
          
          Bu bilgilere göre profesyonel bir ön yazı oluştur:
          
          - Kişisel ve samimi ton kullan
          - CV'deki deneyimleri vurgula
          - Şirkete değer katacağını belirt
          - Çağrı eylemi (call-to-action) içersin
          - 3-4 paragraf olsun
          - Türkçe yaz
          
          Sadece ön yazı metnini döndür, başlık ekleme.
        `,
        
        email_template_generator: `
          Sen bir email yazma uzmanısın. Profesyonel başvuru emaili oluştur.
          
          Şirket: ${parameters.companyName}
          Pozisyon: ${parameters.position}
          CV: ${parameters.cvText}
          İş İlanı: ${parameters.jobDescription}
          
          JSON formatında döndür:
          
          {
            "subject": "Etkili konu başlığı",
            "body": "Email gövdesi - selamlama, ilgi, deneyim, değer, görüşme talebi, teşekkür",
            "tips": ["Email ipucu 1", "Email ipucu 2", "Email ipucu 3"]
          }
          
          Sadece JSON döndür.
        `,
        
        skill_gap_analyzer: `
          Sen bir beceri analiz uzmanısın. CV ve iş ilanı arasındaki beceri boşluklarını analiz et.
          
          CV: ${parameters.cvText}
          İş İlanı: ${parameters.jobDescription}
          
          JSON formatında döndür:
          
          {
            "currentSkills": ["mevcut beceri 1", "mevcut beceri 2", "mevcut beceri 3"],
            "requiredSkills": ["gerekli beceri 1", "gerekli beceri 2", "gerekli beceri 3"],
            "missingSkills": ["eksik beceri 1", "eksik beceri 2", "eksik beceri 3"],
            "learningPriorities": ["öncelik 1", "öncelik 2", "öncelik 3"],
            "learningResources": {
              "beceri1": ["kaynak 1", "kaynak 2"],
              "beceri2": ["kaynak 1", "kaynak 2"],
              "beceri3": ["kaynak 1", "kaynak 2"]
            },
            "timeEstimate": "Tahmini öğrenme süresi",
            "difficultyLevel": "Zorluk seviyesi"
          }
          
          Sadece JSON döndür.
        `
      };

      const prompt = prompts[toolName];
      const result = await this.callGeminiAPI(prompt);
      
      console.log(`✅ Agent aracı tamamlandı: ${toolName}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Agent aracı hatası (${toolName}):`, error);
      throw error;
    }
  }

  static async callGeminiAPI(prompt) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      // Try to parse JSON
      try {
        return JSON.parse(result);
      } catch {
        return { rawResponse: result };
      }
      
    } catch (error) {
      console.error('Gemini API hatası:', error);
      throw error;
    }
  }
}

// Agent Decision Engine
class AgentDecisionEngine {
  static analyzeTask(task, context = {}) {
    const taskLower = task.toLowerCase();
    const contextText = context.cvText ? context.cvText.toLowerCase() : '';
    const contextJob = context.jobText ? context.jobText.toLowerCase() : '';
    
    // Decision logic based on task content
    if (taskLower.includes('cv') && taskLower.includes('analiz')) {
      return {
        primaryTool: 'cv_analyzer',
        confidence: 0.95,
        reasoning: 'CV analizi isteği tespit edildi'
      };
    }
    
    if (taskLower.includes('mülakat') || taskLower.includes('interview')) {
      return {
        primaryTool: 'interview_preparator',
        confidence: 0.90,
        reasoning: 'Mülakat hazırlığı isteği tespit edildi'
      };
    }
    
    if (taskLower.includes('ön yazı') || taskLower.includes('cover letter')) {
      return {
        primaryTool: 'cover_letter_generator',
        confidence: 0.85,
        reasoning: 'Ön yazı oluşturma isteği tespit edildi'
      };
    }
    
    if (taskLower.includes('email') || taskLower.includes('mail')) {
      return {
        primaryTool: 'email_template_generator',
        confidence: 0.80,
        reasoning: 'Email şablonu isteği tespit edildi'
      };
    }
    
    if (taskLower.includes('beceri') || taskLower.includes('skill')) {
      return {
        primaryTool: 'skill_gap_analyzer',
        confidence: 0.85,
        reasoning: 'Beceri analizi isteği tespit edildi'
      };
    }
    
    // Default comprehensive analysis
    return {
      primaryTool: 'cv_analyzer',
      confidence: 0.70,
      reasoning: 'Genel analiz için CV analyzer seçildi'
    };
  }
}

// Real Browser Agent Class
export class RealBrowserAgent {
  constructor() {
    this.memory = new AgentMemory();
    this.isReady = false;
    this.currentTask = null;
    this.toolUsageCount = {};
  }

  async initialize() {
    try {
      console.log('🤖 Real Browser Agent başlatılıyor...');
      
      // Initialize tool usage counters
      Object.keys(AGENT_TOOLS).forEach(tool => {
        this.toolUsageCount[tool] = 0;
      });
      
      this.isReady = true;
      console.log('✅ Real Browser Agent başarıyla başlatıldı');
      return true;
    } catch (error) {
      console.error('❌ Real Browser Agent başlatma hatası:', error);
      return false;
    }
  }

  async runTask(task, context = {}) {
    try {
      if (!this.isReady) {
        await this.initialize();
      }

      console.log('🤖 Real Browser Agent görevi başlatılıyor:', task);
      
      // Add to memory
      this.memory.addMessage('user', task);
      this.currentTask = task;

      // Decision making
      const decision = AgentDecisionEngine.analyzeTask(task, context);
      console.log('🧠 Agent karar verdi:', decision);

      // Execute primary tool
      const toolResult = await AgentToolExecutor.executeTool(decision.primaryTool, context);
      
      // Update memory
      this.memory.addToolUsage(decision.primaryTool, context, toolResult);
      this.toolUsageCount[decision.primaryTool]++;

      // Generate comprehensive response
      const response = await this.generateComprehensiveResponse(task, toolResult, decision, context);
      
      // Add agent response to memory
      this.memory.addMessage('assistant', response);

      console.log('✅ Real Browser Agent görevi tamamlandı');
      return {
        output: response,
        toolUsed: decision.primaryTool,
        confidence: decision.confidence,
        reasoning: decision.reasoning,
        toolResult: toolResult
      };
      
    } catch (error) {
      console.error('❌ Real Browser Agent görevi hatası:', error);
      return { error: error.message };
    }
  }

  async generateComprehensiveResponse(task, toolResult, decision, context) {
    try {
      const prompt = `
        Sen CareerMatch AI Agent'ısın. Kullanıcının isteğine yanıt ver.
        
        Kullanıcı İsteği: ${task}
        Kullanılan Araç: ${decision.primaryTool}
        Araç Sonucu: ${JSON.stringify(toolResult)}
        Güven Skoru: ${decision.confidence}
        Karar Gerekçesi: ${decision.reasoning}
        
        Bu bilgileri kullanarak kullanıcıya kapsamlı, profesyonel ve Türkçe bir yanıt ver.
        Araç sonucunu düzenli bir şekilde sun.
        Kullanıcının ihtiyacını karşılayacak şekilde yanıtla.
      `;

      const response = await AgentToolExecutor.callGeminiAPI(prompt);
      return response.rawResponse || response;
      
    } catch (error) {
      return `Agent yanıtı: ${JSON.stringify(toolResult)}`;
    }
  }

  async comprehensiveAnalysis(cvText, jobDescription, companyName = "", position = "") {
    try {
      const task = `
        Bu CV ve iş ilanı için kapsamlı analiz yap:
        1. CV analizi (güçlü yanlar, eksiklikler, uygunluk skoru)
        2. Beceri boşluğu analizi (mevcut vs gerekli beceriler)
        3. Mülakat hazırlığı (sorular, cevaplar, ipuçları)
        4. Ön yazı önerisi (kişiselleştirilmiş)
        5. Email şablonu (profesyonel başvuru)
        
        CV: ${cvText.substring(0, 1000)}
        İş İlanı: ${jobDescription.substring(0, 1000)}
        Şirket: ${companyName}
        Pozisyon: ${position}
      `;

      return await this.runTask(task, { cvText, jobDescription, companyName, position });
    } catch (error) {
      return { error: `Kapsamlı analiz hatası: ${error.message}` };
    }
  }

  getConversationHistory() {
    return this.memory.conversationHistory;
  }

  getToolUsageStats() {
    return this.toolUsageCount;
  }

  clearMemory() {
    this.memory.clear();
    console.log('✅ Agent belleği temizlendi');
  }

  getAgentStatus() {
    return {
      isReady: this.isReady,
      currentTask: this.currentTask,
      toolUsageCount: this.toolUsageCount,
      memorySize: this.memory.conversationHistory.length
    };
  }
}

export default RealBrowserAgent; 
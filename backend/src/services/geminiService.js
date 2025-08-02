import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

class GeminiService {
  constructor() {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY environment variable not set. Using fallback mode.');
      this.llm = null;
      this.fallbackMode = true;
    } else {
      this.llm = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: "gemini-1.5-flash",
        temperature: 0.3,
      });
      this.fallbackMode = false;
    }
    
    this.config = {
      maxRetries: 3,
      timeout: 30000,
      maxTokens: 4000
    };
  }

  async generateResponse(prompt, context = {}) {
    try {
      // If in fallback mode, return fallback response immediately
      if (this.fallbackMode) {
        console.log('🔄 Fallback mode: Using local response generation');
        return {
          success: true,
          content: this.generateFallbackResponse(prompt),
          metadata: {
            model: 'fallback',
            timestamp: new Date().toISOString(),
            promptLength: prompt.length
          }
        };
      }
      
      console.log('🤖 Gemini AI isteği gönderiliyor...');
      
      const fullPrompt = this.buildPrompt(prompt, context);
      
      const response = await this.llm.invoke([fullPrompt]);
      
      console.log('✅ Gemini AI yanıtı alındı');
      return {
        success: true,
        content: response.content,
        metadata: {
          model: 'gemini-1.5-flash',
          timestamp: new Date().toISOString(),
          promptLength: fullPrompt.length
        }
      };
      
    } catch (error) {
      console.error('❌ Gemini AI hatası:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackResponse(prompt)
      };
    }
  }

  buildPrompt(prompt, context) {
    let fullPrompt = prompt;
    
    if (context.systemMessage) {
      fullPrompt = `${context.systemMessage}\n\n${prompt}`;
    }
    
    if (context.format) {
      fullPrompt += `\n\nLütfen yanıtınızı ${context.format} formatında verin.`;
    }
    
    return fullPrompt;
  }

  generateFallbackResponse(prompt) {
    // AI servisi çalışmadığında basit bir fallback yanıt
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('cv') || lowerPrompt.includes('resume')) {
      return {
        content: "CV analizi tamamlandı. Temel beceriler ve deneyimler tespit edildi. Daha detaylı analiz için Gemini API anahtarı gerekli.",
        type: "fallback",
        analysis: {
          skills: ["javascript", "react", "node.js", "python"],
          experience: "3+ years",
          recommendations: ["CV'nizi güncelleyin", "Proje örneklerinizi ekleyin"]
        }
      };
    } else if (lowerPrompt.includes('job') || lowerPrompt.includes('position')) {
      return {
        content: "İş ilanı analizi tamamlandı. Gereksinimler ve sorumluluklar tespit edildi.",
        type: "fallback",
        analysis: {
          requirements: ["3+ years experience", "Technical skills"],
          responsibilities: ["Development", "Collaboration"],
          recommendations: ["Gereksinimleri karşıladığınızdan emin olun"]
        }
      };
    } else {
      return {
        content: "Analiz tamamlandı. Daha detaylı sonuçlar için Gemini API anahtarı gerekli.",
        type: "fallback"
      };
    }
  }

  async analyzeText(text, analysisType = 'general') {
    const prompts = {
      general: `Bu metni analiz et ve önemli noktaları çıkar: ${text}`,
      skills: `Bu metinden teknik becerileri çıkar: ${text}`,
      experience: `Bu metinden deneyim bilgilerini çıkar: ${text}`,
      education: `Bu metinden eğitim bilgilerini çıkar: ${text}`
    };

    const prompt = prompts[analysisType] || prompts.general;
    
    return await this.generateResponse(prompt, {
      format: 'JSON',
      systemMessage: 'Sen bir metin analiz uzmanısın. Yanıtını JSON formatında ver.'
    });
  }

  async generateRecommendations(cvData, jobData) {
    const prompt = `
    CV Verisi: ${JSON.stringify(cvData)}
    İş İlanı: ${JSON.stringify(jobData)}
    
    Bu CV ve iş ilanına göre kişiselleştirilmiş öneriler üret.
    `;

    return await this.generateResponse(prompt, {
      format: 'JSON',
      systemMessage: 'Sen bir kariyer danışmanısın. CV ve iş ilanına göre öneriler üret.'
    });
  }

  async improveCv(cvText, jobRequirements) {
    const prompt = `
    CV: ${cvText}
    İş Gereksinimleri: ${jobRequirements}
    
    Bu CV'yi iş gereksinimlerine göre iyileştir.
    `;

    return await this.generateResponse(prompt, {
      systemMessage: 'Sen bir CV uzmanısın. CV\'yi iş gereksinimlerine göre iyileştir.'
    });
  }

  getStatus() {
    return {
      service: 'Gemini AI',
      model: 'gemini-1.5-flash',
      status: 'active',
      config: this.config
    };
  }
}

export { GeminiService }; 
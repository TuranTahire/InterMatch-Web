const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// AI API Keys
const GEMINI_API_KEY = 'AIzaSyD3TUH96n93daZQMAgoAE9IvAIq7EVcr5I';

// Simple Agent System
class SimpleRealAgent {
  constructor() {
    this.conversationHistory = [];
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🤖 Simple Real Agent başlatılıyor...');
      
      // Test API connection
      const testResponse = await this.callGeminiAPI('Merhaba, test mesajı');
      
      if (testResponse) {
        this.isInitialized = true;
        console.log('✅ Simple Real Agent başarıyla başlatıldı');
        return true;
      } else {
        console.error('❌ API bağlantı testi başarısız');
        return false;
      }
    } catch (error) {
      console.error('❌ Agent başlatma hatası:', error);
      return false;
    }
  }

  async callGeminiAPI(prompt) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('❌ Gemini API hatası:', error.response?.data || error.message);
      return null;
    }
  }

  async runTask(task, context = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🤖 Simple Agent görevi başlatılıyor:', task);

      let prompt = '';
      
      // Task tipine göre özel prompt oluştur
      if (task.toLowerCase().includes('cv') && task.toLowerCase().includes('analiz')) {
        prompt = this.createCVAnalysisPrompt(context);
      } else if (task.toLowerCase().includes('mülakat') || task.toLowerCase().includes('interview')) {
        prompt = this.createInterviewPrepPrompt(context);
      } else if (task.toLowerCase().includes('ön yazı') || task.toLowerCase().includes('cover letter')) {
        prompt = this.createCoverLetterPrompt(context);
      } else if (task.toLowerCase().includes('email') || task.toLowerCase().includes('mail')) {
        prompt = this.createEmailTemplatePrompt(context);
      } else if (task.toLowerCase().includes('beceri') || task.toLowerCase().includes('skill')) {
        prompt = this.createSkillGapPrompt(context);
      } else {
        // Default: CV analizi
        prompt = this.createCVAnalysisPrompt(context);
      }

      const result = await this.callGeminiAPI(prompt);
      
      if (result) {
        // Try to parse as JSON, if not return as text
        try {
          const jsonResult = JSON.parse(result);
          return { output: jsonResult, task: task };
        } catch {
          return { output: result, task: task };
        }
      } else {
        return { error: 'API yanıtı alınamadı' };
      }
    } catch (error) {
      console.error('❌ Agent görevi hatası:', error);
      return { error: error.message };
    }
  }

  createCVAnalysisPrompt(context) {
    return `
    Sen bir kariyer danışmanısın. CV analizi konusunda uzmansın.
    
    CV: ${context.cvText || 'CV metni yok'}
    İş İlanı: ${context.jobText || 'İş ilanı yok'}
    
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
    `;
  }

  createInterviewPrepPrompt(context) {
    return `
    Sen bir mülakat koçusun. Bu pozisyon için kapsamlı mülakat hazırlığı oluştur.
    
    Pozisyon: ${context.position || 'Pozisyon belirtilmemiş'}
    CV: ${context.cvText || 'CV metni yok'}
    İş İlanı: ${context.jobText || 'İş ilanı yok'}
    
    JSON formatında şu bilgileri döndür:
    
    {
      "expectedQuestions": ["soru 1", "soru 2", "soru 3", "soru 4", "soru 5"],
      "preparedAnswers": ["cevap 1", "cevap 2", "cevap 3", "cevap 4", "cevap 5"],
      "attentionPoints": ["nokta 1", "nokta 2", "nokta 3"],
      "questionsToAsk": ["soru 1", "soru 2", "soru 3"],
      "behavioralTips": ["ipucu 1", "ipucu 2", "ipucu 3"],
      "dressCode": "Giyim önerisi",
      "bodyLanguage": "Beden dili önerileri",
      "followUpStrategy": "Takip stratejisi"
    }
    
    Sadece JSON döndür.
    `;
  }

  createCoverLetterPrompt(context) {
    return `
    Sen bir ön yazı uzmanısın. Profesyonel ve etkili ön yazı oluştur.
    
    Şirket: ${context.companyName || 'Şirket adı belirtilmemiş'}
    Pozisyon: ${context.position || 'Pozisyon belirtilmemiş'}
    CV: ${context.cvText || 'CV metni yok'}
    İş İlanı: ${context.jobText || 'İş ilanı yok'}
    
    Bu bilgilere göre profesyonel bir ön yazı oluştur:
    
    - Kişisel ve samimi ton kullan
    - CV'deki deneyimleri vurgula
    - Şirkete değer katacağını belirt
    - Çağrı eylemi (call-to-action) içersin
    - 3-4 paragraf olsun
    - Türkçe yaz
    
    Sadece ön yazı metnini döndür, başlık ekleme.
    `;
  }

  createEmailTemplatePrompt(context) {
    return `
    Sen bir email yazma uzmanısın. Profesyonel başvuru emaili oluştur.
    
    Şirket: ${context.companyName || 'Şirket adı belirtilmemiş'}
    Pozisyon: ${context.position || 'Pozisyon belirtilmemiş'}
    CV: ${context.cvText || 'CV metni yok'}
    İş İlanı: ${context.jobText || 'İş ilanı yok'}
    
    JSON formatında döndür:
    
    {
      "subject": "Etkili konu başlığı",
      "body": "Email gövdesi - selamlama, ilgi, deneyim, değer, görüşme talebi, teşekkür",
      "tips": ["ipucu 1", "ipucu 2", "ipucu 3"]
    }
    
    Sadece JSON döndür.
    `;
  }

  createSkillGapPrompt(context) {
    return `
    Sen bir beceri analiz uzmanısın. CV ve iş ilanı arasındaki beceri boşluklarını analiz et.
    
    CV: ${context.cvText || 'CV metni yok'}
    İş İlanı: ${context.jobText || 'İş ilanı yok'}
    
    JSON formatında döndür:
    
    {
      "currentSkills": ["beceri 1", "beceri 2", "beceri 3"],
      "requiredSkills": ["beceri 1", "beceri 2", "beceri 3"],
      "missingSkills": ["beceri 1", "beceri 2", "beceri 3"],
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
    `;
  }

  async comprehensiveAnalysis(cvText, jobDescription, companyName = "", position = "") {
    try {
      const context = { cvText, jobText: jobDescription, companyName, position };
      
      // Kapsamlı analiz için tüm task'ları çalıştır
      const results = {
        cvAnalysis: await this.runTask('CV Analizi', context),
        skillGap: await this.runTask('Beceri Analizi', context),
        interviewPrep: await this.runTask('Mülakat Hazırlığı', context),
        coverLetter: await this.runTask('Ön Yazı', context),
        emailTemplate: await this.runTask('Email Şablonu', context)
      };

      return { output: results, type: 'comprehensive_analysis' };
    } catch (error) {
      return { error: `Kapsamlı analiz hatası: ${error.message}` };
    }
  }

  async getConversationHistory() {
    return this.conversationHistory;
  }

  async clearMemory() {
    this.conversationHistory = [];
    console.log('✅ Agent belleği temizlendi');
  }
}

// Global agent instance
let simpleAgent = null;

// Initialize agent
async function initializeAgent() {
  try {
    simpleAgent = new SimpleRealAgent();
    const success = await simpleAgent.initialize();
    if (success) {
      console.log('✅ Simple Real Agent backend\'de başarıyla başlatıldı');
    } else {
      console.error('❌ Agent başlatma başarısız');
    }
  } catch (error) {
    console.error('❌ Agent başlatma hatası:', error);
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Simple Real Agent Server çalışıyor',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/agent/task', async (req, res) => {
  try {
    const { task, context } = req.body;
    
    if (!simpleAgent) {
      await initializeAgent();
    }
    
    if (!simpleAgent) {
      return res.status(500).json({ error: 'Agent başlatılamadı' });
    }
    
    const result = await simpleAgent.runTask(task, context);
    res.json(result);
  } catch (error) {
    console.error('❌ Agent task hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agent/comprehensive-analysis', async (req, res) => {
  try {
    const { cvText, jobDescription, companyName, position } = req.body;
    
    if (!simpleAgent) {
      await initializeAgent();
    }
    
    if (!simpleAgent) {
      return res.status(500).json({ error: 'Agent başlatılamadı' });
    }
    
    const result = await simpleAgent.comprehensiveAnalysis(cvText, jobDescription, companyName, position);
    res.json(result);
  } catch (error) {
    console.error('❌ Comprehensive analysis hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agent/history', async (req, res) => {
  try {
    if (!simpleAgent) {
      return res.json([]);
    }
    
    const history = await simpleAgent.getConversationHistory();
    res.json(history);
  } catch (error) {
    console.error('❌ History alma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agent/clear-memory', async (req, res) => {
  try {
    if (!simpleAgent) {
      return res.json({ message: 'Agent yok' });
    }
    
    await simpleAgent.clearMemory();
    res.json({ message: 'Bellek temizlendi' });
  } catch (error) {
    console.error('❌ Memory temizleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Simple Real Agent Server çalışıyor: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  
  // Initialize agent on startup
  initializeAgent();
}); 
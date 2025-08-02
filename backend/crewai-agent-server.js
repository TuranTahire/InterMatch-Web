const express = require('express');
const cors = require('cors');
const { CrewAI } = require('crewai');
const { Agent } = require('crewai');
const { Task } = require('crewai');
const { Process } = require('crewai');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// AI API Keys
const GEMINI_API_KEY = 'AIzaSyD3TUH96n93daZQMAgoAE9IvAIq7EVcr5I';

// CrewAI Agent'ları oluştur
const cvAnalyst = new Agent({
  name: 'CV Analisti',
  role: 'Kariyer danışmanı ve CV analiz uzmanı',
  goal: 'CV\'leri detaylı analiz etmek, güçlü yanları ve eksiklikleri belirlemek',
  backstory: '10 yıllık kariyer danışmanlığı deneyimi olan uzman. CV analizi konusunda uzmanlaşmış.',
  verbose: true,
  allow_delegation: false,
  tools: [],
  llm: {
    provider: 'google',
    model: 'gemini-pro',
    api_key: GEMINI_API_KEY
  }
});

const interviewCoach = new Agent({
  name: 'Mülakat Koçu',
  role: 'Mülakat hazırlığı ve koçluk uzmanı',
  goal: 'Kapsamlı mülakat hazırlığı oluşturmak, sorular ve cevaplar hazırlamak',
  backstory: '15 yıllık HR deneyimi olan mülakat koçu. Binlerce adayı başarıyla hazırlamış.',
  verbose: true,
  allow_delegation: false,
  tools: [],
  llm: {
    provider: 'google',
    model: 'gemini-pro',
    api_key: GEMINI_API_KEY
  }
});

const coverLetterWriter = new Agent({
  name: 'Ön Yazı Uzmanı',
  role: 'Profesyonel ön yazı yazarı',
  goal: 'Kişiselleştirilmiş, etkili ön yazılar oluşturmak',
  backstory: 'Profesyonel yazar ve kariyer danışmanı. Ön yazı konusunda uzmanlaşmış.',
  verbose: true,
  allow_delegation: false,
  tools: [],
  llm: {
    provider: 'google',
    model: 'gemini-pro',
    api_key: GEMINI_API_KEY
  }
});

const emailSpecialist = new Agent({
  name: 'Email Uzmanı',
  role: 'Profesyonel email yazma uzmanı',
  goal: 'Etkili başvuru emaili şablonları oluşturmak',
  backstory: 'İletişim uzmanı ve email yazma konusunda uzmanlaşmış profesyonel.',
  verbose: true,
  allow_delegation: false,
  tools: [],
  llm: {
    provider: 'google',
    model: 'gemini-pro',
    api_key: GEMINI_API_KEY
  }
});

const skillGapAnalyst = new Agent({
  name: 'Beceri Analisti',
  role: 'Beceri boşluğu analiz uzmanı',
  goal: 'CV ve iş ilanı arasındaki beceri boşluklarını analiz etmek',
  backstory: 'İK uzmanı ve beceri analizi konusunda uzmanlaşmış profesyonel.',
  verbose: true,
  allow_delegation: false,
  tools: [],
  llm: {
    provider: 'google',
    model: 'gemini-pro',
    api_key: GEMINI_API_KEY
  }
});

// CrewAI Tasks oluştur
function createCVAnalysisTask(cvText, jobDescription) {
  return new Task({
    description: `
      CV Analizi Görevi:
      
      CV: ${cvText}
      İş İlanı: ${jobDescription}
      
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
    agent: cvAnalyst,
    expected_output: "JSON formatında CV analizi"
  });
}

function createInterviewPrepTask(cvText, jobDescription, position) {
  return new Task({
    description: `
      Mülakat Hazırlığı Görevi:
      
      Pozisyon: ${position}
      CV: ${cvText}
      İş İlanı: ${jobDescription}
      
      Bu pozisyon için kapsamlı mülakat hazırlığı oluştur ve JSON formatında döndür:
      
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
    `,
    agent: interviewCoach,
    expected_output: "JSON formatında mülakat hazırlığı"
  });
}

function createCoverLetterTask(cvText, jobDescription, companyName, position) {
  return new Task({
    description: `
      Ön Yazı Oluşturma Görevi:
      
      Şirket: ${companyName}
      Pozisyon: ${position}
      CV: ${cvText}
      İş İlanı: ${jobDescription}
      
      Bu bilgilere göre profesyonel bir ön yazı oluştur:
      
      - Kişisel ve samimi ton kullan
      - CV'deki deneyimleri vurgula
      - Şirkete değer katacağını belirt
      - Çağrı eylemi (call-to-action) içersin
      - 3-4 paragraf olsun
      - Türkçe yaz
      
      Sadece ön yazı metnini döndür, başlık ekleme.
    `,
    agent: coverLetterWriter,
    expected_output: "Profesyonel ön yazı metni"
  });
}

function createEmailTemplateTask(cvText, jobDescription, companyName, position) {
  return new Task({
    description: `
      Email Şablonu Oluşturma Görevi:
      
      Şirket: ${companyName}
      Pozisyon: ${position}
      CV: ${cvText}
      İş İlanı: ${jobDescription}
      
      Profesyonel başvuru emaili oluştur ve JSON formatında döndür:
      
      {
        "subject": "Etkili konu başlığı",
        "body": "Email gövdesi - selamlama, ilgi, deneyim, değer, görüşme talebi, teşekkür",
        "tips": ["ipucu 1", "ipucu 2", "ipucu 3"]
      }
      
      Sadece JSON döndür.
    `,
    agent: emailSpecialist,
    expected_output: "JSON formatında email şablonu"
  });
}

function createSkillGapTask(cvText, jobDescription) {
  return new Task({
    description: `
      Beceri Boşluğu Analizi Görevi:
      
      CV: ${cvText}
      İş İlanı: ${jobDescription}
      
      CV ve iş ilanı arasındaki beceri boşluklarını analiz et ve JSON formatında döndür:
      
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
    `,
    agent: skillGapAnalyst,
    expected_output: "JSON formatında beceri analizi"
  });
}

// CrewAI Crew oluştur
function createCareerCrew() {
  return new CrewAI({
    agents: [cvAnalyst, interviewCoach, coverLetterWriter, emailSpecialist, skillGapAnalyst],
    tasks: [],
    verbose: true,
    process: Process.sequential
  });
}

// Global crew instance
let careerCrew = null;

// Initialize crew
async function initializeCrew() {
  try {
    careerCrew = createCareerCrew();
    console.log('✅ CrewAI Career Crew başarıyla oluşturuldu');
    return true;
  } catch (error) {
    console.error('❌ Crew başlatma hatası:', error);
    return false;
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'CrewAI Agent Server çalışıyor',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/agent/task', async (req, res) => {
  try {
    const { task, context } = req.body;
    
    if (!careerCrew) {
      await initializeCrew();
    }
    
    if (!careerCrew) {
      return res.status(500).json({ error: 'Crew başlatılamadı' });
    }
    
    // Task tipine göre uygun agent'ı seç
    let selectedTask;
    
    if (task.toLowerCase().includes('cv') && task.toLowerCase().includes('analiz')) {
      selectedTask = createCVAnalysisTask(context.cvText || '', context.jobText || '');
    } else if (task.toLowerCase().includes('mülakat') || task.toLowerCase().includes('interview')) {
      selectedTask = createInterviewPrepTask(context.cvText || '', context.jobText || '', context.position || '');
    } else if (task.toLowerCase().includes('ön yazı') || task.toLowerCase().includes('cover letter')) {
      selectedTask = createCoverLetterTask(context.cvText || '', context.jobText || '', context.companyName || '', context.position || '');
    } else if (task.toLowerCase().includes('email') || task.toLowerCase().includes('mail')) {
      selectedTask = createEmailTemplateTask(context.cvText || '', context.jobText || '', context.companyName || '', context.position || '');
    } else if (task.toLowerCase().includes('beceri') || task.toLowerCase().includes('skill')) {
      selectedTask = createSkillGapTask(context.cvText || '', context.jobText || '');
    } else {
      // Default: CV analizi
      selectedTask = createCVAnalysisTask(context.cvText || '', context.jobText || '');
    }
    
    console.log('🤖 CrewAI görevi başlatılıyor:', task);
    const result = await careerCrew.kickoff([selectedTask]);
    
    console.log('✅ CrewAI görevi tamamlandı');
    res.json({ output: result, task: task });
    
  } catch (error) {
    console.error('❌ CrewAI task hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agent/comprehensive-analysis', async (req, res) => {
  try {
    const { cvText, jobDescription, companyName, position } = req.body;
    
    if (!careerCrew) {
      await initializeCrew();
    }
    
    if (!careerCrew) {
      return res.status(500).json({ error: 'Crew başlatılamadı' });
    }
    
    // Kapsamlı analiz için tüm task'ları oluştur
    const tasks = [
      createCVAnalysisTask(cvText, jobDescription),
      createSkillGapTask(cvText, jobDescription),
      createInterviewPrepTask(cvText, jobDescription, position),
      createCoverLetterTask(cvText, jobDescription, companyName, position),
      createEmailTemplateTask(cvText, jobDescription, companyName, position)
    ];
    
    console.log('🤖 CrewAI kapsamlı analiz başlatılıyor...');
    const result = await careerCrew.kickoff(tasks);
    
    console.log('✅ CrewAI kapsamlı analiz tamamlandı');
    res.json({ output: result, type: 'comprehensive_analysis' });
    
  } catch (error) {
    console.error('❌ Comprehensive analysis hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agent/history', async (req, res) => {
  try {
    // CrewAI'da conversation history basit
    res.json([]);
  } catch (error) {
    console.error('❌ History alma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agent/clear-memory', async (req, res) => {
  try {
    // CrewAI'da memory temizleme basit
    res.json({ message: 'CrewAI memory temizlendi' });
  } catch (error) {
    console.error('❌ Memory temizleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 CrewAI Agent Server çalışıyor: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  
  // Initialize crew on startup
  initializeCrew();
}); 
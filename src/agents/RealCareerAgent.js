import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
// Memory import'u kaldırıldı - browser compatibility için

// AI API Keys
const OPENAI_API_KEY = 'sk-your-openai-key-here';
const GEMINI_API_KEY = 'AIzaSyD3TUH96n93daZQMAgoAE9IvAIq7EVcr5I';

// AI Models
const openaiModel = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

const geminiModel = new ChatGoogleGenerativeAI({
  modelName: "gemini-pro",
  maxOutputTokens: 2048,
  temperature: 0.7,
  apiKey: GEMINI_API_KEY,
});

// CV Analysis Tool
const cvAnalysisTool = new DynamicStructuredTool({
  name: "cv_analyzer",
  description: "CV'yi detaylı analiz eder, güçlü yanları, eksiklikleri, uygunluk skorunu ve önerileri belirler",
  schema: z.object({
    cvText: z.string().describe("Analiz edilecek CV metni"),
    jobDescription: z.string().describe("Hedef iş ilanı metni"),
  }),
  func: async ({ cvText, jobDescription }) => {
    try {
      const prompt = PromptTemplate.fromTemplate(`
        Sen bir kariyer danışmanısın. CV analizi konusunda uzmansın.
        
        CV: {cvText}
        İş İlanı: {jobDescription}
        
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
      `);

      const chain = RunnableSequence.from([
        prompt,
        geminiModel,
        new StringOutputParser(),
      ]);

      const result = await chain.invoke({ cvText, jobDescription });
      
      try {
        return JSON.parse(result);
      } catch {
        return { analysis: result, error: "JSON parse edilemedi" };
      }
    } catch (error) {
      return { error: `CV analizi hatası: ${error.message}` };
    }
  },
});

// Interview Preparation Tool
const interviewPrepTool = new DynamicStructuredTool({
  name: "interview_preparator",
  description: "Kapsamlı mülakat hazırlığı oluşturur - sorular, cevaplar, ipuçları ve stratejiler",
  schema: z.object({
    cvText: z.string().describe("CV metni"),
    jobDescription: z.string().describe("İş ilanı metni"),
    position: z.string().describe("Pozisyon adı"),
  }),
  func: async ({ cvText, jobDescription, position }) => {
    try {
      const prompt = PromptTemplate.fromTemplate(`
        Sen bir mülakat koçusun. Bu pozisyon için kapsamlı mülakat hazırlığı oluştur.
        
        Pozisyon: {position}
        CV: {cvText}
        İş İlanı: {jobDescription}
        
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
      `);

      const chain = RunnableSequence.from([
        prompt,
        geminiModel,
        new StringOutputParser(),
      ]);

      const result = await chain.invoke({ cvText, jobDescription, position });
      
      try {
        return JSON.parse(result);
      } catch {
        return { interviewPrep: result, error: "JSON parse edilemedi" };
      }
    } catch (error) {
      return { error: `Mülakat hazırlığı hatası: ${error.message}` };
    }
  },
});

// Cover Letter Generator Tool
const coverLetterTool = new DynamicStructuredTool({
  name: "cover_letter_generator",
  description: "Kişiselleştirilmiş, etkili ön yazı oluşturur",
  schema: z.object({
    cvText: z.string().describe("CV metni"),
    jobDescription: z.string().describe("İş ilanı metni"),
    companyName: z.string().describe("Şirket adı"),
    position: z.string().describe("Pozisyon adı"),
  }),
  func: async ({ cvText, jobDescription, companyName, position }) => {
    try {
      const prompt = PromptTemplate.fromTemplate(`
        Sen bir ön yazı uzmanısın. Profesyonel ve etkili ön yazı oluştur.
        
        Şirket: {companyName}
        Pozisyon: {position}
        CV: {cvText}
        İş İlanı: {jobDescription}
        
        Bu bilgilere göre profesyonel bir ön yazı oluştur:
        
        - Kişisel ve samimi ton kullan
        - CV'deki deneyimleri vurgula
        - Şirkete değer katacağını belirt
        - Çağrı eylemi (call-to-action) içersin
        - 3-4 paragraf olsun
        - Türkçe yaz
        
        Sadece ön yazı metnini döndür, başlık ekleme.
      `);

      const chain = RunnableSequence.from([
        prompt,
        geminiModel,
        new StringOutputParser(),
      ]);

      const result = await chain.invoke({ cvText, jobDescription, companyName, position });
      return { coverLetter: result };
    } catch (error) {
      return { error: `Ön yazı oluşturma hatası: ${error.message}` };
    }
  },
});

// Email Template Generator Tool
const emailTemplateTool = new DynamicStructuredTool({
  name: "email_template_generator",
  description: "Profesyonel başvuru emaili şablonu oluşturur",
  schema: z.object({
    cvText: z.string().describe("CV metni"),
    jobDescription: z.string().describe("İş ilanı metni"),
    companyName: z.string().describe("Şirket adı"),
    position: z.string().describe("Pozisyon adı"),
  }),
  func: async ({ cvText, jobDescription, companyName, position }) => {
    try {
      const prompt = PromptTemplate.fromTemplate(`
        Sen bir email yazma uzmanısın. Profesyonel başvuru emaili oluştur.
        
        Şirket: {companyName}
        Pozisyon: {position}
        CV: {cvText}
        İş İlanı: {jobDescription}
        
        JSON formatında döndür:
        
        {
          "subject": "Etkili konu başlığı",
          "body": "Email gövdesi - selamlama, ilgi, deneyim, değer, görüşme talebi, teşekkür",
          "tips": ["Email ipucu 1", "Email ipucu 2", "Email ipucu 3"]
        }
        
        Sadece JSON döndür.
      `);

      const chain = RunnableSequence.from([
        prompt,
        geminiModel,
        new StringOutputParser(),
      ]);

      const result = await chain.invoke({ cvText, jobDescription, companyName, position });
      
      try {
        return JSON.parse(result);
      } catch {
        return { emailTemplate: result, error: "JSON parse edilemedi" };
      }
    } catch (error) {
      return { error: `Email şablonu hatası: ${error.message}` };
    }
  },
});

// Skill Gap Analysis Tool
const skillGapTool = new DynamicStructuredTool({
  name: "skill_gap_analyzer",
  description: "CV ve iş ilanı arasındaki beceri boşluklarını detaylı analiz eder",
  schema: z.object({
    cvText: z.string().describe("CV metni"),
    jobDescription: z.string().describe("İş ilanı metni"),
  }),
  func: async ({ cvText, jobDescription }) => {
    try {
      const prompt = PromptTemplate.fromTemplate(`
        Sen bir beceri analiz uzmanısın. CV ve iş ilanı arasındaki beceri boşluklarını analiz et.
        
        CV: {cvText}
        İş İlanı: {jobDescription}
        
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
      `);

      const chain = RunnableSequence.from([
        prompt,
        geminiModel,
        new StringOutputParser(),
      ]);

      const result = await chain.invoke({ cvText, jobDescription });
      
      try {
        return JSON.parse(result);
      } catch {
        return { skillGap: result, error: "JSON parse edilemedi" };
      }
    } catch (error) {
      return { error: `Beceri boşluğu analizi hatası: ${error.message}` };
    }
  },
});

// Real Career Agent Class
export class RealCareerAgent {
  constructor() {
    this.tools = [
      cvAnalysisTool,
      interviewPrepTool,
      coverLetterTool,
      emailTemplateTool,
      skillGapTool,
    ];
    
    this.model = geminiModel;
    this.agent = null;
    this.executor = null;
    // Memory kaldırıldı - browser compatibility için
  }

  async initialize() {
    try {
      console.log('🤖 Real Career Agent başlatılıyor...');
      
      // Agent prompt template
      const prompt = PromptTemplate.fromTemplate(`
        Sen CareerMatch AI Agent'ısın. Kariyer danışmanlığı ve iş başvuru süreçleri konusunda uzmansın.
        
        Mevcut araçların:
        - cv_analyzer: CV'yi detaylı analiz eder, güçlü yanları, eksiklikleri ve önerileri belirler
        - interview_preparator: Kapsamlı mülakat hazırlığı oluşturur
        - cover_letter_generator: Kişiselleştirilmiş ön yazı oluşturur
        - email_template_generator: Profesyonel başvuru emaili şablonu oluşturur
        - skill_gap_analyzer: CV ve iş ilanı arasındaki beceri boşluklarını analiz eder
        
        Kullanıcının isteğine göre en uygun aracı seç ve kullan.
        Her zaman Türkçe cevap ver.
        
        Kullanıcı sorusu: {input}
        
        {agent_scratchpad}
      `);

      // Agent oluştur
      this.agent = await createOpenAIFunctionsAgent({
        llm: this.model,
        tools: this.tools,
        prompt: prompt,
      });

      // Agent executor oluştur
      this.executor = new AgentExecutor({
        agent: this.agent,
        tools: this.tools,
        verbose: true,
        maxIterations: 5,
        returnIntermediateSteps: true,
      });

      console.log('✅ Real Career Agent başarıyla başlatıldı');
      return true;
    } catch (error) {
      console.error('❌ Real Agent başlatma hatası:', error);
      return false;
    }
  }

  async runTask(task, context = {}) {
    try {
      if (!this.executor) {
        await this.initialize();
      }

      const input = {
        input: task,
        ...context
      };

      console.log('🤖 Real Agent görevi başlatılıyor:', task);
      const result = await this.executor.invoke(input);
      
      console.log('✅ Real Agent görevi tamamlandı');
      return result;
    } catch (error) {
      console.error('❌ Real Agent görevi hatası:', error);
      return { error: error.message };
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

  async getConversationHistory() {
    // Memory kaldırıldı - browser compatibility için
    return [];
  }

  async clearMemory() {
    // Memory kaldırıldı - browser compatibility için
    console.log('✅ Agent belleği temizlendi (simulated)');
  }
}

export default RealCareerAgent; 
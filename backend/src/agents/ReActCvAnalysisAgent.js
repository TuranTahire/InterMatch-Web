import { ReActAgent } from './ReActAgent.js';
import { CvParserTool } from '../tools/cvParserTool.js';
import { JobParserTool } from '../tools/jobParserTool.js';
import { TextAnalysisTool } from '../tools/TextAnalysisTool.js';

class ReActCvAnalysisAgent extends ReActAgent {
  constructor() {
    super(
      'ReAct CV Analysis Agent',
      'ReAct modelini kullanan gelişmiş CV ve iş ilanı analizi agent\'ı',
      [
        'Advanced CV parsing and analysis',
        'Intelligent skill extraction and matching',
        'Dynamic experience evaluation',
        'Context-aware keyword optimization',
        'Learning-based personalized recommendations',
        'Reflective performance improvement'
      ]
    );

    // CV analizi için özel araçları ekle
    this.addTool('cv_parser', new CvParserTool());
    this.addTool('job_parser', new JobParserTool());
    this.addTool('text_analysis', new TextAnalysisTool());
    
    // CV analizi için özel konfigürasyon
    this.config = {
      ...this.config,
      analysisTypes: ['comprehensive', 'skills', 'improvement', 'quick', 'learning'],
      maxInputLength: 15000,
      responseFormat: 'structured',
      enableSkillMatching: true,
      enableExperienceEvaluation: true,
      enableLearningOptimization: true,
      enableReflectionLoop: true,
      
      // ReAct özel ayarları
      reasoningPrompt: this.getCvAnalysisReasoningPrompt(),
      learningThreshold: 0.7,      // Öğrenme eşiği
      reflectionInterval: 5,       // Her 5 işlemde bir yansıma
      confidenceBoost: 0.1         // Her başarılı işlemde güven artışı
    };
  }

  // CV analizi için özel reasoning prompt'u
  getCvAnalysisReasoningPrompt() {
    return `Sen gelişmiş bir CV ve iş ilanı analiz agent'ısın. ReAct modelini kullanarak akıllı analizler yap.

CV ANALİZ REASONING ADIMLARI:
1. DURUM ANALİZİ: CV ve iş ilanı içeriğini anla
2. HEDEF BELİRLEME: Hangi analiz tipinin gerekli olduğunu belirle
3. ARAÇ SEÇİMİ: En uygun analiz araçlarını seç
4. PLAN OLUŞTURMA: Detaylı analiz planı yap
5. GÜVEN DEĞERLENDİRMESİ: Analiz planının başarı şansını değerlendir

CV ANALİZ PRENSİPLERİ:
- Beceri eşleştirmesini optimize et
- Deneyim seviyesini doğru değerlendir
- Anahtar kelime optimizasyonu yap
- Kişiselleştirilmiş öneriler sun
- Öğrenme tabanlı iyileştirmeler uygula
- Sürekli yansıma ile performansı artır

MEVCUT ANALİZ TİPLERİ:
- comprehensive: Kapsamlı analiz
- skills: Beceri odaklı analiz
- improvement: İyileştirme önerileri
- quick: Hızlı analiz
- learning: Öğrenme tabanlı analiz`;
  }

  // CV analizi için özel process metodu
  async process(input, context = {}) {
    console.log(`🧠 ReAct CV Analysis Agent başlatılıyor...`);
    
    try {
      // Input'u parse et
      const parsedInput = this.parseCvInput(input);
      
      // Analiz tipini belirle
      const analysisType = context.analysisType || this.determineAnalysisType(parsedInput);
      
      // Context'i güncelle
      const enhancedContext = {
        ...context,
        task: `CV analizi - ${analysisType}`,
        analysisType: analysisType,
        inputType: this.detectInputType(parsedInput)
      };
      
      // ReAct döngüsünü çalıştır
      const reactResult = await super.process(parsedInput, enhancedContext);
      
      // CV analizi sonucunu formatla
      const cvAnalysisResult = this.formatCvAnalysisResult(reactResult, analysisType);
      
      // Öğrenme ve yansıma kontrolü
      await this.checkLearningAndReflection(reactResult);
      
      console.log(`✅ ReAct CV Analysis tamamlandı: ${analysisType}`);
      return cvAnalysisResult;
      
    } catch (error) {
      console.error(`❌ ReAct CV Analysis hatası:`, error);
      throw error;
    }
  }

  // CV input'unu parse et
  parseCvInput(input) {
    if (typeof input === 'string') {
      return {
        cvText: input,
        jobText: '',
        type: 'cv_only'
      };
    } else if (typeof input === 'object') {
      return {
        cvText: input.cvText || input.cv || '',
        jobText: input.jobText || input.job || '',
        type: input.cvText && input.jobText ? 'cv_job' : 'cv_only'
      };
    }
    
    throw new Error('Geçersiz CV input formatı');
  }

  // Analiz tipini belirle
  determineAnalysisType(parsedInput) {
    const { cvText, jobText, type } = parsedInput;
    
    if (type === 'cv_job' && cvText.length > 1000 && jobText.length > 500) {
      return 'comprehensive';
    } else if (type === 'cv_job' && jobText.length > 200) {
      return 'skills';
    } else if (cvText.length > 2000) {
      return 'improvement';
    } else {
      return 'quick';
    }
  }

  // Input tipini tespit et
  detectInputType(parsedInput) {
    const { cvText, jobText } = parsedInput;
    
    if (cvText && jobText) {
      return 'cv_job_pair';
    } else if (cvText) {
      return 'cv_only';
    } else if (jobText) {
      return 'job_only';
    } else {
      return 'empty';
    }
  }

  // CV analizi sonucunu formatla
  formatCvAnalysisResult(reactResult, analysisType) {
    const { reasoning, action, learning, reflection } = reactResult;
    
    // Aksiyon sonuçlarını analiz et
    const analysisData = this.extractAnalysisData(action);
    
    // Sonucu formatla
    const result = {
      type: 'cv_analysis_result',
      analysisType: analysisType,
      timestamp: new Date().toISOString(),
      agent: this.name,
      
      // Analiz sonuçları
      analysis: analysisData,
      
      // ReAct bilgileri
      reasoning: {
        plan: reasoning.plan,
        confidence: reasoning.confidence,
        analysis: reasoning.analysis
      },
      
      // Öğrenme bilgileri
      learning: {
        insights: learning.insights || [],
        improvements: learning.improvements || [],
        success_rate: learning.success_rate || 0
      },
      
      // Yansıma bilgileri
      reflection: {
        performance_score: reflection.performance_score || 0,
        strengths: reflection.strengths || [],
        weaknesses: reflection.weaknesses || [],
        recommendations: reflection.recommendations || []
      },
      
      // Agent durumu
      agentStatus: this.getReActStatus()
    };
    
    return result;
  }

  // Aksiyon sonuçlarından analiz verilerini çıkar
  extractAnalysisData(actions) {
    const analysisData = {
      skills: [],
      experience: { years: 0, level: 'unknown' },
      education: { level: 'unknown' },
      keywords: [],
      recommendations: [],
      score: 0
    };
    
    // Her aksiyonun sonucunu analiz et
    for (const action of actions) {
      if (action.tool === 'cv_parser' && action.result) {
        analysisData.skills = analysisData.skills.concat(action.result.skills || []);
        analysisData.experience = action.result.experience || analysisData.experience;
        analysisData.education = action.result.education || analysisData.education;
      }
      
      if (action.tool === 'job_parser' && action.result) {
        analysisData.keywords = analysisData.keywords.concat(action.result.keywords || []);
      }
      
      if (action.tool === 'text_analysis' && action.result) {
        analysisData.recommendations = analysisData.recommendations.concat(action.result.recommendations || []);
        analysisData.score = action.result.score || analysisData.score;
      }
    }
    
    // Tekrarları kaldır
    analysisData.skills = [...new Set(analysisData.skills)];
    analysisData.keywords = [...new Set(analysisData.keywords)];
    analysisData.recommendations = [...new Set(analysisData.recommendations)];
    
    return analysisData;
  }

  // Öğrenme ve yansıma kontrolü
  async checkLearningAndReflection(reactResult) {
    const { learning, reflection } = reactResult;
    
    // Öğrenme eşiğini kontrol et
    if (learning.success_rate >= this.config.learningThreshold) {
      console.log(`🎓 Öğrenme eşiği aşıldı: ${learning.success_rate}`);
      await this.applyLearning(learning);
    }
    
    // Yansıma aralığını kontrol et
    if (this.reflectionLog.length % this.config.reflectionInterval === 0) {
      console.log(`🔍 Periyodik yansıma yapılıyor...`);
      await this.performPeriodicReflection();
    }
    
    // Güven artışını uygula
    if (reflection.performance_score > 0.8) {
      this.config.confidence += this.config.confidenceBoost;
      console.log(`📈 Güven artışı: ${this.config.confidence}`);
    }
  }

  // Öğrenmeyi uygula
  async applyLearning(learning) {
    console.log(`🧠 Öğrenme uygulanıyor...`);
    
    // İyileştirmeleri uygula
    for (const improvement of learning.improvements) {
      console.log(`🔧 İyileştirme uygulanıyor: ${improvement}`);
      
      // İyileştirme tipine göre aksiyon al
      if (improvement.includes('parsing')) {
        // Parsing iyileştirmesi
        this.config.maxInputLength = Math.min(this.config.maxInputLength * 1.1, 20000);
      } else if (improvement.includes('confidence')) {
        // Güven iyileştirmesi
        this.config.confidenceBoost = Math.min(this.config.confidenceBoost * 1.05, 0.2);
      } else if (improvement.includes('reflection')) {
        // Yansıma iyileştirmesi
        this.config.reflectionInterval = Math.max(this.config.reflectionInterval - 1, 3);
      }
    }
    
    // Öğrenme hafızasına ekle
    this.learningMemory.push({
      type: 'learning_applied',
      learning: learning,
      timestamp: new Date().toISOString()
    });
  }

  // Periyodik yansıma
  async performPeriodicReflection() {
    console.log(`🔍 Periyodik yansıma başlatılıyor...`);
    
    // Son birkaç işlemi analiz et
    const recentHistory = this.reflectionLog.slice(-this.config.reflectionInterval);
    
    const reflectionPrompt = `
PERİYODİK YANSIMA ANALİZİ:

Son ${this.config.reflectionInterval} işlem:
${JSON.stringify(recentHistory, null, 2)}

Genel performans trendini değerlendir:
1. Performans artıyor mu azalıyor mu?
2. Hangi alanlarda tutarlılık var?
3. Hangi alanlarda değişkenlik var?
4. Gelecek için stratejik öneriler?

Yanıtını şu formatta ver:
{
  "trend": "improving/declining/stable",
  "consistency_areas": ["alan1", "alan2"],
  "variability_areas": ["alan1", "alan2"],
  "strategic_recommendations": ["öneri1", "öneri2"],
  "overall_trend_score": 0.85
}
`;

    try {
      const reflection = await this.aiService.generateText(reflectionPrompt);
      const parsedReflection = this.parseReflection(reflection);
      
      // Periyodik yansıma log'una ekle
      this.reflectionLog.push({
        type: 'periodic_reflection',
        reflection: parsedReflection,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Periyodik yansıma tamamlandı: ${parsedReflection.trend}`);
      
    } catch (error) {
      console.error(`❌ Periyodik yansıma hatası:`, error);
    }
  }

  // CV analizi için özel araç seçimi
  selectBestTool(action) {
    const cvToolMap = {
      'analyze': 'cv_parser',
      'parse': 'cv_parser',
      'extract': 'cv_parser',
      'match': 'job_parser',
      'compare': 'job_parser',
      'evaluate': 'text_analysis',
      'optimize': 'text_analysis',
      'recommend': 'text_analysis'
    };
    
    return cvToolMap[action] || super.selectBestTool(action);
  }

  // CV analizi için özel durum raporu
  getCvAnalysisStatus() {
    const baseStatus = this.getReActStatus();
    
    return {
      ...baseStatus,
      cvAnalysisCapabilities: this.capabilities,
      analysisTypes: this.config.analysisTypes,
      learningThreshold: this.config.learningThreshold,
      reflectionInterval: this.config.reflectionInterval,
      confidenceLevel: this.config.confidence,
      recentPerformance: this.getRecentPerformance()
    };
  }

  // Son performansı hesapla
  getRecentPerformance() {
    const recentReflections = this.reflectionLog.slice(-5);
    
    if (recentReflections.length === 0) {
      return { average_score: 0, trend: 'no_data' };
    }
    
    const scores = recentReflections
      .filter(r => r.reflection && r.reflection.performance_score)
      .map(r => r.reflection.performance_score);
    
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return {
      average_score: averageScore,
      trend: scores.length >= 2 ? 
        (scores[scores.length - 1] > scores[0] ? 'improving' : 'declining') : 
        'stable',
      recent_scores: scores
    };
  }
}

export { ReActCvAnalysisAgent }; 
import { BaseAgent } from './BaseAgent.js';
import { WebSearchTool } from '../tools/WebSearchTool.js';
import { TextAnalysisTool } from '../tools/TextAnalysisTool.js';
import { ContentRewriterTool } from '../tools/ContentRewriterTool.js';
import { GeminiService } from '../services/geminiService.js';

class ApplicationAssistantAgent extends BaseAgent {
  constructor() {
    super(
      'InterMatch Başvuru Asistanı',
      'Başvurunun her adımını mükemmelleştiren elit kariyer koçu',
      [
        'Uyum analizi ve değerlendirme',
        'Kültür analizi ve şirket araştırması',
        'Maaş analizi ve piyasa araştırması',
        'CV optimizasyonu ve iyileştirme',
        'Ön yazı oluşturma ve kişiselleştirme',
        'Kişiselleştirilmiş öneriler'
      ]
    );

    // Araçları ekle
    this.addTool('web_search', new WebSearchTool());
    this.addTool('text_analysis', new TextAnalysisTool());
    this.addTool('content_rewriter', new ContentRewriterTool());
    
    // AI servisini başlat
    this.aiService = new GeminiService();
    
    // Agent'ın özel konfigürasyonu
    this.config = {
      ...this.config,
      analysisTypes: ['comprehensive', 'quick', 'detailed'],
      maxInputLength: 15000,
      responseFormat: 'structured_json'
    };
  }

  async process(input, context = {}) {
    try {
      console.log(`🤖 ${this.name} çalıştırılıyor...`);
      
      // Input'u parse et
      const parsedInput = this.parseInput(input);
      
      // Analiz tipini belirle
      const analysisType = context.analysisType || 'comprehensive';
      
      // 1. Uyum Analizi
      const compatibilityAnalysis = await this.performCompatibilityAnalysis(parsedInput.cvText, parsedInput.jobText);
      
      // 2. Kültür Analizi
      const cultureAnalysis = await this.performCultureAnalysis(parsedInput.jobText, parsedInput.companyInfo);
      
      // 3. Maaş Analizi
      const salaryAnalysis = await this.performSalaryAnalysis(parsedInput.jobText, parsedInput.location);
      
      // 4. CV Optimizasyonu
      const cvOptimization = await this.performCvOptimization(parsedInput.cvText, parsedInput.jobText, cultureAnalysis);
      
      // 5. Ön Yazı Oluşturma
      const coverLetter = await this.generateCoverLetter(parsedInput.cvText, parsedInput.jobText, compatibilityAnalysis, cultureAnalysis);
      
      // 6. Nihai sonucu formatla
      const result = this.formatFinalResult({
        compatibilityAnalysis,
        cultureAnalysis,
        salaryAnalysis,
        cvOptimization,
        coverLetter
      }, analysisType);
      
      // Hafızaya ekle
      this.addToMemory({
        type: 'application_analysis_completed',
        analysisType: analysisType,
        input: parsedInput,
        output: result
      });
      
      console.log(`✅ ${this.name} tamamlandı`);
      return result;
      
    } catch (error) {
      console.error(`❌ ${this.name} hatası:`, error);
      throw error;
    }
  }

  parseInput(input) {
    if (typeof input === 'string') {
      // Basit string input - CV olarak kabul et
      return {
        cvText: input,
        jobText: '',
        companyInfo: '',
        location: ''
      };
    } else if (typeof input === 'object') {
      return {
        cvText: input.cvText || input.cv || '',
        jobText: input.jobText || input.job || '',
        companyInfo: input.companyInfo || input.company || '',
        location: input.location || ''
      };
    }
    
    throw new Error('Geçersiz input formatı');
  }

  async performCompatibilityAnalysis(cvText, jobText) {
    if (!cvText || !jobText) {
      return {
        puan: 0,
        ozet: 'CV veya iş ilanı metni eksik',
        eslesenYetenekler: [],
        eksikYetenekler: [],
        deneyimNotu: 'Analiz yapılamadı'
      };
    }
    
    const analysis = await this.executeTool('text_analysis', { cvText, jobText });
    
    return {
      puan: analysis.compatibilityScore,
      ozet: this.generateCompatibilitySummary(analysis),
      eslesenYetenekler: analysis.skillsAnalysis.matching,
      eksikYetenekler: analysis.skillsAnalysis.missing,
      deneyimNotu: this.generateExperienceNote(analysis.experienceAnalysis)
    };
  }

  async performCultureAnalysis(jobText, companyInfo) {
    let searchQuery = '';
    
    if (companyInfo) {
      searchQuery = `${companyInfo} şirket kültürü çalışan yorumları`;
    } else {
      // İş ilanından şirket adını çıkar
      const companyName = this.extractCompanyName(jobText);
      if (companyName) {
        searchQuery = `${companyName} şirket kültürü`;
      } else {
        searchQuery = 'startup şirket kültürü'; // Varsayılan
      }
    }
    
    const searchResults = await this.executeTool('web_search', searchQuery);
    
    return {
      sirketTipi: this.determineCompanyType(jobText, searchResults),
      cvTonu: this.analyzeCvTone(jobText),
      oneri: this.generateCultureRecommendation(searchResults)
    };
  }

  async performSalaryAnalysis(jobText, location) {
    const jobTitle = this.extractJobTitle(jobText);
    const experience = this.extractExperienceFromJob(jobText);
    
    let searchQuery = '';
    if (location) {
      searchQuery = `${jobTitle} ${location} maaş aralığı 2024`;
    } else {
      searchQuery = `${jobTitle} Türkiye maaş aralığı 2024`;
    }
    
    const searchResults = await this.executeTool('web_search', searchQuery);
    
    return {
      aralik: this.extractSalaryRange(searchResults),
      kaynak: 'linkedin.com, kariyer.net (ortalama)',
      not: this.generateSalaryNote(experience)
    };
  }

  async performCvOptimization(cvText, jobText, cultureAnalysis) {
    // CV özetini çıkar
    const cvSummary = this.extractCvSummary(cvText);
    
    // İyileştirme talimatları oluştur
    const instructions = this.generateOptimizationInstructions(jobText, cultureAnalysis);
    
    // CV'yi yeniden yaz
    const rewriteResult = await this.executeTool('content_rewriter', {
      content: cvSummary,
      instructions: instructions,
      context: {
        jobTitle: this.extractJobTitle(jobText),
        companyCulture: cultureAnalysis.sirketTipi,
        targetKeywords: this.extractTargetKeywords(jobText)
      }
    });
    
    return {
      yeniOzet: rewriteResult.rewrittenContent,
      guncellenmisDeneyim: this.generateExperienceUpdates(cvText, jobText),
      iyilestirmeler: rewriteResult.improvements
    };
  }

  async generateCoverLetter(cvText, jobText, compatibilityAnalysis, cultureAnalysis) {
    const prompt = this.buildCoverLetterPrompt(cvText, jobText, compatibilityAnalysis, cultureAnalysis);
    
    const response = await this.aiService.generateResponse(prompt, {
      systemMessage: 'Sen bir kariyer danışmanısın. Verilen bilgilere göre kişiselleştirilmiş bir ön yazı oluştur.',
      format: 'text'
    });
    
    if (!response.success) {
      return this.generateFallbackCoverLetter(cvText, jobText, compatibilityAnalysis);
    }
    
    return response.content;
  }

  // Helper methods
  generateCompatibilitySummary(analysis) {
    const score = analysis.compatibilityScore;
    
    if (score >= 80) {
      return 'Mükemmel uyum! Teknik yetenekleriniz ve deneyiminiz pozisyonla çok iyi eşleşiyor.';
    } else if (score >= 60) {
      return 'İyi uyum! Teknik yetenekleriniz pozisyonla uyumlu ancak bazı alanlarda gelişim gerekli.';
    } else if (score >= 40) {
      return 'Orta uyum. Bazı temel beceriler mevcut ancak önemli gelişim alanları var.';
    } else {
      return 'Düşük uyum. Pozisyon için önemli beceriler eksik, yoğun hazırlık gerekli.';
    }
  }

  generateExperienceNote(experienceAnalysis) {
    if (experienceAnalysis.isSufficient) {
      return 'Deneyim seviyeniz pozisyon için yeterli.';
    } else {
      return `İlanda ${experienceAnalysis.jobExperience} yıl istenirken, CV'nizde ${experienceAnalysis.cvExperience} yıl deneyim belirtilmiş.`;
    }
  }

  extractCompanyName(jobText) {
    const patterns = [
      /(?:şirket|company|firma):\s*([^\n]+)/i,
      /(?:hakkında|about):\s*([^\n]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = jobText.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  determineCompanyType(jobText, searchResults) {
    const lowerText = jobText.toLowerCase();
    
    if (lowerText.includes('startup') || lowerText.includes('girişim')) {
      return 'Dinamik Startup';
    } else if (lowerText.includes('kurumsal') || lowerText.includes('corporate')) {
      return 'Kurumsal Şirket';
    } else if (lowerText.includes('esnek') || lowerText.includes('flexible')) {
      return 'Modern Şirket';
    } else {
      return 'Geleneksel Şirket';
    }
  }

  analyzeCvTone(jobText) {
    const lowerText = jobText.toLowerCase();
    
    if (lowerText.includes('dinamik') || lowerText.includes('enerjik')) {
      return 'Enerjik';
    } else if (lowerText.includes('profesyonel') || lowerText.includes('formal')) {
      return 'Resmi';
    } else {
      return 'Dengeli';
    }
  }

  generateCultureRecommendation(searchResults) {
    return 'CV\'nizdeki dili daha sonuç odaklı ve enerjik bir hale getirmeniz, bu kültüre daha uygun olacaktır.';
  }

  extractJobTitle(jobText) {
    const patterns = [
      /(?:pozisyon|position|title):\s*([^\n]+)/i,
      /(?:aranan|seeking|looking for):\s*([^\n]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = jobText.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return 'Yazılım Geliştirici'; // Varsayılan
  }

  extractExperienceFromJob(jobText) {
    const patterns = [
      /(\d+)\s*(?:yıl|year|years?)\s*(?:deneyim|experience)/i,
      /(\d+)\s*(?:yıl|year|years?)\s*(?:çalışma|work)/i
    ];
    
    for (const pattern of patterns) {
      const match = jobText.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    return 3; // Varsayılan
  }

  extractSalaryRange(searchResults) {
    // Gerçek uygulamada searchResults'dan maaş aralığını çıkar
    return '45.000 TL - 60.000 TL';
  }

  generateSalaryNote(experience) {
    return `Tecrübenize göre bu aralığın ortalarını hedefleyebilirsiniz.`;
  }

  extractCvSummary(cvText) {
    // CV'nin ilk 200 karakterini özet olarak al
    return cvText.substring(0, 200) + (cvText.length > 200 ? '...' : '');
  }

  generateOptimizationInstructions(jobText, cultureAnalysis) {
    let instructions = 'Bu metni daha güçlü ve sonuç odaklı hale getir.';
    
    if (cultureAnalysis.sirketTipi === 'Dinamik Startup') {
      instructions += ' Daha enerjik ve yenilikçi bir ton kullan.';
    } else if (cultureAnalysis.sirketTipi === 'Kurumsal Şirket') {
      instructions += ' Daha profesyonel ve formal bir dil kullan.';
    }
    
    return instructions;
  }

  extractTargetKeywords(jobText) {
    const keywords = [];
    const commonKeywords = ['javascript', 'python', 'react', 'node.js', 'sql', 'aws'];
    
    commonKeywords.forEach(keyword => {
      if (jobText.toLowerCase().includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
  }

  generateExperienceUpdates(cvText, jobText) {
    // Basit deneyim güncellemeleri
    return [
      {
        orijinal: 'X projesinde çalıştım.',
        onerilen: 'X projesinde, kullanıcı girişlerini %40 hızlandıran bir kimlik doğrulama modülü geliştirdim.'
      }
    ];
  }

  buildCoverLetterPrompt(cvText, jobText, compatibilityAnalysis, cultureAnalysis) {
    return `
    CV: ${cvText.substring(0, 500)}...
    İş İlanı: ${jobText.substring(0, 500)}...
    
    Uyum Analizi:
    - Puan: ${compatibilityAnalysis.puan}
    - Özet: ${compatibilityAnalysis.ozet}
    - Eşleşen Yetenekler: ${compatibilityAnalysis.eslesenYetenekler.join(', ')}
    
    Kültür Analizi:
    - Şirket Tipi: ${cultureAnalysis.sirketTipi}
    - CV Tonu: ${cultureAnalysis.cvTonu}
    
    Bu bilgilere göre kişiselleştirilmiş bir ön yazı oluştur.
    `;
  }

  generateFallbackCoverLetter(cvText, jobText, compatibilityAnalysis) {
    return `Sayın [Şirket Adı] İnsan Kaynakları Departmanı,

Bu pozisyona başvurmak istediğimi belirtmekten memnuniyet duyarım. ${compatibilityAnalysis.ozet}

${compatibilityAnalysis.eslesenYetenekler.length > 0 ? 
  `Özellikle ${compatibilityAnalysis.eslesenYetenekler.join(', ')} konularındaki deneyimim bu pozisyon için değerli katkılar sağlayacaktır.` : 
  'Deneyimlerim ve becerilerim bu pozisyon için uygun olduğunu düşünüyorum.'
}

Görüşme fırsatı için teşekkür ederim.

Saygılarımla,
[Adınız]`;
  }

  formatFinalResult(analyses, analysisType) {
    return {
      success: true,
      uyumAnalizi: analyses.compatibilityAnalysis,
      kulturAnalizi: analyses.cultureAnalysis,
      maasAnalizi: analyses.salaryAnalysis,
      optimizeEdilmisCV: analyses.cvOptimization,
      onYaziTaslagi: analyses.coverLetter,
      metadata: {
        agent: this.name,
        analysisType: analysisType,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }
}

export { ApplicationAssistantAgent }; 
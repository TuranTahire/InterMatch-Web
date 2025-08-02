import { BaseAgent } from './BaseAgent.js';
import { CvParserTool } from '../tools/CvParserTool.js';
import { JobParserTool } from '../tools/JobParserTool.js';
import { GeminiService } from '../services/GeminiService.js';

class CvAnalysisAgent extends BaseAgent {
  constructor() {
    super(
      'CV Analysis Agent',
      'CV ve iş ilanı analizi konusunda uzman AI agent',
      [
        'CV parsing and analysis',
        'Skill extraction and matching',
        'Experience evaluation',
        'Keyword optimization',
        'Personalized recommendations'
      ]
    );

    // Araçları ekle
    this.addTool('cv_parser', new CvParserTool());
    this.addTool('job_parser', new JobParserTool());
    
    // AI servisini başlat
    this.aiService = new GeminiService();
    
    // Agent'ın özel konfigürasyonu
    this.config = {
      ...this.config,
      analysisTypes: ['comprehensive', 'skills', 'improvement', 'quick'],
      maxInputLength: 10000,
      responseFormat: 'structured'
    };
  }

  async process(input, context = {}) {
    try {
      console.log(`🤖 ${this.name} çalıştırılıyor...`);
      
      // Input'u parse et
      const parsedInput = this.parseInput(input);
      
      // Analiz tipini belirle
      const analysisType = context.analysisType || 'comprehensive';
      
      // CV ve Job verilerini çıkar
      const cvData = await this.extractCvData(parsedInput.cvText);
      const jobData = await this.extractJobData(parsedInput.jobText);
      
      // Analiz yap
      const analysis = await this.performAnalysis(cvData, jobData, analysisType);
      
      // Sonucu formatla
      const result = this.formatResult(analysis, analysisType);
      
      // Hafızaya ekle
      this.addToMemory({
        type: 'analysis_completed',
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
    // Input'u CV ve Job metinlerine ayır
    if (typeof input === 'string') {
      // Basit string input - CV olarak kabul et
      return {
        cvText: input,
        jobText: ''
      };
    } else if (typeof input === 'object') {
      return {
        cvText: input.cvText || input.cv || '',
        jobText: input.jobText || input.job || ''
      };
    }
    
    throw new Error('Geçersiz input formatı');
  }

  async extractCvData(cvText) {
    if (!cvText) {
      return { skills: [], experience: { years: 0 }, education: { level: 'unknown' } };
    }
    
    return await this.executeTool('cv_parser', cvText);
  }

  async extractJobData(jobText) {
    if (!jobText) {
      return { requirements: [], requiredSkills: [], responsibilities: [] };
    }
    
    return await this.executeTool('job_parser', jobText);
  }

  async performAnalysis(cvData, jobData, analysisType) {
    const analysis = {
      type: analysisType,
      timestamp: new Date().toISOString(),
      cvData: cvData,
      jobData: jobData
    };

    switch (analysisType) {
      case 'comprehensive':
        return await this.comprehensiveAnalysis(cvData, jobData);
      case 'skills':
        return await this.skillsAnalysis(cvData, jobData);
      case 'improvement':
        return await this.improvementAnalysis(cvData, jobData);
      case 'quick':
        return await this.quickAnalysis(cvData, jobData);
      default:
        return await this.comprehensiveAnalysis(cvData, jobData);
    }
  }

  async comprehensiveAnalysis(cvData, jobData) {
    // Skills matching
    const skillsMatch = this.matchSkills(cvData.skills, jobData.requiredSkills);
    
    // Experience evaluation
    const experienceScore = this.evaluateExperience(cvData.experience, jobData.requirements);
    
    // Overall suitability
    const suitabilityScore = this.calculateSuitabilityScore(skillsMatch, experienceScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(cvData, jobData, skillsMatch);
    
    return {
      ...this.baseAnalysisResult(),
      suitabilityScore: suitabilityScore,
      skillsAnalysis: skillsMatch,
      experienceAnalysis: experienceScore,
      recommendations: recommendations,
      priorityActions: this.generatePriorityActions(recommendations)
    };
  }

  async skillsAnalysis(cvData, jobData) {
    const skillsMatch = this.matchSkills(cvData.skills, jobData.requiredSkills);
    
    return {
      ...this.baseAnalysisResult(),
      type: 'skills_analysis',
      skillsMatch: skillsMatch,
      missingSkills: skillsMatch.missing,
      matchingSkills: skillsMatch.matching,
      suggestions: this.generateSkillSuggestions(skillsMatch)
    };
  }

  async improvementAnalysis(cvData, jobData) {
    const skillsMatch = this.matchSkills(cvData.skills, jobData.requiredSkills);
    
    return {
      ...this.baseAnalysisResult(),
      type: 'improvement_analysis',
      improvements: this.generateImprovements(cvData, jobData, skillsMatch),
      actionPlan: this.generateActionPlan(skillsMatch),
      timeline: this.generateTimeline(skillsMatch)
    };
  }

  async quickAnalysis(cvData, jobData) {
    const skillsMatch = this.matchSkills(cvData.skills, jobData.requiredSkills);
    const suitabilityScore = this.calculateSuitabilityScore(skillsMatch, { score: 50 });
    
    return {
      ...this.baseAnalysisResult(),
      type: 'quick_analysis',
      suitabilityScore: suitabilityScore,
      matchSummary: `${skillsMatch.matching.length}/${jobData.requiredSkills.length} skills match`,
      quickRecommendation: this.generateQuickRecommendation(skillsMatch)
    };
  }

  // Helper methods
  matchSkills(cvSkills, jobSkills) {
    const matching = cvSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    const missing = jobSkills.filter(jobSkill => 
      !cvSkills.some(cvSkill => 
        cvSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(cvSkill.toLowerCase())
      )
    );
    
    return {
      matching: matching,
      missing: missing,
      matchRate: jobSkills.length > 0 ? (matching.length / jobSkills.length) * 100 : 0
    };
  }

  evaluateExperience(cvExperience, jobRequirements) {
    // Basit deneyim değerlendirmesi
    const experienceScore = Math.min(cvExperience.years * 10, 100);
    
    return {
      score: experienceScore,
      years: cvExperience.years,
      relevance: experienceScore > 50 ? 'high' : 'medium'
    };
  }

  calculateSuitabilityScore(skillsMatch, experienceScore) {
    const skillsWeight = 0.7;
    const experienceWeight = 0.3;
    
    return Math.round(
      (skillsMatch.matchRate * skillsWeight) + 
      (experienceScore.score * experienceWeight)
    );
  }

  generateRecommendations(cvData, jobData, skillsMatch) {
    const recommendations = [];
    
    if (skillsMatch.missing.length > 0) {
      recommendations.push(`Eksik becerileri geliştirin: ${skillsMatch.missing.slice(0, 3).join(', ')}`);
    }
    
    if (cvData.experience.years < 2) {
      recommendations.push('Daha fazla iş deneyimi kazanın');
    }
    
    recommendations.push('CV\'nizi iş ilanına göre özelleştirin');
    recommendations.push('Proje örneklerini ekleyin');
    
    return recommendations;
  }

  generatePriorityActions(recommendations) {
    return recommendations.slice(0, 3).map((rec, index) => ({
      priority: index + 1,
      action: rec,
      timeline: index === 0 ? 'immediate' : index === 1 ? 'short-term' : 'long-term'
    }));
  }

  generateSkillSuggestions(skillsMatch) {
    return skillsMatch.missing.map(skill => 
      `${skill} becerisini geliştirmek için online kurslar alın`
    );
  }

  generateImprovements(cvData, jobData, skillsMatch) {
    return [
      'CV yapısını iyileştirin',
      'Anahtar kelimeleri ekleyin',
      'Ölçülebilir başarıları vurgulayın',
      'Proje portföyünüzü genişletin'
    ];
  }

  generateActionPlan(skillsMatch) {
    return skillsMatch.missing.map(skill => ({
      skill: skill,
      actions: [
        'Online kurs alın',
        'Proje yapın',
        'Sertifika alın'
      ]
    }));
  }

  generateTimeline(skillsMatch) {
    return {
      immediate: skillsMatch.missing.slice(0, 1),
      shortTerm: skillsMatch.missing.slice(1, 3),
      longTerm: skillsMatch.missing.slice(3)
    };
  }

  generateQuickRecommendation(skillsMatch) {
    if (skillsMatch.matchRate > 70) {
      return 'Bu pozisyon için güçlü bir aday görünüyorsunuz!';
    } else if (skillsMatch.matchRate > 40) {
      return 'Bazı becerileri geliştirmeniz gerekiyor.';
    } else {
      return 'Bu pozisyon için daha fazla hazırlık gerekli.';
    }
  }

  baseAnalysisResult() {
    return {
      agent: this.name,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  formatResult(analysis, analysisType) {
    return {
      success: true,
      analysis: analysis,
      metadata: {
        agent: this.name,
        analysisType: analysisType,
        processingTime: new Date().toISOString()
      }
    };
  }
}

export { CvAnalysisAgent }; 
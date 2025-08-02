import { BaseTool } from './BaseTool.js';

class TextAnalysisTool extends BaseTool {
  constructor() {
    super(
      'text_analysis',
      'CV ve iş ilanı metinlerini analiz ederek uyumluluk, anahtar kelimeler ve deneyim yıllarını çıkarır',
      {
        input: 'object', // { cvText: string, jobText: string }
        output: 'object' // Analiz sonuçları
      }
    );
  }

  async execute(input) {
    try {
      console.log("🔍 Metin analizi yapılıyor...");
      
      const { cvText, jobText } = input;
      
      if (!cvText || !jobText) {
        throw new Error('CV ve iş ilanı metinleri gerekli');
      }
      
      // Anahtar kelime analizi
      const keywordAnalysis = this.analyzeKeywords(cvText, jobText);
      
      // Deneyim analizi
      const experienceAnalysis = this.analyzeExperience(cvText, jobText);
      
      // Beceri analizi
      const skillsAnalysis = this.analyzeSkills(cvText, jobText);
      
      // Uyumluluk skoru hesaplama
      const compatibilityScore = this.calculateCompatibilityScore(keywordAnalysis, experienceAnalysis, skillsAnalysis);
      
      const result = {
        keywordAnalysis: keywordAnalysis,
        experienceAnalysis: experienceAnalysis,
        skillsAnalysis: skillsAnalysis,
        compatibilityScore: compatibilityScore,
        summary: this.generateSummary(keywordAnalysis, experienceAnalysis, skillsAnalysis, compatibilityScore),
        metadata: {
          cvLength: cvText.length,
          jobLength: jobText.length,
          timestamp: new Date().toISOString(),
          tool: this.name
        }
      };
      
      console.log("✅ Metin analizi tamamlandı");
      return result;
      
    } catch (error) {
      console.error("❌ Metin analizi hatası:", error);
      throw new Error(`Metin analizi başarısız: ${error.message}`);
    }
  }

  analyzeKeywords(cvText, jobText) {
    // CV'den anahtar kelimeleri çıkar
    const cvKeywords = this.extractKeywords(cvText);
    
    // İş ilanından anahtar kelimeleri çıkar
    const jobKeywords = this.extractKeywords(jobText);
    
    // Eşleşen ve eksik kelimeleri bul
    const matching = cvKeywords.filter(keyword => 
      jobKeywords.some(jobKeyword => 
        this.isKeywordMatch(keyword, jobKeyword)
      )
    );
    
    const missing = jobKeywords.filter(jobKeyword => 
      !cvKeywords.some(cvKeyword => 
        this.isKeywordMatch(cvKeyword, jobKeyword)
      )
    );
    
    return {
      cvKeywords: cvKeywords,
      jobKeywords: jobKeywords,
      matching: matching,
      missing: missing,
      matchRate: jobKeywords.length > 0 ? (matching.length / jobKeywords.length) * 100 : 0
    };
  }

  extractKeywords(text) {
    const keywords = new Set();
    
    // Teknik terimler
    const technicalTerms = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
      'kubernetes', 'machine learning', 'ai', 'data analysis', 'project management',
      'agile', 'scrum', 'git', 'devops', 'cloud', 'api', 'rest', 'graphql',
      'typescript', 'angular', 'vue', 'mongodb', 'postgresql', 'redis', 'elasticsearch'
    ];
    
    // Yumuşak beceriler
    const softSkills = [
      'iletişim', 'communication', 'liderlik', 'leadership', 'takım çalışması', 'teamwork',
      'problem çözme', 'problem solving', 'analitik düşünme', 'analytical thinking',
      'yaratıcılık', 'creativity', 'adaptasyon', 'adaptation', 'öğrenme', 'learning'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Teknik terimleri ara
    technicalTerms.forEach(term => {
      if (lowerText.includes(term)) {
        keywords.add(term);
      }
    });
    
    // Yumuşak becerileri ara
    softSkills.forEach(skill => {
      if (lowerText.includes(skill)) {
        keywords.add(skill);
      }
    });
    
    // Özel kelimeleri ara (regex ile)
    const specialPatterns = [
      /\b\d+\s*(?:yıl|year|years?)\s*(?:deneyim|experience)\b/gi,
      /\b(?:senior|junior|mid-level|entry-level)\b/gi,
      /\b(?:full-stack|frontend|backend|fullstack)\b/gi,
      /\b(?:remote|uzaktan|hybrid|hibrit)\b/gi
    ];
    
    specialPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => keywords.add(match.toLowerCase()));
      }
    });
    
    return Array.from(keywords);
  }

  isKeywordMatch(keyword1, keyword2) {
    const k1 = keyword1.toLowerCase();
    const k2 = keyword2.toLowerCase();
    
    return k1 === k2 || k1.includes(k2) || k2.includes(k1);
  }

  analyzeExperience(cvText, jobText) {
    // CV'den deneyim yıllarını çıkar
    const cvExperience = this.extractExperienceYears(cvText);
    
    // İş ilanından istenen deneyim yıllarını çıkar
    const jobExperience = this.extractExperienceYears(jobText);
    
    // Deneyim uyumluluğunu hesapla
    const experienceMatch = this.calculateExperienceMatch(cvExperience, jobExperience);
    
    return {
      cvExperience: cvExperience,
      jobExperience: jobExperience,
      match: experienceMatch,
      gap: jobExperience - cvExperience,
      isSufficient: cvExperience >= jobExperience
    };
  }

  extractExperienceYears(text) {
    const patterns = [
      /(\d+)\s*(?:yıl|year|years?)\s*(?:deneyim|experience)/gi,
      /(\d+)\s*(?:yıl|year|years?)\s*(?:çalışma|work)/gi,
      /deneyim.*?(\d+)\s*(?:yıl|year|years?)/gi
    ];
    
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        const years = parseInt(matches[0].match(/\d+/)[0]);
        return years;
      }
    }
    
    return 0;
  }

  calculateExperienceMatch(cvYears, jobYears) {
    if (jobYears === 0) return 100; // İş ilanında deneyim belirtilmemişse
    
    if (cvYears >= jobYears) {
      return 100; // Yeterli deneyim
    } else {
      const ratio = cvYears / jobYears;
      return Math.round(ratio * 100);
    }
  }

  analyzeSkills(cvText, jobText) {
    // CV'den becerileri çıkar
    const cvSkills = this.extractSkills(cvText);
    
    // İş ilanından gerekli becerileri çıkar
    const jobSkills = this.extractSkills(jobText);
    
    // Eşleşen ve eksik becerileri bul
    const matching = cvSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        this.isSkillMatch(skill, jobSkill)
      )
    );
    
    const missing = jobSkills.filter(jobSkill => 
      !cvSkills.some(cvSkill => 
        this.isSkillMatch(cvSkill, jobSkill)
      )
    );
    
    return {
      cvSkills: cvSkills,
      jobSkills: jobSkills,
      matching: matching,
      missing: missing,
      matchRate: jobSkills.length > 0 ? (matching.length / jobSkills.length) * 100 : 0
    };
  }

  extractSkills(text) {
    const skills = new Set();
    
    // Beceri pattern'leri
    const skillPatterns = [
      /(?:skills?|beceriler?|technologies?|tools?|languages?|frameworks?)[:\s]+([^.\n]+)/gi,
      /(?:proficient in|experienced with|knowledge of|uzmanlık|deneyim)[:\s]+([^.\n]+)/gi,
      /(?:expertise in|specialized in|uzmanlık alanı)[:\s]+([^.\n]+)/gi
    ];
    
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const skill = match.replace(/^(?:skills?|beceriler?|technologies?|tools?|languages?|frameworks?|proficient in|experienced with|knowledge of|uzmanlık|deneyim|expertise in|specialized in|uzmanlık alanı)[:\s]+/i, '').trim();
          if (skill) {
            skills.add(skill.toLowerCase());
          }
        });
      }
    });
    
    return Array.from(skills);
  }

  isSkillMatch(skill1, skill2) {
    const s1 = skill1.toLowerCase();
    const s2 = skill2.toLowerCase();
    
    return s1 === s2 || s1.includes(s2) || s2.includes(s1);
  }

  calculateCompatibilityScore(keywordAnalysis, experienceAnalysis, skillsAnalysis) {
    const keywordWeight = 0.4;
    const experienceWeight = 0.3;
    const skillsWeight = 0.3;
    
    const keywordScore = keywordAnalysis.matchRate;
    const experienceScore = experienceAnalysis.match;
    const skillsScore = skillsAnalysis.matchRate;
    
    const totalScore = (
      (keywordScore * keywordWeight) +
      (experienceScore * experienceWeight) +
      (skillsScore * skillsWeight)
    );
    
    return Math.round(totalScore);
  }

  generateSummary(keywordAnalysis, experienceAnalysis, skillsAnalysis, compatibilityScore) {
    const summary = {
      overallScore: compatibilityScore,
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
    
    // Güçlü yanları belirle
    if (keywordAnalysis.matchRate > 70) {
      summary.strengths.push('Anahtar kelime uyumluluğu yüksek');
    }
    
    if (experienceAnalysis.isSufficient) {
      summary.strengths.push('Deneyim seviyesi yeterli');
    }
    
    if (skillsAnalysis.matchRate > 60) {
      summary.strengths.push('Beceri uyumluluğu iyi');
    }
    
    // Zayıf yanları belirle
    if (keywordAnalysis.missing.length > 0) {
      summary.weaknesses.push(`${keywordAnalysis.missing.length} anahtar kelime eksik`);
    }
    
    if (!experienceAnalysis.isSufficient) {
      summary.weaknesses.push(`${experienceAnalysis.gap} yıl deneyim eksik`);
    }
    
    if (skillsAnalysis.missing.length > 0) {
      summary.weaknesses.push(`${skillsAnalysis.missing.length} beceri eksik`);
    }
    
    // Öneriler
    if (keywordAnalysis.missing.length > 0) {
      summary.recommendations.push('CV\'ye eksik anahtar kelimeleri ekleyin');
    }
    
    if (!experienceAnalysis.isSufficient) {
      summary.recommendations.push('Deneyim eksikliğini projelerle telafi edin');
    }
    
    if (skillsAnalysis.missing.length > 0) {
      summary.recommendations.push('Eksik becerileri geliştirin');
    }
    
    return summary;
  }
}

export { TextAnalysisTool }; 
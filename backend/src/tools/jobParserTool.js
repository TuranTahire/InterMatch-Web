import { BaseTool } from './BaseTool.js';

class JobParserTool extends BaseTool {
  constructor() {
    super(
      'job_parser',
      'İş ilanı metnini analiz edip yapılandırılmış JSON formatına çevirir',
      {
        input: 'string', // İş ilanı metni
        output: 'object' // Yapılandırılmış iş ilanı verisi
      }
    );
  }

  async execute(jobText) {
    try {
      console.log("🔍 Job Parser aracı çalıştırılıyor...");
      
      // İş ilanından gereksinimleri çıkar
      const requirements = this.extractRequirements(jobText);
      
      // Gerekli becerileri çıkar
      const requiredSkills = this.extractRequiredSkills(jobText);
      
      // Sorumlulukları çıkar
      const responsibilities = this.extractResponsibilities(jobText);
      
      // Şirket bilgilerini çıkar
      const companyInfo = this.extractCompanyInfo(jobText);
      
      // Pozisyon bilgilerini çıkar
      const positionInfo = this.extractPositionInfo(jobText);
      
      const result = {
        requirements: requirements,
        requiredSkills: requiredSkills,
        responsibilities: responsibilities,
        companyInfo: companyInfo,
        positionInfo: positionInfo,
        summary: this.generateJobSummary(requirements, requiredSkills, responsibilities),
        metadata: {
          textLength: jobText.length,
          extractedAt: new Date().toISOString(),
          tool: this.name
        }
      };
      
      console.log("✅ İş ilanı analizi tamamlandı");
      return result;
    } catch (error) {
      console.error("❌ Job Parser hatası:", error);
      throw new Error(`İş ilanı analizi başarısız: ${error.message}`);
    }
  }

  // Helper methods
  extractRequirements(jobText) {
    if (!jobText || typeof jobText !== 'string') return [];
    
    const requirementPatterns = [
      /(?:requirements?|qualifications?|must have|should have)[:\s]+([^.\n]+)/gi,
      /(?:experience|years? of experience)[:\s]+([^.\n]+)/gi,
      /(?:education|degree|certification)[:\s]+([^.\n]+)/gi
    ];
    
    const requirements = new Set();
    
    requirementPatterns.forEach(pattern => {
      const matches = jobText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const requirement = match.replace(/^(?:requirements?|qualifications?|must have|should have|experience|years? of experience|education|degree|certification)[:\s]+/i, '').trim();
          if (requirement) {
            requirements.add(requirement.toLowerCase());
          }
        });
      }
    });
    
    return Array.from(requirements);
  }

  extractRequiredSkills(jobText) {
    if (!jobText || typeof jobText !== 'string') return [];
    
    const skillPatterns = [
      /(?:skills?|technologies?|tools?|languages?|frameworks?)[:\s]+([^.\n]+)/gi,
      /(?:proficient in|experienced with|knowledge of)[:\s]+([^.\n]+)/gi,
      /(?:expertise in|specialized in)[:\s]+([^.\n]+)/gi
    ];
    
    const skills = new Set();
    
    skillPatterns.forEach(pattern => {
      const matches = jobText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const skill = match.replace(/^(?:skills?|technologies?|tools?|languages?|frameworks?|proficient in|experienced with|knowledge of|expertise in|specialized in)[:\s]+/i, '').trim();
          if (skill) {
            skills.add(skill.toLowerCase());
          }
        });
      }
    });
    
    return Array.from(skills);
  }

  extractResponsibilities(jobText) {
    if (!jobText || typeof jobText !== 'string') return [];
    
    const responsibilityPatterns = [
      /(?:responsibilities?|duties?|tasks?)[:\s]+([^.\n]+)/gi,
      /(?:will be responsible for|will handle|will manage)[:\s]+([^.\n]+)/gi,
      /(?:key responsibilities?|main duties?)[:\s]+([^.\n]+)/gi
    ];
    
    const responsibilities = new Set();
    
    responsibilityPatterns.forEach(pattern => {
      const matches = jobText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const responsibility = match.replace(/^(?:responsibilities?|duties?|tasks?|will be responsible for|will handle|will manage|key responsibilities?|main duties?)[:\s]+/i, '').trim();
          if (responsibility) {
            responsibilities.add(responsibility.toLowerCase());
          }
        });
      }
    });
    
    return Array.from(responsibilities);
  }

  extractCompanyInfo(jobText) {
    if (!jobText || typeof jobText !== 'string') {
      return { name: 'unknown', type: 'unknown', size: 'unknown' };
    }
    
    const companyPatterns = [
      /(?:company|organization|firm)[:\s]+([^.\n]+)/gi,
      /(?:about|who we are)[:\s]+([^.\n]+)/gi
    ];
    
    let companyName = 'unknown';
    let companyType = 'unknown';
    let companySize = 'unknown';
    
    // Basit şirket tipi analizi
    if (jobText.toLowerCase().includes('startup') || jobText.toLowerCase().includes('start-up')) {
      companyType = 'startup';
    } else if (jobText.toLowerCase().includes('corporate') || jobText.toLowerCase().includes('enterprise')) {
      companyType = 'corporate';
    } else if (jobText.toLowerCase().includes('agency') || jobText.toLowerCase().includes('consulting')) {
      companyType = 'agency';
    }
    
    return {
      name: companyName,
      type: companyType,
      size: companySize
    };
  }

  extractPositionInfo(jobText) {
    if (!jobText || typeof jobText !== 'string') {
      return { title: 'unknown', level: 'unknown', type: 'unknown' };
    }
    
    const titlePatterns = [
      /(?:position|role|title)[:\s]+([^.\n]+)/gi,
      /(?:we are looking for|seeking)[:\s]+([^.\n]+)/gi
    ];
    
    let title = 'unknown';
    let level = 'unknown';
    let type = 'unknown';
    
    // Seviye analizi
    if (jobText.toLowerCase().includes('senior') || jobText.toLowerCase().includes('lead')) {
      level = 'senior';
    } else if (jobText.toLowerCase().includes('junior') || jobText.toLowerCase().includes('entry')) {
      level = 'junior';
    } else if (jobText.toLowerCase().includes('mid') || jobText.toLowerCase().includes('intermediate')) {
      level = 'mid';
    }
    
    // İş tipi analizi
    if (jobText.toLowerCase().includes('remote') || jobText.toLowerCase().includes('work from home')) {
      type = 'remote';
    } else if (jobText.toLowerCase().includes('hybrid')) {
      type = 'hybrid';
    } else {
      type = 'onsite';
    }
    
    return {
      title: title,
      level: level,
      type: type
    };
  }

  generateJobSummary(requirements, requiredSkills, responsibilities) {
    return {
      totalRequirements: requirements.length,
      totalSkills: requiredSkills.length,
      totalResponsibilities: responsibilities.length,
      complexity: this.calculateComplexity(requirements, requiredSkills, responsibilities)
    };
  }

  calculateComplexity(requirements, requiredSkills, responsibilities) {
    const total = requirements.length + requiredSkills.length + responsibilities.length;
    
    if (total < 5) return 'low';
    if (total < 10) return 'medium';
    return 'high';
  }
}

export { JobParserTool }; 
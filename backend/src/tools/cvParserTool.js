import { BaseTool } from './BaseTool.js';

class CvParserTool extends BaseTool {
  constructor() {
    super(
      'cv_parser',
      'CV metnini analiz edip yapılandırılmış JSON formatına çevirir',
      {
        input: 'string', // CV metni
        output: 'object' // Yapılandırılmış CV verisi
      }
    );
  }

  async execute(cvText) {
    try {
      console.log("🔍 CV Parser aracı çalıştırılıyor...");
      
      // CV'den becerileri çıkar
      const skills = this.extractSkills(cvText);
      
      // Deneyim bilgilerini çıkar
      const experience = this.extractExperience(cvText);
      
      // Eğitim bilgilerini çıkar
      const education = this.extractEducation(cvText);
      
      // Anahtar kelimeleri çıkar
      const keywords = this.extractKeywords(cvText);
      
      const result = {
        skills: skills,
        experience: experience,
        education: education,
        keywords: keywords,
        summary: this.generateSummary(skills, experience, education),
        metadata: {
          textLength: cvText.length,
          extractedAt: new Date().toISOString(),
          tool: this.name
        }
      };
      
      console.log("✅ CV analizi tamamlandı");
      return result;
    } catch (error) {
      console.error("❌ CV Parser hatası:", error);
      throw new Error(`CV analizi başarısız: ${error.message}`);
    }
  }

  // Helper methods
  extractSkills(text) {
    if (!text || typeof text !== 'string') return [];
    
    const skillPatterns = [
      /(?:skills?|technologies?|tools?|languages?|frameworks?)[:\s]+([^.\n]+)/gi,
      /(?:proficient in|experienced with|knowledge of)[:\s]+([^.\n]+)/gi,
      /(?:expertise in|specialized in)[:\s]+([^.\n]+)/gi
    ];
    
    const skills = new Set();
    
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
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

  extractExperience(text) {
    if (!text || typeof text !== 'string') {
      return { years: 0, relevant: [], gaps: [] };
    }
    
    const experiencePattern = /(\d+)\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/gi;
    const matches = text.match(experiencePattern);
    
    return {
      years: matches ? parseInt(matches[0]) : 0,
      relevant: this.extractRelevantExperience(text),
      gaps: this.identifyGaps(text)
    };
  }

  extractEducation(text) {
    if (!text || typeof text !== 'string') {
      return { level: 'unknown', relevant: true, certifications: [] };
    }
    
    const educationLevels = ['phd', 'doctorate', 'master', 'bachelor', 'associate', 'diploma', 'certificate'];
    const found = educationLevels.filter(level => text.toLowerCase().includes(level));
    
    return {
      level: found[0] || 'unknown',
      relevant: this.isEducationRelevant(text),
      certifications: this.extractCertifications(text)
    };
  }

  extractKeywords(text) {
    if (!text || typeof text !== 'string') return [];
    
    const commonKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
      'kubernetes', 'machine learning', 'ai', 'data analysis', 'project management',
      'agile', 'scrum', 'git', 'devops', 'cloud', 'api', 'rest', 'graphql'
    ];
    
    return commonKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  extractRelevantExperience(text) {
    // Implementation for extracting relevant work experience
    return [];
  }

  identifyGaps(text) {
    // Implementation for identifying career gaps
    return [];
  }

  isEducationRelevant(text) {
    // Implementation for checking education relevance
    return true;
  }

  extractCertifications(text) {
    // Implementation for extracting certifications
    return [];
  }

  generateSummary(skills, experience, education) {
    return `CV analizi tamamlandı. ${skills.length} beceri, ${experience.years} yıl deneyim, ${education.level} seviyesi eğitim tespit edildi.`;
  }
}

export { CvParserTool }; 
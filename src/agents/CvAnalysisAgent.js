import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

class CvAnalysisAgent {
  constructor() {
    this.name = 'CV Analysis Agent';
    this.skills = [
      'CV parsing and analysis',
      'Skill extraction',
      'Experience evaluation',
      'Keyword matching',
      'Recommendation generation'
    ];
  }

  async process(message, context = {}) {
    const { cvText, jobText, analysisType } = context;

    switch (analysisType) {
      case 'comprehensive':
        return await this.comprehensiveAnalysis(cvText, jobText);
      case 'skills':
        return await this.skillsAnalysis(cvText, jobText);
      case 'experience':
        return await this.experienceAnalysis(cvText, jobText);
      case 'keywords':
        return await this.keywordAnalysis(cvText, jobText);
      case 'improvement':
        return await this.improvementSuggestions(cvText, jobText);
      default:
        return await this.quickAnalysis(cvText, jobText);
    }
  }

  comprehensiveAnalysis(cvText, jobText) {
    try {
      console.log('🔍 Comprehensive CV analysis started');
      
      const skills = this.extractSkills(cvText || '');
      const experience = this.extractExperience(cvText || '');
      const education = this.extractEducation(cvText || '');
      const keywords = this.extractKeywords(jobText || '');
      
      const matchingSkills = this.findMatchingSkills(skills, keywords);
      const missingSkills = this.findMissingSkills(skills, keywords);
      const skillsScore = this.calculateSkillsScore(matchingSkills, keywords);
      
      const recommendations = this.generateRecommendations(missingSkills, experience, education);
      
      // Kullanıcı dostu yanıt formatı
      return {
        type: 'comprehensive_analysis',
        title: '📊 Comprehensive CV Analysis Results',
        summary: `Your CV matches ${skillsScore}% of the job requirements`,
        sections: {
          skills: {
            title: '💡 Skills Analysis',
            found: skills,
            matching: matchingSkills,
            missing: missingSkills,
            score: skillsScore
          },
          experience: {
            title: '💼 Experience Overview',
            years: experience.years || 0,
            relevant: experience.relevant || false,
            description: experience.description || 'Experience details not found'
          },
          education: {
            title: '🎓 Education',
            level: education.level || 'Not specified',
            field: education.field || 'Not specified'
          }
        },
        recommendations: recommendations,
        priorityActions: [
          `Focus on developing: ${missingSkills.slice(0, 3).join(', ')}`,
          'Update your CV with specific project examples',
          'Add measurable achievements to your experience section'
        ]
      };
    } catch (error) {
      console.error('❌ Comprehensive analysis error:', error);
      return {
        type: 'error',
        message: 'Analysis failed. Please check your CV and job description.',
        error: error.message
      };
    }
  }

  skillsAnalysis(cvText, jobText) {
    try {
      console.log('💡 Skills analysis started');
      
      const skills = this.extractSkills(cvText || '');
      const keywords = this.extractKeywords(jobText || '');
      
      const matchingSkills = this.findMatchingSkills(skills, keywords);
      const missingSkills = this.findMissingSkills(skills, keywords);
      const skillsScore = this.calculateSkillsScore(matchingSkills, keywords);
      
      return {
        type: 'skills_analysis',
        title: '💡 Skills Analysis Results',
        summary: `You have ${matchingSkills.length} matching skills out of ${keywords.length} required`,
        skills: {
          technical: skills.filter(skill => 
            ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws'].some(tech => 
              skill.toLowerCase().includes(tech)
            )
          ),
          soft: skills.filter(skill => 
            ['communication', 'leadership', 'teamwork', 'problem-solving'].some(soft => 
              skill.toLowerCase().includes(soft)
            )
          ),
          matching: matchingSkills,
          missing: missingSkills
        },
        score: skillsScore,
        suggestions: [
          `Learn: ${missingSkills.slice(0, 3).join(', ')}`,
          'Add more technical skills to your CV',
          'Highlight your soft skills with examples'
        ]
      };
    } catch (error) {
      console.error('❌ Skills analysis error:', error);
      return {
        type: 'error',
        message: 'Skills analysis failed. Please check your CV.',
        error: error.message
      };
    }
  }

  async experienceAnalysis(cvText, jobText) {
    const experience = this.extractExperience(cvText);
    const jobRequirements = this.extractJobRequirements(jobText);
    
    return {
      type: 'experience_analysis',
      data: {
        experience,
        jobRequirements,
        relevance: this.calculateExperienceRelevance(experience, jobRequirements),
        gaps: this.identifyExperienceGaps(experience, jobRequirements)
      }
    };
  }

  async keywordAnalysis(cvText, jobText) {
    const cvKeywords = this.extractKeywords(cvText || '');
    const jobKeywords = this.extractKeywords(jobText || '');
    
    return {
      type: 'keyword_analysis',
      data: {
        cvKeywords: cvKeywords || [],
        jobKeywords: jobKeywords || [],
        matching: (cvKeywords || []).filter(k => (jobKeywords || []).includes(k)),
        missing: (jobKeywords || []).filter(k => !(cvKeywords || []).includes(k)),
        density: this.calculateKeywordDensity(cvKeywords, jobKeywords)
      }
    };
  }

  improvementSuggestions(cvText, jobText) {
    try {
      console.log('🚀 Improvement suggestions started');
      
      const skills = this.extractSkills(cvText || '');
      const keywords = this.extractKeywords(jobText || '');
      const missingSkills = this.findMissingSkills(skills, keywords);
      
      const suggestions = [
        '📝 **CV Structure**: Use clear sections and bullet points',
        '🎯 **Keywords**: Add job-specific keywords to your CV',
        '📊 **Quantify**: Include numbers and metrics in your achievements',
        '🔧 **Skills**: Focus on developing missing technical skills',
        '💼 **Experience**: Add more relevant project examples',
        '📚 **Education**: Highlight relevant coursework and certifications'
      ];
      
      const priorityActions = [
        `🔄 **Immediate**: Learn ${missingSkills.slice(0, 2).join(' and ')}`,
        '📈 **Short-term**: Update CV with specific achievements',
        '🎯 **Long-term**: Build a portfolio of relevant projects'
      ];
      
        return {
        type: 'improvement_suggestions',
        title: '🚀 CV Improvement Suggestions',
        summary: 'Here are personalized suggestions to improve your CV',
        suggestions: suggestions,
        priorityActions: priorityActions,
        missingSkills: missingSkills,
        tips: [
          'Use action verbs at the beginning of each bullet point',
          'Include specific technologies and tools you used',
          'Add links to your projects or portfolio',
          'Keep your CV to 1-2 pages maximum'
        ]
      };
    } catch (error) {
      console.error('❌ Improvement suggestions error:', error);
      return {
        type: 'error',
        message: 'Could not generate improvement suggestions.',
        error: error.message
      };
    }
  }

  async quickAnalysis(cvText, jobText) {
    const skills = this.extractSkills(cvText || '');
    const keywords = this.extractKeywords(jobText || '');
    const matchCount = (skills || []).filter(s => (keywords || []).includes(s)).length;
    
    return {
      type: 'quick_analysis',
      data: {
        matchScore: (matchCount / Math.max((keywords || []).length, 1)) * 100,
        matchingSkills: (skills || []).filter(s => (keywords || []).includes(s)),
        missingSkills: (keywords || []).filter(k => !(skills || []).includes(k))
      }
    };
  }

  // Helper methods
  extractSkills(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }
    
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
      return {
        years: 0,
        relevant: [],
        gaps: []
      };
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
      return {
        level: 'unknown',
        relevant: true,
        certifications: []
      };
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
    if (!text || typeof text !== 'string') {
      return [];
    }
    
    const commonKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
      'kubernetes', 'machine learning', 'ai', 'data analysis', 'project management',
      'agile', 'scrum', 'git', 'devops', 'cloud', 'api', 'rest', 'graphql'
    ];
    
    return commonKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  findMatchingSkills(cvSkills, jobSkills) {
    return cvSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
  }

  findMissingSkills(cvSkills, jobSkills) {
    return jobSkills.filter(jobSkill => 
      !cvSkills.some(cvSkill => 
        cvSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(cvSkill.toLowerCase())
      )
    );
  }

  calculateSkillsScore(cvSkills, jobSkills) {
    const matching = this.findMatchingSkills(cvSkills, jobSkills);
    return (matching.length / Math.max(jobSkills.length, 1)) * 100;
  }

  generateRecommendations(matchingSkills, experience, education) {
    const recommendations = [];
    
    if (matchingSkills && matchingSkills.length > 0) {
      recommendations.push(`Learn missing skills: ${matchingSkills.slice(0, 3).join(', ')}`);
    }
    
    if (experience && experience.years < 2) {
      recommendations.push('Gain more work experience through internships or projects');
    }
    
    if (education && education.level !== 'unknown') {
      recommendations.push(`Highlight your ${education.level} degree in your education section`);
    }
    
    return recommendations;
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

  extractJobRequirements(text) {
    // Implementation for extracting job requirements
    return [];
  }

  calculateExperienceRelevance(experience, requirements) {
    // Implementation for calculating experience relevance
    return 0.8;
  }

  identifyExperienceGaps(experience, requirements) {
    // Implementation for identifying experience gaps
    return [];
  }

  calculateKeywordDensity(cvKeywords, jobKeywords) {
    // Implementation for calculating keyword density
    return 0.6;
  }

  generateImmediateSuggestions(analysis) {
    // Implementation for immediate suggestions
    return ['Update CV with missing keywords', 'Add specific project examples'];
  }

  generateLongTermSuggestions(analysis) {
    // Implementation for long-term suggestions
    return ['Pursue advanced certifications', 'Build portfolio projects'];
  }

  prioritizeSuggestions(analysis) {
    // Implementation for prioritizing suggestions
    return ['High', 'Medium', 'Low'];
  }
}

export default CvAnalysisAgent;
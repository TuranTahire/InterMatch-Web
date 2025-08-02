import CvAnalysisAgent from './CvAnalysisAgent.js';

class AutomationManager {
  constructor() {
    this.name = 'Automation Manager';
    this.queue = [];
    this.isProcessing = false;
    this.tasks = new Map();
  }

  async process(message, context = {}) {
    const { taskType, data } = context;

    switch (taskType) {
      case 'cv_improvement':
        return await this.autoImproveCv(data.cvText, data.jobText);
      case 'email_generation':
        return await this.generateEmail(data.cvText, data.jobText, data.emailType);
      case 'batch_analysis':
        return await this.batchAnalyzeCvs(data.cvList, data.jobText);
      case 'cover_letter':
        return await this.generateCoverLetter(data.cvText, data.jobText);
      case 'interview_prep':
        return await this.prepareInterviewQuestions(data.cvText, data.jobText);
      default:
        return await this.handleCustomTask(message, context);
    }
  }

  async autoImproveCv(cvText, jobText) {
    console.log('🤖 Auto-improving CV...');
    
    const improvements = [];
    
    // Keyword optimization
    const missingKeywords = this.findMissingKeywords(cvText, jobText);
    if (missingKeywords.length > 0) {
      improvements.push({
        type: 'keyword_addition',
        suggestions: missingKeywords.slice(0, 5).map(keyword => 
          `Add "${keyword}" to your skills section`
        )
      });
    }

    // Experience enhancement
    const experienceSuggestions = this.enhanceExperienceSection(cvText, jobText);
    if (experienceSuggestions.length > 0) {
      improvements.push({
        type: 'experience_enhancement',
        suggestions: experienceSuggestions
      });
    }

    // Skills organization
    const skillsSuggestions = this.organizeSkillsSection(cvText, jobText);
    if (skillsSuggestions.length > 0) {
      improvements.push({
        type: 'skills_organization',
        suggestions: skillsSuggestions
      });
    }

    return {
      type: 'cv_improvement',
      data: {
        improvements,
        improvedCv: this.applyImprovements(cvText, improvements),
        score: this.calculateImprovementScore(improvements)
      }
    };
  }

  async generateEmail(cvText, jobText, emailType = 'application') {
    console.log('📧 Generating email...');
    
    const templates = {
      application: {
        subject: `Application for ${this.extractJobTitle(jobText)} Position`,
        body: this.generateApplicationEmail(cvText, jobText)
      },
      follow_up: {
        subject: 'Follow-up on Application',
        body: this.generateFollowUpEmail(cvText, jobText)
      },
      networking: {
        subject: 'Professional Networking Request',
        body: this.generateNetworkingEmail(cvText, jobText)
      }
    };

    return {
      type: 'email_generation',
      data: {
        emailType,
        template: templates[emailType] || templates.application,
        alternatives: this.generateAlternativeEmails(cvText, jobText, emailType)
      }
    };
  }

  async batchAnalyzeCvs(cvList, jobText) {
    console.log('📊 Batch analyzing CVs...');
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const cv of cvList) {
      try {
        const analysis = await this.analyzeSingleCv(cv, jobText);
        results.push({
          cvId: cv.id || 'unknown',
          analysis,
          status: 'success'
        });
        successCount++;
      } catch (error) {
        results.push({
          cvId: cv.id || 'unknown',
          error: error.message,
          status: 'error'
        });
        errorCount++;
      }
    }

    return {
      type: 'batch_analysis',
      data: {
        results,
      summary: {
        total: cvList.length,
          successful: successCount,
          errors: errorCount,
          successRate: (successCount / cvList.length) * 100
        }
      }
    };
  }

  async generateCoverLetter(cvText, jobText) {
    console.log('📝 Generating cover letter...');
    
    const coverLetter = {
      introduction: this.generateIntroduction(cvText, jobText),
      body: this.generateCoverLetterBody(cvText, jobText),
      conclusion: this.generateConclusion(cvText, jobText),
      callToAction: this.generateCallToAction(cvText, jobText)
    };

      return {
      type: 'cover_letter',
      data: {
        coverLetter,
        wordCount: this.calculateWordCount(coverLetter),
        tone: this.analyzeTone(coverLetter),
        suggestions: this.improveCoverLetter(coverLetter)
      }
    };
  }

  async prepareInterviewQuestions(cvText, jobText) {
    console.log('🎯 Preparing interview questions...');
    
    const questions = {
      technical: this.generateTechnicalQuestions(cvText, jobText),
      behavioral: this.generateBehavioralQuestions(cvText, jobText),
      situational: this.generateSituationalQuestions(cvText, jobText),
      questionsToAsk: this.generateQuestionsToAsk(cvText, jobText)
    };

    return {
      type: 'interview_prep',
      data: {
        questions,
        preparation: this.generatePreparationTips(cvText, jobText),
        mockInterview: this.generateMockInterview(cvText, jobText)
      }
    };
  }

  async handleCustomTask(message, context) {
    console.log('🔧 Handling custom task...');
    
    return {
      type: 'custom_task',
      data: {
        message,
        context,
        status: 'processed',
        result: 'Custom task completed'
      }
    };
  }

  // Helper methods
  findMissingKeywords(cvText, jobText) {
    const cvKeywords = this.extractKeywords(cvText || '');
    const jobKeywords = this.extractKeywords(jobText || '');
    
    return (jobKeywords || []).filter(keyword => 
      !(cvKeywords || []).some(cvKeyword => 
        cvKeyword.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  enhanceExperienceSection(cvText, jobText) {
    const suggestions = [];
    
    // Add quantifiable achievements
    if (!cvText.includes('%') && !cvText.includes('increased') && !cvText.includes('improved')) {
      suggestions.push('Add quantifiable achievements (e.g., "increased sales by 25%")');
    }
    
    // Add action verbs
    const actionVerbs = ['developed', 'implemented', 'managed', 'led', 'created'];
    const hasActionVerbs = actionVerbs.some(verb => cvText.toLowerCase().includes(verb));
    if (!hasActionVerbs) {
      suggestions.push('Use strong action verbs to describe your achievements');
    }
    
    return suggestions;
  }

  organizeSkillsSection(cvText, jobText) {
    const suggestions = [];
    
    // Group skills by category
    if (cvText.includes('skills') && !cvText.includes('Technical Skills') && !cvText.includes('Soft Skills')) {
      suggestions.push('Organize skills into categories (Technical, Soft Skills, Tools)');
    }
    
    return suggestions;
  }

  applyImprovements(cvText, improvements) {
    let improvedCv = cvText;
    
    improvements.forEach(improvement => {
      if (improvement.type === 'keyword_addition') {
        improvedCv += '\n\nAdditional Skills: ' + improvement.suggestions.join(', ');
      }
    });
    
    return improvedCv;
  }

  calculateImprovementScore(improvements) {
    const totalSuggestions = improvements.reduce((sum, imp) => sum + imp.suggestions.length, 0);
    return Math.max(0, 100 - (totalSuggestions * 10));
  }

  extractJobTitle(jobText) {
    const titlePatterns = [
      /(?:position|role|job|title)[:\s]+([^.\n]+)/i,
      /(?:looking for|seeking)[:\s]+([^.\n]+)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = jobText.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return 'the position';
  }

  generateApplicationEmail(cvText, jobText) {
    const jobTitle = this.extractJobTitle(jobText);
    const skills = this.extractSkills(cvText);
    
    return `Dear Hiring Manager,

I am writing to express my interest in the ${jobTitle} position at your company. With my background in ${skills.slice(0, 3).join(', ')}, I believe I would be a valuable addition to your team.

My experience includes [specific achievements from CV], and I am particularly drawn to this opportunity because [connection to job requirements].

I have attached my resume for your review and would welcome the opportunity to discuss how my skills and experience align with your needs.

Thank you for considering my application.

Best regards,
[Your Name]`;
  }

  generateFollowUpEmail(cvText, jobText) {
    return `Dear [Hiring Manager's Name],

I hope this email finds you well. I wanted to follow up on my application for the ${this.extractJobTitle(jobText)} position that I submitted on [date].

I remain very interested in this opportunity and would appreciate any updates on the status of my application. I am confident that my skills and experience would be a great fit for your team.

Thank you for your time and consideration.

Best regards,
[Your Name]`;
  }

  generateNetworkingEmail(cvText, jobText) {
    return `Dear [Contact Name],

I hope you're doing well. I came across your profile and was impressed by your work in [industry/field]. I'm currently exploring opportunities in [field] and would love to connect with you.

I have experience in [brief mention of relevant skills] and would appreciate any insights you might have about the industry or potential opportunities.

Would you be available for a brief conversation in the coming weeks?

Thank you for your time.

Best regards,
[Your Name]`;
  }

  generateAlternativeEmails(cvText, jobText, emailType) {
    // Generate alternative versions with different tones
    return [
      {
        tone: 'formal',
        content: this.generateApplicationEmail(cvText, jobText)
      },
      {
        tone: 'conversational',
        content: this.generateApplicationEmail(cvText, jobText).replace(/Dear Hiring Manager,/g, 'Hi there,')
      }
    ];
  }

  async analyzeSingleCv(cv, jobText) {
    // Simple CV analysis
    const skills = this.extractSkills(cv.content || cv);
    const jobKeywords = this.extractKeywords(jobText);
    const matchingSkills = skills.filter(skill => 
      jobKeywords.some(keyword => 
        skill.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    return {
      matchScore: (matchingSkills.length / Math.max(jobKeywords.length, 1)) * 100,
      matchingSkills,
      missingSkills: jobKeywords.filter(k => !skills.some(s => s.toLowerCase().includes(k.toLowerCase())))
    };
  }

  generateIntroduction(cvText, jobText) {
    const jobTitle = this.extractJobTitle(jobText);
    return `I am writing to express my strong interest in the ${jobTitle} position at your company.`;
  }

  generateCoverLetterBody(cvText, jobText) {
    const skills = this.extractSkills(cvText);
    return `With my background in ${skills.slice(0, 3).join(', ')}, I bring valuable experience that aligns perfectly with your requirements.`;
  }

  generateConclusion(cvText, jobText) {
    return `I am excited about the opportunity to contribute to your team and would welcome the chance to discuss how my skills can benefit your organization.`;
  }

  generateCallToAction(cvText, jobText) {
    return `Thank you for considering my application. I look forward to hearing from you.`;
  }

  calculateWordCount(text) {
    if (typeof text === 'object') {
      return Object.values(text).join(' ').split(' ').length;
    }
    return text.split(' ').length;
  }

  analyzeTone(text) {
    const content = typeof text === 'object' ? Object.values(text).join(' ') : text;
    const formalWords = ['respectfully', 'sincerely', 'regards'];
    const casualWords = ['hi', 'hey', 'thanks'];
    
    const formalCount = formalWords.filter(word => content.toLowerCase().includes(word)).length;
    const casualCount = casualWords.filter(word => content.toLowerCase().includes(word)).length;
    
    if (formalCount > casualCount) return 'formal';
    if (casualCount > formalCount) return 'casual';
    return 'neutral';
  }

  improveCoverLetter(coverLetter) {
    const suggestions = [];
    
    if (this.calculateWordCount(coverLetter) < 200) {
      suggestions.push('Add more specific examples and achievements');
    }
    
    if (!coverLetter.body.includes('%') && !coverLetter.body.includes('increased')) {
      suggestions.push('Include quantifiable achievements');
    }
    
    return suggestions;
  }

  generateTechnicalQuestions(cvText, jobText) {
    const skills = this.extractSkills(cvText);
    return skills.slice(0, 5).map(skill => 
      `Can you walk me through a project where you used ${skill}?`
    );
  }

  generateBehavioralQuestions(cvText, jobText) {
    return [
      'Tell me about a time you faced a challenging problem at work.',
      'Describe a situation where you had to work with a difficult team member.',
      'Give me an example of when you went above and beyond in your role.'
    ];
  }

  generateSituationalQuestions(cvText, jobText) {
    return [
      'What would you do if you disagreed with your manager on a technical decision?',
      'How would you handle a tight deadline with limited resources?',
      'What steps would you take to learn a new technology quickly?'
    ];
  }

  generateQuestionsToAsk(cvText, jobText) {
    return [
      'What does success look like in this role?',
      'What are the biggest challenges the team is currently facing?',
      'How does the company support professional development?'
    ];
  }

  generatePreparationTips(cvText, jobText) {
    return [
      'Research the company thoroughly',
      'Prepare specific examples from your experience',
      'Practice your responses to common questions',
      'Prepare thoughtful questions to ask'
    ];
  }

  generateMockInterview(cvText, jobText) {
    return {
      questions: [
        ...this.generateTechnicalQuestions(cvText, jobText),
        ...this.generateBehavioralQuestions(cvText, jobText)
      ],
      duration: '45 minutes',
      format: 'Technical + Behavioral'
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

  extractSkills(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }
    
    const skillPatterns = [
      /(?:skills?|technologies?|tools?|languages?|frameworks?)[:\s]+([^.\n]+)/gi,
      /(?:proficient in|experienced with|knowledge of)[:\s]+([^.\n]+)/gi
    ];
    
    const skills = new Set();
    
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const skill = match.replace(/^(?:skills?|technologies?|tools?|languages?|frameworks?|proficient in|experienced with|knowledge of)[:\s]+/i, '').trim();
          if (skill) {
            skills.add(skill.toLowerCase());
          }
        });
      }
    });
    
    return Array.from(skills);
  }
}

export default AutomationManager;
import { BaseTool } from './BaseTool.js';
import { GeminiService } from '../services/geminiService.js';

class ContentRewriterTool extends BaseTool {
  constructor() {
    super(
      'content_rewriter',
      'Metin içeriğini verilen talimatlara göre yeniden yazar ve iyileştirir',
      {
        input: 'object', // { content: string, instructions: string, context?: object }
        output: 'object' // Yeniden yazılmış içerik
      }
    );
    
    this.aiService = new GeminiService();
  }

  async execute(input) {
    try {
      console.log("✍️ İçerik yeniden yazılıyor...");
      
      const { content, instructions, context = {} } = input;
      
      if (!content || !instructions) {
        throw new Error('İçerik ve talimatlar gerekli');
      }
      
      // AI ile içeriği yeniden yaz
      const rewrittenContent = await this.rewriteWithAI(content, instructions, context);
      
      // Değişiklikleri analiz et
      const changes = this.analyzeChanges(content, rewrittenContent);
      
      // İyileştirme önerileri oluştur
      const improvements = this.generateImprovements(changes, context);
      
      const result = {
        originalContent: content,
        rewrittenContent: rewrittenContent,
        changes: changes,
        improvements: improvements,
        instructions: instructions,
        metadata: {
          originalLength: content.length,
          newLength: rewrittenContent.length,
          timestamp: new Date().toISOString(),
          tool: this.name
        }
      };
      
      console.log("✅ İçerik yeniden yazma tamamlandı");
      return result;
      
    } catch (error) {
      console.error("❌ İçerik yeniden yazma hatası:", error);
      throw new Error(`İçerik yeniden yazma başarısız: ${error.message}`);
    }
  }

  async rewriteWithAI(content, instructions, context) {
    const prompt = this.buildRewritePrompt(content, instructions, context);
    
    const response = await this.aiService.generateResponse(prompt, {
      systemMessage: 'Sen bir CV ve içerik yazım uzmanısın. Verilen talimatlara göre metni yeniden yaz ve iyileştir.',
      format: 'text'
    });
    
    if (!response.success) {
      // AI servisi çalışmıyorsa basit iyileştirmeler yap
      return this.simpleRewrite(content, instructions);
    }
    
    return response.content;
  }

  buildRewritePrompt(content, instructions, context) {
    let prompt = `Aşağıdaki metni verilen talimatlara göre yeniden yaz:\n\n`;
    prompt += `ORİJİNAL METİN:\n${content}\n\n`;
    prompt += `TALİMATLAR:\n${instructions}\n\n`;
    
    if (context.jobTitle) {
      prompt += `İŞ POZİSYONU: ${context.jobTitle}\n`;
    }
    
    if (context.companyCulture) {
      prompt += `ŞİRKET KÜLTÜRÜ: ${context.companyCulture}\n`;
    }
    
    if (context.targetKeywords) {
      prompt += `HEDEF ANAHTAR KELİMELER: ${context.targetKeywords.join(', ')}\n`;
    }
    
    prompt += `\nLütfen metni daha güçlü, sonuç odaklı ve hedef kitleye uygun hale getirin.`;
    
    return prompt;
  }

  simpleRewrite(content, instructions) {
    // AI servisi çalışmadığında basit iyileştirmeler
    let rewritten = content;
    
    const lowerInstructions = instructions.toLowerCase();
    
    // Daha enerjik yap
    if (lowerInstructions.includes('enerjik') || lowerInstructions.includes('energetic')) {
      rewritten = this.makeEnergetic(rewritten);
    }
    
    // Sonuç odaklı yap
    if (lowerInstructions.includes('sonuç') || lowerInstructions.includes('result')) {
      rewritten = this.makeResultOriented(rewritten);
    }
    
    // Daha profesyonel yap
    if (lowerInstructions.includes('profesyonel') || lowerInstructions.includes('professional')) {
      rewritten = this.makeProfessional(rewritten);
    }
    
    // Anahtar kelimeleri ekle
    if (lowerInstructions.includes('anahtar') || lowerInstructions.includes('keyword')) {
      rewritten = this.addKeywords(rewritten);
    }
    
    return rewritten;
  }

  makeEnergetic(text) {
    // Pasif fiilleri aktif fiillerle değiştir
    const passiveToActive = {
      'yapıldı': 'yaptım',
      'geliştirildi': 'geliştirdim',
      'oluşturuldu': 'oluşturdum',
      'yönetildi': 'yönettim',
      'koordine edildi': 'koordine ettim'
    };
    
    let result = text;
    Object.entries(passiveToActive).forEach(([passive, active]) => {
      result = result.replace(new RegExp(passive, 'gi'), active);
    });
    
    // Enerjik kelimeler ekle
    const energeticWords = ['başarıyla', 'etkili bir şekilde', 'dinamik olarak', 'proaktif bir yaklaşımla'];
    const sentences = result.split('.');
    
    const enhancedSentences = sentences.map((sentence, index) => {
      if (index < sentences.length - 1 && sentence.trim()) {
        const randomWord = energeticWords[Math.floor(Math.random() * energeticWords.length)];
        return sentence.trim() + ' ' + randomWord + '.';
      }
      return sentence;
    });
    
    return enhancedSentences.join(' ');
  }

  makeResultOriented(text) {
    // Sayısal sonuçlar ekle
    const resultPatterns = [
      /(?:geliştirdim|oluşturdum|yönettim)/gi,
      /(?:artırdım|azalttım|iyileştirdim)/gi
    ];
    
    let result = text;
    
    // Sonuç ifadeleri ekle
    const resultPhrases = [
      'sonucunda %25 verimlilik artışı sağladım',
      'bu sayede %30 maliyet tasarrufu elde ettim',
      'bunun sonucunda %40 performans iyileştirmesi gerçekleştirdim',
      'bu çalışma ile %20 zaman tasarrufu sağladım'
    ];
    
    resultPatterns.forEach(pattern => {
      result = result.replace(pattern, (match) => {
        const randomPhrase = resultPhrases[Math.floor(Math.random() * resultPhrases.length)];
        return match + ', ' + randomPhrase;
      });
    });
    
    return result;
  }

  makeProfessional(text) {
    // Günlük dil yerine profesyonel terimler kullan
    const casualToProfessional = {
      'yaptım': 'gerçekleştirdim',
      'çalıştım': 'görev aldım',
      'iş yaptım': 'proje yönettim',
      'yardım ettim': 'destek sağladım',
      'öğrendim': 'uzmanlaştım'
    };
    
    let result = text;
    Object.entries(casualToProfessional).forEach(([casual, professional]) => {
      result = result.replace(new RegExp(casual, 'gi'), professional);
    });
    
    return result;
  }

  addKeywords(text) {
    // Yaygın CV anahtar kelimeleri
    const commonKeywords = [
      'analitik düşünme',
      'problem çözme',
      'takım çalışması',
      'iletişim becerileri',
      'proje yönetimi',
      'sürekli öğrenme',
      'inovasyon',
      'stratejik planlama'
    ];
    
    let result = text;
    
    // Metinde eksik anahtar kelimeleri ekle
    commonKeywords.forEach(keyword => {
      if (!result.toLowerCase().includes(keyword.toLowerCase())) {
        const sentences = result.split('.');
        if (sentences.length > 1) {
          const randomIndex = Math.floor(Math.random() * (sentences.length - 1));
          sentences[randomIndex] = sentences[randomIndex].trim() + 
            ` ve ${keyword} konusunda güçlü yeteneklere sahibim.`;
          result = sentences.join('.');
        }
      }
    });
    
    return result;
  }

  analyzeChanges(original, rewritten) {
    const changes = {
      lengthChange: rewritten.length - original.length,
      wordCountChange: this.getWordCount(rewritten) - this.getWordCount(original),
      improvements: [],
      additions: [],
      modifications: []
    };
    
    // İyileştirmeleri tespit et
    if (rewritten.length > original.length) {
      changes.improvements.push('Daha detaylı açıklamalar eklendi');
    }
    
    if (this.hasActiveVoice(rewritten) && !this.hasActiveVoice(original)) {
      changes.improvements.push('Pasif fiiller aktif fiillerle değiştirildi');
    }
    
    if (this.hasResults(rewritten) && !this.hasResults(original)) {
      changes.improvements.push('Sonuç odaklı ifadeler eklendi');
    }
    
    if (this.hasKeywords(rewritten) && !this.hasKeywords(original)) {
      changes.improvements.push('Anahtar kelimeler eklendi');
    }
    
    return changes;
  }

  getWordCount(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  hasActiveVoice(text) {
    const activeVerbs = ['geliştirdim', 'oluşturdum', 'yönettim', 'koordine ettim', 'sağladım'];
    return activeVerbs.some(verb => text.toLowerCase().includes(verb));
  }

  hasResults(text) {
    const resultPatterns = [/%\d+/, /\d+%/, 'artış', 'azalış', 'iyileştirme', 'tasarruf'];
    return resultPatterns.some(pattern => 
      typeof pattern === 'string' ? 
        text.toLowerCase().includes(pattern) : 
        pattern.test(text)
    );
  }

  hasKeywords(text) {
    const keywords = ['analitik', 'problem', 'takım', 'iletişim', 'proje', 'stratejik'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  generateImprovements(changes, context) {
    const improvements = [];
    
    if (changes.improvements.length > 0) {
      improvements.push(...changes.improvements);
    }
    
    if (context.jobTitle) {
      improvements.push(`${context.jobTitle} pozisyonuna uygun dil kullanıldı`);
    }
    
    if (context.companyCulture) {
      improvements.push('Şirket kültürüne uygun ton ayarlandı');
    }
    
    if (changes.lengthChange > 0) {
      improvements.push(`${changes.lengthChange} karakter daha detaylı içerik eklendi`);
    }
    
    return improvements;
  }
}

export { ContentRewriterTool }; 
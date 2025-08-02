import CvAnalysisAgent from './CvAnalysisAgent.js';

class AutomationManager {
  constructor(apiKey) {
    this.cvAgent = new CvAnalysisAgent(apiKey);
    this.processingQueue = [];
    this.isProcessing = false;
  }

  // Toplu CV analizi
  async batchAnalyzeCvs(cvList, jobDescription = "") {
    const results = [];
    const errors = [];

    console.log(`Toplu analiz başlatılıyor: ${cvList.length} CV`);

    for (let i = 0; i < cvList.length; i++) {
      const cv = cvList[i];
      try {
        console.log(`CV ${i + 1}/${cvList.length} analiz ediliyor...`);
        
        const analysis = await this.cvAgent.analyzeCv(cv.content, jobDescription);
        
        results.push({
          id: cv.id || `cv_${i}`,
          name: cv.name || `CV ${i + 1}`,
          analysis: analysis,
          timestamp: new Date().toISOString(),
        });

        // İşlem arası bekleme (rate limiting)
        await this.delay(1000);
        
      } catch (error) {
        console.error(`CV ${i + 1} analiz hatası:`, error);
        errors.push({
          id: cv.id || `cv_${i}`,
          name: cv.name || `CV ${i + 1}`,
          error: error.message,
        });
      }
    }

    return {
      results: results,
      errors: errors,
      summary: {
        total: cvList.length,
        successful: results.length,
        failed: errors.length,
        successRate: (results.length / cvList.length) * 100,
      }
    };
  }

  // Otomatik CV iyileştirme
  async autoImproveCv(cvContent, jobDescription) {
    try {
      // Önce analiz yap
      const analysis = await this.cvAgent.analyzeCv(cvContent, jobDescription);
      
      // İyileştirme önerilerini birleştir
      const improvementSuggestions = [
        ...analysis.recommendations || [],
        ...analysis.weaknesses || [],
      ].join('\n');

      // CV'yi iyileştir
      const improvedCv = await this.cvAgent.improveCv(cvContent, improvementSuggestions);
      
      // Ön yazı oluştur
      const coverLetter = await this.cvAgent.generateCoverLetter(improvedCv, jobDescription);

      return {
        originalCv: cvContent,
        improvedCv: improvedCv,
        analysis: analysis,
        coverLetter: coverLetter,
        improvements: improvementSuggestions,
      };
    } catch (error) {
      console.error("Otomatik CV iyileştirme hatası:", error);
      throw error;
    }
  }

  // E-posta şablonu oluşturma
  async generateEmailTemplate(cvContent, jobDescription, emailType = "application") {
    const emailPrompts = {
      application: `
        Aşağıdaki CV ve iş ilanına uygun bir iş başvuru e-postası oluştur:
        
        CV: {cvContent}
        İş İlanı: {jobDescription}
        
        E-posta şu bölümlerden oluşmalı:
        1. Konu satırı
        2. Açılış (saygılı selamlama)
        3. Pozisyon hakkında ilgi ifadesi
        4. Kısa deneyim özeti
        5. CV eki belirtme
        6. Kapanış ve iletişim bilgileri
        
        Profesyonel, kısa ve öz olmalı.
      `,
      followUp: `
        İş başvurusu sonrası takip e-postası oluştur:
        
        CV: {cvContent}
        İş İlanı: {jobDescription}
        
        E-posta şu bölümlerden oluşmalı:
        1. Konu satırı
        2. Başvuru hatırlatması
        3. İlgi ifadesi
        4. Ek bilgi sunma
        5. Kapanış
        
        Nazik ve profesyonel ton kullan.
      `,
      thankYou: `
        Mülakat sonrası teşekkür e-postası oluştur:
        
        CV: {cvContent}
        İş İlanı: {jobDescription}
        
        E-posta şu bölümlerden oluşmalı:
        1. Konu satırı
        2. Teşekkür ifadesi
        3. Mülakat hakkında kısa yorum
        4. İlgi ifadesi
        5. Kapanış
        
        Sıcak ve profesyonel ton kullan.
      `
    };

    const prompt = emailPrompts[emailType] || emailPrompts.application;
    
    try {
      // Basit prompt template kullanarak e-posta oluştur
      const emailContent = await this.cvAgent.model.invoke([
        ["system", "Sen profesyonel bir e-posta yazarısın."],
        ["human", prompt.replace("{cvContent}", cvContent).replace("{jobDescription}", jobDescription)]
      ]);

      return {
        type: emailType,
        subject: this.generateEmailSubject(emailType, jobDescription),
        content: emailContent.content,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("E-posta şablonu oluşturma hatası:", error);
      throw error;
    }
  }

  // E-posta konu satırı oluşturma
  generateEmailSubject(emailType, jobDescription) {
    const subjects = {
      application: `İş Başvurusu - ${jobDescription.split(' ').slice(0, 5).join(' ')}...`,
      followUp: `Başvuru Takibi - ${jobDescription.split(' ').slice(0, 3).join(' ')}...`,
      thankYou: `Mülakat Teşekkürü - ${jobDescription.split(' ').slice(0, 3).join(' ')}...`,
    };
    
    return subjects[emailType] || subjects.application;
  }

  // İşlem kuyruğu yönetimi
  addToQueue(task) {
    this.processingQueue.push({
      id: Date.now() + Math.random(),
      task: task,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const item = this.processingQueue.shift();
      item.status = 'processing';
      item.startedAt = new Date().toISOString();

      try {
        const result = await item.task();
        item.status = 'completed';
        item.result = result;
        item.completedAt = new Date().toISOString();
      } catch (error) {
        item.status = 'failed';
        item.error = error.message;
        item.failedAt = new Date().toISOString();
      }
    }

    this.isProcessing = false;
  }

  // Yardımcı fonksiyonlar
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getQueueStatus() {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.processingQueue.length,
      queue: this.processingQueue,
    };
  }

  clearQueue() {
    this.processingQueue = [];
    this.isProcessing = false;
  }
}

export default AutomationManager;
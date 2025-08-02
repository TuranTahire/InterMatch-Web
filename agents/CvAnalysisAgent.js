import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

class CvAnalysisAgent {
  constructor(apiKey) {
    this.model = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-flash",
      apiKey: apiKey,
      temperature: 0.7,
    });
    
    this.setupChains();
  }

  setupChains() {
    // CV Analiz Zinciri
    const cvAnalysisPrompt = PromptTemplate.fromTemplate(`
      Sen bir kariyer danışmanı ve CV analiz uzmanısın. Aşağıdaki CV'yi analiz et ve detaylı bir rapor hazırla.
      
      CV İçeriği:
      {cvContent}
      
      İş İlanı (varsa):
      {jobDescription}
      
      Lütfen aşağıdaki başlıklar altında analiz yap:
      
      1. **Güçlü Yönler**: CV'deki en güçlü özellikler
      2. **Geliştirilmesi Gereken Alanlar**: Eksik veya zayıf noktalar
      3. **Anahtar Kelimeler**: CV'deki önemli beceriler ve deneyimler
      4. **Öneriler**: CV'yi geliştirmek için somut öneriler
      5. **Uygunluk Puanı**: İş ilanına uygunluk (0-100%)
      6. **Ön Yazı Önerisi**: İş ilanına uygun ön yazı taslağı
      
      Yanıtını JSON formatında ver:
      {
        "strengths": ["güçlü yön 1", "güçlü yön 2"],
        "weaknesses": ["zayıf yön 1", "zayıf yön 2"],
        "keywords": ["anahtar kelime 1", "anahtar kelime 2"],
        "recommendations": ["öneri 1", "öneri 2"],
        "suitabilityScore": 85,
        "coverLetterDraft": "Ön yazı taslağı metni..."
      }
    `);

    this.cvAnalysisChain = RunnableSequence.from([
      cvAnalysisPrompt,
      this.model,
      new StringOutputParser(),
    ]);

    // Otomatik CV İyileştirme Zinciri
    const cvImprovementPrompt = PromptTemplate.fromTemplate(`
      Aşağıdaki CV'yi verilen öneriler doğrultusunda otomatik olarak iyileştir:
      
      Orijinal CV:
      {originalCv}
      
      İyileştirme Önerileri:
      {improvementSuggestions}
      
      Lütfen iyileştirilmiş CV'yi aynı formatta döndür, ancak daha güçlü ve etkili hale getir.
    `);

    this.cvImprovementChain = RunnableSequence.from([
      cvImprovementPrompt,
      this.model,
      new StringOutputParser(),
    ]);
  }

  async analyzeCv(cvContent, jobDescription = "") {
    try {
      const result = await this.cvAnalysisChain.invoke({
        cvContent: cvContent,
        jobDescription: jobDescription,
      });

      // JSON parse etmeye çalış
      try {
        return JSON.parse(result);
      } catch (parseError) {
        // JSON parse edilemezse, metin olarak döndür
        return {
          rawAnalysis: result,
          suitabilityScore: 75,
          strengths: ["Analiz tamamlandı"],
          weaknesses: ["JSON formatında parse edilemedi"],
          recommendations: ["Sonuçları manuel olarak kontrol edin"],
        };
      }
    } catch (error) {
      console.error("CV Analiz hatası:", error);
      throw new Error("CV analizi sırasında bir hata oluştu");
    }
  }

  async improveCv(originalCv, improvementSuggestions) {
    try {
      const improvedCv = await this.cvImprovementChain.invoke({
        originalCv: originalCv,
        improvementSuggestions: improvementSuggestions,
      });

      return improvedCv;
    } catch (error) {
      console.error("CV İyileştirme hatası:", error);
      throw new Error("CV iyileştirme sırasında bir hata oluştu");
    }
  }

  async generateCoverLetter(cvContent, jobDescription) {
    const coverLetterPrompt = PromptTemplate.fromTemplate(`
      Aşağıdaki CV ve iş ilanına uygun profesyonel bir ön yazı oluştur:
      
      CV İçeriği:
      {cvContent}
      
      İş İlanı:
      {jobDescription}
      
      Ön yazı şu bölümlerden oluşmalı:
      1. Açılış (pozisyon ve şirket hakkında)
      2. Neden bu pozisyonu istediğiniz
      3. Deneyimlerinizin nasıl uygun olduğu
      4. Kapanış ve iletişim bilgileri
      
      Türkçe olarak, profesyonel ve ikna edici bir ton kullan.
    `);

    const coverLetterChain = RunnableSequence.from([
      coverLetterPrompt,
      this.model,
      new StringOutputParser(),
    ]);

    try {
      const coverLetter = await coverLetterChain.invoke({
        cvContent: cvContent,
        jobDescription: jobDescription,
      });

      return coverLetter;
    } catch (error) {
      console.error("Ön yazı oluşturma hatası:", error);
      throw new Error("Ön yazı oluşturulurken bir hata oluştu");
    }
  }
}

export default CvAnalysisAgent;
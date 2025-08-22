"""
CV Analyzer Agent
CV ve iş ilanı uyum analizi yapan ajan.
"""

import os
import re
from groq import Groq
from dotenv import load_dotenv

# .env dosyasındaki değişkenleri yükle
load_dotenv('config.env')

class CVAnalyzerAgent:
    """CV ve iş ilanı uyum analizi yapan ajan"""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY bulunamadı!")
        
        self.client = Groq(api_key=self.api_key)
        self.model = "llama3-70b-8192"
    
    def analyze(self, cv_text: str, job_text: str, company_name: str = None, language: str = 'Türkçe') -> str:
        """
        CV ve iş ilanı arasındaki uyumu analiz eder.
        
        Args:
            cv_text: CV metni
            job_text: İş ilanı metni
            company_name: Şirket adı (opsiyonel)
            language: Dil seçimi
            
        Returns:
            Detaylı analiz sonucu
        """
        print("\n--- CV ANALYZER AGENT ÇALIŞIYOR ---")
        
        try:
            prompt = f"""
Sen bir uzman CV analisti ve kariyer danışmanısın. Aşağıdaki CV ve iş ilanını analiz et ve şık, emojili kart formatında sun.

CV METNİ:
{cv_text}

İŞ İLANI METNİ:
{job_text}

ŞİRKET: {company_name if company_name else 'Belirtilmemiş'}

GÖREV: Bu CV'nin iş ilanına uygunluğunu analiz et ve aşağıdaki şık, emojili kart formatında sun:

📊 **KARİYER ANALİZ RAPORU** 🎯

🚀 **GENEL UYUM DEĞERLENDİRMESİ**
[CV'nin bu pozisyon için genel uygunluğunu 2-3 cümlelik net bir değerlendirme]

⭐ **GÜÇLÜ YÖNLER** (En Önemli 3 Tanesi)
   • 🎯 [Güçlü yön 1] - [Kısa açıklama]
   • 💪 [Güçlü yön 2] - [Kısa açıklama]  
   • 🔥 [Güçlü yön 3] - [Kısa açıklama]

🔧 **GELİŞTİRİLMESİ GEREKEN ALANLAR** (En Kritik 3 Tanesi)
   • ⚠️ [Eksiklik 1] - [Kısa açıklama]
   • 📈 [Eksiklik 2] - [Kısa açıklama]
   • 🎯 [Eksiklik 3] - [Kısa açıklama]

💡 **HIZLI ÖNERİLER**
   • 💼 [Öneri 1]
   • 📚 [Öneri 2]
   • 🚀 [Öneri 3]

📊 **UYUM SKORU**
   🎯 Güçlü Yönler: [Sayı] | 🔧 Geliştirme Alanları: [Sayı]
   📈 Genel Uyum: [Mükemmel/İyi/Orta/Geliştirilmeli]

🎯 **SONUÇ**
[CV'nin bu pozisyon için genel değerlendirmesi - 1-2 cümle]

✨ **ÖNEMLİ KURALLAR:**
- Sadece {language} dilinde cevap ver
- Kısa, öz ve şık tut
- Emoji kullanarak görsel çekicilik kat
- Her maddeyi 1-2 cümle ile sınırla
- Emojili, şık kart formatında yaz
- Motivasyonel ve yapıcı ton kullan
"""
            
            print("✅ Prompt oluşturuldu, API'ye istek gönderiliyor...")
            
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.7,
                max_tokens=1500
            )
            
            print("✅ Analiz tamamlandı!")
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"❌ HATA: {type(e).__name__} - {e}")
            return f"Analiz sırasında hata oluştu: {str(e)}"

    def get_quick_analysis(self, cv_text: str, job_text: str, language: str = 'Türkçe') -> str:
        """
        Hızlı CV analizi yapar.
        
        Args:
            cv_text: CV metni
            job_text: İş ilanı metni
            language: Dil seçimi
            
        Returns:
            Hızlı analiz sonucu
        """
        try:
            prompt = f"""
Sen bir CV analisti olarak aşağıdaki CV ve iş ilanı için hızlı bir değerlendirme yap.

CV METNİ:
{cv_text}

İŞ İLANI METNİ:
{job_text}

GÖREV: Hızlı bir analiz yaparak şu şık kart formatında cevap ver:

⚡ HIZLI CV ANALİZİ

🎯 Genel İzlenim
[CV'nin bu pozisyon için genel uygunluğu - 1-2 cümle]

⭐ En Güçlü 3 Yön
• [Yön 1] - [Kısa açıklama]
• [Yön 2] - [Kısa açıklama]
• [Yön 3] - [Kısa açıklama]

🔧 En Kritik 3 Eksiklik
• [Eksiklik 1] - [Kısa açıklama]
• [Eksiklik 2] - [Kısa açıklama]
• [Eksiklik 3] - [Kısa açıklama]

💡 Hızlı Öneriler
• [Öneri 1]
• [Öneri 2]
• [Öneri 3]

📊 Uyum Değerlendirmesi
Güçlü Yönler: [Sayı] | Geliştirme Alanları: [Sayı]
Genel Uyum: [İyi/Orta/Geliştirilmeli]

ÖNEMLİ: Sadece {language} dilinde cevap ver, kısa ve şık tut. Emoji kullan. Markdown formatı kullanma, sadece düz metin yaz.
"""
            
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.6,
                max_tokens=800
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Hızlı analiz sırasında hata oluştu: {str(e)}"
"""
Interview Questions Agent
CV ve iş ilanına göre mülakat soruları üreten ajan.
"""

import os
from groq import Groq
from dotenv import load_dotenv

# .env dosyasındaki değişkenleri yükle
load_dotenv('config.env')

class InterviewQuestionsAgent:
    """CV ve iş ilanına göre mülakat soruları üreten ajan"""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY bulunamadı!")
        
        self.client = Groq(api_key=self.api_key)
        self.model = "llama3-70b-8192"
    
    def generate_questions(self, cv_text: str, job_text: str) -> str:
        """
        CV ve iş ilanına göre mülakat soruları üretir.
        
        Args:
            cv_text: CV metni
            job_text: İş ilanı metni
            
        Returns:
            Mülakat soruları metni
        """
        print("\n--- INTERVIEW QUESTIONS AGENT ÇALIŞIYOR ---")
        
        try:
            prompt = f"""
Sen bir mülakat uzmanısın. Aşağıdaki CV ve iş ilanına göre 5 adet mülakat sorusu ve cevabı hazırla.

CV METNİ:
{cv_text}

İŞ İLANI METNİ:
{job_text}

GÖREV: 5 adet mülakat sorusu ve her soru için kısa cevap hazırla. Her seferinde farklı ve yaratıcı sorular üret:

🎯 MÜLAKAT SORULARI VE CEVAPLARI

1️⃣ [Teknik Soru]
   Soru: [CV ve iş ilanına uygun teknik soru - her seferinde farklı olsun]
   Cevap: [Kısa ve net cevap]

2️⃣ [Deneyim Sorusu]
   Soru: [Geçmiş deneyimlerle ilgili soru - spesifik projeler hakkında]
   Cevap: [Kısa ve net cevap]

3️⃣ [Davranışsal Soru]
   Soru: [Durum ve davranış odaklı soru - zorluklar ve çözümler]
   Cevap: [Kısa ve net cevap]

4️⃣ [Motivasyon Sorusu]
   Soru: [Kariyer hedefleri ve motivasyon soru - gelecek planları]
   Cevap: [Kısa ve net cevap]

5️⃣ [Şirket Uyumu Sorusu]
   Soru: [Şirket kültürü ve uyum soru - değerler ve kültür]
   Cevap: [Kısa ve net cevap]

ÖNEMLİ KURALLAR:
- Her seferinde tamamen farklı sorular üret
- Her soru CV ve iş ilanına uygun olsun
- Cevaplar kısa ve pratik olsun
- Türkçe dilinde yaz
- Emoji kullanarak görsel çekicilik kat
- Markdown formatı kullanma, sadece düz metin yaz
- Yaratıcı ve çeşitli sorular sor"""
            
            print("✅ Prompt oluşturuldu, API'ye istek gönderiliyor...")
            
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.9,
                max_tokens=1200
            )
            
            print("✅ Mülakat soruları oluşturuldu!")
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"❌ HATA: {type(e).__name__} - {e}")
            return f"Mülakat soruları oluşturulurken hata oluştu: {str(e)}"

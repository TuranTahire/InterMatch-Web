"""
CV Improvement Agent
CV'yi iş ilanına göre iyileştirme önerileri üreten ajan.
"""

import os
from groq import Groq
from dotenv import load_dotenv

# .env dosyasındaki değişkenleri yükle
load_dotenv('config.env')

class CVImprovementAgent:
    """CV'yi iş ilanına göre iyileştirme önerileri üreten ajan"""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY bulunamadı!")
        
        self.client = Groq(api_key=self.api_key)
        self.model = "llama3-8b-8192"
    
    def get_suggestions(self, cv_text: str, job_text: str) -> str:
        """
        CV'yi iş ilanına göre iyileştirme önerileri üretir.
        
        Args:
            cv_text: CV metni
            job_text: İş ilanı metni
            
        Returns:
            İyileştirme önerileri metni
        """
        print("\n--- CV IMPROVEMENT AGENT ÇALIŞIYOR ---")
        
        try:
            prompt = f"""
            Sen profesyonel bir CV danışmanısın. Verilen CV'yi iş ilanına göre nasıl iyileştirebileceğini analiz et.
            
            Analizini şu başlıklar altında yap:
            1. **Eksik Beceriler** - İlanda istenen ama CV'de olmayan beceriler
            2. **Güçlendirilmesi Gereken Alanlar** - CV'de var ama daha iyi sunulabilir
            3. **Anahtar Kelime Önerileri** - İlanda geçen önemli kelimeler
            4. **Deneyim Sunumu** - Deneyimlerin nasıl daha etkili sunulabileceği
            5. **Eğitim ve Sertifikalar** - Eklenebilecek eğitimler
            6. **Genel Öneriler** - CV formatı ve içerik önerileri
            
            Her başlık için spesifik ve uygulanabilir öneriler ver.
            
            CV METNİ: {cv_text}
            İŞ İLANI METNİ: {job_text}
            """
            
            print("✅ Prompt oluşturuldu, API'ye istek gönderiliyor...")
            
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
            )
            
            print("✅ CV iyileştirme önerileri oluşturuldu!")
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"❌ HATA: {type(e).__name__} - {e}")
            return f"CV iyileştirme önerileri oluşturulurken hata oluştu: {str(e)}"

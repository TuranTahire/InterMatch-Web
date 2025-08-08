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
        self.model = "llama3-8b-8192"
    
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
            Sen deneyimli bir işe alım uzmanısın. Verilen CV ve iş ilanına göre aday için özel mülakat soruları hazırla.
            
            Soruları şu kategorilerde organize et:
            1. **Teknik Sorular** (CV'deki becerilerle ilgili)
            2. **Deneyim Soruları** (Geçmiş iş deneyimleriyle ilgili)
            3. **Davranışsal Sorular** (Problem çözme, takım çalışması vb.)
            4. **Pozisyon Özel Soruları** (İş ilanındaki gereksinimlere göre)
            
            Her kategori için 3-5 soru hazırla. Sorular spesifik ve adayın CV'sine özel olsun.
            
            CV METNİ: {cv_text}
            İŞ İLANI METNİ: {job_text}
            """
            
            print("✅ Prompt oluşturuldu, API'ye istek gönderiliyor...")
            
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
            )
            
            print("✅ Mülakat soruları oluşturuldu!")
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"❌ HATA: {type(e).__name__} - {e}")
            return f"Mülakat soruları oluşturulurken hata oluştu: {str(e)}"

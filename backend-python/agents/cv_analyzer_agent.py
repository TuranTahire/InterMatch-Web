"""
CV Analyzer Agent
CV ve iş ilanı uyum analizi yapan ajan.
"""

import os
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
        self.model = "llama3-8b-8192"
    
    def analyze(self, cv_text: str, job_text: str) -> str:
        """
        CV ve iş ilanı arasındaki uyumu analiz eder.
        
        Args:
            cv_text: CV metni
            job_text: İş ilanı metni
            
        Returns:
            Analiz sonucu metni
        """
        print("\n--- CV ANALYZER AGENT ÇALIŞIYOR ---")
        
        try:
            prompt = f"""
            Bir işe alım uzmanı olarak davran ve verilen CV ile iş ilanı arasındaki uyumu analiz et.
            Cevabını 'Uyum Skoru' ve 'Özet Değerlendirme' başlıkları altında sun.

            CV METNİ: {cv_text}
            İŞ İLANI METNİ: {job_text}
            """
            
            print("✅ Prompt oluşturuldu, API'ye istek gönderiliyor...")
            
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
            )
            
            print("✅ Analiz tamamlandı!")
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"❌ HATA: {type(e).__name__} - {e}")
            return f"Analiz sırasında hata oluştu: {str(e)}"

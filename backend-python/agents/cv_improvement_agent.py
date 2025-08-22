"""
CV Improvement Agent
CV'yi iş ilanına göre iyileştirme önerileri üreten ajan.
"""

import os
import json
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
        self.model = "llama3-70b-8192"
    
    def get_suggestions(self, cv_text: str, job_text: str, company_name: str = None, language: str = 'Türkçe') -> str:
        """
        CV'yi iş ilanına göre iyileştirme önerileri üretir.
        
        Args:
            cv_text: CV metni
            job_text: İş ilanı metni
            company_name: Şirket adı (opsiyonel)
            language: Dil seçimi
            
        Returns:
            Detaylı iyileştirme önerileri
        """
        print("\n--- CV IMPROVEMENT AGENT ÇALIŞIYOR ---")
        
        try:
            prompt = f"""
Sen bir uzman CV danışmanı ve kariyer koçusun. Aşağıdaki CV ve iş ilanını analiz ederek kapsamlı ve detaylı iyileştirme önerileri üret.

CV METNİ:
{cv_text}

İŞ İLANI METNİ:
{job_text}

ŞİRKET ADI: {company_name if company_name else 'Belirtilmemiş'}

GÖREV: Bu CV'yi iş ilanına göre iyileştirmek için çok detaylı ve pratik öneriler üret. Aşağıdaki şık, emojili kart formatında cevap ver:

🎯 **CV GELİŞTİRME MERKEZİ** 🚀

📊 **GENEL DEĞERLENDİRME**
[CV'nizin mevcut durumu, güçlü yanları ve iyileştirme potansiyeli hakkında 3-4 cümlelik kapsamlı bir değerlendirme]

⚡ **ÖNCELİKLİ İYİLEŞTİRMELER** (Hemen Yapılması Gerekenler)

🔴 **1. [İlk Öncelikli Alan]**
📋 Mevcut Durum: [Bu alandaki mevcut sorunun açıklaması]
💡 Önerilen İyileştirme: [Detaylı iyileştirme önerisi]
📝 Örnek Uygulama:
   • Önceki: [Mevcut CV'den örnek]
   • Sonraki: [İyileştirilmiş versiyon]

🟡 **2. [İkinci Öncelikli Alan]**
📋 Mevcut Durum: [Bu alandaki mevcut sorunun açıklaması]
💡 Önerilen İyileştirme: [Detaylı iyileştirme önerisi]
📝 Örnek Uygulama:
   • Önceki: [Mevcut CV'den örnek]
   • Sonraki: [İyileştirilmiş versiyon]

📋 **BÖLÜM BAZINDA DETAYLI ÖNERİLER**

💼 **İş Deneyimi Bölümü**
❌ Mevcut Sorunlar:
   • [Sorun 1]
   • [Sorun 2]
   • [Sorun 3]

✅ İyileştirme Stratejileri:
1. 🎯 Başarı Odaklı Yazım: [Her deneyimi başarı ve sonuç odaklı yazma önerisi]
2. 📊 Sayısal Veriler: [Metrikler ve sayısal başarıları vurgulama]
3. 🔑 Anahtar Kelimeler: [İş ilanındaki anahtar kelimeleri entegre etme]

📝 Örnek Yeniden Yazım:
   🔴 ÖNCEKİ: "Proje yöneticisi olarak çalıştım"
   🟢 SONRAKİ: "5 kişilik ekibi yöneterek %25 maliyet tasarrufu sağlayan projeyi 3 ay erken tamamladım"

🎓 **Eğitim ve Sertifikalar**
📋 Mevcut Durum: [Eğitim bölümünün analizi]
💡 İyileştirme Önerileri:
   • [Öneri 1]
   • [Öneri 2]
   • [Öneri 3]

⚡ **Teknik Yetenekler**
❌ Eksik Yetenekler: [İş ilanında aranan ancak CV'de eksik olan yetenekler]
✅ Güçlendirme Önerileri:
   • [Öneri 1]
   • [Öneri 2]
   • [Öneri 3]

🎨 **CV TASARIM VE FORMAT ÖNERİLERİ**

🏗️ **Yapısal İyileştirmeler**
   • [Yapısal öneri 1]
   • [Yapısal öneri 2]
   • [Yapısal öneri 3]

📚 **İçerik Organizasyonu**
   • [Organizasyon önerisi 1]
   • [Organizasyon önerisi 2]
   • [Organizasyon önerisi 3]

🏢 **ŞİRKETE ÖZEL ÖNERİLER**

🤝 **Şirket Kültürüne Uyum:**
   • [Şirket kültürüne uygun öneri 1]
   • [Şirket kültürüne uygun öneri 2]

🎯 **Sektörel Odaklanma:**
   • [Sektörel öneri 1]
   • [Sektörel öneri 2]

🚀 **UZUN VADELİ GELİŞİM PLANI**

📜 **Önerilen Sertifikalar**
1. 🏆 [Sertifika Adı] - [Neden gerekli olduğu]
2. 🏆 [Sertifika Adı] - [Neden gerekli olduğu]
3. 🏆 [Sertifika Adı] - [Neden gerekli olduğu]

📚 **Önerilen Kaynaklar**
   📖 Kitaplar: [Önerilen kitap listesi]
   🎓 Online Kurslar: [Önerilen kurs listesi]
   💻 Pratik Projeler: [Önerilen proje fikirleri]

✅ **HIZLI EYLEM LİSTESİ**
   ☐ [İlk eylem adımı]
   ☐ [İkinci eylem adımı]
   ☐ [Üçüncü eylem adımı]
   ☐ [Dördüncü eylem adımı]
   ☐ [Beşinci eylem adımı]

💡 **EK İPUÇLARI**
   • [Ek ipucu 1]
   • [Ek ipucu 2]
   • [Ek ipucu 3]
   • [Ek ipucu 4]

✨ **Not:** Bu öneriler CV'nizi önemli ölçüde iyileştirecek potansiyele sahiptir. Her öneriyi adım adım uygulayarak en iyi sonucu alabilirsiniz.

📋 **ÖNEMLİ KURALLAR:**
- Sadece {language} dilinde cevap ver
- Her öneri için somut örnekler ver
- CV'deki gerçek içeriğe dayalı öneriler yap
- İş ilanındaki gereksinimlere odaklan
- Pratik ve uygulanabilir öneriler sun
- Motivasyonel ve destekleyici bir ton kullan
- Emojili, şık kart formatında yaz
"""
            
            print("✅ Prompt oluşturuldu, API'ye istek gönderiliyor...")
            
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.7,
                max_tokens=4000
            )
            
            print("✅ CV iyileştirme önerileri oluşturuldu!")
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"❌ HATA: {type(e).__name__} - {e}")
            return f"CV iyileştirme önerileri oluşturulurken hata oluştu: {str(e)}"

    def get_quick_tips(self, cv_text: str, job_text: str, language: str = 'Türkçe') -> str:
        """
        Hızlı CV iyileştirme ipuçları üretir.
        
        Args:
            cv_text: CV metni
            job_text: İş ilanı metni
            language: Dil seçimi
            
        Returns:
            Hızlı ipuçları
        """
        try:
            prompt = f"""
Sen bir CV uzmanısın. Aşağıdaki CV ve iş ilanı için 5 hızlı ve etkili iyileştirme ipucu ver.

CV METNİ:
{cv_text}

İŞ İLANI METNİ:
{job_text}

GÖREV: En etkili 5 hızlı iyileştirme ipucu ver. Her ipucu için:
- Kısa açıklama
- Pratik örnek
- Beklenen fayda

Format:
HIZLI CV İYİLEŞTİRME İPUÇLARI

1. [İpucu Başlığı]
Açıklama: [Kısa açıklama]
Örnek: [Pratik örnek]
Fayda: [Beklenen fayda]

2. [İpucu Başlığı]
Açıklama: [Kısa açıklama]
Örnek: [Pratik örnek]
Fayda: [Beklenen fayda]

[3, 4, 5. ipuçları için aynı format]

ÖNEMLİ: Sadece {language} dilinde cevap ver ve pratik, uygulanabilir öneriler sun. Markdown formatı kullanma, sadece düz metin yaz.
"""
            
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.6,
                max_tokens=1500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Hızlı ipuçları oluşturulurken hata oluştu: {str(e)}"

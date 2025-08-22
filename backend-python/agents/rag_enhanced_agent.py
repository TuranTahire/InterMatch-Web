"""
RAG Enhanced Agent
Belge tabanlı bilgi ile geliştirilmiş CV analiz ajanı.
"""

import os
import glob
from groq import Groq
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv('config.env')

class RAGEnhancedAgent:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY bulunamadı!")
        self.client = Groq(api_key=self.api_key)
        self.model = "llama3-8b-8192"
        self.documents_path = "documents/"
        
        # ChromaDB ve Embedding modelini hazırla
        try:
            self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
            self.vectordb = Chroma(persist_directory="./chroma_db", embedding_function=self.embeddings)
            print("✅ RAG Agent: ChromaDB ve Embedding modeli hazır")
        except Exception as e:
            print(f"❌ RAG Agent: ChromaDB yüklenirken hata: {e}")
            self.vectordb = None
        
    def _load_documents(self):
        """Documents klasöründeki tüm .txt dosyalarını yükler"""
        documents = []
        txt_files = glob.glob(os.path.join(self.documents_path, "*.txt"))
        
        for file_path in txt_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    filename = os.path.basename(file_path)
                    documents.append(f"--- {filename} ---\n{content}")
            except Exception as e:
                print(f"Dosya okuma hatası {file_path}: {e}")
                
        return "\n\n".join(documents)
    
    def retrieve_context(self, job_text: str, k: int = 5) -> str:
        """
        ChromaDB'den iş ilanına en yakın belge parçalarını getirir
        
        Args:
            job_text: İş ilanı metni
            k: Kaç adet belge parçası getirileceği (varsayılan: 5)
            
        Returns:
            En alakalı belge parçalarının birleştirilmiş metni
        """
        try:
            if not self.vectordb:
                print("❌ ChromaDB kullanılamıyor, eski yöntem kullanılıyor...")
                return self._load_documents()
            
            print(f"🔍 ChromaDB'den en alakalı {k} belge parçası aranıyor...")
            
            # İş ilanı metnini embedding'e çevir ve en alakalı belgeleri bul
            relevant_docs = self.vectordb.similarity_search(job_text, k=k)
            
            # Bulunan belgeleri birleştir
            context_parts = []
            for i, doc in enumerate(relevant_docs, 1):
                source = doc.metadata.get('source', 'Bilinmeyen')
                context_parts.append(f"--- BELGE {i} ({source}) ---\n{doc.page_content}")
            
            context = "\n\n".join(context_parts)
            print(f"✅ {len(relevant_docs)} adet alakalı belge parçası bulundu")
            
            return context
            
        except Exception as e:
            print(f"❌ Context retrieval hatası: {e}")
            # Hata durumunda eski yöntemi kullan
            return self._load_documents()
    
    def analyze_with_rag(self, cv_text: str, job_text: str, company_name: str = None, language: str = 'Türkçe') -> str:
        """RAG destekli CV analizi yapar"""
        try:
            # ChromaDB'den en alakalı belgeleri getir
            knowledge_base = self.retrieve_context(job_text, k=5)
            
            # Çok güçlü dil direktifi
            if company_name:
                enhanced_prompt = f"""
Sen bir uzman CV analisti ve kariyer danışmanısın. Aşağıdaki uzman bilgilerini kullanarak detaylı analiz yap.

--- UZMAN BİLGİLERİ ---
{knowledge_base}

--- GÖREV ---
Yukarıdaki uzman bilgilerini kullanarak, aşağıdaki CV ve iş ilanını detaylıca analiz et.

CV METNİ:
{cv_text}

İŞ İLANI METNİ:
{job_text}

ŞİRKET ADI: {company_name}

GÖREV: Bu CV'nin iş ilanına ne kadar uygun olduğunu analiz et ve şu formatta cevap ver:

**ÖZET DEĞERLENDİRME:**
[CV'nin bu pozisyon için neden uygun veya uygun olmadığını 2-3 cümlelik kısa bir paragrafta açıkla. Spesifik nedenler belirt.]

**EŞLEŞEN YETENEKLER:**
[CV'de bulunan ve iş ilanında da istenen en önemli 3-5 teknik yetenek veya beceriyi madde madde listele. Örnek: "React.js ile modern web uygulamaları geliştirme deneyimi", "MongoDB ve PostgreSQL veritabanı yönetimi"]

**EKSİK VEYA GELİŞTİRİLMESİ GEREKEN YÖNLER:**
[İş ilanında aranan ancak CV'de belirgin olmayan veya eksik olan 2-3 önemli noktayı madde madde belirt. Örnek: "AWS cloud servisleri deneyimi eksik", "Takım liderliği deneyimi yetersiz"]

**ÖNERİLER:**
[Bu pozisyon için CV'yi nasıl iyileştirebileceğine dair 2-3 pratik öneri ver. Örnek: "Projelerinizde kullanılan teknolojileri daha detaylı açıklayın", "Liderlik deneyimlerinizi vurgulayın"]

ÖNEMLİ KURALLAR:
- Sadece {language} dilinde cevap ver
- Her bölümde spesifik ve somut örnekler kullan
- Genel ifadeler yerine detaylı açıklamalar yap
- CV'deki gerçek içeriğe dayalı analiz yap
- İş ilanındaki gereksinimlere odaklan
- Uzman bilgilerini kullanarak daha derin analiz yap
"""
            else:
                enhanced_prompt = f"""
Sen bir uzman CV analisti ve kariyer danışmanısın. Aşağıdaki uzman bilgilerini kullanarak detaylı analiz yap.

--- UZMAN BİLGİLERİ ---
{knowledge_base}

--- GÖREV ---
Yukarıdaki uzman bilgilerini kullanarak, aşağıdaki CV ve iş ilanını detaylıca analiz et.

CV METNİ:
{cv_text}

İŞ İLANI METNİ:
{job_text}

GÖREV: Bu CV'nin iş ilanına ne kadar uygun olduğunu analiz et ve şu formatta cevap ver:

**ÖZET DEĞERLENDİRME:**
[CV'nin bu pozisyon için neden uygun veya uygun olmadığını 2-3 cümlelik kısa bir paragrafta açıkla. Spesifik nedenler belirt.]

**EŞLEŞEN YETENEKLER:**
[CV'de bulunan ve iş ilanında da istenen en önemli 3-5 teknik yetenek veya beceriyi madde madde listele. Örnek: "React.js ile modern web uygulamaları geliştirme deneyimi", "MongoDB ve PostgreSQL veritabanı yönetimi"]

**EKSİK VEYA GELİŞTİRİLMESİ GEREKEN YÖNLER:**
[İş ilanında aranan ancak CV'de belirgin olmayan veya eksik olan 2-3 önemli noktayı madde madde belirt. Örnek: "AWS cloud servisleri deneyimi eksik", "Takım liderliği deneyimi yetersiz"]

**ÖNERİLER:**
[Bu pozisyon için CV'yi nasıl iyileştirebileceğine dair 2-3 pratik öneri ver. Örnek: "Projelerinizde kullanılan teknolojileri daha detaylı açıklayın", "Liderlik deneyimlerinizi vurgulayın"]

ÖNEMLİ KURALLAR:
- Sadece {language} dilinde cevap ver
- Her bölümde spesifik ve somut örnekler kullan
- Genel ifadeler yerine detaylı açıklamalar yap
- CV'deki gerçek içeriğe dayalı analiz yap
- İş ilanındaki gereksinimlere odaklan
- Uzman bilgilerini kullanarak daha derin analiz yap
"""

            # Groq API'ye istek gönder
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": enhanced_prompt,
                    }
                ],
                model=self.model,
            )
            
            # Gerçek analizi döndür
            return chat_completion.choices[0].message.content
            
        except Exception as e:
            print(f"❌ RAG Analiz hatası: {e}")
            return f"RAG analizi sırasında bir hata oluştu: {str(e)}"
    
    def generate_questions_with_rag(self, cv_text: str, job_text: str) -> str:
        """RAG destekli mülakat soruları üretir"""
        try:
            # ChromaDB'den mülakat konularıyla ilgili belgeleri getir
            knowledge_base = self.retrieve_context(f"mülakat soruları {job_text}", k=3)
            
            enhanced_prompt = f"""
ÖNEMLİ: SEN SADECE TÜRKÇE DİLİNDE CEVAP VERİRSİN!
ASLA BAŞKA DİL KULLANMA!
TÜRKÇE DİLİNDE YAZ!
TÜM CEVABINI TÜRKÇE DİLİNDE VER!

--- UZMAN BİLGİLERİ ---
{knowledge_base}

--- GÖREV ---
Yukarıdaki uzman bilgilerini kullanarak, aşağıdaki CV ve iş ilanına göre mülakat soruları üret.

**CV METNİ:**
{cv_text}

**İŞ İLANI METNİ:**
{job_text}

Aşağıdaki kategorilerde sorular üret:

**Teknik Sorular (3-5 soru):**
[Pozisyonla ilgili teknik bilgi ve becerileri test eden sorular]

**Davranışsal Sorular (3-5 soru):**
[Geçmiş deneyimleri ve davranışları test eden sorular]

**Durumsal Sorular (2-3 soru):**
[İş ortamında karşılaşabileceği durumları test eden sorular]

**Uzman İpuçları:**
[Yukarıdaki uzman bilgilerine dayanarak, mülakat için özel ipuçları]

TEKRAR: SADECE TÜRKÇE DİLİNDE CEVAP VER!
"""

            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": enhanced_prompt,
                    }
                ],
                model=self.model,
            )
            
            return chat_completion.choices[0].message.content
            
        except Exception as e:
            print(f"❌ RAG Soru üretme hatası: {e}")
            return f"Mülakat soruları üretilirken bir hata oluştu: {str(e)}"
    
    def get_improvement_suggestions_with_rag(self, cv_text: str, job_text: str) -> str:
        """RAG destekli CV iyileştirme önerileri üretir"""
        try:
            # ChromaDB'den CV iyileştirme konularıyla ilgili belgeleri getir
            knowledge_base = self.retrieve_context(f"CV yazma ipuçları {job_text}", k=3)
            
            enhanced_prompt = f"""
SEN SADECE TÜRKÇE DİLİNDE CEVAP VERİRSİN!
ASLA BAŞKA DİL KULLANMA!
TÜRKÇE DİLİNDE YAZ!

--- UZMAN BİLGİLERİ ---
{knowledge_base}

--- GÖREV ---
Yukarıdaki uzman bilgilerini kullanarak, aşağıdaki CV'yi iş ilanına göre iyileştirme önerileri ver.

**CV METNİ:**
{cv_text}

**İŞ İLANI METNİ:**
{job_text}

Aşağıdaki kategorilerde öneriler üret:

**Yapısal İyileştirmeler:**
[CV'nin genel yapısı ve formatı için öneriler]

**İçerik İyileştirmeleri:**
[CV içeriğini güçlendirmek için öneriler]

**Anahtar Kelime Optimizasyonu:**
[ATS sistemleri için anahtar kelime önerileri]

**Deneyim Vurgulama:**
[Deneyimleri daha etkili sunmak için öneriler]

**Beceri Geliştirme:**
[Eksik becerileri geliştirmek için öneriler]

**Uzman Tavsiyeleri:**
[Yukarıdaki uzman bilgilerine dayanarak özel tavsiyeler]

TEKRAR: SADECE TÜRKÇE DİLİNDE CEVAP VER!
"""

            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": enhanced_prompt,
                    }
                ],
                model=self.model,
            )
            
            return chat_completion.choices[0].message.content
            
        except Exception as e:
            print(f"❌ RAG İyileştirme hatası: {e}")
            return f"CV iyileştirme önerileri üretilirken bir hata oluştu: {str(e)}"

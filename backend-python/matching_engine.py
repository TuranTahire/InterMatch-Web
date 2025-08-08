# matching_engine.py
# RAG Destekli Uzman Analiz Sistemi

import os
import glob
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from groq import Groq
from dotenv import load_dotenv

load_dotenv('config.env')

def build_vectorstore():
    """
    Documents klasöründeki tüm belgeleri yükleyip ChromaDB'ye ekler
    """
    print("🎓 UZMAN EĞİTİM PROGRAMI BAŞLIYOR...")
    print("=" * 50)

    try:
        # 1. Embedding modelini hazırla
        print("🔍 Embedding modeli hazırlanıyor...")
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        print("✅ Embedding modeli hazır.")

        # 2. Documents klasöründeki belgeleri yükle
        print("\n📚 Belgeler yükleniyor...")
        documents = []
        txt_files = glob.glob('documents/*.txt')

        for file_path in txt_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    filename = os.path.basename(file_path)
                    doc = Document(page_content=content, metadata={"source": filename})
                    documents.append(doc)
                    print(f"✅ {filename} yüklendi")
            except Exception as e:
                print(f"❌ {file_path} yüklenirken hata: {e}")

        print(f"✅ {len(documents)} adet belge yüklendi.")

        # 3. Belgeleri chunk'lara böl
        print("\n✂️ Belgeler küçük parçalara bölünüyor...")
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        texts = text_splitter.split_documents(documents)
        print(f"✅ Belgeler {len(texts)} adet parçaya bölündü.")

        # 4. ChromaDB'ye ekle
        print("\n🧠 Vektör veritabanına kaydediliyor...")
        vectordb = Chroma.from_documents(
            documents=texts,
            embedding=embeddings,
            persist_directory="./chroma_db"
        )
        
        print("\n" + "=" * 50)
        print("🎉 UZMAN EĞİTİMİ TAMAMLANDI!")
        print(f"🧠 Vektör veritabanı '{len(texts)}' adet parça ile oluşturuldu.")
        print("=" * 50)
        
        return vectordb
        
    except Exception as e:
        print(f"❌ Vektör veritabanı oluşturma hatası: {e}")
        return None

def calculate_cosine_similarity(vec1, vec2):
    """
    İki embedding vektörü arasındaki cosine similarity değerini hesaplar
    
    Args:
        vec1: İlk embedding vektörü
        vec2: İkinci embedding vektörü
        
    Returns:
        Cosine similarity skoru (0-1 arası)
    """
    try:
        # Vektörleri numpy array'e çevir
        vec1_array = np.array(vec1).reshape(1, -1)
        vec2_array = np.array(vec2).reshape(1, -1)
        
        # Cosine similarity hesapla
        similarity = cosine_similarity(vec1_array, vec2_array)[0][0]
        
        return float(similarity)
    except Exception as e:
        print(f"❌ Cosine similarity hesaplama hatası: {e}")
        return 0.0

def extract_skills(text):
    """
    Metinden becerileri çıkarır
    
    Args:
        text: Metin
        
    Returns:
        Beceri listesi
    """
    # Basit beceri çıkarma (gerçek uygulamada daha gelişmiş NLP kullanılabilir)
    common_skills = [
        'python', 'java', 'javascript', 'react', 'node.js', 'sql', 'mongodb',
        'docker', 'kubernetes', 'aws', 'azure', 'git', 'agile', 'scrum',
        'machine learning', 'ai', 'data science', 'analytics', 'project management',
        'leadership', 'communication', 'teamwork', 'problem solving', 'analytical thinking'
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in common_skills:
        if skill in text_lower:
            found_skills.append(skill)
    
    return found_skills

def calculate_skill_match(cv_skills, job_skills):
    """
    CV ve iş ilanı becerileri arasındaki uyumu hesaplar
    
    Args:
        cv_skills: CV'deki beceriler listesi
        job_skills: İş ilanındaki beceriler listesi
        
    Returns:
        Beceri uyum skoru (0-1 arası)
    """
    try:
        if not job_skills:
            return 0.5  # Beceri belirtilmemişse orta skor
        
        # Ortak becerileri bul
        common_skills = set(cv_skills) & set(job_skills)
        
        # Uyum skorunu hesapla
        if len(job_skills) > 0:
            skill_match = len(common_skills) / len(job_skills)
        else:
            skill_match = 0.0
        
        return min(skill_match, 1.0)  # 1.0'ı geçmemesi için
        
    except Exception as e:
        print(f"❌ Beceri uyum hesaplama hatası: {e}")
        return 0.0

def calculate_final_score(cv_text, job_text, rag_context=""):
    """
    CV ve iş ilanı arasındaki final skoru hesaplar
    
    Args:
        cv_text: CV metni
        job_text: İş ilanı metni
        rag_context: RAG'den gelen ek bağlam
        
    Returns:
        Final skor (0-100 arası) ve detaylar
    """
    try:
        print("🎯 SKOR HESAPLAMA BAŞLIYOR...")
        
        # 1. Embedding modelini hazırla
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        
        # 2. CV ve iş ilanı embedding'lerini hesapla
        print("🔍 Embedding'ler hesaplanıyor...")
        cv_embedding = embeddings.embed_query(cv_text)
        job_embedding = embeddings.embed_query(job_text)
        
        # 3. Cosine similarity hesapla
        print("📊 Cosine similarity hesaplanıyor...")
        text_similarity = calculate_cosine_similarity(cv_embedding, job_embedding)
        text_score = text_similarity * 100  # 0-100 arasına çevir
        
        # 4. Becerileri çıkar ve karşılaştır
        print("🛠️ Beceriler analiz ediliyor...")
        cv_skills = extract_skills(cv_text)
        job_skills = extract_skills(job_text)
        skill_match = calculate_skill_match(cv_skills, job_skills)
        skill_score = skill_match * 100  # 0-100 arasına çevir
        
        # 5. RAG bağlamından ek puan (varsa)
        rag_bonus = 0
        if rag_context:
            print("🧠 RAG bağlamı analiz ediliyor...")
            # RAG bağlamından beceri çıkar
            rag_skills = extract_skills(rag_context)
            rag_skill_match = calculate_skill_match(cv_skills, rag_skills)
            rag_bonus = rag_skill_match * 10  # 0-10 arası bonus
        
        # 6. Final skoru hesapla
        final_score = (text_score + skill_score + rag_bonus) / 2
        final_score = min(final_score, 100)  # 100'ü geçmemesi için
        
        # 7. Sonuçları hazırla
        result = {
            "final_score": round(final_score, 1),
            "text_similarity": round(text_score, 1),
            "skill_match": round(skill_score, 1),
            "rag_bonus": round(rag_bonus, 1),
            "cv_skills": cv_skills,
            "job_skills": job_skills,
            "common_skills": list(set(cv_skills) & set(job_skills)),
            "missing_skills": list(set(job_skills) - set(cv_skills))
        }
        
        print(f"✅ Skor hesaplama tamamlandı: {final_score:.1f}/100")
        return result
        
    except Exception as e:
        print(f"❌ Skor hesaplama hatası: {e}")
        return {
            "final_score": 0,
            "text_similarity": 0,
            "skill_match": 0,
            "rag_bonus": 0,
            "cv_skills": [],
            "job_skills": [],
            "common_skills": [],
            "missing_skills": [],
            "error": str(e)
        }

def get_rag_analysis(cv_text, job_text):
    """
    RAG destekli uzman analizi yapar
    Uzmanın beynindeki bilgileri kullanarak CV ve iş ilanı analizi yapar
    """
    print("--- RAG Destekli Uzman Analizi Başlatılıyor ---")

    try:
        # 1. Uzmanın "gözlüğünü" ve "beynini" hazırla
        print("🔍 Uzmanın gözlüğü ve beyni hazırlanıyor...")
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vectordb = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
        print("✅ Uzmanın beyni yüklendi.")

        # 2. Beyinden konuyla ilgili notları bul ve getir
        print("🧠 Uzmanın beyninden ilgili notlar aranıyor...")
        query = f"CV analizi ve iş ilanı: {job_text[:200]}..."  # İlana göre en alakalı notları bul
        relevant_docs = vectordb.similarity_search(query, k=3)  # En alakalı 3 notu getir
        context = "\n\n".join(doc.page_content for doc in relevant_docs)
        print(f"✅ Uzmanın beyninden {len(relevant_docs)} adet ilgili not bulundu.")

        # 3. Uzmana sorulacak soruyu hazırla (notları da ekleyerek)
        enhanced_prompt = f"""
        Sen bir uzman kariyer danışmanısın. Cevaplarını SANA VERİLEN UZMAN NOTLARI'na dayandırarak oluştur.

        ---
        UZMAN NOTLARI:
        {context}
        ---

        GÖREV: Yukarıdaki uzman notları ışığında, aşağıdaki CV ve iş ilanını detaylıca analiz et.

        CV METNİ:
        {cv_text}

        İŞ İLANI METNİ:
        {job_text}

        Analizini şu formatta, başlıkları kullanarak ve Türkçe olarak sunmalısın:

        **Uyum Skoru:** [CV'nin ilana ne kadar uygun olduğunu 100 üzerinden bir yüzde olarak belirt]

        **Özet Değerlendirme:** [Adayın bu pozisyon için neden uygun veya uygun olmadığını 2-3 cümlelik kısa bir paragrafta açıkla]

        **Eşleşen Anahtar Kelimeler ve Yetenekler:** [CV'de bulunan ve ilanda da istenen en önemli 3-5 yetenek veya anahtar kelimeyi madde madde listele]

        **Eksik veya Geliştirilmesi Gereken Yönler:** [İlanda aranan ancak CV'de belirgin olmayan veya eksik olan 2-3 önemli noktayı madde madde belirt]

        **Uzman Tavsiyeleri:** [Yukarıdaki uzman notlarına dayanarak, adaya özel tavsiyeler ver]

        **CV İyileştirme Önerileri:** [Uzman notlarına göre CV'yi nasıl iyileştirebileceğini belirt]
        """

        # 4. Skor hesaplama
        print("🎯 Skor hesaplama başlatılıyor...")
        score_result = calculate_final_score(cv_text, job_text, context)
        
        # 5. Uzmandan cevap al (Groq)
        print("🤖 Uzman analizi yapılıyor...")
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": enhanced_prompt}],
            model="llama3-8b-8192"
        )
        
        ai_analysis = chat_completion.choices[0].message.content
        
        # 6. Sonuçları birleştir
        result = {
            "analysis": ai_analysis,
            "score": score_result,
            "rag_context_used": len(relevant_docs)
        }
        
        print("✅ RAG destekli uzman analizi ve skor hesaplama tamamlandı.")
        return result
        
    except Exception as e:
        print(f"❌ RAG Analiz hatası: {e}")
        return f"RAG analizi sırasında bir hata oluştu: {str(e)}"

def get_rag_interview_questions(cv_text, job_text):
    """
    RAG destekli mülakat soruları üretir
    """
    print("--- RAG Destekli Mülakat Soruları Üretiliyor ---")

    try:
        # 1. Uzmanın beynini hazırla
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vectordb = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)

        # 2. Mülakat konularıyla ilgili notları bul
        query = f"Mülakat soruları ve teknik sorular: {job_text[:200]}..."
        relevant_docs = vectordb.similarity_search(query, k=2)
        context = "\n\n".join(doc.page_content for doc in relevant_docs)

        # 3. Mülakat soruları prompt'u hazırla
        enhanced_prompt = f"""
        Sen bir uzman mülakatçısın. Aşağıdaki uzman notlarını kullanarak mülakat soruları üretmelisin.

        ---
        UZMAN NOTLARI:
        {context}
        ---

        GÖREV: Yukarıdaki uzman notları ışığında, aşağıdaki CV ve iş ilanına göre mülakat soruları üret.

        CV METNİ:
        {cv_text}

        İŞ İLANI METNİ:
        {job_text}

        Aşağıdaki kategorilerde sorular üret:

        **Teknik Sorular (3-5 soru):**
        [Pozisyonla ilgili teknik bilgi ve becerileri test eden sorular]

        **Behavioral Sorular (3-5 soru):**
        [Geçmiş deneyimleri ve davranışları test eden sorular]

        **Durumsal Sorular (2-3 soru):**
        [İş ortamında karşılaşabileceği durumları test eden sorular]

        **Uzman İpuçları:**
        [Yukarıdaki uzman notlarına dayanarak, mülakat için özel ipuçları]
        """

        # 4. Soruları üret
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": enhanced_prompt}],
            model="llama3-8b-8192"
        )
        
        return chat_completion.choices[0].message.content
        
    except Exception as e:
        print(f"❌ RAG Mülakat soruları hatası: {e}")
        return f"Mülakat soruları üretilirken bir hata oluştu: {str(e)}"

def get_rag_cv_improvements(cv_text, job_text):
    """
    RAG destekli CV iyileştirme önerileri üretir
    """
    print("--- RAG Destekli CV İyileştirme Önerileri Üretiliyor ---")

    try:
        # 1. Uzmanın beynini hazırla
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vectordb = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)

        # 2. CV iyileştirme konularıyla ilgili notları bul
        query = f"CV yazma ipuçları ve iyileştirme: {job_text[:200]}..."
        relevant_docs = vectordb.similarity_search(query, k=2)
        context = "\n\n".join(doc.page_content for doc in relevant_docs)

        # 3. CV iyileştirme prompt'u hazırla
        enhanced_prompt = f"""
        Sen bir uzman CV danışmanısın. Aşağıdaki uzman notlarını kullanarak CV iyileştirme önerileri üretmelisin.

        ---
        UZMAN NOTLARI:
        {context}
        ---

        GÖREV: Yukarıdaki uzman notları ışığında, aşağıdaki CV'yi iş ilanına göre iyileştirme önerileri ver.

        CV METNİ:
        {cv_text}

        İŞ İLANI METNİ:
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
        [Yukarıdaki uzman notlarına dayanarak özel tavsiyeler]
        """

        # 4. Önerileri üret
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": enhanced_prompt}],
            model="llama3-8b-8192"
        )
        
        return chat_completion.choices[0].message.content
        
    except Exception as e:
        print(f"❌ RAG CV iyileştirme hatası: {e}")
        return f"CV iyileştirme önerileri üretilirken bir hata oluştu: {str(e)}"

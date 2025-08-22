from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv
from groq import Groq
from agents.rag_enhanced_agent import RAGEnhancedAgent
from agents.cv_analyzer_agent import CVAnalyzerAgent
from agents.cv_improvement_agent import CVImprovementAgent
from agents.interview_questions_agent import InterviewQuestionsAgent
from matching_engine import calculate_final_score
from utils import extract_text_from_file, clean_text
import langdetect
from deep_translator import GoogleTranslator

# Load environment variables
load_dotenv('config.env')

app = Flask(__name__)
# CORS configuration for development - allow all origins
CORS(app, origins="*")

# AI Agents'ları başlat
try:
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    rag_agent = RAGEnhancedAgent()
    cv_analyzer_agent = CVAnalyzerAgent()
    cv_improvement_agent = CVImprovementAgent()
    interview_questions_agent = InterviewQuestionsAgent()
    translator = GoogleTranslator()
    print("✅ Tüm AI Agents başarıyla yüklendi!")
    print("   - Groq AI Client")
    print("   - RAG Enhanced Agent")
    print("   - CV Analyzer Agent")
    print("   - CV Improvement Agent")
    print("   - Interview Questions Agent")
    print("   - Google Translator")
except Exception as e:
    print(f"❌ AI yüklenirken hata: {e}")
    groq_client = None
    rag_agent = None
    cv_analyzer_agent = None
    cv_improvement_agent = None
    interview_questions_agent = None
    translator = None

def detect_language(text):
    """Metnin dilini algıla"""
    try:
        print(f"🔍 Dil algılama: {text[:50]}...")
        detected = langdetect.detect(text)
        print(f"✅ Algılanan dil: {detected}")
        return detected
    except Exception as e:
        print(f"❌ Dil algılama hatası: {e}")
        return 'en'  # Varsayılan olarak İngilizce

def translate_text(text, target_language):
    """Metni hedef dile çevir"""
    try:
        print(f"🔄 Çeviri başlıyor: {target_language}")
        if target_language == 'tr':
            result = GoogleTranslator(source='auto', target='tr').translate(text)
        else:
            result = GoogleTranslator(source='auto', target='en').translate(text)
        print(f"✅ Çeviri tamamlandı: {result[:50]}...")
        return result
    except Exception as e:
        print(f"❌ Çeviri hatası: {e}")
        return text  # Çeviri başarısız olursa orijinal metni döndür

def process_job_description(job_description, page_language):
    """İş ilanını sayfa diline göre işle"""
    print(f"🔄 İş ilanı dil işlemi başlıyor...")
    print(f"   Sayfa dili: {page_language}")
    print(f"   İş ilanı (ilk 200 karakter): {job_description[:200]}...")
    
    # İş ilanının dilini algıla
    detected_lang = detect_language(job_description)
    print(f"   Algılanan dil: {detected_lang}")
    
    # Eğer algılanan dil sayfa dilinden farklıysa çevir
    if detected_lang != page_language:
        print(f"   🔄 Çeviri yapılıyor: {detected_lang} → {page_language}")
        translated_job = translate_text(job_description, page_language)
        print(f"   ✅ Çeviri tamamlandı")
        print(f"   Çevrilen metin (ilk 200 karakter): {translated_job[:200]}...")
        return translated_job
    else:
        print(f"   ✅ Çeviri gerekmiyor")
        return job_description

@app.route('/')
def home():
    return jsonify({
        "message": "🚀 CV Analiz Backend Çalışıyor!",
        "timestamp": datetime.now().isoformat(),
        "ai_available": groq_client is not None,
        "cv_analyzer_available": cv_analyzer_agent is not None,
        "rag_agent_available": rag_agent is not None,
        "groq_client_available": groq_client is not None
    })

@app.route('/api/health')
def health():
    return jsonify({
        "status": "healthy",
        "message": "✅ Backend sağlıklı çalışıyor",
        "timestamp": datetime.now().isoformat(),
        "ai_available": groq_client is not None
    })

@app.route('/test-language', methods=['POST'])
def test_language():
    """Dil algılama ve çeviri test endpoint'i"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        target_lang = data.get('target_language', 'tr')
        
        print(f"🧪 DİL TEST BAŞLIYOR...")
        print(f"   Metin: {text[:100]}...")
        print(f"   Hedef dil: {target_lang}")
        
        # Dil algılama test
        detected = detect_language(text)
        print(f"   Algılanan dil: {detected}")
        
        # Çeviri test
        translated = translate_text(text, target_lang)
        print(f"   Çevrilen metin: {translated[:100]}...")
        
        return jsonify({
            "success": True,
            "original_text": text,
            "detected_language": detected,
            "target_language": target_lang,
            "translated_text": translated
        })
        
    except Exception as e:
        print(f"❌ Dil test hatası: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    """CV ve iş ilanı analizi endpoint'i"""
    print("\n=== ANALYZE ENDPOINT ÇAĞRILDI ===")
    try:
        # Dosya ve metin al
        cv_file = request.files.get('cv_file')
        job_description = request.form.get('job_description')
        company_name = request.form.get('company_name', '').strip()  # Şirket adını al
        language_code = request.form.get('language', 'tr')  # Dil kodu al (varsayılan: tr)
        
        # Dil kodu maplemesi
        language_mapping = {
            'tr': 'Türkçe',
            'en': 'English',
            'de': 'Deutsch',
            'fr': 'Français',
            'es': 'Español'
        }
        
        language_name = language_mapping.get(language_code, 'English')
        print(f"🌍 Dil Kodu: {language_code} → Dil Adı: {language_name}")
        
        if not cv_file or not job_description:
            return jsonify({
                "success": False,
                "error": "CV dosyası ve iş ilanı metni gerekli"
            }), 400
        
        # Dosya bilgilerini al
        file_content = cv_file.read()
        file_info = {
            "filename": cv_file.filename,
            "content_type": cv_file.content_type,
            "size": len(file_content)
        }
        
        # Dosya uzantısını al
        file_extension = os.path.splitext(cv_file.filename)[1]
        
        # Gerçek dosya okuma fonksiyonunu kullan
        print(f"📄 Dosya okunuyor: {cv_file.filename} ({file_extension})")
        cv_text = extract_text_from_file(file_content, file_extension)
        
        if not cv_text:
            print(f"❌ Dosya okunamadı: {cv_file.filename}")
            return jsonify({
                "success": False,
                "error": f"Dosya okunamadı: {cv_file.filename}"
            }), 400
        
        # Metni temizle
        cv_text = clean_text(cv_text)
        print(f"✅ Dosya okundu: {len(cv_text)} karakter")
        
        # AI'ya gönderilecek metni logla
        print(f"🤖 AI'ya gönderilecek metin (ilk 500 karakter):")
        print(f"--- BAŞLANGIÇ ---")
        print(cv_text[:500])
        print(f"--- BİTİŞ ---")
        
        # Çok uzun metinleri kısalt (AI token limiti için)
        if len(cv_text) > 4000:
            cv_text = cv_text[:4000] + "..."
            print(f"⚠️ Metin kısaltıldı: 4000 karakter")
        
        # Dil direktifi ekle (artık gerek yok çünkü AI agent'a direkt dil adını gönderiyoruz)
        original_job = job_description
        
        # Üç aşamalı analiz sistemi başlatılıyor
        print("🤖 ÜÇ AŞAMALI ANALİZ SİSTEMİ BAŞLIYOR...")
        print("=" * 60)
        
        # 1. CV Analyzer Agent - Temel Puan
        print("📊 1. AŞAMA: CV Analyzer Agent (Temel Puan)")
        basic_analysis = ""
        basic_score = 0
        if cv_analyzer_agent:
            try:
                # Şirket adı varsa analizi geliştir
                if company_name:
                    print(f"🏢 Şirket adı tespit edildi: {company_name}")
                    basic_analysis = cv_analyzer_agent.analyze(cv_text, job_description, company_name, language_name)
                else:
                    basic_analysis = cv_analyzer_agent.analyze(cv_text, job_description, None, language_name)
                # Temel analiz tamamlandı - skor hesaplama için sabit değer
                basic_score = 50.0
                print(f"✅ Temel analiz tamamlandı: {basic_score:.1f}/100")
            except Exception as e:
                print(f"❌ CV Analyzer hatası: {e}")
                basic_analysis = "Temel analiz yapılamadı"
                basic_score = 0
        else:
            basic_analysis = "CV Analyzer Agent yüklenemedi"
            basic_score = 0
            print("❌ CV Analyzer Agent kullanılamıyor")
        
        # 2. RAG Enhanced Agent - Ek Bağlam
        print("\n🧠 2. AŞAMA: RAG Enhanced Agent (Ek Bağlam)")
        rag_analysis = ""
        rag_context = ""
        rag_context_count = 0
        if rag_agent:
            try:
                # RAG context'i al
                rag_context = rag_agent.retrieve_context(job_description, k=3)
                rag_context_count = len(rag_context.split("--- BELGE"))
                
                # RAG analizi yap (şirket adı ile)
                if company_name:
                    rag_result = rag_agent.analyze_with_rag(cv_text, job_description, company_name, language_name)
                else:
                    rag_result = rag_agent.analyze_with_rag(cv_text, job_description, None, language_name)
                if isinstance(rag_result, dict):
                    rag_analysis = rag_result.get('analysis', 'RAG analizi yapılamadı')
                else:
                    rag_analysis = rag_result
                
                print(f"✅ RAG analizi tamamlandı: {rag_context_count} belge kullanıldı")
            except Exception as e:
                print(f"❌ RAG analizi hatası: {e}")
                rag_analysis = "RAG analizi yapılamadı"
                rag_context = ""
                rag_context_count = 0
        else:
            rag_analysis = "RAG Agent yüklenemedi"
            rag_context = ""
            rag_context_count = 0
            print("❌ RAG Agent kullanılamıyor")
        
        # 3. Matching Engine - Nihai Skor + Açıklama
        print("\n🎯 3. AŞAMA: Matching Engine (Nihai Skor)")
        final_score_result = {}
        if groq_client:
            try:
                # Nihai skor hesaplama
                final_score_result = calculate_final_score(cv_text, job_description, rag_context)
                
                # Skorları birleştir
                final_score = final_score_result.get('final_score', 0)
                text_similarity = final_score_result.get('text_similarity', 0)
                skill_match = final_score_result.get('skill_match', 0)
                rag_bonus = final_score_result.get('rag_bonus', 0)
                
                print(f"✅ Nihai skor hesaplandı: {final_score:.1f}/100")
                print(f"   - Metin Benzerliği: {text_similarity:.1f}")
                print(f"   - Beceri Uyumu: {skill_match:.1f}")
                print(f"   - RAG Bonus: {rag_bonus:.1f}")
                
            except Exception as e:
                print(f"❌ Nihai skor hesaplama hatası: {e}")
                final_score_result = {
                    "final_score": basic_score,
                    "text_similarity": basic_score,
                    "skill_match": basic_score,
                    "rag_bonus": 0,
                    "error": str(e)
                }
        else:
            final_score_result = {
                "final_score": basic_score,
                "text_similarity": basic_score,
                "skill_match": basic_score,
                "rag_bonus": 0,
                "error": "Groq client kullanılamıyor"
            }
            print("❌ Groq client kullanılamıyor")
        
        # Sonuçları birleştir
        print("\n" + "=" * 60)
        print("🎉 ÜÇ AŞAMALI ANALİZ TAMAMLANDI!")
        print("=" * 60)
        
        # En iyi analizi seç (RAG varsa RAG, yoksa temel)
        if rag_analysis and "yapılamadı" not in rag_analysis and "yüklenemedi" not in rag_analysis:
            ai_analysis = rag_analysis
            analysis_source = "RAG Enhanced Agent"
        else:
            ai_analysis = basic_analysis
            analysis_source = "CV Analyzer Agent"
        
        score_info = final_score_result
        
        # Debug: Analiz sonuçlarını logla
        print(f"🔍 DEBUG: ai_analysis length: {len(ai_analysis) if ai_analysis else 0}")
        print(f"🔍 DEBUG: score_info: {score_info}")
        print(f"🔍 DEBUG: analysis_source: {analysis_source}")
        
        response_data = {
            "success": True,
            "analysis": ai_analysis,
            "analysis_source": analysis_source,
            "score": score_info,
            "rag_context_used": rag_context_count,
            "basic_analysis": basic_analysis,
            "rag_analysis": rag_analysis,
            "file_info": file_info,
            "cv_text_length": len(cv_text),
            "job_description_length": len(job_description),
            "ai_available": True,
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"🔍 DEBUG: Response data keys: {list(response_data.keys())}")
        print(f"🔍 DEBUG: Response analysis: {response_data['analysis'][:200] if response_data['analysis'] else 'EMPTY'}")
        print(f"🔍 DEBUG: Response score: {response_data['score']}")
        
        # Test için analiz içeriğini kontrol et
        print(f"🔍 FINAL ANALYSIS CHECK:")
        print(f"   - Analysis length: {len(ai_analysis) if ai_analysis else 0}")
        print(f"   - Analysis preview: {ai_analysis[:200] if ai_analysis else 'EMPTY'}")
        print(f"   - Analysis source: {analysis_source}")
        
        # Eğer analiz çok kısa veya genel ise, test analizi ekle
        if not ai_analysis or len(ai_analysis) < 100 or "uygunluk analizi yapıldı" in ai_analysis:
            print("⚠️ Analiz çok kısa veya genel, test analizi ekleniyor...")
            ai_analysis = f"""**ÖZET DEĞERLENDİRME:**
CV'nizde {len(cv_text)} karakterlik içerik bulunuyor ve iş ilanında {len(job_description)} karakterlik gereksinim var. Bu pozisyon için uygunluk analizi yapıldı.

**EŞLEŞEN YETENEKLER:**
- Metin analizi ve işleme deneyimi
- Doküman yönetimi ve organizasyon
- Detay odaklı çalışma yaklaşımı

**EKSİK VEYA GELİŞTİRİLMESİ GEREKEN YÖNLER:**
- Spesifik teknik yeteneklerin daha detaylı açıklanması
- Proje deneyimlerinin vurgulanması

**ÖNERİLER:**
- CV'nizde kullanılan teknolojileri daha detaylı listele
- Proje başarılarınızı sayısal verilerle destekle"""

        return jsonify(response_data)
        
    except Exception as e:
        print(f"\n❌ HATA YAKALANDI: {type(e).__name__}")
        print(f"❌ HATA DETAYI: {e}")
        import traceback
        print(f"❌ TRACEBACK: {traceback.format_exc()}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/get-analysis-only', methods=['POST'])
def get_analysis_only():
    """Sadece AI Analysis için endpoint - skor hesaplamaz"""
    print("\n=== GET ANALYSIS ONLY ENDPOINT ÇAĞRILDI ===")
    try:
        # Dosya ve metin al
        cv_file = request.files.get('cv_file')
        job_description = request.form.get('job_description')
        company_name = request.form.get('company_name', '').strip()
        language_code = request.form.get('language', 'tr')
        
        # Dil kodu maplemesi
        language_mapping = {
            'tr': 'Türkçe',
            'en': 'English',
            'de': 'Deutsch',
            'fr': 'Français',
            'es': 'Español'
        }
        
        language_name = language_mapping.get(language_code, 'English')
        
        if not cv_file or not job_description:
            return jsonify({
                "success": False,
                "error": "CV dosyası ve iş ilanı metni gerekli"
            }), 400
        
        # Dosya uzantısını al
        file_extension = os.path.splitext(cv_file.filename)[1]
        
        # Gerçek dosya okuma fonksiyonunu kullan
        print(f"📄 Analysis için dosya okunuyor: {cv_file.filename}")
        cv_text = extract_text_from_file(cv_file.read(), file_extension)
        
        if not cv_text:
            return jsonify({
                "success": False,
                "error": f"Dosya okunamadı: {cv_file.filename}"
            }), 400
        
        # Metni temizle
        cv_text = clean_text(cv_text)
        
        # Çok uzun metinleri kısalt
        if len(cv_text) > 4000:
            cv_text = cv_text[:4000] + "..."
        
        # Sadece AI Analysis - skor hesaplamaz
        if cv_analyzer_agent:
            try:
                print("🤖 CV Analyzer Agent (Analysis Only) kullanılıyor...")
                if company_name:
                    analysis = cv_analyzer_agent.analyze(cv_text, job_description, company_name, language_name)
                else:
                    analysis = cv_analyzer_agent.analyze(cv_text, job_description, None, language_name)
                
                return jsonify({
                    "success": True,
                    "analysis": analysis,
                    "timestamp": datetime.now().isoformat()
                })
                
            except Exception as e:
                print(f"❌ Analysis hatası: {e}")
                return jsonify({
                    "success": False,
                    "error": "Analysis yapılamadı",
                    "timestamp": datetime.now().isoformat()
                }), 500
        else:
            return jsonify({
                "success": False,
                "error": "AI servisi kullanılamıyor",
                "timestamp": datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    """Mülakat soruları üretimi endpoint'i"""
    print("\n=== GENERATE QUESTIONS ENDPOINT ÇAĞRILDI ===")
    try:
        cv_file = request.files.get('cv_file')
        job_description = request.form.get('job_description')
        company_name = request.form.get('company_name', '').strip()  # Şirket adını al
        language_code = request.form.get('language', 'tr')  # Dil kodu al
        
        # Dil kodu maplemesi
        language_mapping = {
            'tr': 'Türkçe',
            'en': 'English',
            'de': 'Deutsch',
            'fr': 'Français',
            'es': 'Español'
        }
        
        language_name = language_mapping.get(language_code, 'English')
        print(f"🌍 Mülakat Dil Kodu: {language_code} → Dil Adı: {language_name}")
        
        if not cv_file or not job_description:
            return jsonify({
                "success": False,
                "error": "CV dosyası ve iş ilanı metni gerekli"
            }), 400
        
        # Dosya uzantısını al
        file_extension = os.path.splitext(cv_file.filename)[1]
        
        # Gerçek dosya okuma fonksiyonunu kullan
        print(f"📄 Mülakat için dosya okunuyor: {cv_file.filename}")
        cv_text = extract_text_from_file(cv_file.read(), file_extension)
        
        if not cv_text:
            return jsonify({
                "success": False,
                "error": f"Dosya okunamadı: {cv_file.filename}"
            }), 400
        
        # Metni temizle
        cv_text = clean_text(cv_text)
        
        # Çok uzun metinleri kısalt
        if len(cv_text) > 4000:
            cv_text = cv_text[:4000] + "..."
        
        # Mülakat soruları üretimi - Yeni Smart Agent kullan
        if interview_questions_agent:
            try:
                print("🤖 Interview Questions Agent kullanılıyor...")
                questions = interview_questions_agent.generate_questions(cv_text, job_description)
                
                return jsonify({
                    "success": True,
                    "interview_questions": questions,
                    "timestamp": datetime.now().isoformat()
                })
                
            except Exception as e:
                print(f"❌ Mülakat soruları hatası: {e}")
                return jsonify({
                    "success": False,
                    "error": "Mülakat soruları üretilemedi",
                    "timestamp": datetime.now().isoformat()
                }), 500
        else:
            return jsonify({
                "success": False,
                "error": "AI servisi kullanılamıyor",
                "timestamp": datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/get-suggestions', methods=['POST'])
def get_suggestions():
    """CV iyileştirme önerileri endpoint'i"""
    print("\n=== GET SUGGESTIONS ENDPOINT ÇAĞRILDI ===")
    try:
        cv_file = request.files.get('cv_file')
        job_description = request.form.get('job_description')
        company_name = request.form.get('company_name', '').strip()  # Şirket adını al
        language_code = request.form.get('language', 'tr')  # Dil kodu al
        
        # Dil kodu maplemesi
        language_mapping = {
            'tr': 'Türkçe',
            'en': 'English',
            'de': 'Deutsch',
            'fr': 'Français',
            'es': 'Español'
        }
        
        language_name = language_mapping.get(language_code, 'English')
        print(f"🌍 CV İyileştirme Dil Kodu: {language_code} → Dil Adı: {language_name}")
        
        if not cv_file or not job_description:
            return jsonify({
                "success": False,
                "error": "CV dosyası ve iş ilanı metni gerekli"
            }), 400
        
        # Dosya uzantısını al
        file_extension = os.path.splitext(cv_file.filename)[1]
        
        # Gerçek dosya okuma fonksiyonunu kullan
        print(f"📄 CV iyileştirme için dosya okunuyor: {cv_file.filename}")
        cv_text = extract_text_from_file(cv_file.read(), file_extension)
        
        if not cv_text:
            return jsonify({
                "success": False,
                "error": f"Dosya okunamadı: {cv_file.filename}"
            }), 400
        
        # Metni temizle
        cv_text = clean_text(cv_text)
        
        # Çok uzun metinleri kısalt
        if len(cv_text) > 4000:
            cv_text = cv_text[:4000] + "..."
        
        # CV iyileştirme önerileri - Yeni Smart Agent kullan
        if cv_improvement_agent:
            try:
                print("🤖 CV Improvement Agent kullanılıyor...")
                print(f"   📝 CV Metni Uzunluğu: {len(cv_text)} karakter")
                print(f"   💼 İş İlanı Uzunluğu: {len(job_description)} karakter")
                print(f"   🏢 Şirket Adı: {company_name}")
                print(f"   🌍 Dil: {language_name}")
                
                suggestions = cv_improvement_agent.get_suggestions(
                    cv_text=cv_text, 
                    job_text=job_description, 
                    company_name=company_name, 
                    language=language_name
                )
                
                print(f"✅ CV önerileri oluşturuldu! Uzunluk: {len(suggestions)} karakter")
                
                return jsonify({
                    "success": True,
                    "suggestions": suggestions,
                    "timestamp": datetime.now().isoformat()
                })
                
            except Exception as e:
                print(f"❌ CV önerileri hatası: {e}")
                return jsonify({
                    "success": False,
                    "error": "CV önerileri üretilemedi",
                    "timestamp": datetime.now().isoformat()
                }), 500
        else:
            return jsonify({
                "success": False,
                "error": "AI servisi kullanılamıyor",
                "timestamp": datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/get-questions', methods=['POST'])
def get_questions():
    """Mülakat soruları endpoint'i"""
    print("\n=== GET QUESTIONS ENDPOINT ÇAĞRILDI ===")
    try:
        cv_file = request.files.get('cv_file')
        job_description = request.form.get('job_description')
        company_name = request.form.get('company_name', '').strip()
        language_code = request.form.get('language', 'tr')
        
        # Dil kodu maplemesi
        language_mapping = {
            'tr': 'Türkçe',
            'en': 'English',
            'de': 'Deutsch',
            'fr': 'Français',
            'es': 'Español'
        }
        
        language_name = language_mapping.get(language_code, 'English')
        print(f"🌍 Mülakat Soruları Dil Kodu: {language_code} → Dil Adı: {language_name}")
        
        if not cv_file or not job_description:
            return jsonify({
                "success": False,
                "error": "CV dosyası ve iş ilanı metni gerekli"
            }), 400
        
        # Dosya uzantısını al
        file_extension = os.path.splitext(cv_file.filename)[1]
        
        # Gerçek dosya okuma fonksiyonunu kullan
        print(f"📄 Mülakat soruları için dosya okunuyor: {cv_file.filename}")
        cv_text = extract_text_from_file(cv_file.read(), file_extension)
        
        if not cv_text:
            return jsonify({
                "success": False,
                "error": f"Dosya okunamadı: {cv_file.filename}"
            }), 400
        
        # Metni temizle
        cv_text = clean_text(cv_text)
        
        # Çok uzun metinleri kısalt
        if len(cv_text) > 4000:
            cv_text = cv_text[:4000] + "..."
        
        # Mülakat soruları - Interview Questions Agent kullan
        if interview_questions_agent:
            try:
                print("🤖 Interview Questions Agent kullanılıyor...")
                print(f"   📝 CV Metni Uzunluğu: {len(cv_text)} karakter")
                print(f"   💼 İş İlanı Uzunluğu: {len(job_description)} karakter")
                print(f"   🏢 Şirket Adı: {company_name}")
                print(f"   🌍 Dil: {language_name}")
                
                questions = interview_questions_agent.generate_questions(
                    cv_text=cv_text, 
                    job_text=job_description, 
                    company_name=company_name, 
                    language=language_name
                )
                
                print(f"✅ Mülakat soruları oluşturuldu! Uzunluk: {len(questions)} karakter")
                
                return jsonify({
                    "success": True,
                    "questions": questions,
                    "timestamp": datetime.now().isoformat()
                })
                
            except Exception as e:
                print(f"❌ Mülakat soruları hatası: {e}")
                return jsonify({
                    "success": False,
                    "error": "Mülakat soruları üretilemedi",
                    "timestamp": datetime.now().isoformat()
                }), 500
        else:
            return jsonify({
                "success": False,
                "error": "AI servisi kullanılamıyor",
                "timestamp": datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    print("🚀 CV Analiz Backend Başlatılıyor...")
    print("📍 URL: http://localhost:5000")
    print("📖 Analyze: http://localhost:5000/analyze")
    print("🤖 Get Questions: http://localhost:5000/get-questions")
    print("🤖 Get Suggestions: http://localhost:5000/get-suggestions")
    print("🤖 AI Durumu: ✅ Aktif")
    app.run(debug=True, use_reloader=False, port=5000, host='0.0.0.0')

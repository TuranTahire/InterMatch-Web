from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv
from groq import Groq
from agents.rag_enhanced_agent import RAGEnhancedAgent
from agents.cv_analyzer_agent import CVAnalyzerAgent
from matching_engine import calculate_final_score

# Load environment variables
load_dotenv('config.env')

app = Flask(__name__)
CORS(app)

# AI Agents'ları başlat
try:
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    rag_agent = RAGEnhancedAgent()
    cv_analyzer_agent = CVAnalyzerAgent()
    print("✅ Tüm AI Agents başarıyla yüklendi!")
    print("   - Groq AI Client")
    print("   - RAG Enhanced Agent")
    print("   - CV Analyzer Agent")
except Exception as e:
    print(f"❌ AI yüklenirken hata: {e}")
    groq_client = None
    rag_agent = None
    cv_analyzer_agent = None

@app.route('/')
def home():
    return jsonify({
        "message": "🚀 CV Analiz Backend Çalışıyor!",
        "timestamp": datetime.now().isoformat(),
        "ai_available": groq_client is not None
    })

@app.route('/api/health')
def health():
    return jsonify({
        "status": "healthy",
        "message": "✅ Backend sağlıklı çalışıyor",
        "timestamp": datetime.now().isoformat(),
        "ai_available": groq_client is not None
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    """CV ve iş ilanı analizi endpoint'i"""
    print("\n=== ANALYZE ENDPOINT ÇAĞRILDI ===")
    try:
        # Dosya ve metin al
        cv_file = request.files.get('cv_file')
        job_description = request.form.get('job_description')
        
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
        
        # Basit metin analizi (dosya içeriğini string olarak al)
        cv_text = str(file_content)[:1000]  # İlk 1000 karakter
        
        # Üç aşamalı analiz sistemi başlatılıyor
        print("🤖 ÜÇ AŞAMALI ANALİZ SİSTEMİ BAŞLIYOR...")
        print("=" * 60)
        
        # 1. CV Analyzer Agent - Temel Puan
        print("📊 1. AŞAMA: CV Analyzer Agent (Temel Puan)")
        basic_analysis = ""
        basic_score = 0
        if cv_analyzer_agent:
            try:
                basic_analysis = cv_analyzer_agent.analyze(cv_text, job_description)
                # Temel analizden skor çıkar (varsa)
                if "Uyum Skoru:" in basic_analysis:
                    score_line = [line for line in basic_analysis.split('\n') if "Uyum Skoru:" in line]
                    if score_line:
                        try:
                            score_text = score_line[0].split(':')[1].strip()
                            basic_score = float(score_text.replace('%', '').replace('[', '').replace(']', ''))
                        except:
                            basic_score = 50.0
                else:
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
                
                # RAG analizi yap
                rag_result = rag_agent.analyze_with_rag(cv_text, job_description)
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
        
        return jsonify({
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
        })
        
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

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    """Mülakat soruları üretimi endpoint'i"""
    print("\n=== GENERATE QUESTIONS ENDPOINT ÇAĞRILDI ===")
    try:
        cv_file = request.files.get('cv_file')
        job_description = request.form.get('job_description')
        
        if not cv_file or not job_description:
            return jsonify({
                "success": False,
                "error": "CV dosyası ve iş ilanı metni gerekli"
            }), 400
        
        # Basit metin analizi
        cv_text = str(cv_file.read())[:1000]
        
        # Mülakat soruları üretimi
        if groq_client:
            try:
                prompt = f"""
                CV: {cv_text}
                İş İlanı: {job_description}
                
                Bu CV ve iş ilanına göre 5 adet mülakat sorusu üret. 
                Sorular hem teknik hem de davranışsal olsun.
                Türkçe olarak yanıtla.
                """
                
                response = groq_client.chat.completions.create(
                    model="llama3-8b-8192",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=1000
                )
                
                questions = response.choices[0].message.content
                
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
        
        if not cv_file or not job_description:
            return jsonify({
                "success": False,
                "error": "CV dosyası ve iş ilanı metni gerekli"
            }), 400
        
        # Basit metin analizi
        cv_text = str(cv_file.read())[:1000]
        
        # CV iyileştirme önerileri
        if groq_client:
            try:
                prompt = f"""
                CV: {cv_text}
                İş İlanı: {job_description}
                
                Bu CV'yi iş ilanına göre iyileştirmek için 5 adet öneri ver.
                Öneriler pratik ve uygulanabilir olsun.
                Türkçe olarak yanıtla.
                """
                
                response = groq_client.chat.completions.create(
                    model="llama3-8b-8192",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=1000
                )
                
                suggestions = response.choices[0].message.content
                
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

if __name__ == '__main__':
    print("🚀 CV Analiz Backend Başlatılıyor...")
    print("📍 URL: http://localhost:5000")
    print("📖 Analyze: http://localhost:5000/analyze")
    print("🤖 AI Durumu: ✅ Aktif")
    app.run(debug=True, use_reloader=False)

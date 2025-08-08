#!/usr/bin/env python3
"""
Intermatch Web Backend Runner
CV ve İş İlanı Eşleştirme Sistemi
"""

import os
import sys
from dotenv import load_dotenv

# Çevre değişkenlerini yükle
load_dotenv('config.env')

# Groq API Key kontrolü
if not os.getenv("GROQ_API_KEY"):
    print("❌ HATA: GROQ_API_KEY bulunamadı!")
    print("📝 config.env dosyasında GROQ_API_KEY tanımlayın")
    print("🔑 Groq API Key almak için: https://console.groq.com/")
    sys.exit(1)

print("🚀 Intermatch Web Backend Başlatılıyor...")
print("📍 URL: http://localhost:5000")
print("📖 API: http://localhost:5000/analyze")
print("🤖 AI: ✅ Groq AI Aktif")

# Flask app'i başlat
from app import app

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)

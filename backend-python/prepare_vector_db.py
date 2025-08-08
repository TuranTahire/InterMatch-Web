# prepare_vector_db.py
# Uzmanımızın Eğitim Programı

import os
import glob
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

print("🎓 UZMAN EĞİTİM PROGRAMI BAŞLIYOR...")
print("=" * 50)

# Uzmanımızın "gözlüğü" (embedding modeli)
# Bu model, metinleri anlamlı sayılara çevirir.
# Bu satır ilk çalıştığında internetten model indirebilir, bu normaldir.
print("🔍 Embedding modeli hazırlanıyor...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
print("✅ Embedding modeli hazır.")

# Uzmanımızın "beyni" olacak veritabanının yolu
persist_directory = 'chroma_db'

# 1. Adım: Kütüphanedeki kitapları oku
print("\n📚 Kütüphanedeki belgeler okunuyor...")
documents = []
txt_files = glob.glob('documents/*.txt')

for file_path in txt_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            filename = os.path.basename(file_path)
            doc = Document(page_content=content, metadata={"source": filename})
            documents.append(doc)
            print(f"✅ {filename} okundu")
    except Exception as e:
        print(f"❌ {file_path} okunurken hata: {e}")

print(f"✅ {len(documents)} adet belge bulundu ve okundu.")

# 2. Adım: Okunanları küçük notlara böl
print("\n✂️ Belgeler küçük notlara (chunk) bölünüyor...")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
texts = text_splitter.split_documents(documents)
print(f"✅ Belgeler toplam {len(texts)} adet küçük nota bölündü.")

# 3. Adım: Notları anlayıp beyne kaydet
print("\n🧠 Notlar anlaşılıp beyne (veritabanına) kaydediliyor...")
vectordb = Chroma.from_documents(documents=texts, 
                                 embedding=embeddings,
                                 persist_directory=persist_directory)

print("\n" + "=" * 50)
print("🎉 EĞİTİM TAMAMLANDI!")
print(f"🧠 Uzmanın beyni '{persist_directory}' klasörüne başarıyla kaydedildi.")
print("=" * 50)

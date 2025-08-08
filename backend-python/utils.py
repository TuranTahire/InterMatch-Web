"""
PDF ve DOCX dosya okuma yardımcı fonksiyonları
"""

import PyPDF2
import docx
import io
from typing import Optional

def extract_text_from_pdf(file_content: bytes) -> Optional[str]:
    """
    PDF dosyasından metin çıkarır
    
    Args:
        file_content: PDF dosyasının byte içeriği
        
    Returns:
        Çıkarılan metin veya None
    """
    try:
        # PDF dosyasını oku
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        # Tüm sayfaları oku
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
            
        return text.strip()
        
    except Exception as e:
        print(f"PDF okuma hatası: {e}")
        return None

def extract_text_from_docx(file_content: bytes) -> Optional[str]:
    """
    DOCX dosyasından metin çıkarır
    
    Args:
        file_content: DOCX dosyasının byte içeriği
        
    Returns:
        Çıkarılan metin veya None
    """
    try:
        # DOCX dosyasını oku
        docx_file = io.BytesIO(file_content)
        doc = docx.Document(docx_file)
        
        text = ""
        # Tüm paragrafları oku
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
            
        return text.strip()
        
    except Exception as e:
        print(f"DOCX okuma hatası: {e}")
        return None

def extract_text_from_file(file_content: bytes, file_extension: str) -> Optional[str]:
    """
    Dosya uzantısına göre metin çıkarır
    
    Args:
        file_content: Dosya içeriği
        file_extension: Dosya uzantısı (.pdf, .docx)
        
    Returns:
        Çıkarılan metin veya None
    """
    file_extension = file_extension.lower()
    
    if file_extension == '.pdf':
        return extract_text_from_pdf(file_content)
    elif file_extension == '.docx':
        return extract_text_from_docx(file_content)
    else:
        print(f"Desteklenmeyen dosya formatı: {file_extension}")
        return None

def clean_text(text: str) -> str:
    """
    Metni temizler ve formatlar
    
    Args:
        text: Ham metin
        
    Returns:
        Temizlenmiş metin
    """
    if not text:
        return ""
    
    # Fazla boşlukları temizle
    text = ' '.join(text.split())
    
    # Satır sonlarını düzenle
    text = text.replace('\n', ' ').replace('\r', ' ')
    
    return text.strip()

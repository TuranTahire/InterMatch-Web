const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const pdfParse = require('pdf-parse');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  useTempFiles: false,
  debug: true
}));

// Gemini API Key
const GEMINI_API_KEY = 'AIzaSyD3TUH96n93daZQMAgoAE9IvAIq7EVcr5I';

// Test job description for development
const TEST_JOB_DESCRIPTION = `
Senior Software Engineer - Full Stack Development

We are looking for a talented Senior Software Engineer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.

Requirements:
- 5+ years of experience in software development
- Strong proficiency in JavaScript, React, Node.js
- Experience with Python, Java, or similar languages
- Knowledge of SQL and database design
- Experience with AWS, Docker, Kubernetes
- Understanding of REST APIs and GraphQL
- Experience with Git and version control
- Knowledge of Agile methodologies
- Strong problem-solving skills
- Excellent communication abilities

Responsibilities:
- Develop and maintain web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews
- Mentor junior developers
- Contribute to technical architecture decisions

Nice to have:
- Experience with machine learning
- Knowledge of DevOps practices
- Experience with microservices architecture
- Understanding of data analysis
- Project management skills

We offer competitive salary, flexible working hours, and opportunities for professional growth.
`;

// Improved scraping function
async function scrapeJobFromUrl(url) {
  try {
    console.log('🔍 Scraping URL:', url);
    
    // For testing, return test job description
    if (url.includes('test') || url.includes('example')) {
      console.log('📋 Using test job description');
      return TEST_JOB_DESCRIPTION;
    }
    
    // LinkedIn için özel handling
    if (url.includes('linkedin.com')) {
      return await scrapeLinkedInJob(url);
    }
    
    // Genel scraping
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });

    const html = response.data;
    const $ = cheerio.load(html);
    
    // Genel job posting extraction
    let jobText = '';
    
    const selectors = [
      '.job-description',
      '.description__text',
      '.show-more-less-html__markup',
      '.job-view-layout .description__text',
      '[data-job-description]',
      '.job-description__content',
      '.job-details',
      '.position-description',
      '.job-summary'
    ];
    
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        jobText = element.text().trim();
        break;
      }
    }
    
    // Fallback: body text'ten job-related content çıkar
    if (!jobText) {
      const bodyText = $('body').text();
      jobText = extractJobContent(bodyText);
    }
    
    // Clean up the text
    jobText = cleanJobText(jobText);
    
    console.log('📊 Extracted text length:', jobText.length);
    console.log('📄 Sample text:', jobText.substring(0, 200) + '...');
    
    if (jobText.length < 100) {
      console.log('⚠️ Job description too short, using test data');
      return TEST_JOB_DESCRIPTION;
    }
    
    return jobText;
  } catch (error) {
    console.error('❌ Scraping error:', error.message);
    console.log('🔄 Using test job description as fallback');
    return TEST_JOB_DESCRIPTION;
  }
}

// LinkedIn için özel scraping fonksiyonu
async function scrapeLinkedInJob(url) {
  try {
    console.log('🔗 LinkedIn job scraping...');
    
    // LinkedIn job ID'sini çıkar
    const jobIdMatch = url.match(/currentJobId=(\d+)/);
    if (!jobIdMatch) {
      console.log('⚠️ LinkedIn job ID not found, using test data');
      return TEST_JOB_DESCRIPTION;
    }
    
    const jobId = jobIdMatch[1];
    console.log('📋 LinkedIn Job ID:', jobId);
    
    // LinkedIn API endpoint'i (simulated)
    const apiUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`;
    
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.linkedin.com/'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    
    // LinkedIn job description selectors
    const descriptionSelectors = [
      '.description__text',
      '.show-more-less-html__markup',
      '.job-description__content',
      '.job-description',
      '[data-job-description]'
    ];
    
    let jobText = '';
    
    for (const selector of descriptionSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        jobText = element.text().trim();
        break;
      }
    }
    
    // Fallback: tüm text'i al ve job-related content'i çıkar
    if (!jobText) {
      const fullText = $('body').text();
      jobText = extractJobContent(fullText);
    }
    
    jobText = cleanJobText(jobText);
    
    console.log('📊 LinkedIn extracted length:', jobText.length);
    
    if (jobText.length < 100) {
      console.log('⚠️ LinkedIn content too short, using test data');
      return TEST_JOB_DESCRIPTION;
    }
    
    return jobText;
  } catch (error) {
    console.error('❌ LinkedIn scraping error:', error.message);
    console.log('🔄 Using test job description as fallback');
    return TEST_JOB_DESCRIPTION;
  }
}

// Job content extraction helper
function extractJobContent(text) {
  // Job-related keywords'leri ara
  const jobKeywords = [
    'responsibilities', 'requirements', 'qualifications', 'experience',
    'skills', 'duties', 'job description', 'position', 'role',
    'responsibilities', 'requirements', 'qualifications', 'experience',
    'skills', 'duties', 'job description', 'position', 'role'
  ];
  
  const lines = text.split('\n');
  const jobLines = [];
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (jobKeywords.some(keyword => lowerLine.includes(keyword))) {
      jobLines.push(line);
    }
  }
  
  return jobLines.join('\n');
}

// Text cleaning helper
function cleanJobText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .replace(/[^\w\s\n.,!?()-]/g, '')
    .trim();
}

// AI analysis function
async function analyzeWithGemini(jobText, resumeText) {
  try {
    console.log('🤖 Gemini API analizi başlatılıyor...');
    console.log('📊 İş ilanı uzunluğu:', jobText.length);
    console.log('📊 CV uzunluğu:', resumeText.length);
    
    // Metinleri kısalt (Gemini token limiti için)
    const maxLength = 2000; // Güvenli limit
    const truncatedJobText = jobText.length > maxLength ? jobText.substring(0, maxLength) + '...' : jobText;
    const truncatedResumeText = resumeText.length > maxLength ? resumeText.substring(0, maxLength) + '...' : resumeText;
    
    console.log('📊 Kısaltılmış iş ilanı uzunluğu:', truncatedJobText.length);
    console.log('📊 Kısaltılmış CV uzunluğu:', truncatedResumeText.length);

    const prompt = `Sen bir kariyer danışmanı ve işe alım uzmanısın. Aşağıdaki iş ilanı ve özgeçmiş metnini detaylı analiz et ve JSON formatında yanıt ver:

    İŞ İLANI:
    ${truncatedJobText}
    
    ÖZGEÇMİŞ:
    ${truncatedResumeText}
    
    Analiz kriterleri:
    1. Teknik beceri uyumluluğu (0-25 puan)
    2. Deneyim seviyesi uyumluluğu (0-25 puan) 
    3. Eğitim uyumluluğu (0-20 puan)
    4. Anahtar kelime eşleşmesi (0-20 puan)
    5. Genel uygunluk (0-10 puan)
    
    Lütfen şu bilgileri içeren detaylı bir JSON yanıtı ver:
    {
      "suitabilityPercentage": 0-100 arası toplam uygunluk puanı,
      "detailedScores": {
        "technicalSkills": 0-25 arası teknik beceri puanı,
        "experience": 0-25 arası deneyim puanı,
        "education": 0-20 arası eğitim puanı,
        "keywordMatch": 0-20 arası anahtar kelime puanı,
        "overall": 0-10 arası genel puan
      },
      "matchingKeywords": ["eşleşen anahtar kelimeler"],
      "missingKeywords": ["eksik anahtar kelimeler"],
      "strengths": ["güçlü yanlar"],
      "weaknesses": ["zayıf yanlar"],
      "specificRecommendations": ["spesifik öneriler"],
      "generalTips": "detaylı genel öneriler metni",
      "priorityActions": ["öncelikli yapılması gerekenler"]
    }
    
    Yanıtı sadece JSON formatında ver, başka açıklama ekleme.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 saniye timeout
      }
    );

    console.log('✅ Gemini API yanıtı alındı');
    
    if (!response.data.candidates || !response.data.candidates[0] || !response.data.candidates[0].content) {
      throw new Error('Gemini API geçersiz yanıt döndürdü');
    }

    const result = response.data.candidates[0].content.parts[0].text;
    console.log('📄 Ham API yanıtı:', result.substring(0, 200) + '...');
    
    // Clean JSON response - daha güçlü temizleme
    let jsonText = result
      .replace(/```json\s*/, '')
      .replace(/\s*```/, '')
      .replace(/```\s*/, '')
      .trim();
    
    // JSON'u düzeltmeye çalış
    try {
      // Eğer JSON eksikse, tamamla
      if (!jsonText.endsWith('}')) {
        const lastBrace = jsonText.lastIndexOf('}');
        if (lastBrace > 0) {
          jsonText = jsonText.substring(0, lastBrace + 1);
        }
      }
      
      // JSON string'lerini düzelt
      jsonText = jsonText.replace(/"([^"]*?)"/g, (match, content) => {
        // Eğer string içinde kırık karakterler varsa düzelt
        if (content.includes('(') && !content.includes(')')) {
          return `"${content.replace(/\([^)]*$/, '')}"`;
        }
        return match;
      });
      
      const parsedResult = JSON.parse(jsonText);
      console.log('✅ JSON parse başarılı');
      
      // Veri doğrulama ve fallback değerler
      const validatedResult = {
        suitabilityPercentage: parsedResult.suitabilityPercentage || 0,
        detailedScores: {
          technicalSkills: parsedResult.detailedScores?.technicalSkills || 0,
          experience: parsedResult.detailedScores?.experience || 0,
          education: parsedResult.detailedScores?.education || 0,
          keywordMatch: parsedResult.detailedScores?.keywordMatch || 0,
          overall: parsedResult.detailedScores?.overall || 0
        },
        matchingKeywords: Array.isArray(parsedResult.matchingKeywords) ? parsedResult.matchingKeywords : [],
        missingKeywords: Array.isArray(parsedResult.missingKeywords) ? parsedResult.missingKeywords : [],
        strengths: Array.isArray(parsedResult.strengths) ? parsedResult.strengths : [],
        weaknesses: Array.isArray(parsedResult.weaknesses) ? parsedResult.weaknesses : [],
        specificRecommendations: Array.isArray(parsedResult.specificRecommendations) ? parsedResult.specificRecommendations : [],
        generalTips: parsedResult.generalTips || 'Detaylı analiz için daha fazla bilgi gerekli.',
        priorityActions: Array.isArray(parsedResult.priorityActions) ? parsedResult.priorityActions : []
      };
      
      console.log('✅ Veri doğrulama tamamlandı');
      return validatedResult;
    } catch (parseError) {
      console.error('❌ JSON parse hatası:', parseError);
      console.error('📄 Ham JSON:', jsonText);
      throw new Error('AI yanıtı JSON formatında işlenemedi');
    }
  } catch (error) {
    console.error('❌ Gemini API hatası:', error.message);
    if (error.code === 'ECONNABORTED') {
      throw new Error('AI analizi zaman aşımına uğradı');
    } else if (error.response && error.response.status === 400) {
      throw new Error('AI analizi için geçersiz veri');
    } else if (error.response && error.response.status === 429) {
      throw new Error('AI analizi için çok fazla istek');
    } else {
      throw new Error(`AI analizi hatası: ${error.message}`);
    }
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'InterMatch Backend API', 
    version: '1.0.0',
    endpoints: {
      '/api/scrape-job': 'POST - Scrape job posting from URL',
      '/api/analyze': 'POST - Analyze job and resume with AI'
    }
  });
});

// Scrape job posting from URL
app.post('/api/scrape-job', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: 'URL gerekli' 
      });
    }

    const jobText = await scrapeJobFromUrl(url);
    
    res.json({
      success: true,
      jobText: jobText,
      message: 'İş ilanı başarıyla çekildi'
    });
  } catch (error) {
    console.error('Scrape endpoint error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Analyze job and resume with AI
app.post('/api/analyze', async (req, res) => {
  try {
    const { jobText, resumeText } = req.body;
    
    if (!jobText || !resumeText) {
      return res.status(400).json({
        success: false,
        message: 'İş ilanı ve özgeçmiş metni gerekli'
      });
    }

    const analysis = await analyzeWithGemini(jobText, resumeText);
    
    res.json({
      success: true,
      analysis: analysis,
      message: 'Analiz tamamlandı'
    });
  } catch (error) {
    console.error('Analyze endpoint error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Combined endpoint: scrape and analyze
app.post('/api/scrape-and-analyze', async (req, res) => {
  try {
    const { url, resumeText } = req.body;
    
    if (!url || !resumeText) {
      return res.status(400).json({
        success: false,
        message: 'URL ve özgeçmiş metni gerekli'
      });
    }

    // Step 1: Scrape job posting
    const jobText = await scrapeJobFromUrl(url);
    
    // Step 2: Analyze with AI
    const analysis = await analyzeWithGemini(jobText, resumeText);
    
    res.json({
      success: true,
      jobText: jobText,
      analysis: analysis,
      message: 'İş ilanı çekildi ve analiz tamamlandı'
    });
  } catch (error) {
    console.error('Combined endpoint error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Simple PDF Upload Endpoint (like the example)
app.post('/api/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ error: 'Dosya yüklenmedi!' });
    }

    const pdfFile = req.files.pdf;
    
    // PDF tipini kontrol et
    if (pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Sadece PDF dosyaları kabul edilir!' });
    }
    
    // PDF'den metin çıkarma
    const data = await pdfParse(pdfFile.data);
    const text = data.text;

    if (!text.trim()) {
      return res.status(400).json({ error: 'PDF boş veya metin çıkarılamadı!' });
    }

    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: `Hata: ${err.message}` });
  }
});

// Enhanced PDF processing endpoint
app.post('/api/process-pdf-enhanced', async (req, res) => {
  try {
    if (!req.files || !req.files.pdfFile) {
      return res.status(400).json({
        success: false,
        message: 'PDF dosyası yüklenmedi'
      });
    }

    const pdfFile = req.files.pdfFile;
    console.log('📄 Enhanced PDF işleme başlatılıyor:', pdfFile.name);
    console.log('📄 Dosya boyutu:', pdfFile.size, 'bytes');

    // PDF tipini kontrol et
    if (pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Sadece PDF dosyaları kabul edilir'
      });
    }

    // Dosya boyutu kontrolü (20MB)
    if (pdfFile.size > 20 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'PDF dosyası çok büyük (20MB üzerinde)'
      });
    }

    // Gelişmiş PDF'den metin çıkarma
    const data = await pdfParse(pdfFile.data, {
      // PDF.js benzeri ayarlar
      normalizeWhitespace: true,
      disableCombineTextItems: false,
      max: 0 // Tüm sayfaları işle
    });
    
    let text = data.text || '';

    if (!text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'PDF boş veya metin çıkarılamadı'
      });
    }

    // Gelişmiş metin temizleme
    const cleanedText = text
      .replace(/\f/g, '\n') // Form feed'leri satır sonuna çevir
      .replace(/\r\n/g, '\n') // Windows satır sonlarını normalize et
      .replace(/\r/g, '\n') // Mac satır sonlarını normalize et
      .replace(/\s+/g, ' ') // Fazla boşlukları temizle
      .replace(/\n\s*\n/g, '\n') // Fazla satır sonlarını temizle
      .replace(/\n{3,}/g, '\n\n') // 3+ satır sonunu 2'ye çevir
      .replace(/[^\w\s\n\-\.\,\;\:\!\?\(\)\[\]\{\}\"\'\`\@\#\$\%\&\*\+\=\|\~]/g, '') // Özel karakterleri temizle
      .trim();

    // Metin kalitesi kontrolü
    const wordCount = cleanedText.split(/\s+/).length;
    const avgWordLength = cleanedText.replace(/\s+/g, '').length / Math.max(wordCount, 1);
    
    console.log('📄 Kelime sayısı:', wordCount);
    console.log('📄 Ortalama kelime uzunluğu:', avgWordLength.toFixed(2));
    console.log('📄 Çıkarılan metin uzunluğu:', cleanedText.length);

    // Metin kalitesi kontrolü
    if (wordCount < 10) {
      return res.status(400).json({
        success: false,
        message: 'PDF çok az metin içeriyor - görsel içerikli olabilir'
      });
    }

    if (avgWordLength < 2) {
      return res.status(400).json({
        success: false,
        message: 'PDF metni çok kısa kelimeler içeriyor - kalitesiz çıkarım'
      });
    }

    console.log('✅ Enhanced PDF işleme tamamlandı');
    console.log('📄 Metin örneği:', cleanedText.substring(0, 300));

    res.json({
      success: true,
      text: cleanedText,
      textLength: cleanedText.length,
      wordCount: wordCount,
      avgWordLength: avgWordLength.toFixed(2),
      message: 'PDF başarıyla işlendi'
    });

  } catch (error) {
    console.error('❌ Enhanced PDF işleme hatası:', error);
    res.status(500).json({
      success: false,
      message: `PDF işleme hatası: ${error.message}`
    });
  }
});

// Match CV with job posting (like your example)
app.post('/api/match', async (req, res) => {
  try {
    const { cvText, jobText } = req.body;
    
    if (!cvText || !jobText) {
      return res.status(400).json({
        success: false,
        message: 'CV ve iş ilanı metni gerekli'
      });
    }

    // AI analizi yap
    const analysis = await analyzeWithGemini(jobText, cvText);
    
    // Uygunluk puanını çıkar
    const score = analysis.suitabilityPercentage || 75;

    res.json({
      success: true,
      score: score,
      analysis: analysis,
      message: 'Eşleştirme tamamlandı'
    });

  } catch (error) {
    console.error('Match endpoint error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 InterMatch Backend API çalışıyor: http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   GET  / - API bilgileri`);
  console.log(`   POST /api/upload - Basit PDF yükleme`);
  console.log(`   POST /api/process-pdf - Gelişmiş PDF işleme`);
  console.log(`   POST /api/scrape-job - URL'den iş ilanı çek`);
  console.log(`   POST /api/analyze - AI analizi yap`);
  console.log(`   POST /api/match - CV-Job eşleştirme`);
  console.log(`   POST /api/scrape-and-analyze - Çek ve analiz et`);
}); 
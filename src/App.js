import React, { useState } from 'react';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Akıllı analiz fonksiyonu - API key gerektirmez
  const smartAnalysis = (jobText, resumeText) => {
    // Anahtar kelimeler ve beceriler - daha kapsamlı liste
    const commonSkills = [
      'javascript', 'react', 'node.js', 'nodejs', 'python', 'java', 'c++', 'c#', 'php', 'html', 'css',
      'sql', 'mongodb', 'mysql', 'postgresql', 'aws', 'azure', 'docker', 'kubernetes',
      'git', 'agile', 'scrum', 'kanban', 'api', 'rest', 'graphql', 'typescript',
      'vue.js', 'vuejs', 'angular', 'express', 'django', 'flask', 'spring', 'laravel',
      'machine learning', 'ai', 'data science', 'analytics', 'tableau', 'power bi',
      'project management', 'leadership', 'team work', 'communication', 'problem solving',
      'frontend', 'backend', 'fullstack', 'full stack', 'web development', 'mobile development',
      'ios', 'android', 'swift', 'kotlin', 'flutter', 'react native', 'xamarin',
      'database', 'nosql', 'redis', 'elasticsearch', 'kafka', 'rabbitmq',
      'microservices', 'serverless', 'cloud', 'devops', 'ci/cd', 'jenkins', 'gitlab',
      'testing', 'unit test', 'integration test', 'jest', 'cypress', 'selenium',
      'ui/ux', 'design', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
      'excel', 'powerpoint', 'word', 'office', 'google', 'microsoft', 'oracle',
      'salesforce', 'sap', 'erp', 'crm', 'ecommerce', 'shopify', 'woocommerce',
      'openai', 'gpt', 'chatgpt', 'gemini', 'claude', 'anthropic'
    ];

    // Anlamsız kelimeleri filtrele
    const stopWords = [
      've', 'veya', 'ile', 'için', 'bu', 'bir', 'da', 'de', 'mi', 'mu', 'mü',
      'ic', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'the', 'a', 'an',
      'olmak', 'oldu', 'olacak', 'var', 'yok', 'gibi', 'kadar', 'sonra', 'önce',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might'
    ];

    // Metinleri temizle ve kelimelere ayır
    const cleanText = (text) => {
      return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Noktalama işaretlerini kaldır
        .replace(/\s+/g, ' ') // Fazla boşlukları tek boşluğa çevir
        .trim()
        .split(' ')
        .filter(word => word.length > 2 && !stopWords.includes(word)); // Kısa ve anlamsız kelimeleri filtrele
    };

    const jobWords = cleanText(jobText);
    const resumeWords = cleanText(resumeText);

    // İş ilanından anahtar kelimeleri çıkar
    const jobKeywords = jobWords.filter(word => 
      commonSkills.some(skill => 
        skill.includes(word) || word.includes(skill) || 
        skill.split(' ').some(part => part.includes(word) || word.includes(part))
      )
    );

    // Özgeçmişten anahtar kelimeleri çıkar
    const resumeKeywords = resumeWords.filter(word => 
      commonSkills.some(skill => 
        skill.includes(word) || word.includes(skill) || 
        skill.split(' ').some(part => part.includes(word) || word.includes(part))
      )
    );

    // Eşleşen kelimeleri bul
    const matchingKeywords = jobKeywords.filter(keyword => 
      resumeKeywords.includes(keyword)
    );

    // Eksik kelimeleri bul
    const missingKeywords = jobKeywords.filter(keyword => 
      !resumeKeywords.includes(keyword)
    );

    // Tekrarlanan kelimeleri kaldır
    const uniqueMissingKeywords = [...new Set(missingKeywords)];
    const uniqueMatchingKeywords = [...new Set(matchingKeywords)];

    // Debug bilgisi
    console.log('Job Keywords:', jobKeywords);
    console.log('Resume Keywords:', resumeKeywords);
    console.log('Matching Keywords:', uniqueMatchingKeywords);
    console.log('Missing Keywords:', uniqueMissingKeywords);

    // Uygunluk yüzdesini hesapla - çok daha esnek
    const totalJobKeywords = jobKeywords.length;
    const matchCount = uniqueMatchingKeywords.length;
    
    let suitabilityPercentage;
    if (totalJobKeywords === 0) {
      suitabilityPercentage = 75; // Varsayılan değer
    } else {
      // Çok daha esnek hesaplama
      const baseScore = (matchCount / totalJobKeywords) * 100;
      const lengthBonus = Math.min(20, (resumeText.length / 100)); // Uzunluk bonusu artırıldı
      const experienceBonus = resumeText.toLowerCase().includes('deneyim') || resumeText.toLowerCase().includes('experience') ? 15 : 0;
      const projectBonus = resumeText.toLowerCase().includes('proje') || resumeText.toLowerCase().includes('project') ? 15 : 0;
      const teamBonus = resumeText.toLowerCase().includes('takım') || resumeText.toLowerCase().includes('team') ? 10 : 0;
      const skillBonus = resumeKeywords.length > 0 ? 10 : 0; // Herhangi bir beceri varsa bonus
      
      // Minimum %60 garantisi
      const calculatedScore = baseScore + lengthBonus + experienceBonus + projectBonus + teamBonus + skillBonus;
      suitabilityPercentage = Math.max(60, Math.min(95, Math.round(calculatedScore)));
    }

    // Vurgulanması gereken alanlar - çok daha esnek
    const areasToEmphasize = [];
    if (matchCount < totalJobKeywords * 0.3) { // Eşik değeri çok düşürüldü
      areasToEmphasize.push('Teknik beceriler');
    }
    if (resumeText.length < 150) { // Eşik değeri çok düşürüldü
      areasToEmphasize.push('Deneyim detayları');
    }
    if (!resumeText.toLowerCase().includes('proje') && !resumeText.toLowerCase().includes('project')) {
      areasToEmphasize.push('Proje deneyimleri');
    }
    if (!resumeText.toLowerCase().includes('takım') && !resumeText.toLowerCase().includes('team')) {
      areasToEmphasize.push('Takım çalışması');
    }
    if (!resumeText.toLowerCase().includes('deneyim') && !resumeText.toLowerCase().includes('experience')) {
      areasToEmphasize.push('İş deneyimi');
    }

    // Genel ipuçları - çok daha pozitif
    let generalTips = '';
    if (suitabilityPercentage < 50) {
      generalTips = 'Özgeçmişinizde iş ilanındaki anahtar kelimeleri daha fazla vurgulayın. Eksik becerileri öğrenmeye odaklanın.';
    } else if (suitabilityPercentage < 70) {
      generalTips = 'İyi bir başlangıç! Eksik becerileri tamamlayarak uygunluğunuzu artırabilirsiniz.';
    } else if (suitabilityPercentage < 85) {
      generalTips = 'Çok iyi uyum! Özgeçmişinizi daha da güçlendirmek için proje deneyimlerinizi detaylandırın.';
    } else {
      generalTips = 'Mükemmel uyum! Bu pozisyon için çok uygun görünüyorsunuz.';
    }

    return {
      suitabilityPercentage: suitabilityPercentage,
      missingKeywords: uniqueMissingKeywords.length > 0 ? uniqueMissingKeywords.slice(0, 5) : ['Belirgin eksiklik yok'],
      areasToEmphasize: areasToEmphasize.length > 0 ? areasToEmphasize : ['Mevcut becerilerinizi daha detaylı açıklayın'],
      generalTips: generalTips
    };
  };

  const analyzeJobAndResume = async () => {
    if (!jobDescription.trim() || !resumeText.trim()) {
      setError('Lütfen hem iş ilanı metnini hem de özgeçmiş metnini girin.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      // Gemini API key
      const apiKey = 'AIzaSyD3TUH96n93daZQMAgoAE9IvAIq7EVcr5I';
      
      if (apiKey) {
        // Gerçek Gemini API kullan
        console.log('Gemini API kullanılıyor...');
        
        const prompt = `Aşağıdaki iş ilanı ve özgeçmiş metnini analiz et ve JSON formatında yanıt ver:
        
        İŞ İLANI:
        ${jobDescription}
        
        ÖZGEÇMİŞ:
        ${resumeText}
        
        Lütfen şu bilgileri içeren bir JSON yanıtı ver:
        {
          "suitabilityPercentage": 0-100 arası uygunluk puanı,
          "missingKeywords": ["eksik anahtar kelimeler listesi"],
          "areasToEmphasize": ["vurgulanması gereken alanlar"],
          "generalTips": "genel öneriler metni"
        }
        
        Yanıtı sadece JSON formatında ver, başka açıklama ekleme.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API hatası: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const responseText = data.candidates[0].content.parts[0].text;
          
          // JSON'u temizle - markdown formatını kaldır
          let cleanJson = responseText.trim();
          
          // ```json ve ``` işaretlerini kaldır
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace('```json', '').replace('```', '').trim();
          } else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/```/g, '').trim();
          }
          
          // Sadece JSON kısmını al
          const jsonStart = cleanJson.indexOf('{');
          const jsonEnd = cleanJson.lastIndexOf('}') + 1;
          
          if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanJson = cleanJson.substring(jsonStart, jsonEnd);
          }
          
          console.log('Temizlenmiş JSON:', cleanJson);
          
          try {
            const result = JSON.parse(cleanJson);
            setAnalysisResult(result);
            console.log('Gemini API başarılı!');
          } catch (parseError) {
            console.error('JSON parse hatası:', parseError);
            console.log('Ham yanıt:', responseText);
            throw new Error('JSON parse hatası: ' + parseError.message);
          }
        } else {
          throw new Error('Gemini API geçersiz yanıt');
        }
        
      } else {
        // Akıllı simülasyon kullan
        console.log('Akıllı simülasyon kullanılıyor...');
        
        // Gerçekçi bir yükleme süresi
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Akıllı analiz yap
        const result = smartAnalysis(jobDescription, resumeText);
        setAnalysisResult(result);
        
        console.log('Akıllı simülasyon tamamlandı!');
      }
      
    } catch (err) {
      console.error("Analiz hatası:", err);
      
      // Hata durumunda akıllı simülasyona geç
      console.log('Hata nedeniyle akıllı simülasyona geçiliyor...');
      
      const result = smartAnalysis(jobDescription, resumeText);
      setAnalysisResult(result);
      
      setError(`API hatası nedeniyle akıllı analiz kullanıldı: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl">💼</span>
            <h1 className="text-3xl font-bold">Intermatch</h1>
          </div>
          <p className="text-center mt-2 text-blue-200">
            AI Destekli İş ve Staj Eşleştirme Platformu
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            İş İlanı & Özgeçmiş Uygunluk Analizi
          </h2>

          {/* Job Description Input */}
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-medium mb-2">
              İş İlanı Metnini Buraya Yapıştırın:
            </label>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
              placeholder="Örnek: 'Yazılım Geliştirici arıyoruz. React, Node.js ve veritabanı bilgisi gereklidir...'"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {/* Resume Input */}
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-medium mb-2">
              Özgeçmiş / Ön Yazı Metninizi Buraya Yapıştırın:
            </label>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
              placeholder="Örnek: 'Adım [Adınız Soyadınız]. [Tecrübeniz] yıllık tecrübemle React ve Node.js konularında yetkinim...'"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              <strong>Hata!</strong> {error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={analyzeJobAndResume}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Analiz Ediliyor...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Uygunluğu Yapay Zeka ile Analiz Et</span>
              </>
            )}
          </button>

          {/* Results */}
          {analysisResult && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Analiz Sonuçları:</h3>
              
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">Uygunluk Puanı:</h4>
                <div className="text-3xl font-bold text-blue-600">
                  {analysisResult.suitabilityPercentage}%
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">Eksik/Az Vurgulanmış Anahtar Kelimeler:</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {analysisResult.missingKeywords.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">Vurgulanması Gereken Alanlar:</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {analysisResult.areasToEmphasize.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">Genel İpuçları:</h4>
                <p className="text-gray-700">{analysisResult.generalTips}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Intermatch. Tüm Hakları Saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import axios from 'axios';
import { 
  MagnifyingGlassIcon, 
  QuestionMarkCircleIcon, 
  LightBulbIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  DocumentMagnifyingGlassIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import FancyButton from './components/FancyButton';
import './App.css';

// API URL'yi açık şekilde belirt
const API_URL = "http://localhost:5000";

function App() {
  const [cvFile, setCvFile] = useState(null);
  const [jobText, setJobText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [interviewQuestions, setInterviewQuestions] = useState('');
  const [cvImprovements, setCvImprovements] = useState('');
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingImprovements, setIsGeneratingImprovements] = useState(false);
  const [language, setLanguage] = useState('tr'); // 'tr' veya 'en'
  const [isDragOver, setIsDragOver] = useState(false);

  // Dil değiştirme fonksiyonu
  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  // Dosya sürükleme event'leri
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setCvFile(file);
      }
    }
  };

  // Çeviri objesi
  const translations = {
    tr: {
      title: 'CareerMatch AI',
      subtitle: 'AI Destekli Kariyer Eşleştirme',
      cvUpload: 'CV Dosyası Yükle',
      jobDetails: 'İş İlanı Detayları',
      analysisOptions: 'Analiz Seçenekleri',
      fileSelect: 'Dosya Seç',
      dragDrop: 'veya dosyayı buraya sürükleyip bırakın',
      fileTypes: 'PDF veya DOCX dosyaları',
      jobPlaceholder: 'İş ilanının detaylarını buraya yapıştırın...',
      characters: 'karakter',
      analyzeCV: 'CV Analiz Et',
      analyzeSubLabel: 'Uyumluluk Skoru',
      analyzing: 'Analiz Ediliyor...',
      interviewQuestions: 'Mülakat Soruları',
      questionsSubLabel: 'Teknik & Davranışsal',
      generatingQuestions: 'Sorular Oluşturuluyor...',
      cvImprovements: 'CV İyileştirme',
      improvementsSubLabel: 'Öneriler & İpuçları',
      generatingImprovements: 'Öneriler Oluşturuluyor...',
      analysisTitle: '🔍 CV - İş İlanı Uyumluluk Analizi',
      questionsTitle: '🎯 Mülakat Soruları & Hazırlık Rehberi',
      improvementsTitle: '💡 CV İyileştirme Önerileri & İpuçları',
      tr: 'TR Türkçe',
      en: 'us English',
      analysisDescription: 'AI analiz seçenekleri',
      analyzeButton: 'Analiz Et',
      questionsButton: 'Mülakat Soruları',
      improvementsButton: 'CV İyileştirme',
      jobDescription: 'İş İlanı Detayları'
    },
    en: {
      title: 'CareerMatch AI',
      subtitle: 'AI-Powered Career Matching',
      cvUpload: 'Upload CV File',
      jobDetails: 'Job Description Details',
      analysisOptions: 'Analysis Options',
      fileSelect: 'Select File',
      dragDrop: 'or drag and drop file here',
      fileTypes: 'PDF or DOCX files',
      jobPlaceholder: 'Paste job description details here...',
      characters: 'characters',
      analyzeCV: 'Analyze CV',
      analyzeSubLabel: 'Compatibility Score',
      analyzing: 'Analyzing...',
      interviewQuestions: 'Interview Questions',
      questionsSubLabel: 'Technical & Behavioral',
      generatingQuestions: 'Generating Questions...',
      cvImprovements: 'CV Improvements',
      improvementsSubLabel: 'Suggestions & Tips',
      generatingImprovements: 'Generating Suggestions...',
      analysisTitle: '🔍 CV - Job Description Compatibility Analysis',
      questionsTitle: '🎯 Interview Questions & Preparation Guide',
      improvementsTitle: '💡 CV Improvement Suggestions & Tips',
      tr: 'TR Turkish',
      en: 'us English',
      analysisDescription: 'AI analysis options',
      analyzeButton: 'Analyze',
      questionsButton: 'Generate Interview Questions',
      improvementsButton: 'CV Improvements',
      jobDescription: 'Job Description Details'
    }
  };

  const t = translations[language];

  // Metni güzel formatta parse eden fonksiyon
  const parseAnalysisText = (text) => {
    if (!text) return '';
    
    // HTML etiketlerini temizle
    let cleanText = text
      .replace(/<[^>]*>/g, '') // HTML etiketlerini kaldır
      .replace(/&nbsp;/g, ' ') // HTML boşlukları
      .replace(/&amp;/g, '&') // HTML karakterleri
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
    
    // Gereksiz bölümleri kaldır
    const sectionsToRemove = [
      'Eksik veya Geliştirilmesi Gereken Yönler:',
      'Uzman Tavsiyeleri:',
      'CV İyileştirme Önerileri:'
    ];
    
    sectionsToRemove.forEach(section => {
      const sectionIndex = cleanText.indexOf(section);
      if (sectionIndex !== -1) {
        cleanText = cleanText.substring(0, sectionIndex).trim();
      }
    });
    
    // Başlıkları ve içeriği ayır
    const sections = {};
    
    // Uyum Skoru
    const scoreMatch = cleanText.match(/\*\*Uyum Skoru:\*\*\s*(\d+%)/);
    if (scoreMatch) {
      sections.score = scoreMatch[1];
    }
    
    // Özet Değerlendirme
    const summaryMatch = cleanText.match(/\*\*Özet Değerlendirme:\*\*\s*(.*?)(?=\*\*|$)/s);
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim();
    }
    
    // Eşleşen Yetenekler
    const skillsMatch = cleanText.match(/\*\*Eşleşen Anahtar Kelimeler ve Yetenekler:\*\*\s*(.*?)(?=\*\*|$)/s);
    if (skillsMatch) {
      // Madde işaretlerini temizle ve listeye çevir
      const skillsText = skillsMatch[1].trim();
      const skillsList = skillsText
        .split(/\*\s*/) // * ile başlayan satırları böl
        .filter(skill => skill.trim()) // Boş satırları kaldır
        .map(skill => skill.trim().replace(/^\*\s*/, '')); // * işaretini kaldır
      sections.skills = skillsList;
    }
    
    return sections;
  };

  // Skor bilgisini ayrı gösteren fonksiyon
  const renderScoreInfo = (scoreData) => {
    if (!scoreData || typeof scoreData === 'string') return null;
    
    return (
      <div className="card bg-primary/10 border border-primary/20 mb-6">
        <div className="card-body">
          <h4 className="card-title text-lg font-semibold mb-4">📊 Skor Analizi</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {scoreData.final_score || 0}%
              </div>
              <div className="text-sm text-base-content/70">Genel Uyum</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-success">
                {scoreData.text_similarity || 0}%
              </div>
              <div className="text-sm text-base-content/70">Metin Benzerliği</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-secondary">
                {scoreData.skill_match || 0}%
              </div>
              <div className="text-sm text-base-content/70">Beceri Uyumu</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-accent">
                {scoreData.rag_bonus || 0}%
              </div>
              <div className="text-sm text-base-content/70">AI Bonus</div>
            </div>
          </div>
          
          {/* Beceri listeleri */}
          {(scoreData.cv_skills || scoreData.job_skills) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {scoreData.cv_skills && scoreData.cv_skills.length > 0 && (
                <div>
                  <h5 className="font-medium text-base-content mb-3">✅ CV Becerileri</h5>
                  <div className="flex flex-wrap gap-2">
                    {scoreData.cv_skills.map((skill, index) => (
                      <span key={index} className="badge badge-success badge-outline">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {scoreData.job_skills && scoreData.job_skills.length > 0 && (
                <div>
                  <h5 className="font-medium text-base-content mb-3">🎯 İş İlanı Becerileri</h5>
                  <div className="flex flex-wrap gap-2">
                    {scoreData.job_skills.map((skill, index) => (
                      <span key={index} className="badge badge-primary badge-outline">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleFileChange = (event) => {
    setCvFile(event.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!cvFile || !jobText) {
      setError('Lütfen hem CV dosyasını seçin hem de iş ilanı metnini girin.');
      return;
    }

    // Sadece bu butonun loading state'ini true yap
    setIsAnalyzing(true);
    setIsGeneratingQuestions(false);
    setIsGeneratingImprovements(false);
    setError(null);

    const formData = new FormData();
    formData.append('cv_file', cvFile);
    formData.append('job_description', jobText);

    try {
      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysisResult({
        analysis: response.data.analysis,
        score: response.data.score
      });

    } catch (err) {
      setError('Analiz sırasında bir hata oluştu. Lütfen backend sunucusunun çalıştığından emin olun.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInterviewQuestions = async () => {
    if (!cvFile || !jobText) {
      setError('Lütfen hem CV dosyasını seçin hem de iş ilanı metnini girin.');
      return;
    }

    // Sadece bu butonun loading state'ini true yap
    setIsGeneratingQuestions(true);
    setIsAnalyzing(false);
    setIsGeneratingImprovements(false);
    setError(null);

    const formData = new FormData();
    formData.append('cv_file', cvFile);
    formData.append('job_description', jobText);

    try {
      const response = await axios.post(`${API_URL}/generate-questions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setInterviewQuestions(response.data.interview_questions);

    } catch (err) {
      setError('Mülakat soruları oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleCvImprovements = async () => {
    if (!cvFile || !jobText) {
      setError('Lütfen hem CV dosyasını seçin hem de iş ilanı metnini girin.');
      return;
    }

    // Sadece bu butonun loading state'ini true yap
    setIsGeneratingImprovements(true);
    setIsAnalyzing(false);
    setIsGeneratingQuestions(false);
    setError(null);

    const formData = new FormData();
    formData.append('cv_file', cvFile);
    formData.append('job_description', jobText);

    try {
      const response = await axios.post(`${API_URL}/get-suggestions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCvImprovements(response.data.suggestions);

    } catch (err) {
      setError('CV iyileştirme önerileri oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingImprovements(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa, #e4ecf7)' }}>
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          {/* Logo ve Marka */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
                <svg className="w-7 h-7 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 3v1m6-1v1M9 20v1m6-1v1M5 9H4a2 2 0 00-2 2v4a2 2 0 002 2h1m14 0h1a2 2 0 002-2v-4a2 2 0 00-2-2h-1M7 12h10M7 16h10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-xl animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-poppins">
                CareerMatch AI
              </h1>
              <p className="text-sm text-gray-600 font-medium font-inter">CV İş İlanı Eşleştirme Sistemi</p>
            </div>
          </div>

          {/* Dil Değiştirme */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                language === 'tr' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🇹🇷 TR
            </button>
            <button
              onClick={toggleLanguage}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                language === 'en' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🇺🇸 EN
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column - Input Forms */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* CV Upload */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4">
                    <DocumentArrowUpIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 font-poppins">{t.cvUpload}</h3>
                    <p className="text-gray-600 font-inter">CV dosyanızı yükleyin</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div 
                    className={`flex justify-center px-8 py-12 border-3 border-dashed rounded-3xl transition-all duration-300 group hover:shadow-xl hover:shadow-blue-100/50 ${
                      isDragOver 
                        ? 'border-green-400 bg-green-50/50 shadow-lg shadow-green-100/50' 
                        : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50/30'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-4 text-center">
                      <div className={`mx-auto h-20 w-20 transition-all duration-300 group-hover:scale-110 ${
                        isDragOver 
                          ? 'text-green-500 scale-110' 
                          : 'text-blue-400 group-hover:text-blue-600'
                      }`}>
                        <DocumentArrowUpIcon className="h-full w-full" />
                      </div>
                      <div className="space-y-3">
                        <label className="relative cursor-pointer">
                          <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25">
                            <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                            {t.fileSelect}
                          </span>
                          <input 
                            type="file" 
                            className="sr-only" 
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className={`font-medium transition-colors duration-300 ${
                          isDragOver 
                            ? 'text-green-700' 
                            : 'text-gray-600 group-hover:text-gray-700'
                        }`}>
                          {isDragOver ? 'Dosyayı buraya bırakın!' : t.dragDrop}
                        </p>
                        <p className={`text-sm transition-colors duration-300 ${
                          isDragOver 
                            ? 'text-green-600' 
                            : 'text-gray-500 group-hover:text-gray-600'
                        }`}>
                          {t.fileTypes}
                        </p>
                      </div>
                    </div>
                  </div>
                  {cvFile && (
                    <div className="mt-4 flex items-center p-4 bg-green-50 border border-green-200 rounded-2xl animate-pulse">
                      <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                      <span className="font-semibold text-green-800">{cvFile.name}</span>
                    </div>
                  )}
                </div>
              </div>
    
              {/* Job Description */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                    <BriefcaseIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 font-poppins">{t.jobDescription}</h3>
                    <p className="text-gray-600 font-inter">İş ilanı detaylarını girin</p>
                  </div>
                </div>
                  
                  <div className="relative">
                    <textarea
                      rows="10"
                      className="w-full p-6 text-lg border-2 border-gray-200 rounded-2xl resize-none transition-all duration-300 hover:border-green-400 focus:border-green-500 focus:shadow-lg focus:outline-none bg-white/50 backdrop-blur-sm"
                      placeholder={t.jobPlaceholder}
                      value={jobText}
                      onChange={(e) => {
                        setJobText(e.target.value);
                      }}
                    />
                    <div className="absolute bottom-4 right-4 text-sm text-gray-500 bg-white/80 px-3 py-1 rounded-xl backdrop-blur-sm">
                      {jobText.length} {t.characters}
                    </div>
                  </div>
                </div>
            </div>
    
            {/* Right Column - Action Buttons */}
            <div className="space-y-6">
              {/* Analiz Seçenekleri */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 font-poppins">{t.analysisOptions}</h3>
                    <p className="text-gray-600 font-inter">{t.analysisDescription}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                    <FancyButton
                      label={t.analyzeButton}
                      subLabel="CV - İş İlanı Uyumluluk Analizi"
                      icon={DocumentMagnifyingGlassIcon}
                      onClick={() => {
                        console.log('Analyze button clicked!');
                        console.log('cvFile:', cvFile);
                        console.log('jobText:', jobText);
                        console.log('jobText.trim():', jobText.trim());
                        handleAnalyze();
                      }}
                      loading={isAnalyzing}
                      disabled={false}
                      loadingText="Analiz ediliyor..."
                    />
                    
                    <FancyButton
                      label={t.questionsButton}
                      subLabel="Mülakat Soruları Oluştur"
                      icon={QuestionMarkCircleIcon}
                      onClick={() => {
                        console.log('Questions button clicked!');
                        handleInterviewQuestions();
                      }}
                      loading={isGeneratingQuestions}
                      disabled={false}
                      loadingText="Sorular oluşturuluyor..."
                    />
                    
                    <FancyButton
                      label={t.improvementsButton}
                      subLabel="CV İyileştirme Önerileri"
                      icon={LightBulbIcon}
                      onClick={() => {
                        console.log('Improvements button clicked!');
                        handleCvImprovements();
                      }}
                      loading={isGeneratingImprovements}
                      disabled={false}
                      loadingText="Öneriler oluşturuluyor..."
                    />
                  </div>
      
                {/* Error Message */}
                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
                      <span className="text-red-800 font-medium">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {(analysisResult || interviewQuestions || cvImprovements) && (
          <div className="space-y-6 mt-12">
            {/* Analiz Sonucu */}
            {analysisResult && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 font-poppins mb-6">{t.analysisTitle}</h3>
                
                {/* Uyumluluk Skoru */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                      <ChartBarIcon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 font-poppins">Uyumluluk Skoru</h4>
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="2"
                          strokeDasharray={`${parseInt(analysisResult.score?.final_score || 0)}, 100`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800 font-poppins">{analysisResult.score?.final_score || 0}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 font-inter">Genel Uyum</p>
                  </div>
                </div>

                {/* Özet Değerlendirme */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                      <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 font-poppins">Özet Değerlendirme</h4>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <p className="text-sm text-gray-700 font-inter leading-relaxed">
                      {analysisResult.analysis ? parseAnalysisText(analysisResult.analysis).summary || 'Özet bulunamadı.' : 'Analiz sonucu bulunamadı.'}
                    </p>
                  </div>
                </div>

                {/* Eşleşen Yetenekler */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                      <CheckBadgeIcon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 font-poppins">Eşleşen Yetenekler</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.analysis ? (
                      (() => {
                        const parsed = parseAnalysisText(analysisResult.analysis);
                        return parsed.skills && parsed.skills.length > 0 ? (
                          parsed.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-white/60 text-gray-700 text-sm font-medium rounded-full border border-green-200"
                            >
                              <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-600 font-inter">Eşleşen yetenekler bulunamadı.</p>
                        );
                      })()
                    ) : (
                      <p className="text-gray-600 font-inter">Eşleşen yetenekler bulunamadı.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Mülakat Soruları */}
            {interviewQuestions && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4">
                    <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 font-poppins">{t.questionsTitle}</h3>
                    <p className="text-gray-600 font-inter">Mülakat için özel sorular</p>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed text-sm font-inter bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 backdrop-blur-sm"
                    dangerouslySetInnerHTML={{ 
                      __html: interviewQuestions.replace(/\n/g, '<br>') 
                    }}
                  />
                </div>
              </div>
            )}

            {/* CV İyileştirme Önerileri */}
            {cvImprovements && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-4">
                    <LightBulbIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 font-poppins">{t.improvementsTitle}</h3>
                    <p className="text-gray-600 font-inter">CV geliştirme önerileri</p>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed text-sm font-inter bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 backdrop-blur-sm"
                    dangerouslySetInnerHTML={{ 
                      __html: cvImprovements.replace(/\n/g, '<br>') 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
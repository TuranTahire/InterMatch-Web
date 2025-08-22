import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BriefcaseIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import FancyButton from './components/FancyButton';
import './App.css';

const API_URL = 'http://localhost:5000';

function App() {
  const [cvFile, setCvFile] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [jobText, setJobText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingImprovements, setIsGeneratingImprovements] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState('');
  const [cvImprovements, setCvImprovements] = useState('');
  const [error, setError] = useState('');
  const [pageVisible, setPageVisible] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const t = {
    systemTitle: 'AI-Powered Career Matching System',
    cvUpload: 'Upload CV',
    cvUploadDescription: 'Upload your CV in PDF or DOCX format',
    fileSelect: 'Select File',
    dragDrop: 'Drag and drop file here or click',
    fileTypes: 'PDF, DOCX (Max 10MB)',
    companyJobDetails: 'Company and Job Details',
    companyJobDescription: 'Provide information about the position you want to apply for',
    companyName: 'Company Name',
    companyNamePlaceholder: 'Ex: Google, Microsoft, Apple...',
    companyNameTooltip: 'Enter the name of the company you want to apply to',
    jobDescription: 'Job Description',
    jobPlaceholder: 'Paste job description details here...',
    characters: 'characters',
    compatibilityScore: 'Compatibility Score',
    improvementsTitle: 'CV Improvement Suggestions',
    cvImprovementSuggestions: 'Suggestions to improve your CV',
    questionsTitle: 'Interview Questions',
    specialInterviewQuestions: 'Special interview questions for this position'
  };

  const demoSteps = [
    {
      title: "Step 1: Upload Your CV",
      description: "Simply drag and drop your CV file or click to browse. We support PDF and DOCX formats up to 10MB.",
      icon: DocumentArrowUpIcon,
      color: "from-blue-500 to-indigo-500",
      targetId: "cv-upload",
      targetText: "CV Upload Area"
    },
    {
      title: "Step 2: Add Job Details", 
      description: "Enter the company name and paste the job description. Our AI will analyze the match between your CV and the position.",
      icon: BriefcaseIcon,
      color: "from-purple-500 to-pink-500",
      targetId: "company-name",
      targetText: "Company Name Field"
    },
    {
      title: "Step 3: AI Analysis",
      description: "Our advanced AI analyzes your CV against the job requirements and provides detailed insights.",
      icon: SparklesIcon,
      color: "from-green-500 to-emerald-500",
      targetId: "career-assistant-btn",
      targetText: "Start Career Assistant Button"
    },
    {
      title: "Step 4: Get Results",
      description: "Receive your compatibility score, CV improvement suggestions, and personalized interview questions.",
      icon: ChartBarIcon,
      color: "from-orange-500 to-red-500",
      targetId: "analysis-results",
      targetText: "Analysis Results Area"
    }
  ];

  useEffect(() => {
    setPageVisible(true);
    // Auto-show demo modal after 2 seconds
    const timer = setTimeout(() => {
      setShowDemo(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const nextDemoStep = () => {
    if (demoStep < demoSteps.length - 1) {
      setDemoStep(demoStep + 1);
    } else {
      setShowDemo(false);
      setDemoStep(0);
    }
  };

  const prevDemoStep = () => {
    if (demoStep > 0) {
      setDemoStep(demoStep - 1);
    }
  };

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
      handleFileChange({ target: { files } });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size cannot exceed 10MB.');
        return;
      }
        setCvFile(file);
        setError('');
    }
  };

  const handleCareerAssistant = async () => {
    if (!cvFile || !jobText.trim()) {
      setError('CV file and job description are required.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
    const formData = new FormData();
    formData.append('cv_file', cvFile);
      formData.append('company_name', companyName);
    formData.append('job_description', jobText);

      console.log('🚀 Starting career assistant...');
      console.log('📄 CV File:', cvFile.name);
      console.log('🏢 Company:', companyName);
      console.log('📝 Job Text Length:', jobText.length);

      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      console.log('✅ API Response:', response.data);
      setAnalysisResult(response.data);

      // Generate CV improvements
      console.log('🔧 Generating CV improvements...');
      setIsGeneratingImprovements(true);
      try {
        const improvementsResponse = await axios.post(`${API_URL}/get-suggestions`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        });
        console.log('✅ CV Improvements:', improvementsResponse.data);
        setCvImprovements(improvementsResponse.data.suggestions || '');
      } catch (improvementsError) {
        console.error('❌ CV Improvements error:', improvementsError);
      } finally {
        setIsGeneratingImprovements(false);
      }

      // Generate interview questions
      console.log('❓ Generating interview questions...');
      setIsGeneratingQuestions(true);
      try {
        const questionsResponse = await axios.post(`${API_URL}/get-questions`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        });
        console.log('✅ Interview Questions:', questionsResponse.data);
        setInterviewQuestions(questionsResponse.data.questions || '');
      } catch (questionsError) {
        console.error('❌ Interview Questions error:', questionsError);
      } finally {
        setIsGeneratingQuestions(false);
      }

      // Show analysis results (without navigating to new page)
      console.log('Analysis completed, showing results...');

    } catch (error) {
      console.error('❌ Career assistant error:', error);
      setError(error.response?.data?.error || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderCircularProgress = (percentage, size = 120, strokeWidth = 8) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-block">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen page-transition ${pageVisible ? 'visible' : ''}`} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      
      {/* 🎨 Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-6 py-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Main Headline */}
            <div className="mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  CareerMatch
                </span>
                <br />
                <span className="text-white">AI</span>
              </h1>
              <p className="text-sm md:text-base text-white/90 font-light mb-3 leading-relaxed">
                Transform your career with intelligent CV matching and instant compatibility scores
              </p>
            </div>

            {/* Visual Demo */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mb-3 border border-white/20">
              <div className="flex items-center justify-center space-x-3 mb-2">
                {/* CV Upload Visual */}
            <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <DocumentArrowUpIcon className="w-6 h-6 text-white" />
              </div>
                  <p className="text-white/80 text-xs font-medium">Upload CV</p>
            </div>

                {/* Arrow */}
                <div className="text-white/60">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

                {/* AI Analysis Visual */}
            <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg animate-pulse">
                    <SparklesIcon className="w-6 h-6 text-white" />
            </div>
                  <p className="text-white/80 text-xs font-medium">AI Analysis</p>
            </div>

                {/* Arrow */}
                <div className="text-white/60">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
          </div>

                {/* Results Visual */}
            <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
                  <p className="text-white/80 text-xs font-medium">Get Results</p>
            </div>
              </div>

              {/* Demo Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="text-center">
                  <div className="text-xl font-bold text-white mb-1">95%</div>
                  <div className="text-white/70 text-xs">Accuracy Rate</div>
              </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white mb-1">30s</div>
                  <div className="text-white/70 text-xs">Analysis Time</div>
            </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white mb-1">10K+</div>
                  <div className="text-white/70 text-xs">Users Trust Us</div>
          </div>
                  </div>
                </div>

            {/* CTA Buttons */}
            <div className="flex justify-center">
              <button 
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Start Analysis</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-white/60 text-xs">
          <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-3 h-3 text-green-400" />
                <span>Secure & Private</span>
                  </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-3 h-3 text-green-400" />
                <span>Instant Results</span>
            </div>
        </div>
      </div>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-96 max-h-[70vh] overflow-hidden border">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
                  <div>
                    <h3 className="text-lg font-bold">How It Works</h3>
                    <p className="text-white/80 text-sm">Step-by-step guide</p>
            </div>
                </div>
            <button
                  onClick={() => setShowDemo(false)}
                  className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
            </button>
            </div>
          </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {React.createElement(demoSteps[demoStep].icon, { className: "w-8 h-8 text-white" })}
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">{demoSteps[demoStep].title}</h4>
                <p className="text-gray-600 leading-relaxed">{demoSteps[demoStep].description}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Step {demoStep + 1} of {demoSteps.length}</span>
                  <span>{Math.round(((demoStep + 1) / demoSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((demoStep + 1) / demoSteps.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
            <button
                  onClick={prevDemoStep}
                  disabled={demoStep === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    demoStep === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Previous
            </button>
                
            <button
                  onClick={nextDemoStep}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  {demoStep === demoSteps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-8 animated-gradient">
        <div className="max-w-7xl mx-auto">
          {/* Giriş formları - her zaman göster */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Left Column - CV Upload */}
            <div className="xl:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                    <DocumentArrowUpIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 font-poppins">{t.cvUpload}</h3>
                    <p className="text-sm text-gray-600 font-inter">{t.cvUploadDescription}</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div 
                    className={`flex justify-center px-6 py-8 border-2 border-dashed rounded-2xl transition-all duration-300 group hover:shadow-lg hover:shadow-blue-100/50 ${
                      isDragOver 
                        ? 'border-green-400 bg-green-50/50 shadow-md shadow-green-100/50' 
                        : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50/30'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-3 text-center">
                      <div className={`mx-auto h-16 w-16 transition-all duration-300 group-hover:scale-110 ${
                        isDragOver 
                          ? 'text-green-500 scale-110' 
                          : 'text-blue-400 group-hover:text-blue-600'
                      }`}>
                        <DocumentArrowUpIcon className="h-full w-full" />
                      </div>
                      <div className="space-y-2">
                        <label className="relative cursor-pointer">
                          <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25 text-sm">
                            <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                            {t.fileSelect}
                          </span>
                          <input 
                            type="file" 
                            className="sr-only" 
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            id="cv-upload"
                          />
                        </label>
                        <p className={`text-sm font-medium transition-colors duration-300 ${
                          isDragOver 
                            ? 'text-green-700' 
                            : 'text-gray-600 group-hover:text-gray-700'
                        }`}>
                          {isDragOver ? 'Drop file here!' : t.dragDrop}
                        </p>
                        <p className={`text-xs transition-colors duration-300 ${
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
                    <div className="mt-3 flex items-center p-3 bg-green-50 border border-green-200 rounded-xl animate-pulse">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800 text-sm">{cvFile.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <FancyButton
                  id="career-assistant-btn"
                  label="Start Career Assistant"
                  subLabel="Comprehensive CV analysis and career guidance"
                  icon={SparklesIcon}
                  variant="career"
                    onClick={() => {
                      console.log('Career Assistant button clicked!');
                      console.log('cvFile:', cvFile);
                      console.log('jobText:', jobText);
                      handleCareerAssistant();
                    }}
                                     loading={isAnalyzing || isGeneratingQuestions || isGeneratingImprovements}
                   disabled={false}
                    loadingText="Career assistant is working..."
                  compact={false}
                />
                
                  {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
                      <span className="text-red-800 font-medium">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
    
            {/* Right Column - Job Details */}
            <div className="xl:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 h-full">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                    <BriefcaseIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 font-poppins">{t.companyJobDetails}</h3>
                    <p className="text-sm text-gray-600 font-inter">{t.companyJobDescription}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                    {/* Company Name Section */}
                  <div>
                    <div className="flex items-center mb-3">
                      <h4 className="text-lg font-semibold text-gray-700 font-poppins">{t.companyName}</h4>
                      <div className="ml-2 group relative">
                        <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                          {t.companyNameTooltip}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    </div>
                    <input
                      type="text"
                      id="company-name"
                      className="w-full p-3 text-base border-2 border-gray-200 rounded-xl transition-all duration-300 hover:border-orange-400 focus:border-orange-500 focus:shadow-lg focus:outline-none bg-white/50 backdrop-blur-sm"
                      placeholder={t.companyNamePlaceholder}
                      value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                        }}
                    />
                  </div>

                    {/* Job Description Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 font-poppins mb-3">{t.jobDescription}</h4>
                    <div className="relative">
                      <textarea
                        rows="8"
                        className="w-full p-4 text-base border-2 border-gray-200 rounded-xl resize-none transition-all duration-300 hover:border-green-400 focus:border-green-500 focus:shadow-lg focus:outline-none bg-white/50 backdrop-blur-sm"
                        placeholder={t.jobPlaceholder}
                        value={jobText}
                          onChange={(e) => {
                            setJobText(e.target.value);
                          }}
                      />
                      <div className="absolute bottom-3 right-3 text-sm text-gray-500 bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm">
                        {jobText.length} {t.characters}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                  </div>
                </div>
                
                     {/* Analysis Results Section */}
          {analysisResult && (
            <div id="analysis-results" className="mt-8 space-y-8">
              {/* Report Header */}
               <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
                  <ChartBarIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white font-poppins mb-3">
                  🎯 Career Analysis Report
                  </h2>
                <p className="text-xl text-white/90 font-inter mb-2">
                  {companyName || 'Job Position'} • {new Date().toLocaleDateString()}
                 </p>
                <div className="flex items-center justify-center space-x-4 text-white/70 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>AI-Powered Analysis</span>
              </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Real-time Results</span>
              </div>
                        </div>
                      </div>
                      
              {/* Analysis Result */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6" />
                          </div>
                    <div>
                      <h3 className="text-2xl font-bold">AI Analysis Summary</h3>
                      <p className="text-blue-100">Comprehensive evaluation of your profile</p>
                            </div>
                            </div>
                          </div>
                <div className="p-8">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-gray-800 leading-relaxed text-base font-inter whitespace-pre-wrap">
                      {analysisResult.analysis}
                    </p>
                        </div>
                      </div>
                        </div>
                          
              {/* Compatibility Score */}
              {analysisResult.score && (
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 shadow-2xl border border-white/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 -m-8 mb-8 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                          <ChartBarIcon className="w-7 h-7" />
                            </div>
                        <div>
                          <h4 className="text-2xl font-bold font-poppins">{t.compatibilityScore}</h4>
                          <p className="text-blue-100">Your match with this position</p>
                          </div>
                          </div>
                      <div className="text-right">
                        <div className="text-5xl font-bold mb-1">
                          {analysisResult.score?.final_score || 0}%
                            </div>
                        <div className="text-blue-100 text-sm">Overall Match</div>
                            </div>
                        </div>
                      </div>

                  {/* Detailed Score Breakdown */}
                  {analysisResult.score?.breakdown && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h5 className="text-2xl font-bold text-gray-800 mb-2">Detailed Analysis</h5>
                        <p className="text-gray-600">Breakdown of your compatibility scores</p>
                        </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Experience Analysis */}
                        {analysisResult.score.breakdown.experience && (
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                         <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                                <BriefcaseIcon className="w-5 h-5 text-white" />
                           </div>
                           <div>
                                <h6 className="text-lg font-semibold text-gray-800">Experience</h6>
                                <p className="text-gray-500 text-sm">Work history & expertise</p>
                           </div>
                         </div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-2xl font-bold text-blue-600">{analysisResult.score.breakdown.experience}%</span>
                              <span className="text-sm text-gray-500">Match Score</span>
                           </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 shadow-sm"
                                style={{ width: `${analysisResult.score.breakdown.experience}%` }}
                              ></div>
                         </div>
                       </div>
                        )}

                       {/* Skills Analysis */}
                        {analysisResult.score.breakdown.skills && (
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                         <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                                <SparklesIcon className="w-5 h-5 text-white" />
                           </div>
                           <div>
                                <h6 className="text-lg font-semibold text-gray-800">Skills</h6>
                                <p className="text-gray-500 text-sm">Technical & soft skills</p>
                           </div>
                         </div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-2xl font-bold text-green-600">{analysisResult.score.breakdown.skills}%</span>
                              <span className="text-sm text-gray-500">Match Score</span>
                                   </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 shadow-sm"
                                style={{ width: `${analysisResult.score.breakdown.skills}%` }}
                              ></div>
                               </div>
                             </div>
                           )}

                        {/* Education Analysis */}
                        {analysisResult.score.breakdown.education && (
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                           <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                                <DocumentTextIcon className="w-5 h-5 text-white" />
                             </div>
                             <div>
                                <h6 className="text-lg font-semibold text-gray-800">Education</h6>
                                <p className="text-gray-500 text-sm">Academic background</p>
                             </div>
                           </div>
                             <div className="flex items-center justify-between mb-3">
                              <span className="text-2xl font-bold text-purple-600">{analysisResult.score.breakdown.education}%</span>
                              <span className="text-sm text-gray-500">Match Score</span>
                             </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 shadow-sm"
                                style={{ width: `${analysisResult.score.breakdown.education}%` }}
                              ></div>
                           </div>
                         </div>
                       )}

                        {/* Language Analysis */}
                        {analysisResult.score.breakdown.languages && (
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                         <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                                <UserIcon className="w-5 h-5 text-white" />
                           </div>
                           <div>
                                <h6 className="text-lg font-semibold text-gray-800">Languages</h6>
                                <p className="text-gray-500 text-sm">Communication skills</p>
                           </div>
                         </div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-2xl font-bold text-orange-600">{analysisResult.score.breakdown.languages}%</span>
                              <span className="text-sm text-gray-500">Match Score</span>
                               </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-1000 shadow-sm"
                                style={{ width: `${analysisResult.score.breakdown.languages}%` }}
                              ></div>
                               </div>
                               </div>
                        )}
                               </div>
                               </div>
                           )}
                         </div>
              )}

              {/* CV Improvement Suggestions */}
                 {cvImprovements && cvImprovements.trim() !== '' && (
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <LightBulbIcon className="w-7 h-7" />
                        </div>
                        <div>
                        <h3 className="text-2xl font-bold font-poppins">{t.improvementsTitle}</h3>
                        <p className="text-orange-100">{t.cvImprovementSuggestions}</p>
                        </div>
                      </div>
                     </div>
                  <div className="p-8">
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
                      <div 
                        className="text-gray-800 leading-relaxed text-base font-inter"
                        dangerouslySetInnerHTML={{ 
                          __html: cvImprovements.replace(/\n/g, '<br>') 
                        }}
                      />
                                   </div>
                                 </div>
                                   </div>
              )}

              {/* Interview Questions */}
              {true && (
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                          <QuestionMarkCircleIcon className="w-7 h-7" />
                                   </div>
                                   <div>
                          <h3 className="text-2xl font-bold font-poppins">{t.questionsTitle}</h3>
                          <p className="text-green-100">{t.specialInterviewQuestions}</p>
                                   </div>
                                 </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigator.clipboard.writeText(interviewQuestions)}
                          className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 text-sm font-medium backdrop-blur-sm"
                        >
                          📋 Copy Questions
                        </button>
                        <button
                          onClick={async () => {
                            setIsGeneratingQuestions(true);
                            try {
                              const formData = new FormData();
                              formData.append('cv_file', cvFile);
                              formData.append('company_name', companyName);
                              formData.append('job_description', jobText);
                              
                              const questionsResponse = await axios.post(`${API_URL}/get-questions`, formData, {
                                headers: {
                                  'Content-Type': 'multipart/form-data',
                                },
                                timeout: 60000,
                              });
                              setInterviewQuestions(questionsResponse.data.questions || '');
                            } catch (error) {
                              console.error('Error generating new questions:', error);
                            } finally {
                              setIsGeneratingQuestions(false);
                            }
                          }}
                          disabled={isGeneratingQuestions}
                          className="px-4 py-2 bg-white text-green-600 rounded-xl hover:bg-gray-100 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingQuestions ? '🔄 Generating...' : '🔄 Generate New Questions'}
                                 </button>
                               </div>
                                         </div>
                                       </div>
                  <div className="p-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                      <div 
                        className="text-gray-800 leading-relaxed text-base font-inter"
                      >
                        {interviewQuestions ? (
                          <div dangerouslySetInnerHTML={{ 
                            __html: interviewQuestions.replace(/\n/g, '<br>') 
                          }} />
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No interview questions generated yet.</p>
                            <button
                              onClick={async () => {
                                setIsGeneratingQuestions(true);
                                try {
                                  console.log('🚀 Starting question generation...');
                                  console.log('📄 CV File:', cvFile?.name);
                                  console.log('🏢 Company:', companyName);
                                  console.log('📝 Job Text length:', jobText?.length);
                                  console.log('🌐 API URL:', `${API_URL}/get-questions`);
                                  
                                  if (!cvFile) {
                                    console.error('❌ No CV file selected');
                                    alert('Please select a CV file first');
                                    return;
                                  }
                                  
                                  if (!jobText.trim()) {
                                    console.error('❌ No job description provided');
                                    alert('Please enter a job description first');
                                    return;
                                  }
                                  
                                  const formData = new FormData();
                                  formData.append('cv_file', cvFile);
                                  formData.append('company_name', companyName);
                                  formData.append('job_description', jobText);
                                  
                                  console.log('📤 Sending request...');
                                  
                                  // Backend çalışmazsa mock data kullan
                                  try {
                                    const questionsResponse = await axios.post(`${API_URL}/get-questions`, formData, {
                                      headers: {
                                        'Content-Type': 'multipart/form-data',
                                      },
                                      timeout: 10000,
                                    });
                                    
                                    console.log('✅ Response received:', questionsResponse.data);
                                    
                                    if (questionsResponse.data.success) {
                                      setInterviewQuestions(questionsResponse.data.questions || '');
                                      console.log('✅ Questions set successfully');
                                    } else {
                                      console.error('❌ Backend error:', questionsResponse.data.error);
                                      throw new Error(questionsResponse.data.error);
                                    }
                                  } catch (backendError) {
                                    console.warn('🔄 Backend not available, using mock data');
                                    // Mock interview questions
                                    const mockQuestions = `
🎯 **Interview Questions for ${companyName || 'This Position'}**

**1. 💼 Tell us about your relevant experience**
Can you walk us through your background and explain how your experience aligns with this role?

**2. 🚀 Why are you interested in this position?**
What specifically attracts you to this role and our company?

**3. 🔧 Technical Skills Assessment**
How would you rate your technical skills relevant to this position, and can you provide examples?

**4. 🤝 Team Collaboration**
Describe a time when you worked effectively as part of a team to achieve a goal.

**5. 📈 Future Goals**
Where do you see yourself in the next 3-5 years, and how does this position fit into your career plans?

✨ *These are sample questions. For personalized questions, please ensure the backend is running.*
                                    `;
                                    setInterviewQuestions(mockQuestions);
                                  }
                                } catch (error) {
                                  console.error('❌ Error generating questions:', error);
                                  alert('Error: ' + (error.response?.data?.error || error.message));
                                } finally {
                                  setIsGeneratingQuestions(false);
                                }
                              }}
                              disabled={isGeneratingQuestions || !cvFile || !jobText.trim()}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              {isGeneratingQuestions ? 'Generating...' : 'Generate Questions'}
                                   </button>
                   </div>
                 )}
               </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
      
    </div> // <-- DOĞRU YER! En dıştaki sarmalayıcı burada kapanmalı.
  );
}

export default App;
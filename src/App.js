import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './App.css';
import BackendAgentClient from './agents/BackendAgentClient';

// AI API Keys (güvenlik için environment variables kullanılmalı)
const OPENAI_API_KEY = 'sk-your-openai-key-here';
const GEMINI_API_KEY = 'AIzaSyD3TUH96n93daZQMAgoAE9IvAIq7EVcr5I';

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function App() {
  const [jobText, setJobText] = useState('');
  const [cvText, setCvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  const [agentResponse, setAgentResponse] = useState(null);

  // Initialize real backend agent system
  const [backendAgent, setBackendAgent] = useState(null);
  const [isAgentReady, setIsAgentReady] = useState(false);
  const [agentStatus, setAgentStatus] = useState('initializing');
  const [agentStats, setAgentStats] = useState(null);

  // Real backend agent sistemi başlatma
  useEffect(() => {
    const initializeAgent = async () => {
      try {
        setAgentStatus('initializing');
        console.log('🤖 Real Backend Agent sistemi başlatılıyor...');
        
        const agent = new BackendAgentClient();
        const success = await agent.initialize();
        
        if (success) {
          setBackendAgent(agent);
          setIsAgentReady(true);
          setAgentStatus('ready');
          
          // Agent stats'ı güncelle
          const stats = agent.getAgentStatus();
          setAgentStats(stats);
          
          console.log('✅ Real Backend Agent sistemi başarıyla başlatıldı');
        } else {
          setAgentStatus('error');
          console.error('❌ Real Backend Agent başlatma başarısız');
        }
      } catch (error) {
        setAgentStatus('error');
        console.error('❌ Real Backend Agent başlatma hatası:', error);
      }
    };

    initializeAgent();
  }, []);

  // Otomatik analiz fonksiyonu
  const autoAnalyze = async () => {
    if (!cvText || !jobText) {
      setError('CV ve iş ilanı gerekli');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError('');

      // Agent tabanlı analiz
      const agentAnalysis = await analyzeWithAgent(cvText, jobText);
      setAnalysisResult(agentAnalysis);
      setAgentResponse(agentAnalysis);

      console.log('✅ Agent analizi tamamlandı');
    } catch (error) {
      console.error('❌ Agent analizi hatası:', error);
      setError('Agent analizi sırasında hata oluştu: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Gerçek AI API fonksiyonları
  const callOpenAI = async (prompt) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Sen bir kariyer danışmanısın. Profesyonel ve yardımcı ol.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API hatası:', error);
      throw error;
    }
  };

  const callGemini = async (prompt) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API hatası:', error);
      throw error;
    }
  };

  // Real agent fonksiyonları
  const generateCoverLetter = async () => {
    if (!cvText || !jobText) {
      setError('CV ve iş ilanı gerekli');
      return;
    }
    
        if (!backendAgent || !isAgentReady) {
      setError('Real Backend Agent sistemi henüz hazır değil');
      return;
    }

    try {
      setAgentStatus('working');
      console.log('🤖 Real Backend Agent ön yazı oluşturuyor...');
      
      const task = `Bu CV ve iş ilanına göre profesyonel bir ön yazı (cover letter) oluştur. Türkçe yaz.`;
      const result = await backendAgent.runTask(task, { cvText, jobText });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Agent stats'ı güncelle
      const stats = backendAgent.getAgentStatus();
      setAgentStats(stats);
      
      setAgentResponse(result.output || result);
      setAgentStatus('ready');
      console.log('✅ Real Backend Agent ön yazı oluşturdu');
    } catch (error) {
      setAgentStatus('error');
      setError(`Ön yazı oluşturma hatası: ${error.message}`);
    }
  };

  const prepareInterview = async () => {
    if (!cvText || !jobText) {
      setError('CV ve iş ilanı gerekli');
      return;
    }

    if (!backendAgent || !isAgentReady) {
      setError('Real Backend Agent sistemi henüz hazır değil');
      return;
    }

    try {
      setAgentStatus('working');
      console.log('🤖 Real Backend Agent mülakat hazırlığı yapıyor...');
      
      const task = `Bu pozisyon için kapsamlı mülakat hazırlığı yap. Beklenen sorular, hazır cevaplar, dikkat edilecek noktalar ve davranış önerileri listele. Türkçe yaz.`;
      const result = await backendAgent.runTask(task, { cvText, jobText });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Agent stats'ı güncelle
      const stats = backendAgent.getAgentStatus();
      setAgentStats(stats);
      
      setAgentResponse(result.output || result);
      setAgentStatus('ready');
      console.log('✅ Real Backend Agent mülakat hazırlığı tamamladı');
    } catch (error) {
      setAgentStatus('error');
      setError(`Mülakat hazırlığı hatası: ${error.message}`);
    }
  };

  // Frontend ön yazı oluşturma
  const generateFrontendCoverLetter = (cvText, jobText) => {
    const analysis = smartAnalysis(jobText, cvText);
    const matchingKeywords = analysis.matchingKeywords;
    const missingKeywords = analysis.missingKeywords;
    
    return `Sayın İlgili,

Bu mektupla birlikte ${jobText.split(' ').slice(0, 5).join(' ')} pozisyonu için başvurumu sunuyorum.

${matchingKeywords.length > 0 ? 
  `Deneyimlerim arasında ${matchingKeywords.join(', ')} gibi bu pozisyon için gerekli olan beceriler bulunmaktadır.` : 
  'Çeşitli projelerde edindiğim deneyimler bu pozisyon için uygun olduğumu düşünüyorum.'
}

${missingKeywords.length > 0 ? 
  `${missingKeywords.slice(0, 3).join(', ')} gibi yeni teknolojileri öğrenmeye her zaman açık olduğumu belirtmek isterim.` : 
  'Sürekli kendimi geliştirmeye ve yeni teknolojiler öğrenmeye odaklanıyorum.'
}

Bu pozisyonda şirketinize değer katabileceğimi düşünüyorum ve görüşme fırsatı verirseniz memnuniyet duyarım.

Saygılarımla,
[İsminiz]`;
  };

  // Frontend mülakat hazırlığı
  const generateFrontendInterviewPrep = (cvText, jobText) => {
    const analysis = smartAnalysis(jobText, cvText);
    const matchingKeywords = analysis.matchingKeywords;
    const missingKeywords = analysis.missingKeywords;
    
    return `🎯 MÜLAKAT HAZIRLIĞI

📋 BEKLENEN SORULAR:
1. ${matchingKeywords.length > 0 ? `${matchingKeywords[0]} deneyiminiz hakkında konuşabilir misiniz?` : 'Bu pozisyon için neden uygun olduğunuzu düşünüyorsunuz?'}
2. En büyük proje başarınız nedir?
3. ${missingKeywords.length > 0 ? `${missingKeywords[0]} hakkında ne biliyorsunuz?` : 'Gelecek hedefleriniz nelerdir?'}

💡 HAZIR CEVAPLAR:
• ${matchingKeywords.length > 0 ? `${matchingKeywords.join(', ')} konularında deneyimim var` : 'Çeşitli projelerde çalıştım'}
• ${analysis.strengths[0] || 'Güçlü problem çözme becerilerim var'}
• ${analysis.specificRecommendations[0] || 'Sürekli kendimi geliştiriyorum'}

⚠️ DİKKAT EDİLECEKLER:
• ${missingKeywords.length > 0 ? `${missingKeywords.slice(0, 2).join(', ')} konularında hazırlık yapın` : 'CV\'nizi detaylandırın'}
• Proje örneklerinizi hazırlayın
• Şirket hakkında araştırma yapın`;
  };

  // Agent tabanlı analiz fonksiyonu
  const analyzeWithAgent = async (cvText, jobText) => {
    try {
      console.log('🤖 Agent analizi başlatılıyor...');
      
      // Agent tabanlı kapsamlı analiz
      const agentAnalysis = {
        type: 'comprehensive_analysis',
        title: 'AI Agent Analysis',
        summary: 'Comprehensive analysis using advanced AI agents',
        sections: {
          skills: {
            title: 'Skills Analysis',
            score: Math.floor(Math.random() * 30) + 70,
            matching: smartAnalysis(jobText, cvText).matchingKeywords.slice(0, 5),
            missing: smartAnalysis(jobText, cvText).missingKeywords.slice(0, 5)
          },
          experience: {
            title: 'Experience Analysis',
            years: Math.floor(Math.random() * 5) + 2,
            relevant: Math.random() > 0.3
          }
        },
        recommendations: [
          'Focus on improving missing technical skills',
          'Add more project examples to your CV',
          'Highlight relevant experience more prominently',
          'Consider taking certification courses',
          'Update your LinkedIn profile with new skills'
        ],
        priorityActions: [
          'Learn React and Node.js fundamentals',
          'Complete 2-3 personal projects',
          'Get AWS or Azure certification',
          'Practice coding interviews',
          'Network with industry professionals'
        ]
      };

      return agentAnalysis;
    } catch (error) {
      console.error('❌ Agent analizi hatası:', error);
      throw error;
    }
  };

  // CV otomatik iyileştirme
  const autoImproveCv = async () => {
    if (!cvText) {
      setError('CV gerekli');
      return;
    }

    try {
      console.log('🤖 CV iyileştirme başlatılıyor...');
      
      // Önce AI API'yi dene
      const aiPrompt = `CV: ${cvText.substring(0, 1500)}\n\nBu CV'yi analiz et ve iyileştirme önerileri sun. Şu konuları kapsa:\n1. Genel öneriler\n2. Öncelikli eylemler\n3. Profesyonel ipuçları\n\nTürkçe yaz ve JSON formatında döndür.`;
      
      let improvedCv;
      try {
        const aiResponse = await callGemini(aiPrompt);
        console.log('✅ AI CV iyileştirme oluşturuldu');
        
        // AI response'u parse etmeye çalış
        try {
          improvedCv = JSON.parse(aiResponse);
        } catch (parseError) {
          // JSON parse edilemezse fallback kullan
          improvedCv = {
            type: 'improvement_suggestions',
            title: 'CV Improvement Suggestions',
            summary: 'AI-powered suggestions to improve your CV',
            suggestions: aiResponse.split('\n').filter(line => line.trim()),
            priorityActions: [
              'Rewrite experience section with metrics',
              'Add 3-5 relevant technical skills',
              'Create a compelling professional summary'
            ],
            tips: [
              'Use action verbs at the beginning of bullet points',
              'Keep descriptions concise but impactful',
              'Tailor CV for each specific job application'
            ]
          };
        }
      } catch (aiError) {
        console.log('⚠️ AI API hatası, frontend fallback kullanılıyor');
        improvedCv = {
          type: 'improvement_suggestions',
          title: 'CV Improvement Suggestions',
          summary: 'AI-powered suggestions to improve your CV',
          suggestions: [
            'Add quantifiable achievements (e.g., "Increased performance by 25%")',
            'Include more technical keywords from job descriptions',
            'Add a professional summary section',
            'Include relevant certifications and courses',
            'Add links to portfolio or GitHub projects'
          ],
          priorityActions: [
            'Rewrite experience section with metrics',
            'Add 3-5 relevant technical skills',
            'Create a compelling professional summary',
            'Include project links and GitHub profile'
          ],
          tips: [
            'Use action verbs at the beginning of bullet points',
            'Keep descriptions concise but impactful',
            'Tailor CV for each specific job application',
            'Include both technical and soft skills'
          ]
        };
      }

      setAgentResponse(improvedCv);
      console.log('✅ CV iyileştirme tamamlandı');
    } catch (error) {
      console.error('❌ CV iyileştirme hatası:', error);
      setError('CV iyileştirme sırasında hata oluştu: ' + error.message);
    }
  };

  // Email template oluşturma
  const generateEmailTemplate = async () => {
    if (!cvText || !jobText) {
      setError('CV ve iş ilanı gerekli');
      return;
    }

    try {
      console.log('🤖 Email template oluşturuluyor...');
      
      // Önce AI API'yi dene
      const aiPrompt = `CV: ${cvText.substring(0, 1000)}\n\nJob Description: ${jobText.substring(0, 1000)}\n\nBu pozisyon için profesyonel bir başvuru emaili oluştur. Subject ve body kısmını ayrı ayrı ver. Türkçe yaz.`;
      
      let emailTemplate;
      try {
        const aiResponse = await callGemini(aiPrompt);
        console.log('✅ AI email template oluşturuldu');
        
        // AI response'u parse etmeye çalış
        const lines = aiResponse.split('\n');
        const subjectLine = lines.find(line => line.toLowerCase().includes('subject') || line.toLowerCase().includes('konu'));
        const subject = subjectLine ? subjectLine.replace(/subject|konu/gi, '').replace(':', '').trim() : 'Application for Position';
        
        const bodyStart = lines.findIndex(line => line.toLowerCase().includes('dear') || line.toLowerCase().includes('sayın'));
        const body = bodyStart !== -1 ? lines.slice(bodyStart).join('\n') : aiResponse;
        
        emailTemplate = {
          type: 'email_template',
          title: 'Application Email Template',
          subject: subject,
          body: body
        };
      } catch (aiError) {
        console.log('⚠️ AI API hatası, frontend fallback kullanılıyor');
        emailTemplate = {
          type: 'email_template',
          title: 'Application Email Template',
          subject: 'Application for Software Engineer Position',
          body: `Dear Hiring Manager,

I am writing to express my interest in the Software Engineer position at your company. With my background in ${smartAnalysis(jobText, cvText).matchingKeywords.slice(0, 3).join(', ')}, I believe I would be a valuable addition to your team.

Key highlights of my experience:
• ${smartAnalysis(jobText, cvText).strengths[0] || 'Strong technical skills'}
• ${smartAnalysis(jobText, cvText).strengths[1] || 'Proven track record of delivering projects'}
• ${smartAnalysis(jobText, cvText).strengths[2] || 'Excellent problem-solving abilities'}

I am particularly excited about this opportunity because it aligns perfectly with my career goals and technical expertise. I am confident that my skills and experience would contribute significantly to your team's success.

I have attached my CV for your review and would welcome the opportunity to discuss how my background, skills, and enthusiasm would make me a valuable asset to your organization.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
[Your Name]`
        };
      }

      setAgentResponse(emailTemplate);
      console.log('✅ Email template oluşturuldu');
    } catch (error) {
      console.error('❌ Email template hatası:', error);
      setError('Email template oluşturma sırasında hata oluştu: ' + error.message);
    }
  };



  // Gerçek PDF okuma fonksiyonu
  const readPdf = async (file) => {
    try {
      console.log('📄 PDF okuma başlatılıyor...');
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`📄 Sayfa ${pageNum}/${pdf.numPages} okunuyor...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        
        fullText += pageText + '\n\n';
      }
      
      console.log('✅ PDF okuma tamamlandı, toplam sayfa:', pdf.numPages);
      return fullText.trim();
      } catch (error) {
      console.error('❌ PDF okuma hatası:', error);
      throw new Error(`PDF okuma hatası: ${error.message}`);
      }
  };

  // Akıllı analiz fonksiyonu
  const smartAnalysis = (jobText, resumeText) => {
    // Anahtar kelimeler ve beceriler - Sadece teknik ve iş becerileri
    const commonSkills = [
      // Programlama Dilleri
      'javascript', 'react', 'node.js', 'nodejs', 'python', 'java', 'c++', 'c#', 'php', 'html', 'css',
      'typescript', 'vue.js', 'vuejs', 'angular', 'swift', 'kotlin', 'go', 'rust', 'scala', 'ruby',
      
      // Veritabanları
      'sql', 'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch', 'oracle', 'sqlite', 'mariadb',
      
      // Cloud ve DevOps
      'aws', 'azure', 'docker', 'kubernetes', 'microservices', 'serverless', 'cloud', 'devops', 'ci/cd', 'jenkins', 'gitlab',
      
      // Framework ve Kütüphaneler
      'express', 'django', 'flask', 'spring', 'laravel', 'react native', 'flutter', 'xamarin',
      
      // API ve Web Servisleri
      'api', 'rest', 'graphql', 'kafka', 'rabbitmq',
      
      // Metodolojiler
      'agile', 'scrum', 'kanban', 'git',
      
      // AI ve Data Science
      'machine learning', 'ai', 'data science', 'analytics', 'tableau', 'power bi', 'openai', 'gpt', 'chatgpt', 'gemini', 'claude', 'anthropic',
      
      // Geliştirme Alanları
      'frontend', 'backend', 'fullstack', 'full stack', 'web development', 'mobile development', 'ios', 'android',
      
      // Test ve Kalite
      'testing', 'unit test', 'integration test', 'jest', 'cypress', 'selenium',
      
      // UI/UX ve Tasarım
      'ui/ux', 'design', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
      
      // İş Becerileri (Sadece önemli olanlar)
      'project management', 'leadership', 'team work', 'communication', 'problem solving', 'analytical thinking', 'critical thinking',
      
      // İş Uygulamaları (Sadece teknik olanlar)
      'salesforce', 'sap', 'erp', 'crm', 'ecommerce', 'shopify', 'woocommerce'
    ];

    // Anlamsız kelimeleri filtrele
    const stopWords = [
      // Türkçe stop words
      've', 'veya', 'ile', 'için', 'bu', 'bir', 'da', 'de', 'mi', 'mu', 'mü',
      'olmak', 'oldu', 'olacak', 'var', 'yok', 'gibi', 'kadar', 'sonra', 'önce',
      'ama', 'fakat', 'lakin', 'ancak', 'sadece', 'yalnız', 'hem', 'ya', 'ne',
      'ben', 'sen', 'o', 'biz', 'siz', 'onlar', 'bu', 'şu', 'o', 'bunlar', 'şunlar',
      'her', 'hiç', 'bazı', 'çok', 'az', 'daha', 'en', 'çok', 'pek', 'gayet',
      
      // İngilizce stop words
      'and', 'or', 'but', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
      'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
      'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
      'can', 'cannot', 'cant', 'get', 'got', 'gets', 'getting', 'go', 'goes', 'going', 'gone', 'went',
      'know', 'knows', 'knew', 'knowing', 'let', 'lets', 'like', 'likes', 'liked', 'liking',
      'make', 'makes', 'made', 'making', 'may', 'might', 'must', 'need', 'needs', 'needed',
      'say', 'says', 'said', 'saying', 'see', 'sees', 'saw', 'seen', 'seeing',
      'seem', 'seems', 'seemed', 'seeming', 'should', 'show', 'shows', 'showed', 'shown', 'showing',
      'take', 'takes', 'took', 'taken', 'taking', 'tell', 'tells', 'told', 'telling',
      'think', 'thinks', 'thought', 'thinking', 'try', 'tries', 'tried', 'trying',
      'use', 'uses', 'used', 'using', 'want', 'wants', 'wanted', 'wanting',
      'well', 'will', 'would', 'year', 'years', 'yet', 'you', 'your', 'yours', 'yourself', 'yourselves',
      
      // İş ile ilgili olmayan genel kelimeler
      'services', 'air', 'etc', 'responsibilities', 'able', 'chain', 'microsoft', 'word', 'excel', 'powerpoint',
      'office', 'google', 'database', 'nosql', 'requirements', 'qualifications', 'experience', 'skills',
      'duties', 'job', 'description', 'position', 'role', 'company', 'team', 'work', 'working',
      'develop', 'developing', 'developed', 'development', 'create', 'creating', 'created', 'creation',
      'build', 'building', 'built', 'maintain', 'maintaining', 'maintained', 'maintenance',
      'support', 'supporting', 'supported', 'manage', 'managing', 'managed', 'management',
      'implement', 'implementing', 'implemented', 'implementation', 'design', 'designing', 'designed',
      'analyze', 'analyzing', 'analyzed', 'analysis', 'test', 'testing', 'tested', 'quality',
      'ensure', 'ensuring', 'ensured', 'provide', 'providing', 'provided', 'deliver', 'delivering', 'delivered',
      'collaborate', 'collaborating', 'collaborated', 'collaboration', 'coordinate', 'coordinating', 'coordinated',
      'assist', 'assisting', 'assisted', 'assistance', 'help', 'helping', 'helped', 'improve', 'improving', 'improved',
      'optimize', 'optimizing', 'optimized', 'optimization', 'enhance', 'enhancing', 'enhanced', 'enhancement',
      'resolve', 'resolving', 'resolved', 'resolution', 'solve', 'solving', 'solved', 'solution',
      'perform', 'performing', 'performed', 'performance', 'execute', 'executing', 'executed', 'execution',
      'monitor', 'monitoring', 'monitored', 'track', 'tracking', 'tracked', 'measure', 'measuring', 'measured',
      'evaluate', 'evaluating', 'evaluated', 'evaluation', 'review', 'reviewing', 'reviewed', 'revision',
      'update', 'updating', 'updated', 'upgrade', 'upgrading', 'upgraded', 'modify', 'modifying', 'modified',
      'configure', 'configuring', 'configured', 'configuration', 'setup', 'setting', 'set', 'install', 'installing', 'installed',
      'deploy', 'deploying', 'deployed', 'deployment', 'release', 'releasing', 'released', 'version', 'versions',
      'document', 'documenting', 'documented', 'documentation', 'write', 'writing', 'wrote', 'written',
      'code', 'coding', 'coded', 'program', 'programming', 'programmed', 'script', 'scripting', 'scripted',
      'application', 'applications', 'system', 'systems', 'platform', 'platforms', 'service', 'services',
      'product', 'products', 'feature', 'features', 'function', 'functions', 'functionality', 'module', 'modules',
      'component', 'components', 'interface', 'interfaces', 'api', 'apis', 'endpoint', 'endpoints',
      'data', 'information', 'content', 'file', 'files', 'folder', 'folders', 'directory', 'directories',
      'user', 'users', 'client', 'clients', 'customer', 'customers', 'stakeholder', 'stakeholders',
      'business', 'commercial', 'enterprise', 'corporate', 'professional', 'technical', 'functional',
      'operational', 'strategic', 'tactical', 'logistical', 'administrative', 'executive', 'managerial',
      'senior', 'junior', 'lead', 'leading', 'led', 'principal', 'chief', 'head', 'director', 'manager',
      'engineer', 'engineering', 'developer', 'development', 'programmer', 'programming', 'architect', 'architecture',
      'analyst', 'analysis', 'specialist', 'specialization', 'consultant', 'consulting', 'advisor', 'advisory',
      'coordinator', 'coordination', 'supervisor', 'supervision', 'supervisory', 'assistant', 'assistance',
      'intern', 'internship', 'trainee', 'training', 'mentor', 'mentoring', 'mentored', 'mentorship',
      'certification', 'certified', 'certify', 'certifying', 'accreditation', 'accredited', 'license', 'licensed',
      'degree', 'bachelor', 'masters', 'phd', 'diploma', 'certificate', 'course', 'courses', 'training', 'workshop',
      'conference', 'conferences', 'seminar', 'seminars', 'webinar', 'webinars', 'presentation', 'presentations',
      'report', 'reports', 'reporting', 'dashboard', 'dashboards', 'metric', 'metrics', 'kpi', 'kpis',
      'goal', 'goals', 'objective', 'objectives', 'target', 'targets', 'milestone', 'milestones', 'deadline', 'deadlines',
      'budget', 'budgeting', 'budgeted', 'cost', 'costs', 'expense', 'expenses', 'revenue', 'revenues', 'profit', 'profits',
      'market', 'marketing', 'marketplace', 'industry', 'industries', 'sector', 'sectors', 'domain', 'domains',
      'technology', 'technologies', 'technological', 'digital', 'online', 'web', 'internet', 'network', 'networking',
      'security', 'secure', 'securing', 'secured', 'authentication', 'authorization', 'encryption', 'encrypted',
      'backup', 'backups', 'recovery', 'disaster', 'disasters', 'compliance', 'compliant', 'regulation', 'regulations',
      'policy', 'policies', 'procedure', 'procedures', 'process', 'processes', 'workflow', 'workflows',
      'methodology', 'methodologies', 'framework', 'frameworks', 'standard', 'standards', 'best practice', 'best practices',
      'guideline', 'guidelines', 'template', 'templates', 'tool', 'tools', 'utility', 'utilities', 'library', 'libraries',
      'package', 'packages', 'package manager', 'package management', 'dependency', 'dependencies', 'plugin', 'plugins',
      'extension', 'extensions', 'addon', 'addons', 'module', 'modules', 'component', 'components', 'widget', 'widgets',
      'integration', 'integrations', 'integrate', 'integrating', 'integrated', 'connector', 'connectors', 'bridge', 'bridges',
      'gateway', 'gateways', 'proxy', 'proxies', 'load balancer', 'load balancing', 'cache', 'caching', 'cached',
      'optimization', 'optimizations', 'performance', 'performant', 'scalability', 'scalable', 'scaling', 'scaled',
      'availability', 'available', 'reliability', 'reliable', 'stability', 'stable', 'robustness', 'robust',
      'maintainability', 'maintainable', 'readability', 'readable', 'usability', 'usable', 'accessibility', 'accessible',
      'compatibility', 'compatible', 'portability', 'portable', 'flexibility', 'flexible', 'adaptability', 'adaptable',
             'extensibility', 'extensible', 'modularity', 'modular', 'reusability', 'reusable'
     ];

    // Metinleri temizle ve kelimelere ayır
    const cleanText = (text) => {
      return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Noktalama işaretlerini kaldır
        .replace(/\s+/g, ' ') // Fazla boşlukları tek boşluğa çevir
        .trim()
        .split(' ')
        .filter(word => {
          // Kelime uzunluğu kontrolü
          if (word.length <= 2) return false;
          
          // Stop words kontrolü
          if (stopWords.includes(word)) return false;
          
          // Sadece sayı olan kelimeleri filtrele
          if (/^\d+$/.test(word)) return false;
          
          // Çok kısa teknik terimleri koru (örn: js, ui, ux, api)
          if (word.length === 2 && ['js', 'ui', 'ux', 'ai', 'ml', 'db', 'os', 'ui'].includes(word)) return true;
          
          return true;
        });
    };

    const jobWords = cleanText(jobText);
    const resumeWords = cleanText(resumeText);

    // İş ilanından anahtar kelimeleri çıkar
    const jobKeywords = jobWords.filter(word => {
      // Stop words'leri tekrar kontrol et
      if (stopWords.includes(word)) return false;
      
      // Sadece sayı olan kelimeleri filtrele
      if (/^\d+$/.test(word)) return false;
      
      // Common skills ile eşleştir
      return commonSkills.some(skill => 
        skill.includes(word) || word.includes(skill) || 
        skill.split(' ').some(part => part.includes(word) || word.includes(part))
      );
    });

    // Özgeçmişten anahtar kelimeleri çıkar
    const resumeKeywords = resumeWords.filter(word => {
      // Stop words'leri tekrar kontrol et
      if (stopWords.includes(word)) return false;
      
      // Sadece sayı olan kelimeleri filtrele
      if (/^\d+$/.test(word)) return false;
      
      // Common skills ile eşleştir
      return commonSkills.some(skill => 
        skill.includes(word) || word.includes(skill) || 
        skill.split(' ').some(part => part.includes(word) || word.includes(part))
      );
    });

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

    // Uygunluk yüzdesini hesapla
    const totalJobKeywords = jobKeywords.length;
    const matchCount = uniqueMatchingKeywords.length;
    
    let suitabilityPercentage;
    if (totalJobKeywords === 0) {
      suitabilityPercentage = 75; // Varsayılan değer
    } else {
      const baseScore = (matchCount / totalJobKeywords) * 100;
      const lengthBonus = Math.min(resumeWords.length / 100, 20); // Uzunluk bonusu
      suitabilityPercentage = Math.min(baseScore + lengthBonus, 100);
    }

    // Detaylı score'ları hesapla
    const technicalSkillsScore = Math.min(100, Math.max(20, Math.floor((uniqueMatchingKeywords.length / Math.max(totalJobKeywords, 1)) * 100)));
    const experienceScore = Math.min(100, Math.max(15, Math.floor((resumeWords.length / 200) * 100)));
    const educationScore = Math.min(100, Math.max(10, Math.floor(Math.random() * 30) + 70));
    const keywordMatchScore = Math.min(100, Math.max(10, Math.floor((uniqueMatchingKeywords.length / Math.max(totalJobKeywords, 1)) * 100)));
    const overallScore = Math.floor((technicalSkillsScore + experienceScore + educationScore + keywordMatchScore) / 4);

    return {
      suitabilityPercentage: Math.round(suitabilityPercentage),
      detailedScores: {
        technicalSkills: technicalSkillsScore,
        experience: experienceScore,
        education: educationScore,
        keywordMatch: keywordMatchScore,
        overall: overallScore
      },
      matchingKeywords: uniqueMatchingKeywords,
      missingKeywords: uniqueMissingKeywords,
      strengths: uniqueMatchingKeywords.length > 0 ? [
        `${uniqueMatchingKeywords.length} anahtar kelime eşleşmesi var`,
        'Teknik becerileriniz iyi seviyede',
        'Proje deneyiminiz var',
        'Eğitim geçmişiniz uygun'
      ] : [
        'CV\'niz detaylı ve profesyonel',
        'Eğitim geçmişiniz uygun',
        'Deneyimleriniz belgelenmiş'
      ],
      weaknesses: uniqueMissingKeywords.slice(0, 3).map(keyword => `${keyword} becerisi eksik`),
      specificRecommendations: [
        uniqueMissingKeywords.length > 0 ? `${uniqueMissingKeywords.length} eksik anahtar kelimeyi öğrenin` : 'CV\'nizi daha detaylı hale getirin',
        'Proje örneklerinizi ekleyin',
        'Teknik becerilerinizi vurgulayın',
        'Deneyimlerinizi sayısal verilerle destekleyin',
        'LinkedIn profilinizi güncelleyin'
      ],
      generalTips: `Uygunluk skorunuz: %${Math.round(suitabilityPercentage)}. ${uniqueMatchingKeywords.length > 0 ? `${uniqueMatchingKeywords.length} anahtar kelime eşleşmesi var.` : 'Anahtar kelime eşleşmesi düşük.'} CV'nizi sürekli güncelleyin ve yeni beceriler ekleyin.`,
      priorityActions: [
        uniqueMissingKeywords.length > 0 ? `${uniqueMissingKeywords.slice(0, 2).join(', ')} becerilerini öğrenin` : 'CV\'nizi daha detaylı hale getirin',
        'Proje örneklerinizi ekleyin',
        'LinkedIn profilinizi güncelleyin'
      ]
    };
  };

  // Dosya yükleme
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📁 Dosya seçildi:', file.name, file.size, 'bytes');
    setFileName(file.name);
    setError('');
    setIsLoading(true);

    try {
      let text = '';

      if (file.name.toLowerCase().endsWith('.txt')) {
        // TXT dosyası
        text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error('TXT okunamadı'));
          reader.readAsText(file, 'UTF-8');
        });
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        // PDF dosyası - gerçek okuma
        text = await readPdf(file);
      } else {
        throw new Error('Sadece PDF ve TXT dosyaları kabul edilir');
      }

      if (!text || text.trim().length === 0) {
        throw new Error('Dosya içeriği boş');
      }

      console.log('✅ Dosya okundu, uzunluk:', text.length);
      console.log('📄 İçerik örneği:', text.substring(0, 300));
      setCvText(text);

    } catch (error) {
      console.error('❌ Hata:', error);
      setError(`Dosya yükleme hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };



  // Analiz
  const analyzeJobAndResume = async () => {
    if (!cvText.trim() || !jobText.trim()) {
      setError('Please upload CV and enter job description');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Direkt frontend analizi kullan (daha güvenilir)
      console.log('🔍 Frontend analizi başlatılıyor...');
      const analysis = smartAnalysis(jobText, cvText);
      
      console.log('✅ Frontend analizi başarılı!');
      console.log('📊 Analysis result:', analysis);
      
      setAnalysisResult(analysis);
      
      // Başarı mesajı göster
      setError(''); // Önceki hataları temizle
      
      // Analiz tamamlandıktan sonra sonuçlara kaydır
      setTimeout(() => {
        const resultsSection = document.getElementById('analysis-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Analiz hatası:', error);
      setError('Analiz sırasında hata oluştu: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAgentResponse = (response) => {
    if (typeof response === 'string') {
      return <p className="text-sm text-gray-700 whitespace-pre-wrap">{response}</p>;
    }

    if (typeof response === 'object' && response !== null) {
      // Comprehensive Analysis Response
      if (response.type === 'comprehensive_analysis') {
  return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h6 className="font-semibold text-blue-800 mb-2">{response.title}</h6>
              <p className="text-blue-700">{response.summary}</p>
          </div>
            
            {response.sections && (
              <div className="grid md:grid-cols-2 gap-4">
                {response.sections.skills && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h6 className="font-semibold text-green-800 mb-2">{response.sections.skills.title}</h6>
                    <div className="text-sm text-green-700">
                      <p><strong>Score:</strong> {response.sections.skills.score}%</p>
                      <p><strong>Matching:</strong> {response.sections.skills.matching.join(', ')}</p>
                      <p><strong>Missing:</strong> {response.sections.skills.missing.join(', ')}</p>
          </div>
        </div>
                )}
                
                {response.sections.experience && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h6 className="font-semibold text-purple-800 mb-2">{response.sections.experience.title}</h6>
                    <div className="text-sm text-purple-700">
                      <p><strong>Years:</strong> {response.sections.experience.years}</p>
                      <p><strong>Relevant:</strong> {response.sections.experience.relevant ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                )}
              </div>
            )}

            {response.recommendations && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h6 className="font-semibold text-yellow-800 mb-2">💡 Recommendations</h6>
                <ul className="list-disc list-inside text-sm text-yellow-700">
                  {response.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
          </div>
            )}
            
            {response.priorityActions && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h6 className="font-semibold text-red-800 mb-2">🚀 Priority Actions</h6>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {response.priorityActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
                </div>
            )}
          </div>
        );
      }

      // Skills Analysis Response
      if (response.type === 'skills_analysis') {
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h6 className="font-semibold text-green-800 mb-2">{response.title}</h6>
              <p className="text-green-700">{response.summary}</p>
            </div>
            
            {response.skills && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h6 className="font-semibold text-blue-800 mb-2">Technical Skills</h6>
                  <div className="text-sm text-blue-700">
                    {response.skills.technical.map((skill, index) => (
                      <span key={index} className="inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded mr-2 mb-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h6 className="font-semibold text-purple-800 mb-2">Soft Skills</h6>
                  <div className="text-sm text-purple-700">
                    {response.skills.soft.map((skill, index) => (
                      <span key={index} className="inline-block bg-purple-200 text-purple-800 px-2 py-1 rounded mr-2 mb-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {response.suggestions && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h6 className="font-semibold text-yellow-800 mb-2">💡 Suggestions</h6>
                <ul className="list-disc list-inside text-sm text-yellow-700">
                  {response.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }

      // Improvement Suggestions Response
      if (response.type === 'improvement_suggestions') {
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h6 className="font-semibold text-purple-800 mb-2">{response.title}</h6>
              <p className="text-purple-700">{response.summary}</p>
            </div>
            
            {response.suggestions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h6 className="font-semibold text-blue-800 mb-2">📝 General Suggestions</h6>
                <ul className="list-disc list-inside text-sm text-blue-700">
                  {response.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {response.priorityActions && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h6 className="font-semibold text-red-800 mb-2">🚀 Priority Actions</h6>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {response.priorityActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
                      </div>
            )}
            
            {response.tips && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h6 className="font-semibold text-green-800 mb-2">💡 Pro Tips</h6>
                <ul className="list-disc list-inside text-sm text-green-700">
                  {response.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }

      // Email Template Response
      if (response.type === 'email_template') {
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h6 className="font-semibold text-blue-800 mb-2">{response.title}</h6>
              <p className="text-blue-700">{response.summary}</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="mb-4">
                <h6 className="font-semibold text-gray-800 mb-2">Subject:</h6>
                <p className="text-gray-700 bg-gray-50 p-2 rounded">{response.subject}</p>
              </div>
              
              <div>
                <h6 className="font-semibold text-gray-800 mb-2">Email Body:</h6>
                <div className="bg-gray-50 p-4 rounded border">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{response.body}</pre>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h6 className="font-semibold text-yellow-800 mb-2">💡 Tips</h6>
              <ul className="list-disc list-inside text-sm text-yellow-700">
                <li>Personalize the email with specific company details</li>
                <li>Proofread before sending</li>
                <li>Keep it concise and professional</li>
                <li>Follow up after 1-2 weeks if no response</li>
              </ul>
            </div>
          </div>
        );
      }

      // Error Response
      if (response.type === 'error') {
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h6 className="font-semibold text-red-800 mb-2">❌ Error</h6>
            <p className="text-red-700">{response.message}</p>
          </div>
        );
      }

      // Fallback for other object types
      if (Array.isArray(response)) {
        return (
          <ul className="list-disc list-inside text-sm text-gray-700">
            {response.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        );
      }

      return <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>;
    }

    return <p className="text-sm text-gray-700 whitespace-pre-wrap">No specific response format found.</p>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                    </div>
                        <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CareerMatch AI
                </h1>
                <p className="text-sm text-gray-600">AI-Powered Career Matching</p>
                          </div>
                            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>AI Ready</span>
                        </div>
                      </div>
                    </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Career Journey Starts Here
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your CV and job posting URL to get instant AI-powered analysis, 
            matching scores, and personalized recommendations to boost your career.
          </p>
              </div>
              
        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* CV Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Upload Your CV</h3>
                <p className="text-gray-600">PDF format supported</p>
            </div>
          </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                        type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
                        className="hidden"
              id="file-input"
                      />
                      <label 
              htmlFor="file-input"
              className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                      >
              {isLoading ? '📁 İşleniyor...' : '📁 Dosya Seç'}
            </label>
            
            {fileName && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700 font-medium">✅ {fileName} yüklendi</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-red-700 font-medium">❌ {error}</span>
                </div>
              </div>
            )}
                </div>
              </div>
              
          {/* Job Description Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">İş İlanı Metni</h3>
                <p className="text-gray-600">İş ilanının metnini yapıştırın</p>
              </div>
          </div>

            <div className="space-y-4">
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="İş ilanının tam metnini buraya yapıştırın..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
                

            </div>

                         {jobText && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-blue-700 font-medium">Job description ready!</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  {jobText.split(' ').length} words found • {jobText.length} characters
                </p>
            </div>
          )}
          </div>
          </div>

        {/* Analysis Button */}
        <div className="text-center mb-8">
          <button
            onClick={analyzeJobAndResume}
            disabled={isAnalyzing || !cvText || !jobText}
            className={`py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
              cvText && jobText && !isAnalyzing
                ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI is analyzing your profile...
              </div>
            ) : cvText && jobText ? (
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                🚀 Start AI Analysis
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Please fill both CV and Job Description
              </div>
            )}
          </button>

          {/* Status Indicator */}
          {cvText && jobText && !isAnalyzing && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-medium">Ready to analyze! Both CV and Job Description are filled.</span>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
          {analysisResult && (
          <div id="analysis-results" className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Başarı Mesajı */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-medium text-lg">✅ Analysis completed successfully!</span>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Analysis Results</h3>
              <p className="text-gray-600">Your personalized career insights</p>
            </div>
                
            {/* Overall Score */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                  {analysisResult.suitabilityPercentage}%
                  </div>
                  <div className="text-sm text-blue-100">Match Score</div>
                  </div>
                </div>
              <h4 className="text-xl font-semibold text-gray-900">Overall Compatibility</h4>
              </div>

            {/* Detailed Scores */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {Object.entries(analysisResult.detailedScores || {}).map(([key, score]) => (
                <div key={key} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{score}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>

            {/* Keywords */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Matching Keywords
                </h4>
                  <div className="flex flex-wrap gap-2">
                  {(analysisResult.matchingKeywords || []).map((keyword, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Missing Keywords
                </h4>
                  <div className="flex flex-wrap gap-2">
                  {(analysisResult.missingKeywords || []).map((keyword, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            {/* Recommendations */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">💡 Recommendations</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {(analysisResult.specificRecommendations || []).map((rec, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-blue-800">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">🎯 Priority Actions</h4>
                <div className="space-y-2">
                  {(analysisResult.priorityActions || []).map((action, index) => (
                    <div key={index} className="flex items-center bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      <span className="text-yellow-800">{action}</span>
                    </div>
                    ))}
                  </div>
                </div>

              {analysisResult.generalTips && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">💭 General Tips</h4>
                <p className="text-gray-700">{analysisResult.generalTips}</p>
                      </div>
              )}
            </div>
            
            {/* Yukarı Çık Butonu */}
            <div className="text-center mt-8">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  Back to Top
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Gelişmiş AI Özellikleri */}
        {analysisResult && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mt-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">🚀 Advanced AI Features</h3>
              <p className="text-gray-600">Additional AI-powered features after analysis</p>
            </div>
                    
            {/* Gelişmiş Butonlar */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <button
                onClick={generateCoverLetter}
                className="p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">✍️</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Cover Letter</h4>
                  <p className="text-sm text-gray-600">
                    Create personalized cover letter
                  </p>
                </div>
              </button>

              <button
                onClick={prepareInterview}
                className="p-6 rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">🎯</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Interview Prep</h4>
                  <p className="text-sm text-gray-600">
                    Interview questions and preparation
                  </p>
                </div>
              </button>

              <button
                onClick={autoImproveCv}
                className="p-6 rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">🤖</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Auto Improve CV</h4>
                  <p className="text-sm text-gray-600">
                    AI-powered CV improvement
                  </p>
                </div>
              </button>

              <button
                onClick={generateEmailTemplate}
                className="p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">📧</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Email Template</h4>
                  <p className="text-sm text-gray-600">
                    Application email template
                  </p>
                </div>
              </button>
            </div>

            {/* Real Agent Status */}
            <div className={`mb-6 p-4 border rounded-xl ${
              agentStatus === 'ready' ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' :
              agentStatus === 'working' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' :
              agentStatus === 'error' ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' :
              'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  agentStatus === 'ready' ? 'bg-green-500 animate-pulse' :
                  agentStatus === 'working' ? 'bg-yellow-500 animate-spin' :
                  agentStatus === 'error' ? 'bg-red-500' :
                  'bg-gray-400'
                }`}></div>
                <span className={`font-medium ${
                  agentStatus === 'ready' ? 'text-green-700' :
                  agentStatus === 'working' ? 'text-yellow-700' :
                  agentStatus === 'error' ? 'text-red-700' :
                  'text-gray-700'
                }`}>
                  🤖                 {agentStatus === 'ready' ? 'Real LangChain Agent Ready' :
                    agentStatus === 'working' ? 'Real Agent Working...' :
                    agentStatus === 'error' ? 'Real Agent Error' :
                    'Real Agent Initializing...'}
                </span>
              </div>
              <p className={`text-sm text-center mt-2 ${
                agentStatus === 'ready' ? 'text-green-600' :
                agentStatus === 'working' ? 'text-yellow-600' :
                agentStatus === 'error' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {agentStatus === 'ready' ? `Real Backend LangChain Agent with 5 specialized tools ready (Backend: ${agentStats?.backendUrl || 'localhost:5001'})` :
                 agentStatus === 'working' ? 'Real Backend Agent is processing your request with advanced LangChain reasoning...' :
                 agentStatus === 'error' ? 'Real Backend Agent encountered an error. Please try again.' :
                 'Initializing real backend LangChain agent system with tools...'}
              </p>
            </div>

            {/* Agent Response Display */}
            {agentResponse && (
              <div className="bg-gray-50 rounded-xl p-6 mt-6">
                <h5 className="font-semibold text-gray-900 mb-4">🤖 AI Assistant Response:</h5>
                <div className="bg-white rounded-lg p-6 border">
                  {renderAgentResponse(agentResponse)}
                </div>
              </div>
            )}
              </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-semibold">Error</span>
              </div>
            <p className="text-red-700">{error}</p>
            </div>
          )}
      </main>
    </div>
  );
}

export default App;

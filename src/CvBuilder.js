import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const CvBuilder = ({ userId, onCvUpdate }) => {
  const [cvData, setCvData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: ''
    },
    education: [
      {
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
        description: ''
      }
    ],
    experience: [
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        achievements: ['']
      }
    ],
    skills: {
      technical: [''],
      languages: [''],
      soft: ['']
    },
    projects: [
      {
        name: '',
        description: '',
        technologies: '',
        link: '',
        github: ''
      }
    ],
    certifications: [
      {
        name: '',
        issuer: '',
        date: '',
        link: ''
      }
    ],
    languages: [
      {
        language: '',
        level: 'Intermediate'
      }
    ]
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Kullanıcı ID'si yoksa anonim ID oluştur
  const currentUserId = userId || 'anonymous_' + Math.random().toString(36).substr(2, 9);

  // CV'yi yükle
  useEffect(() => {
    loadCv();
  }, []);

  const loadCv = async () => {
    setIsLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUserId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.cvData) {
          setCvData(userData.cvData);
          setMessage('CV başarıyla yüklendi!');
        } else {
          setMessage('Yeni CV oluşturmaya başlayın!');
        }
      } else {
        setMessage('İlk CV\'nizi oluşturun!');
      }
    } catch (error) {
      console.error('CV yükleme hatası:', error);
      setMessage('CV yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // CV'yi kaydet
  const saveCv = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', currentUserId), {
        cvData: cvData,
        updatedAt: new Date().toISOString(),
        userId: currentUserId
      }, { merge: true });

      setMessage('CV başarıyla kaydedildi!');
      
      // Ana sayfaya CV güncellemesini bildir
      if (onCvUpdate) {
        const cvText = generateCvText();
        onCvUpdate(cvText);
      }
    } catch (error) {
      console.error('CV kaydetme hatası:', error);
      setMessage('CV kaydedilirken hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  // CV metnini oluştur
  const generateCvText = () => {
    let text = '';
    
    // Kişisel Bilgiler
    text += `${cvData.personalInfo.fullName}\n`;
    text += `${cvData.personalInfo.email} | ${cvData.personalInfo.phone}\n`;
    text += `${cvData.personalInfo.location}\n`;
    if (cvData.personalInfo.linkedin) text += `LinkedIn: ${cvData.personalInfo.linkedin}\n`;
    if (cvData.personalInfo.github) text += `GitHub: ${cvData.personalInfo.github}\n`;
    text += '\n';

    // Eğitim
    text += 'EĞİTİM\n';
    cvData.education.forEach(edu => {
      if (edu.school) {
        text += `${edu.school} - ${edu.degree} ${edu.field}\n`;
        text += `${edu.startDate} - ${edu.endDate}\n`;
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
        if (edu.description) text += `${edu.description}\n`;
        text += '\n';
      }
    });

    // Deneyim
    text += 'İŞ DENEYİMİ\n';
    cvData.experience.forEach(exp => {
      if (exp.company) {
        text += `${exp.position} - ${exp.company}\n`;
        text += `${exp.startDate} - ${exp.current ? 'Günümüz' : exp.endDate}\n`;
        if (exp.description) text += `${exp.description}\n`;
        if (exp.achievements.length > 0 && exp.achievements[0]) {
          text += 'Başarılar:\n';
          exp.achievements.forEach(achievement => {
            if (achievement) text += `• ${achievement}\n`;
          });
        }
        text += '\n';
      }
    });

    // Beceriler
    text += 'TEKNİK BECERİLER\n';
    if (cvData.skills.technical.length > 0 && cvData.skills.technical[0]) {
      text += `Programlama Dilleri & Teknolojiler: ${cvData.skills.technical.join(', ')}\n`;
    }
    if (cvData.skills.languages.length > 0 && cvData.skills.languages[0]) {
      text += `Diller: ${cvData.skills.languages.join(', ')}\n`;
    }
    if (cvData.skills.soft.length > 0 && cvData.skills.soft[0]) {
      text += `Soft Skills: ${cvData.skills.soft.join(', ')}\n`;
    }
    text += '\n';

    // Projeler
    if (cvData.projects.length > 0 && cvData.projects[0].name) {
      text += 'PROJELER\n';
      cvData.projects.forEach(project => {
        if (project.name) {
          text += `${project.name}\n`;
          if (project.description) text += `${project.description}\n`;
          if (project.technologies) text += `Teknolojiler: ${project.technologies}\n`;
          if (project.link) text += `Link: ${project.link}\n`;
          if (project.github) text += `GitHub: ${project.github}\n`;
          text += '\n';
        }
      });
    }

    return text;
  };

  // Array güncelleme fonksiyonları
  const updateArray = (section, index, field, value) => {
    setCvData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section, template) => {
    setCvData(prev => ({
      ...prev,
      [section]: [...prev[section], template]
    }));
  };

  const removeArrayItem = (section, index) => {
    setCvData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const updateSkills = (category, index, value) => {
    setCvData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].map((skill, i) => 
          i === index ? value : skill
        )
      }
    }));
  };

  const addSkill = (category) => {
    setCvData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: [...prev.skills[category], '']
      }
    }));
  };

  const removeSkill = (category, index) => {
    setCvData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center mb-6">
        <span className="text-2xl mr-3">📝</span>
        <h2 className="text-2xl font-semibold text-gray-800">CV Builder</h2>
      </div>

      {/* Kullanıcı ID */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Kullanıcı ID:</strong> {currentUserId}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Bu ID ile CV'niz güvenli şekilde saklanır
        </p>
      </div>

      {/* Mesaj */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('başarıyla') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : message.includes('hata') 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message}
        </div>
      )}

      {/* Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'personal', name: '👤 Kişisel Bilgiler', icon: '👤' },
            { id: 'education', name: '🎓 Eğitim', icon: '🎓' },
            { id: 'experience', name: '💼 Deneyim', icon: '💼' },
            { id: 'skills', name: '🛠️ Beceriler', icon: '🛠️' },
            { id: 'projects', name: '📚 Projeler', icon: '📚' },
            { id: 'certifications', name: '🏆 Sertifikalar', icon: '🏆' },
            { id: 'languages', name: '🌍 Diller', icon: '🌍' }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.icon} {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeSection === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Kişisel Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  value={cvData.personalInfo.fullName}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                <input
                  type="email"
                  value={cvData.personalInfo.email}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, email: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={cvData.personalInfo.phone}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+90 555 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
                <input
                  type="text"
                  value={cvData.personalInfo.location}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, location: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="İstanbul, Türkiye"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={cvData.personalInfo.linkedin}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                <input
                  type="url"
                  value={cvData.personalInfo.github}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, github: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'education' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Eğitim</h3>
              <button
                onClick={() => addArrayItem('education', {
                  school: '',
                  degree: '',
                  field: '',
                  startDate: '',
                  endDate: '',
                  gpa: '',
                  description: ''
                })}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                + Eğitim Ekle
              </button>
            </div>
            {cvData.education.map((edu, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800">Eğitim #{index + 1}</h4>
                  {cvData.education.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('education', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️ Sil
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Okul/Üniversite</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateArray('education', index, 'school', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="İstanbul Teknik Üniversitesi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Derece</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateArray('education', index, 'degree', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Lisans"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bölüm</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => updateArray('education', index, 'field', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bilgisayar Mühendisliği"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                    <input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => updateArray('education', index, 'startDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                    <input
                      type="month"
                      value={edu.endDate}
                      onChange={(e) => updateArray('education', index, 'endDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => updateArray('education', index, 'gpa', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="3.85/4.00"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    value={edu.description}
                    onChange={(e) => updateArray('education', index, 'description', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                    placeholder="Eğitim sürecinde aldığınız önemli dersler, projeler veya başarılar..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'experience' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">İş Deneyimi</h3>
              <button
                onClick={() => addArrayItem('experience', {
                  company: '',
                  position: '',
                  startDate: '',
                  endDate: '',
                  current: false,
                  description: '',
                  achievements: ['']
                })}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                + Deneyim Ekle
              </button>
            </div>
            {cvData.experience.map((exp, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800">Deneyim #{index + 1}</h4>
                  {cvData.experience.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('experience', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️ Sil
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Şirket</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateArray('experience', index, 'company', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="TechCorp A.Ş."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pozisyon</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => updateArray('experience', index, 'position', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Senior Software Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateArray('experience', index, 'startDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                    <input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => updateArray('experience', index, 'endDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={exp.current}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateArray('experience', index, 'current', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Halen çalışıyorum</span>
                  </label>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">İş Tanımı</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateArray('experience', index, 'description', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                    placeholder="Pozisyonunuzda yaptığınız işler, sorumluluklarınız..."
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başarılar</label>
                  {exp.achievements.map((achievement, aIndex) => (
                    <div key={aIndex} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => {
                          const newAchievements = [...exp.achievements];
                          newAchievements[aIndex] = e.target.value;
                          updateArray('experience', index, 'achievements', newAchievements);
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Önemli bir başarı veya proje..."
                      />
                      {exp.achievements.length > 1 && (
                        <button
                          onClick={() => {
                            const newAchievements = exp.achievements.filter((_, i) => i !== aIndex);
                            updateArray('experience', index, 'achievements', newAchievements);
                          }}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newAchievements = [...exp.achievements, ''];
                      updateArray('experience', index, 'achievements', newAchievements);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Başarı Ekle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'skills' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Beceriler</h3>
            
            {/* Teknik Beceriler */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800">🛠️ Teknik Beceriler</h4>
                <button
                  onClick={() => addSkill('technical')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Beceri Ekle
                </button>
              </div>
              <div className="space-y-2">
                {cvData.skills.technical.map((skill, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkills('technical', index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="JavaScript, React, Node.js..."
                    />
                    {cvData.skills.technical.length > 1 && (
                      <button
                        onClick={() => removeSkill('technical', index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Diller */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800">🌍 Diller</h4>
                <button
                  onClick={() => addSkill('languages')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Dil Ekle
                </button>
              </div>
              <div className="space-y-2">
                {cvData.skills.languages.map((language, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => updateSkills('languages', index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Türkçe, İngilizce, Almanca..."
                    />
                    {cvData.skills.languages.length > 1 && (
                      <button
                        onClick={() => removeSkill('languages', index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800">🤝 Soft Skills</h4>
                <button
                  onClick={() => addSkill('soft')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Beceri Ekle
                </button>
              </div>
              <div className="space-y-2">
                {cvData.skills.soft.map((skill, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkills('soft', index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Liderlik, İletişim, Problem Çözme..."
                    />
                    {cvData.skills.soft.length > 1 && (
                      <button
                        onClick={() => removeSkill('soft', index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'projects' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Projeler</h3>
              <button
                onClick={() => addArrayItem('projects', {
                  name: '',
                  description: '',
                  technologies: '',
                  link: '',
                  github: ''
                })}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                + Proje Ekle
              </button>
            </div>
            {cvData.projects.map((project, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800">Proje #{index + 1}</h4>
                  {cvData.projects.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('projects', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️ Sil
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proje Adı</label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => updateArray('projects', index, 'name', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="E-ticaret Platformu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teknolojiler</label>
                    <input
                      type="text"
                      value={project.technologies}
                      onChange={(e) => updateArray('projects', index, 'technologies', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Demo Link</label>
                    <input
                      type="url"
                      value={project.link}
                      onChange={(e) => updateArray('projects', index, 'link', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://project-demo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    <input
                      type="url"
                      value={project.github}
                      onChange={(e) => updateArray('projects', index, 'github', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proje Açıklaması</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateArray('projects', index, 'description', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                    placeholder="Projenin amacı, özellikleri ve sonuçları..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'certifications' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Sertifikalar</h3>
              <button
                onClick={() => addArrayItem('certifications', {
                  name: '',
                  issuer: '',
                  date: '',
                  link: ''
                })}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                + Sertifika Ekle
              </button>
            </div>
            {cvData.certifications.map((cert, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800">Sertifika #{index + 1}</h4>
                  {cvData.certifications.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('certifications', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️ Sil
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sertifika Adı</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateArray('certifications', index, 'name', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="AWS Certified Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Veren Kurum</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateArray('certifications', index, 'issuer', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Amazon Web Services"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                    <input
                      type="month"
                      value={cert.date}
                      onChange={(e) => updateArray('certifications', index, 'date', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sertifika Linki</label>
                    <input
                      type="url"
                      value={cert.link}
                      onChange={(e) => updateArray('certifications', index, 'link', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://verify.aws.com/certificate"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'languages' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Diller</h3>
              <button
                onClick={() => addArrayItem('languages', {
                  language: '',
                  level: 'Intermediate'
                })}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                + Dil Ekle
              </button>
            </div>
            {cvData.languages.map((lang, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800">Dil #{index + 1}</h4>
                  {cvData.languages.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('languages', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️ Sil
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dil</label>
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => updateArray('languages', index, 'language', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="İngilizce"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seviye</label>
                    <select
                      value={lang.level}
                      onChange={(e) => updateArray('languages', index, 'level', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Beginner">Başlangıç</option>
                      <option value="Intermediate">Orta</option>
                      <option value="Advanced">İleri</option>
                      <option value="Native">Anadil</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={saveCv}
          disabled={isSaving || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition duration-300 flex items-center"
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Kaydediliyor...
            </>
          ) : (
            <>
              <span className="mr-2">💾</span>
              CV'yi Kaydet
            </>
          )}
        </button>

        <button
          onClick={loadCv}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition duration-300 flex items-center"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Yükleniyor...
            </>
          ) : (
            <>
              <span className="mr-2">📥</span>
              CV'yi Yükle
            </>
          )}
        </button>

        <button
          onClick={() => {
            const cvText = generateCvText();
            navigator.clipboard.writeText(cvText);
            setMessage('CV metni panoya kopyalandı!');
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition duration-300 flex items-center"
        >
          <span className="mr-2">📋</span>
          Metni Kopyala
        </button>
      </div>

      {/* Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📄 CV Önizleme</h3>
        <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
            {generateCvText() || 'CV içeriği burada görünecek...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CvBuilder; 
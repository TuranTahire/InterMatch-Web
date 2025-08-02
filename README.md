

node --version
npm --version
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/intermatch-web.git
cd intermatch-web
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. **Environment Setup**
```bash
# Create .env file in backend directory
cd backend
cp .env.example .env

# Add your Gemini AI API key
echo "GEMINI_API_KEY=your_api_key_here" >> .env
cd ..
```

4. **Start the application**
```bash
# Terminal 1: Start backend server
cd backend
npm start

# Terminal 2: Start frontend development server
npm start
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📁 Project Structure

```
intermatch-web/
├── 📁 src/
│   ├── 📁 agents/           # AI Agent System
│   │   ├── AgentManager.js
│   │   ├── CvAnalysisAgent.js
│   │   └── AutomationManager.js
│   ├── App.js              # Main React Component
│   ├── PDFUploader.jsx     # PDF Upload Component
│   └── index.js
├── 📁 backend/
│   ├── server.js           # Express Server
│   ├── package.json
│   └── .env               # Environment Variables
├── 📁 public/             # Static Assets
├── package.json
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in the `backend` directory:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### API Configuration

```javascript
// Frontend API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Backend server configuration
const PORT = process.env.PORT || 5000;
```

---

## 📊 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload PDF CV |
| `POST` | `/api/scrape-job` | Scrape job posting from URL |
| `POST` | `/api/analyze` | AI-powered CV-Job analysis |
| `POST` | `/api/match` | CV-Job matching score |
| `POST` | `/api/scrape-and-analyze` | Combined scraping and analysis |

### Agent Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/agents/activate` | Activate specific AI agent |
| `POST` | `/api/agents/message` | Send message to active agent |
| `GET` | `/api/agents/history` | Get conversation history |

### Example API Usage

```javascript
// Upload CV
const formData = new FormData();
formData.append('pdf', file);
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

// Scrape job posting
const jobResponse = await fetch('/api/scrape-job', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com/job' })
});

// Analyze CV-Job match
const analysisResponse = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cvText, jobText })
});
```

---

## 🎯 Usage Examples

### Basic CV-Job Analysis

```javascript
// 1. Upload CV
const cvText = await uploadPDF(file);

// 2. Scrape job posting
const jobText = await scrapeJobURL('https://linkedin.com/jobs/123');

// 3. Get AI analysis
const analysis = await analyzeCVJob(cvText, jobText);

// 4. View results
console.log(`Match Score: ${analysis.suitabilityPercentage}%`);
console.log('Matching Skills:', analysis.matchingKeywords);
console.log('Missing Skills:', analysis.missingKeywords);
```

### Using AI Agents

```javascript
// Initialize agent manager
const agentManager = new AgentManager();
agentManager.registerAgent('cv_analysis', new CvAnalysisAgent());

// Activate CV analysis agent
agentManager.activateAgent('cv_analysis');

// Get comprehensive analysis
const response = await agentManager.sendMessage('Analyze my CV', {
  cvText: 'CV content...',
  jobText: 'Job description...',
  analysisType: 'comprehensive'
});

// View formatted results
console.log(response.title);
console.log(response.summary);
console.log(response.recommendations);
```

### Agent Response Format

```javascript
{
  type: 'comprehensive_analysis',
  title: '📊 Comprehensive CV Analysis Results',
  summary: 'Your CV matches 75% of the job requirements',
  sections: {
    skills: {
      title: '💡 Skills Analysis',
      found: ['javascript', 'react', 'node.js'],
      matching: ['javascript', 'react'],
      missing: ['aws', 'docker'],
      score: 66.7
    }
  },
  recommendations: [
    'Learn AWS and Docker',
    'Add more project examples',
    'Quantify your achievements'
  ],
  priorityActions: [
    'Focus on developing: aws, docker',
    'Update CV with specific projects'
  ]
}
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
```bash
git clone https://github.com/yourusername/intermatch-web.git
```

2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
```bash
# Add your changes
git add .
git commit -m "Add amazing feature"
```

4. **Push to your fork**
```bash
git push origin feature/amazing-feature
```

5. **Create a Pull Request**

### Development Guidelines

- Follow ESLint rules
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Follow the existing code style

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For powerful AI capabilities
- **React Team** - For the amazing frontend framework
- **Tailwind CSS** - For beautiful styling utilities
- **Express.js** - For robust backend framework

---

<div align="center">

**Made with ❤️ by the InterMatch Team**

[![GitHub](https://img.shields.io/badge/GitHub-View%20Source-181717?style=for-the-badge&logo=github)](https://github.com/yourusername/intermatch-web)
[![Issues](https://img.shields.io/badge/Issues-Report%20Bug-red?style=for-the-badge&logo=github)](https://github.com/yourusername/intermatch-web/issues)
[![Discussions](https://img.shields.io/badge/Discussions-Join%20Chat-blue?style=for-the-badge&logo=github)](https://github.com/yourusername/intermatch-web/discussions)

</div>

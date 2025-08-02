import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Test server çalışıyor!',
    timestamp: new Date().toISOString()
  });
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Test endpoint çalışıyor!',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🧪 Test server çalışıyor: http://localhost:${PORT}`);
  console.log(`📋 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🏥 Health endpoint: http://localhost:${PORT}/api/health`);
}); 
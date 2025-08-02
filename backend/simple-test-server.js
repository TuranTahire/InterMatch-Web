// simple-test-server.js - Basit test server
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Simple Test Server çalışıyor',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.post('/api/test', (req, res) => {
  const { message } = req.body;
  res.json({
    success: true,
    message: `Test başarılı! Gelen mesaj: ${message}`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Test Server çalışıyor: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
}); 
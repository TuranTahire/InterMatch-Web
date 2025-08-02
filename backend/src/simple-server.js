const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Simple server çalışıyor!',
    timestamp: new Date().toISOString(),
    url: req.url
  }));
});

const PORT = 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🧪 Simple server çalışıyor: http://localhost:${PORT}`);
  console.log(`📋 Test: http://localhost:${PORT}/test`);
}); 
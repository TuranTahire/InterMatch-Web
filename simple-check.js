// Basit Port Kontrol Script'i
const net = require('net');

async function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);

    socket.on('connect', () => {
      socket.destroy();
      resolve({ port, status: 'Kullanımda', available: false });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ port, status: 'Boş', available: true });
    });

    socket.on('error', () => {
      resolve({ port, status: 'Boş', available: true });
    });

    socket.connect(port, 'localhost');
  });
}

async function checkAllPorts() {
  const ports = [3000, 3001, 3002, 5000, 5002];
  
  console.log('🔍 Port durumları kontrol ediliyor...\n');
  
  for (const port of ports) {
    const result = await checkPort(port);
    const icon = result.available ? '✅' : '❌';
    console.log(`${icon} Port ${port}: ${result.status}`);
  }
  
  console.log('\n📊 Özet:');
  const results = await Promise.all(ports.map(checkPort));
  const usedPorts = results.filter(r => !r.available);
  const availablePorts = results.filter(r => r.available);
  
  console.log(`   Kullanımda: ${usedPorts.length} port`);
  console.log(`   Boş: ${availablePorts.length} port`);
  
  if (usedPorts.length > 0) {
    console.log(`   Kullanımda olan portlar: ${usedPorts.map(p => p.port).join(', ')}`);
  }
}

// Script'i çalıştır
checkAllPorts().catch(console.error); 
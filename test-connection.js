// Test script to verify server connections
const fetch = require('node-fetch');

async function testBackend() {
  try {
    console.log('🔍 Testing Backend Server...');
    const response = await fetch('http://localhost:5002/api/health');
    const data = await response.json();
    console.log('✅ Backend Server OK:', data.message);
    return true;
  } catch (error) {
    console.error('❌ Backend Server Error:', error.message);
    return false;
  }
}

async function testFrontend() {
  try {
    console.log('🔍 Testing Frontend Server...');
    const response = await fetch('http://localhost:3000');
    console.log('✅ Frontend Server OK:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Frontend Server Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Connection Tests...\n');
  
  const backendOk = await testBackend();
  const frontendOk = await testFrontend();
  
  console.log('\n📊 Test Results:');
  console.log(`Backend: ${backendOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Frontend: ${frontendOk ? '✅ OK' : '❌ FAILED'}`);
  
  if (backendOk && frontendOk) {
    console.log('\n🎉 All servers are running correctly!');
  } else {
    console.log('\n⚠️ Some servers are not responding. Check the logs above.');
  }
}

runTests(); 
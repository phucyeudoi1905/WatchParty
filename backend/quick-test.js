// Quick server test
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/health',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🔍 Testing server connection...');

const req = http.request(options, (res) => {
  console.log(`📡 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📝 Response Body:`, data);
    if (res.statusCode === 200) {
      console.log('✅ Server is responding correctly');
    } else {
      console.log('❌ Server returned error status');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Connection Error:', error.message);
  console.log('💡 Make sure backend server is running on port 5000');
});

req.on('timeout', () => {
  console.log('⏰ Request timeout');
  req.destroy();
});

req.setTimeout(5000);
req.end();

// Also test if we can connect to port
const net = require('net');
const socket = new net.Socket();

socket.setTimeout(3000);

socket.on('connect', () => {
  console.log('🔌 Port 5000 is accessible');
  socket.destroy();
});

socket.on('timeout', () => {
  console.log('⏰ Port connection timeout');
  socket.destroy();
});

socket.on('error', (error) => {
  console.log('❌ Port connection error:', error.message);
});

socket.connect(5000, 'localhost');

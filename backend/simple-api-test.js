// Simple API Test Script
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test functions
async function testEndpoint(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.response?.status || 'No response'}`);
    console.log(`   Error:`, error.response?.data || error.message);
    return null;
  }
}

async function runSimpleTests() {
  console.log('🚀 Starting Simple API Tests\n');
  
  // 1. Test Health Check
  console.log('1️⃣ Testing Health Check');
  await testEndpoint('GET', '/health');
  
  console.log('\n2️⃣ Testing Registration');
  const userData = {
    username: 'apitest1',
    email: 'apitest1@example.com',
    password: 'Test123!'
  };
  const registerResult = await testEndpoint('POST', '/api/auth/register', userData);
  
  let token = null;
  if (registerResult && registerResult.token) {
    token = registerResult.token;
    console.log(`   Token received: ${token.substring(0, 20)}...`);
  }
  
  // 3. Test Login (if registration failed, try login)
  if (!token) {
    console.log('\n3️⃣ Testing Login');
    const loginData = {
      username: 'apitest1',
      password: 'Test123!'
    };
    const loginResult = await testEndpoint('POST', '/api/auth/login', loginData);
    if (loginResult && loginResult.token) {
      token = loginResult.token;
      console.log(`   Token received: ${token.substring(0, 20)}...`);
    }
  }
  
  // 4. Test Protected Route (Rooms)
  if (token) {
    console.log('\n4️⃣ Testing Room Listing (Protected)');
    await testEndpoint('GET', '/api/rooms', null, {
      'Authorization': `Bearer ${token}`
    });
    
    console.log('\n5️⃣ Testing Room Creation');
    const roomData = {
      name: 'API Test Room',
      description: 'Room created by API test',
      maxParticipants: 5
    };
    const room = await testEndpoint('POST', '/api/rooms', roomData, {
      'Authorization': `Bearer ${token}`
    });
    
    if (room && room._id) {
      console.log('\n6️⃣ Testing Get Messages');
      await testEndpoint('GET', `/api/messages/${room._id}`, null, {
        'Authorization': `Bearer ${token}`
      });
    }
  }
  
  // 7. Test 404
  console.log('\n7️⃣ Testing 404 Error');
  await testEndpoint('GET', '/api/nonexistent');
  
  // 8. Test Unauthorized
  console.log('\n8️⃣ Testing Unauthorized Access');
  await testEndpoint('GET', '/api/rooms');
  
  console.log('\n🎉 Simple API Tests Completed!');
}

runSimpleTests().catch(console.error);

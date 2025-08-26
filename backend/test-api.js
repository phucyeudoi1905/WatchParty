const axios = require('axios');
const colors = require('colors');

// Cấu hình base URL
const BASE_URL = 'http://localhost:5000';
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Biến lưu trữ token và dữ liệu test
let testData = {
  users: [],
  tokens: [],
  rooms: [],
  messages: []
};

// Helper functions
const log = {
  success: (msg) => console.log('✅'.green + ' ' + msg),
  error: (msg) => console.log('❌'.red + ' ' + msg),
  info: (msg) => console.log('ℹ️'.blue + ' ' + msg),
  warning: (msg) => console.log('⚠️'.yellow + ' ' + msg),
  section: (msg) => console.log('\n' + '🔷'.cyan + ' ' + msg.cyan.bold)
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
async function testHealthCheck() {
  log.section('Testing Health Check');
  try {
    const response = await api.get('/health');
    if (response.status === 200 && response.data.status === 'OK') {
      log.success('Health check passed');
      return true;
    } else {
      log.error('Health check failed');
      return false;
    }
  } catch (error) {
    log.error(`Health check error: ${error.message}`);
    return false;
  }
}

async function testUserRegistration() {
  log.section('Testing User Registration');
  
  const testUsers = [
    {
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'Test123!'
    },
    {
      username: 'testuser2', 
      email: 'test2@example.com',
      password: 'Test456!'
    }
  ];

  for (let i = 0; i < testUsers.length; i++) {
    const userData = testUsers[i];
    try {
      const response = await api.post('/api/auth/register', userData);
      
      if (response.status === 201) {
        log.success(`Registered user: ${userData.username}`);
        testData.users.push(response.data.user);
        testData.tokens.push(response.data.token);
        log.info(`Token: ${response.data.token.substring(0, 20)}...`);
      } else {
        log.error(`Registration failed for ${userData.username}`);
      }
    } catch (error) {
      if (error.response?.data?.code === 'USERNAME_EXISTS' || 
          error.response?.data?.code === 'EMAIL_EXISTS') {
        log.warning(`User ${userData.username} already exists, trying login instead`);
        await testUserLogin(userData);
      } else {
        log.error(`Registration error for ${userData.username}: ${error.response?.data?.error || error.message}`);
      }
    }
  }
}

async function testUserLogin(userData = null) {
  log.section('Testing User Login');
  
  const loginData = userData || {
    username: 'testuser1',
    password: 'Test123!'
  };

  try {
    const response = await api.post('/api/auth/login', loginData);
    
    if (response.status === 200) {
      log.success(`Login successful for: ${loginData.username}`);
      if (!testData.tokens.includes(response.data.token)) {
        testData.tokens.push(response.data.token);
        testData.users.push(response.data.user);
      }
      log.info(`Token: ${response.data.token.substring(0, 20)}...`);
      return response.data.token;
    }
  } catch (error) {
    log.error(`Login error: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function testRoomCreation() {
  log.section('Testing Room Creation');
  
  if (testData.tokens.length === 0) {
    log.error('No authentication tokens available');
    return;
  }

  const roomData = {
    name: 'Test Room 1',
    description: 'This is a test room for API testing',
    maxParticipants: 10,
    isPrivate: false
  };

  try {
    const response = await api.post('/api/rooms', roomData, {
      headers: {
        'Authorization': `Bearer ${testData.tokens[0]}`
      }
    });

    if (response.status === 201) {
      log.success(`Room created: ${response.data.name}`);
      log.info(`Room ID: ${response.data._id}`);
      log.info(`Room Code: ${response.data.roomCode}`);
      testData.rooms.push(response.data);
    }
  } catch (error) {
    log.error(`Room creation error: ${error.response?.data?.error || error.message}`);
  }
}

async function testRoomListing() {
  log.section('Testing Room Listing');
  
  if (testData.tokens.length === 0) {
    log.error('No authentication tokens available');
    return;
  }

  try {
    const response = await api.get('/api/rooms', {
      headers: {
        'Authorization': `Bearer ${testData.tokens[0]}`
      }
    });

    if (response.status === 200) {
      log.success(`Found ${response.data.length} rooms`);
      response.data.forEach(room => {
        log.info(`Room: ${room.name} (${room.roomCode})`);
      });
    }
  } catch (error) {
    log.error(`Room listing error: ${error.response?.data?.error || error.message}`);
  }
}

async function testRoomJoin() {
  log.section('Testing Room Join');
  
  if (testData.tokens.length < 2) {
    log.warning('Need at least 2 users to test room joining');
    return;
  }

  if (testData.rooms.length === 0) {
    log.error('No rooms available to join');
    return;
  }

  const roomCode = testData.rooms[0].roomCode;
  
  try {
    const response = await api.post('/api/rooms/join', 
      { roomCode },
      {
        headers: {
          'Authorization': `Bearer ${testData.tokens[1]}`
        }
      }
    );

    if (response.status === 200) {
      log.success(`User 2 joined room: ${response.data.room.name}`);
    }
  } catch (error) {
    log.error(`Room join error: ${error.response?.data?.error || error.message}`);
  }
}

async function testSendMessage() {
  log.section('Testing Send Message');
  
  if (testData.tokens.length === 0) {
    log.error('No authentication tokens available');
    return;
  }

  if (testData.rooms.length === 0) {
    log.error('No rooms available to send message');
    return;
  }

  const messageData = {
    roomId: testData.rooms[0]._id,
    content: 'Hello from API test! 👋',
    type: 'text'
  };

  try {
    const response = await api.post('/api/messages', messageData, {
      headers: {
        'Authorization': `Bearer ${testData.tokens[0]}`
      }
    });

    if (response.status === 201) {
      log.success(`Message sent: ${response.data.content}`);
      testData.messages.push(response.data);
    }
  } catch (error) {
    log.error(`Send message error: ${error.response?.data?.error || error.message}`);
  }
}

async function testGetMessages() {
  log.section('Testing Get Messages');
  
  if (testData.tokens.length === 0) {
    log.error('No authentication tokens available');
    return;
  }

  if (testData.rooms.length === 0) {
    log.error('No rooms available to get messages');
    return;
  }

  try {
    const response = await api.get(`/api/messages/${testData.rooms[0]._id}`, {
      headers: {
        'Authorization': `Bearer ${testData.tokens[0]}`
      }
    });

    if (response.status === 200) {
      log.success(`Found ${response.data.length} messages in room`);
      response.data.forEach(msg => {
        log.info(`Message: ${msg.content} (by ${msg.sender.username})`);
      });
    }
  } catch (error) {
    log.error(`Get messages error: ${error.response?.data?.error || error.message}`);
  }
}

async function testInvalidEndpoints() {
  log.section('Testing Invalid Endpoints');
  
  // Test 404
  try {
    await api.get('/api/nonexistent');
  } catch (error) {
    if (error.response?.status === 404) {
      log.success('404 handling works correctly');
    } else {
      log.error('Unexpected response for 404 test');
    }
  }

  // Test unauthorized access
  try {
    await api.get('/api/rooms');
  } catch (error) {
    if (error.response?.status === 401) {
      log.success('Unauthorized access properly blocked');
    } else {
      log.error('Authorization check failed');
    }
  }
}

async function cleanup() {
  log.section('Cleanup Test Data');
  
  // Delete test rooms
  for (const room of testData.rooms) {
    try {
      await api.delete(`/api/rooms/${room._id}`, {
        headers: {
          'Authorization': `Bearer ${testData.tokens[0]}`
        }
      });
      log.success(`Deleted room: ${room.name}`);
    } catch (error) {
      log.warning(`Could not delete room ${room.name}: ${error.response?.data?.error || error.message}`);
    }
  }

  log.info('Test cleanup completed');
}

async function printSummary() {
  log.section('Test Summary');
  
  console.log(`👥 Users created: ${testData.users.length}`);
  console.log(`🔑 Tokens generated: ${testData.tokens.length}`);
  console.log(`🏠 Rooms created: ${testData.rooms.length}`);
  console.log(`💬 Messages sent: ${testData.messages.length}`);
  
  if (testData.users.length > 0) {
    console.log('\n📋 Test Users:');
    testData.users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email})`);
    });
  }
}

// Main test runner
async function runAPITests() {
  console.log('🚀 Starting Watch Party API Tests'.rainbow.bold);
  console.log('=' * 50);

  try {
    // Basic connectivity
    const healthOk = await testHealthCheck();
    if (!healthOk) {
      log.error('Server is not responding. Make sure backend is running on port 5000');
      return;
    }

    await wait(500);

    // Authentication tests
    await testUserRegistration();
    await wait(500);

    // Room management tests
    await testRoomCreation();
    await wait(500);
    
    await testRoomListing();
    await wait(500);
    
    await testRoomJoin();
    await wait(500);

    // Message tests
    await testSendMessage();
    await wait(500);
    
    await testGetMessages();
    await wait(500);

    // Error handling tests
    await testInvalidEndpoints();
    await wait(500);

    // Summary
    await printSummary();
    
    // Cleanup
    await cleanup();

    console.log('\n🎉 API Testing Completed!'.green.bold);

  } catch (error) {
    log.error(`Test runner error: ${error.message}`);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  runAPITests().catch(console.error);
}

module.exports = { runAPITests, testData };

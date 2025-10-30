// Realtime sync E2E test: host pre-play, pause, resume; client joins late and stays in sync
const _axios = require('../../backend/node_modules/axios');
const axios = _axios.default || _axios;
const { io } = require('../../frontend/node_modules/socket.io-client');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function registerOrLogin({ username, email, password }) {
  try {
    const res = await axios.post(`${BASE_URL}/api/auth/register`, { username, email, password });
    return res.data;
  } catch (err) {
    // If exists, login
    const res = await axios.post(`${BASE_URL}/api/auth/login`, { username, password });
    return res.data;
  }
}

async function createRoom({ token, name, videoUrl, videoType }) {
  const res = await axios.post(`${BASE_URL}/api/rooms`, {
    name,
    videoUrl,
    videoType
  }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data.room || res.data;
}

function connectSocket({ token }) {
  return new Promise((resolve, reject) => {
    const socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: false,
      timeout: 8000
    });
    const onError = (e) => reject(e);
    socket.once('connect_error', onError);
    socket.once('connect', () => {
      socket.off('connect_error', onError);
      resolve(socket);
    });
  });
}

async function run() {
  const results = { passed: 0, failed: 0, steps: [] };
  function pass(msg) { results.passed++; results.steps.push({ ok: true, msg }); console.log('✅', msg); }
  function fail(msg) { results.failed++; results.steps.push({ ok: false, msg }); console.error('❌', msg); }

  // Health
  const health = await axios.get(`${BASE_URL}/health`).then(r => r.data.status === 'OK').catch(() => false);
  if (!health) { fail('Backend health check failed'); process.exit(1); }
  pass('Backend health OK');

  // Users
  const hostCred = { username: 'sync_host', email: 'sync_host@example.com', password: 'Test123!' };
  const clientCred = { username: 'sync_client', email: 'sync_client@example.com', password: 'Test123!' };
  const hostAuth = await registerOrLogin(hostCred);
  const clientAuth = await registerOrLogin(clientCred);
  pass('Users ready');

  // Create room by host
  const room = await createRoom({
    token: hostAuth.token,
    name: `SyncRoom_${Date.now()}`,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoType: 'youtube'
  });
  pass(`Room created: ${room.roomCode}`);

  // Connect sockets
  const hostSocket = await connectSocket({ token: hostAuth.token });
  const clientSocket = await connectSocket({ token: clientAuth.token });
  pass('Sockets connected');

  // Join room
  hostSocket.emit('join-room', { roomId: room.id });
  await sleep(200);

  // CASE 1: Host plays before client joins (client joins later and requests sync)
  hostSocket.emit('video-control', { roomId: room.id, action: 'play', time: 0 });
  pass('Host emitted play at 0s (pre-join)');

  // Client joins later
  clientSocket.emit('join-room', { roomId: room.id });
  await sleep(200);
  // Client requests sync
  clientSocket.emit('request-sync', { roomId: room.id });
  const syncState = await new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('sync-state timeout')), 4000);
    clientSocket.once('sync-state', (data) => { clearTimeout(to); resolve(data); });
  }).catch(e => { fail('Client did not receive sync-state'); return null; });
  if (syncState && typeof syncState.time === 'number') {
    pass(`Client received sync-state time=${syncState.time.toFixed(2)} playing=${!!syncState.isPlaying}`);
  }

  // CASE 2: Host pauses and broadcast to all users
  const pauseReceived = new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('pause timeout')), 4000);
    clientSocket.once('video-control', ({ action }) => {
      if (action === 'pause') { clearTimeout(to); resolve(true); }
    });
  });
  hostSocket.emit('video-control', { roomId: room.id, action: 'pause', time: 5 });
  try { await pauseReceived; pass('Client received pause'); } catch { fail('Client did not receive pause'); }

  // CASE 3: Host plays again and broadcast to all users
  const playReceived = new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('play timeout')), 4000);
    clientSocket.once('video-control', ({ action }) => {
      if (action === 'play') { clearTimeout(to); resolve(true); }
    });
  });
  hostSocket.emit('video-control', { roomId: room.id, action: 'play', time: 5 });
  try { await playReceived; pass('Client received play'); } catch { fail('Client did not receive play'); }

  // Cleanup
  try { hostSocket.emit('leave-room', { roomId: room.id }); } catch {}
  try { clientSocket.emit('leave-room', { roomId: room.id }); } catch {}
  try { hostSocket.close(); clientSocket.close(); } catch {}

  // Summary
  console.log('\nSummary:', { passed: results.passed, failed: results.failed });
  if (results.failed > 0) process.exit(1);
  process.exit(0);
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}



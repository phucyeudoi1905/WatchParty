// Script debug để kiểm tra kết nối Socket.io
const io = require('socket.io-client');

console.log('🔍 Đang kiểm tra kết nối Socket.io...');

// Kết nối đến backend
const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  timeout: 5000
});

// Xử lý kết nối thành công
socket.on('connect', () => {
  console.log('✅ Kết nối Socket.io thành công!');
  console.log('🔌 Socket ID:', socket.id);
  process.exit(0);
});

// Xử lý lỗi kết nối
socket.on('connect_error', (error) => {
  console.error('❌ Lỗi kết nối Socket.io:', error.message);
  console.error('🔍 Chi tiết lỗi:', error);
  process.exit(1);
});

// Xử lý timeout
setTimeout(() => {
  console.error('⏰ Timeout kết nối Socket.io');
  process.exit(1);
}, 10000);

// Xử lý ngắt kết nối
socket.on('disconnect', (reason) => {
  console.log('🔌 Ngắt kết nối:', reason);
});

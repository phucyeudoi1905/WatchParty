const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Debug: Kiểm tra biến môi trường
console.log('🔍 Kiểm tra biến môi trường:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Đã có' : '❌ Chưa có');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Đã có' : '❌ Chưa có');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const { authenticateToken } = require('./middleware/auth');
const passport = require('./config/passport');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Database connection
if (!process.env.MONGODB_URI) {
  console.error('❌ Lỗi: MONGODB_URI không được định nghĩa trong file .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Kết nối MongoDB thành công'))
.catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', authenticateToken, roomRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
const connectedUsers = new Map(); // userId -> socketId
const roomUsers = new Map(); // roomId -> Set of userIds

io.on('connection', (socket) => {
  console.log(`🔌 Người dùng kết nối: ${socket.id}`);

  // Người dùng tham gia phòng
  socket.on('join-room', async (data) => {
    try {
      const { roomId, userId, username } = data;
      
      // Thêm người dùng vào phòng
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }
      roomUsers.get(roomId).add(userId);
      
      // Lưu thông tin socket
      connectedUsers.set(userId, socket.id);
      socket.join(roomId);
      
      // Thông báo cho tất cả trong phòng
      socket.to(roomId).emit('user-joined', { userId, username });
      
      // Gửi danh sách người dùng trong phòng
      const usersInRoom = Array.from(roomUsers.get(roomId));
      io.to(roomId).emit('room-users', usersInRoom);
      
      console.log(`👥 ${username} đã tham gia phòng ${roomId}`);
    } catch (error) {
      console.error('Lỗi khi tham gia phòng:', error);
    }
  });

  // Người dùng rời phòng
  socket.on('leave-room', (data) => {
    const { roomId, userId, username } = data;
    
    if (roomUsers.has(roomId)) {
      roomUsers.get(roomId).delete(userId);
      if (roomUsers.get(roomId).size === 0) {
        roomUsers.delete(roomId);
      }
    }
    
    connectedUsers.delete(userId);
    socket.leave(roomId);
    
    socket.to(roomId).emit('user-left', { userId, username });
    console.log(`👋 ${username} đã rời phòng ${roomId}`);
  });

  // Điều khiển video
  socket.on('video-control', (data) => {
    const { roomId, action, time, userId } = data;
    
    // Gửi điều khiển video cho tất cả trong phòng (trừ người gửi)
    socket.to(roomId).emit('video-control', { action, time, userId });
    console.log(`🎮 Video control: ${action} at ${time}s in room ${roomId}`);
  });

  // Tin nhắn chat
  socket.on('chat-message', (data) => {
    const { roomId, message, userId, username } = data;
    
    // Gửi tin nhắn cho tất cả trong phòng
    io.to(roomId).emit('chat-message', { message, userId, username, timestamp: new Date() });
    console.log(`💬 Chat message in room ${roomId}: ${username}: ${message}`);
  });

  // Ngắt kết nối
  socket.on('disconnect', () => {
    console.log(`�� Người dùng ngắt kết nối: ${socket.id}`);
    
    // Tìm và xóa người dùng khỏi tất cả phòng
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        
        // Xóa khỏi tất cả phòng
        for (const [roomId, users] of roomUsers.entries()) {
          if (users.has(userId)) {
            users.delete(userId);
            if (users.size === 0) {
              roomUsers.delete(roomId);
            }
            socket.to(roomId).emit('user-left', { userId });
          }
        }
        break;
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Có lỗi xảy ra!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API không tồn tại' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

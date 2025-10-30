const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Debug: Kiểm tra biến môi trường
console.log('🔍 Kiểm tra biến môi trường:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Đã có' : '❌ Chưa có');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Đã có' : '❌ Chưa có');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const { authenticateToken, requireAdmin } = require('./middleware/auth');
const passport = require('./config/passport');
const User = require('./models/User');
const Message = require('./models/Message');
const Room = require('./models/Room');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

// Expose io instance on app for routes to use
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting (development-friendly defaults)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET' || req.path === '/health'
});
app.use(generalLimiter);

// Dedicated limiter for auth endpoints to prevent brute force, yet friendly in dev
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth requests, please try again later', code: 'RATE_LIMITED' }
});
app.use('/api/auth', authLimiter);

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('JSON Parse Error:', e.message);
      console.error('Raw body:', buf.toString());
      res.status(400).json({ error: 'Invalid JSON format' });
      throw e;
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());

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
app.use('/api/admin', authenticateToken, requireAdmin, adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
const connectedUsers = new Map(); // userId -> socketId
const roomUsers = new Map(); // roomId -> Set of userIds

// Authenticate socket handshake using JWT
io.use(async (socket, next) => {
  try {
    console.log('🔐 Authenticating socket connection...');
    
    const authToken = socket.handshake.auth && socket.handshake.auth.token
      ? socket.handshake.auth.token
      : (socket.handshake.headers && socket.handshake.headers.authorization
        ? socket.handshake.headers.authorization.split(' ')[1]
        : null);

    if (!authToken) {
      console.log('❌ No auth token provided');
      return next(new Error('No auth token provided'));
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('username email');
    if (!user) {
      console.log('❌ User not found');
      return next(new Error('User not found'));
    }

    socket.user = { _id: user._id.toString(), username: user.username };
    console.log('✅ Socket authenticated for user:', user.username);
    next();
  } catch (err) {
    console.error('❌ Socket authentication error:', err.message);
    next(new Error('Authentication failed: ' + err.message));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Người dùng kết nối: ${socket.id}`);

  // Người dùng tham gia phòng
  socket.on('join-room', async (data) => {
    try {
      const { roomId } = data;
      const userId = socket.user?._id;
      const username = socket.user?.username;
      
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
    const { roomId } = data;
    const userId = socket.user?._id;
    const username = socket.user?.username;
    
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

  // Điều khiển video (kiểm tra quyền)
  socket.on('video-control', async (data) => {
    try {
      const { roomId, action, time } = data || {};
      const userId = socket.user?._id;
      if (!roomId || !action || !userId) return;

      const room = await Room.findById(roomId);
      if (!room) return;

      const allowed = room.canUserControlVideo(userId);
      if (!allowed) {
        console.warn(`🚫 Video control denied for user ${userId} in room ${roomId}`);
        return;
      }

      if (action === 'play') {
        await room.updateVideoState(true, typeof time === 'number' ? time : room.currentVideoTime);
      } else if (action === 'pause') {
        await room.updateVideoState(false, typeof time === 'number' ? time : room.currentVideoTime);
      } else if (action === 'seek' && typeof time === 'number') {
        await room.updateVideoState(room.isPlaying, time);
      }

      // Broadcast chỉ tới client KHÁC và gắn senderId để client tự lọc
      socket.broadcast.to(roomId).emit('video-control', { action, time, userId, senderId: socket.id });
      console.log(`🎮 Video control: ${action} at ${time}s in room ${roomId}`);
    } catch (err) {
      console.error('Video control error:', err.message);
    }
  });

  // Client mới yêu cầu trạng thái đồng bộ từ phòng
  socket.on('request-sync', (data) => {
    const { roomId } = data || {};
    const userId = socket.user?._id;
    if (!roomId) return;
    // Phát yêu cầu tới phòng để một client đang xem gửi lại trạng thái
    socket.to(roomId).emit('request-sync', { requesterId: userId });
  });

  // Một client gửi trạng thái hiện tại của video cho người yêu cầu
  socket.on('sync-state', (data) => {
    const { roomId, targetUserId, time, isPlaying } = data || {};
    if (!roomId || !targetUserId) return;
    const targetSocketId = connectedUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('sync-state', { time, isPlaying });
    }
  });

  // Tin nhắn chat (lưu DB rồi phát lại)
  socket.on('chat-message', async (data) => {
    try {
      const { roomId, message } = data || {};
      const userId = socket.user?._id;
      const username = socket.user?.username;
      if (!roomId || !message || !userId) return;

      const saved = await new Message({
        roomId,
        userId,
        username,
        content: message,
        metadata: {
          userAgent: socket.handshake.headers && socket.handshake.headers['user-agent'],
          ipAddress: socket.handshake.address
        }
      }).save();

      io.to(roomId).emit('chat-message', saved.toPublicJSON());
      console.log(`💬 Chat message in room ${roomId}: ${username}: ${message}`);
    } catch (err) {
      console.error('Lỗi lưu/chuyển tiếp tin nhắn:', err.message);
    }
  });

  // Typing indicator
  socket.on('user-typing', (data) => {
    const { roomId, isTyping } = data || {};
    const userId = socket.user?._id;
    const username = socket.user?.username;
    if (!roomId) return;
    socket.to(roomId).emit('user-typing', { userId, username, isTyping: !!isTyping, ts: Date.now() });
  });

  // Message seen status
  socket.on('message-seen', async (data) => {
    try {
      const { roomId, messageId } = data || {};
      const userId = socket.user?._id;
      const username = socket.user?.username;
      if (!roomId || !messageId) return;

      // Update seenBy in DB (add if not exists)
      const updated = await Message.findOneAndUpdate(
        { _id: messageId, roomId, 'seenBy.userId': { $ne: userId } },
        { $push: { seenBy: { userId, username, seenAt: new Date() } } },
        { new: true }
      );

      // Broadcast to room regardless (clients can dedupe)
      io.to(roomId).emit('message-seen', {
        messageId,
        userId,
        username,
        seenAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái đã xem:', err.message);
    }
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

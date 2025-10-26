// Database backup script for Watch Party
// Script để backup dữ liệu từ MongoDB

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('../backend/models/User');
const Room = require('../backend/models/Room');
const Message = require('../backend/models/Message');

async function backupDatabase() {
  try {
    console.log('🔗 Đang kết nối đến MongoDB...');
    
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/watch-party', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Kết nối MongoDB thành công!');
    
    // Tạo thư mục backup
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `watch-party-backup-${timestamp}.json`);
    
    console.log('📦 Đang backup dữ liệu...');
    
    // Lấy tất cả dữ liệu
    const users = await User.find({});
    const rooms = await Room.find({});
    const messages = await Message.find({});
    
    // Tạo object backup
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        users: users,
        rooms: rooms,
        messages: messages
      },
      stats: {
        users: users.length,
        rooms: rooms.length,
        messages: messages.length
      }
    };
    
    // Ghi file backup
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log('✅ Backup hoàn tất!');
    console.log(`📁 File backup: ${backupFile}`);
    console.log(`📊 Thống kê:`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Rooms: ${rooms.length}`);
    console.log(`- Messages: ${messages.length}`);
    
  } catch (error) {
    console.error('❌ Lỗi backup database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối database');
    process.exit(0);
  }
}

// Chạy script
backupDatabase();

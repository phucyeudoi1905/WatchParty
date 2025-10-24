// Database restore script for Watch Party
// Script để restore dữ liệu từ file backup

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('../backend/models/User');
const Room = require('../backend/models/Room');
const Message = require('../backend/models/Message');

async function restoreDatabase(backupFile) {
  try {
    console.log('🔗 Đang kết nối đến MongoDB...');
    
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/watch-party', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Kết nối MongoDB thành công!');
    
    // Kiểm tra file backup
    if (!fs.existsSync(backupFile)) {
      console.error('❌ File backup không tồn tại:', backupFile);
      return;
    }
    
    console.log('📦 Đang đọc file backup...');
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log(`📅 Backup từ: ${backupData.timestamp}`);
    console.log(`📊 Thống kê backup:`);
    console.log(`- Users: ${backupData.stats.users}`);
    console.log(`- Rooms: ${backupData.stats.rooms}`);
    console.log(`- Messages: ${backupData.stats.messages}`);
    
    // Xóa dữ liệu hiện tại
    console.log('🧹 Đang xóa dữ liệu hiện tại...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await Message.deleteMany({});
    
    // Restore dữ liệu
    console.log('🔄 Đang restore dữ liệu...');
    
    if (backupData.data.users && backupData.data.users.length > 0) {
      await User.insertMany(backupData.data.users);
      console.log(`✅ Đã restore ${backupData.data.users.length} users`);
    }
    
    if (backupData.data.rooms && backupData.data.rooms.length > 0) {
      await Room.insertMany(backupData.data.rooms);
      console.log(`✅ Đã restore ${backupData.data.rooms.length} rooms`);
    }
    
    if (backupData.data.messages && backupData.data.messages.length > 0) {
      await Message.insertMany(backupData.data.messages);
      console.log(`✅ Đã restore ${backupData.data.messages.length} messages`);
    }
    
    console.log('\n🎉 Restore database hoàn tất!');
    
  } catch (error) {
    console.error('❌ Lỗi restore database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối database');
    process.exit(0);
  }
}

// Lấy file backup từ command line argument
const backupFile = process.argv[2];
if (!backupFile) {
  console.error('❌ Vui lòng chỉ định file backup!');
  console.log('Cách sử dụng: node restore-database.js <backup-file>');
  process.exit(1);
}

// Chạy script
restoreDatabase(backupFile);

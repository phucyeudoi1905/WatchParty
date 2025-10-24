// Database initialization script for Watch Party
// Chạy script này để khởi tạo database và tạo dữ liệu mẫu

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../backend/models/User');
const Room = require('../backend/models/Room');
const Message = require('../backend/models/Message');

async function initDatabase() {
  try {
    console.log('🔗 Đang kết nối đến MongoDB...');
    
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/watch-party', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Kết nối MongoDB thành công!');
    
    // Xóa dữ liệu cũ (nếu có)
    console.log('🧹 Đang xóa dữ liệu cũ...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await Message.deleteMany({});
    
    // Tạo users mẫu
    console.log('👥 Đang tạo users mẫu...');
    const users = [
      {
        username: 'admin',
        email: 'admin@watchparty.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin'
      },
      {
        username: 'user1',
        email: 'user1@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'user'
      },
      {
        username: 'user2',
        email: 'user2@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'user'
      }
    ];
    
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Đã tạo ${createdUsers.length} users`);
    
    // Tạo rooms mẫu
    console.log('🏠 Đang tạo rooms mẫu...');
    const rooms = [
      {
        name: 'Phòng xem phim cùng nhau',
        description: 'Phòng để xem phim cùng nhau vào cuối tuần',
        createdBy: createdUsers[0]._id,
        maxUsers: 10,
        isPrivate: false
      },
      {
        name: 'Phòng riêng tư',
        description: 'Phòng riêng cho nhóm bạn',
        createdBy: createdUsers[1]._id,
        maxUsers: 5,
        isPrivate: true,
        password: '123456'
      }
    ];
    
    const createdRooms = await Room.insertMany(rooms);
    console.log(`✅ Đã tạo ${createdRooms.length} rooms`);
    
    // Tạo messages mẫu
    console.log('💬 Đang tạo messages mẫu...');
    const messages = [
      {
        roomId: createdRooms[0]._id,
        userId: createdUsers[1]._id,
        content: 'Chào mọi người! Hôm nay xem phim gì nhỉ?',
        timestamp: new Date()
      },
      {
        roomId: createdRooms[0]._id,
        userId: createdUsers[2]._id,
        content: 'Mình suggest xem Avengers nhé!',
        timestamp: new Date()
      }
    ];
    
    const createdMessages = await Message.insertMany(messages);
    console.log(`✅ Đã tạo ${createdMessages.length} messages`);
    
    console.log('\n🎉 Khởi tạo database hoàn tất!');
    console.log('\n📊 Thống kê:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Rooms: ${createdRooms.length}`);
    console.log(`- Messages: ${createdMessages.length}`);
    
    console.log('\n🔑 Thông tin đăng nhập mẫu:');
    console.log('Username: admin, Password: password');
    console.log('Username: user1, Password: password');
    console.log('Username: user2, Password: password');
    
  } catch (error) {
    console.error('❌ Lỗi khởi tạo database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối database');
    process.exit(0);
  }
}

// Chạy script
initDatabase();

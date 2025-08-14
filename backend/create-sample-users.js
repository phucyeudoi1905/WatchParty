const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Kết nối MongoDB thành công'))
.catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Tài khoản mẫu
const sampleUsers = [
  {
    username: 'alice_watch',
    email: 'alice@watchparty.com',
    password: 'Alice123!',
    isVerified: true,
    avatar: null,
    createdAt: new Date()
  },
  {
    username: 'bob_stream',
    email: 'bob@watchparty.com', 
    password: 'Bob456!',
    isVerified: true,
    avatar: null,
    createdAt: new Date()
  }
];

// Hàm tạo tài khoản mẫu
async function createSampleUsers() {
  try {
    console.log('🚀 Bắt đầu tạo tài khoản mẫu...');
    
    for (const userData of sampleUsers) {
      // Kiểm tra user đã tồn tại chưa
      const existingUser = await User.findOne({
        $or: [{ username: userData.username }, { email: userData.email }]
      });
      
      if (existingUser) {
        console.log(`⚠️ Tài khoản ${userData.username} đã tồn tại, bỏ qua`);
        continue;
      }
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Tạo user mới
      const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        isVerified: userData.isVerified,
        avatar: userData.avatar,
        createdAt: userData.createdAt
      });
      
      await newUser.save();
      console.log(`✅ Đã tạo tài khoản: ${userData.username} (${userData.email})`);
    }
    
    console.log('\n🎉 Hoàn thành tạo tài khoản mẫu!');
    console.log('\n📋 Thông tin đăng nhập:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    sampleUsers.forEach(user => {
      console.log(`👤 ${user.username}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Password: ${user.password}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
    
    console.log('\n💡 Sử dụng các tài khoản này để test website!');
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo tài khoản mẫu:', error);
  } finally {
    // Đóng kết nối MongoDB
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy script
createSampleUsers();

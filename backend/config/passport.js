const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Serialize user để lưu vào session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user từ session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - chỉ khởi tạo khi có đủ thông tin
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Kiểm tra user đã tồn tại chưa
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // User đã tồn tại, cập nhật thông tin
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }
      
      // Kiểm tra email đã được sử dụng chưa
      const existingUser = await User.findOne({ email: profile.emails[0].value });
      if (existingUser) {
        // Nếu email đã tồn tại, liên kết với Google account
        existingUser.googleId = profile.id;
        existingUser.lastLogin = new Date();
        await existingUser.save();
        return done(null, existingUser);
      }
      
      // Tạo user mới
      const newUser = new User({
        username: profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Math.random().toString(36).substr(2, 5),
        email: profile.emails[0].value,
        googleId: profile.id,
        avatar: profile.photos[0]?.value || null,
        isVerified: true, // Google account đã được xác thực
        lastLogin: new Date()
      });
      
      // Đảm bảo username là duy nhất
      let username = newUser.username;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${newUser.username}_${counter}`;
        counter++;
      }
      newUser.username = username;
      
      await newUser.save();
      return done(null, newUser);
      
    } catch (error) {
      console.error('Lỗi Google OAuth:', error);
      return done(error, null);
    }
  }));
  
  console.log('✅ Google OAuth strategy đã được khởi tạo');
} else {
  console.log('⚠️ Google OAuth chưa được cấu hình - bỏ qua');
}

module.exports = passport;

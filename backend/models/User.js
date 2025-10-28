const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Tên người dùng là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự'],
    maxlength: [30, 'Tên người dùng không được quá 30 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  passwordHash: {
    type: String,
    required: false, // Will be set by virtual or pre-save hook
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field cho password (không lưu vào DB)
userSchema.virtual('password')
  .set(function(password) {
    this._password = password;
    this.passwordHash = bcrypt.hashSync(password, 12);
  })
  .get(function() {
    return this._password;
  });

// Pre-save hook để validate mật khẩu
userSchema.pre('save', function(next) {
  // Nếu là user mới và chưa có passwordHash
  if (this.isNew && !this.passwordHash) {
    // Kiểm tra nếu có password được set qua virtual
    if (this._password) {
      this.passwordHash = bcrypt.hashSync(this._password, 12);
    } else {
      return next(new Error('Mật khẩu là bắt buộc'));
    }
  }
  next();
});

// Method để so sánh mật khẩu
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.passwordHash);
};

// Method để lấy thông tin công khai
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  };
};

// Index để tối ưu tìm kiếm
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: [true, 'Mã phòng là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [4, 'Mã phòng phải có ít nhất 4 ký tự'],
    maxlength: [10, 'Mã phòng không được quá 10 ký tự'],
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Tên phòng là bắt buộc'],
    trim: true,
    minlength: [3, 'Tên phòng phải có ít nhất 3 ký tự'],
    maxlength: [100, 'Tên phòng không được quá 100 ký tự']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả không được quá 500 ký tự']
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Host ID là bắt buộc']
  },
  videoUrl: {
    type: String,
    required: [true, 'URL video là bắt buộc'],
    trim: true
  },
  videoType: {
    type: String,
    enum: ['youtube', 'hls', 'mp4'],
    default: 'youtube'
  },
  password: {
    type: String,
    default: null // null = không có mật khẩu
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  maxMembers: {
    type: Number,
    default: 20,
    min: [2, 'Phòng phải có ít nhất 2 thành viên'],
    max: [100, 'Phòng không được quá 100 thành viên']
  },
  currentVideoTime: {
    type: Number,
    default: 0
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isHost: {
      type: Boolean,
      default: false
    }
  }],
  settings: {
    allowChat: {
      type: Boolean,
      default: true
    },
    allowVideoControl: {
      type: Boolean,
      default: true
    },
    autoSync: {
      type: Boolean,
      default: true
    },
    syncThreshold: {
      type: Number,
      default: 1 // giây
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual field để đếm số thành viên
roomSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method để thêm thành viên
roomSchema.methods.addMember = function(userId, username) {
  if (this.members.length >= this.maxMembers) {
    throw new Error('Phòng đã đầy');
  }
  
  if (this.members.some(member => member.userId.toString() === userId.toString())) {
    throw new Error('Người dùng đã trong phòng');
  }
  
  this.members.push({
    userId,
    username,
    joinedAt: new Date(),
    isHost: this.hostId.toString() === userId.toString()
  });
  
  return this.save();
};

// Method để xóa thành viên
roomSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.userId.toString() !== userId.toString()
  );
  
  // Nếu host rời phòng, chuyển quyền cho thành viên đầu tiên
  if (this.hostId.toString() === userId.toString() && this.members.length > 0) {
    this.hostId = this.members[0].userId;
    this.members[0].isHost = true;
  }
  
  return this.save();
};

// Method để cập nhật trạng thái video
roomSchema.methods.updateVideoState = function(isPlaying, currentTime) {
  this.isPlaying = isPlaying;
  this.currentVideoTime = currentTime;
  return this.save();
};

// Method để lấy thông tin công khai
roomSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    roomCode: this.roomCode,
    name: this.name,
    description: this.description,
    videoUrl: this.videoUrl,
    videoType: this.videoType,
    isPrivate: this.isPrivate,
    maxMembers: this.maxMembers,
    memberCount: this.memberCount,
    currentVideoTime: this.currentVideoTime,
    isPlaying: this.isPlaying,
    hostId: this.hostId,
    settings: this.settings,
    tags: this.tags,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Index để tối ưu tìm kiếm
roomSchema.index({ roomCode: 1 });
roomSchema.index({ hostId: 1 });
roomSchema.index({ isActive: 1 });
roomSchema.index({ tags: 1 });
roomSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Room', roomSchema);

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID là bắt buộc']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Với messageType 'system' thì không yêu cầu userId
    required: [function() { return this.messageType !== 'system'; }, 'User ID là bắt buộc']
  },
  username: {
    type: String,
    required: [true, 'Username là bắt buộc'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Nội dung tin nhắn là bắt buộc'],
    trim: true,
    maxlength: [1000, 'Tin nhắn không được quá 1000 ký tự']
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'emoji'],
    default: 'text'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  replyTo: {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    username: String
  },
  reactions: [{
    emoji: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  }],
  seenBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    seenAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    videoTime: Number, // Thời điểm video khi gửi tin nhắn
    userAgent: String, // Thông tin trình duyệt
    ipAddress: String  // IP address (nếu cần)
  }
}, {
  timestamps: true
});

// Virtual field để đếm số reaction
messageSchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
});

// Method để thêm reaction
messageSchema.methods.addReaction = function(emoji, userId, username) {
  // Kiểm tra xem user đã reaction chưa
  const existingReaction = this.reactions.find(
    reaction => reaction.userId.toString() === userId.toString() && 
                reaction.emoji === emoji
  );
  
  if (existingReaction) {
    // Nếu đã có, xóa reaction cũ
    this.reactions = this.reactions.filter(
      reaction => !(reaction.userId.toString() === userId.toString() && 
                    reaction.emoji === emoji)
    );
  } else {
    // Nếu chưa có, thêm reaction mới
    this.reactions.push({ emoji, userId, username });
  }
  
  return this.save();
};

// Method để xóa reaction
messageSchema.methods.removeReaction = function(emoji, userId) {
  this.reactions = this.reactions.filter(
    reaction => !(reaction.userId.toString() === userId.toString() && 
                  reaction.emoji === emoji)
  );
  
  return this.save();
};

// Method để chỉnh sửa tin nhắn
messageSchema.methods.editMessage = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  
  return this.save();
};

// Method để lấy thông tin công khai
messageSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    roomId: this.roomId,
    userId: this.userId,
    username: this.username,
    content: this.content,
    messageType: this.messageType,
    isEdited: this.isEdited,
    editedAt: this.editedAt,
    replyTo: this.replyTo,
    reactions: this.reactions,
    reactionCount: this.reactionCount,
    seenBy: this.seenBy,
    metadata: this.metadata,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method để tạo tin nhắn hệ thống
messageSchema.statics.createSystemMessage = function(roomId, content, metadata = {}) {
  return this.create({
    roomId,
    userId: null, // Không có user cụ thể
    username: 'System',
    content,
    messageType: 'system',
    metadata
  });
};

// Index để tối ưu tìm kiếm
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ userId: 1 });
messageSchema.index({ messageType: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ 'seenBy.userId': 1 });

module.exports = mongoose.model('Message', messageSchema);

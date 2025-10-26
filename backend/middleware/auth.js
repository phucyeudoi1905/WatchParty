const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token xác thực không được cung cấp',
        code: 'TOKEN_MISSING'
      });
    }
    
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kiểm tra user có tồn tại không
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ 
        error: 'Token không hợp lệ hoặc user không tồn tại',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Kiểm tra user có bị khóa không
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Tài khoản đã bị khóa',
        code: 'ACCOUNT_DISABLED'
      });
    }
    
    // Thêm thông tin user vào request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token không hợp lệ',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token đã hết hạn',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Lỗi xác thực:', error);
    return res.status(500).json({ 
      error: 'Lỗi xác thực',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Không có quyền truy cập',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  next();
};

// Middleware kiểm tra quyền host của phòng
const requireHost = async (req, res, next) => {
  try {
    // Sử dụng id thay vì roomId để đồng bộ với route
    const roomId = req.params.id || req.params.roomId;
    const Room = require('../models/Room');
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ 
        error: 'Phòng không tồn tại',
        code: 'ROOM_NOT_FOUND'
      });
    }
    if (room.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Chỉ host mới có quyền thực hiện hành động này',
        code: 'HOST_REQUIRED'
      });
    }
    req.room = room;
    next();
  } catch (error) {
    console.error('Lỗi kiểm tra quyền host:', error);
    return res.status(500).json({ 
      error: 'Lỗi kiểm tra quyền',
      code: 'PERMISSION_CHECK_ERROR'
    });
  }
};

// Middleware kiểm tra user có trong phòng không
const requireRoomMember = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const Room = require('../models/Room');
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ 
        error: 'Phòng không tồn tại',
        code: 'ROOM_NOT_FOUND'
      });
    }
    
    const isMember = room.members.some(member => 
      member.userId.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ 
        error: 'Bạn không phải thành viên của phòng này',
        code: 'NOT_ROOM_MEMBER'
      });
    }
    
    req.room = room;
    next();
    
  } catch (error) {
    console.error('Lỗi kiểm tra thành viên phòng:', error);
    return res.status(500).json({ 
      error: 'Lỗi kiểm tra quyền',
      code: 'MEMBER_CHECK_ERROR'
    });
  }
};

// Middleware tạo token mới
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token hết hạn sau 7 ngày
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireHost,
  requireRoomMember,
  generateToken
};

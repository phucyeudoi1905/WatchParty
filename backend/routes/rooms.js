const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const Message = require('../models/Message');
const { requireHost, requireRoomMember } = require('../middleware/auth');

const router = express.Router();

// API endpoint để thay đổi URL video (chỉ host mới có quyền)
router.put('/:roomId/video-url', requireHost, [
  body('videoUrl')
    .notEmpty()
    .withMessage('URL video là bắt buộc')
    .isURL()
    .withMessage('URL video không hợp lệ'),
  body('videoType')
    .optional()
    .isIn(['youtube', 'hls', 'mp4'])
    .withMessage('Loại video không hợp lệ')
], async (req, res) => {
  try {
    console.log('[rooms] video-url change request', {
      roomId: req.params.roomId,
      user: req.user ? { id: req.user._id, username: req.user.username } : null,
      body: req.body
    });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: errors.array()
      });
    }

    const { videoUrl, videoType = 'youtube' } = req.body;
    const room = await Room.findById(req.params.roomId);

    room.videoUrl = videoUrl;
    room.videoType = videoType;
    await room.save();

    // Emit event to all room members (guard if io not available)
    const io = req.app.get && req.app.get('io');
    if (io && typeof io.to === 'function') {
      io.to(req.params.roomId).emit('video-url-changed', {
        videoUrl,
        videoType,
        updatedBy: req.user.username
      });
    } else {
      console.warn('[rooms] io instance not available, skipping emit for video-url-changed');
    }

    res.json({ room });
  } catch (error) {
    console.error('Lỗi khi cập nhật URL video:', error);
    res.status(500).json({ error: 'Không thể cập nhật URL video' });
  }
});

// Tạo phòng mới
router.post('/', [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('Tên phòng phải có từ 3-100 ký tự'),
  
  body('videoUrl')
    .notEmpty()
    .withMessage('URL video là bắt buộc')
    .isURL()
    .withMessage('URL video không hợp lệ'),
  
  body('videoType')
    .optional()
    .isIn(['youtube', 'hls', 'mp4'])
    .withMessage('Loại video không hợp lệ'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được quá 500 ký tự'),
  
  body('password')
    .optional()
    .isLength({ min: 4, max: 20 })
    .withMessage('Mật khẩu phòng phải có từ 4-20 ký tự'),
  
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('Số thành viên tối đa phải từ 2-100'),
  
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái riêng tư không hợp lệ')
], async (req, res) => {
  try {
    // Kiểm tra validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: errors.array()
      });
    }

    const {
      name,
      videoUrl,
      videoType = 'youtube',
      description,
      password,
      maxMembers = 20,
      isPrivate = false,
      tags = []
    } = req.body;

    // Tạo mã phòng ngẫu nhiên
    const generateRoomCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let roomCode;
    let isUnique = false;
    
    // Đảm bảo mã phòng là duy nhất
    while (!isUnique) {
      roomCode = generateRoomCode();
      const existingRoom = await Room.findOne({ roomCode });
      if (!existingRoom) {
        isUnique = true;
      }
    }

    // Tạo phòng mới
    const room = new Room({
      roomCode,
      name,
      description,
      hostId: req.user._id,
      videoUrl,
      videoType,
      password: password || null,
      isPrivate,
      maxMembers,
      tags,
      members: [{
        userId: req.user._id,
        username: req.user.username,
        joinedAt: new Date(),
        isHost: true
      }]
    });

    await room.save();

    // Tạo tin nhắn hệ thống
    await Message.createSystemMessage(room._id, `${req.user.username} đã tạo phòng`);

    res.status(201).json({
      message: 'Tạo phòng thành công',
      room: room.toPublicJSON()
    });

  } catch (error) {
    console.error('Lỗi tạo phòng:', error);
    res.status(500).json({
      error: 'Lỗi tạo phòng',
      code: 'ROOM_CREATION_ERROR'
    });
  }
});

// Lấy danh sách phòng công khai
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tags = [] } = req.query;
    
    const query = { isActive: true, isPrivate: false };
    
    // Tìm kiếm theo tên hoặc mô tả
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Lọc theo tags
    if (tags.length > 0) {
      query.tags = { $in: tags };
    }
    
    const rooms = await Room.find(query)
      .populate('hostId', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Room.countDocuments(query);
    
    res.json({
      rooms: rooms.map(room => room.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Lỗi lấy danh sách phòng:', error);
    res.status(500).json({
      error: 'Lỗi lấy danh sách phòng',
      code: 'ROOM_LIST_ERROR'
    });
  }
});

// Lấy thông tin phòng theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await Room.findById(id)
      .populate('hostId', 'username')
      .populate('members.userId', 'username avatar');
    
    if (!room) {
      return res.status(404).json({
        error: 'Phòng không tồn tại',
        code: 'ROOM_NOT_FOUND'
      });
    }
    
    if (!room.isActive) {
      return res.status(404).json({
        error: 'Phòng đã bị xóa',
        code: 'ROOM_DELETED'
      });
    }
    
    res.json({
      room: room.toPublicJSON()
    });

  } catch (error) {
    console.error('Lỗi lấy thông tin phòng:', error);
    res.status(500).json({
      error: 'Lỗi lấy thông tin phòng',
      code: 'ROOM_INFO_ERROR'
    });
  }
});

// Tham gia phòng
router.post('/:id/join', [
  body('password')
    .optional()
    .notEmpty()
    .withMessage('Mật khẩu phòng là bắt buộc')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        error: 'Phòng không tồn tại',
        code: 'ROOM_NOT_FOUND'
      });
    }
    
    if (!room.isActive) {
      return res.status(404).json({
        error: 'Phòng đã bị xóa',
        code: 'ROOM_DELETED'
      });
    }
    
    // Kiểm tra mật khẩu nếu phòng có mật khẩu
    if (room.password && room.password !== password) {
      return res.status(401).json({
        error: 'Mật khẩu phòng không đúng',
        code: 'WRONG_PASSWORD'
      });
    }
    
    // Kiểm tra user đã trong phòng chưa
    const isAlreadyMember = room.members.some(
      member => member.userId.toString() === req.user._id.toString()
    );
    
    if (isAlreadyMember) {
      return res.status(400).json({
        error: 'Bạn đã trong phòng này',
        code: 'ALREADY_MEMBER'
      });
    }
    
    // Kiểm tra phòng có đầy không
    if (room.members.length >= room.maxMembers) {
      return res.status(400).json({
        error: 'Phòng đã đầy',
        code: 'ROOM_FULL'
      });
    }
    
    // Thêm user vào phòng
    await room.addMember(req.user._id, req.user.username);
    
    // Tạo tin nhắn hệ thống
    await Message.createSystemMessage(room._id, `${req.user.username} đã tham gia phòng`);
    
    res.json({
      message: 'Tham gia phòng thành công',
      room: room.toPublicJSON()
    });

  } catch (error) {
    console.error('Lỗi tham gia phòng:', error);
    
    if (error.message === 'Phòng đã đầy') {
      return res.status(400).json({
        error: error.message,
        code: 'ROOM_FULL'
      });
    }
    
    if (error.message === 'Người dùng đã trong phòng') {
      return res.status(400).json({
        error: error.message,
        code: 'ALREADY_MEMBER'
      });
    }
    
    res.status(500).json({
      error: 'Lỗi tham gia phòng',
      code: 'JOIN_ROOM_ERROR'
    });
  }
});

// Rời phòng
router.post('/:id/leave', requireRoomMember, async (req, res) => {
  try {
    const { id } = req.params;
    const room = req.room;
    
    // Xóa user khỏi phòng
    await room.removeMember(req.user._id);
    
    // Tạo tin nhắn hệ thống
    await Message.createSystemMessage(room._id, `${req.user.username} đã rời phòng`);
    
    // Nếu không còn ai trong phòng, xóa phòng
    if (room.members.length === 0) {
      await Room.findByIdAndDelete(id);
      return res.json({
        message: 'Rời phòng thành công. Phòng đã bị xóa do không còn thành viên.'
      });
    }
    
    res.json({
      message: 'Rời phòng thành công',
      room: room.toPublicJSON()
    });

  } catch (error) {
    console.error('Lỗi rời phòng:', error);
    res.status(500).json({
      error: 'Lỗi rời phòng',
      code: 'LEAVE_ROOM_ERROR'
    });
  }
});

// Cập nhật thông tin phòng (chỉ host)
router.put('/:id', requireHost, [
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Tên phòng phải có từ 3-100 ký tự'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được quá 500 ký tự'),
  
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('URL video không hợp lệ'),
  
  body('password')
    .optional()
    .isLength({ min: 4, max: 20 })
    .withMessage('Mật khẩu phòng phải có từ 4-20 ký tự'),
  
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('Số thành viên tối đa phải từ 2-100'),
  
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái riêng tư không hợp lệ')
  ,
  body('settings')
    .optional()
    .isObject()
    .withMessage('Cấu hình phòng không hợp lệ'),
  body('settings.allowVideoControl')
    .optional()
    .isBoolean()
    .withMessage('allowVideoControl phải là boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: errors.array()
      });
    }
    
    const room = req.room;
    const updates = req.body;

    // Cập nhật các trường được phép ở cấp 1
    Object.keys(updates).forEach(key => {
      if (['name', 'description', 'videoUrl', 'password', 'maxMembers', 'isPrivate', 'tags'].includes(key)) {
        room[key] = updates[key];
      }
    });

    // Cập nhật settings.allowVideoControl nếu có
    if (updates.settings && typeof updates.settings.allowVideoControl === 'boolean') {
      room.settings = room.settings || {};
      room.settings.allowVideoControl = updates.settings.allowVideoControl;
    }
    
    await room.save();
    
    res.json({
      message: 'Cập nhật phòng thành công',
      room: room.toPublicJSON()
    });

  } catch (error) {
    console.error('Lỗi cập nhật phòng:', error);
    res.status(500).json({
      error: 'Lỗi cập nhật phòng',
      code: 'ROOM_UPDATE_ERROR'
    });
  }
});

// Xóa phòng (chỉ host)
router.delete('/:id', requireHost, async (req, res) => {
  try {
      const room = req.room;
      await Message.deleteMany({ roomId: room._id });
      await Room.findByIdAndDelete(room._id);
      res.json({
        message: 'Xóa phòng thành công'
     });
    } catch (error) {
    console.error('Lỗi xóa phòng:', error);
    res.status(500).json({
      error: 'Lỗi xóa phòng',
      code: 'ROOM_DELETE_ERROR'
    });
  }
});

// Tìm phòng theo mã
router.get('/code/:roomCode', async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const room = await Room.findOne({ roomCode, isActive: true })
      .populate('hostId', 'username')
      .populate('members.userId', 'username avatar');
    
    if (!room) {
      return res.status(404).json({
        error: 'Phòng không tồn tại hoặc đã bị xóa',
        code: 'ROOM_NOT_FOUND'
      });
    }
    
    res.json({
      room: room.toPublicJSON()
    });

  } catch (error) {
    console.error('Lỗi tìm phòng theo mã:', error);
    res.status(500).json({
      error: 'Lỗi tìm phòng',
      code: 'ROOM_SEARCH_ERROR'
    });
  }
});

// Chuyển quyền chủ phòng (host -> member)
router.put('/:id/transfer-host', requireHost, [
  body('targetUserId')
    .notEmpty()
    .withMessage('targetUserId là bắt buộc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: errors.array() });
    }

    const room = req.room;
    const { targetUserId } = req.body;

    if (room.hostId.toString() === targetUserId.toString()) {
      return res.status(400).json({ error: 'Người dùng đã là chủ phòng', code: 'ALREADY_HOST' });
    }

    const memberIndex = room.members.findIndex(m => m.userId && m.userId.toString() === targetUserId.toString());
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Người dùng không ở trong phòng', code: 'MEMBER_NOT_FOUND' });
    }

    // Unset current host flag
    room.members = room.members.map(m => ({ ...m.toObject?.() || m, isHost: false }));

    // Set new host flag
    room.members[memberIndex].isHost = true;
    room.hostId = room.members[memberIndex].userId;

    await room.save();

    await Message.createSystemMessage(room._id, `${req.user.username} đã chuyển quyền chủ phòng cho ${room.members[memberIndex].username}`);

    res.json({
      message: 'Chuyển quyền chủ phòng thành công',
      room: room.toPublicJSON()
    });
  } catch (error) {
    console.error('Lỗi chuyển quyền chủ phòng:', error);
    res.status(500).json({ error: 'Lỗi chuyển quyền chủ phòng', code: 'TRANSFER_HOST_ERROR' });
  }
});

module.exports = router;

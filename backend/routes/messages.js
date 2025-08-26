const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Room = require('../models/Room');
const { requireRoomMember } = require('../middleware/auth');

const router = express.Router();

// Gửi tin nhắn trong phòng
router.post('/:roomId', requireRoomMember, [
  body('content')
    .notEmpty()
    .withMessage('Nội dung tin nhắn là bắt buộc')
    .isLength({ max: 1000 })
    .withMessage('Tin nhắn không được quá 1000 ký tự'),
  
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('ID tin nhắn reply không hợp lệ')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: errors.array()
      });
    }

    const { roomId } = req.params;
    const { content, replyTo } = req.body;
    const room = req.room;

    // Kiểm tra phòng có cho phép chat không
    if (!room.settings.allowChat) {
      return res.status(403).json({
        error: 'Phòng này không cho phép chat',
        code: 'CHAT_DISABLED'
      });
    }

    // Kiểm tra tin nhắn reply có tồn tại không
    let replyToMessage = null;
    if (replyTo) {
      replyToMessage = await Message.findById(replyTo);
      if (!replyToMessage || replyToMessage.roomId.toString() !== roomId) {
        return res.status(400).json({
          error: 'Tin nhắn reply không tồn tại',
          code: 'REPLY_MESSAGE_NOT_FOUND'
        });
      }
    }

    // Tạo tin nhắn mới
    const message = new Message({
      roomId,
      userId: req.user._id,
      username: req.user.username,
      content,
      replyTo: replyTo ? {
        messageId: replyTo,
        username: replyToMessage.username
      } : null,
      metadata: {
        videoTime: room.currentVideoTime,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    await message.save();

    res.status(201).json({
      message: 'Gửi tin nhắn thành công',
      data: message.toPublicJSON()
    });

  } catch (error) {
    console.error('Lỗi gửi tin nhắn:', error);
    res.status(500).json({
      error: 'Lỗi gửi tin nhắn',
      code: 'SEND_MESSAGE_ERROR'
    });
  }
});

// Lấy danh sách tin nhắn trong phòng
router.get('/:roomId', requireRoomMember, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    
    const query = { roomId };
    
    // Nếu có tham số before, lấy tin nhắn trước thời điểm đó
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'username avatar')
      .exec();
    
    // Đảo ngược thứ tự để hiển thị từ cũ đến mới
    messages.reverse();
    
    res.json({
      messages: messages.map(msg => msg.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Lỗi lấy danh sách tin nhắn:', error);
    res.status(500).json({
      error: 'Lỗi lấy danh sách tin nhắn',
      code: 'GET_MESSAGES_ERROR'
    });
  }
});

// Chỉnh sửa tin nhắn
router.put('/:roomId/:messageId', requireRoomMember, [
  body('content')
    .notEmpty()
    .withMessage('Nội dung tin nhắn là bắt buộc')
    .isLength({ max: 1000 })
    .withMessage('Tin nhắn không được quá 1000 ký tự')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: errors.array()
      });
    }

    const { roomId, messageId } = req.params;
    const { content } = req.body;
    const room = req.room;

    // Kiểm tra phòng có cho phép chat không
    if (!room.settings.allowChat) {
      return res.status(403).json({
        error: 'Phòng này không cho phép chat',
        code: 'CHAT_DISABLED'
      });
    }

    // Tìm tin nhắn
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        error: 'Tin nhắn không tồn tại',
        code: 'MESSAGE_NOT_FOUND'
      });
    }

    // Kiểm tra tin nhắn có thuộc phòng không
    if (message.roomId.toString() !== roomId) {
      return res.status(400).json({
        error: 'Tin nhắn không thuộc phòng này',
        code: 'MESSAGE_NOT_IN_ROOM'
      });
    }

    // Kiểm tra quyền chỉnh sửa (chỉ người gửi mới được chỉnh sửa)
    if (message.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Bạn không có quyền chỉnh sửa tin nhắn này',
        code: 'EDIT_PERMISSION_DENIED'
      });
    }

    // Chỉnh sửa tin nhắn
    await message.editMessage(content);

    res.json({
      message: 'Chỉnh sửa tin nhắn thành công',
      data: message.toPublicJSON()
    });

  } catch (error) {
    console.error('Lỗi chỉnh sửa tin nhắn:', error);
    res.status(500).json({
      error: 'Lỗi chỉnh sửa tin nhắn',
      code: 'EDIT_MESSAGE_ERROR'
    });
  }
});

// Xóa tin nhắn
router.delete('/:roomId/:messageId', requireRoomMember, async (req, res) => {
  try {
    const { roomId, messageId } = req.params;
    const room = req.room;

    // Tìm tin nhắn
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        error: 'Tin nhắn không tồn tại',
        code: 'MESSAGE_NOT_FOUND'
      });
    }

    // Kiểm tra tin nhắn có thuộc phòng không
    if (message.roomId.toString() !== roomId) {
      return res.status(400).json({
        error: 'Tin nhắn không thuộc phòng này',
        code: 'MESSAGE_NOT_IN_ROOM'
      });
    }

    // Kiểm tra quyền xóa (người gửi hoặc host)
    const isHost = room.hostId.toString() === req.user._id.toString();
    const isOwner = message.userId.toString() === req.user._id.toString();
    
    if (!isHost && !isOwner) {
      return res.status(403).json({
        error: 'Bạn không có quyền xóa tin nhắn này',
        code: 'DELETE_PERMISSION_DENIED'
      });
    }

    // Xóa tin nhắn
    await Message.findByIdAndDelete(messageId);

    res.json({
      message: 'Xóa tin nhắn thành công'
    });

  } catch (error) {
    console.error('Lỗi xóa tin nhắn:', error);
    res.status(500).json({
      error: 'Lỗi xóa tin nhắn',
      code: 'DELETE_MESSAGE_ERROR'
    });
  }
});

// Thêm/xóa reaction cho tin nhắn
router.post('/:roomId/:messageId/reaction', requireRoomMember, [
  body('emoji')
    .notEmpty()
    .withMessage('Emoji là bắt buộc')
    .isLength({ max: 10 })
    .withMessage('Emoji quá dài')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: errors.array()
      });
    }

    const { roomId, messageId } = req.params;
    const { emoji } = req.body;
    const room = req.room;

    // Kiểm tra phòng có cho phép chat không
    if (!room.settings.allowChat) {
      return res.status(403).json({
        error: 'Phòng này không cho phép chat',
        code: 'CHAT_DISABLED'
      });
    }

    // Tìm tin nhắn
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        error: 'Tin nhắn không tồn tại',
        code: 'MESSAGE_NOT_FOUND'
      });
    }

    // Kiểm tra tin nhắn có thuộc phòng không
    if (message.roomId.toString() !== roomId) {
      return res.status(400).json({
        error: 'Tin nhắn không thuộc phòng này',
        code: 'MESSAGE_NOT_IN_ROOM'
      });
    }

    // Thêm/xóa reaction
    await message.addReaction(emoji, req.user._id, req.user.username);

    res.json({
      message: 'Cập nhật reaction thành công',
      data: message.toPublicJSON()
    });

  } catch (error) {
    console.error('Lỗi cập nhật reaction:', error);
    res.status(500).json({
      error: 'Lỗi cập nhật reaction',
      code: 'REACTION_UPDATE_ERROR'
    });
  }
});

// Lấy tin nhắn theo ID
router.get('/:roomId/:messageId', requireRoomMember, async (req, res) => {
  try {
    const { roomId, messageId } = req.params;

    // Tìm tin nhắn
    const message = await Message.findById(messageId)
      .populate('userId', 'username avatar');
    
    if (!message) {
      return res.status(404).json({
        error: 'Tin nhắn không tồn tại',
        code: 'MESSAGE_NOT_FOUND'
      });
    }

    // Kiểm tra tin nhắn có thuộc phòng không
    if (message.roomId.toString() !== roomId) {
      return res.status(400).json({
        error: 'Tin nhắn không thuộc phòng này',
        code: 'MESSAGE_NOT_IN_ROOM'
      });
    }

    res.json({
      message: message.toPublicJSON()
    });

  } catch (error) {
    console.error('Lỗi lấy tin nhắn:', error);
    res.status(500).json({
      error: 'Lỗi lấy tin nhắn',
      code: 'GET_MESSAGE_ERROR'
    });
  }
});

// Tìm kiếm tin nhắn trong phòng
router.get('/:roomId/search', requireRoomMember, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { q: query, page = 1, limit = 20 } = req.query;
    const room = req.room;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự',
        code: 'SEARCH_QUERY_TOO_SHORT'
      });
    }

    // Tìm kiếm tin nhắn
    const searchQuery = {
      roomId,
      content: { $regex: query, $options: 'i' }
    };

    const messages = await Message.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'username avatar')
      .exec();

    const total = await Message.countDocuments(searchQuery);

    res.json({
      messages: messages.map(msg => msg.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Lỗi tìm kiếm tin nhắn:', error);
    res.status(500).json({
      error: 'Lỗi tìm kiếm tin nhắn',
      code: 'SEARCH_MESSAGES_ERROR'
    });
  }
});

module.exports = router;

const express = require('express');
const User = require('../models/User');
const Room = require('../models/Room');

const router = express.Router();

// NOTE: This router is expected to be mounted with authenticateToken + requireAdmin

// Get users (basic admin listing with pagination)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-passwordHash')
      .exec();
    const total = await User.countDocuments(query);
    res.json({
      users: users.map(u => u.toPublicJSON()),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách người dùng', code: 'ADMIN_USERS_ERROR' });
  }
});

// Get rooms (basic admin listing with pagination)
router.get('/rooms', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { roomCode: { $regex: search, $options: 'i' } }
      ];
    }
    const rooms = await Room.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();
    const total = await Room.countDocuments(query);
    res.json({
      rooms: rooms.map(r => r.toPublicJSON()),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Admin get rooms error:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách phòng', code: 'ADMIN_ROOMS_ERROR' });
  }
});

module.exports = router;
 
// Update moderator status for a room member
router.patch('/rooms/:id/moderators', async (req, res) => {
  try {
    const { id } = req.params; // room id
    const { userId, isModerator } = req.body || {};
    if (!userId || typeof isModerator !== 'boolean') {
      return res.status(400).json({ error: 'Thiếu userId hoặc isModerator không hợp lệ', code: 'BAD_REQUEST' });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ error: 'Phòng không tồn tại', code: 'ROOM_NOT_FOUND' });
    }

    const member = room.members.find(m => m.userId && m.userId.toString() === userId);
    if (!member) {
      return res.status(404).json({ error: 'Người dùng không thuộc phòng', code: 'MEMBER_NOT_FOUND' });
    }

    // Host is implicitly moderator; do not allow unsetting host moderation
    if (room.hostId.toString() === userId.toString() && isModerator === false) {
      // keep host as not forced moderator flag, but host always has permissions anyway
      member.isModerator = false; // optional: could ignore
    } else {
      member.isModerator = !!isModerator;
    }

    await room.save();

    return res.json({
      message: 'Cập nhật quyền moderator thành công',
      room: room.toPublicJSON()
    });
  } catch (err) {
    console.error('Admin update moderator error:', err);
    res.status(500).json({ error: 'Lỗi cập nhật moderator', code: 'ADMIN_MODERATOR_ERROR' });
  }
});



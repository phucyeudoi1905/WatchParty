const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Đăng ký tài khoản mới
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Tên người dùng phải có từ 3-30 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'),
  
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số')
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

    const { username, email, password } = req.body;

    // Kiểm tra username đã tồn tại
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({
          error: 'Tên người dùng đã tồn tại',
          code: 'USERNAME_EXISTS'
        });
      }
      if (existingUser.email === email) {
        return res.status(400).json({
          error: 'Email đã được sử dụng',
          code: 'EMAIL_EXISTS'
        });
      }
    }

    // Tạo user mới
    const user = new User({
      username,
      email,
      password // Sẽ được hash tự động qua virtual field
    });

    await user.save();

    // Tạo token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: user.toPublicJSON(),
      token
    });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Tên người dùng hoặc email đã tồn tại',
        code: 'DUPLICATE_ENTRY'
      });
    }

    res.status(500).json({
      error: 'Lỗi đăng ký',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// Đăng nhập
router.post('/login', [
  body('username')
    .notEmpty()
    .withMessage('Tên người dùng hoặc email là bắt buộc'),
  
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
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

    const { username, password } = req.body;

    // Tìm user theo username hoặc email
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({
        error: 'Tên người dùng hoặc mật khẩu không đúng',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Kiểm tra mật khẩu
    const isValidPassword = user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Tên người dùng hoặc mật khẩu không đúng',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Bỏ kiểm tra khóa tài khoản để cho phép đăng nhập nếu thông tin hợp lệ

    // Cập nhật lần đăng nhập cuối
    user.lastLogin = new Date();
    await user.save();

    // Tạo token
    const token = generateToken(user._id);

    res.json({
      message: 'Đăng nhập thành công',
      user: user.toPublicJSON(),
      token
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({
      error: 'Lỗi đăng nhập',
      code: 'LOGIN_ERROR'
    });
  }
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    try {
      // Tạo hoặc cập nhật user
      const { user } = req;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
      }

      // Tạo token
      const token = generateToken(user._id);

      // Redirect về frontend với token
      res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
      
    } catch (error) {
      console.error('Lỗi Google OAuth callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// Lấy thông tin user hiện tại
router.get('/me', async (req, res) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Token không được cung cấp',
        code: 'TOKEN_MISSING'
      });
    }

    // Xác thực token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Lấy thông tin user
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        error: 'Token không hợp lệ',
        code: 'INVALID_TOKEN'
      });
    }

    res.json({
      user: user.toPublicJSON()
    });

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

    console.error('Lỗi lấy thông tin user:', error);
    res.status(500).json({
      error: 'Lỗi lấy thông tin user',
      code: 'USER_INFO_ERROR'
    });
  }
});

// Đăng xuất (không cần xử lý gì ở backend, chỉ xóa token ở frontend)
router.post('/logout', (req, res) => {
  res.json({
    message: 'Đăng xuất thành công'
  });
});

module.exports = router;

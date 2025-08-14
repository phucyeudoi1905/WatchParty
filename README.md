# Watch Party - Nền tảng xem phim cùng nhau

Ứng dụng web cho phép người dùng xem phim đồng bộ với nhau trong thời gian thực, bao gồm chat và điều khiển video.

## Tính năng chính

- 🎬 Xem video đồng bộ với nhóm
- 💬 Chat realtime trong phòng
- 🔐 Xác thực người dùng (JWT + Google OAuth)
- 👥 Quản lý phòng và thành viên
- 🎮 Điều khiển video tập trung

## Công nghệ sử dụng

- **Frontend**: React.js + TailwindCSS
- **Backend**: Node.js + Express + Socket.io
- **Database**: MongoDB (Mongoose)
- **Realtime**: Socket.io
- **Video**: YouTube IFrame API + HLS streaming

## Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js (v16+)
- MongoDB
- npm hoặc yarn

### Backend

1. Di chuyển vào thư mục backend:
```bash
cd backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/watch-party
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
PORT=5000
```

4. Chạy server:
```bash
npm run dev
```

### Frontend

1. Di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy ứng dụng:
```bash
npm start
```

## Cấu trúc dự án

```
watch-party/
├── backend/          # Server Node.js + Express
├── frontend/         # Client React.js
└── README.md
```

## API Endpoints

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/rooms` - Tạo phòng mới
- `GET /api/rooms/:id` - Lấy thông tin phòng
- `POST /api/rooms/:id/join` - Tham gia phòng
- `POST /api/rooms/:id/message` - Gửi tin nhắn
- `POST /api/rooms/:id/control` - Điều khiển video

## Socket Events

- `join-room` - Tham gia phòng
- `leave-room` - Rời phòng
- `video-control` - Điều khiển video
- `chat-message` - Tin nhắn chat
- `user-joined` - Người dùng vào phòng
- `user-left` - Người dùng rời phòng

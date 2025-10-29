# PHÂN TÍCH KIẾN TRÚC HỆ THỐNG WATCH PARTY

## 1. TỔNG QUAN DỰ ÁN

**Watch Party** là một nền tảng web cho phép nhiều người dùng xem video đồng bộ với nhau trong thời gian thực, bao gồm tính năng chat và điều khiển video tập trung.

### 1.1 Mục tiêu chính
- Tạo phòng xem video đồng bộ cho nhiều người dùng
- Cung cấp chat realtime trong khi xem phim
- Hỗ trợ điều khiển video tập trung (play, pause, seek)
- Quản lý phòng và thành viên hiệu quả
- Bảo mật thông tin người dùng

### 1.2 Công nghệ sử dụng
- **Frontend**: React.js + TailwindCSS + Socket.io Client
- **Backend**: Node.js + Express.js + Socket.io
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT + Passport.js (Google OAuth)
- **Real-time**: Socket.io WebSocket

---

## 2. USE CASES CHÍNH

### 2.1 Quản lý người dùng
- **UC001**: Đăng ký tài khoản mới
- **UC002**: Đăng nhập bằng username/email và password
- **UC003**: Đăng nhập bằng Google OAuth
- **UC004**: Xem thông tin profile
- **UC005**: Đăng xuất

### 2.2 Quản lý phòng
- **UC006**: Tạo phòng mới với video URL
- **UC007**: Tham gia phòng bằng mã phòng
- **UC008**: Tham gia phòng bằng mật khẩu
- **UC009**: Rời phòng
- **UC010**: Xem danh sách phòng công khai
- **UC011**: Tìm kiếm phòng theo tên/mô tả
- **UC012**: Lọc phòng theo tags
- **UC013**: Cập nhật thông tin phòng (chỉ host)
- **UC014**: Xóa phòng (chỉ host)

### 2.3 Xem video đồng bộ
- **UC015**: Phát video đồng bộ với các thành viên khác
- **UC016**: Tạm dừng video cho tất cả thành viên
- **UC017**: Chuyển đến thời điểm cụ thể trong video
- **UC018**: Yêu cầu đồng bộ trạng thái video
- **UC019**: Gửi trạng thái video hiện tại

### 2.4 Chat realtime
- **UC020**: Gửi tin nhắn text trong phòng
- **UC021**: Xem tin nhắn của các thành viên khác
- **UC022**: Hiển thị trạng thái đang gõ
- **UC023**: Đánh dấu tin nhắn đã xem
- **UC024**: Thêm reaction vào tin nhắn
- **UC025**: Trả lời tin nhắn cụ thể

### 2.5 Quản lý thành viên
- **UC026**: Xem danh sách thành viên trong phòng
- **UC027**: Thông báo khi có thành viên mới tham gia
- **UC028**: Thông báo khi thành viên rời phòng
- **UC029**: Chuyển quyền host khi host rời phòng

---

## 3. USER FLOW

### 3.1 Flow đăng ký và đăng nhập
```
1. User truy cập trang chủ
2. Chọn "Đăng ký" hoặc "Đăng nhập"
3. Nhập thông tin (username, email, password)
4. Hệ thống xác thực thông tin
5. Tạo JWT token
6. Redirect đến Dashboard
```

### 3.2 Flow tạo và tham gia phòng
```
1. User đăng nhập thành công
2. Vào Dashboard
3. Chọn "Tạo phòng mới" hoặc "Tham gia phòng"
4. Nhập thông tin phòng (tên, video URL, mật khẩu)
5. Hệ thống tạo mã phòng ngẫu nhiên
6. Redirect đến phòng xem video
7. Kết nối Socket.io
8. Tham gia room và bắt đầu xem video
```

### 3.3 Flow xem video đồng bộ
```
1. User vào phòng
2. Socket.io kết nối và join room
3. Nhận trạng thái video hiện tại từ server
4. Đồng bộ video player với trạng thái phòng
5. Lắng nghe các sự kiện video control
6. Cập nhật video player theo sự kiện
```

### 3.4 Flow chat realtime
```
1. User gõ tin nhắn
2. Hiển thị typing indicator
3. Gửi tin nhắn qua Socket.io
4. Server lưu tin nhắn vào database
5. Broadcast tin nhắn đến tất cả thành viên
6. Cập nhật UI chat cho tất cả client
```

---

## 4. LUỒNG THỰC THI

### 4.1 Luồng khởi động hệ thống
```
1. Khởi động MongoDB
2. Khởi động Backend Server (Node.js + Express)
3. Khởi động Socket.io Server
4. Khởi động Frontend (React)
5. Kết nối Frontend với Backend qua HTTP và WebSocket
```

### 4.2 Luồng xác thực
```
1. Client gửi credentials (username/email + password)
2. Server validate input
3. Tìm user trong database
4. So sánh password hash
5. Tạo JWT token
6. Trả về token và user info
7. Client lưu token và sử dụng cho các request tiếp theo
```

### 4.3 Luồng tạo phòng
```
1. Client gửi thông tin phòng (POST /api/rooms)
2. Server validate input và authenticate user
3. Tạo mã phòng ngẫu nhiên (6 ký tự)
4. Lưu phòng vào database
5. Thêm host vào danh sách members
6. Tạo tin nhắn hệ thống
7. Trả về thông tin phòng
8. Client redirect đến phòng
```

### 4.4 Luồng đồng bộ video
```
1. Client A thực hiện action (play/pause/seek)
2. Client A gửi video-control event qua Socket.io
3. Server broadcast event đến tất cả client khác trong room
4. Client B, C, D nhận event và cập nhật video player
5. Server cập nhật trạng thái phòng trong database
```

### 4.5 Luồng chat realtime
```
1. User gõ tin nhắn và nhấn Enter
2. Client gửi chat-message event qua Socket.io
3. Server lưu tin nhắn vào database
4. Server broadcast tin nhắn đến tất cả client trong room
5. Tất cả client cập nhật UI chat
6. Client gửi message-seen event khi đã xem
```

---

## 5. KIẾN TRÚC PHÂN TẦNG

### 5.1 Presentation Layer (Frontend)
```
├── React Components
│   ├── Pages (Home, Login, Register, Dashboard, Room)
│   ├── Components (Navbar, Footer)
│   └── Contexts (AuthContext, SocketContext)
├── Routing (React Router)
├── State Management (React Context + Hooks)
└── UI Framework (TailwindCSS)
```

### 5.2 Business Logic Layer (Backend)
```
├── Routes
│   ├── Authentication (/api/auth)
│   ├── Rooms (/api/rooms)
│   └── Messages (/api/messages)
├── Middleware
│   ├── Authentication (JWT)
│   ├── Validation (express-validator)
│   └── Authorization (role-based)
├── Socket Handlers
│   ├── Room Management
│   ├── Video Control
│   └── Chat Messages
└── Services
    ├── User Service
    ├── Room Service
    └── Message Service
```

### 5.3 Data Access Layer
```
├── Models (Mongoose Schemas)
│   ├── User Model
│   ├── Room Model
│   └── Message Model
├── Database Operations
│   ├── CRUD Operations
│   ├── Query Optimization
│   └── Index Management
└── MongoDB Connection
```

### 5.4 Infrastructure Layer
```
├── Web Server (Express.js)
├── WebSocket Server (Socket.io)
├── Database (MongoDB)
├── Authentication (JWT + Passport)
└── Security (Helmet, CORS, Rate Limiting)
```

---

## 6. KIẾN TRÚC HỆ THỐNG

### 6.1 Kiến trúc tổng thể
```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│   Frontend      │◄────────────────────►│   Backend       │
│   (React.js)    │                      │   (Node.js)     │
│                 │                      │                 │
│ ┌─────────────┐ │                      │ ┌─────────────┐ │
│ │   UI Layer  │ │                      │ │  API Layer  │ │
│ └─────────────┘ │                      │ └─────────────┘ │
│ ┌─────────────┐ │                      │ ┌─────────────┐ │
│ │Socket Client│ │                      │ │Socket Server│ │
│ └─────────────┘ │                      │ └─────────────┘ │
└─────────────────┘                      └─────────────────┘
                                                   │
                                                   │ MongoDB
                                                   ▼
                                         ┌─────────────────┐
                                         │   Database      │
                                         │   (MongoDB)     │
                                         │                 │
                                         │ ┌─────────────┐ │
                                         │ │Collections  │ │
                                         │ │Users/Rooms/ │ │
                                         │ │Messages     │ │
                                         │ └─────────────┘ │
                                         └─────────────────┘
```

### 6.2 Kiến trúc Socket.io
```
┌─────────────────┐                      ┌─────────────────┐
│   Client A      │                      │   Socket.io     │
│                 │                      │   Server        │
│ ┌─────────────┐ │                      │                 │
│ │Video Player │ │                      │ ┌─────────────┐ │
│ └─────────────┘ │                      │ │Room Manager │ │
│ ┌─────────────┐ │                      │ └─────────────┘ │
│ │Chat UI      │ │                      │ ┌─────────────┐ │
│ └─────────────┘ │                      │ │Event Handler│ │
└─────────────────┘                      │ └─────────────┘ │
         │                               └─────────────────┘
         │                                        │
         │ video-control event                    │ broadcast
         │◄───────────────────────────────────────┤
         │                                        │
         │ chat-message event                      │ broadcast
         │◄───────────────────────────────────────┤
```

---

## 7. SƠ ĐỒ HỆ THỐNG

### 7.1 Sơ đồ luồng dữ liệu
```
User Input → Frontend → API Gateway → Business Logic → Database
     ↑                                                    │
     │                                                    ▼
User Interface ← Socket.io ← Event Handler ← Data Processing
```

### 7.2 Sơ đồ kết nối Socket.io
```
Room ABC123:
├── User A (Socket ID: abc123)
├── User B (Socket ID: def456)
└── User C (Socket ID: ghi789)

Events:
├── join-room: User joins room
├── leave-room: User leaves room
├── video-control: Sync video state
├── chat-message: Send message
├── user-typing: Typing indicator
└── message-seen: Mark message as seen
```

### 7.3 Sơ đồ Database Schema
```
Users Collection:
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  role: String,
  googleId: String,
  isVerified: Boolean,
  createdAt: Date
}

Rooms Collection:
{
  _id: ObjectId,
  roomCode: String,
  name: String,
  hostId: ObjectId,
  videoUrl: String,
  videoType: String,
  members: [{
    userId: ObjectId,
    username: String,
    isHost: Boolean
  }],
  settings: {
    allowChat: Boolean,
    allowVideoControl: Boolean
  }
}

Messages Collection:
{
  _id: ObjectId,
  roomId: ObjectId,
  userId: ObjectId,
  username: String,
  content: String,
  messageType: String,
  reactions: [{
    emoji: String,
    userId: ObjectId
  }],
  seenBy: [{
    userId: ObjectId,
    seenAt: Date
  }]
}
```

---

## 8. MÔ TẢ CÁC CHỨC NĂNG

### 8.1 Chức năng Authentication
- **Đăng ký**: Tạo tài khoản mới với username, email, password
- **Đăng nhập**: Xác thực bằng username/email và password
- **Google OAuth**: Đăng nhập bằng tài khoản Google
- **JWT Token**: Quản lý session với JSON Web Token
- **Password Hashing**: Mã hóa mật khẩu bằng bcrypt

### 8.2 Chức năng Room Management
- **Tạo phòng**: Tạo phòng mới với video URL và cài đặt
- **Mã phòng**: Tạo mã phòng ngẫu nhiên 6 ký tự
- **Tham gia phòng**: Join phòng bằng mã hoặc mật khẩu
- **Quản lý thành viên**: Theo dõi danh sách thành viên
- **Cài đặt phòng**: Cho phép host cấu hình phòng

### 8.3 Chức năng Video Synchronization
- **Đồng bộ phát**: Tất cả thành viên xem cùng thời điểm
- **Điều khiển tập trung**: Play, pause, seek đồng bộ
- **Trạng thái video**: Lưu trữ thời gian và trạng thái phát
- **Auto-sync**: Tự động đồng bộ khi có thành viên mới

### 8.4 Chức năng Chat Realtime
- **Tin nhắn text**: Gửi và nhận tin nhắn realtime
- **Typing indicator**: Hiển thị trạng thái đang gõ
- **Message reactions**: Thêm emoji reaction vào tin nhắn
- **Message seen**: Đánh dấu tin nhắn đã xem
- **System messages**: Tin nhắn hệ thống tự động

### 8.5 Chức năng User Management
- **Profile**: Xem và chỉnh sửa thông tin cá nhân
- **Role-based access**: Phân quyền user và admin
- **Session management**: Quản lý đăng nhập/đăng xuất
- **User activity**: Theo dõi hoạt động người dùng

### 8.6 Chức năng Security
- **Input validation**: Kiểm tra dữ liệu đầu vào
- **Rate limiting**: Giới hạn số request
- **CORS**: Cấu hình Cross-Origin Resource Sharing
- **Helmet**: Bảo mật HTTP headers
- **Password policy**: Quy tắc mật khẩu mạnh

---

## 9. API ENDPOINTS

### 9.1 Authentication Endpoints
```
POST /api/auth/register     - Đăng ký tài khoản
POST /api/auth/login        - Đăng nhập
GET  /api/auth/me           - Thông tin user hiện tại
POST /api/auth/logout       - Đăng xuất
GET  /api/auth/google       - Google OAuth
GET  /api/auth/google/callback - Google OAuth callback
```

### 9.2 Room Endpoints
```
POST   /api/rooms           - Tạo phòng mới
GET    /api/rooms           - Danh sách phòng công khai
GET    /api/rooms/:id       - Thông tin phòng theo ID
POST   /api/rooms/:id/join  - Tham gia phòng
POST   /api/rooms/:id/leave - Rời phòng
PUT    /api/rooms/:id       - Cập nhật phòng (host only)
DELETE /api/rooms/:id       - Xóa phòng (host only)
GET    /api/rooms/code/:roomCode - Tìm phòng theo mã
```

### 9.3 Message Endpoints
```
POST /api/messages          - Gửi tin nhắn
GET  /api/messages/:roomId  - Lấy tin nhắn của phòng
PUT  /api/messages/:id     - Chỉnh sửa tin nhắn
POST /api/messages/:id/reaction - Thêm reaction
```

---

## 10. SOCKET EVENTS

### 10.1 Room Events
```
join-room: Tham gia phòng
leave-room: Rời phòng
user-joined: Thông báo user vào phòng
user-left: Thông báo user rời phòng
room-users: Danh sách user trong phòng
```

### 10.2 Video Events
```
video-control: Điều khiển video (play/pause/seek)
request-sync: Yêu cầu đồng bộ trạng thái
sync-state: Gửi trạng thái video hiện tại
```

### 10.3 Chat Events
```
chat-message: Tin nhắn chat
user-typing: Trạng thái đang gõ
message-seen: Đánh dấu tin nhắn đã xem
```

---

## 11. DEPLOYMENT ARCHITECTURE

### 11.1 Development Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database     │
│   (Port 3000)   │◄──►│   (Port 5000)   │◄──►│   (Port 27017) │
│   React Dev     │    │   Node.js       │    │   MongoDB      │
│   Server        │    │   Express       │    │   Local        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 11.2 Production Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   App Server    │    │   Database      │
│   (Nginx)       │◄──►│   (PM2/Docker) │◄──►│   (MongoDB      │
│                 │    │   Node.js       │    │   Atlas/Cluster)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 12. PERFORMANCE CONSIDERATIONS

### 12.1 Database Optimization
- Index trên các trường thường query (username, email, roomCode)
- Pagination cho danh sách phòng và tin nhắn
- Aggregation pipeline cho các query phức tạp

### 12.2 Socket.io Optimization
- Room-based broadcasting thay vì global
- Connection pooling
- Event throttling cho video controls

### 12.3 Frontend Optimization
- React.memo cho components
- Lazy loading cho routes
- Debouncing cho typing indicators
- Virtual scrolling cho chat messages

---

## 13. SECURITY MEASURES

### 13.1 Authentication Security
- JWT token với expiration
- Password hashing với bcrypt
- Rate limiting cho login attempts
- Input validation và sanitization

### 13.2 API Security
- CORS configuration
- Helmet security headers
- Request size limiting
- SQL injection prevention (NoSQL)

### 13.3 Socket Security
- JWT authentication cho socket connections
- Room-based access control
- Event validation
- Connection rate limiting

---

## 14. MONITORING & LOGGING

### 14.1 Application Monitoring
- Server health checks
- Database connection monitoring
- Socket.io connection tracking
- Error logging và tracking

### 14.2 Performance Monitoring
- Response time tracking
- Memory usage monitoring
- Database query performance
- Socket.io event frequency

---

## 15. FUTURE ENHANCEMENTS

### 15.1 Planned Features
- Video streaming server integration
- Mobile app (React Native)
- Advanced video controls (speed, quality)
- File sharing trong phòng
- Video recording và playback
- Push notifications
- User presence indicators

### 15.2 Scalability Improvements
- Microservices architecture
- Redis for session storage
- CDN for static assets
- Horizontal scaling với load balancer
- Database sharding

---

**Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc và chức năng của hệ thống Watch Party, giúp hiểu rõ cách thức hoạt động và các thành phần của ứng dụng.**

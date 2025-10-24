# BÁO CÁO ĐỒ ÁN CUỐI KỲ
## WATCH PARTY - NỀN TẢNG XEM PHIM CÙNG NHAU

---

## 1. THÔNG TIN DỰ ÁN

**Tên dự án:** Watch Party - Nền tảng xem phim cùng nhau  
**Mô tả:** Ứng dụng web cho phép người dùng xem phim đồng bộ với nhau trong thời gian thực, bao gồm chat và điều khiển video.  
**Ngôn ngữ lập trình:** JavaScript, HTML, CSS  
**Framework:** React.js (Frontend), Node.js + Express (Backend)  
**Database:** MongoDB  

---

## 2. MỤC TIÊU DỰ ÁN

### 2.1 Mục tiêu chính
- Tạo nền tảng cho phép nhiều người xem video cùng lúc một cách đồng bộ
- Cung cấp tính năng chat realtime trong khi xem phim
- Hỗ trợ điều khiển video tập trung (play, pause, seek)
- Quản lý phòng và thành viên hiệu quả

### 2.2 Mục tiêu phụ
- Xây dựng giao diện thân thiện, dễ sử dụng
- Đảm bảo bảo mật thông tin người dùng
- Tối ưu hiệu suất cho nhiều người dùng đồng thời

---

## 3. TÍNH NĂNG CHÍNH

### 3.1 Tính năng cốt lõi
- **Xem video đồng bộ:** Tất cả người dùng trong phòng xem cùng một thời điểm
- **Chat realtime:** Giao tiếp trong khi xem phim
- **Điều khiển video:** Play, pause, seek được đồng bộ
- **Quản lý phòng:** Tạo, tham gia, rời phòng

### 3.2 Tính năng bổ sung
- **Xác thực người dùng:** Đăng ký, đăng nhập, Google OAuth
- **Phân quyền:** Admin, User
- **Bảo mật:** JWT tokens, password hashing
- **Responsive design:** Tương thích mobile

---

## 4. CÔNG NGHỆ SỬ DỤNG

### 4.1 Frontend
- **React.js:** Framework JavaScript cho UI
- **TailwindCSS:** CSS framework cho styling
- **Socket.io Client:** Kết nối realtime
- **React Router:** Điều hướng trang
- **Axios:** HTTP client

### 4.2 Backend
- **Node.js:** Runtime JavaScript
- **Express.js:** Web framework
- **Socket.io:** Real-time communication
- **MongoDB:** NoSQL database
- **Mongoose:** ODM cho MongoDB
- **JWT:** Authentication tokens
- **Passport.js:** Authentication middleware

### 4.3 Database
- **MongoDB:** Document database
- **Collections:** Users, Rooms, Messages

---

## 5. KIẾN TRÚC HỆ THỐNG

### 5.1 Kiến trúc tổng thể
```
Client (React) ←→ Backend (Node.js) ←→ Database (MongoDB)
     ↕                    ↕
Socket.io ←→ Real-time Communication
```

### 5.2 Luồng dữ liệu
1. **Authentication:** User đăng nhập → JWT token
2. **Room Management:** Tạo/tham gia phòng → Lưu vào DB
3. **Video Sync:** Điều khiển video → Broadcast qua Socket.io
4. **Chat:** Tin nhắn → Broadcast realtime

---

## 6. THIẾT KẾ DATABASE

### 6.1 Collection Users
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  role: String,
  createdAt: Date
}
```

### 6.2 Collection Rooms
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  createdBy: ObjectId,
  maxUsers: Number,
  isPrivate: Boolean,
  password: String,
  createdAt: Date
}
```

### 6.3 Collection Messages
```javascript
{
  _id: ObjectId,
  roomId: ObjectId,
  userId: ObjectId,
  content: String,
  timestamp: Date
}
```

---

## 7. API ENDPOINTS

### 7.1 Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Thông tin user

### 7.2 Rooms
- `POST /api/rooms` - Tạo phòng
- `GET /api/rooms` - Danh sách phòng
- `GET /api/rooms/:id` - Chi tiết phòng
- `POST /api/rooms/:id/join` - Tham gia phòng

### 7.3 Messages
- `POST /api/messages` - Gửi tin nhắn
- `GET /api/messages/:roomId` - Lấy tin nhắn phòng

---

## 8. SOCKET EVENTS

### 8.1 Room Events
- `join-room` - Tham gia phòng
- `leave-room` - Rời phòng
- `user-joined` - User vào phòng
- `user-left` - User rời phòng

### 8.2 Video Events
- `video-control` - Điều khiển video
- `request-sync` - Yêu cầu đồng bộ
- `sync-state` - Trạng thái đồng bộ

### 8.3 Chat Events
- `chat-message` - Tin nhắn chat

---

## 9. GIAO DIỆN NGƯỜI DÙNG

### 9.1 Trang chủ
- Giới thiệu ứng dụng
- Nút đăng nhập/đăng ký

### 9.2 Dashboard
- Danh sách phòng
- Tạo phòng mới
- Tham gia phòng

### 9.3 Phòng xem phim
- Video player
- Chat box
- Danh sách thành viên
- Điều khiển video

---

## 10. BẢO MẬT

### 10.1 Authentication
- JWT tokens cho session
- Password hashing với bcrypt
- Google OAuth integration

### 10.2 Authorization
- Middleware xác thực
- Role-based access control
- Rate limiting

### 10.3 Data Protection
- Input validation
- CORS configuration
- Helmet security headers

---

## 11. TESTING

### 11.1 Unit Testing
- Test các API endpoints
- Test authentication flow
- Test database operations

### 11.2 Integration Testing
- Test Socket.io events
- Test real-time features
- Test end-to-end workflows

---

## 12. DEPLOYMENT

### 12.1 Development
- Local development với npm scripts
- Hot reload cho frontend
- Nodemon cho backend

### 12.2 Production
- Docker containers
- PM2 process manager
- Environment variables

---

## 13. KẾT QUẢ ĐẠT ĐƯỢC

### 13.1 Tính năng hoàn thành
✅ Xem video đồng bộ  
✅ Chat realtime  
✅ Điều khiển video tập trung  
✅ Quản lý phòng và user  
✅ Authentication & Authorization  
✅ Responsive design  

### 13.2 Hiệu suất
- Hỗ trợ đồng thời nhiều phòng
- Real-time communication ổn định
- Database queries được tối ưu

---

## 14. HẠN CHẾ VÀ HƯỚNG PHÁT TRIỂN

### 14.1 Hạn chế hiện tại
- Chưa hỗ trợ video streaming từ server
- Chưa có tính năng recording
- Chưa có notification system

### 14.2 Hướng phát triển
- Thêm video streaming server
- Mobile app (React Native)
- Advanced video controls
- File sharing trong phòng
- Video recording và playback

---

## 15. KẾT LUẬN

Dự án Watch Party đã thành công xây dựng một nền tảng xem phim cùng nhau với các tính năng cốt lõi hoạt động ổn định. Ứng dụng sử dụng các công nghệ hiện đại và có kiến trúc mở rộng tốt.

**Điểm mạnh:**
- Kiến trúc rõ ràng, dễ bảo trì
- Sử dụng công nghệ phù hợp
- Giao diện thân thiện
- Bảo mật tốt

**Bài học kinh nghiệm:**
- Tầm quan trọng của real-time communication
- Cần thiết kế database hiệu quả
- Testing là yếu tố quan trọng
- User experience quyết định thành công

---

**Ngày hoàn thành:** [Ngày hoàn thành]  
**Sinh viên thực hiện:** [Tên sinh viên]  
**MSSV:** [Mã số sinh viên]  
**Giảng viên hướng dẫn:** [Tên giảng viên]

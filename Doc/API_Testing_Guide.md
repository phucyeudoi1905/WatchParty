# Watch Party API Testing Guide

Tài liệu này cung cấp hướng dẫn chi tiết để kiểm tra các API của ứng dụng Watch Party.

## Cài đặt cơ bản

**Base URL:** `http://localhost:5000/api`

**Headers cần thiết:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN> (cho các API yêu cầu xác thực)
```

---

## 1. Authentication APIs (`/api/auth`)

### 1.1 Đăng ký tài khoản
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123"
}
```

**Response thành công (201):**
```json
{
  "message": "Đăng ký thành công",
  "user": {
    "_id": "user_id",
    "username": "testuser",
    "email": "test@example.com",
    "avatar": "default_avatar_url",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

**Test Cases:**
- ✅ Đăng ký với dữ liệu hợp lệ
- ❌ Username đã tồn tại
- ❌ Email đã tồn tại
- ❌ Password yếu (thiếu chữ hoa, số)
- ❌ Username < 3 ký tự
- ❌ Email không hợp lệ

### 1.2 Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "Test123"
}
```

**Response thành công (200):**
```json
{
  "message": "Đăng nhập thành công",
  "user": {
    "_id": "user_id",
    "username": "testuser",
    "email": "test@example.com",
    "avatar": "default_avatar_url",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

**Test Cases:**
- ✅ Đăng nhập với username hợp lệ
- ✅ Đăng nhập với email hợp lệ
- ❌ Sai mật khẩu
- ❌ Tài khoản không tồn tại
- ❌ Tài khoản bị khóa

### 1.3 Lấy thông tin user hiện tại
```http
GET /api/auth/me
Authorization: Bearer <JWT_TOKEN>
```

**Response thành công (200):**
```json
{
  "user": {
    "_id": "user_id",
    "username": "testuser",
    "email": "test@example.com",
    "avatar": "default_avatar_url",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 1.4 Đăng xuất
```http
POST /api/auth/logout
Authorization: Bearer <JWT_TOKEN>
```

### 1.5 Google OAuth
```http
GET /api/auth/google
```
Redirect đến Google OAuth page

```http
GET /api/auth/google/callback
```
Google callback endpoint

---

## 2. Room APIs (`/api/rooms`)

**Lưu ý:** Tất cả Room APIs yêu cầu JWT token trong header Authorization.

### 2.1 Tạo phòng mới
```http
POST /api/rooms
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Phòng xem phim chill",
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "videoType": "youtube",
  "description": "Xem phim cùng nhau",
  "password": "1234",
  "maxMembers": 10,
  "isPrivate": false,
  "tags": ["comedy", "music"]
}
```

**Response thành công (201):**
```json
{
  "message": "Tạo phòng thành công",
  "room": {
    "_id": "room_id",
    "roomCode": "ABC123",
    "name": "Phòng xem phim chill",
    "description": "Xem phim cùng nhau",
    "hostId": "user_id",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "videoType": "youtube",
    "isPrivate": false,
    "maxMembers": 10,
    "members": [
      {
        "userId": "user_id",
        "username": "testuser",
        "joinedAt": "2024-01-01T00:00:00.000Z",
        "isHost": true
      }
    ],
    "tags": ["comedy", "music"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Test Cases:**
- ✅ Tạo phòng công khai không mật khẩu
- ✅ Tạo phòng riêng tư có mật khẩu
- ❌ Tên phòng < 3 ký tự
- ❌ URL video không hợp lệ
- ❌ maxMembers < 2 hoặc > 100

### 2.2 Lấy danh sách phòng công khai
```http
GET /api/rooms?page=1&limit=10&search=phim&tags=comedy,music
Authorization: Bearer <JWT_TOKEN>
```

**Response thành công (200):**
```json
{
  "rooms": [
    {
      "_id": "room_id",
      "roomCode": "ABC123",
      "name": "Phòng xem phim chill",
      "description": "Xem phim cùng nhau",
      "hostId": {
        "_id": "user_id",
        "username": "testuser"
      },
      "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "videoType": "youtube",
      "currentMembers": 1,
      "maxMembers": 10,
      "tags": ["comedy", "music"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### 2.3 Lấy thông tin phòng theo ID
```http
GET /api/rooms/ROOM_ID
Authorization: Bearer <JWT_TOKEN>
```

### 2.4 Tìm phòng theo mã
```http
GET /api/rooms/code/ABC123
Authorization: Bearer <JWT_TOKEN>
```

### 2.5 Tham gia phòng
```http
POST /api/rooms/ROOM_ID/join
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "password": "1234"
}
```

**Test Cases:**
- ✅ Tham gia phòng không mật khẩu
- ✅ Tham gia phòng có mật khẩu đúng
- ❌ Sai mật khẩu phòng
- ❌ Phòng đã đầy
- ❌ Đã là thành viên
- ❌ Phòng không tồn tại

### 2.6 Rời phòng
```http
POST /api/rooms/ROOM_ID/leave
Authorization: Bearer <JWT_TOKEN>
```

### 2.7 Cập nhật thông tin phòng (chỉ host)
```http
PUT /api/rooms/ROOM_ID
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Tên phòng mới",
  "description": "Mô tả mới",
  "videoUrl": "https://new-video-url.com",
  "password": "newpass",
  "maxMembers": 15,
  "isPrivate": true
}
```

### 2.8 Xóa phòng (chỉ host)
```http
DELETE /api/rooms/ROOM_ID
Authorization: Bearer <JWT_TOKEN>
```

---

## 3. Message APIs (`/api/messages`)

**Lưu ý:** Tất cả Message APIs yêu cầu JWT token và user phải là thành viên của phòng.

### 3.1 Gửi tin nhắn
```http
POST /api/messages/ROOM_ID
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "content": "Hello everyone! 👋",
  "replyTo": "message_id_optional"
}
```

**Response thành công (201):**
```json
{
  "message": "Gửi tin nhắn thành công",
  "data": {
    "_id": "message_id",
    "roomId": "room_id",
    "userId": "user_id",
    "username": "testuser",
    "content": "Hello everyone! 👋",
    "replyTo": {
      "messageId": "replied_message_id",
      "username": "original_sender"
    },
    "reactions": [],
    "editHistory": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Test Cases:**
- ✅ Gửi tin nhắn thường
- ✅ Reply tin nhắn
- ❌ Nội dung trống
- ❌ Nội dung > 1000 ký tự
- ❌ Chat bị tắt trong phòng
- ❌ Không phải thành viên phòng

### 3.2 Lấy danh sách tin nhắn
```http
GET /api/messages/ROOM_ID?page=1&limit=50&before=2024-01-01T00:00:00.000Z
Authorization: Bearer <JWT_TOKEN>
```

### 3.3 Chỉnh sửa tin nhắn
```http
PUT /api/messages/ROOM_ID/MESSAGE_ID
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "content": "Nội dung đã chỉnh sửa"
}
```

### 3.4 Xóa tin nhắn
```http
DELETE /api/messages/ROOM_ID/MESSAGE_ID
Authorization: Bearer <JWT_TOKEN>
```

### 3.5 Thêm reaction
```http
POST /api/messages/ROOM_ID/MESSAGE_ID/reaction
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "emoji": "👍"
}
```

### 3.6 Lấy tin nhắn theo ID
```http
GET /api/messages/ROOM_ID/MESSAGE_ID
Authorization: Bearer <JWT_TOKEN>
```

### 3.7 Tìm kiếm tin nhắn
```http
GET /api/messages/ROOM_ID/search?q=hello&page=1&limit=20
Authorization: Bearer <JWT_TOKEN>
```

---

## 4. Health Check

### 4.1 Kiểm tra trạng thái server
```http
GET /health
```

**Response thành công (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 5. WebSocket Events

**Connection:** `ws://localhost:5000`

### 5.1 Tham gia phòng
```javascript
socket.emit('join-room', {
  roomId: 'room_id',
  userId: 'user_id',
  username: 'testuser'
});
```

### 5.2 Điều khiển video
```javascript
socket.emit('video-control', {
  roomId: 'room_id',
  action: 'play', // 'play', 'pause', 'seek'
  time: 120, // giây
  userId: 'user_id'
});
```

### 5.3 Gửi tin nhắn chat
```javascript
socket.emit('chat-message', {
  roomId: 'room_id',
  message: 'Hello!',
  userId: 'user_id',
  username: 'testuser'
});
```

### 5.4 Rời phòng
```javascript
socket.emit('leave-room', {
  roomId: 'room_id',
  userId: 'user_id',
  username: 'testuser'
});
```

---

## 6. Error Codes

### Authentication Errors
- `USERNAME_EXISTS`: Tên người dùng đã tồn tại
- `EMAIL_EXISTS`: Email đã được sử dụng
- `INVALID_CREDENTIALS`: Sai thông tin đăng nhập
- `TOKEN_MISSING`: Thiếu token
- `INVALID_TOKEN`: Token không hợp lệ
- `TOKEN_EXPIRED`: Token đã hết hạn

### Room Errors
- `ROOM_NOT_FOUND`: Phòng không tồn tại
- `ROOM_DELETED`: Phòng đã bị xóa
- `WRONG_PASSWORD`: Sai mật khẩu phòng
- `ROOM_FULL`: Phòng đã đầy
- `ALREADY_MEMBER`: Đã là thành viên

### Message Errors
- `CHAT_DISABLED`: Chat bị tắt
- `MESSAGE_NOT_FOUND`: Tin nhắn không tồn tại
- `EDIT_PERMISSION_DENIED`: Không có quyền chỉnh sửa
- `DELETE_PERMISSION_DENIED`: Không có quyền xóa

---

## 7. Testing Tools

### Postman Collection
1. Import file này vào Postman
2. Tạo environment với variables:
   - `baseUrl`: http://localhost:5000/api
   - `token`: JWT token sau khi đăng nhập

### Curl Examples

**Đăng ký:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123"
  }'
```

**Đăng nhập:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123"
  }'
```

**Tạo phòng:**
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Room",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "videoType": "youtube"
  }'
```

---

## 8. Testing Checklist

### ✅ Authentication Flow
- [ ] Đăng ký với dữ liệu hợp lệ
- [ ] Đăng nhập thành công
- [ ] Lấy thông tin user
- [ ] Token expiration handling
- [ ] Google OAuth flow

### ✅ Room Management
- [ ] Tạo phòng công khai
- [ ] Tạo phòng riêng tư có mật khẩu
- [ ] Tham gia phòng
- [ ] Rời phòng
- [ ] Cập nhật thông tin phòng (host)
- [ ] Xóa phòng (host)
- [ ] Tìm phòng theo mã

### ✅ Messaging
- [ ] Gửi tin nhắn
- [ ] Chỉnh sửa tin nhắn
- [ ] Xóa tin nhắn
- [ ] Reply tin nhắn
- [ ] Add/remove reactions
- [ ] Tìm kiếm tin nhắn

### ✅ Real-time Features
- [ ] Socket connection
- [ ] Join/leave room events
- [ ] Video control synchronization
- [ ] Real-time chat

### ✅ Error Handling
- [ ] Validation errors
- [ ] Authentication errors
- [ ] Permission errors
- [ ] Not found errors
- [ ] Server errors

---

## 9. Performance Testing

### Load Testing
- Concurrent users: 100+
- Messages per second: 50+
- Room capacity: 20 users per room

### Rate Limiting
- 100 requests per 15 minutes per IP
- Chat message rate limiting via Socket.io

---

Cập nhật lần cuối: $(date)
Phiên bản API: 1.0.0

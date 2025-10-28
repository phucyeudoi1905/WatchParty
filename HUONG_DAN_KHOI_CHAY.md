# Hướng Dẫn Khởi Chạy Watch Party

## ✅ Đã thực hiện

1. ✅ Cài đặt dependencies cho backend và frontend
2. ✅ Tạo file `.env` từ template
3. ✅ Sửa lỗi đăng ký trong User model và auth route
   - Sửa virtual field `password` để hash mật khẩu đúng cách
   - Sửa registration route để trigger virtual setter

## ⚠️ Cần thực hiện

### Bước 1: Cài đặt và khởi động MongoDB

**Option A: MongoDB Atlas (Khuyến nghị - Dễ nhất)**

1. Truy cập https://www.mongodb.com/cloud/atlas/register
2. Tạo tài khoản miễn phí
3. Tạo cluster miễn phí (chọn Free tier)
4. Tạo database user:
   - Username: `watchparty`
   - Password: (đặt mật khẩu của bạn)
5. Whitelist IP: Click "Add My Current IP Address" hoặc "Allow Access from Anywhere" (0.0.0.0/0)
6. Click "Connect" → "Connect your application"
7. Copy connection string, ví dụ:
   ```
   mongodb+srv://watchparty:<password>@cluster0.xxxxx.mongodb.net/
   ```
8. Sửa file `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://watchparty:<password>@cluster0.xxxxx.mongodb.net/watch-party?retryWrites=true&w=majority
   ```
   (Thay `<password>` bằng mật khẩu đã đặt)

**Option B: MongoDB Local (Cài đặt trên máy)**

1. Tải MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Cài đặt MongoDB với các tùy chọn mặc định
3. Khởi động MongoDB service:
   ```powershell
   net start MongoDB
   ```
4. Hoặc chạy MongoDB thủ công:
   ```powershell
   "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
   ```
5. File `.env` đã đúng:
   ```env
   MONGODB_URI=mongodb://localhost:27017/watch-party
   ```

**Option C: Docker (Nếu đã cài Docker)**

```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Bước 2: Khởi động Backend

Mở terminal mới và chạy:
```powershell
cd backend
npm start
```

Bạn sẽ thấy:
```
✅ Kết nối MongoDB thành công
🚀 Server đang chạy trên port 5000
```

### Bước 3: Khởi động Frontend

Mở terminal mới khác và chạy:
```powershell
cd frontend
npm start
```

Bạn sẽ thấy:
```
Compiled successfully!
You can now view watch-party-frontend in the browser.
  Local:            http://localhost:3000
```

### Bước 4: Test đăng ký

1. Mở trình duyệt tại http://localhost:3000
2. Chuyển đến trang đăng ký (Register)
3. Nhập thông tin:
   - Username: `testuser` (ít nhất 3 ký tự)
   - Email: `test@example.com`
   - Password: `Test123` (ít nhất 6 ký tự, có chữ hoa, thường và số)
4. Click "Đăng ký"
5. Kiểm tra:
   - Nếu thành công: sẽ chuyển đến trang dashboard
   - Nếu lỗi: kiểm tra console browser (F12) để xem chi tiết

## 🔧 Các lỗi thường gặp

### Lỗi: "MongoDB connection failed"
- **Nguyên nhân**: MongoDB chưa chạy hoặc connection string sai
- **Giải pháp**: Kiểm tra MongoDB đang chạy và connection string trong `.env`

### Lỗi: "Failed to load resource: 500"
- **Nguyên nhân**: Backend gặp lỗi
- **Giải pháp**: Kiểm tra console backend để xem error chi tiết

### Lỗi: "Email đã được sử dụng"
- **Nguyên nhân**: Email đã tồn tại trong database
- **Giải pháp**: Sử dụng email khác hoặc clear database

## 📝 Tóm tắt thay đổi code

### File đã sửa:

1. **backend/models/User.js**
   - Thêm virtual field configuration `toJSON` và `toObject`
   - Thêm pre-save hook để validate password
   - Sửa `required: false` cho passwordHash

2. **backend/routes/auth.js**
   - Sửa cách tạo user mới: tạo user trước, sau đó set password
   - Cải thiện error logging

## 🎯 Kết quả mong đợi

Sau khi hoàn thành tất cả các bước:
- ✅ Backend chạy tại http://localhost:5000
- ✅ Frontend chạy tại http://localhost:3000
- ✅ MongoDB kết nối thành công
- ✅ Đăng ký người dùng hoạt động bình thường
- ✅ Có thể tạo phòng xem video
- ✅ Có thể chat và đồng bộ video trong phòng

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console backend (terminal chạy `npm start`)
2. Console frontend (DevTools F12)
3. Network tab trong DevTools để xem request/response
4. Logs MongoDB nếu dùng local


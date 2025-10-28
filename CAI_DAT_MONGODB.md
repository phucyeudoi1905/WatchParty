# Hướng Dẫn Cài Đặt và Khởi Động MongoDB Local

## Tùy chọn 1: MongoDB Community Edition (Local) - Khuyến nghị

### Bước 1: Tải MongoDB
1. Truy cập: https://www.mongodb.com/try/download/community
2. Chọn:
   - Version: Latest (7.0)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

### Bước 2: Cài đặt
1. Chạy file `.msi` đã tải về
2. Chọn "Complete" installation
3. Chọn "Install MongoD as a Service" (quan trọng!)
4. Đặt tên service: `MongoDB`
5. Cấu hình:
   - Data Directory: `C:\data\db` (mặc định)
   - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log`
6. Cài đặt MongoDB Compass (GUI tool) - Tùy chọn nhưng khuyến nghị
7. Click "Install"

### Bước 3: Khởi động MongoDB Service

**Kiểm tra service:**
```powershell
Get-Service -Name MongoDB
```

**Nếu service đã chạy:**
```powershell
# Service sẽ tự động chạy sau khi cài đặt
```

**Nếu service chưa chạy:**
```powershell
net start MongoDB
```

**Hoặc khởi động bằng PowerShell:**
```powershell
Start-Service -Name MongoDB
```

### Bước 4: Kiểm tra MongoDB

**Kiểm tra MongoDB đang chạy:**
```powershell
mongosh
```

Nếu hiện prompt: `test>` nghĩa là MongoDB đã hoạt động!

**Hoặc test connection:**
```powershell
mongosh --eval "db.version()"
```

**Xem service status:**
```powershell
Get-Service -Name MongoDB | Select-Object Name, Status, StartType
```

### Bước 5: Cấu hình cho Watch Party

MongoDB sẽ chạy tại: `mongodb://localhost:27017`

Cập nhật `backend/.env` (đã tự động tạo từ env.example):
```env
MONGODB_URI=mongodb://localhost:27017/watch-party
```

---

## Tùy chọn 2: MongoDB Atlas (Cloud) - Nếu không muốn cài local

Nếu bạn muốn sử dụng cloud thay vì cài đặt local:

### Bước 1: Tạo tài khoản
1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký tài khoản miễn phí

### Bước 2: Tạo Cluster
1. Chọn "Build a Database"
2. Chọn **FREE** tier (M0)
3. Chọn provider: AWS/Azure/GCP
4. Chọn region gần Việt Nam (Singapore - ap-southeast-1)
5. Đặt tên cluster: `WatchParty` hoặc để mặc định
6. Click "Create"

### Bước 3: Tạo Database User
1. Chọn "Database Access" ở menu bên trái
2. Click "Add New Database User"
3. Chọn "Password" authentication
4. Tạo user:
   - Username: `watchparty`
   - Password: Đặt password an toàn (ví dụ: `WatchParty123!`)
5. Chọn "Read and write to any database"
6. Click "Add User"

### Bước 4: Whitelist IP
1. Chọn "Network Access" ở menu bên trái
2. Click "Add IP Address"
3. Chọn "Allow Access from Anywhere" (0.0.0.0/0) - cho development
4. Click "Confirm"

### Bước 5: Lấy Connection String
1. Chọn "Database" ở menu bên trái
2. Click "Connect" trên cluster của bạn
3. Chọn "Connect your application"
4. Chọn driver: "Node.js" version "5.5 or later"
5. Copy connection string, ví dụ:
   ```
   mongodb+srv://watchparty:<password>@cluster0.xxxxx.mongodb.net/
   ```

### Bước 6: Cấu hình
Cập nhật `backend/.env`:
```env
MONGODB_URI=mongodb+srv://watchparty:<password>@cluster0.xxxxx.mongodb.net/watch-party?retryWrites=true&w=majority
```

**Thay `<password>`** bằng password đã tạo ở bước 3.

---

## Khởi động Watch Party sau khi MongoDB sẵn sàng

### 1. Kiểm tra MongoDB
```powershell
mongosh
```
Nếu kết nối được, nhập `exit` để thoát.

### 2. Khởi động Backend
```powershell
cd backend
npm start
```

Bạn sẽ thấy:
```
✅ Kết nối MongoDB thành công
🚀 Server đang chạy trên port 5000
```

### 3. Khởi động Frontend (terminal khác)
```powershell
cd frontend
npm start
```

Trình duyệt sẽ tự động mở tại: http://localhost:3000

### 4. Test đăng ký
1. Mở http://localhost:3000
2. Chuyển đến trang đăng ký
3. Nhập thông tin:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123`
4. Click "Đăng ký"

Nếu thấy "Đăng ký thành công" và chuyển đến dashboard → Hoàn tất! ✅

---

## Troubleshooting

### Lỗi: "Service 'MongoDB' không tồn tại"
- MongoDB chưa được cài đặt đúng cách
- Thử cài đặt lại MongoDB và chọn "Install as a Service"

### Lỗi: "Cannot connect to MongoDB"
- Kiểm tra service: `Get-Service -Name MongoDB`
- Khởi động service: `net start MongoDB`
- Kiểm tra MongoDB Compass có kết nối được không

### Lỗi: "MongoServerError: Authentication failed"
- Kiểm tra username và password trong connection string
- Xem lại hướng dẫn Atlas bước 3

### Lỗi: "MongooseServerSelectionError: connect ECONNREFUSED"
- MongoDB service chưa chạy
- Chạy: `net start MongoDB`
- Hoặc kiểm tra firewall đang block port 27017


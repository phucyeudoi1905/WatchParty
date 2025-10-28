# KHẮC PHỤC LỖI ĐĂNG KÝ 500

## 🔍 Nguyên nhân
Lỗi 500 khi đăng ký do **MongoDB chưa được cài đặt hoặc chưa chạy**.

Backend cần kết nối MongoDB để lưu thông tin người dùng.

---

## ⚡ Giải pháp nhanh (Chọn 1 trong 2)

### 🎯 Option 1: MongoDB Atlas (Khuyến nghị - 5 phút)

**Bước 1:** Đăng ký tại https://www.mongodb.com/cloud/atlas/register

**Bước 2:** Tạo Free Cluster
- Click "Build a Database"
- Chọn FREE (M0)
- Region: Singapore (ap-southeast-1)
- Click "Create"

**Bước 3:** Tạo Database User
- Menu trái: "Database Access"
- Click "Add New Database User"
- Username: `watchparty`
- Password: Đặt password của bạn (ví dụ: `Watch123!`)
- Privileges: "Read and write to any database"
- Click "Add User"

**Bước 4:** Whitelist IP
- Menu trái: "Network Access"
- Click "Add IP Address"
- Chọn "Allow Access from Anywhere" (0.0.0.0/0)
- Click "Confirm"

**Bước 5:** Lấy Connection String
- Menu trái: "Database"
- Click "Connect" trên cluster
- Chọn "Connect your application"
- Driver: Node.js (5.5 or later)
- Copy connection string

**Bước 6:** Cập nhật file `.env`
Mở file `backend\.env` và thay dòng:
```
MONGODB_URI=mongodb+srv://watchparty:<password>@cluster0.xxxxx.mongodb.net/watch-party?retryWrites=true&w=majority
```
⚠️ **Thay `<password>` bằng password bạn đã đặt ở bước 3**

**Bước 7:** Khởi động lại backend
- Ctrl+C trong terminal backend
- Chạy lại: `npm start`

---

### 🖥️ Option 2: MongoDB Local (Cài trên máy)

**Bước 1:** Tải MongoDB
- Truy cập: https://www.mongodb.com/try/download/community
- Chọn: Version Latest, Platform Windows, Package MSI
- Click "Download"

**Bước 2:** Cài đặt
- Chạy file `.msi`
- Chọn "Complete" installation
- **Quan trọng:** Chọn "Install MongoD as a Service"
- Data Directory: `C:\data\db` (mặc định)
- Click "Install"

**Bước 3:** Khởi động MongoDB
```powershell
net start MongoDB
```

**Bước 4:** Kiểm tra
```powershell
mongosh
```
Nếu hiện prompt `test>` → MongoDB đã hoạt động!

**Bước 5:** Khởi động lại backend
- Ctrl+C trong terminal backend
- Chạy lại: `npm start`

---

## 🧪 Test đăng ký

Sau khi MongoDB đã sẵn sàng:

1. **Mở trình duyệt**: http://localhost:3000
2. **Click "Đăng ký"**
3. **Nhập thông tin**:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123`
4. **Click "Đăng ký"**

### ✅ Thành công:
- Chuyển đến Dashboard
- Có thể tạo phòng xem video
- Có thể chat và đồng bộ video

### ❌ Vẫn lỗi:
- Kiểm tra console backend (terminal backend)
- Kiểm tra browser DevTools (F12) → Console
- Đảm bảo MongoDB connection string đúng

---

## 🔧 Debug

**Kiểm tra backend logs:**
- Terminal backend sẽ hiện: `✅ Kết nối MongoDB thành công`
- Nếu thấy: `❌ Lỗi kết nối MongoDB` → MongoDB chưa sẵn sàng

**Kiểm tra MongoDB:**
```powershell
# Test connection
mongosh
# Hoặc
mongosh --eval "db.version()"
```

**Kiểm tra service:**
```powershell
Get-Service -Name MongoDB
```

---

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề:
1. Xem console backend để biết lỗi cụ thể
2. Kiểm tra MongoDB đang chạy
3. Xem file **BUOC_TIEP_THEO.md** để biết thêm chi tiết


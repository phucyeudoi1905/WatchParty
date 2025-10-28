# Hướng Dẫn Nhanh - Khởi Chạy Watch Party

## Bước 1: Cài đặt MongoDB (Chọn 1 trong 3 cách)

### 🎯 Cách dễ nhất: MongoDB Atlas (Cloud - Miễn phí)

Tôi đã mở trình duyệt cho bạn. Thực hiện theo các bước:

1. **Đăng ký tài khoản** (nếu chưa có)
2. **Tạo Free Cluster**:
   - Click "Build a Database"
   - Chọn FREE (M0)
   - Chọn region: Singapore (ap-southeast-1)
   - Tên cluster: `WatchParty` (hoặc để mặc định)
   - Click "Create"

3. **Tạo Database User**:
   - Menu trái: "Database Access" 
   - Click "Add New Database User"
   - Username: `watchparty`
   - Password: Đặt password của bạn (Ví dụ: `Watch123!`)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP**:
   - Menu trái: "Network Access"
   - Click "Add IP Address"
   - Chọn: "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Lấy Connection String**:
   - Menu trái: "Database"
   - Click "Connect" trên cluster của bạn
   - Chọn "Connect your application"
   - Driver: Node.js (5.5 or later)
   - Copy connection string

6. **Cập nhật .env**:
   Mở file `backend\.env` và paste connection string vào:
   ```
   MONGODB_URI=mongodb+srv://watchparty:<password>@cluster0.xxxxx.mongodb.net/watch-party?retryWrites=true&w=majority
   ```
   ⚠️ **Thay `<password>` bằng password bạn đã đặt ở bước 3**

---

## Bước 2: Khởi động Backend

Mở terminal mới và chạy:
```bash
cd backend
npm start
```

Bạn sẽ thấy:
```
✅ Kết nối MongoDB thành công
🚀 Server đang chạy trên port 5000
```

---

## Bước 3: Khởi động Frontend

Mở terminal thứ 2 và chạy:
```bash
cd frontend
npm start
```

Trình duyệt sẽ tự động mở tại: http://localhost:3000

---

## Bước 4: Test đăng ký

1. Mở http://localhost:3000
2. Click "Đăng ký" hoặc "Register"
3. Nhập thông tin:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123` (phải có chữ hoa, thường, và số)
4. Click "Đăng ký"

✅ Nếu thành công, bạn sẽ được chuyển đến Dashboard!

---

## 📚 File hướng dẫn chi tiết

- **CAI_DAT_MONGODB.md** - Hướng dẫn cài MongoDB Local
- **HUONG_DAN_KHOI_CHAY.md** - Hướng dẫn đầy đủ

---

## 🔧 Nếu gặp lỗi

Kiểm tra:
1. Console backend (terminal chạy `npm start`)
2. Browser DevTools (F12) → Console tab
3. Đảm bảo MongoDB connection string đúng trong `.env`


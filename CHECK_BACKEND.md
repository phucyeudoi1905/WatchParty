# Kiểm Tra Backend & MongoDB

## 📋 Hướng dẫn kiểm tra

### Bước 1: Kiểm tra Terminal Backend

Mở terminal Backend và xem dòng cuối cùng:

**✅ Nếu thấy:**
```
✅ Kết nối MongoDB thành công
```
→ MongoDB đã kết nối thành công!

**❌ Nếu thấy:**
```
❌ Lỗi kết nối MongoDB: ...
```
→ MongoDB chưa kết nối thành công

### Bước 2: Nếu thấy lỗi MongoDB

**Option A: Khởi động lại Backend**
1. Trong terminal Backend, nhấn `Ctrl+C` để dừng
2. Chạy lại: `npm start`
3. Chờ xem thông báo kết nối MongoDB

**Option B: Kiểm tra MongoDB đang chạy**
```powershell
Get-Service -Name MongoDB
```
Phải hiển thị: `Status: Running`

**Option C: Kiểm tra file .env**
Mở file `backend\.env` và kiểm tra:
```env
MONGODB_URI=mongodb://localhost:27017/watch-party
```

### Bước 3: Test đăng ký

Sau khi backend hiển thị "✅ Kết nối MongoDB thành công":

1. Mở trình duyệt: http://localhost:3000
2. Chuyển đến trang đăng ký
3. Nhập:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123`
4. Click "Đăng ký"

---

## 🎯 Yêu cầu: Kiểm tra Terminal Backend

**Vui lòng mở terminal Backend và cho tôi biết:**
1. Dòng cuối cùng hiển thị gì?
2. Có thấy "✅ Kết nối MongoDB thành công" không?

Sau đó test đăng ký trên trình duyệt và cho tôi biết kết quả.


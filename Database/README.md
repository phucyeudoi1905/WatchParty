# Database Scripts - Watch Party

Thư mục này chứa các script để quản lý database của ứng dụng Watch Party.

## Các Script có sẵn

### 1. init-database.js
Khởi tạo database và tạo dữ liệu mẫu.

**Cách sử dụng:**
```bash
cd Database
node init-database.js
```

**Chức năng:**
- Kết nối MongoDB
- Xóa dữ liệu cũ (nếu có)
- Tạo users mẫu (admin, user1, user2)
- Tạo rooms mẫu
- Tạo messages mẫu

**Thông tin đăng nhập mẫu:**
- Username: `admin`, Password: `password`
- Username: `user1`, Password: `password`
- Username: `user2`, Password: `password`

### 2. backup-database.js
Backup toàn bộ dữ liệu database.

**Cách sử dụng:**
```bash
cd Database
node backup-database.js
```

**Chức năng:**
- Backup tất cả users, rooms, messages
- Lưu vào file JSON với timestamp
- Tạo thư mục `backups/` tự động

### 3. restore-database.js
Restore dữ liệu từ file backup.

**Cách sử dụng:**
```bash
cd Database
node restore-database.js <backup-file>
```

**Ví dụ:**
```bash
node restore-database.js backups/watch-party-backup-2024-01-01T00-00-00-000Z.json
```

**Chức năng:**
- Đọc file backup
- Xóa dữ liệu hiện tại
- Restore dữ liệu từ backup

## Cấu trúc thư mục

```
Database/
├── init-database.js      # Script khởi tạo database
├── backup-database.js    # Script backup dữ liệu
├── restore-database.js   # Script restore dữ liệu
├── backups/              # Thư mục chứa file backup (tự tạo)
└── README.md            # Hướng dẫn sử dụng
```

## Yêu cầu

- Node.js
- MongoDB đang chạy
- File `.env` đã được cấu hình với `MONGODB_URI`

## Lưu ý

- Tất cả script đều sử dụng biến môi trường từ file `.env`
- Script backup tạo file với timestamp để tránh ghi đè
- Script restore sẽ xóa toàn bộ dữ liệu hiện tại trước khi restore

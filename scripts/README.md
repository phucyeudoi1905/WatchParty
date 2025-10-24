# Scripts - Watch Party

Thư mục này chứa các script tiện ích cho dự án Watch Party.

## 📁 Cấu trúc thư mục

```
scripts/
├── debug/              # Scripts debug và kiểm tra
│   ├── debug-connection.js
│   └── test-connection.bat
├── fix/                # Scripts sửa lỗi
│   ├── fix-all-issues.bat
│   ├── fix-frontend-dependencies.bat
│   └── fix-realtime-connection.bat
└── README.md           # Hướng dẫn này
```

## 🔧 Scripts Debug

### debug-connection.js
Kiểm tra kết nối Socket.io đến backend.
```bash
cd scripts/debug
node debug-connection.js
```

### test-connection.bat
Test kết nối real-time giữa frontend và backend.
```bash
scripts/debug/test-connection.bat
```

## 🛠️ Scripts Sửa lỗi

### fix-all-issues.bat
Sửa tất cả lỗi frontend (CRACO, dependencies, etc.)
```bash
scripts/fix/fix-all-issues.bat
```

### fix-frontend-dependencies.bat
Sửa lỗi dependencies frontend
```bash
scripts/fix/fix-frontend-dependencies.bat
```

### fix-realtime-connection.bat
Sửa lỗi kết nối real-time
```bash
scripts/fix/fix-realtime-connection.bat
```

## 🚀 Cách sử dụng

### Khởi động dự án
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

### Sử dụng files tự chạy
```bash
# Windows
thuc_thi/start-watchparty.bat

# Linux/Mac
chmod +x thuc_thi/start-watchparty.sh
./thuc_thi/start-watchparty.sh
```

### Scripts sửa lỗi cho Windows
```bash
# Sửa lỗi frontend
scripts/fix/fix-frontend-windows.bat

# Sửa lỗi realtime
scripts/fix/fix-realtime-windows.bat

# Test kết nối
scripts/debug/test-connection-windows.bat
```

## 📋 Lưu ý

- Chạy MongoDB trước khi khởi động backend
- Sử dụng scripts trong `thuc_thi/` để nộp bài
- Sử dụng scripts trong `scripts/` để debug và sửa lỗi

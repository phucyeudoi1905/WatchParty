#!/bin/bash

echo "========================================"
echo "    WATCH PARTY - BACKEND SERVER"
echo "========================================"
echo

# Di chuyển vào thư mục backend
cd "$(dirname "$0")/../backend"

# Kiểm tra file .env
if [ ! -f ".env" ]; then
    echo "❌ File .env không tồn tại!"
    echo "Đang tạo file .env từ template..."
    cp "env.example" ".env"
    echo
    echo "⚠️  Vui lòng cấu hình file .env trước khi chạy!"
    echo
    read -p "Nhấn Enter để tiếp tục..."
    exit 1
fi

# Cài đặt dependencies
echo "📦 Đang cài đặt dependencies..."
npm install

# Khởi động server
echo "🚀 Đang khởi động Backend Server..."
echo "🌐 Server sẽ chạy tại: http://localhost:5000"
echo
npm start

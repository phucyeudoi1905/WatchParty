#!/bin/bash

echo "========================================"
echo "    WATCH PARTY - FRONTEND CLIENT"
echo "========================================"
echo

# Di chuyển vào thư mục frontend
cd "$(dirname "$0")/../frontend"

# Cài đặt dependencies
echo "📦 Đang cài đặt dependencies..."
npm install

# Khởi động React app
echo "🚀 Đang khởi động Frontend..."
echo "🌐 Ứng dụng sẽ chạy tại: http://localhost:3000"
echo
npm start

#!/bin/bash

echo "========================================"
echo "    WATCH PARTY - STARTUP SCRIPT"
echo "========================================"
echo

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt!"
    echo "Vui lòng cài đặt Node.js từ: https://nodejs.org/"
    exit 1
fi

# Kiểm tra MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB chưa được cài đặt hoặc chưa chạy!"
    echo "Vui lòng cài đặt và khởi động MongoDB"
    echo
fi

echo "✅ Node.js đã được cài đặt"
echo

echo "🚀 Đang khởi động Watch Party..."
echo

# Khởi động Backend
echo "📡 Khởi động Backend Server..."
gnome-terminal -- bash -c "cd ../backend && npm install && npm start; exec bash" 2>/dev/null || \
xterm -e "cd ../backend && npm install && npm start" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/../backend && npm install && npm start"' 2>/dev/null || \
echo "⚠️  Không thể mở terminal mới. Vui lòng chạy backend thủ công."

# Đợi 3 giây
sleep 3

# Khởi động Frontend
echo "🎨 Khởi động Frontend..."
gnome-terminal -- bash -c "cd ../frontend && npm install && npm start; exec bash" 2>/dev/null || \
xterm -e "cd ../frontend && npm install && npm start" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/../frontend && npm install && npm start"' 2>/dev/null || \
echo "⚠️  Không thể mở terminal mới. Vui lòng chạy frontend thủ công."

echo
echo "✅ Watch Party đã được khởi động!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo

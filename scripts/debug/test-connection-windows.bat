@echo off
echo ========================================
echo    TEST REALTIME CONNECTION (WINDOWS)
echo ========================================
echo.

echo 🧪 Đang test kết nối Real-time...
echo.

REM Kiểm tra backend có chạy không
echo 📡 Kiểm tra Backend (port 5000)...
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend đang chạy tại http://localhost:5000
) else (
    echo ❌ Backend không chạy hoặc không phản hồi
    echo Vui lòng chạy backend trước: start.bat
    echo.
    pause
    exit /b 1
)

echo.

REM Kiểm tra frontend có chạy không
echo 🎨 Kiểm tra Frontend (port 3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend đang chạy tại http://localhost:3000
) else (
    echo ❌ Frontend không chạy hoặc không phản hồi
    echo Vui lòng chạy frontend: start.bat
    echo.
)

echo.

REM Test Socket.io connection
echo 🔌 Test Socket.io connection...
cd ..\..\backend
node -e "
const io = require('socket.io-client');
console.log('🔍 Testing Socket.io connection...');
const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  timeout: 5000
});

socket.on('connect', () => {
  console.log('✅ Socket.io connection successful!');
  console.log('🔌 Socket ID:', socket.id);
  socket.disconnect();
  process.exit(0);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket.io connection failed:', error.message);
  process.exit(1);
});

setTimeout(() => {
  console.error('⏰ Socket.io connection timeout');
  process.exit(1);
}, 10000);
"
cd ..\scripts\debug

echo.
echo 🎯 KẾT QUẢ TEST:
echo - Nếu thấy "✅ Socket.io connection successful!" = Kết nối OK
echo - Nếu thấy "❌ Socket.io connection failed" = Có lỗi kết nối
echo - Nếu thấy "⏰ Socket.io connection timeout" = Backend không phản hồi
echo.

pause

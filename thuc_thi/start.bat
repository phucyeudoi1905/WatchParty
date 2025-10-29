@echo off
echo ========================================
echo    WATCH PARTY - MAIN STARTUP
echo ========================================
echo.

echo 🚀 Đang khởi động Watch Party...
echo.

REM Kiểm tra Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js chưa được cài đặt!
    echo Vui lòng cài đặt Node.js từ: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js đã sẵn sàng
echo.

REM Khởi động Backend
echo 📡 Khởi động Backend Server...
start "WatchParty Backend" cmd /k "cd backend && npm start"

REM Đợi 3 giây
timeout /t 3 /nobreak >nul

REM Khởi động Frontend  
echo 🎨 Khởi động Frontend...
start "WatchParty Frontend" cmd /k "cd frontend && npm start"

echo.
echo ✅ Watch Party đã được khởi động!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo 📋 Lưu ý:
echo - Đảm bảo MongoDB đang chạy trước khi khởi động
echo - Nếu gặp lỗi, kiểm tra console của từng terminal
echo.

pause

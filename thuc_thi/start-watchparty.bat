@echo off
echo ========================================
echo    WATCH PARTY - STARTUP SCRIPT
echo ========================================
echo.

REM Kiểm tra Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js chưa được cài đặt!
    echo Vui lòng cài đặt Node.js từ: https://nodejs.org/
    pause
    exit /b 1
)

REM Kiểm tra MongoDB
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB chưa được cài đặt hoặc chưa chạy!
    echo Vui lòng cài đặt và khởi động MongoDB
    echo.
)

echo ✅ Node.js đã được cài đặt
echo.

echo 🚀 Đang khởi động Watch Party...
echo.

REM Khởi động Backend
echo 📡 Khởi động Backend Server...
start "WatchParty Backend" cmd /k "cd ..\backend && npm install && npm start"

REM Đợi 3 giây
timeout /t 3 /nobreak >nul

REM Khởi động Frontend  
echo 🎨 Khởi động Frontend...
start "WatchParty Frontend" cmd /k "cd ..\frontend && npm install && npm start"

echo.
echo ✅ Watch Party đã được khởi động!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo Nhấn phím bất kỳ để đóng cửa sổ này...
pause >nul

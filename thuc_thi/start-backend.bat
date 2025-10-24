@echo off
echo ========================================
echo    WATCH PARTY - BACKEND SERVER
echo ========================================
echo.

REM Di chuyển vào thư mục backend
cd /d "%~dp0..\backend"

REM Kiểm tra file .env
if not exist ".env" (
    echo ❌ File .env không tồn tại!
    echo Đang tạo file .env từ template...
    copy "env.example" ".env"
    echo.
    echo ⚠️  Vui lòng cấu hình file .env trước khi chạy!
    echo.
    pause
    exit /b 1
)

REM Cài đặt dependencies
echo 📦 Đang cài đặt dependencies...
call npm install

REM Khởi động server
echo 🚀 Đang khởi động Backend Server...
echo 🌐 Server sẽ chạy tại: http://localhost:5000
echo.
call npm start

pause

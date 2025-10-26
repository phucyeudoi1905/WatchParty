@echo off
echo ========================================
echo    FIX REALTIME CONNECTION (WINDOWS)
echo ========================================
echo.

echo 🔍 Đang kiểm tra các vấn đề kết nối Real-time...
echo.

REM Kiểm tra MongoDB
echo 📊 Kiểm tra MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB chưa được cài đặt hoặc chưa chạy!
    echo Vui lòng cài đặt và khởi động MongoDB trước
    echo.
    echo Cách khởi động MongoDB:
    echo 1. Cài đặt MongoDB từ: https://www.mongodb.com/try/download/community
    echo 2. Khởi động MongoDB service
    echo 3. Hoặc chạy: mongod
    echo.
    pause
    exit /b 1
) else (
    echo ✅ MongoDB đã được cài đặt
)

echo.

REM Kiểm tra port 5000
echo 🔌 Kiểm tra port 5000...
netstat -an | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 5000 đang được sử dụng!
    echo Có thể backend đã chạy hoặc port bị conflict
    echo.
) else (
    echo ✅ Port 5000 đang trống
)

echo.

REM Kiểm tra port 3000
echo 🔌 Kiểm tra port 3000...
netstat -an | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 đang được sử dụng!
    echo Có thể frontend đã chạy hoặc port bị conflict
    echo.
) else (
    echo ✅ Port 3000 đang trống
)

echo.

REM Kiểm tra file .env
echo 📄 Kiểm tra file .env...
if not exist "..\..\backend\.env" (
    echo ❌ File .env không tồn tại!
    echo Đang tạo file .env từ template...
    copy "..\..\backend\env.example" "..\..\backend\.env"
    echo.
    echo ⚠️  Vui lòng cấu hình file .env trước khi chạy!
    echo.
) else (
    echo ✅ File .env đã tồn tại
)

echo.

echo 🚀 HƯỚNG DẪN KHẮC PHỤC:
echo.
echo 1. Đảm bảo MongoDB đang chạy:
echo    - Khởi động MongoDB service
echo    - Hoặc chạy: mongod
echo.
echo 2. Chạy backend trước:
echo    - cd backend
echo    - npm start
echo.
echo 3. Chạy frontend sau:
echo    - cd frontend  
echo    - npm start
echo.
echo 4. Kiểm tra kết nối:
echo    - Backend: http://localhost:5000/health
echo    - Frontend: http://localhost:3000
echo.
echo 5. Nếu vẫn lỗi, kiểm tra:
echo    - Firewall có chặn port không
echo    - Antivirus có chặn kết nối không
echo    - CORS settings trong server.js
echo.

echo 📋 CÁC BƯỚC TIẾP THEO:
echo 1. Khởi động MongoDB
echo 2. Chạy: start.bat
echo 3. Truy cập: http://localhost:3000
echo.

pause

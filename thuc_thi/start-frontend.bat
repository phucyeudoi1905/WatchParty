@echo off
echo ========================================
echo    WATCH PARTY - FRONTEND CLIENT
echo ========================================
echo.

REM Di chuyển vào thư mục frontend
cd /d "%~dp0..\frontend"

REM Kiểm tra react-scripts
echo 🔍 Kiểm tra react-scripts...
npm list react-scripts >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ react-scripts chưa được cài đặt
    echo 📦 Đang cài đặt react-scripts...
    call npm install react-scripts@5.0.1
) else (
    echo ✅ react-scripts đã sẵn sàng
)

REM Cài đặt dependencies
echo 📦 Đang cài đặt dependencies...
call npm install

REM Khởi động React app
echo 🚀 Đang khởi động Frontend...
echo 🌐 Ứng dụng sẽ chạy tại: http://localhost:3000
echo.

REM Set environment variables để tránh lỗi
set GENERATE_SOURCEMAP=false
set DANGEROUSLY_DISABLE_HOST_CHECK=true
set REACT_APP_BACKEND_URL=http://localhost:5000

REM Thử chạy với CRACO trước
echo 🔧 Thử chạy với CRACO...
call npm start 2>nul
if %errorlevel% neq 0 (
    echo ❌ CRACO gặp lỗi, thử chạy với react-scripts...
    echo.
    echo 🔧 Tạm thời tắt CRACO...
    if exist "craco.config.js" ren "craco.config.js" "craco.config.js.bak"
    
    echo 📝 Cập nhật package.json...
    powershell -Command "(Get-Content package.json) -replace 'craco start', 'react-scripts start' | Set-Content package.json"
    
    echo 🚀 Chạy với react-scripts...
    call npm start
) else (
    echo ✅ CRACO hoạt động bình thường
)

pause

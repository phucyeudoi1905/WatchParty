@echo off
echo ========================================
echo    START FRONTEND SIMPLE (NO CRACO)
echo ========================================
echo.

echo 🚀 Đang khởi động Frontend đơn giản (không dùng CRACO)...
echo.

REM Di chuyển vào thư mục frontend
cd ..\..\frontend

REM Tạm thời đổi tên craco.config.js
if exist "craco.config.js" (
    echo 🔧 Tạm thời tắt CRACO config...
    ren "craco.config.js" "craco.config.js.bak"
)

REM Cập nhật package.json để dùng react-scripts thay vì craco
echo 📝 Cập nhật package.json...
powershell -Command "(Get-Content package.json) -replace 'craco start', 'react-scripts start' | Set-Content package.json"
powershell -Command "(Get-Content package.json) -replace 'craco build', 'react-scripts build' | Set-Content package.json"
powershell -Command "(Get-Content package.json) -replace 'craco test', 'react-scripts test' | Set-Content package.json"

echo.
echo 🚀 Khởi động Frontend với react-scripts...
echo 🌐 Frontend sẽ chạy tại: http://localhost:3000
echo.

REM Set environment variables
set GENERATE_SOURCEMAP=false
set DANGEROUSLY_DISABLE_HOST_CHECK=true
set REACT_APP_BACKEND_URL=http://localhost:5000

REM Chạy với react-scripts
call npm start

pause

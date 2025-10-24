@echo off
echo ========================================
echo    FIX FRONTEND DEPENDENCIES (WINDOWS)
echo ========================================
echo.

echo 🔧 Đang sửa lỗi dependencies frontend...
echo.

REM Di chuyển vào thư mục frontend
cd ..\..\frontend

echo 📦 Kiểm tra react-scripts...
npm list react-scripts >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ react-scripts chưa được cài đặt
) else (
    echo ✅ react-scripts đã có
)

echo.

echo 🧹 Đang dọn dẹp node_modules...
if exist "node_modules" (
    echo Xóa node_modules cũ...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo Xóa package-lock.json cũ...
    del package-lock.json
)

echo.

echo 📦 Cài đặt lại dependencies...
echo Đang cài đặt react-scripts@5.0.1...
call npm install react-scripts@5.0.1

echo.
echo 📦 Cài đặt các dependencies khác...
call npm install

echo.

echo ✅ Hoàn tất cài đặt dependencies!
echo.

echo 🚀 Thử chạy frontend...
echo npm start
echo.

echo 📋 Nếu vẫn lỗi, thử các bước sau:
echo 1. Xóa toàn bộ node_modules và package-lock.json
echo 2. Chạy: npm cache clean --force
echo 3. Chạy: npm install
echo 4. Chạy: npm start
echo.

pause

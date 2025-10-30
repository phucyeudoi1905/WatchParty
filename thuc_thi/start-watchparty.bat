@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo ========================================
echo    WATCH PARTY - STARTUP SCRIPT
echo ========================================
echo.

REM Thư mục gốc dự án dựa trên vị trí file .bat (thuc_thi nằm ngay dưới root)
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "FRONTEND_DIR=%ROOT_DIR%\frontend"

REM Chuẩn hoá đường dẫn (loại bỏ ..)
for %%I in ("%BACKEND_DIR%") do set BACKEND_DIR=%%~fI
for %%I in ("%FRONTEND_DIR%") do set FRONTEND_DIR=%%~fI

REM Kiểm tra tồn tại thư mục
if not exist "%BACKEND_DIR%" (
  echo [ERROR] Not found backend folder: %BACKEND_DIR%
  echo Vui long kiem tra cau truc du an.
  pause
  exit /b 1
)
if not exist "%FRONTEND_DIR%" (
  echo [ERROR] Not found frontend folder: %FRONTEND_DIR%
  echo Vui long kiem tra cau truc du an.
  pause
  exit /b 1
)

REM Kiểm tra Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Vui long cai dat Node.js tu: https://nodejs.org/
    pause
    exit /b 1
)

REM Thong bao MongoDB (khong bat buoc dừng script)
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] MongoDB chua duoc cai dat hoac chua chay! Dam bao MongoDB dang chay o local.
)

echo Node.js OK
echo.

echo 🚀 Dang khoi dong Watch Party...
echo Backend:  %BACKEND_DIR%
echo Frontend: %FRONTEND_DIR%
echo.

REM Khởi động Backend (cua so rieng)
echo Starting Backend at: %BACKEND_DIR%
start "WatchParty Backend" cmd /k cd /d "%BACKEND_DIR%" ^&^& npm install --no-fund --no-audit ^&^& npm start

REM Đợi 4 giây
timeout /t 4 /nobreak >nul

REM Khởi động Frontend (cua so rieng)
echo Starting Frontend at: %FRONTEND_DIR%
start "WatchParty Frontend" cmd /k cd /d "%FRONTEND_DIR%" ^&^& npm install --no-fund --no-audit ^&^& npm start

echo.
echo Watch Party started (in separate windows)
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Nhan phim bat ky de dong cua so nay...
pause >nul

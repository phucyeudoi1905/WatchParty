@echo off
echo ========================================
echo    FIX CRACO CONFIG (WINDOWS)
echo ========================================
echo.

echo 🔧 Đang sửa lỗi CRACO configuration...
echo.

REM Di chuyển vào thư mục frontend
cd ..\..\frontend

echo 📝 Cập nhật craco.config.js...
echo module.exports = { > craco.config.js
echo   devServer: { >> craco.config.js
echo     allowedHosts: 'all', >> craco.config.js
echo     host: 'localhost', >> craco.config.js
echo     port: 3000, >> craco.config.js
echo     client: { >> craco.config.js
echo       webSocketURL: 'ws://localhost:3000/ws', >> craco.config.js
echo     }, >> craco.config.js
echo   }, >> craco.config.js
echo   webpack: { >> craco.config.js
echo     configure: (webpackConfig) =^> { >> craco.config.js
echo       if (webpackConfig.devServer) { >> craco.config.js
echo         webpackConfig.devServer.allowedHosts = 'all'; >> craco.config.js
echo       } >> craco.config.js
echo       return webpackConfig; >> craco.config.js
echo     }, >> craco.config.js
echo   }, >> craco.config.js
echo }; >> craco.config.js

echo.
echo ✅ Đã cập nhật CRACO config!
echo.

echo 🚀 Thử chạy frontend lại...
echo npm start
echo.

echo 📋 Nếu vẫn lỗi, thử:
echo 1. Xóa node_modules và package-lock.json
echo 2. Chạy: npm cache clean --force
echo 3. Chạy: npm install
echo 4. Chạy: npm start
echo.

pause

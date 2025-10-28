# Test MongoDB Connection và Debug Backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEBUG MONGODB & BACKEND" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Kiểm tra MongoDB
Write-Host "1. Kiểm tra MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($mongoService) {
    Write-Host "   MongoDB Service: $($mongoService.Status)" -ForegroundColor Green
    if ($mongoService.Status -ne 'Running') {
        Write-Host "   Khởi động MongoDB Service..." -ForegroundColor Yellow
        Start-Service -Name MongoDB
    }
} else {
    Write-Host "   ❌ MongoDB Service không tồn tại!" -ForegroundColor Red
    Write-Host "   Cần cài đặt MongoDB hoặc sử dụng Atlas" -ForegroundColor Yellow
}

# Kiểm tra mongosh
$mongosh = Get-Command mongosh -ErrorAction SilentlyContinue
if ($mongosh) {
    Write-Host "   MongoDB Shell: Có sẵn" -ForegroundColor Green
} else {
    Write-Host "   MongoDB Shell: Không có" -ForegroundColor Red
}

Write-Host ""

# Kiểm tra file .env
Write-Host "2. Kiểm tra cấu hình..." -ForegroundColor Yellow
if (Test-Path backend\.env) {
    $envContent = Get-Content backend\.env -Raw
    if ($envContent -match "MONGODB_URI=(.+?)(`r`n|`n|$)") {
        $mongoUri = $matches[1]
        Write-Host "   MongoDB URI: $mongoUri" -ForegroundColor Gray
        
        if ($mongoUri -like "*localhost*") {
            Write-Host "   ⚠️  Đang sử dụng MongoDB Local" -ForegroundColor Yellow
            Write-Host "   Cần cài đặt MongoDB Community Edition" -ForegroundColor Yellow
        } elseif ($mongoUri -like "*mongodb+srv*") {
            Write-Host "   ✅ Đang sử dụng MongoDB Atlas" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   ❌ File .env không tồn tại!" -ForegroundColor Red
}

Write-Host ""

# Khởi động backend với debug
Write-Host "3. Khởi động Backend với debug..." -ForegroundColor Yellow
Write-Host "   Mở terminal mới để xem logs..." -ForegroundColor Gray

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Starting backend with debug...' -ForegroundColor Cyan; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   HƯỚNG DẪN TIẾP THEO" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Nếu thấy lỗi MongoDB connection:" -ForegroundColor Yellow
Write-Host "1. Cài đặt MongoDB Local:" -ForegroundColor White
Write-Host "   - Tải từ: https://www.mongodb.com/try/download/community" -ForegroundColor Gray
Write-Host "   - Cài đặt với 'Install as a Service'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Hoặc sử dụng MongoDB Atlas:" -ForegroundColor White
Write-Host "   - Đăng ký tại: https://www.mongodb.com/cloud/atlas/register" -ForegroundColor Gray
Write-Host "   - Tạo cluster miễn phí" -ForegroundColor Gray
Write-Host "   - Cập nhật MONGODB_URI trong backend\.env" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Sau khi MongoDB sẵn sàng:" -ForegroundColor White
Write-Host "   - Khởi động lại backend" -ForegroundColor Gray
Write-Host "   - Test đăng ký tại: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

Read-Host "Nhấn Enter để đóng"


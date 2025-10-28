# Check MongoDB connection from backend perspective

Write-Host "Checking MongoDB connection..." -ForegroundColor Cyan
Write-Host ""

# Method 1: Use mongodump to test connection (if available)
$mongodump = Get-Command mongodump -ErrorAction SilentlyContinue
if ($mongodump) {
    Write-Host "Found mongodump, testing connection..." -ForegroundColor Yellow
    try {
        & mongodump --host localhost --port 27017 --db watch-party --quiet
        Write-Host "✅ MongoDB is accessible!" -ForegroundColor Green
    } catch {
        Write-Host "❌ MongoDB connection failed" -ForegroundColor Red
    }
}

# Method 2: Check if MongoDB is listening on port 27017
Write-Host "`nChecking if MongoDB is listening on port 27017..." -ForegroundColor Yellow
$portTest = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($portTest) {
    Write-Host "✅ Port 27017 is open (MongoDB is listening)" -ForegroundColor Green
} else {
    Write-Host "❌ Port 27017 is closed" -ForegroundColor Red
}

# Method 3: Check backend logs
Write-Host "`nBackend logs should show:" -ForegroundColor Yellow
Write-Host "  ✅ Kết nối MongoDB thành công  (MongoDB connected)" -ForegroundColor Green
Write-Host "  ❌ Lỗi kết nối MongoDB         (MongoDB failed)" -ForegroundColor Red
Write-Host ""

Write-Host "Recommendation:" -ForegroundColor Cyan
Write-Host "1. Check the backend terminal window for MongoDB connection status" -ForegroundColor White
Write-Host "2. If you see '❌ Lỗi kết nối MongoDB', restart the backend:" -ForegroundColor White
Write-Host "   - Press Ctrl+C in backend terminal" -ForegroundColor Gray
Write-Host "   - Run: cd backend; npm start" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to continue"


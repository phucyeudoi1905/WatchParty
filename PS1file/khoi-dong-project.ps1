# Script khoi dong Watch Party Project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   KHOI DONG WATCH PARTY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Kiem tra MongoDB connection
Write-Host "Kiem tra ket noi MongoDB..." -ForegroundColor Yellow
$envContent = Get-Content backend\.env -Raw
if ($envContent -match "MONGODB_URI=(.+?)(`r`n|`n|$)") {
    $mongoUri = $matches[1]
    Write-Host "MongoDB URI: $mongoUri" -ForegroundColor Gray
}

Write-Host ""

# Khoi dong Backend
Write-Host "📡 Khoi dong Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start" -WindowStyle Normal
Write-Host "✅ Backend da khoi dong trong cua so moi`n" -ForegroundColor Green

# Doi 3 giay
Start-Sleep -Seconds 3

# Khoi dong Frontend
Write-Host "🎨 Khoi dong Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start" -WindowStyle Normal
Write-Host "✅ Frontend da khoi dong trong cua so moi`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Watch Party da khoi dong!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "🔧 Backend: http://localhost:5000`n" -ForegroundColor White
Write-Host "⚠️  Luu y:" -ForegroundColor Yellow
Write-Host "- Kiem tra MongoDB dang chay" -ForegroundColor Gray
Write-Host "- Kiem tra console cua backend de xem loi (neu co)" -ForegroundColor Gray
Write-Host "- Neu dung Atlas, Hell đảm bảo da cap nhat MONGODB_URI trong backend\.env`n" -ForegroundColor Gray
Write-Host "📖 Xem file: HUONG_DAN_NHANH.md" -ForegroundColor Cyan
Write-Host ""

Read-Host "Nhan Enter de dong cua so nay"


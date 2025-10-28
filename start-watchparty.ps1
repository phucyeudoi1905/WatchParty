# Start Watch Party Project

Write-Host "Starting Watch Party..." -ForegroundColor Cyan

# Start Backend
Write-Host "[1/2] Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start" -WindowStyle Normal

Write-Host "`nSuccess! Open browser: http://localhost:3000" -ForegroundColor Green
Write-Host "See guide: HUONG_DAN_NHANH.md`n" -ForegroundColor Yellow

Read-Host "Press Enter to close"


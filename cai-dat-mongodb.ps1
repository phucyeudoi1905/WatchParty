# Auto install MongoDB for Windows
# Run as Administrator: Right-click > Run with PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Cài Dat MongoDB Community Edition" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Vui long chay script nay voi quyen Administrator!" -ForegroundColor Red
    Write-Host "   Right-click script > Run with PowerShell" -ForegroundColor Yellow
    Read-Host "Nhan Enter de thoat"
    exit 1
}

# Check if MongoDB is installed
$mongodPath = Get-Command mongod -ErrorAction SilentlyContinue
if ($mongodPath) {
    Write-Host "MongoDB da duoc cai dat!" -ForegroundColor Green
    Write-Host "   Location: $($mongodPath.Source)" -ForegroundColor Gray
    Write-Host ""
    
    # Check service
    $mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    if ($mongoService) {
        if ($mongoService.Status -eq 'Running') {
            Write-Host "MongoDB Service dang chay!" -ForegroundColor Green
        } else {
            Write-Host "MongoDB Service chua chay. Khoi dong..." -ForegroundColor Yellow
            Start-Service -Name MongoDB
            Write-Host "MongoDB Service da khoi dong!" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "Ban co the tiep tuc khoi dong Watch Party!" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Nhan Enter de thoat"
    exit 0
}

Write-Host "MongoDB chua duoc cai dat" -ForegroundColor Yellow
Write-Host ""
Write-Host "Co 3 lua chon:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Cai dat MongoDB Local" -ForegroundColor White
Write-Host "   - Cai dat tren may local" -ForegroundColor Gray
Write-Host "   - Download tu: https://www.mongodb.com/try/download/community" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Su dung MongoDB Atlas (Cloud)" -ForegroundColor White
Write-Host "   - Database tren cloud (mien phi)" -ForegroundColor Gray
Write-Host "   - Dang ky tai: https://www.mongodb.com/cloud/atlas/register" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Su dung Docker MongoDB" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Chon phuong thuc (1/2/3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Mo trinh duyet de tai MongoDB..." -ForegroundColor Cyan
        Start-Process "https://www.mongodb.com/try/download/community"
        Write-Host ""
        Write-Host "Huong dan:" -ForegroundColor Yellow
        Write-Host "1. Chon: Version Latest, Platform Windows, Package MSI" -ForegroundColor White
        Write-Host "2. Click Download" -ForegroundColor White
        Write-Host "3. Chay file .msi va cai dat" -ForegroundColor White
        Write-Host "4. Quan trong: Chon 'Install MongoD as a Service'" -ForegroundColor White
        Write-Host "5. Sau khi cai xong, chay lai script nay" -ForegroundColor White
        Write-Host ""
        Read-Host "Nhan Enter sau khi da cai dat MongoDB"
        
        # Check again
        $mongodPath = Get-Command mongod -ErrorAction SilentlyContinue
        if ($mongodPath) {
            Write-Host "MongoDB da duoc cai dat thanh cong!" -ForegroundColor Green
            Start-Service -Name MongoDB -ErrorAction SilentlyContinue
            Write-Host "MongoDB Service da khoi dong!" -ForegroundColor Green
        } else {
            Write-Host "MongoDB van chua duoc cai dat" -ForegroundColor Yellow
        }
    }
    "2" {
        Write-Host ""
        Write-Host "Mo MongoDB Atlas..." -ForegroundColor Cyan
        Start-Process "https://www.mongodb.com/cloud/atlas/register"
        Write-Host ""
        Write-Host "Xem chi tiet trong file: CAI_DAT_MONGODB.md" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "Nhan Enter de tiep tuc"
    }
    "3" {
        Write-Host ""
        $dockerPath = Get-Command docker -ErrorAction SilentlyContinue
        if (-not $dockerPath) {
            Write-Host "Docker chua duoc cai dat!" -ForegroundColor Red
            Write-Host "   Tai Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
            Read-Host "Nhan Enter de thoat"
            exit 1
        }
        
        Write-Host "Kiem tra Docker..." -ForegroundColor Cyan
        docker --version
        
        Write-Host ""
        Write-Host "Tai va chay MongoDB container..." -ForegroundColor Cyan
        docker run -d -p 27017:27017 --name mongodb -e MONGO_INITDB_DATABASE=watch-party mongo:latest
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "MongoDB da khoi dong trong Docker!" -ForegroundColor Green
            Start-Sleep -Seconds 3
            docker ps --filter name=mongodb
        } else {
            Write-Host "Co loi khi chay MongoDB container!" -ForegroundColor Red
        }
    }
    default {
        Write-Host "Lua chon khong hop le!" -ForegroundColor Red
        Read-Host "Nhan Enter de thoat"
        exit 1
    }
}

Write-Host ""
Write-Host "Cai dat hoan tat!" -ForegroundColor Cyan
Write-Host "Xem file: CAI_DAT_MONGODB.md" -ForegroundColor Cyan
Write-Host ""
Read-Host "Nhan Enter de thoat"

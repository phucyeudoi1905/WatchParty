Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INIT WATCH PARTY (Auto Setup)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Ensure-EnvFile {
    Write-Host "[1/5] Checking .env..." -ForegroundColor Yellow
    $envExample = Join-Path $PSScriptRoot 'backend\env.example'
    $envFile = Join-Path $PSScriptRoot 'backend\.env'
    if (!(Test-Path $envFile)) {
        if (!(Test-Path $envExample)) { throw ".env example not found: $envExample" }
        Copy-Item $envExample $envFile -Force
        Write-Host "Created backend\\.env from env.example" -ForegroundColor Green
    } else {
        Write-Host ".env already exists" -ForegroundColor Green
    }
}

function Install-Deps {
    Write-Host "[2/5] Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $PSScriptRoot 'backend')
    try {
        npm install --no-audit --no-fund | Out-Null
        Write-Host "Backend deps OK" -ForegroundColor Green
    } finally { Pop-Location }

    Write-Host "[3/5] Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $PSScriptRoot 'frontend')
    try {
        npm install --no-audit --no-fund | Out-Null
        Write-Host "Frontend deps OK" -ForegroundColor Green
    } finally { Pop-Location }
}

function Seed-Database {
    Write-Host "[4/5] Initializing database with sample data..." -ForegroundColor Yellow
    # Run init script with CWD set to backend so node resolves backend/node_modules
    Push-Location $PSScriptRoot
    try {
        node -e "process.chdir('backend'); require('../Database/init-database.js')" | Write-Host
        Write-Host "Database initialized" -ForegroundColor Green
    } catch {
        Write-Host ("Database init failed: " + $_.Exception.Message) -ForegroundColor Red
        throw
    } finally { Pop-Location }
}

function Start-Servers {
    Write-Host "[5/5] Starting servers..." -ForegroundColor Yellow
    # Open backend and frontend in separate terminals
    Start-Process cmd -ArgumentList "/k","cd $PSScriptRoot\backend && npm start" -WindowStyle Normal -WorkingDirectory $PSScriptRoot
    Start-Sleep -Seconds 2
    Start-Process cmd -ArgumentList "/k","cd $PSScriptRoot\frontend && npm start" -WindowStyle Normal -WorkingDirectory $PSScriptRoot
    Write-Host "Servers started: Backend 5000, Frontend 3000" -ForegroundColor Green
}

try {
    Ensure-EnvFile
    Install-Deps
    Seed-Database
    Start-Servers
    Write-Host "\nSuccess! Open http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host ("\n❌ Init failed: " + $_.Exception.Message) -ForegroundColor Red
}

Write-Host "\nSee HUONG_DAN_KHOI_CHAY.md for details." -ForegroundColor Yellow



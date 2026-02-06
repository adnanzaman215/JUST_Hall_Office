# Payment System Startup Script

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   JUST Hall Payment System - Startup Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is already running
$backendProcess = Get-Process -Name "JustHallAPI" -ErrorAction SilentlyContinue
if ($backendProcess) {
    Write-Host "✓ Backend is already running on PID: $($backendProcess.Id)" -ForegroundColor Green
} else {
    Write-Host "Starting Backend Server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; dotnet run"
    Start-Sleep -Seconds 3
    Write-Host "✓ Backend started on http://localhost:5062" -ForegroundColor Green
}

Write-Host ""

# Check if frontend is already running
$frontendProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($frontendProcess) {
    Write-Host "✓ Frontend is already running on port 3000" -ForegroundColor Green
} else {
    Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm run dev"
    Start-Sleep -Seconds 5
    Write-Host "✓ Frontend started on http://localhost:3000" -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Both servers are now running!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:5062" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Swagger:  http://localhost:5062/swagger" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each terminal to stop the servers" -ForegroundColor Yellow
Write-Host ""
Write-Host "See PAYMENT_TESTING_GUIDE.md for testing instructions" -ForegroundColor Magenta
Write-Host ""

# Open browser
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000/hall-portal"

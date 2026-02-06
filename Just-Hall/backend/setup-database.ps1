# MySQL Database Setup Script for JustHall
# This script will create the database and tables

Write-Host "=== JustHall Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# MySQL executable path
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

# Check if MySQL is installed
if (-not (Test-Path $mysqlPath)) {
    Write-Host "ERROR: MySQL not found at $mysqlPath" -ForegroundColor Red
    Write-Host "Please install MySQL or update the path in this script." -ForegroundColor Yellow
    exit 1
}

# Get MySQL credentials
Write-Host "Enter your MySQL credentials:" -ForegroundColor Yellow
$username = Read-Host "MySQL Username (default: root)"
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "root"
}

$password = Read-Host "MySQL Password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "Testing MySQL connection..." -ForegroundColor Yellow

# Test connection
$testResult = & $mysqlPath -u $username "-p$passwordPlain" -e "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to connect to MySQL. Please check your credentials." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Connection successful!" -ForegroundColor Green
Write-Host ""

# Run the SQL setup script
Write-Host "Creating database and tables..." -ForegroundColor Yellow
$sqlFile = Join-Path $PSScriptRoot "database-setup.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: database-setup.sql not found at $sqlFile" -ForegroundColor Red
    exit 1
}

& $mysqlPath -u $username "-p$passwordPlain" < $sqlFile 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to execute SQL script." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Database and tables created successfully!" -ForegroundColor Green
Write-Host ""

# Update appsettings.json
Write-Host "Updating appsettings.json..." -ForegroundColor Yellow
$appsettingsPath = Join-Path $PSScriptRoot "appsettings.json"
$appsettings = Get-Content $appsettingsPath -Raw | ConvertFrom-Json

# Update connection string
$newConnectionString = "Server=localhost;Port=3306;Database=justhall;User=$username;Password=$passwordPlain;CharSet=utf8mb4;"
$appsettings.ConnectionStrings.DefaultConnection = $newConnectionString

# Save updated appsettings.json
$appsettings | ConvertTo-Json -Depth 10 | Set-Content $appsettingsPath

Write-Host "✓ Configuration updated!" -ForegroundColor Green
Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host "Your database is ready to use!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Connection Details:" -ForegroundColor Yellow
Write-Host "  Database: justhall" -ForegroundColor White
Write-Host "  User: $username" -ForegroundColor White
Write-Host "  Server: localhost:3306" -ForegroundColor White
Write-Host ""
Write-Host "You can now start your application with: dotnet run" -ForegroundColor Cyan

# Fix Room Number Column Type
# This script updates the users_student.room_no column from INT to VARCHAR(20)
# to support seat designations like "230B1"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Room Number Column Fix Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is accessible
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$mysqlAltPath = "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
$mysqlCommand = $null

# Try to find MySQL
if (Test-Path $mysqlPath) {
    $mysqlCommand = $mysqlPath
    Write-Host "✓ Found MySQL at: $mysqlPath" -ForegroundColor Green
} elseif (Test-Path $mysqlAltPath) {
    $mysqlCommand = $mysqlAltPath
    Write-Host "✓ Found MySQL at: $mysqlAltPath" -ForegroundColor Green
} elseif (Get-Command mysql -ErrorAction SilentlyContinue) {
    $mysqlCommand = "mysql"
    Write-Host "✓ Found MySQL in PATH" -ForegroundColor Green
} else {
    Write-Host "✗ MySQL not found. Please install MySQL or add it to your PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Run the SQL script manually:" -ForegroundColor Yellow
    Write-Host "  1. Open MySQL Workbench or command line" -ForegroundColor Yellow
    Write-Host "  2. Connect to the justhall database" -ForegroundColor Yellow
    Write-Host "  3. Run the file: fix-room-no-column.sql" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "This will update the database schema to fix seat assignment." -ForegroundColor Yellow
Write-Host "The users_student.room_no column will be changed from INT to VARCHAR(20)" -ForegroundColor Yellow
Write-Host ""

$password = Read-Host "Enter MySQL root password" -AsString

Write-Host ""
Write-Host "Applying database fix..." -ForegroundColor Cyan

try {
    # Run the SQL script
    $sqlFile = Join-Path $PSScriptRoot "fix-room-no-column.sql"
    
    if (-not (Test-Path $sqlFile)) {
        Write-Host "✗ SQL file not found: $sqlFile" -ForegroundColor Red
        exit 1
    }
    
    $arguments = @(
        "-u", "root",
        "-p$password",
        "justhall"
    )
    
    Get-Content $sqlFile | & $mysqlCommand $arguments 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Green
        Write-Host "  ✓ Database fix applied successfully!" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now:" -ForegroundColor Cyan
        Write-Host "  1. Restart the backend server if it's running" -ForegroundColor White
        Write-Host "  2. Try assigning seats again" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "✗ Error applying database fix. Exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Please run the SQL file manually in MySQL Workbench." -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run the fix-room-no-column.sql file manually in MySQL Workbench." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"

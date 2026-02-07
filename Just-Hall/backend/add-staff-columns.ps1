#!/usr/bin/env pwsh

Write-Host "Adding staff_type and status columns to users_staff table..." -ForegroundColor Green

$sql = @"
ALTER TABLE users_staff ADD COLUMN staff_type varchar(50) NOT NULL DEFAULT '' AFTER employee_id;
ALTER TABLE users_staff ADD COLUMN status varchar(20) NOT NULL DEFAULT 'Active' AFTER department;
"@

# Save SQL to temp file
$tempFile = "temp_add_columns.sql"
Set-Content -Path $tempFile -Value $sql

# Read connection string from appsettings.json
$appSettings = Get-Content "appsettings.json" | ConvertFrom-Json
$connString = $appSettings.ConnectionStrings.DefaultConnection

# Parse connection string
if ($connString -match "Server=([^;]+).*Database=([^;]+).*User=([^;]+).*Password=([^;]+)") {
    $server = $matches[1]
    $database = $matches[2]
    $user = $matches[3]
    $password = $matches[4]
    
    Write-Host "Connection: $server, Database: $database, User: $user" -ForegroundColor Cyan
    
    # Try to find mysql in common locations
    $mysqlPaths = @(
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe",
        "C:\xampp\mysql\bin\mysql.exe",
        "mysql"  # Try PATH
    )
    
    $mysqlExe = $null
    foreach ($path in $mysqlPaths) {
        if (Get-Command $path -ErrorAction SilentlyContinue) {
            $mysqlExe = $path
            break
        }
    }
    
    if ($mysqlExe) {
        Write-Host "Found MySQL at: $mysqlExe" -ForegroundColor Green
        & $mysqlExe -h $server -u $user -p"$password" $database -e $sql
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Columns added successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to add columns" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ MySQL client not found. Please run this SQL manually:" -ForegroundColor Yellow
        Write-Host $sql -ForegroundColor White
    }
} else {
    Write-Host "❌ Could not parse connection string" -ForegroundColor Red
}

Remove-Item $tempFile -ErrorAction SilentlyContinue

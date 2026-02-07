Write-Host "Adding staff profile columns to database..." -ForegroundColor Green

try {
    $mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    
    # Column 1: staff_type
    $sql1 = "ALTER TABLE users_staff ADD COLUMN staff_type varchar(50) NOT NULL DEFAULT '' AFTER employee_id;"
    Write-Host "Adding staff_type column..." -ForegroundColor Cyan
    $result1 = & $mysql -h localhost -u root -pjust123 justhall -e $sql1 2>&1
   if ($result1 -match "Duplicate column") {
        Write-Host "  ✓ staff_type column already exists" -ForegroundColor Yellow
    } elseif ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ staff_type column added successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Error: $result1" -ForegroundColor Red
    }
    
    # Column 2: status
    $sql2 = "ALTER TABLE users_staff ADD COLUMN status varchar(20) NOT NULL DEFAULT 'Active' AFTER department;"
    Write-Host "Adding status column..." -ForegroundColor Cyan
    $result2 = & $mysql -h localhost -u root -pjust123 justhall -e $sql2 2>&1
    if ($result2 -match "Duplicate column") {
        Write-Host "  ✓ status column already exists" -ForegroundColor Yellow
    } elseif ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ status column added successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Error: $result2" -ForegroundColor Red
    }
    
    # Verify columns
    Write-Host "`nVerifying table structure..." -ForegroundColor Cyan
    $verify = "DESCRIBE users_staff;"
    & $mysql -h localhost -u root -pjust123 justhall -e $verify
    
    Write-Host "`n✅ Database update complete!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

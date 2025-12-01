# Database Setup and Project Execution Guide

## 📋 Prerequisites Check

Before starting, ensure you have:

- [ ] **MySQL Server** installed and running
- [ ] **.NET 8 SDK** installed
- [ ] **PowerShell** (Windows) or **Bash** (Linux/Mac)
- [ ] **Port 3306** available for MySQL
- [ ] **Port 8000** available for API

---

## 🗄️ Step 1: Setup MySQL Database

### Option A: Using MySQL Command Line

1. **Open MySQL Command Line Client**

2. **Run the setup script:**
   ```sql
   SOURCE c:/Users/HP/OneDrive/Desktop/Just-Hall Final V/Just-Hall/backend-dotnet/database-setup.sql
   ```

   Or copy and paste the contents of `database-setup.sql` directly.

3. **Verify database creation:**
   ```sql
   USE justhall;
   SHOW TABLES;
   ```

### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your local MySQL instance
3. Click "File" → "Open SQL Script"
4. Select `database-setup.sql`
5. Click the lightning bolt icon to execute
6. Verify all tables are created

### Option C: Using PowerShell Script (Automated)

Run this in PowerShell:

```powershell
# Navigate to backend directory
cd "c:\Users\HP\OneDrive\Desktop\Just-Hall Final V\Just-Hall\backend-dotnet"

# Run MySQL setup (you'll be prompted for MySQL root password)
mysql -u root -p < database-setup.sql
```

---

## 🔧 Step 2: Verify Database Connection

**Test your MySQL connection:**

```powershell
mysql -u root -p -e "USE justhall; SELECT COUNT(*) AS user_count FROM users_user;"
```

You should see:
```
+------------+
| user_count |
+------------+
|          1 |
+------------+
```

---

## ⚙️ Step 3: Configure Connection String

The connection string is already configured in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=justhall;User=root;Password=123456;CharSet=utf8mb4;"
}
```

**If your MySQL password is different**, update it:

```powershell
# Open appsettings.json and change the password
notepad appsettings.json
```

Change: `Password=123456` to your actual MySQL root password.

---

## 🚀 Step 4: Run the .NET Project

### Quick Start (Automated)

```powershell
cd "c:\Users\HP\OneDrive\Desktop\Just-Hall Final V\Just-Hall\backend-dotnet"
.\start.ps1
```

### Manual Start (Step by Step)

```powershell
# Navigate to project directory
cd "c:\Users\HP\OneDrive\Desktop\Just-Hall Final V\Just-Hall\backend-dotnet"

# Restore NuGet packages
dotnet restore

# Build the project
dotnet build

# Run the application
dotnet run
```

---

## ✅ Step 5: Verify Everything Works

### Check API is Running

Open your browser and visit:
- **API Root:** http://localhost:8000
- **Swagger UI:** http://localhost:8000/swagger

You should see:
```json
{
  "message": "JustHall API is running",
  "version": "1.0.0",
  "timestamp": "2025-11-30T..."
}
```

### Test Login with Sample Admin

**Using Swagger:**
1. Go to http://localhost:8000/swagger
2. Find `POST /api/users/auth/login`
3. Click "Try it out"
4. Enter:
   ```json
   {
     "email": "admin@justhall.com",
     "password": "Admin123!"
   }
   ```
5. Click "Execute"
6. You should get an access token!

**Using PowerShell (cURL):**
```powershell
curl -X POST "http://localhost:8000/api/users/auth/login" `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@justhall.com\",\"password\":\"Admin123!\"}'
```

### Test Other Endpoints

**Get All Notices:**
```powershell
curl http://localhost:8000/api/notices
```

**Get Profile (with token):**
```powershell
# Replace YOUR_TOKEN with the token from login
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/users/auth/profile
```

---

## 🎯 Complete Test Scenario

Run this complete test in PowerShell:

```powershell
# 1. Test API is running
Write-Host "Testing API..." -ForegroundColor Green
curl http://localhost:8000/

# 2. Test login
Write-Host "`nTesting Login..." -ForegroundColor Green
$loginResponse = curl -X POST "http://localhost:8000/api/users/auth/login" `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@justhall.com\",\"password\":\"Admin123!\"}' | ConvertFrom-Json

$token = $loginResponse.access
Write-Host "Token obtained: $($token.Substring(0,20))..." -ForegroundColor Cyan

# 3. Test authenticated endpoint
Write-Host "`nTesting Profile..." -ForegroundColor Green
curl -H "Authorization: Bearer $token" http://localhost:8000/api/users/auth/profile

# 4. Test notices
Write-Host "`nTesting Notices..." -ForegroundColor Green
curl http://localhost:8000/api/notices

Write-Host "`nAll tests completed!" -ForegroundColor Green
```

---

## 🐛 Troubleshooting

### Issue: MySQL Connection Failed

**Error:** `Unable to connect to MySQL server`

**Solutions:**
1. Check MySQL is running:
   ```powershell
   Get-Service MySQL* | Select-Object Name, Status
   ```

2. Start MySQL if stopped:
   ```powershell
   Start-Service MySQL80  # Or your MySQL service name
   ```

3. Verify credentials:
   ```powershell
   mysql -u root -p
   ```

### Issue: Port 8000 Already in Use

**Error:** `Address already in use`

**Solutions:**
1. Find what's using port 8000:
   ```powershell
   netstat -ano | findstr :8000
   ```

2. Kill the process or change port in `Properties/launchSettings.json`

### Issue: Database Tables Not Created

**Solution:** Run the setup script again:
```powershell
mysql -u root -p justhall < database-setup.sql
```

### Issue: Build Errors

**Solution:** Clean and rebuild:
```powershell
dotnet clean
dotnet restore
dotnet build
```

---

## 📊 Default Credentials

### Admin Account
- **Email:** admin@justhall.com
- **Password:** Admin123!
- **Role:** admin

### Database
- **Host:** localhost
- **Port:** 3306
- **Database:** justhall
- **User:** root
- **Password:** 123456 (change if different)

---

## 🔄 Reset Database (If Needed)

If you need to start fresh:

```powershell
mysql -u root -p -e "DROP DATABASE IF EXISTS justhall;"
mysql -u root -p < database-setup.sql
```

---

## 📝 Production Deployment

For production, update:

1. **appsettings.json** → Use environment variables
2. **Change JWT Secret Key**
3. **Use strong database password**
4. **Enable HTTPS**
5. **Restrict CORS origins**

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] MySQL database `justhall` exists
- [ ] All 4 tables created (users_user, users_student, hallcore_application, notices_notice)
- [ ] Sample admin user exists
- [ ] Sample notices exist
- [ ] .NET packages restored
- [ ] Project builds successfully
- [ ] API runs on http://localhost:8000
- [ ] Swagger UI accessible
- [ ] Can login with admin credentials
- [ ] Can get profile with token
- [ ] Can view notices

---

## 🎉 You're Ready!

Your JustHall API is now fully operational!

**Next Steps:**
1. Test all endpoints in Swagger
2. Connect your React frontend
3. Create additional users
4. Test the complete workflow

**API Documentation:** http://localhost:8000/swagger

Happy coding! 🚀

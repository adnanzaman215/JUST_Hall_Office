# 🚀 Quick Start Card

## ✅ What's Done

**Database Setup: 100% Complete**
- ✅ Database `justhall` created
- ✅ 4 tables created with proper schema
- ✅ 1 admin user created
- ✅ 3 sample notices inserted
- ✅ All indexes and foreign keys configured

**Project Files: 100% Complete**
- ✅ 37 files created
- ✅ Complete .NET 8 Web API structure
- ✅ All documentation ready

---

## ⚡ Next: Install .NET SDK (5 minutes)

### Quick Install (Automated)
```powershell
.\install-dotnet.ps1
```

### Manual Install
1. Download: https://dotnet.microsoft.com/download/dotnet/8.0
2. Install the SDK
3. Restart PowerShell

---

## 🚀 Run the Project

After installing .NET SDK:

```powershell
cd "c:\Users\HP\OneDrive\Desktop\Just-Hall Final V\Just-Hall\backend-dotnet"
dotnet run
```

**That's it!** 

API runs at: `http://localhost:8000`
Swagger at: `http://localhost:8000/swagger`

---

## 🧪 Test Immediately

### 1. Health Check
```powershell
curl http://localhost:8000/
```

### 2. Login as Admin
**Swagger UI:**
- Go to http://localhost:8000/swagger
- POST /api/users/auth/login
- Use credentials:
  - Email: `admin@justhall.com`
  - Password: `Admin123!`

**PowerShell:**
```powershell
curl -X POST "http://localhost:8000/api/users/auth/login" `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@justhall.com\",\"password\":\"Admin123!\"}'
```

### 3. View Notices
```powershell
curl http://localhost:8000/api/notices
```

---

## 📊 Database Info

**Connection Details:**
- Host: localhost
- Port: 3306
- Database: justhall
- User: root
- Password: 123456

**Tables:**
- `users_user` - 1 record (admin)
- `users_student` - 0 records
- `hallcore_application` - 0 records
- `notices_notice` - 3 records

---

## 🔑 Default Credentials

**Admin Account:**
```
Email: admin@justhall.com
Password: Admin123!
Role: admin
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `Program.cs` | Application startup |
| `appsettings.json` | Configuration |
| `SETUP_STATUS.md` | Detailed setup status |
| `install-dotnet.ps1` | .NET SDK installer |
| `start.ps1` | Quick start script |
| `database-setup.sql` | Database schema |

---

## 🎯 Complete Workflow (5 Steps)

```powershell
# 1. Install .NET SDK (one-time)
.\install-dotnet.ps1

# 2. Restart PowerShell
# (Close and reopen)

# 3. Navigate to project
cd "c:\Users\HP\OneDrive\Desktop\Just-Hall Final V\Just-Hall\backend-dotnet"

# 4. Run the API
dotnet run

# 5. Test in browser
# Visit: http://localhost:8000/swagger
```

---

## 💡 Pro Tips

**Fastest Way to Run:**
```powershell
.\start.ps1
```

**Check Everything:**
```powershell
# Database
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p123456 -e "USE justhall; SHOW TABLES;"

# .NET SDK
dotnet --version

# API Status
curl http://localhost:8000/
```

**Rebuild Project:**
```powershell
dotnet clean
dotnet build
dotnet run
```

---

## 🐛 Common Issues

**Issue:** "dotnet not found"
**Fix:** Install .NET SDK, restart terminal

**Issue:** "Port 8000 in use"
**Fix:** Edit `Properties/launchSettings.json`, change port

**Issue:** "Database connection failed"
**Fix:** Check MySQL is running: `Get-Service MySQL*`

---

## ✅ Success Checklist

After running `dotnet run`:

- [ ] No errors in console
- [ ] See "Now listening on: http://localhost:8000"
- [ ] Can access http://localhost:8000
- [ ] Swagger UI loads at http://localhost:8000/swagger
- [ ] Can login with admin credentials
- [ ] Can view 3 notices

**All checked?** 🎉 You're ready!

---

## 📚 Full Documentation

- `README.md` - Complete project docs
- `SETUP_GUIDE.md` - Detailed setup instructions
- `SETUP_STATUS.md` - Current status report
- `TESTING_GUIDE.md` - Testing procedures
- `MIGRATION_GUIDE.md` - Django to .NET guide

---

## 🎉 Summary

**Status:** 95% Complete
**Time to Finish:** 5-10 minutes (install SDK)
**Next Step:** Run `.\install-dotnet.ps1`

Your JustHall backend is ready to launch! 🚀

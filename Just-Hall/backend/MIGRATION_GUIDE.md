# Django to ASP.NET Core Migration Guide

## 🔄 API Endpoint Mapping

### Users/Authentication Endpoints

| Django Endpoint | .NET Endpoint | Notes |
|----------------|---------------|-------|
| `POST /api/users/auth/register/` | `POST /api/users/auth/register` | No trailing slash |
| `POST /api/users/auth/login/` | `POST /api/users/auth/login` | Returns `access` instead of `token` |
| `GET /api/users/auth/profile/` | `GET /api/users/auth/profile` | Same structure |
| `POST /api/users/auth/complete-profile/` | `POST /api/users/auth/complete-profile` | Same |
| `PUT /api/users/auth/profile/update/` | `PUT /api/users/auth/profile/update` | Same |
| `GET /api/users/test/` | `GET /api/users/test` | Same |

### Applications Endpoints

| Django Endpoint | .NET Endpoint | Notes |
|----------------|---------------|-------|
| `GET /api/applications/` | `GET /api/applications` | No trailing slash |
| `POST /api/applications/create/` | `POST /api/applications/create` | Same |
| `PATCH /api/applications/{id}/status/` | `PATCH /api/applications/{id}/status` | Same |

### Notices Endpoints

| Django Endpoint | .NET Endpoint | Notes |
|----------------|---------------|-------|
| `GET /api/notices/` | `GET /api/notices` | No trailing slash |
| `GET /api/notices/{id}/` | `GET /api/notices/{id}` | Same |
| `POST /api/notices/` | `POST /api/notices` | Same |
| `PUT /api/notices/{id}/` | `PUT /api/notices/{id}` | Same |
| `PATCH /api/notices/{id}/` | `PATCH /api/notices/{id}` | Same |
| `DELETE /api/notices/{id}/` | `DELETE /api/notices/{id}` | Same |

## 🔑 Authentication Changes

### Django (Token + JWT)
```http
Authorization: Token abc123def456
Authorization: Bearer eyJhbGc...
```

### .NET (JWT Only)
```http
Authorization: Bearer eyJhbGc...
```

### Response Format Changes

**Django Login Response:**
```json
{
  "token": "abc123def456",  // DRF Token
  "access": "eyJhbGc...",   // JWT Access
  "refresh": "eyJhbGc...",  // JWT Refresh
  "user": {...},
  "student": {...}
}
```

**. NET Login Response:**
```json
{
  "access": "eyJhbGc...",   // JWT Access only
  "refresh": "eyJhbGc...",  // JWT Refresh
  "user": {...},
  "student": {...}
}
```

## 🔧 Frontend Changes Required

### 1. Remove Trailing Slashes

**Before (Django):**
```javascript
const response = await fetch('http://localhost:8000/api/users/auth/login/', {
  method: 'POST',
  // ...
});
```

**After (.NET):**
```javascript
const response = await fetch('http://localhost:8000/api/users/auth/login', {
  method: 'POST',
  // ...
});
```

### 2. Use `access` token instead of `token`

**Before (Django):**
```javascript
localStorage.setItem('token', data.token);
// or
localStorage.setItem('token', data.access);
```

**After (.NET):**
```javascript
localStorage.setItem('token', data.access); // Always use access
```

### 3. Update Authorization Headers

No change needed if you're already using Bearer tokens:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 🛠️ Quick Frontend Update Script

You can use this regex find/replace in your frontend code:

**Find:** `http://localhost:8000/api/([^'"\s]+)/`  
**Replace:** `http://localhost:8000/api/$1`

Or update your API base configuration:

```javascript
// lib/api.ts or similar
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to build API URLs
export function buildApiUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // Remove trailing slash from endpoint
  const noTrailingSlash = cleanEndpoint.replace(/\/$/, '');
  return `${API_BASE_URL}/${noTrailingSlash}`;
}

// Usage
const url = buildApiUrl('/api/users/auth/login/'); 
// Returns: 'http://localhost:8000/api/users/auth/login'
```

## 📝 Password Hash Migration

⚠️ **Important**: Django uses PBKDF2, .NET uses BCrypt.

### Options:

**Option 1: Users Reset Passwords** (Recommended for small user base)
- Keep existing database
- Users click "Forgot Password" on first login
- Implement password reset endpoint

**Option 2: Dual Hash Support** (For large user base)
```csharp
// Add this to UsersController.Login
bool isValidPassword = false;

// Try BCrypt first (new passwords)
if (user.Password.StartsWith("$2"))
{
    isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
}
// Fall back to Django hash check
else if (user.Password.StartsWith("pbkdf2_"))
{
    isValidPassword = VerifyDjangoPassword(request.Password, user.Password);
    
    // Re-hash with BCrypt on successful login
    if (isValidPassword)
    {
        user.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
        await _context.SaveChangesAsync();
    }
}
```

**Option 3: Fresh Start**
- Clear user table
- Users re-register

## 🚀 Deployment Checklist

- [ ] Update database connection string in `appsettings.json`
- [ ] Update JWT secret key (production)
- [ ] Update CORS origins (production domains)
- [ ] Test all endpoints with Postman/Swagger
- [ ] Update frontend API URLs
- [ ] Test file uploads (profile photos)
- [ ] Set up media file serving
- [ ] Configure HTTPS in production
- [ ] Set up logging and error handling
- [ ] Test authentication flow end-to-end

## 📊 Database Table Compatibility

The .NET API uses **identical table names and columns**:

| Model | Django Table | .NET Table | Compatible |
|-------|--------------|------------|------------|
| User | `users_user` | `users_user` | ✅ Yes |
| Student | `users_student` | `users_student` | ✅ Yes |
| Application | `hallcore_application` | `hallcore_application` | ✅ Yes |
| Notice | `notices_notice` | `notices_notice` | ✅ Yes |

## 🐛 Common Issues

### Issue 1: CORS Errors
**Solution:** Ensure `UseCors("AllowFrontend")` is before `UseAuthorization()` in `Program.cs`

### Issue 2: 401 Unauthorized
**Solution:** Check JWT token format and expiration. Ensure `Authorization: Bearer {token}` header.

### Issue 3: Database Connection Failed
**Solution:** Verify MySQL is running and connection string is correct.

### Issue 4: File Upload Not Working
**Solution:** Check `media` folder exists and has write permissions.

## 📞 Testing with Frontend

Update your frontend environment variables:

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

No other changes needed if your frontend already uses the correct token format!

## ✅ Verification Steps

1. **Start .NET API**: `dotnet run` (port 8000)
2. **Start Frontend**: `npm run dev` (port 3000)
3. **Test Login**: Should work immediately
4. **Test Profile**: Check if data loads
5. **Test File Upload**: Upload profile picture
6. **Test Notices**: View notice board
7. **Test Applications**: Submit application

If all tests pass, migration is complete! 🎉

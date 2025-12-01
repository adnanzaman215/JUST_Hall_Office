# JustHall API Testing Guide

## 🧪 Testing with Swagger

After starting the API (`dotnet run`), visit: `http://localhost:8000/swagger`

### Test Authentication Flow

1. **Register a new user**
   - Click on `POST /api/users/auth/register`
   - Try it out with:
   ```json
   {
     "email": "test@example.com",
     "password": "Test123!",
     "fullName": "Test User",
     "role": "student",
     "studentId": "2023001",
     "department": "Computer Science"
   }
   ```
   - Copy the `access` token from response

2. **Authorize Swagger**
   - Click the "Authorize" button at the top
   - Enter: `Bearer {your-access-token}`
   - Click "Authorize"

3. **Get Profile**
   - Click on `GET /api/users/auth/profile`
   - Execute - should return your user data

4. **Complete Profile**
   - Click on `POST /api/users/auth/complete-profile`
   - Fill in required fields
   - Execute

## 🔧 Testing with Postman

### Import Collection

Create a new collection with these requests:

#### 1. Register User
```
POST http://localhost:8000/api/users/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!",
  "fullName": "John Doe",
  "role": "student"
}
```

#### 2. Login
```
POST http://localhost:8000/api/users/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

Save the `access` token to a Postman variable: `{{token}}`

#### 3. Get Profile (Authenticated)
```
GET http://localhost:8000/api/users/auth/profile
Authorization: Bearer {{token}}
```

#### 4. Complete Profile (Authenticated)
```
POST http://localhost:8000/api/users/auth/complete-profile
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "studentId": "2023001",
  "department": "Computer Science",
  "session": "2023-2024",
  "dob": "2000-01-15",
  "gender": "Male",
  "bloodGroup": "O+",
  "fatherName": "John Doe Sr.",
  "motherName": "Jane Doe",
  "mobileNumber": "+8801712345678",
  "emergencyNumber": "+8801812345678",
  "address": "123 Main St, Dhaka, Bangladesh"
}
```

#### 5. Create Application
```
POST http://localhost:8000/api/applications/create
Content-Type: application/json

{
  "fullName": "John Doe",
  "studentId": "2023002",
  "department": "Computer Science",
  "session": "2023-2024",
  "dob": "2000-05-20",
  "gender": "Male",
  "mobile": "+8801712345678",
  "email": "john@example.com",
  "address": "123 Main St, Dhaka",
  "paymentSlipNo": "PAY123456"
}
```

#### 6. Get All Applications
```
GET http://localhost:8000/api/applications
```

#### 7. Create Notice (Admin only)
```
POST http://localhost:8000/api/notices
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "title": "Semester Break Notice",
  "body": "The semester break will start from December 20th.",
  "category": "General",
  "author": "Admin",
  "pinned": true
}
```

#### 8. Get All Notices
```
GET http://localhost:8000/api/notices
```

## 🧪 Testing File Upload

### Upload Profile Picture with cURL

```bash
curl -X POST "http://localhost:8000/api/users/auth/complete-profile" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "photo=@/path/to/your/photo.jpg" \
  -F "studentId=2023001" \
  -F "department=Computer Science" \
  -F "session=2023-2024" \
  -F "dob=2000-01-15" \
  -F "gender=Male" \
  -F "mobileNumber=+8801712345678" \
  -F "emergencyNumber=+8801812345678" \
  -F "address=123 Main St"
```

### Upload with Postman

1. Select `POST /api/users/auth/complete-profile`
2. Choose "Body" → "form-data"
3. Add fields:
   - `photo` (File): Select image file
   - `studentId` (Text): "2023001"
   - `department` (Text): "Computer Science"
   - etc.
4. Add Authorization header: `Bearer {token}`
5. Send

## 🔍 Database Verification

Connect to MySQL and verify data:

```sql
-- Check users
SELECT id, email, username, full_name, role, is_verified FROM users_user;

-- Check students
SELECT * FROM users_student;

-- Check applications
SELECT id, full_name, student_id, status, created_at FROM hallcore_application;

-- Check notices
SELECT id, title, category, pinned, created_at FROM notices_notice ORDER BY pinned DESC, created_at DESC;
```

## 📊 Test Scenarios

### Scenario 1: New User Registration & Profile Completion

1. ✅ Register new user
2. ✅ Login with credentials
3. ✅ Get profile (is_verified should be false)
4. ✅ Complete profile
5. ✅ Get profile again (is_verified should be true)
6. ✅ Verify student record in database

### Scenario 2: Hall Seat Application

1. ✅ Create new application
2. ✅ Verify unique constraints (try duplicate student_id)
3. ✅ Get all applications
4. ✅ Admin updates status to "Approved"
5. ✅ Verify status change

### Scenario 3: Notice Board Management

1. ✅ Get all notices (public access)
2. ✅ Admin creates pinned notice
3. ✅ Admin creates regular notice
4. ✅ Verify notices are ordered (pinned first)
5. ✅ Admin updates notice
6. ✅ Admin deletes notice

### Scenario 4: Authorization Tests

1. ✅ Try accessing protected routes without token (401)
2. ✅ Try accessing admin routes with student token (403)
3. ✅ Try accessing with expired token (401)

## 🐛 Common Test Issues

### Issue: 401 Unauthorized
- Check if token is included in header
- Verify token format: `Bearer {token}`
- Check if token is expired (1 hour default)

### Issue: 400 Bad Request
- Check request body format
- Verify required fields are present
- Check field data types

### Issue: 500 Internal Server Error
- Check database connection
- Check API logs in console
- Verify database tables exist

## ✅ Acceptance Criteria

Your migration is successful if:

- [ ] All user endpoints work (register, login, profile)
- [ ] File upload works for profile pictures
- [ ] Applications can be created and status updated
- [ ] Notices CRUD operations work
- [ ] Authentication and authorization work correctly
- [ ] Database tables are populated correctly
- [ ] CORS allows frontend connections
- [ ] Media files are served correctly

## 🚀 Performance Testing

### Load Test with Apache Bench

```bash
# Test login endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -p login.json -T application/json http://localhost:8000/api/users/auth/login

# Test get notices (1000 requests, 50 concurrent)
ab -n 1000 -c 50 http://localhost:8000/api/notices
```

### Expected Response Times

- Authentication: < 200ms
- Get Profile: < 100ms
- Get Notices: < 150ms
- Create Application: < 250ms
- File Upload: < 500ms

## 📝 Test Report Template

```
Date: __________
Tester: __________

✅ Authentication & Authorization
  - Register: PASS / FAIL
  - Login: PASS / FAIL
  - Get Profile: PASS / FAIL
  - Complete Profile: PASS / FAIL

✅ Applications
  - Create Application: PASS / FAIL
  - Get Applications: PASS / FAIL
  - Update Status (Admin): PASS / FAIL

✅ Notices
  - Get All Notices: PASS / FAIL
  - Create Notice (Admin): PASS / FAIL
  - Update Notice (Admin): PASS / FAIL
  - Delete Notice (Admin): PASS / FAIL

✅ File Upload
  - Upload Profile Photo: PASS / FAIL
  - Verify Photo URL: PASS / FAIL

✅ Security
  - Unauthorized Access Blocked: PASS / FAIL
  - Admin-only Routes Protected: PASS / FAIL

Overall Status: PASS / FAIL
Notes: _________________
```

## 🔄 Continuous Testing

Add these to your CI/CD pipeline:

```bash
# Run unit tests
dotnet test

# Run API health check
curl http://localhost:8000/

# Run integration tests
# (Add your integration test project)
dotnet test JustHallAPI.IntegrationTests
```

Happy Testing! 🎉

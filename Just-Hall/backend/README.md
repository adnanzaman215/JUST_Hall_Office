# JustHall ASP.NET Core Web API (.NET 8)

This is the migrated backend from Django to ASP.NET Core Web API with MySQL database.

## 🚀 Getting Started

### Prerequisites

- .NET 8 SDK
- MySQL Server
- Visual Studio 2022 or VS Code with C# extension

### Installation

1. **Navigate to the backend directory**
   ```bash
   cd backend-dotnet
   ```

2. **Restore NuGet packages**
   ```bash
   dotnet restore
   ```

3. **Update database connection string**
   
   Edit `appsettings.json` if needed:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Port=3306;Database=justhall;User=root;Password=123456;CharSet=utf8mb4;"
   }
   ```

4. **Run database migrations** (Optional - if creating fresh database)
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

5. **Run the application**
   ```bash
   dotnet run
   ```

   The API will be available at: `http://localhost:8000`
   
   Swagger documentation: `http://localhost:8000/swagger`

## 📁 Project Structure

```
backend-dotnet/
├── Controllers/           # API Controllers
│   ├── UsersController.cs
│   ├── ApplicationsController.cs
│   └── NoticesController.cs
├── Models/               # Entity Models
│   ├── User.cs
│   ├── Student.cs
│   ├── Application.cs
│   └── Notice.cs
├── DTOs/                 # Data Transfer Objects
│   ├── AuthDTOs.cs
│   ├── StudentDTOs.cs
│   ├── ApplicationDTOs.cs
│   └── NoticeDTOs.cs
├── Data/                 # Database Context
│   └── ApplicationDbContext.cs
├── Services/             # Business Logic Services
│   └── JwtService.cs
├── media/                # Uploaded files (profile photos)
├── Program.cs            # Application entry point
└── appsettings.json      # Configuration
```

## 🔗 API Endpoints

### **Authentication & Users** (`/api/users/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| GET | `/profile` | Get user profile | Yes |
| POST | `/complete-profile` | Complete/update profile | Yes |
| PUT/PATCH | `/profile/update` | Update profile | Yes |
| GET | `/api/users/test` | Test endpoint | No |

### **Applications** (`/api/applications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all applications | No |
| POST | `/create` | Create new application | No |
| PATCH | `/{id}/status` | Update application status | Yes (Admin) |

### **Notices** (`/api/notices`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all notices | No |
| GET | `/{id}` | Get notice by ID | No |
| POST | `/` | Create new notice | Yes (Admin) |
| PUT | `/{id}` | Update notice | Yes (Admin) |
| PATCH | `/{id}` | Partial update notice | Yes (Admin) |
| DELETE | `/{id}` | Delete notice | Yes (Admin) |

## 🔐 Authentication

The API uses **JWT Bearer Token** authentication. After login/register, include the token in requests:

```
Authorization: Bearer {your-access-token}
```

## 🔄 Migration from Django

### Key Changes:

1. **ORM**: Django ORM → Entity Framework Core
2. **Authentication**: Django Token/JWT → ASP.NET Core JWT
3. **Password Hashing**: Django's PBKDF2 → BCrypt.Net
4. **Database Mapping**: Same MySQL tables with matching column names
5. **API Structure**: Django REST Framework → ASP.NET Core Controllers

### Database Compatibility

The .NET API uses the **same MySQL database tables** as Django:
- `users_user`
- `users_student`
- `hallcore_application`
- `notices_notice`

No database migration needed - just point to your existing database!

## 📝 Configuration

### JWT Settings (`appsettings.json`)

```json
"Jwt": {
  "Key": "your-secret-key-min-32-characters",
  "Issuer": "JustHallAPI",
  "Audience": "JustHallClient",
  "AccessTokenExpirationHours": 1,
  "RefreshTokenExpirationDays": 7
}
```

### CORS Settings

```json
"CorsOrigins": [
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]
```

## 🛠️ Development

### Build the project
```bash
dotnet build
```

### Run with hot reload
```bash
dotnet watch run
```

### Publish for production
```bash
dotnet publish -c Release -o ./publish
```

## 📦 Dependencies

- **Microsoft.EntityFrameworkCore** - ORM
- **Pomelo.EntityFrameworkCore.MySql** - MySQL provider
- **Microsoft.AspNetCore.Authentication.JwtBearer** - JWT authentication
- **BCrypt.Net-Next** - Password hashing
- **Swashbuckle.AspNetCore** - Swagger/OpenAPI

## 🚨 Important Notes

1. **Password Migration**: Existing Django password hashes won't work with BCrypt. Users will need to reset passwords OR you can implement a custom password validator that checks both formats.

2. **Media Files**: Profile photos are stored in `media/profile_photos/` directory.

3. **CORS**: Make sure to update CORS origins in production.

4. **Database**: The API connects to the same MySQL database as Django - ensure table names match.

## 📄 License

Same as the original project.

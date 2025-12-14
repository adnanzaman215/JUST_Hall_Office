using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JustHallAPI.Data;
using JustHallAPI.DTOs;
using JustHallAPI.Models;
using JustHallAPI.Services;
using System.Security.Claims;

namespace JustHallAPI.Controllers
{
    [ApiController]
    [Route("api/users/auth")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtService _jwtService;

        public UsersController(ApplicationDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // POST: api/users/auth/register
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new { error = "Email is required" });
            
            if (string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { error = "Password is required" });

            if (string.IsNullOrWhiteSpace(request.FullName))
                return BadRequest(new { error = "Full name is required" });

            var email = request.Email.Trim().ToLower();

            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == email))
                return BadRequest(new { error = "User with this email already exists" });

            // Hash password using BCrypt
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create user
            var user = new User
            {
                Email = email,
                Username = email,
                Password = hashedPassword,
                FullName = request.FullName.Trim(),
                Role = request.Role ?? "student",
                StudentId = request.StudentId ?? string.Empty,
                Department = request.Department ?? string.Empty,
                IsVerified = false,
                IsActive = true,
                DateJoined = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create role-specific profile based on user role
            Student? student = null;
            Staff? staff = null;
            Admin? admin = null;

            if (user.Role.ToLower() == "student" && (!string.IsNullOrEmpty(request.StudentId) || !string.IsNullOrEmpty(request.Department)))
            {
                // Check if student ID already exists
                var existingStudent = await _context.Students
                    .FirstOrDefaultAsync(s => s.StudentId == request.StudentId);
                
                if (existingStudent != null)
                    return BadRequest(new { error = $"Student ID '{request.StudentId}' is already registered." });

                student = new Student
                {
                    UserId = user.Id,
                    StudentId = request.StudentId ?? string.Empty,
                    Department = request.Department ?? string.Empty
                };
                _context.Students.Add(student);
                await _context.SaveChangesAsync();
            }
            else if (user.Role.ToLower() == "staff" && !string.IsNullOrEmpty(request.StudentId))
            {
                // Check if employee ID already exists
                var existingStaff = await _context.Staff
                    .FirstOrDefaultAsync(s => s.EmployeeId == request.StudentId);
                
                if (existingStaff != null)
                    return BadRequest(new { error = $"Employee ID '{request.StudentId}' is already registered." });

                staff = new Staff
                {
                    UserId = user.Id,
                    EmployeeId = request.StudentId ?? string.Empty
                };
                _context.Staff.Add(staff);
                await _context.SaveChangesAsync();
            }
            else if (user.Role.ToLower() == "admin" && !string.IsNullOrEmpty(request.StudentId))
            {
                // Check if admin ID already exists
                var existingAdmin = await _context.Admins
                    .FirstOrDefaultAsync(a => a.AdminId == request.StudentId);
                
                if (existingAdmin != null)
                    return BadRequest(new { error = $"Admin ID '{request.StudentId}' is already registered." });

                admin = new Admin
                {
                    UserId = user.Id,
                    AdminId = request.StudentId ?? string.Empty
                };
                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();
            }

            // Generate tokens
            var accessToken = _jwtService.GenerateAccessToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken(user);

            // Prepare role-specific DTO
            StudentDto? studentDto = null;
            StaffDto? staffDto = null;
            AdminDto? adminDto = null;

            if (student != null)
            {
                studentDto = new StudentDto
                {
                    StudentId = student.StudentId,
                    Department = student.Department,
                    Session = student.Session,
                    RoomNo = student.RoomNo,
                    Dob = student.Dob,
                    Gender = student.Gender,
                    BloodGroup = student.BloodGroup,
                    FatherName = student.FatherName,
                    MotherName = student.MotherName,
                    MobileNumber = student.MobileNumber,
                    EmergencyNumber = student.EmergencyNumber,
                    Address = student.Address,
                    PhotoUrl = student.PhotoUrl
                };
            }
            else if (staff != null)
            {
                staffDto = new StaffDto
                {
                    EmployeeId = staff.EmployeeId,
                    Department = staff.Department,
                    Designation = staff.Designation,
                    Dob = staff.Dob,
                    Gender = staff.Gender,
                    BloodGroup = staff.BloodGroup,
                    MobileNumber = staff.MobileNumber,
                    EmergencyNumber = staff.EmergencyNumber,
                    Address = staff.Address,
                    Qualification = staff.Qualification,
                    PhotoUrl = staff.PhotoUrl
                };
            }
            else if (admin != null)
            {
                adminDto = new AdminDto
                {
                    AdminId = admin.AdminId,
                    Department = admin.Department,
                    Designation = admin.Designation,
                    Dob = admin.Dob,
                    Gender = admin.Gender,
                    MobileNumber = admin.MobileNumber,
                    Address = admin.Address,
                    PhotoUrl = admin.PhotoUrl
                };
            }

            return Ok(new AuthResponse
            {
                Message = "User registered successfully",
                Access = accessToken,
                Refresh = refreshToken,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    FullName = user.FullName,
                    Role = user.Role,
                    StudentId = user.StudentId,
                    Department = user.Department,
                    IsVerified = user.IsVerified
                },
                Student = studentDto,
                Staff = staffDto,
                Admin = adminDto
            });
        }

        // POST: api/users/auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { error = "Email and password are required" });

            var email = request.Email.Trim().ToLower();

            // Find user
            var user = await _context.Users
                .Include(u => u.Student)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (user == null)
                return Unauthorized(new { error = "Invalid credentials" });

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                return Unauthorized(new { error = "Invalid credentials" });

            // Update last login
            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Generate tokens
            var accessToken = _jwtService.GenerateAccessToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken(user);

            StudentDto? studentDto = null;
            if (user.Student != null)
            {
                studentDto = new StudentDto
                {
                    StudentId = user.Student.StudentId,
                    Department = user.Student.Department,
                    Session = user.Student.Session,
                    RoomNo = user.Student.RoomNo,
                    Dob = user.Student.Dob,
                    Gender = user.Student.Gender,
                    BloodGroup = user.Student.BloodGroup,
                    FatherName = user.Student.FatherName,
                    MotherName = user.Student.MotherName,
                    MobileNumber = user.Student.MobileNumber,
                    EmergencyNumber = user.Student.EmergencyNumber,
                    Address = user.Student.Address,
                    PhotoUrl = user.Student.PhotoUrl
                };
            }

            return Ok(new AuthResponse
            {
                Access = accessToken,
                Refresh = refreshToken,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    FullName = user.FullName,
                    Role = user.Role,
                    IsVerified = user.IsVerified
                },
                Student = studentDto
            });
        }

        // POST: api/users/auth/logout
        [HttpPost("logout")]
        [Authorize]
        public ActionResult Logout()
        {
            // JWT is stateless, client discards tokens
            return Ok(new { message = "Logged out (client should discard tokens)." });
        }

        // GET: api/users/auth/profile
        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<ProfileResponse>> GetProfile()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                Console.WriteLine($"🔍 GetProfile - UserId: {userId}");
                
                var user = await _context.Users
                    .Include(u => u.Student)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    Console.WriteLine($"❌ GetProfile - User not found for UserId: {userId}");
                    return NotFound(new { error = "User not found" });
                }

                Console.WriteLine($"✅ GetProfile - User found: {user.Email}, Role: {user.Role}");

                StudentDto? studentDto = null;
                StaffDto? staffDto = null;
                AdminDto? adminDto = null;

                // Get Student data if role is student
                if (user.Role.ToLower() == "student" && user.Student != null)
                {
                    Console.WriteLine($"📚 GetProfile - Building StudentDto");
                    studentDto = new StudentDto
                    {
                        StudentId = user.Student.StudentId,
                        Department = user.Student.Department,
                        Session = user.Student.Session,
                        RoomNo = user.Student.RoomNo,
                        Dob = user.Student.Dob,
                        Gender = user.Student.Gender,
                        BloodGroup = user.Student.BloodGroup,
                        FatherName = user.Student.FatherName,
                        MotherName = user.Student.MotherName,
                        MobileNumber = user.Student.MobileNumber,
                        EmergencyNumber = user.Student.EmergencyNumber,
                        Address = user.Student.Address,
                        PhotoUrl = user.Student.PhotoUrl
                    };
                }
                // Get Staff data if role is staff
                else if (user.Role.ToLower() == "staff")
                {
                    Console.WriteLine($"👔 GetProfile - Fetching Staff data");
                    var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
                    if (staff != null)
                    {
                        staffDto = new StaffDto
                        {
                            EmployeeId = staff.EmployeeId,
                            Department = staff.Department,
                            Designation = staff.Designation,
                            Dob = staff.Dob,
                            Gender = staff.Gender,
                            BloodGroup = staff.BloodGroup,
                            MobileNumber = staff.MobileNumber,
                            EmergencyNumber = staff.EmergencyNumber,
                            Address = staff.Address,
                            Qualification = staff.Qualification,
                            PhotoUrl = staff.PhotoUrl
                        };
                        Console.WriteLine($"✅ GetProfile - Staff data loaded");
                    }
                }
                // Get Admin data if role is admin
                else if (user.Role.ToLower() == "admin")
                {
                    Console.WriteLine($"👨‍💼 GetProfile - Fetching Admin data");
                    var admin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == userId);
                    if (admin != null)
                    {
                        adminDto = new AdminDto
                        {
                            AdminId = admin.AdminId,
                            Department = admin.Department,
                            Designation = admin.Designation,
                            Dob = admin.Dob,
                            Gender = admin.Gender,
                            MobileNumber = admin.MobileNumber,
                            Address = admin.Address,
                            PhotoUrl = admin.PhotoUrl
                        };
                        Console.WriteLine($"✅ GetProfile - Admin data loaded: {admin.AdminId}");
                    }
                }

                var response = new ProfileResponse
                {
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Username = user.Username,
                        FullName = user.FullName,
                        Role = user.Role,
                        IsVerified = user.IsVerified
                    },
                    Student = studentDto,
                    Staff = staffDto,
                    Admin = adminDto
                };

                Console.WriteLine($"✅ GetProfile - Returning response for role: {user.Role}");
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ GetProfile - Exception: {ex.Message}");
                Console.WriteLine($"❌ GetProfile - StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        // POST: api/users/auth/complete-profile
        [HttpPost("complete-profile")]
        [Authorize]
        public async Task<ActionResult<CompleteProfileResponse>> CompleteProfile([FromForm] CompleteProfileRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var user = await _context.Users
                .Include(u => u.Student)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new { error = "User not found" });

            bool isInitialSetup = !user.IsVerified;
            
            // Handle profile creation based on user role
            if (user.Role.ToLower() == "student")
            {
                Student student;

                if (user.Student != null)
                {
                    // Update existing profile
                    student = user.Student;
                    if (!string.IsNullOrEmpty(request.StudentId)) student.StudentId = request.StudentId;
                    if (!string.IsNullOrEmpty(request.Department)) student.Department = request.Department;
                    if (!string.IsNullOrEmpty(request.Session)) student.Session = request.Session;
                    if (request.RoomNo.HasValue) student.RoomNo = request.RoomNo.Value;
                    if (request.Dob.HasValue) student.Dob = request.Dob;
                    if (!string.IsNullOrEmpty(request.Gender)) student.Gender = request.Gender;
                    if (!string.IsNullOrEmpty(request.BloodGroup)) student.BloodGroup = request.BloodGroup;
                    if (!string.IsNullOrEmpty(request.FatherName)) student.FatherName = request.FatherName;
                    if (!string.IsNullOrEmpty(request.MotherName)) student.MotherName = request.MotherName;
                    if (!string.IsNullOrEmpty(request.MobileNumber)) student.MobileNumber = request.MobileNumber;
                    if (!string.IsNullOrEmpty(request.EmergencyNumber)) student.EmergencyNumber = request.EmergencyNumber;
                    if (!string.IsNullOrEmpty(request.Address)) student.Address = request.Address;

                    // Handle photo upload if present
                    var photoFile = Request.Form.Files.GetFile("photo");
                    if (photoFile != null && photoFile.Length > 0)
                    {
                        var fileName = $"{Guid.NewGuid()}_{photoFile.FileName}";
                        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "media", "profile_photos");
                        Directory.CreateDirectory(uploadsFolder);
                        var filePath = Path.Combine(uploadsFolder, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await photoFile.CopyToAsync(stream);
                        }

                        student.PhotoUrl = $"profile_photos/{fileName}";
                    }
                }
                else
                {
                    // Create new profile
                    student = new Student
                    {
                        UserId = user.Id,
                        StudentId = request.StudentId,
                        Department = request.Department,
                        Session = request.Session,
                        RoomNo = request.RoomNo ?? 0,
                        Dob = request.Dob,
                        Gender = request.Gender,
                        BloodGroup = request.BloodGroup,
                        FatherName = request.FatherName,
                        MotherName = request.MotherName,
                        MobileNumber = request.MobileNumber,
                        EmergencyNumber = request.EmergencyNumber,
                        Address = request.Address
                    };

                    // Handle photo upload
                    var photoFile = Request.Form.Files.GetFile("photo");
                    if (photoFile != null && photoFile.Length > 0)
                    {
                        var fileName = $"{Guid.NewGuid()}_{photoFile.FileName}";
                        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "media", "profile_photos");
                        Directory.CreateDirectory(uploadsFolder);
                        var filePath = Path.Combine(uploadsFolder, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await photoFile.CopyToAsync(stream);
                        }

                        student.PhotoUrl = $"profile_photos/{fileName}";
                    }

                    _context.Students.Add(student);
                }
            }
            else if (user.Role.ToLower() == "staff")
            {
                // Handle staff profile
                var existingStaff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
                
                if (existingStaff != null)
                {
                    // Update existing staff profile
                    if (!string.IsNullOrEmpty(request.StudentId)) existingStaff.EmployeeId = request.StudentId; // Using StudentId field for EmployeeId
                    if (!string.IsNullOrEmpty(request.Department)) existingStaff.Department = request.Department;
                    if (!string.IsNullOrEmpty(request.Session)) existingStaff.Designation = request.Session; // Using Session field for Designation
                    if (request.Dob.HasValue) existingStaff.Dob = request.Dob;
                    if (!string.IsNullOrEmpty(request.Gender)) existingStaff.Gender = request.Gender;
                    if (!string.IsNullOrEmpty(request.BloodGroup)) existingStaff.BloodGroup = request.BloodGroup;
                    if (!string.IsNullOrEmpty(request.MobileNumber)) existingStaff.MobileNumber = request.MobileNumber;
                    if (!string.IsNullOrEmpty(request.EmergencyNumber)) existingStaff.EmergencyNumber = request.EmergencyNumber;
                    if (!string.IsNullOrEmpty(request.Address)) existingStaff.Address = request.Address;
                    if (!string.IsNullOrEmpty(request.FatherName)) existingStaff.Qualification = request.FatherName; // Using FatherName field for Qualification
                    
                    // Handle photo upload
                    var photoFile = Request.Form.Files.GetFile("photo");
                    if (photoFile != null && photoFile.Length > 0)
                    {
                        var fileName = $"{Guid.NewGuid()}_{photoFile.FileName}";
                        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "media", "profile_photos");
                        Directory.CreateDirectory(uploadsFolder);
                        var filePath = Path.Combine(uploadsFolder, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await photoFile.CopyToAsync(stream);
                        }

                        existingStaff.PhotoUrl = $"profile_photos/{fileName}";
                    }
                }
                else
                {
                    // Create new staff profile
                    var staff = new Staff
                    {
                        UserId = user.Id,
                        EmployeeId = request.StudentId, // Using StudentId field for EmployeeId
                        Department = request.Department,
                        Designation = request.Session, // Using Session field for Designation
                        JoiningDate = DateTime.UtcNow,
                        Dob = request.Dob,
                        Gender = request.Gender,
                        BloodGroup = request.BloodGroup,
                        MobileNumber = request.MobileNumber,
                        EmergencyNumber = request.EmergencyNumber,
                        Address = request.Address,
                        Qualification = request.FatherName // Using FatherName field for Qualification
                    };

                    // Handle photo upload
                    var photoFile = Request.Form.Files.GetFile("photo");
                    if (photoFile != null && photoFile.Length > 0)
                    {
                        var fileName = $"{Guid.NewGuid()}_{photoFile.FileName}";
                        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "media", "profile_photos");
                        Directory.CreateDirectory(uploadsFolder);
                        var filePath = Path.Combine(uploadsFolder, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await photoFile.CopyToAsync(stream);
                        }

                        staff.PhotoUrl = $"profile_photos/{fileName}";
                    }

                    _context.Staff.Add(staff);
                }
            }
            else if (user.Role.ToLower() == "admin")
            {
                // Handle admin profile
                var existingAdmin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == userId);
                
                if (existingAdmin != null)
                {
                    // Update existing admin profile
                    if (!string.IsNullOrEmpty(request.StudentId)) existingAdmin.AdminId = request.StudentId; // Using StudentId field for AdminId
                    if (!string.IsNullOrEmpty(request.Department)) existingAdmin.Department = request.Department;
                    if (!string.IsNullOrEmpty(request.Session)) existingAdmin.Designation = request.Session; // Using Session field for Designation
                    if (request.Dob.HasValue) existingAdmin.Dob = request.Dob;
                    if (!string.IsNullOrEmpty(request.Gender)) existingAdmin.Gender = request.Gender;
                    if (!string.IsNullOrEmpty(request.MobileNumber)) existingAdmin.MobileNumber = request.MobileNumber;
                    if (!string.IsNullOrEmpty(request.Address)) existingAdmin.Address = request.Address;
                    
                    // Handle photo upload
                    var photoFile = Request.Form.Files.GetFile("photo");
                    if (photoFile != null && photoFile.Length > 0)
                    {
                        var fileName = $"{Guid.NewGuid()}_{photoFile.FileName}";
                        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "media", "profile_photos");
                        Directory.CreateDirectory(uploadsFolder);
                        var filePath = Path.Combine(uploadsFolder, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await photoFile.CopyToAsync(stream);
                        }

                        existingAdmin.PhotoUrl = $"profile_photos/{fileName}";
                    }
                }
                else
                {
                    // Create new admin profile
                    var admin = new Admin
                    {
                        UserId = user.Id,
                        AdminId = request.StudentId, // Using StudentId field for AdminId
                        Department = request.Department,
                        Designation = request.Session, // Using Session field for Designation
                        JoiningDate = DateTime.UtcNow,
                        Dob = request.Dob,
                        Gender = request.Gender,
                        MobileNumber = request.MobileNumber,
                        Address = request.Address
                    };

                    // Handle photo upload
                    var photoFile = Request.Form.Files.GetFile("photo");
                    if (photoFile != null && photoFile.Length > 0)
                    {
                        var fileName = $"{Guid.NewGuid()}_{photoFile.FileName}";
                        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "media", "profile_photos");
                        Directory.CreateDirectory(uploadsFolder);
                        var filePath = Path.Combine(uploadsFolder, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await photoFile.CopyToAsync(stream);
                        }

                        admin.PhotoUrl = $"profile_photos/{fileName}";
                    }

                    _context.Admins.Add(admin);
                }
            }

            if (isInitialSetup)
            {
                user.IsVerified = true;
            }

            await _context.SaveChangesAsync();

            // Prepare response based on role
            StudentDto? studentDto = null;
            StaffDto? staffDto = null;
            AdminDto? adminDto = null;

            if (user.Role.ToLower() == "student" && user.Student != null)
            {
                var student = user.Student;
                studentDto = new StudentDto
                {
                    StudentId = student.StudentId,
                    Department = student.Department,
                    Session = student.Session,
                    RoomNo = student.RoomNo,
                    Dob = student.Dob,
                    Gender = student.Gender,
                    BloodGroup = student.BloodGroup,
                    FatherName = student.FatherName,
                    MotherName = student.MotherName,
                    MobileNumber = student.MobileNumber,
                    EmergencyNumber = student.EmergencyNumber,
                    Address = student.Address,
                    PhotoUrl = student.PhotoUrl
                };
            }
            else if (user.Role.ToLower() == "staff")
            {
                var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
                if (staff != null)
                {
                    staffDto = new StaffDto
                    {
                        EmployeeId = staff.EmployeeId,
                        Department = staff.Department,
                        Designation = staff.Designation,
                        Dob = staff.Dob,
                        Gender = staff.Gender,
                        BloodGroup = staff.BloodGroup,
                        MobileNumber = staff.MobileNumber,
                        EmergencyNumber = staff.EmergencyNumber,
                        Address = staff.Address,
                        Qualification = staff.Qualification,
                        PhotoUrl = staff.PhotoUrl
                    };
                }
            }
            else if (user.Role.ToLower() == "admin")
            {
                var admin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == userId);
                if (admin != null)
                {
                    adminDto = new AdminDto
                    {
                        AdminId = admin.AdminId,
                        Department = admin.Department,
                        Designation = admin.Designation,
                        Dob = admin.Dob,
                        Gender = admin.Gender,
                        MobileNumber = admin.MobileNumber,
                        Address = admin.Address,
                        PhotoUrl = admin.PhotoUrl
                    };
                }
            }

            return Ok(new CompleteProfileResponse
            {
                Success = true,
                Message = isInitialSetup ? "Profile completed successfully" : "Profile updated successfully",
                Student = studentDto,
                Staff = staffDto,
                Admin = adminDto
            });
        }

        // PUT/PATCH: api/users/auth/profile
        [HttpPut("profile")]
        [HttpPatch("profile")]
        [Authorize]
        public async Task<ActionResult<ProfileResponse>> UpdateProfileDirect([FromBody] CompleteProfileRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var user = await _context.Users
                .Include(u => u.Student)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new { error = "User not found" });

            if (user.Student == null)
                return NotFound(new { error = "Profile not found. Please complete your profile first." });

            var student = user.Student;
            if (!string.IsNullOrEmpty(request.StudentId)) student.StudentId = request.StudentId;
            if (!string.IsNullOrEmpty(request.Department)) student.Department = request.Department;
            if (!string.IsNullOrEmpty(request.Session)) student.Session = request.Session;
            if (request.RoomNo.HasValue) student.RoomNo = request.RoomNo.Value;
            if (request.Dob.HasValue) student.Dob = request.Dob;
            if (!string.IsNullOrEmpty(request.Gender)) student.Gender = request.Gender;
            if (!string.IsNullOrEmpty(request.BloodGroup)) student.BloodGroup = request.BloodGroup;
            if (!string.IsNullOrEmpty(request.FatherName)) student.FatherName = request.FatherName;
            if (!string.IsNullOrEmpty(request.MotherName)) student.MotherName = request.MotherName;
            if (!string.IsNullOrEmpty(request.MobileNumber)) student.MobileNumber = request.MobileNumber;
            if (!string.IsNullOrEmpty(request.EmergencyNumber)) student.EmergencyNumber = request.EmergencyNumber;
            if (!string.IsNullOrEmpty(request.Address)) student.Address = request.Address;

            await _context.SaveChangesAsync();

            return Ok(new ProfileResponse
            {
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    FullName = user.FullName,
                    Role = user.Role,
                    IsVerified = user.IsVerified
                },
                Student = new StudentDto
                {
                    StudentId = student.StudentId,
                    Department = student.Department,
                    Session = student.Session,
                    RoomNo = student.RoomNo,
                    Dob = student.Dob,
                    Gender = student.Gender,
                    BloodGroup = student.BloodGroup,
                    FatherName = student.FatherName,
                    MotherName = student.MotherName,
                    MobileNumber = student.MobileNumber,
                    EmergencyNumber = student.EmergencyNumber,
                    Address = student.Address,
                    PhotoUrl = student.PhotoUrl
                }
            });
        }

        // POST: api/users/auth/upload-profile-picture
        [HttpPost("upload-profile-picture")]
        [Authorize]
        public async Task<ActionResult> UploadProfilePicture([FromForm] IFormFile profile_picture)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { error = "Profile not found. Please complete your profile first." });

            if (profile_picture == null || profile_picture.Length == 0)
                return BadRequest(new { error = "No file uploaded" });

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(profile_picture.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { error = "Invalid file type. Only JPG, PNG, and GIF are allowed." });

            // Validate file size (5MB max)
            if (profile_picture.Length > 5 * 1024 * 1024)
                return BadRequest(new { error = "File size exceeds 5MB limit" });

            var fileName = $"{Guid.NewGuid()}_{profile_picture.FileName}";
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "media", "profile_photos");
            Directory.CreateDirectory(uploadsFolder);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await profile_picture.CopyToAsync(stream);
            }

            student.PhotoUrl = $"profile_photos/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new { photoUrl = student.PhotoUrl });
        }

        // PUT/PATCH: api/users/auth/profile/update
        [HttpPut("profile/update")]
        [HttpPatch("profile/update")]
        [Authorize]
        public async Task<ActionResult<CompleteProfileResponse>> UpdateProfile([FromBody] CompleteProfileRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { error = "Profile not found. Please complete your profile first." });

            if (!string.IsNullOrEmpty(request.StudentId)) student.StudentId = request.StudentId;
            if (!string.IsNullOrEmpty(request.Department)) student.Department = request.Department;
            if (!string.IsNullOrEmpty(request.Session)) student.Session = request.Session;
            if (request.RoomNo.HasValue) student.RoomNo = request.RoomNo.Value;
            if (request.Dob.HasValue) student.Dob = request.Dob;
            if (!string.IsNullOrEmpty(request.Gender)) student.Gender = request.Gender;
            if (!string.IsNullOrEmpty(request.BloodGroup)) student.BloodGroup = request.BloodGroup;
            if (!string.IsNullOrEmpty(request.FatherName)) student.FatherName = request.FatherName;
            if (!string.IsNullOrEmpty(request.MotherName)) student.MotherName = request.MotherName;
            if (!string.IsNullOrEmpty(request.MobileNumber)) student.MobileNumber = request.MobileNumber;
            if (!string.IsNullOrEmpty(request.EmergencyNumber)) student.EmergencyNumber = request.EmergencyNumber;
            if (!string.IsNullOrEmpty(request.Address)) student.Address = request.Address;

            await _context.SaveChangesAsync();

            return Ok(new CompleteProfileResponse
            {
                Success = true,
                Message = "Profile updated successfully",
                Student = new StudentDto
                {
                    StudentId = student.StudentId,
                    Department = student.Department,
                    Session = student.Session,
                    RoomNo = student.RoomNo,
                    Dob = student.Dob,
                    Gender = student.Gender,
                    BloodGroup = student.BloodGroup,
                    FatherName = student.FatherName,
                    MotherName = student.MotherName,
                    MobileNumber = student.MobileNumber,
                    EmergencyNumber = student.EmergencyNumber,
                    Address = student.Address,
                    PhotoUrl = student.PhotoUrl
                }
            });
        }

        // GET: api/users/test
        [HttpGet("../test")]
        [AllowAnonymous]
        public ActionResult SimpleTest()
        {
            return Ok(new { message = "Simple test working!", status = "ok" });
        }
    }
}

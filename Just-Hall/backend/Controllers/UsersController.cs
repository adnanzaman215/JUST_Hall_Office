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

            // Create student profile if student_id or department provided
            Student? student = null;
            if (!string.IsNullOrEmpty(request.StudentId) || !string.IsNullOrEmpty(request.Department))
            {
                student = new Student
                {
                    UserId = user.Id,
                    StudentId = request.StudentId ?? string.Empty,
                    Department = request.Department ?? string.Empty
                };
                _context.Students.Add(student);
                await _context.SaveChangesAsync();
            }

            // Generate tokens
            var accessToken = _jwtService.GenerateAccessToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken(user);

            // Prepare student DTO if student profile was created
            StudentDto? studentDto = null;
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
                Student = studentDto
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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var user = await _context.Users
                .Include(u => u.Student)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new { error = "User not found" });

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
                Student = studentDto
            });
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

            if (isInitialSetup)
            {
                user.IsVerified = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new CompleteProfileResponse
            {
                Success = true,
                Message = isInitialSetup ? "Profile completed successfully" : "Profile updated successfully",
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

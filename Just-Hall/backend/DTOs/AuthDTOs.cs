namespace JustHallAPI.DTOs
{
    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "student";
        public string? StudentId { get; set; }
        public string? Department { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string? Message { get; set; }
        public string Access { get; set; } = string.Empty;
        public string Refresh { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
        public StudentDto? Student { get; set; }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string StudentId { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
    }
}

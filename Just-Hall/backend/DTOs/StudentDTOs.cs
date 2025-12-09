namespace JustHallAPI.DTOs
{
    public class StudentDto
    {
        public string StudentId { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Session { get; set; } = string.Empty;
        public int RoomNo { get; set; }
        public DateTime? Dob { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string MotherName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string EmergencyNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
    }

    public class StaffDto
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public DateTime? Dob { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string EmergencyNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Qualification { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
    }

    public class AdminDto
    {
        public string AdminId { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public DateTime? Dob { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
    }

    public class CompleteProfileRequest
    {
        public string StudentId { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Session { get; set; } = string.Empty;
        public int? RoomNo { get; set; }
        public DateTime? Dob { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string MotherName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string EmergencyNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }

    public class ProfileResponse
    {
        public UserDto User { get; set; } = null!;
        public StudentDto? Student { get; set; }
        public StaffDto? Staff { get; set; }
        public AdminDto? Admin { get; set; }
    }

    public class CompleteProfileResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public StudentDto? Student { get; set; }
        public StaffDto? Staff { get; set; }
        public AdminDto? Admin { get; set; }
    }
}

namespace JustHallAPI.DTOs
{
    public class ApplicationDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string StudentId { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Session { get; set; } = string.Empty;
        public DateTime Dob { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string MotherName { get; set; } = string.Empty;
        public string? FatherOccupation { get; set; }
        public string? MotherOccupation { get; set; }
        public decimal? HouseholdIncome { get; set; }
        public string PaymentSlipNo { get; set; } = string.Empty;
        public string? PaymentSlipUrl { get; set; }
        public string? ProfilePhotoUrl { get; set; }
        public string? UserId { get; set; }
        public string? Password { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? VivaDate { get; set; }
        public int? VivaSerialNo { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateApplicationRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string StudentId { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Session { get; set; } = string.Empty;
        public DateTime Dob { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string MotherName { get; set; } = string.Empty;
        public string? FatherOccupation { get; set; }
        public string? MotherOccupation { get; set; }
        public decimal? HouseholdIncome { get; set; }
        public string PaymentSlipNo { get; set; } = string.Empty;
        public string? PaymentSlipUrl { get; set; }
        public string? ProfilePhotoUrl { get; set; }
        public string? UserId { get; set; }
        public string? Password { get; set; }
    }

    public class UpdateApplicationStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    public class TrackApplicationRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ScheduleVivaRequest
    {
        public DateTime VivaDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}

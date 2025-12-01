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
        public string PaymentSlipNo { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
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
        public string PaymentSlipNo { get; set; } = string.Empty;
    }

    public class UpdateApplicationStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}

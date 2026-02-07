namespace JustHallAPI.DTOs
{
    public class RoleRequestDto
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;
        public string RequestedRole { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Remarks { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedByName { get; set; }
    }

    public class CreateRoleRequestDto
    {
        public string RequestedRole { get; set; } = string.Empty;
    }

    public class ReviewRoleRequestDto
    {
        public string Status { get; set; } = string.Empty; // Approved or Rejected
        public string? Remarks { get; set; }
    }

    public class RoleRequestResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public RoleRequestDto? RoleRequest { get; set; }
    }

    public class RoleRequestListResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<RoleRequestDto> RoleRequests { get; set; } = new();
    }
}

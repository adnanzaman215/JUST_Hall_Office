using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace JustHallAPI.Models
{
    [Table("users_staff")]
    public class Staff
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("employee_id")]
        public string EmployeeId { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("designation")]
        public string Designation { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("department")]
        public string Department { get; set; } = string.Empty;

        [Column("joining_date")]
        public DateTime? JoiningDate { get; set; }

        [Column("dob")]
        public DateTime? Dob { get; set; }

        [MaxLength(10)]
        [Column("gender")]
        public string Gender { get; set; } = string.Empty;

        [MaxLength(5)]
        [Column("blood_group")]
        public string BloodGroup { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("mobile_number")]
        public string MobileNumber { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("emergency_number")]
        public string EmergencyNumber { get; set; } = string.Empty;

        [Column("address")]
        public string Address { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("qualification")]
        public string Qualification { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("photo_url")]
        public string? PhotoUrl { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User? User { get; set; }
    }
}

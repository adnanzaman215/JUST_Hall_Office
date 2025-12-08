using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JustHallAPI.Models
{
    [Table("hallcore_application")]
    public class Application
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("student_id")]
        public string StudentId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("department")]
        public string Department { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("session")]
        public string Session { get; set; } = string.Empty;

        [Required]
        [Column("dob")]
        public DateTime Dob { get; set; }

        [Required]
        [MaxLength(10)]
        [Column("gender")]
        public string Gender { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Column("mobile")]
        public string Mobile { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("address")]
        public string Address { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        [Column("father_name")]
        public string FatherName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        [Column("mother_name")]
        public string MotherName { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("father_occupation")]
        public string? FatherOccupation { get; set; }

        [MaxLength(100)]
        [Column("mother_occupation")]
        public string? MotherOccupation { get; set; }

        [Column("household_income")]
        public decimal? HouseholdIncome { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("payment_slip_no")]
        public string PaymentSlipNo { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("payment_slip_url")]
        public string? PaymentSlipUrl { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "Pending";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

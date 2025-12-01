using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JustHallAPI.Models
{
    [Table("users_student")]
    public class Student
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("student_id")]
        public string StudentId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("department")]
        public string Department { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("session")]
        public string Session { get; set; } = string.Empty;

        [Column("room_no")]
        public int RoomNo { get; set; } = 0;

        [Column("dob")]
        public DateTime? Dob { get; set; }

        [MaxLength(10)]
        [Column("gender")]
        public string Gender { get; set; } = string.Empty;

        [MaxLength(5)]
        [Column("blood_group")]
        public string BloodGroup { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("father_name")]
        public string FatherName { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("mother_name")]
        public string MotherName { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("mobile_number")]
        public string MobileNumber { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("emergency_number")]
        public string EmergencyNumber { get; set; } = string.Empty;

        [Column("address")]
        public string Address { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("photo_url")]
        public string? PhotoUrl { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        public bool IsProfileComplete()
        {
            return !string.IsNullOrEmpty(StudentId) &&
                   !string.IsNullOrEmpty(Department) &&
                   !string.IsNullOrEmpty(Session) &&
                   Dob.HasValue &&
                   !string.IsNullOrEmpty(Gender) &&
                   !string.IsNullOrEmpty(MobileNumber) &&
                   !string.IsNullOrEmpty(EmergencyNumber) &&
                   !string.IsNullOrEmpty(Address);
        }
    }
}

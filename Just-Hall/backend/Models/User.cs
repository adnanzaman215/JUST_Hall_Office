using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JustHallAPI.Models
{
    [Table("users_user")]
    public class User
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("username")]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("password")]
        public string Password { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(10)]
        [Column("role")]
        public string Role { get; set; } = "student";

        [MaxLength(50)]
        [Column("student_id")]
        public string StudentId { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("department")]
        public string Department { get; set; } = string.Empty;

        [Column("is_verified")]
        public bool IsVerified { get; set; } = false;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("is_staff")]
        public bool IsStaff { get; set; } = false;

        [Column("is_superuser")]
        public bool IsSuperuser { get; set; } = false;

        [Column("date_joined")]
        public DateTime DateJoined { get; set; } = DateTime.UtcNow;

        [Column("last_login")]
        public DateTime? LastLogin { get; set; }

        // Navigation property
        public virtual Student? Student { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace JustHallAPI.Models
{
    [Table("users_admin")]
    public class Admin
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [MaxLength(50)]
        [Column("admin_id")]
        public string AdminId { get; set; } = string.Empty;

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

        [MaxLength(20)]
        [Column("mobile_number")]
        public string MobileNumber { get; set; } = string.Empty;

        [Column("address")]
        public string Address { get; set; } = string.Empty;

        [Column("photo_url")]
        public string PhotoUrl { get; set; } = string.Empty;

        // Navigation property
        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User User { get; set; } = null!;
    }
}

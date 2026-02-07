using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace JustHallAPI.Models
{
    [Table("staff_role_requests")]
    public class StaffRoleRequest
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("staff_id")]
        public int StaffId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("requested_role")]
        public string RequestedRole { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        [Column("remarks")]
        public string? Remarks { get; set; }

        [Column("requested_at")]
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

        [Column("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        [Column("reviewed_by")]
        public int? ReviewedBy { get; set; }

        // Navigation properties
        [ForeignKey("StaffId")]
        [JsonIgnore]
        public virtual Staff? Staff { get; set; }

        [ForeignKey("ReviewedBy")]
        [JsonIgnore]
        public virtual User? Reviewer { get; set; }
    }
}

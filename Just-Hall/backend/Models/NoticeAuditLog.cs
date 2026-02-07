using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JustHallAPI.Models
{
    [Table("notices_audit_logs")]
    public class NoticeAuditLog
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("notice_id")]
        public int NoticeId { get; set; }

        [MaxLength(50)]
        [Column("action")]
        public string Action { get; set; } = string.Empty;

        [Column("performed_by")]
        public int PerformedBy { get; set; }

        [Column("performed_at")]
        public DateTime PerformedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        [Column("notes")]
        public string? Notes { get; set; }
    }
}

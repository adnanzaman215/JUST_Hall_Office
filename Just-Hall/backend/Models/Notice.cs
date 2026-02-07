using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JustHallAPI.Models
{
    [Table("notices_notice")]
    public class Notice
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column("body")]
        public string Body { get; set; } = string.Empty;

        [MaxLength(32)]
        [Column("category")]
        public string Category { get; set; } = "General";

        [MaxLength(120)]
        [Column("author")]
        public string Author { get; set; } = "Admin";

        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "PendingReview";

        [Column("created_by")]
        public int CreatedBy { get; set; }

        [Column("submitted_at")]
        public DateTime? SubmittedAt { get; set; }

        [Column("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        [Column("reviewed_by")]
        public int? ReviewedBy { get; set; }

        [MaxLength(500)]
        [Column("review_remarks")]
        public string? ReviewRemarks { get; set; }

        [Column("published_at")]
        public DateTime? PublishedAt { get; set; }

        [Column("pinned")]
        public bool Pinned { get; set; } = false;

        [Column("attachment_url")]
        public string? AttachmentUrl { get; set; }

        [Column("expires_on")]
        public DateTime? ExpiresAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace JustHallAPI.Models
{
    [Table("payments_payment")]
    public class Payment
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("student_id")]
        public int StudentId { get; set; }

        [Required]
        [MaxLength(10)]
        [Column("payment_type")]
        public string PaymentType { get; set; } = string.Empty; // "yearly", "admission", "other"

        [Required]
        [Column("amount")]
        public decimal Amount { get; set; }

        [Required]
        [Column("payment_year")]
        public int PaymentYear { get; set; }

        [MaxLength(50)]
        [Column("semester")]
        public string? Semester { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("bank_name")]
        public string BankName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("transaction_id")]
        public string TransactionId { get; set; } = string.Empty;

        [Required]
        [Column("payment_date")]
        public DateTime PaymentDate { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("receipt_url")]
        public string ReceiptUrl { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "pending"; // "pending", "verified", "rejected"

        [Column("verified_by")]
        public int? VerifiedBy { get; set; }

        [Column("verified_at")]
        public DateTime? VerifiedAt { get; set; }

        [Column("rejection_reason")]
        public string? RejectionReason { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("StudentId")]
        [JsonIgnore]
        public virtual Student Student { get; set; } = null!;

        [ForeignKey("VerifiedBy")]
        [JsonIgnore]
        public virtual Staff? Verifier { get; set; }
    }
}

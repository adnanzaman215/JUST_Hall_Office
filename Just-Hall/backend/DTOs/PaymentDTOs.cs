namespace JustHallAPI.DTOs
{
    public class CreatePaymentRequest
    {
        public string PaymentType { get; set; } = string.Empty; // "yearly", "admission", "other"
        public decimal Amount { get; set; }
        public int PaymentYear { get; set; }
        public string? Semester { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public string? Notes { get; set; }
    }

    public class PaymentResponse
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentIdNumber { get; set; } = string.Empty;
        public string PaymentType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int PaymentYear { get; set; }
        public string? Semester { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public string ReceiptUrl { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? VerifiedBy { get; set; }
        public string? VerifierName { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public string? RejectionReason { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class VerifyPaymentRequest
    {
        public int PaymentId { get; set; }
        public string Status { get; set; } = string.Empty; // "verified" or "rejected"
        public string? RejectionReason { get; set; }
    }

    public class PaymentSummaryResponse
    {
        public int TotalPayments { get; set; }
        public int PendingPayments { get; set; }
        public int VerifiedPayments { get; set; }
        public int RejectedPayments { get; set; }
        public decimal TotalAmountPaid { get; set; }
        public List<PaymentResponse> RecentPayments { get; set; } = new List<PaymentResponse>();
    }

    public class PaymentDuesResponse
    {
        public int CurrentYear { get; set; }
        public decimal RequiredAmount { get; set; } = 15000; // Default yearly hall fee
        public decimal PaidAmount { get; set; }
        public decimal DueAmount { get; set; }
        public bool IsPaid { get; set; }
        public List<PaymentResponse> PaymentsForYear { get; set; } = new List<PaymentResponse>();
    }
}

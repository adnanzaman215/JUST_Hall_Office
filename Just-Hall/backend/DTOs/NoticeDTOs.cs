namespace JustHallAPI.DTOs
{
    public class NoticeDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public bool Pinned { get; set; }
        public string? AttachmentUrl { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public int CreatedBy { get; set; }
        public string? CreatedByName { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedByName { get; set; }
        public string? ReviewRemarks { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateNoticeRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
        public string? Author { get; set; }
        public bool Pinned { get; set; } = false;
        public string? AttachmentUrl { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool PublishNow { get; set; } = false;
    }

    public class UpdateNoticeRequest
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public string? Category { get; set; }
        public string? Author { get; set; }
        public bool? Pinned { get; set; }
        public string? AttachmentUrl { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    public class ReviewNoticeRequest
    {
        public string Status { get; set; } = string.Empty; // Published or Rejected
        public string? Remarks { get; set; }
    }
}

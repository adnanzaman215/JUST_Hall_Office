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
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateNoticeRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
        public string Author { get; set; } = "Admin";
        public bool Pinned { get; set; } = false;
        public string? AttachmentUrl { get; set; }
        public DateTime? ExpiresAt { get; set; }
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
}

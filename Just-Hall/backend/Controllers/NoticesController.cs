using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JustHallAPI.Data;
using JustHallAPI.DTOs;
using JustHallAPI.Models;
using System.Linq;
using System.Security.Claims;

namespace JustHallAPI.Controllers
{
    [ApiController]
    [Route("api/notices")]
    public class NoticesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public NoticesController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        private static readonly string[] PublishStatuses = { "Published", "Rejected" };

        private async Task<bool> IsAdministrativeStaffAsync(int userId)
        {
            var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
            return staff != null && staff.StaffType.Equals("Administrative", StringComparison.OrdinalIgnoreCase);
        }

        private async Task<List<NoticeDto>> BuildNoticeDtosAsync(IQueryable<Notice> query)
        {
            var rows = await (
                from n in query
                join c in _context.Users on n.CreatedBy equals c.Id into creators
                from c in creators.DefaultIfEmpty()
                join r in _context.Users on n.ReviewedBy equals r.Id into reviewers
                from r in reviewers.DefaultIfEmpty()
                select new { Notice = n, Creator = c, Reviewer = r }
            ).ToListAsync();

            return rows.Select(x => new NoticeDto
            {
                Id = x.Notice.Id,
                Title = x.Notice.Title,
                Body = x.Notice.Body,
                Category = x.Notice.Category,
                Author = x.Notice.Author,
                Pinned = x.Notice.Pinned,
                AttachmentUrl = x.Notice.AttachmentUrl,
                ExpiresAt = x.Notice.ExpiresAt,
                Status = x.Notice.Status,
                CreatedBy = x.Notice.CreatedBy,
                CreatedByName = x.Creator?.FullName,
                SubmittedAt = x.Notice.SubmittedAt,
                ReviewedAt = x.Notice.ReviewedAt,
                ReviewedByName = x.Reviewer?.FullName,
                ReviewRemarks = x.Notice.ReviewRemarks,
                PublishedAt = x.Notice.PublishedAt,
                CreatedAt = x.Notice.CreatedAt,
                UpdatedAt = x.Notice.UpdatedAt
            }).ToList();
        }

        private void AddAuditLog(int noticeId, int userId, string action, string? notes = null)
        {
            _context.NoticeAuditLogs.Add(new NoticeAuditLog
            {
                NoticeId = noticeId,
                Action = action,
                PerformedBy = userId,
                PerformedAt = DateTime.UtcNow,
                Notes = notes
            });
        }

        // GET: api/notices
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<NoticeDto>>> GetNotices()
        {
            var now = DateTime.UtcNow;
            var query = _context.Notices
                .Where(n => n.Status == "Published")
                .Where(n => !n.ExpiresAt.HasValue || n.ExpiresAt >= now)
                .OrderByDescending(n => n.Pinned)
                .ThenByDescending(n => n.CreatedAt)
                .AsQueryable();

            var noticeDtos = await BuildNoticeDtosAsync(query);
            return Ok(noticeDtos);
        }

        // GET: api/notices/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<NoticeDto>> GetNotice(int id)
        {
            var notice = await _context.Notices.FindAsync(id);

            if (notice == null)
                return NotFound(new { error = "Notice not found" });

            if (notice.Status != "Published")
                return NotFound(new { error = "Notice not found" });

            var query = _context.Notices.Where(n => n.Id == id);
            var noticeDtos = await BuildNoticeDtosAsync(query);
            return Ok(noticeDtos.First());
        }

        // GET: api/notices/all - Admin views all notices
        [HttpGet("all")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<NoticeDto>>> GetAllNotices()
        {
            var query = _context.Notices
                .OrderByDescending(n => n.CreatedAt)
                .AsQueryable();

            var noticeDtos = await BuildNoticeDtosAsync(query);
            return Ok(noticeDtos);
        }

        // GET: api/notices/mine - Staff views their submitted notices
        [HttpGet("mine")]
        [Authorize(Roles = "staff")]
        public async Task<ActionResult<IEnumerable<NoticeDto>>> GetMyNotices()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var query = _context.Notices
                .Where(n => n.CreatedBy == userId)
                .OrderByDescending(n => n.CreatedAt)
                .AsQueryable();

            var noticeDtos = await BuildNoticeDtosAsync(query);
            return Ok(noticeDtos);
        }

        // POST: api/notices
        [HttpPost]
        [Authorize(Roles = "staff,admin")]
        public async Task<ActionResult<NoticeDto>> CreateNotice([FromBody] CreateNoticeRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value?.ToLower();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return Unauthorized(new { error = "Unauthorized access" });

            if (userRole == "staff" && !await IsAdministrativeStaffAsync(userId))
                return StatusCode(403, new { error = "Access denied. Only Administrative Staff can create notices." });

            var now = DateTime.UtcNow;
            var publishNow = userRole == "admin" && request.PublishNow;

            var notice = new Notice
            {
                Title = request.Title,
                Body = request.Body,
                Category = request.Category,
                Author = string.IsNullOrWhiteSpace(request.Author) ? user.FullName : request.Author,
                Pinned = request.Pinned,
                AttachmentUrl = request.AttachmentUrl,
                ExpiresAt = request.ExpiresAt,
                Status = publishNow ? "Published" : "PendingReview",
                CreatedBy = userId,
                SubmittedAt = now,
                ReviewedAt = publishNow ? now : null,
                ReviewedBy = publishNow ? userId : null,
                PublishedAt = publishNow ? now : null,
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.Notices.Add(notice);
            await _context.SaveChangesAsync();

            AddAuditLog(notice.Id, userId, "Created", publishNow ? "Created and published" : "Created and submitted for review");
            if (publishNow)
                AddAuditLog(notice.Id, userId, "Published", "Published directly by admin");

            await _context.SaveChangesAsync();

            var noticeDtos = await BuildNoticeDtosAsync(_context.Notices.Where(n => n.Id == notice.Id));
            return CreatedAtAction(nameof(GetNotice), new { id = notice.Id }, noticeDtos.First());
        }

        // PUT: api/notices/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "staff,admin")]
        public async Task<ActionResult<NoticeDto>> UpdateNotice(int id, [FromBody] UpdateNoticeRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value?.ToLower();
            var notice = await _context.Notices.FindAsync(id);

            if (notice == null)
                return NotFound(new { error = "Notice not found" });

            if (userRole == "staff")
            {
                if (notice.CreatedBy != userId)
                    return Forbid();

                if (notice.Status == "Published")
                    return BadRequest(new { error = "Published notices cannot be edited by staff" });

                if (!await IsAdministrativeStaffAsync(userId))
                    return Forbid();
            }

            if (!string.IsNullOrEmpty(request.Title)) notice.Title = request.Title;
            if (!string.IsNullOrEmpty(request.Body)) notice.Body = request.Body;
            if (!string.IsNullOrEmpty(request.Category)) notice.Category = request.Category;
            if (!string.IsNullOrEmpty(request.Author)) notice.Author = request.Author;
            if (request.Pinned.HasValue) notice.Pinned = request.Pinned.Value;
            if (request.AttachmentUrl != null) notice.AttachmentUrl = request.AttachmentUrl;
            if (request.ExpiresAt.HasValue) notice.ExpiresAt = request.ExpiresAt;

            if (userRole == "staff")
            {
                notice.Status = "PendingReview";
                notice.SubmittedAt = DateTime.UtcNow;
                notice.ReviewedAt = null;
                notice.ReviewedBy = null;
                notice.ReviewRemarks = null;
                notice.PublishedAt = null;
                AddAuditLog(notice.Id, userId, "Resubmitted", "Updated and resubmitted for review");
            }
            else
            {
                AddAuditLog(notice.Id, userId, "Updated", "Updated by admin");
            }

            notice.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var noticeDtos = await BuildNoticeDtosAsync(_context.Notices.Where(n => n.Id == notice.Id));
            return Ok(noticeDtos.First());
        }

        // PATCH: api/notices/{id}
        [HttpPatch("{id}")]
        [Authorize(Roles = "staff,admin")]
        public async Task<ActionResult<NoticeDto>> PartialUpdateNotice(int id, [FromBody] UpdateNoticeRequest request)
        {
            return await UpdateNotice(id, request);
        }

        // PUT: api/notices/{id}/review - Admin reviews and publishes/rejects
        [HttpPut("{id}/review")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<NoticeDto>> ReviewNotice(int id, [FromBody] ReviewNoticeRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var notice = await _context.Notices.FindAsync(id);

            if (notice == null)
                return NotFound(new { error = "Notice not found" });

            if (!PublishStatuses.Contains(request.Status))
                return BadRequest(new { error = "Status must be Published or Rejected" });

            var now = DateTime.UtcNow;
            notice.Status = request.Status;
            notice.ReviewedAt = now;
            notice.ReviewedBy = userId;
            notice.ReviewRemarks = request.Remarks;

            if (request.Status == "Published")
                notice.PublishedAt = now;
            else
                notice.PublishedAt = null;

            notice.UpdatedAt = now;

            AddAuditLog(notice.Id, userId, request.Status, request.Remarks);
            await _context.SaveChangesAsync();

            var noticeDtos = await BuildNoticeDtosAsync(_context.Notices.Where(n => n.Id == notice.Id));
            return Ok(noticeDtos.First());
        }

        // DELETE: api/notices/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "staff,admin")]
        public async Task<ActionResult> DeleteNotice(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value?.ToLower();
            var notice = await _context.Notices.FindAsync(id);

            if (notice == null)
                return NotFound(new { error = "Notice not found" });

            if (userRole == "staff")
            {
                if (notice.CreatedBy != userId)
                    return Forbid();

                if (notice.Status == "Published")
                    return BadRequest(new { error = "Published notices cannot be deleted by staff" });

                if (!await IsAdministrativeStaffAsync(userId))
                    return Forbid();
            }

            // Delete associated file if exists
            if (!string.IsNullOrEmpty(notice.AttachmentUrl))
            {
                var filePath = Path.Combine(_environment.ContentRootPath, notice.AttachmentUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.Notices.Remove(notice);
            AddAuditLog(notice.Id, userId, "Deleted", "Notice deleted");
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/notices/upload-attachment
        [HttpPost("upload-attachment")]
        [Authorize(Roles = "staff,admin")]
        public async Task<ActionResult<object>> UploadAttachment([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "No file uploaded" });

            // Validate file type
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".jpg", ".jpeg", ".png" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest(new { error = "Invalid file type. Allowed: PDF, Word, Excel, PowerPoint, Text, Images" });

            // Validate file size (max 10MB)
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { error = "File size exceeds 10MB limit" });

            try
            {
                // Generate unique filename
                var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.ContentRootPath, "media", "notice_attachments");
                
                // Ensure directory exists
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return URL path
                var fileUrl = $"/media/notice_attachments/{uniqueFileName}";
                return Ok(new { url = fileUrl, fileName = file.FileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"File upload failed: {ex.Message}" });
            }
        }
    }
}

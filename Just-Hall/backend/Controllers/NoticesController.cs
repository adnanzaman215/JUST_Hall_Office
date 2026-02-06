using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JustHallAPI.Data;
using JustHallAPI.DTOs;
using JustHallAPI.Models;

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

        // GET: api/notices
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<NoticeDto>>> GetNotices()
        {
            var notices = await _context.Notices
                .OrderByDescending(n => n.Pinned)
                .ThenByDescending(n => n.CreatedAt)
                .ToListAsync();

            var noticeDtos = notices.Select(n => new NoticeDto
            {
                Id = n.Id,
                Title = n.Title,
                Body = n.Body,
                Category = n.Category,
                Author = n.Author,
                Pinned = n.Pinned,
                AttachmentUrl = n.AttachmentUrl,
                ExpiresAt = n.ExpiresAt,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt
            }).ToList();

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

            var noticeDto = new NoticeDto
            {
                Id = notice.Id,
                Title = notice.Title,
                Body = notice.Body,
                Category = notice.Category,
                Author = notice.Author,
                Pinned = notice.Pinned,
                AttachmentUrl = notice.AttachmentUrl,
                ExpiresAt = notice.ExpiresAt,
                CreatedAt = notice.CreatedAt,
                UpdatedAt = notice.UpdatedAt
            };

            return Ok(noticeDto);
        }

        // POST: api/notices
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<NoticeDto>> CreateNotice([FromBody] CreateNoticeRequest request)
        {
            var notice = new Notice
            {
                Title = request.Title,
                Body = request.Body,
                Category = request.Category,
                Author = request.Author,
                Pinned = request.Pinned,
                AttachmentUrl = request.AttachmentUrl,
                ExpiresAt = request.ExpiresAt,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Notices.Add(notice);
            await _context.SaveChangesAsync();

            var noticeDto = new NoticeDto
            {
                Id = notice.Id,
                Title = notice.Title,
                Body = notice.Body,
                Category = notice.Category,
                Author = notice.Author,
                Pinned = notice.Pinned,
                AttachmentUrl = notice.AttachmentUrl,
                ExpiresAt = notice.ExpiresAt,
                CreatedAt = notice.CreatedAt,
                UpdatedAt = notice.UpdatedAt
            };

            return CreatedAtAction(nameof(GetNotice), new { id = notice.Id }, noticeDto);
        }

        // PUT: api/notices/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<NoticeDto>> UpdateNotice(int id, [FromBody] UpdateNoticeRequest request)
        {
            var notice = await _context.Notices.FindAsync(id);

            if (notice == null)
                return NotFound(new { error = "Notice not found" });

            if (!string.IsNullOrEmpty(request.Title)) notice.Title = request.Title;
            if (!string.IsNullOrEmpty(request.Body)) notice.Body = request.Body;
            if (!string.IsNullOrEmpty(request.Category)) notice.Category = request.Category;
            if (!string.IsNullOrEmpty(request.Author)) notice.Author = request.Author;
            if (request.Pinned.HasValue) notice.Pinned = request.Pinned.Value;
            if (request.AttachmentUrl != null) notice.AttachmentUrl = request.AttachmentUrl;
            if (request.ExpiresAt.HasValue) notice.ExpiresAt = request.ExpiresAt;

            notice.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var noticeDto = new NoticeDto
            {
                Id = notice.Id,
                Title = notice.Title,
                Body = notice.Body,
                Category = notice.Category,
                Author = notice.Author,
                Pinned = notice.Pinned,
                AttachmentUrl = notice.AttachmentUrl,
                ExpiresAt = notice.ExpiresAt,
                CreatedAt = notice.CreatedAt,
                UpdatedAt = notice.UpdatedAt
            };

            return Ok(noticeDto);
        }

        // PATCH: api/notices/{id}
        [HttpPatch("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<NoticeDto>> PartialUpdateNotice(int id, [FromBody] UpdateNoticeRequest request)
        {
            return await UpdateNotice(id, request);
        }

        // DELETE: api/notices/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> DeleteNotice(int id)
        {
            var notice = await _context.Notices.FindAsync(id);

            if (notice == null)
                return NotFound(new { error = "Notice not found" });

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
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/notices/upload-attachment
        [HttpPost("upload-attachment")]
        [Authorize(Roles = "admin")]
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

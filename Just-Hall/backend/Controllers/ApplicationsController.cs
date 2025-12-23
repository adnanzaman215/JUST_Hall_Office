using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JustHallAPI.Data;
using JustHallAPI.DTOs;
using JustHallAPI.Models;

namespace JustHallAPI.Controllers
{
    [ApiController]
    [Route("api/applications")]
    public class ApplicationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ApplicationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/applications/debug/count
        [HttpGet("debug/count")]
        [AllowAnonymous]
        public async Task<ActionResult> GetApplicationCount()
        {
            var count = await _context.Applications.CountAsync();
            var allStudentIds = await _context.Applications.Select(a => a.StudentId).ToListAsync();
            
            return Ok(new { 
                totalApplications = count,
                studentIds = allStudentIds,
                message = $"Found {count} applications in database"
            });
        }

        // DELETE: api/applications/debug/delete-empty
        [HttpDelete("debug/delete-empty")]
        [AllowAnonymous]
        public async Task<ActionResult> DeleteEmptyRecords()
        {
            var emptyRecords = await _context.Applications
                .Where(a => string.IsNullOrEmpty(a.StudentId))
                .ToListAsync();
            
            if (emptyRecords.Any())
            {
                _context.Applications.RemoveRange(emptyRecords);
                await _context.SaveChangesAsync();
                
                return Ok(new { 
                    message = $"Deleted {emptyRecords.Count} records with empty student IDs",
                    deletedCount = emptyRecords.Count
                });
            }
            
            return Ok(new { 
                message = "No empty records found",
                deletedCount = 0
            });
        }

        // GET: api/applications
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ApplicationDto>>> GetApplications()
        {
            var applications = await _context.Applications
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            var applicationDtos = applications.Select(a => new ApplicationDto
            {
                Id = a.Id,
                FullName = a.FullName,
                StudentId = a.StudentId,
                Department = a.Department,
                Session = a.Session,
                Dob = a.Dob,
                Gender = a.Gender,
                Mobile = a.Mobile,
                Email = a.Email,
                Address = a.Address,
                FatherName = a.FatherName,
                MotherName = a.MotherName,
                FatherOccupation = a.FatherOccupation,
                MotherOccupation = a.MotherOccupation,
                HouseholdIncome = a.HouseholdIncome,
                PaymentSlipNo = a.PaymentSlipNo,
                PaymentSlipUrl = a.PaymentSlipUrl,
                ProfilePhotoUrl = a.ProfilePhotoUrl,
                UserId = a.UserId,
                Password = a.Password,
                Status = a.Status,
                VivaDate = a.VivaDate,
                VivaSerialNo = a.VivaSerialNo,
                CreatedAt = a.CreatedAt
            }).ToList();

            return Ok(applicationDtos);
        }

        // POST: api/applications/create
        [HttpPost("create")]
        [AllowAnonymous]
        public async Task<ActionResult<ApplicationDto>> CreateApplication([FromBody] CreateApplicationRequest request)
        {
            // Log incoming request for debugging
            Console.WriteLine($"Received application request for Student ID: '{request.StudentId}'");
            
            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.StudentId))
                return BadRequest(new { error = "Student ID is required and cannot be empty" });
                
            if (string.IsNullOrWhiteSpace(request.FullName))
                return BadRequest(new { error = "Full name is required and cannot be empty" });
            
            // Check for existing student IDs (excluding empty/null values)
            var existingWithStudentId = await _context.Applications
                .Where(a => !string.IsNullOrEmpty(a.StudentId) && a.StudentId == request.StudentId)
                .ToListAsync();
            
            Console.WriteLine($"Found {existingWithStudentId.Count} existing records with Student ID: '{request.StudentId}'");
            foreach (var app in existingWithStudentId)
            {
                Console.WriteLine($"  - ID: {app.Id}, Name: {app.FullName}, Created: {app.CreatedAt}");
            }
            
            // Validate unique constraints
            if (existingWithStudentId.Any())
                return BadRequest(new { error = "An application with this student ID already exists" });

            if (await _context.Applications.AnyAsync(a => a.PaymentSlipNo == request.PaymentSlipNo))
                return BadRequest(new { error = "An application with this payment slip number already exists" });

            var application = new Application
            {
                FullName = request.FullName,
                StudentId = request.StudentId,
                Department = request.Department,
                Session = request.Session,
                Dob = request.Dob,
                Gender = request.Gender,
                Mobile = request.Mobile,
                Email = request.Email,
                Address = request.Address,
                FatherName = request.FatherName,
                MotherName = request.MotherName,
                FatherOccupation = request.FatherOccupation,
                MotherOccupation = request.MotherOccupation,
                HouseholdIncome = request.HouseholdIncome,
                PaymentSlipNo = request.PaymentSlipNo,
                PaymentSlipUrl = request.PaymentSlipUrl,
                ProfilePhotoUrl = request.ProfilePhotoUrl,
                UserId = request.UserId,
                Password = request.Password, // Note: Should be hashed in production!
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            var applicationDto = new ApplicationDto
            {
                Id = application.Id,
                FullName = application.FullName,
                StudentId = application.StudentId,
                Department = application.Department,
                Session = application.Session,
                Dob = application.Dob,
                Gender = application.Gender,
                Mobile = application.Mobile,
                Email = application.Email,
                Address = application.Address,
                FatherName = application.FatherName,
                MotherName = application.MotherName,
                FatherOccupation = application.FatherOccupation,
                MotherOccupation = application.MotherOccupation,
                HouseholdIncome = application.HouseholdIncome,
                PaymentSlipNo = application.PaymentSlipNo,
                PaymentSlipUrl = application.PaymentSlipUrl,
                Status = application.Status,
                CreatedAt = application.CreatedAt
            };

            return CreatedAtAction(nameof(GetApplications), new { id = application.Id }, applicationDto);
        }

        // PATCH: api/applications/{id}/status
        [HttpPatch("{id}/status")]
        [AllowAnonymous]
        public async Task<ActionResult<ApplicationDto>> UpdateApplicationStatus(int id, [FromBody] UpdateApplicationStatusRequest request)
        {
            var application = await _context.Applications.FindAsync(id);

            if (application == null)
                return NotFound(new { error = "Application not found" });

            if (request.Status != "Approved" && request.Status != "Rejected")
                return BadRequest(new { error = "Invalid status" });

            application.Status = request.Status;
            await _context.SaveChangesAsync();

            var applicationDto = new ApplicationDto
            {
                Id = application.Id,
                FullName = application.FullName,
                StudentId = application.StudentId,
                Department = application.Department,
                Session = application.Session,
                Dob = application.Dob,
                Gender = application.Gender,
                Mobile = application.Mobile,
                Email = application.Email,
                Address = application.Address,
                FatherName = application.FatherName,
                MotherName = application.MotherName,
                FatherOccupation = application.FatherOccupation,
                MotherOccupation = application.MotherOccupation,
                HouseholdIncome = application.HouseholdIncome,
                PaymentSlipNo = application.PaymentSlipNo,
                PaymentSlipUrl = application.PaymentSlipUrl,
                Status = application.Status,
                CreatedAt = application.CreatedAt
            };

            return Ok(applicationDto);
        }

        // POST: api/applications/upload-payment-slip
        [HttpPost("upload-payment-slip")]
        [AllowAnonymous]
        public async Task<ActionResult> UploadPaymentSlip([FromForm] IFormFile payment_slip)
        {
            if (payment_slip == null || payment_slip.Length == 0)
                return BadRequest(new { error = "No file uploaded" });

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf" };
            var extension = Path.GetExtension(payment_slip.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { error = "Invalid file type. Only JPG, PNG, and PDF are allowed." });

            // Validate file size (5MB max)
            if (payment_slip.Length > 5 * 1024 * 1024)
                return BadRequest(new { error = "File size exceeds 5MB limit" });

            var fileName = $"{Guid.NewGuid()}_{payment_slip.FileName}";
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "media", "payment_slips");
            Directory.CreateDirectory(uploadsFolder);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await payment_slip.CopyToAsync(stream);
            }

            return Ok(new { paymentSlipUrl = $"/media/payment_slips/{fileName}" });
        }

        // POST: api/applications/track
        [HttpPost("track")]
        [AllowAnonymous]
        public async Task<ActionResult<ApplicationDto>> TrackApplication([FromBody] TrackApplicationRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.UserId) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { error = "User ID and Password are required" });

            // Find application by userId and password
            var application = await _context.Applications
                .Where(a => a.UserId == request.UserId && a.Password == request.Password)
                .FirstOrDefaultAsync();

            if (application == null)
                return NotFound(new { error = "Application not found. Please check your credentials." });

            var applicationDto = new ApplicationDto
            {
                Id = application.Id,
                FullName = application.FullName,
                StudentId = application.StudentId,
                Department = application.Department,
                Session = application.Session,
                Dob = application.Dob,
                Gender = application.Gender,
                Mobile = application.Mobile,
                Email = application.Email,
                Address = application.Address,
                FatherName = application.FatherName,
                MotherName = application.MotherName,
                FatherOccupation = application.FatherOccupation,
                MotherOccupation = application.MotherOccupation,
                HouseholdIncome = application.HouseholdIncome,
                PaymentSlipNo = application.PaymentSlipNo,
                PaymentSlipUrl = application.PaymentSlipUrl,
                ProfilePhotoUrl = application.ProfilePhotoUrl,
                UserId = application.UserId,
                Password = application.Password,
                Status = application.Status,
                VivaDate = application.VivaDate,
                VivaSerialNo = application.VivaSerialNo,
                CreatedAt = application.CreatedAt
            };

            return Ok(applicationDto);
        }

        // PATCH: api/applications/{id}/viva
        [HttpPatch("{id}/viva")]
        [AllowAnonymous]
        public async Task<ActionResult> ScheduleViva(int id, [FromBody] ScheduleVivaRequest request)
        {
            var application = await _context.Applications.FindAsync(id);
            if (application == null)
                return NotFound(new { error = "Application not found" });

            // Generate serial number based on viva date (resets daily)
            var vivaDateOnly = request.VivaDate.Date;
            var applicationsOnSameDate = await _context.Applications
                .Where(a => a.VivaDate.HasValue && a.VivaDate.Value.Date == vivaDateOnly)
                .CountAsync();
            
            var serialNo = applicationsOnSameDate + 1;

            // Update viva date, serial number, and status
            application.VivaDate = request.VivaDate;
            application.VivaSerialNo = serialNo;
            application.Status = request.Status;

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Viva scheduled successfully", 
                vivaDate = application.VivaDate, 
                vivaSerialNo = application.VivaSerialNo,
                status = application.Status 
            });
        }
    }
}

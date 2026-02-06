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

        // GET: api/applications/pending/count
        [HttpGet("pending/count")]
        [AllowAnonymous]
        public async Task<ActionResult> GetPendingApplicationsCount()
        {
            var pendingCount = await _context.Applications
                .CountAsync(a => a.Status == "Pending");
            
            return Ok(new { count = pendingCount });
        }

        // GET: api/applications/check-status/{studentId}
        [HttpGet("check-status/{studentId}")]
        [AllowAnonymous]
        public async Task<ActionResult> CheckApplicationStatus(string studentId)
        {
            if (string.IsNullOrWhiteSpace(studentId))
                return BadRequest(new { error = "Student ID is required" });

            var applications = await _context.Applications
                .Where(a => a.StudentId == studentId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            if (!applications.Any())
            {
                return Ok(new 
                { 
                    canApply = true, 
                    hasApplication = false,
                    message = "You can submit a new application."
                });
            }

            // Get the most recent application
            var latestApplication = applications.First();

            if (latestApplication.Status == "Pending")
            {
                return Ok(new 
                { 
                    canApply = false, 
                    hasApplication = true,
                    status = "Pending",
                    applicationId = latestApplication.Id,
                    message = "Your application is already pending. Please wait for admin review."
                });
            }

            if (latestApplication.Status == "Approved")
            {
                return Ok(new 
                { 
                    canApply = false, 
                    hasApplication = true,
                    status = "Approved",
                    applicationId = latestApplication.Id,
                    roomNo = latestApplication.RoomNo,
                    message = "Your application has been approved."
                });
            }

            if (latestApplication.Status == "Rejected")
            {
                return Ok(new 
                { 
                    canApply = true, 
                    hasApplication = true,
                    status = "Rejected",
                    applicationId = latestApplication.Id,
                    message = "Your previous application was rejected. You can apply again."
                });
            }

            return Ok(new 
            { 
                canApply = false, 
                hasApplication = true,
                status = latestApplication.Status,
                message = "Unknown application status."
            });
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
            
            // Check for existing pending or approved applications (excluding rejected ones)
            var existingPendingOrApproved = await _context.Applications
                .Where(a => !string.IsNullOrEmpty(a.StudentId) && 
                           a.StudentId == request.StudentId && 
                           (a.Status == "Pending" || a.Status == "Approved"))
                .ToListAsync();
            
            Console.WriteLine($"Found {existingPendingOrApproved.Count} pending/approved records with Student ID: '{request.StudentId}'");
            foreach (var app in existingPendingOrApproved)
            {
                Console.WriteLine($"  - ID: {app.Id}, Name: {app.FullName}, Status: {app.Status}, Created: {app.CreatedAt}");
            }
            
            // Block submission if there's a pending application
            if (existingPendingOrApproved.Any(a => a.Status == "Pending"))
                return BadRequest(new { error = "Your application is already pending. Please wait for admin review." });
            
            // Block submission if there's an approved application
            if (existingPendingOrApproved.Any(a => a.Status == "Approved"))
                return BadRequest(new { error = "You already have an approved application." });

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

        // POST: api/applications/upload-application-photo
        [HttpPost("upload-application-photo")]
        [AllowAnonymous]
        public async Task<ActionResult> UploadApplicationPhoto([FromForm] IFormFile profile_photo)
        {
            if (profile_photo == null || profile_photo.Length == 0)
                return BadRequest(new { error = "No file uploaded" });

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var extension = Path.GetExtension(profile_photo.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { error = "Invalid file type. Only JPG and PNG are allowed." });

            // Validate file size (1MB max)
            if (profile_photo.Length > 1 * 1024 * 1024)
                return BadRequest(new { error = "File size exceeds 1MB limit" });

            var fileName = $"{Guid.NewGuid()}_{profile_photo.FileName}";
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "media", "profile_photos");
            Directory.CreateDirectory(uploadsFolder);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await profile_photo.CopyToAsync(stream);
            }

            return Ok(new { profilePhotoUrl = $"profile_photos/{fileName}" });
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

        // POST: api/applications/{id}/approve
        [HttpPost("{id}/approve")]
        [AllowAnonymous]
        public async Task<ActionResult> ApproveApplication(int id)
        {
            var application = await _context.Applications.FindAsync(id);
            if (application == null)
                return NotFound(new { error = "Application not found" });

            if (string.IsNullOrEmpty(application.StudentId))
                return BadRequest(new { error = "Application has no associated student ID" });

            // Update application status to Approved (seat will be assigned separately)
            application.Status = "Approved";

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Application approved successfully. Please assign a seat.",
                applicationId = application.Id,
                studentId = application.StudentId,
                fullName = application.FullName,
                status = application.Status
            });
        }

        // POST: api/applications/{id}/reject
        [HttpPost("{id}/reject")]
        [AllowAnonymous]
        public async Task<ActionResult> RejectApplication(int id)
        {
            var application = await _context.Applications.FindAsync(id);
            if (application == null)
                return NotFound(new { error = "Application not found" });

            // Update application status
            application.Status = "Rejected";

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Application rejected successfully",
                applicationId = application.Id,
                status = application.Status
            });
        }
    }
}

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
                Status = a.Status,
                CreatedAt = a.CreatedAt
            }).ToList();

            return Ok(applicationDtos);
        }

        // POST: api/applications/create
        [HttpPost("create")]
        [AllowAnonymous]
        public async Task<ActionResult<ApplicationDto>> CreateApplication([FromBody] CreateApplicationRequest request)
        {
            // Validate unique constraints
            if (await _context.Applications.AnyAsync(a => a.StudentId == request.StudentId))
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
        [Authorize(Roles = "admin")]
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

            return Ok(new { paymentSlipUrl = $"payment_slips/{fileName}" });
        }
    }
}

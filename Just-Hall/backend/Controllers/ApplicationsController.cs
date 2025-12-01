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
                PaymentSlipNo = a.PaymentSlipNo,
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
                PaymentSlipNo = request.PaymentSlipNo,
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
                PaymentSlipNo = application.PaymentSlipNo,
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
                PaymentSlipNo = application.PaymentSlipNo,
                Status = application.Status,
                CreatedAt = application.CreatedAt
            };

            return Ok(applicationDto);
        }
    }
}

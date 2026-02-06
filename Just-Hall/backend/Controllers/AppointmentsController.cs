// Controllers/AppointmentsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JustHallAPI.Data;
using JustHallAPI.Models;
using JustHallAPI.DTOs;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace JustHallAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AppointmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/appointments (Admin - Get all appointments)
        [HttpGet]
        [Authorize(Roles = "admin,Admin")]
        public async Task<ActionResult<IEnumerable<AppointmentResponseDTO>>> GetAllAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Student)
                    .ThenInclude(s => s.User)
                .Include(a => a.RespondedBy)
                    .ThenInclude(r => r.User)
                .OrderByDescending(a => a.RequestedAt)
                .Select(a => new AppointmentResponseDTO
                {
                    Id = a.Id,
                    StudentId = a.StudentId,
                    StudentName = a.Student != null && a.Student.User != null ? a.Student.User.FullName : "Unknown",
                    StudentEmail = a.Student != null && a.Student.User != null ? a.Student.User.Email : "",
                    StudentPhone = a.Student != null ? a.Student.MobileNumber : "",
                    Reason = a.Reason,
                    AdditionalNotes = a.AdditionalNotes,
                    Status = a.Status,
                    AppointmentDate = a.AppointmentDate,
                    AppointmentTime = a.AppointmentTime,
                    ProvostResponse = a.ProvostResponse,
                    RequestedAt = a.RequestedAt,
                    RespondedAt = a.RespondedAt,
                    RespondedByName = a.RespondedBy != null && a.RespondedBy.User != null ? a.RespondedBy.User.FullName : null
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // GET: api/appointments/my (Student - Get own appointments)
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<AppointmentResponseDTO>>> GetMyAppointments()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                return NotFound(new { message = "Student record not found" });
            }

            var appointments = await _context.Appointments
                .Include(a => a.Student)
                    .ThenInclude(s => s.User)
                .Include(a => a.RespondedBy)
                    .ThenInclude(r => r.User)
                .Where(a => a.StudentId == student.Id)
                .OrderByDescending(a => a.RequestedAt)
                .Select(a => new AppointmentResponseDTO
                {
                    Id = a.Id,
                    StudentId = a.StudentId,
                    StudentName = a.Student != null && a.Student.User != null ? a.Student.User.FullName : "Unknown",
                    StudentEmail = a.Student != null && a.Student.User != null ? a.Student.User.Email : "",
                    StudentPhone = a.Student != null ? a.Student.MobileNumber : "",
                    Reason = a.Reason,
                    AdditionalNotes = a.AdditionalNotes,
                    Status = a.Status,
                    AppointmentDate = a.AppointmentDate,
                    AppointmentTime = a.AppointmentTime,
                    ProvostResponse = a.ProvostResponse,
                    RequestedAt = a.RequestedAt,
                    RespondedAt = a.RespondedAt,
                    RespondedByName = a.RespondedBy != null && a.RespondedBy.User != null ? a.RespondedBy.User.FullName : null
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // GET: api/appointments/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentResponseDTO>> GetAppointment(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var appointment = await _context.Appointments
                .Include(a => a.Student)
                    .ThenInclude(s => s.User)
                .Include(a => a.RespondedBy)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found" });
            }

            // Check authorization - student can only see their own appointments
            if (userRole != "Admin")
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null || appointment.StudentId != student.Id)
                {
                    return Forbid();
                }
            }

            var response = new AppointmentResponseDTO
            {
                Id = appointment.Id,
                StudentId = appointment.StudentId,
                StudentName = appointment.Student?.User?.FullName ?? "Unknown",
                StudentEmail = appointment.Student?.User?.Email ?? "",
                StudentPhone = appointment.Student?.MobileNumber ?? "",
                Reason = appointment.Reason,
                AdditionalNotes = appointment.AdditionalNotes,
                Status = appointment.Status,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.AppointmentTime,
                ProvostResponse = appointment.ProvostResponse,
                RequestedAt = appointment.RequestedAt,
                RespondedAt = appointment.RespondedAt,
                RespondedByName = appointment.RespondedBy?.User?.FullName
            };

            return Ok(response);
        }

        // POST: api/appointments (Student - Create new appointment request)
        [HttpPost]
        public async Task<ActionResult<AppointmentResponseDTO>> CreateAppointment([FromBody] CreateAppointmentDTO dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                return NotFound(new { message = "Student record not found" });
            }

            var appointment = new Appointment
            {
                StudentId = student.Id,
                Reason = dto.Reason,
                AdditionalNotes = dto.AdditionalNotes,
                Status = "Pending",
                RequestedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            // Reload with includes
            appointment = await _context.Appointments
                .Include(a => a.Student)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(a => a.Id == appointment.Id);

            var response = new AppointmentResponseDTO
            {
                Id = appointment.Id,
                StudentId = appointment.StudentId,
                StudentName = appointment.Student?.User?.FullName ?? "Unknown",
                StudentEmail = appointment.Student?.User?.Email ?? "",
                StudentPhone = appointment.Student?.MobileNumber ?? "",
                Reason = appointment.Reason,
                AdditionalNotes = appointment.AdditionalNotes,
                Status = appointment.Status,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.AppointmentTime,
                ProvostResponse = appointment.ProvostResponse,
                RequestedAt = appointment.RequestedAt,
                RespondedAt = appointment.RespondedAt,
                RespondedByName = null
            };

            return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, response);
        }

        // PUT: api/appointments/{id}/status (Admin - Update appointment status)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "admin,Admin")]
        public async Task<ActionResult<AppointmentResponseDTO>> UpdateAppointmentStatus(int id, [FromBody] UpdateAppointmentStatusDTO dto)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Student)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found" });
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == userId);

            appointment.Status = dto.Status;
            appointment.ProvostResponse = dto.ProvostResponse;
            appointment.RespondedAt = DateTime.UtcNow;
            appointment.RespondedById = admin?.Id;

            if (dto.AppointmentDate.HasValue)
            {
                appointment.AppointmentDate = dto.AppointmentDate.Value;
            }

            if (!string.IsNullOrEmpty(dto.AppointmentTime))
            {
                if (TimeSpan.TryParse(dto.AppointmentTime, out TimeSpan time))
                {
                    appointment.AppointmentTime = time;
                }
            }

            await _context.SaveChangesAsync();

            // Reload with all includes
            appointment = await _context.Appointments
                .Include(a => a.Student)
                    .ThenInclude(s => s.User)
                .Include(a => a.RespondedBy)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            var response = new AppointmentResponseDTO
            {
                Id = appointment.Id,
                StudentId = appointment.StudentId,
                StudentName = appointment.Student?.User?.FullName ?? "Unknown",
                StudentEmail = appointment.Student?.User?.Email ?? "",
                StudentPhone = appointment.Student?.MobileNumber ?? "",
                Reason = appointment.Reason,
                AdditionalNotes = appointment.AdditionalNotes,
                Status = appointment.Status,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.AppointmentTime,
                ProvostResponse = appointment.ProvostResponse,
                RequestedAt = appointment.RequestedAt,
                RespondedAt = appointment.RespondedAt,
                RespondedByName = appointment.RespondedBy?.User?.FullName
            };

            return Ok(response);
        }

        // DELETE: api/appointments/{id} (Student - Cancel own appointment)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found" });
            }

            // Check authorization - student can only cancel their own pending appointments
            if (userRole != "Admin")
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null || appointment.StudentId != student.Id)
                {
                    return Forbid();
                }

                // Students can only cancel pending appointments
                if (appointment.Status != "Pending")
                {
                    return BadRequest(new { message = "Can only cancel pending appointments" });
                }
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Appointment cancelled successfully" });
        }
    }
}

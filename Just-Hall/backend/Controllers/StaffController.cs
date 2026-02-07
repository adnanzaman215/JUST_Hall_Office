using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JustHallAPI.Data;
using System.Security.Claims;

namespace JustHallAPI.Controllers
{
    [ApiController]
    [Route("api/staff")]
    [Authorize]
    public class StaffController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StaffController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/staff/all - Get all staff members (Admin only)
        [HttpGet("all")]
        [Authorize]
        public async Task<ActionResult> GetAllStaff()
        {
            try
            {
                Console.WriteLine("📋 GetAllStaff - Endpoint called");
                
                // Check if user is admin
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                
                Console.WriteLine($"👤 GetAllStaff - UserId: {userId}, Role: {userRole}");
                
                if (userRole?.ToLower() != "admin")
                {
                    Console.WriteLine("❌ GetAllStaff - Not admin, returning Forbid");
                    return Forbid();
                }

                Console.WriteLine("🔍 GetAllStaff - Fetching staff from database");
                
                var staffList = await _context.Staff
                    .Include(s => s.User)
                    .OrderByDescending(s => s.Id)
                    .Select(s => new
                    {
                        s.Id,
                        s.UserId,
                        s.EmployeeId,
                        s.StaffType,
                        s.Designation,
                        s.Status,
                        s.JoiningDate,
                        s.Dob,
                        s.Gender,
                        s.BloodGroup,
                        s.MobileNumber,
                        s.EmergencyNumber,
                        s.Address,
                        s.PhotoUrl,
                        User = new
                        {
                            s.User.Id,
                            s.User.Email,
                            s.User.FullName,
                            s.User.Role
                        },
                        // Include role request information
                        PendingRoleRequest = _context.StaffRoleRequests
                            .Where(r => r.StaffId == s.Id && r.Status == "Pending")
                            .Select(r => new
                            {
                                r.Id,
                                r.RequestedRole,
                                r.Remarks,
                                r.RequestedAt,
                                r.Status
                            })
                            .FirstOrDefault(),
                        RoleRequestCount = _context.StaffRoleRequests
                            .Count(r => r.StaffId == s.Id && r.Status == "Pending")
                    })
                    .ToListAsync();

                Console.WriteLine($"✅ GetAllStaff - Found {staffList.Count} staff members");
                
                return Ok(new { success = true, staff = staffList, count = staffList.Count });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 GetAllStaff - Error: {ex.Message}");
                return BadRequest(new { success = false, message = "Error fetching staff data", error = ex.Message });
            }
        }

        // GET: api/staff/{id} - Get specific staff member details
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult> GetStaffById(int id)
        {
            try
            {
                var staff = await _context.Staff
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (staff == null)
                    return NotFound(new { message = "Staff member not found" });

                return Ok(new { success = true, staff });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error fetching staff details", error = ex.Message });
            }
        }
    }
}

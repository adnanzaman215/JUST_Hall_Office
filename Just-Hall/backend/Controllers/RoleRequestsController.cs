using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JustHallAPI.Data;
using JustHallAPI.DTOs;
using JustHallAPI.Models;
using System.Security.Claims;

namespace JustHallAPI.Controllers
{
    [ApiController]
    [Route("api/role-requests")]
    [Authorize]
    public class RoleRequestsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RoleRequestsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/role-requests - Staff submits a role request
        [HttpPost]
        public async Task<ActionResult<RoleRequestResponse>> CreateRoleRequest([FromBody] CreateRoleRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new RoleRequestResponse
                    {
                        Success = false,
                        Message = "Unauthorized access"
                    });
                }

                // Get user and verify they are staff
                var user = await _context.Users
                    .Include(u => u.Student)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null || user.Role.ToLower() != "staff")
                {
                    return BadRequest(new RoleRequestResponse
                    {
                        Success = false,
                        Message = "Only staff members can submit role requests"
                    });
                }

                // Get staff record
                var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
                if (staff == null)
                {
                    return BadRequest(new RoleRequestResponse
                    {
                        Success = false,
                        Message = "Staff profile not found"
                    });
                }

                // Check if there's already a pending request
                var pendingRequest = await _context.StaffRoleRequests
                    .FirstOrDefaultAsync(r => r.StaffId == staff.Id && r.Status == "Pending");

                if (pendingRequest != null)
                {
                    return BadRequest(new RoleRequestResponse
                    {
                        Success = false,
                        Message = "You already have a pending role request. Please wait for admin review."
                    });
                }

                // Create new role request
                var roleRequest = new StaffRoleRequest
                {
                    StaffId = staff.Id,
                    RequestedRole = request.RequestedRole,
                    Status = "Pending",
                    RequestedAt = DateTime.UtcNow
                };

                _context.StaffRoleRequests.Add(roleRequest);
                await _context.SaveChangesAsync();

                var roleRequestDto = new RoleRequestDto
                {
                    Id = roleRequest.Id,
                    StaffId = staff.Id,
                    StaffName = user.FullName,
                    EmployeeId = staff.EmployeeId,
                    RequestedRole = roleRequest.RequestedRole,
                    Status = roleRequest.Status,
                    RequestedAt = roleRequest.RequestedAt
                };

                return Ok(new RoleRequestResponse
                {
                    Success = true,
                    Message = "Role request submitted successfully",
                    RoleRequest = roleRequestDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new RoleRequestResponse
                {
                    Success = false,
                    Message = $"Error creating role request: {ex.Message}"
                });
            }
        }

        // GET: api/role-requests/my-requests - Staff views their requests
        [HttpGet("my-requests")]
        public async Task<ActionResult<RoleRequestListResponse>> GetMyRoleRequests()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new RoleRequestListResponse
                    {
                        Success = false,
                        Message = "Unauthorized access"
                    });
                }

                // Get staff record
                var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
                if (staff == null)
                {
                    return BadRequest(new RoleRequestListResponse
                    {
                        Success = false,
                        Message = "Staff profile not found"
                    });
                }

                var requests = await _context.StaffRoleRequests
                    .Where(r => r.StaffId == staff.Id)
                    .Include(r => r.Staff)
                        .ThenInclude(s => s!.User)
                    .Include(r => r.Reviewer)
                    .OrderByDescending(r => r.RequestedAt)
                    .ToListAsync();

                var requestDtos = requests.Select(r => new RoleRequestDto
                {
                    Id = r.Id,
                    StaffId = r.StaffId,
                    StaffName = r.Staff?.User?.FullName ?? "Unknown",
                    EmployeeId = r.Staff?.EmployeeId ?? "Unknown",
                    RequestedRole = r.RequestedRole,
                    Status = r.Status,
                    Remarks = r.Remarks,
                    RequestedAt = r.RequestedAt,
                    ReviewedAt = r.ReviewedAt,
                    ReviewedByName = r.Reviewer?.FullName
                }).ToList();

                return Ok(new RoleRequestListResponse
                {
                    Success = true,
                    Message = "Role requests retrieved successfully",
                    RoleRequests = requestDtos
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new RoleRequestListResponse
                {
                    Success = false,
                    Message = $"Error retrieving role requests: {ex.Message}"
                });
            }
        }

        // GET: api/role-requests - Admin views all requests
        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<RoleRequestListResponse>> GetAllRoleRequests([FromQuery] string? status = null)
        {
            try
            {
                var query = _context.StaffRoleRequests
                    .Include(r => r.Staff)
                        .ThenInclude(s => s!.User)
                    .Include(r => r.Reviewer)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(r => r.Status == status);
                }

                var requests = await query
                    .OrderByDescending(r => r.RequestedAt)
                    .ToListAsync();

                var requestDtos = requests.Select(r => new RoleRequestDto
                {
                    Id = r.Id,
                    StaffId = r.StaffId,
                    StaffName = r.Staff?.User?.FullName ?? "Unknown",
                    EmployeeId = r.Staff?.EmployeeId ?? "Unknown",
                    RequestedRole = r.RequestedRole,
                    Status = r.Status,
                    Remarks = r.Remarks,
                    RequestedAt = r.RequestedAt,
                    ReviewedAt = r.ReviewedAt,
                    ReviewedByName = r.Reviewer?.FullName
                }).ToList();

                return Ok(new RoleRequestListResponse
                {
                    Success = true,
                    Message = "Role requests retrieved successfully",
                    RoleRequests = requestDtos
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new RoleRequestListResponse
                {
                    Success = false,
                    Message = $"Error retrieving role requests: {ex.Message}"
                });
            }
        }

        // PUT: api/role-requests/{id}/review - Admin approves or rejects request
        [HttpPut("{id}/review")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<RoleRequestResponse>> ReviewRoleRequest(int id, [FromBody] ReviewRoleRequestDto review)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new RoleRequestResponse
                    {
                        Success = false,
                        Message = "Unauthorized access"
                    });
                }

                var roleRequest = await _context.StaffRoleRequests
                    .Include(r => r.Staff)
                        .ThenInclude(s => s!.User)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (roleRequest == null)
                {
                    return NotFound(new RoleRequestResponse
                    {
                        Success = false,
                        Message = "Role request not found"
                    });
                }

                if (roleRequest.Status != "Pending")
                {
                    return BadRequest(new RoleRequestResponse
                    {
                        Success = false,
                        Message = "Only pending requests can be reviewed"
                    });
                }

                if (review.Status != "Approved" && review.Status != "Rejected")
                {
                    return BadRequest(new RoleRequestResponse
                    {
                        Success = false,
                        Message = "Status must be either 'Approved' or 'Rejected'"
                    });
                }

                // Update role request
                roleRequest.Status = review.Status;
                roleRequest.Remarks = review.Remarks;
                roleRequest.ReviewedAt = DateTime.UtcNow;
                roleRequest.ReviewedBy = userId;

                // If approved, update staff's service role
                if (review.Status == "Approved" && roleRequest.Staff != null)
                {
                    roleRequest.Staff.Designation = roleRequest.RequestedRole;
                }

                await _context.SaveChangesAsync();

                var reviewer = await _context.Users.FindAsync(userId);
                var roleRequestDto = new RoleRequestDto
                {
                    Id = roleRequest.Id,
                    StaffId = roleRequest.StaffId,
                    StaffName = roleRequest.Staff?.User?.FullName ?? "Unknown",
                    EmployeeId = roleRequest.Staff?.EmployeeId ?? "Unknown",
                    RequestedRole = roleRequest.RequestedRole,
                    Status = roleRequest.Status,
                    Remarks = roleRequest.Remarks,
                    RequestedAt = roleRequest.RequestedAt,
                    ReviewedAt = roleRequest.ReviewedAt,
                    ReviewedByName = reviewer?.FullName
                };

                return Ok(new RoleRequestResponse
                {
                    Success = true,
                    Message = $"Role request {review.Status.ToLower()} successfully",
                    RoleRequest = roleRequestDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new RoleRequestResponse
                {
                    Success = false,
                    Message = $"Error reviewing role request: {ex.Message}"
                });
            }
        }

        // DELETE: api/role-requests/{id} - Staff can delete their pending request
        [HttpDelete("{id}")]
        public async Task<ActionResult<RoleRequestResponse>> DeleteRoleRequest(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new RoleRequestResponse
                    {
                        Success = false,
                        Message = "Unauthorized access"
                    });
                }

                var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
                if (staff == null)
                {
                    return BadRequest(new RoleRequestResponse
                    {
                        Success = false,
                        Message = "Staff profile not found"
                    });
                }

                var roleRequest = await _context.StaffRoleRequests
                    .FirstOrDefaultAsync(r => r.Id == id && r.StaffId == staff.Id);

                if (roleRequest == null)
                {
                    return NotFound(new RoleRequestResponse
                    {
                        Success = false,
                        Message = "Role request not found"
                    });
                }

                if (roleRequest.Status != "Pending")
                {
                    return BadRequest(new RoleRequestResponse
                    {
                        Success = false,
                        Message = "Only pending requests can be deleted"
                    });
                }

                _context.StaffRoleRequests.Remove(roleRequest);
                await _context.SaveChangesAsync();

                return Ok(new RoleRequestResponse
                {
                    Success = true,
                    Message = "Role request deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new RoleRequestResponse
                {
                    Success = false,
                    Message = $"Error deleting role request: {ex.Message}"
                });
            }
        }
    }
}

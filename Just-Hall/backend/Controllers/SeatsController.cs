using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JustHallAPI.Data;
using JustHallAPI.DTOs;
using JustHallAPI.Models;

namespace JustHallAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeatsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SeatsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/seats/approved-applicants
        [HttpGet("approved-applicants")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<object>>> GetApprovedApplicantsWithoutSeats()
        {
            // Get all approved applications that don't have a seat assigned
            var assignedApplicationIds = await _context.SeatAllocations
                .Select(s => s.ApplicationId)
                .ToListAsync();

            var applicants = await _context.Applications
                .Where(a => a.Status == "Approved" && !assignedApplicationIds.Contains(a.Id))
                .Select(a => new
                {
                    a.Id,
                    a.FullName,
                    a.StudentId,
                    a.Department,
                    a.Session,
                    a.ProfilePhotoUrl,
                    a.Email,
                    a.Mobile
                })
                .ToListAsync();

            return Ok(applicants);
        }

        // GET: api/seats/floor/{floorNumber}
        [HttpGet("floor/{floorNumber}")]
        [AllowAnonymous]
        public async Task<ActionResult<FloorMapDto>> GetFloorMap(int floorNumber)
        {
            var floorAllocations = await _context.SeatAllocations
                .Include(s => s.Application)
                .Where(s => s.FloorNumber == floorNumber)
                .ToListAsync();

            var rooms = new List<RoomInfoDto>();

            // Generate info for all 28 rooms
            for (int roomNumber = 1; roomNumber <= 28; roomNumber++)
            {
                var roomAllocations = floorAllocations
                    .Where(s => s.RoomNumber == roomNumber)
                    .Select(s => new SeatAllocationDto
                    {
                        Id = s.Id,
                        FloorNumber = s.FloorNumber,
                        RoomNumber = s.RoomNumber,
                        SeatNumber = s.SeatNumber,
                        ApplicationId = s.ApplicationId,
                        StudentName = s.Application?.FullName,
                        StudentId = s.Application?.StudentId,
                        Department = s.Application?.Department,
                        ProfilePhotoUrl = s.Application?.ProfilePhotoUrl,
                        AssignedAt = s.AssignedAt
                    })
                    .ToList();

                rooms.Add(new RoomInfoDto
                {
                    FloorNumber = floorNumber,
                    RoomNumber = roomNumber,
                    OccupiedSeats = roomAllocations.Count,
                    AvailableSeats = 4 - roomAllocations.Count,
                    Allocations = roomAllocations
                });
            }

            var floorMap = new FloorMapDto
            {
                FloorNumber = floorNumber,
                TotalRooms = 28,
                OccupiedRooms = rooms.Count(r => r.OccupiedSeats > 0),
                TotalSeats = 112,
                OccupiedSeats = floorAllocations.Count,
                Rooms = rooms
            };

            return Ok(floorMap);
        }

        // POST: api/seats/assign
        [HttpPost("assign")]
        [AllowAnonymous]
        public async Task<ActionResult<SeatAllocationDto>> AssignSeat(AssignSeatRequest request)
        {
            // Validate seat number
            if (request.SeatNumber < 1 || request.SeatNumber > 4)
            {
                return BadRequest("Seat number must be between 1 and 4");
            }

            // Validate room number
            if (request.RoomNumber < 1 || request.RoomNumber > 28)
            {
                return BadRequest("Room number must be between 1 and 28");
            }

            // Check if application exists and is approved
            var application = await _context.Applications.FindAsync(request.ApplicationId);
            if (application == null)
            {
                return NotFound("Application not found");
            }

            if (application.Status != "Approved")
            {
                return BadRequest("Application must be approved before seat assignment");
            }

            // Check if student already has a seat
            var existingAllocation = await _context.SeatAllocations
                .FirstOrDefaultAsync(s => s.ApplicationId == request.ApplicationId);
            
            if (existingAllocation != null)
            {
                return BadRequest($"Student already has a seat: Floor {existingAllocation.FloorNumber}, Room {existingAllocation.RoomNumber}, Seat {existingAllocation.SeatNumber}");
            }

            // Check if seat is already occupied
            var seatOccupied = await _context.SeatAllocations
                .AnyAsync(s => s.FloorNumber == request.FloorNumber 
                    && s.RoomNumber == request.RoomNumber 
                    && s.SeatNumber == request.SeatNumber);

            if (seatOccupied)
            {
                return BadRequest("This seat is already occupied");
            }

            // Create seat allocation
            var allocation = new SeatAllocation
            {
                FloorNumber = request.FloorNumber,
                RoomNumber = request.RoomNumber,
                SeatNumber = request.SeatNumber,
                ApplicationId = request.ApplicationId,
                AssignedAt = DateTime.UtcNow
            };

            _context.SeatAllocations.Add(allocation);
            await _context.SaveChangesAsync();

            // Return the allocation with student info
            var result = new SeatAllocationDto
            {
                Id = allocation.Id,
                FloorNumber = allocation.FloorNumber,
                RoomNumber = allocation.RoomNumber,
                SeatNumber = allocation.SeatNumber,
                ApplicationId = allocation.ApplicationId,
                StudentName = application.FullName,
                StudentId = application.StudentId,
                Department = application.Department,
                ProfilePhotoUrl = application.ProfilePhotoUrl,
                AssignedAt = allocation.AssignedAt
            };

            return CreatedAtAction(nameof(GetAllocation), new { id = allocation.Id }, result);
        }

        // GET: api/seats/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<SeatAllocationDto>> GetAllocation(int id)
        {
            var allocation = await _context.SeatAllocations
                .Include(s => s.Application)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (allocation == null)
            {
                return NotFound();
            }

            var result = new SeatAllocationDto
            {
                Id = allocation.Id,
                FloorNumber = allocation.FloorNumber,
                RoomNumber = allocation.RoomNumber,
                SeatNumber = allocation.SeatNumber,
                ApplicationId = allocation.ApplicationId,
                StudentName = allocation.Application?.FullName,
                StudentId = allocation.Application?.StudentId,
                Department = allocation.Application?.Department,
                ProfilePhotoUrl = allocation.Application?.ProfilePhotoUrl,
                AssignedAt = allocation.AssignedAt
            };

            return Ok(result);
        }

        // DELETE: api/seats/{id}
        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> RemoveSeatAllocation(int id)
        {
            var allocation = await _context.SeatAllocations.FindAsync(id);
            if (allocation == null)
            {
                return NotFound();
            }

            _context.SeatAllocations.Remove(allocation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/seats/statistics
        [HttpGet("statistics")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> GetStatistics()
        {
            var occupiedSeats = await _context.SeatAllocations.CountAsync();
            var approvedCount = await _context.Applications
                .Where(a => a.Status == "Approved")
                .CountAsync();
            var approvedWithoutSeats = approvedCount - occupiedSeats;

            // Get floor statistics
            var floorStats = await _context.SeatAllocations
                .GroupBy(s => s.FloorNumber)
                .Select(g => new
                {
                    FloorNumber = g.Key,
                    OccupiedSeats = g.Count()
                })
                .ToListAsync();

            return Ok(new
            {
                TotalOccupied = occupiedSeats,
                ApprovedWithoutSeats = approvedWithoutSeats > 0 ? approvedWithoutSeats : 0,
                FloorStatistics = floorStats
            });
        }
    }
}

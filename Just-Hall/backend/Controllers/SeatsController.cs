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
            // Get all approved applications where student doesn't have a room allocated
            var approvedApps = await _context.Applications
                .Where(a => a.Status == "Approved")
                .ToListAsync();

            var result = new List<object>();
            foreach (var app in approvedApps)
            {
                if (int.TryParse(app.UserId, out int userId))
                {
                    var hasRoom = await _context.Students
                        .AnyAsync(s => s.UserId == userId && s.RoomNo != null);
                    
                    if (!hasRoom)
                    {
                        result.Add(new
                        {
                            app.Id,
                            app.FullName,
                            app.StudentId,
                            app.Department,
                            app.Session,
                            app.ProfilePhotoUrl,
                            app.Email,
                            app.Mobile
                        });
                    }
                }
            }

            return Ok(result);
        }

        // GET: api/seats/floor/{floorNumber}
        [HttpGet("floor/{floorNumber}")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> GetFloorMap(int floorNumber)
        {
            // Get all students with room allocations for this floor
            var allocatedStudents = await _context.Students
                .Include(s => s.User)
                .Where(s => s.RoomNo != null && s.RoomNo.StartsWith(floorNumber.ToString()))
                .ToListAsync();

            var rooms = new List<object>();
            
            // Each floor has 30 rooms (e.g., Floor 2: 201-230)
            for (int roomNum = 1; roomNum <= 30; roomNum++)
            {
                var roomNumber = (floorNumber * 100) + roomNum; // e.g., 201, 202, etc.
                var roomNumberStr = roomNumber.ToString();
                
                // Filter students whose room designation starts with this room number
                var roomStudents = allocatedStudents
                    .Where(s => s.RoomNo != null && s.RoomNo.StartsWith(roomNumberStr))
                    .ToList();
                
                // Create seat map based on actual seat assignments
                var seats = new List<object>();
                var seatDesignations = new[] { "B1", "B2", "C1", "C2" };
                var seatTypes = new[] { "Balcony", "Balcony", "Corridor", "Corridor" };
                
                for (int i = 0; i < 4; i++)
                {
                    var fullSeatId = $"{roomNumber}{seatDesignations[i]}";
                    var student = roomStudents.FirstOrDefault(s => s.RoomNo == fullSeatId);
                    seats.Add(CreateSeatInfo(fullSeatId, roomNumber, seatTypes[i], i + 1, student));
                }

                rooms.Add(new
                {
                    RoomNumber = roomNumber,
                    Floor = floorNumber,
                    TotalSeats = 4,
                    AllocatedSeats = roomStudents.Count,
                    AvailableSeats = 4 - roomStudents.Count,
                    Seats = seats
                });
            }

            var totalAllocated = allocatedStudents.Count;
            
            return Ok(new
            {
                Floor = floorNumber,
                TotalRooms = 30,
                TotalSeats = 120, // 30 rooms * 4 seats
                AllocatedSeats = totalAllocated,
                AvailableSeats = 120 - totalAllocated,
                Rooms = rooms
            });
        }

        private object CreateSeatInfo(string seatId, int roomNumber, string seatType, int seatNumber, Student? student)
        {
            if (student != null)
            {
                return new
                {
                    SeatId = seatId,
                    RoomNumber = roomNumber,
                    SeatType = seatType,
                    SeatNumber = seatNumber,
                    IsAllocated = true,
                    StudentName = student.User?.FullName ?? "",
                    StudentId = student.StudentId,
                    Department = student.Department,
                    Session = student.Session,
                    PhotoUrl = student.PhotoUrl,
                    Email = student.User?.Email ?? "",
                    Mobile = student.MobileNumber
                };
            }
            
            return new
            {
                SeatId = seatId,
                RoomNumber = roomNumber,
                SeatType = seatType,
                SeatNumber = seatNumber,
                IsAllocated = false,
                StudentName = "",
                StudentId = "",
                Department = "",
                Session = "",
                PhotoUrl = "",
                Email = "",
                Mobile = ""
            };
        }

        // POST: api/seats/assign
        [HttpPost("assign")]
        [AllowAnonymous]
        public async Task<ActionResult> AssignSeat(AssignSeatRequest request)
        {
            // Find the application
            var application = await _context.Applications
                .FirstOrDefaultAsync(a => a.Id == request.ApplicationId);

            if (application == null)
                return NotFound(new { error = "Application not found" });

            if (application.Status != "Approved")
                return BadRequest(new { error = "Application must be approved before seat assignment" });

            if (string.IsNullOrEmpty(application.StudentId))
                return BadRequest(new { error = "Application has no student ID" });

            // Find the student profile using StudentId
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.StudentId == application.StudentId);

            if (student == null)
                return NotFound(new { error = $"Student profile not found for student ID: {application.StudentId}" });

            // Check if student already has a room
            if (student.RoomNo != null)
                return BadRequest(new { error = $"Student already has room {student.RoomNo} allocated" });

            // Get all applications for this room to find occupied seats
            // Check both applications table (which stores full seat designations like "230B1")
            var roomNumberStr = request.RoomNumber.ToString();
            var applicationsInRoom = await _context.Applications
                .Where(a => a.Status == "Approved" && 
                           !string.IsNullOrEmpty(a.RoomNo) && 
                           a.RoomNo.StartsWith(roomNumberStr))
                .ToListAsync();

            if (applicationsInRoom.Count >= 4)
                return BadRequest(new { error = "Room is full (maximum 4 students per room)" });

            // Define seat designations in order: B1, B2, C1, C2
            var seatDesignations = new[] { "B1", "B2", "C1", "C2" };
            
            // Find which seats are already occupied by parsing application.RoomNo
            var occupiedSeats = new HashSet<string>();
            foreach (var app in applicationsInRoom)
            {
                // Extract seat designation from room number (e.g., "230B1" -> "B1")
                if (app.RoomNo.Length > roomNumberStr.Length)
                {
                    var seatPart = app.RoomNo.Substring(roomNumberStr.Length);
                    occupiedSeats.Add(seatPart);
                }
            }

            // Find the first available seat
            string assignedSeat = null;
            foreach (var seat in seatDesignations)
            {
                if (!occupiedSeats.Contains(seat))
                {
                    assignedSeat = seat;
                    break;
                }
            }

            if (assignedSeat == null)
                return BadRequest(new { error = "No available seats in this room" });

            // Create the full room designation with seat (e.g., "230B1")
            var fullRoomDesignation = $"{request.RoomNumber}{assignedSeat}";

            // Allocate the seat - store full designation in both tables
            student.RoomNo = fullRoomDesignation; // Store full designation like "230B1"
            student.ResidenceStatus = "resident";
            application.RoomNo = fullRoomDesignation; // Store full designation with seat

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Seat allocated successfully", 
                roomNo = request.RoomNumber,
                seatDesignation = fullRoomDesignation,
                seat = assignedSeat
            });
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

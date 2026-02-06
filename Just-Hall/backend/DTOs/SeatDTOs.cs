namespace JustHallAPI.DTOs
{
    public class SeatAllocationDto
    {
        public int Id { get; set; }
        public int FloorNumber { get; set; }
        public int RoomNumber { get; set; }
        public int SeatNumber { get; set; }
        public int ApplicationId { get; set; }
        public string? StudentName { get; set; }
        public string? StudentId { get; set; }
        public string? Department { get; set; }
        public string? ProfilePhotoUrl { get; set; }
        public DateTime AssignedAt { get; set; }
    }

    public class AssignSeatRequest
    {
        public int FloorNumber { get; set; }
        public int RoomNumber { get; set; }
        public int SeatNumber { get; set; }
        public int ApplicationId { get; set; }
    }

    public class RoomInfoDto
    {
        public int FloorNumber { get; set; }
        public int RoomNumber { get; set; }
        public int OccupiedSeats { get; set; }
        public int AvailableSeats { get; set; }
        public List<SeatAllocationDto> Allocations { get; set; } = new();
    }

    public class FloorMapDto
    {
        public int FloorNumber { get; set; }
        public int TotalRooms { get; set; } = 28;
        public int OccupiedRooms { get; set; }
        public int TotalSeats { get; set; } = 112; // 28 rooms * 4 seats
        public int OccupiedSeats { get; set; }
        public List<RoomInfoDto> Rooms { get; set; } = new();
    }
}

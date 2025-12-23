using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JustHallAPI.Models
{
    [Table("seat_allocations")]
    public class SeatAllocation
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("floor_number")]
        public int FloorNumber { get; set; }

        [Required]
        [Column("room_number")]
        public int RoomNumber { get; set; }

        [Required]
        [Column("seat_number")]
        public int SeatNumber { get; set; } // 1, 2, 3, or 4

        [Required]
        [Column("application_id")]
        public int ApplicationId { get; set; }

        [Column("assigned_at")]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("ApplicationId")]
        public Application? Application { get; set; }
    }
}

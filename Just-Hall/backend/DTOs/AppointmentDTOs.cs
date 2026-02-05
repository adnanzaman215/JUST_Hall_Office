// DTOs/AppointmentDTOs.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace JustHallAPI.DTOs
{
    public class CreateAppointmentDTO
    {
        [Required]
        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? AdditionalNotes { get; set; }
    }

    public class UpdateAppointmentStatusDTO
    {
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = string.Empty; // Approved, Rejected, Completed, Cancelled

        public DateTime? AppointmentDate { get; set; }

        public string? AppointmentTime { get; set; } // Format: "HH:mm"

        [MaxLength(500)]
        public string? ProvostResponse { get; set; }
    }

    public class AppointmentResponseDTO
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        public string StudentPhone { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string? AdditionalNotes { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? AppointmentDate { get; set; }
        public TimeSpan? AppointmentTime { get; set; }
        public string? ProvostResponse { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
        public string? RespondedByName { get; set; }
    }
}

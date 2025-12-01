using JustHallAPI.DTOs;
using JustHallAPI.Models;

namespace JustHallAPI.Helpers
{
    public static class MappingExtensions
    {
        // User to UserDto
        public static UserDto ToDto(this User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                FullName = user.FullName,
                Role = user.Role,
                StudentId = user.StudentId,
                Department = user.Department,
                IsVerified = user.IsVerified
            };
        }

        // Student to StudentDto
        public static StudentDto ToDto(this Student student)
        {
            return new StudentDto
            {
                StudentId = student.StudentId,
                Department = student.Department,
                Session = student.Session,
                RoomNo = student.RoomNo,
                Dob = student.Dob,
                Gender = student.Gender,
                BloodGroup = student.BloodGroup,
                FatherName = student.FatherName,
                MotherName = student.MotherName,
                MobileNumber = student.MobileNumber,
                EmergencyNumber = student.EmergencyNumber,
                Address = student.Address,
                PhotoUrl = student.PhotoUrl
            };
        }

        // Application to ApplicationDto
        public static ApplicationDto ToDto(this Application application)
        {
            return new ApplicationDto
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
        }

        // Notice to NoticeDto
        public static NoticeDto ToDto(this Notice notice)
        {
            return new NoticeDto
            {
                Id = notice.Id,
                Title = notice.Title,
                Body = notice.Body,
                Category = notice.Category,
                Author = notice.Author,
                Pinned = notice.Pinned,
                AttachmentUrl = notice.AttachmentUrl,
                ExpiresAt = notice.ExpiresAt,
                CreatedAt = notice.CreatedAt,
                UpdatedAt = notice.UpdatedAt
            };
        }
    }
}

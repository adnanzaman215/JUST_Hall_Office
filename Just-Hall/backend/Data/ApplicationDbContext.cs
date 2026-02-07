using Microsoft.EntityFrameworkCore;
using JustHallAPI.Models;

namespace JustHallAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Staff> Staff { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<Notice> Notices { get; set; }
        public DbSet<NoticeAuditLog> NoticeAuditLogs { get; set; }
        public DbSet<SeatAllocation> SeatAllocations { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<StaffRoleRequest> StaffRoleRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users_user");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Username).IsUnique();
                
                entity.HasOne(u => u.Student)
                    .WithOne(s => s.User)
                    .HasForeignKey<Student>(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Student configuration
            modelBuilder.Entity<Student>(entity =>
            {
                entity.ToTable("users_student");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.StudentId).IsUnique();
            });

            // Staff configuration
            modelBuilder.Entity<Staff>(entity =>
            {
                entity.ToTable("users_staff");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.EmployeeId).IsUnique();
                
                entity.HasOne(s => s.User)
                    .WithOne()
                    .HasForeignKey<Staff>(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Admin configuration
            modelBuilder.Entity<Admin>(entity =>
            {
                entity.ToTable("users_admin");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.AdminId).IsUnique();
                
                entity.HasOne(a => a.User)
                    .WithOne()
                    .HasForeignKey<Admin>(a => a.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Application configuration
            modelBuilder.Entity<Application>(entity =>
            {
                entity.ToTable("hallcore_application");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.StudentId).IsUnique();
                entity.HasIndex(e => e.PaymentSlipNo).IsUnique();
            });

            // Notice configuration
            modelBuilder.Entity<Notice>(entity =>
            {
                entity.ToTable("notices_notice");
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<NoticeAuditLog>(entity =>
            {
                entity.ToTable("notices_audit_logs");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.NoticeId);
                entity.HasIndex(e => e.PerformedAt);
            });

            // Payment configuration
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.ToTable("payments_payment");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.TransactionId).IsUnique();
                entity.HasIndex(e => e.StudentId);
                entity.HasIndex(e => e.Status);
                
                entity.HasOne(p => p.Student)
                    .WithMany()
                    .HasForeignKey(p => p.StudentId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(p => p.Verifier)
                    .WithMany()
                    .HasForeignKey(p => p.VerifiedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Appointment configuration
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.ToTable("appointments");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.StudentId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.AppointmentDate);
                
                entity.HasOne(a => a.Student)
                    .WithMany()
                    .HasForeignKey(a => a.StudentId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(a => a.RespondedBy)
                    .WithMany()
                    .HasForeignKey(a => a.RespondedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // StaffRoleRequest configuration
            modelBuilder.Entity<StaffRoleRequest>(entity =>
            {
                entity.ToTable("staff_role_requests");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.StaffId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.RequestedAt);
                
                entity.HasOne(r => r.Staff)
                    .WithMany()
                    .HasForeignKey(r => r.StaffId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(r => r.Reviewer)
                    .WithMany()
                    .HasForeignKey(r => r.ReviewedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}

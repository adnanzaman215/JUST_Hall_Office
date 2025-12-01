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
        public DbSet<Application> Applications { get; set; }
        public DbSet<Notice> Notices { get; set; }

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
        }
    }
}

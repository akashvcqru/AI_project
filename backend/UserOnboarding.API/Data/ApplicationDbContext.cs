using Microsoft.EntityFrameworkCore;
using UserOnboarding.API.Models;

namespace UserOnboarding.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<EKYC> EKYC { get; set; } = null!;
        public DbSet<CompanyDetails> CompanyDetails { get; set; } = null!;
        public DbSet<DirectorDetails> DirectorDetails { get; set; } = null!;
        public DbSet<SubmissionStatus> SubmissionStatuses { get; set; } = null!;
        public DbSet<Admin> Admins { get; set; } = null!;
        public DbSet<OnboardingEntry> OnboardingEntries { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasOne(u => u.EKYC)
                .WithOne(e => e.User)
                .HasForeignKey<EKYC>(e => e.UserId);

            modelBuilder.Entity<User>()
                .HasOne(u => u.CompanyDetails)
                .WithOne(c => c.User)
                .HasForeignKey<CompanyDetails>(c => c.UserId);

            modelBuilder.Entity<User>()
                .HasOne(u => u.DirectorDetails)
                .WithOne(d => d.User)
                .HasForeignKey<DirectorDetails>(d => d.UserId);

            modelBuilder.Entity<User>()
                .HasOne(u => u.SubmissionStatus)
                .WithOne(s => s.User)
                .HasForeignKey<SubmissionStatus>(s => s.UserId);
        }
    }
} 
using Microsoft.EntityFrameworkCore;
using UserOnboarding.API.Models;

namespace UserOnboarding.API.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(ApplicationDbContext context)
        {
            // Apply any pending migrations
            await context.Database.MigrateAsync();

            // Check if we already have an admin user
            if (await context.Admins.AnyAsync())
            {
                return;
            }

            // Create admin user
            var admin = new Admin
            {
                Email = "admin@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123")
            };

            context.Admins.Add(admin);
            await context.SaveChangesAsync();
        }
    }
} 
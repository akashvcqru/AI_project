using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using YourNamespace.Data; // Update this with your actual namespace
using YourNamespace.Models; // Update this with your actual namespace

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        
        // Add your DbContext
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

        // Add Identity
        builder.Services.AddIdentity<IdentityUser, IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        var app = builder.Build();

        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            var userManager = services.GetRequiredService<UserManager<IdentityUser>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

            // Create Admin role if it doesn't exist
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
            }

            // Check if admin user exists
            var adminUser = await userManager.FindByEmailAsync("admin@admin.com");
            
            if (adminUser == null)
            {
                // Create admin user
                adminUser = new IdentityUser
                {
                    UserName = "admin@admin.com",
                    Email = "admin@admin.com",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(adminUser, "admin123");
                
                if (result.Succeeded)
                {
                    // Add user to Admin role
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                    Console.WriteLine("Admin user created successfully!");
                }
                else
                {
                    Console.WriteLine("Error creating admin user:");
                    foreach (var error in result.Errors)
                    {
                        Console.WriteLine($"- {error.Description}");
                    }
                }
            }
            else
            {
                // Update admin user's password
                var token = await userManager.GeneratePasswordResetTokenAsync(adminUser);
                var result = await userManager.ResetPasswordAsync(adminUser, token, "admin123");
                
                if (result.Succeeded)
                {
                    Console.WriteLine("Admin user password updated successfully!");
                }
                else
                {
                    Console.WriteLine("Error updating admin user password:");
                    foreach (var error in result.Errors)
                    {
                        Console.WriteLine($"- {error.Description}");
                    }
                }
            }
        }
    }
} 
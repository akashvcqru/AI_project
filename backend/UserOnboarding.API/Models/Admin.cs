using System.ComponentModel.DataAnnotations;

namespace UserOnboarding.API.Models
{
    public class Admin
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public bool IsSuperAdmin { get; set; } = true;  // Always true since we only have super admin

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
} 
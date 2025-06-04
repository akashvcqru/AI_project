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
    }
} 
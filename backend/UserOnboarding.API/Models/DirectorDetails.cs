using System.ComponentModel.DataAnnotations;

namespace UserOnboarding.API.Models
{
    public class DirectorDetails
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        [Required]
        [StringLength(12)]
        public string AadharNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string PANNumber { get; set; } = string.Empty;

        public User User { get; set; } = null!;
    }
} 
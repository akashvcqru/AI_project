using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserOnboarding.API.Models
{
    public class SubmissionStatus
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Status { get; set; } = string.Empty;

        [Required]
        public DateTime SubmittedAt { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        public string? ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? Remarks { get; set; }
    }
} 
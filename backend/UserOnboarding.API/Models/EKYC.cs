using System.ComponentModel.DataAnnotations;

namespace UserOnboarding.API.Models
{
    public class EKYC
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        [Required]
        [StringLength(15)]
        public string GSTNumber { get; set; } = string.Empty;

        public string GSTDocumentPath { get; set; } = string.Empty;

        public User User { get; set; } = null!;
    }
} 
using System.ComponentModel.DataAnnotations;

namespace UserOnboarding.API.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        public bool IsEmailVerified { get; set; }

        public string? OTP { get; set; }
        public DateTime? OTPExpiry { get; set; }

        public EKYC EKYC { get; set; }
        public CompanyDetails CompanyDetails { get; set; }
        public DirectorDetails DirectorDetails { get; set; }
        public SubmissionStatus SubmissionStatus { get; set; }
    }
} 
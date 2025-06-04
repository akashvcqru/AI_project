using System.ComponentModel.DataAnnotations;

namespace UserOnboarding.API.Models
{
    public class OnboardingEntry
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = "";
        
        [Required]
        public string CompanyName { get; set; } = "";
        
        [Required]
        public string DirectorName { get; set; } = "";
        
        [Required]
        public string PanNumber { get; set; } = "";
        
        public string GstNumber { get; set; } = "";
        
        public string AadharNumber { get; set; } = "";
        
        public string CompanyAddress { get; set; } = "";
        
        public string City { get; set; } = "";
        
        public string State { get; set; } = "";
        
        public string Pincode { get; set; } = "";
        
        public string DirectorDesignation { get; set; } = "";
        
        public string DirectorAddress { get; set; } = "";
        
        [Required]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
        
        public string? RejectionReason { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // File paths for uploaded documents
        public string? PanCardPath { get; set; }
        public string? PhotoPath { get; set; }
        public string? SignaturePath { get; set; }
    }
} 
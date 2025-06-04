using Microsoft.AspNetCore.Mvc;
using UserOnboarding.API.Data;
using UserOnboarding.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace UserOnboarding.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("verify/email")]
        public async Task<IActionResult> VerifyEmail([FromBody] EmailVerificationRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                user = new User
                {
                    Email = request.Email,
                    IsEmailVerified = true
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else if (!user.IsEmailVerified)
            {
                user.IsEmailVerified = true;
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true, message = "Email verified successfully" });
        }

        [HttpPost("ekyc")]
        public async Task<IActionResult> SubmitEKYC([FromBody] EKYCRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.EKYC = new EKYC
            {
                PANNumber = request.PANNumber,
                GSTNumber = request.GSTNumber
            };

            await _context.SaveChangesAsync();
            return Ok(new { message = "EKYC details submitted successfully" });
        }

        [HttpPost("company")]
        public async Task<IActionResult> SubmitCompanyDetails([FromBody] CompanyDetailsRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.CompanyDetails = new CompanyDetails
            {
                Name = request.Name,
                Category = request.Category,
                WebsiteUrl = request.WebsiteUrl,
                Country = request.Country,
                State = request.State,
                City = request.City,
                Address = request.Address
            };

            await _context.SaveChangesAsync();
            return Ok(new { message = "Company details submitted successfully" });
        }

        [HttpPost("director")]
        public async Task<IActionResult> SubmitDirectorDetails([FromBody] DirectorDetailsRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.DirectorDetails = new DirectorDetails
            {
                AadharNumber = request.AadharNumber,
                PANNumber = request.PANNumber
            };

            await _context.SaveChangesAsync();
            return Ok(new { message = "Director details submitted successfully" });
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitOnboarding([FromBody] ComprehensiveSubmitRequest request)
        {
            try
            {
                // Log the incoming request
                Console.WriteLine($"Received submit request for email: {request?.Email}");
                Console.WriteLine($"Request data: {System.Text.Json.JsonSerializer.Serialize(request)}");

                if (request == null)
                {
                    return BadRequest(new { message = "Request body is null" });
                }

                if (string.IsNullOrEmpty(request.Email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                var user = await _context.Users
                    .Include(u => u.EKYC)
                    .Include(u => u.CompanyDetails)
                    .Include(u => u.DirectorDetails)
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Create comprehensive onboarding entry with data from frontend
                var onboardingEntry = new OnboardingEntry
                {
                    Email = request.Email,
                    CompanyName = request.CompanyName ?? user.CompanyDetails?.Name ?? "",
                    DirectorName = request.DirectorName ?? "Director",
                    PanNumber = request.PanNumber ?? user.EKYC?.PANNumber ?? "",
                    GstNumber = request.GstNumber ?? user.EKYC?.GSTNumber ?? "",
                    AadharNumber = request.AadharNumber ?? user.DirectorDetails?.AadharNumber ?? "",
                    CompanyAddress = request.Address ?? user.CompanyDetails?.Address ?? "",
                    City = request.City ?? user.CompanyDetails?.City ?? "",
                    State = request.State ?? user.CompanyDetails?.State ?? "",
                    Pincode = request.Pincode ?? "",
                    DirectorDesignation = request.Designation ?? "",
                    DirectorAddress = request.DirectorAddress ?? "",
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Update user submission status if it doesn't exist
                if (user.SubmissionStatus == null)
                {
                    user.SubmissionStatus = new SubmissionStatus
                    {
                        Status = "Pending",
                        SubmittedAt = DateTime.UtcNow
                    };
                }
                else
                {
                    user.SubmissionStatus.Status = "Pending";
                    user.SubmissionStatus.SubmittedAt = DateTime.UtcNow;
                }

                _context.OnboardingEntries.Add(onboardingEntry);
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Onboarding submitted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SubmitOnboarding: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }

    public class EmailVerificationRequest
    {
        public string Email { get; set; }
    }

    public class EKYCRequest
    {
        public string Email { get; set; } = string.Empty;
        public string PANNumber { get; set; } = string.Empty;
        public string GSTNumber { get; set; } = string.Empty;
    }

    public class CompanyDetailsRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string WebsiteUrl { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }

    public class DirectorDetailsRequest
    {
        public string Email { get; set; } = string.Empty;
        public string AadharNumber { get; set; } = string.Empty;
        public string PANNumber { get; set; } = string.Empty;
    }

    public class ComprehensiveSubmitRequest
    {
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;
        
        [JsonPropertyName("companyName")]
        public string CompanyName { get; set; } = string.Empty;
        
        [JsonPropertyName("directorName")]
        public string DirectorName { get; set; } = string.Empty;
        
        [JsonPropertyName("panNumber")]
        public string PanNumber { get; set; } = string.Empty;
        
        [JsonPropertyName("gstNumber")]
        public string GstNumber { get; set; } = string.Empty;
        
        [JsonPropertyName("aadharNumber")]
        public string AadharNumber { get; set; } = string.Empty;
        
        [JsonPropertyName("address")]
        public string Address { get; set; } = string.Empty;
        
        [JsonPropertyName("city")]
        public string City { get; set; } = string.Empty;
        
        [JsonPropertyName("state")]
        public string State { get; set; } = string.Empty;
        
        [JsonPropertyName("pincode")]
        public string Pincode { get; set; } = string.Empty;
        
        [JsonPropertyName("designation")]
        public string Designation { get; set; } = string.Empty;
        
        [JsonPropertyName("directorAddress")]
        public string DirectorAddress { get; set; } = string.Empty;
    }
} 
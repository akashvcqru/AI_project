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
                GSTNumber = request.GSTNumber,
                GSTDocumentPath = request.GSTDocumentPath
            };

            await _context.SaveChangesAsync();
            return Ok(new { message = "eKYC details submitted successfully" });
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
                    .Include(u => u.SubmissionStatus)
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Update user's existing data with the comprehensive submission data
                if (user.EKYC != null)
                {
                    user.EKYC.PANNumber = request.PanNumber ?? user.EKYC.PANNumber;
                    user.EKYC.GSTNumber = request.GstNumber ?? user.EKYC.GSTNumber;
                }

                if (user.CompanyDetails != null)
                {
                    user.CompanyDetails.Name = request.CompanyName ?? user.CompanyDetails.Name;
                    user.CompanyDetails.Address = request.Address ?? user.CompanyDetails.Address;
                    user.CompanyDetails.City = request.City ?? user.CompanyDetails.City;
                    user.CompanyDetails.State = request.State ?? user.CompanyDetails.State;
                }

                if (user.DirectorDetails != null)
                {
                    user.DirectorDetails.AadharNumber = request.AadharNumber ?? user.DirectorDetails.AadharNumber;
                }

                // Update user submission status
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

        [HttpGet("check-progress/{email}")]
        public async Task<IActionResult> CheckUserProgress(string email)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.EKYC)
                    .Include(u => u.CompanyDetails)
                    .Include(u => u.DirectorDetails)
                    .Include(u => u.SubmissionStatus)
                    .FirstOrDefaultAsync(u => u.Email == email);

                if (user == null)
                {
                    return Ok(new { 
                        exists = false,
                        currentStep = 0,
                        isSubmitted = false
                    });
                }

                // Check if already submitted
                if (user.SubmissionStatus != null && user.SubmissionStatus.Status == "Pending")
                {
                    return Ok(new { 
                        exists = true,
                        currentStep = -1, // -1 indicates already submitted
                        isSubmitted = true,
                        message = "Your request has been submitted and your documents are under process."
                    });
                }

                // Determine current step based on completed data
                int currentStep = 0;
                
                if (user.IsEmailVerified)
                {
                    currentStep = 1; // Move to eKYC
                    
                    if (user.EKYC != null && !string.IsNullOrEmpty(user.EKYC.PANNumber))
                    {
                        currentStep = 2; // Move to Company Details
                        
                        if (user.CompanyDetails != null && !string.IsNullOrEmpty(user.CompanyDetails.Name))
                        {
                            currentStep = 3; // Move to Director Details
                            
                            if (user.DirectorDetails != null && !string.IsNullOrEmpty(user.DirectorDetails.AadharNumber))
                            {
                                currentStep = 4; // Move to Confirmation
                            }
                        }
                    }
                }

                return Ok(new { 
                    exists = true,
                    currentStep = currentStep,
                    isSubmitted = false,
                    userData = new
                    {
                        email = user.Email,
                        isEmailVerified = user.IsEmailVerified,
                        panNumber = user.EKYC?.PANNumber,
                        gstNumber = user.EKYC?.GSTNumber,
                        companyName = user.CompanyDetails?.Name,
                        companyAddress = user.CompanyDetails?.Address,
                        companyCity = user.CompanyDetails?.City,
                        companyState = user.CompanyDetails?.State,
                        aadharNumber = user.DirectorDetails?.AadharNumber,
                        directorPanNumber = user.DirectorDetails?.PANNumber
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error checking user progress", error = ex.Message });
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
        public string GSTNumber { get; set; } = string.Empty;
        public string GSTDocumentPath { get; set; } = string.Empty;
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
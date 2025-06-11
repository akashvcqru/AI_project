using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserOnboarding.API.Data;
using UserOnboarding.API.Models;
using UserOnboarding.API.Services;
using System.Security.Cryptography;
using System.Text;

namespace UserOnboarding.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AccountController> _logger;

        public AccountController(
            ApplicationDbContext context,
            IEmailService emailService,
            IConfiguration configuration,
            ILogger<AccountController> logger)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            _logger.LogInformation("Received email verification request for: {Email}", request.Email);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for email verification request");
                return BadRequest(ModelState);
            }

            // Generate OTP
            var otp = GenerateOTP();
            _logger.LogInformation("Generated OTP for {Email}: {OTP}", request.Email, otp);

            // Store OTP in database or cache
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                _logger.LogInformation("Creating new user for {Email}", request.Email);
                user = new User
                {
                    Email = request.Email,
                    IsEmailVerified = false,
                    OTP = otp,
                    OTPExpiry = DateTime.UtcNow.AddMinutes(5)
                };
                _context.Users.Add(user);
            }
            else
            {
                _logger.LogInformation("Updating existing user {Email} with new OTP", request.Email);
                user.OTP = otp;
                user.OTPExpiry = DateTime.UtcNow.AddMinutes(5);
            }

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully saved OTP to database for {Email}", request.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save OTP to database for {Email}", request.Email);
                return StatusCode(500, new { message = "Failed to save OTP", error = ex.Message });
            }

            // Send OTP via email
            try
            {
                _logger.LogInformation("Attempting to send OTP email to {Email}", request.Email);
                await _emailService.SendOtpEmailAsync(request.Email, otp);
                _logger.LogInformation("Successfully sent OTP email to {Email}", request.Email);
                return Ok(new { message = "OTP sent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send OTP email to {Email}", request.Email);
                return StatusCode(500, new { message = "Failed to send OTP", error = ex.Message });
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOTP([FromBody] VerifyOTPRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
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

            if (user.OTP != request.OTP || user.OTPExpiry < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired OTP" });
            }

            user.IsEmailVerified = true;
            user.OTP = null;
            user.OTPExpiry = null;

            await _context.SaveChangesAsync();

            // Check if user has already submitted
            if (user.SubmissionStatus != null && user.SubmissionStatus.Status == "Pending")
            {
                return Ok(new { 
                    message = "Email verified successfully",
                    isSubmitted = true,
                    submissionMessage = "Your request has been submitted and your documents are under process.",
                    currentStep = -1
                });
            }

            // Determine current step based on completed data
            int currentStep = 1; // After email verification, default to eKYC step
            
            if (user.EKYC != null && !string.IsNullOrEmpty(user.DirectorDetails?.PANNumber))
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

            return Ok(new { 
                message = "Email verified successfully",
                isSubmitted = false,
                currentStep = currentStep,
                userData = new
                {
                    email = user.Email,
                    isEmailVerified = user.IsEmailVerified,
                    panNumber = user.DirectorDetails?.PANNumber,
                    gstNumber = user.EKYC?.GSTNumber,
                    companyName = user.CompanyDetails?.Name,
                    companyAddress = user.CompanyDetails?.Address,
                    companyCity = user.CompanyDetails?.City,
                    companyState = user.CompanyDetails?.State,
                    aadharNumber = user.DirectorDetails?.AadharNumber
                }
            });
        }

        private string GenerateOTP()
        {
            // Generate a 6-digit OTP
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }
    }

    public class VerifyEmailRequest
    {
        public string Email { get; set; }
    }

    public class VerifyOTPRequest
    {
        public string Email { get; set; }
        public string OTP { get; set; }
    }
} 
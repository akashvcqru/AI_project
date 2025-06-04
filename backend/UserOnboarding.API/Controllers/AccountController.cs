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

        public AccountController(
            ApplicationDbContext context,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Generate OTP
            var otp = GenerateOTP();

            // Store OTP in database or cache
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
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
                user.OTP = otp;
                user.OTPExpiry = DateTime.UtcNow.AddMinutes(5);
            }

            await _context.SaveChangesAsync();

            // Send OTP via email
            try
            {
                await _emailService.SendOtpEmailAsync(request.Email, otp);
                return Ok(new { message = "OTP sent successfully" });
            }
            catch (Exception ex)
            {
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

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
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

            return Ok(new { message = "Email verified successfully" });
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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserOnboarding.API.Data;
using UserOnboarding.API.Models;
using UserOnboarding.API.Services;
using Microsoft.Extensions.Logging;

namespace UserOnboarding.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BrandController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<BrandController> _logger;
        private readonly IEmailService _emailService;

        public BrandController(
            ApplicationDbContext context,
            IConfiguration configuration,
            ILogger<BrandController> logger,
            IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _emailService = emailService;
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] EmailVerificationRequest request)
        {
            try
            {
                _logger.LogInformation("Verifying email: {Email}", request.Email);

                // First check if user exists
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

                if (user == null)
                {
                    _logger.LogWarning("User not found for email: {Email}", request.Email);
                    return NotFound(new { 
                        message = "This email is not registered. Please enter a registered email address or contact support for assistance.",
                        verifiedStatus = "NotRegistered"
                    });
                }

                // Check OnboardingEntries table for user status
                var onboardingEntry = await _context.OnboardingEntries
                    .FirstOrDefaultAsync(o => o.Email.ToLower() == request.Email.ToLower());

                if (onboardingEntry == null)
                {
                    _logger.LogWarning("No onboarding entry found for email: {Email}", request.Email);
                    return BadRequest(new { 
                        message = "Your account is not properly set up. Please contact support for assistance.",
                        verifiedStatus = "NotSet"
                    });
                }

                // Check status from OnboardingEntries
                switch (onboardingEntry.Status.ToLower())
                {
                    case "pending":
                        _logger.LogInformation("User {Email} is pending approval", request.Email);
                        return BadRequest(new { 
                            message = "Your account is pending approval. Please wait for admin approval before proceeding.",
                            verifiedStatus = "Pending"
                        });

                    case "rejected":
                        _logger.LogInformation("User {Email} is rejected", request.Email);
                        return BadRequest(new { 
                            message = "Your account has been rejected. Please contact support for assistance.",
                            verifiedStatus = "Rejected"
                        });

                    case "approved":
                        _logger.LogInformation("User {Email} is approved", request.Email);
                        // Check if this is first time login by checking if password is set
                        bool isFirstLogin = string.IsNullOrEmpty(user.PasswordHash);
                        _logger.LogInformation("User {Email} first login status: {IsFirstLogin}", request.Email, isFirstLogin);

                        return Ok(new
                        {
                            isFirstLogin = isFirstLogin,
                            email = user.Email,
                            message = isFirstLogin ? "Email verified. Please set up your password." : "Email verified. Please enter your password.",
                            verifiedStatus = "Approved",
                            user = new
                            {
                                id = user.Id,
                                email = user.Email,
                                companyName = user.CompanyDetails?.Name,
                                isApproved = true
                            }
                        });

                    default:
                        _logger.LogWarning("Invalid status for user {Email}: {Status}", request.Email, onboardingEntry.Status);
                        return BadRequest(new { 
                            message = "Your account has an invalid status. Please contact support for assistance.",
                            verifiedStatus = "Invalid"
                        });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying email: {Email}", request.Email);
                return StatusCode(500, new { 
                    message = "An error occurred while verifying your email. Please try again later.",
                    verifiedStatus = "Error"
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                _logger.LogInformation("Attempting login for email: {Email}", request.Email);

                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    _logger.LogWarning("Login attempt with empty email or password");
                    return BadRequest(new { message = "Email and password are required" });
                }

                var user = await _context.Users
                    .Include(u => u.CompanyDetails)
                    .Include(u => u.DirectorDetails)
                    .Include(u => u.EKYC)
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

                if (user == null)
                {
                    _logger.LogWarning("No user found with email: {Email}", request.Email);
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                // Verify password
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
                _logger.LogInformation("Password verification result for user {UserId}: {IsValid}", 
                    user.Id, isPasswordValid);

                if (!isPasswordValid)
                {
                    _logger.LogWarning("Invalid password for user: {UserId}", user.Id);
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                // Generate JWT token
                var token = GenerateJwtToken(user);
                _logger.LogInformation("Login successful for user: {UserId}", user.Id);

                return Ok(new
                {
                    token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        companyName = user.CompanyDetails?.Name,
                        companyDetails = new
                        {
                            name = user.CompanyDetails?.Name,
                            category = user.CompanyDetails?.Category,
                            websiteUrl = user.CompanyDetails?.WebsiteUrl,
                            country = user.CompanyDetails?.Country,
                            state = user.CompanyDetails?.State,
                            city = user.CompanyDetails?.City,
                            address = user.CompanyDetails?.Address
                        },
                        directorDetails = new
                        {
                            aadharNumber = user.DirectorDetails?.AadharNumber,
                            panNumber = user.DirectorDetails?.PANNumber
                        },
                        ekyc = new
                        {
                            gstNumber = user.EKYC?.GSTNumber
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during brand login process for email: {Email}. Error: {ErrorMessage}", 
                    request.Email, ex.Message);
                return StatusCode(500, new { message = "An error occurred during login", details = ex.Message });
            }
        }

        [HttpPost("setup-password")]
        public async Task<IActionResult> SetupPassword([FromBody] SetupPasswordRequest request)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.CompanyDetails)
                    .Include(u => u.DirectorDetails)
                    .Include(u => u.EKYC)
                    .Include(u => u.SubmissionStatus)
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Check if user is approved
                if (user.SubmissionStatus?.Status != "Approved")
                {
                    return BadRequest(new { 
                        message = "Your account is pending approval. Please wait for admin approval before setting up your password.",
                        status = user.SubmissionStatus?.Status
                    });
                }

                // Check if password is already set
                if (!string.IsNullOrEmpty(user.PasswordHash))
                {
                    return BadRequest(new { message = "Password is already set" });
                }

                // Validate password
                if (request.Password.Length < 8)
                {
                    return BadRequest(new { message = "Password must be at least 8 characters long" });
                }

                // Hash and save password
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                await _context.SaveChangesAsync();

                // Generate JWT token
                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        companyName = user.CompanyDetails?.Name,
                        companyDetails = new
                        {
                            name = user.CompanyDetails?.Name,
                            category = user.CompanyDetails?.Category,
                            websiteUrl = user.CompanyDetails?.WebsiteUrl,
                            country = user.CompanyDetails?.Country,
                            state = user.CompanyDetails?.State,
                            city = user.CompanyDetails?.City,
                            address = user.CompanyDetails?.Address
                        },
                        directorDetails = new
                        {
                            aadharNumber = user.DirectorDetails?.AadharNumber,
                            panNumber = user.DirectorDetails?.PANNumber
                        },
                        ekyc = new
                        {
                            gstNumber = user.EKYC?.GSTNumber
                        }
                    },
                    message = "Password set up successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password setup");
                return StatusCode(500, new { message = "An error occurred while setting up password" });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not found");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.Role, "Brand"),
                new Claim("UserId", user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "https://localhost:7001",
                audience: _configuration["Jwt:Audience"] ?? "https://localhost:7001",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
} 
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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.CompanyDetails)
                    .Include(u => u.DirectorDetails)
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

                if (user == null)
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                // Check if this is first login (no password set)
                if (string.IsNullOrEmpty(user.PasswordHash))
                {
                    return Ok(new
                    {
                        isFirstLogin = true,
                        email = user.Email,
                        message = "First login detected. Please set up your password."
                    });
                }

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

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
                        directorName = user.DirectorDetails?.Name
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during brand login process");
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        [HttpPost("setup-password")]
        public async Task<IActionResult> SetupPassword([FromBody] SetupPasswordRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
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
                        directorName = user.DirectorDetails?.Name
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
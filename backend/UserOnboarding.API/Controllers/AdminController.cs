using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserOnboarding.API.Data;
using UserOnboarding.API.Models;
using System.Security.Cryptography;

namespace UserOnboarding.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AdminController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var admin = await _context.Admins
                .FirstOrDefaultAsync(a => a.Email == request.Email);

            if (admin == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            if (!VerifyPassword(request.Password, admin.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            return Ok(new { message = "Login successful" });
        }

        [Authorize]
        [HttpGet("submissions")]
        public async Task<IActionResult> GetSubmissions()
        {
            var submissions = await _context.Users
                .Include(u => u.EKYC)
                .Include(u => u.CompanyDetails)
                .Include(u => u.DirectorDetails)
                .Include(u => u.SubmissionStatus)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    EKYC = new { u.EKYC.PANNumber, u.EKYC.GSTNumber },
                    Company = new
                    {
                        u.CompanyDetails.Name,
                        u.CompanyDetails.Category,
                        u.CompanyDetails.WebsiteUrl,
                        u.CompanyDetails.Country,
                        u.CompanyDetails.State,
                        u.CompanyDetails.City,
                        u.CompanyDetails.Address
                    },
                    Director = new
                    {
                        u.DirectorDetails.AadharNumber,
                        u.DirectorDetails.PANNumber
                    },
                    Status = u.SubmissionStatus.Status,
                    ReviewedBy = u.SubmissionStatus.ReviewedBy,
                    ReviewedAt = u.SubmissionStatus.ReviewedAt,
                    Remarks = u.SubmissionStatus.Remarks
                })
                .ToListAsync();

            return Ok(submissions);
        }

        [Authorize]
        [HttpPost("submission/{id}/approve")]
        public async Task<IActionResult> ApproveSubmission(int id, [FromBody] ReviewRequest request)
        {
            var submission = await _context.SubmissionStatuses
                .FirstOrDefaultAsync(s => s.UserId == id);

            if (submission == null)
            {
                return NotFound();
            }

            submission.Status = "Approved";
            submission.ReviewedBy = User.Identity?.Name;
            submission.ReviewedAt = DateTime.UtcNow;
            submission.Remarks = request.Remarks;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Submission approved successfully" });
        }

        [Authorize]
        [HttpPost("submission/{id}/reject")]
        public async Task<IActionResult> RejectSubmission(int id, [FromBody] ReviewRequest request)
        {
            var submission = await _context.SubmissionStatuses
                .FirstOrDefaultAsync(s => s.UserId == id);

            if (submission == null)
            {
                return NotFound();
            }

            submission.Status = "Rejected";
            submission.ReviewedBy = User.Identity?.Name;
            submission.ReviewedAt = DateTime.UtcNow;
            submission.Remarks = request.Remarks;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Submission rejected successfully" });
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var verifiedUsers = await _context.Users.CountAsync(u => u.IsEmailVerified);
            var pendingSubmissions = await _context.SubmissionStatuses
                .CountAsync(s => s.Status == "Pending");

            return Ok(new
            {
                totalUsers,
                verifiedUsers,
                pendingSubmissions
            });
        }

        [HttpGet("onboarding-entries")]
        public async Task<IActionResult> GetOnboardingEntries()
        {
            try
            {
                var entries = await _context.OnboardingEntries
                    .OrderByDescending(x => x.CreatedAt)
                    .Select(x => new
                    {
                        x.Id,
                        x.Email,
                        x.CompanyName,
                        x.DirectorName,
                        x.PanNumber,
                        x.GstNumber,
                        x.Status,
                        x.CreatedAt,
                        x.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(entries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch onboarding entries", error = ex.Message });
            }
        }

        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveEntry(int id)
        {
            try
            {
                var entry = await _context.OnboardingEntries.FindAsync(id);
                if (entry == null)
                {
                    return NotFound(new { message = "Onboarding entry not found" });
                }

                entry.Status = "Approved";
                entry.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();

                return Ok(new { message = "Entry approved successfully", entry = new { entry.Id, entry.Status } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to approve entry", error = ex.Message });
            }
        }

        [HttpPost("reject/{id}")]
        public async Task<IActionResult> RejectEntry(int id, [FromBody] RejectRequest request)
        {
            try
            {
                var entry = await _context.OnboardingEntries.FindAsync(id);
                if (entry == null)
                {
                    return NotFound(new { message = "Onboarding entry not found" });
                }

                entry.Status = "Rejected";
                entry.RejectionReason = request.Reason;
                entry.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();

                return Ok(new { message = "Entry rejected successfully", entry = new { entry.Id, entry.Status, entry.RejectionReason } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to reject entry", error = ex.Message });
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var totalEntries = await _context.OnboardingEntries.CountAsync();
                var pendingEntries = await _context.OnboardingEntries.CountAsync(x => x.Status == "Pending");
                var approvedEntries = await _context.OnboardingEntries.CountAsync(x => x.Status == "Approved");
                var rejectedEntries = await _context.OnboardingEntries.CountAsync(x => x.Status == "Rejected");

                return Ok(new
                {
                    totalEntries,
                    pendingEntries,
                    approvedEntries,
                    rejectedEntries
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch stats", error = ex.Message });
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ReviewRequest
    {
        public string Remarks { get; set; } = string.Empty;
    }

    public class RejectRequest
    {
        public string Reason { get; set; } = "";
    }
} 
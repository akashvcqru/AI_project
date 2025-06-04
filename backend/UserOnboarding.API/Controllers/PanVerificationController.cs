using Microsoft.AspNetCore.Mvc;
using UserOnboarding.API.Services;

namespace UserOnboarding.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PanVerificationController : ControllerBase
    {
        private readonly IPanVerificationService _panVerificationService;

        public PanVerificationController(IPanVerificationService panVerificationService)
        {
            _panVerificationService = panVerificationService;
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPan([FromBody] PanVerificationRequest request)
        {
            try
            {
                var result = await _panVerificationService.VerifyPanAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to verify PAN", error = ex.Message });
            }
        }

        [HttpGet("validate/{panNumber}")]
        public async Task<IActionResult> ValidatePan(string panNumber)
        {
            try
            {
                // Use the new method that only requires PAN number
                var result = await _panVerificationService.ValidatePanOnlyAsync(panNumber);
                
                if (result.Success)
                {
                    return Ok(new { 
                        success = true,
                        name = result.PanHolderName ?? "PAN Number Valid",
                        message = result.Message 
                    });
                }
                else
                {
                    return Ok(new { 
                        success = false,
                        name = (string)null,
                        message = result.Message 
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false,
                    message = "Failed to validate PAN", 
                    error = ex.Message 
                });
            }
        }
    }
} 
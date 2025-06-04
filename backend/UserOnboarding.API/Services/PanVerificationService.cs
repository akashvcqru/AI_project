using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace UserOnboarding.API.Services
{
    public interface IPanVerificationService
    {
        Task<PanVerificationResponse> VerifyPanAsync(PanVerificationRequest request);
        Task<PanVerificationResponse> ValidatePanOnlyAsync(string panNumber);
    }

    public class PanVerificationService : IPanVerificationService
    {
        private readonly HttpClient _httpClient;
        private const string API_URL = "https://apicore.vcqru.com/api/PancardVerify";

        public PanVerificationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<PanVerificationResponse> VerifyPanAsync(PanVerificationRequest request)
        {
            var payload = new
            {
                Pancard = request.PanNumber,
                PanHolderName = request.Name ?? "",
                M_Consumerid = "18607",
                Dateofbirth = request.DateOfBirth?.ToString("dd-MM-yyyy") ?? ""
            };

            return await CallVcqruApi(payload);
        }

        public async Task<PanVerificationResponse> ValidatePanOnlyAsync(string panNumber)
        {
            // For real-time validation, we only send the PAN number
            var payload = new
            {
                Pancard = panNumber,
                PanHolderName = "",
                M_Consumerid = "18607",
                Dateofbirth = ""
            };

            return await CallVcqruApi(payload);
        }

        private async Task<PanVerificationResponse> CallVcqruApi(object payload)
        {
            try
            {
                var content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync(API_URL, content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    
                    // Try to parse different response formats
                    try
                    {
                        var apiResponse = JsonSerializer.Deserialize<VcqruApiResponse>(responseString, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

                        return new PanVerificationResponse
                        {
                            Success = apiResponse?.Status == "1" || 
                                     apiResponse?.Status?.ToLower() == "success" ||
                                     !string.IsNullOrEmpty(apiResponse?.PanHolderName),
                            Message = apiResponse?.Message ?? "PAN verification completed",
                            PanHolderName = apiResponse?.PanHolderName ?? apiResponse?.Data?.PanHolderName
                        };
                    }
                    catch
                    {
                        // If JSON parsing fails, try simple string response
                        return new PanVerificationResponse
                        {
                            Success = responseString.Contains("success", StringComparison.OrdinalIgnoreCase),
                            Message = responseString,
                            PanHolderName = ExtractNameFromResponse(responseString)
                        };
                    }
                }
                else
                {
                    return new PanVerificationResponse
                    {
                        Success = false,
                        Message = "PAN verification failed",
                        PanHolderName = null
                    };
                }
            }
            catch (Exception ex)
            {
                return new PanVerificationResponse
                {
                    Success = false,
                    Message = $"Error during PAN verification: {ex.Message}",
                    PanHolderName = null
                };
            }
        }

        private string ExtractNameFromResponse(string response)
        {
            // Simple extraction logic for name from response
            // This can be enhanced based on actual API response format
            return null;
        }
    }

    public class PanVerificationRequest
    {
        public string PanNumber { get; set; }
        public string Name { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }

    public class PanVerificationResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string PanHolderName { get; set; }
    }

    // API Response models to handle VCQRU API response
    public class VcqruApiResponse
    {
        public string Status { get; set; }
        public string Message { get; set; }
        public string PanHolderName { get; set; }
        public VcqruApiData Data { get; set; }
    }

    public class VcqruApiData
    {
        public string PanHolderName { get; set; }
        public string PanNumber { get; set; }
    }
} 
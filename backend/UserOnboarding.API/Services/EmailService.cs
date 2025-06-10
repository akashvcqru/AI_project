using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;

namespace UserOnboarding.API.Services
{
    public interface IEmailService
    {
        Task SendOtpEmailAsync(string toEmail, string otp);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly SmtpClient _smtpClient;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _smtpClient = new SmtpClient
            {
                Host = _configuration["SmtpSettings:Server"],
                Port = int.Parse(_configuration["SmtpSettings:Port"]),
                EnableSsl = bool.Parse(_configuration["SmtpSettings:EnableSsl"]),
                UseDefaultCredentials = bool.Parse(_configuration["SmtpSettings:UseDefaultCredentials"]),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Credentials = new NetworkCredential(
                    _configuration["SmtpSettings:Username"],
                    _configuration["SmtpSettings:Password"]
                )
            };
        }

        public async Task SendOtpEmailAsync(string toEmail, string otp)
        {
            try
            {
                var fromEmail = _configuration["SmtpSettings:FromEmail"];
                var fromName = _configuration["SmtpSettings:FromName"];

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = "Your OTP for Email Verification",
                    Body = $@"
                    <html>
                        <body>
                            <h2>Email Verification OTP</h2>
                            <p>Your OTP for email verification is: <strong>{otp}</strong></p>
                            <p>This OTP is valid for 5 minutes.</p>
                            <p>If you didn't request this OTP, please ignore this email.</p>
                        </body>
                    </html>",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                await _smtpClient.SendMailAsync(mailMessage);
                _logger.LogInformation($"OTP email sent successfully to {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send OTP email to {toEmail}");
                throw new Exception($"Failed to send OTP email: {ex.Message}", ex);
            }
        }
    }
} 
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;

namespace UserOnboarding.API.Services
{
    public interface IEmailService
    {
        Task SendOtpEmailAsync(string toEmail, string otp);
        Task SendApprovalEmailAsync(string toEmail, string companyName, string directorName);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly SmtpClient _smtpClient;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            var smtpSettings = _configuration.GetSection("SmtpSettings");
            _smtpClient = new SmtpClient(smtpSettings["Server"], int.Parse(smtpSettings["Port"]))
            {
                Credentials = new NetworkCredential(smtpSettings["Username"], smtpSettings["Password"]),
                EnableSsl = bool.Parse(smtpSettings["EnableSsl"]),
                UseDefaultCredentials = bool.Parse(smtpSettings["UseDefaultCredentials"])
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

        public async Task SendApprovalEmailAsync(string toEmail, string companyName, string directorName)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var message = new MailMessage
                {
                    From = new MailAddress(smtpSettings["FromEmail"], smtpSettings["FromName"]),
                    Subject = "Your Company Has Been Approved!",
                    Body = GenerateEmailBody(companyName, directorName),
                    IsBodyHtml = true
                };

                message.To.Add(toEmail);

                await _smtpClient.SendMailAsync(message);
                _logger.LogInformation("Approval email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending approval email to {Email}", toEmail);
                throw;
            }
        }

        private string GenerateEmailBody(string companyName, string directorName)
        {
            return $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #2c3e50;'>Welcome to Our Platform!</h2>
                        
                        <p>Dear {directorName},</p>
                        
                        <p>We are pleased to inform you that your company <strong>{companyName}</strong> has been approved for access to our platform.</p>
                        
                        <h3 style='color: #2c3e50;'>Next Steps:</h3>
                        <ol>
                            <li>Visit our login page at: <a href='https://localhost:3000/brand/login'>https://localhost:3000/brand/login</a></li>
                            <li>Use your registered email address to log in</li>
                            <li>Set up your password on first login</li>
                        </ol>
                        
                        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                        
                        <p>Best regards,<br>
                        The Admin Team</p>
                        
                        <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;'>
                            <p>This is an automated message, please do not reply directly to this email.</p>
                        </div>
                    </div>
                </body>
                </html>";
        }
    }
} 
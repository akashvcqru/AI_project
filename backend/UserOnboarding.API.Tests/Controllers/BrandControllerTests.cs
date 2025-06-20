using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using UserOnboarding.API.Controllers;
using UserOnboarding.API.Services;
using UserOnboarding.API.Models;
using Microsoft.Extensions.Logging;

namespace UserOnboarding.API.Tests.Controllers
{
    public class BrandControllerTests
    {
        [Fact]
        public async Task VerifyEmail_WithDifferentUserStatuses_ReturnsAppropriateResponse()
        {
            // Arrange
            var testEmail = "test@example.com";
            var mockUserService = new Mock<IUserService>();
            var mockSubmissionStatusService = new Mock<ISubmissionStatusService>();
            var mockLogger = new Mock<ILogger<BrandController>>();
            var controller = new BrandController(mockUserService.Object, mockSubmissionStatusService.Object, mockLogger.Object);

            // Test Case 1: Pending User
            var pendingUser = new User { Email = testEmail };
            var pendingStatus = new SubmissionStatus { Email = testEmail, Status = "Pending" };
            mockUserService.Setup(x => x.GetUserByEmailAsync(testEmail)).ReturnsAsync(pendingUser);
            mockSubmissionStatusService.Setup(x => x.GetSubmissionStatusByEmailAsync(testEmail)).ReturnsAsync(pendingStatus);

            var result = await controller.VerifyEmail(new EmailVerificationRequest { Email = testEmail });
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<dynamic>(badRequestResult.Value);
            Assert.Equal("pending", response.status.ToString().ToLower());
            Assert.Contains("pending approval", response.message.ToString());

            // Test Case 2: Rejected User
            var rejectedStatus = new SubmissionStatus { Email = testEmail, Status = "Rejected", RejectionReason = "Invalid documents" };
            mockSubmissionStatusService.Setup(x => x.GetSubmissionStatusByEmailAsync(testEmail)).ReturnsAsync(rejectedStatus);

            result = await controller.VerifyEmail(new EmailVerificationRequest { Email = testEmail });
            badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            response = Assert.IsType<dynamic>(badRequestResult.Value);
            Assert.Equal("rejected", response.status.ToString().ToLower());
            Assert.Contains("rejected", response.message.ToString());
            Assert.Contains("Invalid documents", response.message.ToString());

            // Test Case 3: Approved User - First Login
            var approvedUser = new User { Email = testEmail, PasswordHash = null };
            var approvedStatus = new SubmissionStatus { Email = testEmail, Status = "Approved" };
            mockUserService.Setup(x => x.GetUserByEmailAsync(testEmail)).ReturnsAsync(approvedUser);
            mockSubmissionStatusService.Setup(x => x.GetSubmissionStatusByEmailAsync(testEmail)).ReturnsAsync(approvedStatus);

            result = await controller.VerifyEmail(new EmailVerificationRequest { Email = testEmail });
            var okResult = Assert.IsType<OkObjectResult>(result);
            response = Assert.IsType<dynamic>(okResult.Value);
            Assert.Equal("approved", response.status.ToString().ToLower());
            Assert.True(response.isFirstLogin);
            Assert.Contains("set up your password", response.message.ToString());

            // Test Case 4: Approved User - Returning User
            approvedUser.PasswordHash = "hashedpassword";
            mockUserService.Setup(x => x.GetUserByEmailAsync(testEmail)).ReturnsAsync(approvedUser);

            result = await controller.VerifyEmail(new EmailVerificationRequest { Email = testEmail });
            okResult = Assert.IsType<OkObjectResult>(result);
            response = Assert.IsType<dynamic>(okResult.Value);
            Assert.Equal("approved", response.status.ToString().ToLower());
            Assert.False(response.isFirstLogin);
            Assert.Contains("enter your password", response.message.ToString());

            // Test Case 5: User Not Found
            mockUserService.Setup(x => x.GetUserByEmailAsync(testEmail)).ReturnsAsync((User)null);

            result = await controller.VerifyEmail(new EmailVerificationRequest { Email = testEmail });
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            response = Assert.IsType<dynamic>(notFoundResult.Value);
            Assert.Contains("not registered", response.message.ToString());

            // Test Case 6: No Submission Status
            mockUserService.Setup(x => x.GetUserByEmailAsync(testEmail)).ReturnsAsync(approvedUser);
            mockSubmissionStatusService.Setup(x => x.GetSubmissionStatusByEmailAsync(testEmail)).ReturnsAsync((SubmissionStatus)null);

            result = await controller.VerifyEmail(new EmailVerificationRequest { Email = testEmail });
            badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            response = Assert.IsType<dynamic>(badRequestResult.Value);
            Assert.Equal("notset", response.status.ToString().ToLower());
            Assert.Contains("status is not set", response.message.ToString());
        }
    }
} 
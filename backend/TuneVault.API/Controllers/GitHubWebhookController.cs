using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TuneVault.API.Hubs;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Enums;

namespace TuneVault.API.Controllers
{
    [ApiController]
    [Route("api/github")]
    public class GitHubWebhookController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IConfiguration _configuration;

        public GitHubWebhookController(
            IUserRepository userRepository,
            INotificationRepository notificationRepository,
            IHubContext<NotificationHub> hubContext,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _notificationRepository = notificationRepository;
            _hubContext = hubContext;
            _configuration = configuration;
        }

        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> ReceiveWebhook()
        {
            string body;
            using (var reader = new StreamReader(Request.Body))
            {
                body = await reader.ReadToEndAsync();
            }

            // Optional secret verification. If no secret configured, allow for local/dev testing.
            var secret = _configuration["GitHub:WebhookSecret"];
            if (!string.IsNullOrEmpty(secret))
            {
                if (!Request.Headers.TryGetValue("X-Hub-Signature-256", out var signatureHeader))
                    return Unauthorized();

                if (!VerifySignature(body, signatureHeader.FirstOrDefault() ?? string.Empty, secret))
                    return Unauthorized();
            }

            var eventType = Request.Headers["X-GitHub-Event"].FirstOrDefault();
            if (string.IsNullOrEmpty(eventType) || eventType != "push")
                return Ok(new { handled = false, reason = "not a push event" });

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            string? repoFullName = null;
            if (root.TryGetProperty("repository", out var repoEl) && repoEl.TryGetProperty("full_name", out var fullNameEl))
                repoFullName = fullNameEl.GetString();

            string? refStr = root.GetProperty("ref").GetString();
            string? branch = refStr?.Split('/').LastOrDefault();

            if (!root.TryGetProperty("commits", out var commitsEl) || commitsEl.ValueKind != JsonValueKind.Array)
                return Ok(new { handled = false, reason = "no commits" });

            var processed = 0;
            var seenEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var commit in commitsEl.EnumerateArray())
            {
                if (!commit.TryGetProperty("author", out var author))
                    continue;
                if (!author.TryGetProperty("email", out var emailEl))
                    continue;

                var email = emailEl.GetString();
                if (string.IsNullOrEmpty(email) || !seenEmails.Add(email))
                    continue;

                var user = await _userRepository.GetByEmailAsync(email);
                if (user == null)
                    continue;

                var payload = JsonSerializer.Serialize(new
                {
                    repo = repoFullName,
                    branch,
                    commitId = commit.GetProperty("id").GetString(),
                    message = commit.GetProperty("message").GetString(),
                    author = new { name = author.GetProperty("name").GetString(), email }
                });

                var notification = new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Type = NotificationType.System,
                    PayloadJson = payload,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _notificationRepository.CreateAsync(notification);
                if (created)
                {
                    await _hubContext.Clients.User(user.Id).SendAsync("ReceiveNotification", notification);
                    processed++;
                }
            }

            return Ok(new { handled = true, processed });
        }

        private static bool VerifySignature(string payload, string signatureHeader, string secret)
        {
            if (string.IsNullOrEmpty(signatureHeader) || !signatureHeader.StartsWith("sha256="))
                return false;

            var signature = signatureHeader.Substring("sha256=".Length);
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            var computed = BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();

            var sigBytes = Encoding.UTF8.GetBytes(signature);
            var compBytes = Encoding.UTF8.GetBytes(computed);
            if (sigBytes.Length != compBytes.Length)
                return false;

            return CryptographicOperations.FixedTimeEquals(sigBytes, compBytes);
        }
    }
}

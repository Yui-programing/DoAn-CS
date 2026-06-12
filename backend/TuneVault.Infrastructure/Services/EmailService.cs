using Microsoft.Extensions.Configuration;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using TuneVault.Application.Common.Interfaces;

namespace TuneVault.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var smtpServer = emailSettings["SmtpServer"];
            var portString = emailSettings["Port"];
            var senderEmail = emailSettings["SenderEmail"];
            var senderName = emailSettings["SenderName"];
            var appPassword = emailSettings["AppPassword"];

            // Tạm thời In OTP ra màn hình Console
            if (string.IsNullOrEmpty(smtpServer) || smtpServer == "smtp.gmail.com_CHUA_CAU_HINH")
            {
                Console.WriteLine("==================================================");
                Console.WriteLine($"[MOCK EMAIL] To: {toEmail}");
                Console.WriteLine($"[MOCK EMAIL] Subject: {subject}");
                Console.WriteLine($"[MOCK EMAIL] Body: \n{body}");
                Console.WriteLine("==================================================");
                return;
            }

            if (int.TryParse(portString, out int port))
            {
                using var client = new SmtpClient(smtpServer, port)
                {
                    Credentials = new NetworkCredential(senderEmail, appPassword),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail!, senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
            }
        }
    }
}

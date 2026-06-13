using MediatR;
using System.ComponentModel.DataAnnotations;

namespace TuneVault.Application.Features.Auth.Commands.SendForgotPasswordOtp
{
    public class SendForgotPasswordOtpCommand : IRequest<bool>
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}

using MediatR;
using System.ComponentModel.DataAnnotations;

namespace TuneVault.Application.Features.Auth.Commands.SendRegistrationOtp
{
    public class SendRegistrationOtpCommand : IRequest<bool>
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}

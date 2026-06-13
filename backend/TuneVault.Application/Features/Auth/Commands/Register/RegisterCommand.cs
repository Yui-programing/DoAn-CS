using MediatR;

namespace TuneVault.Application.Features.Auth.Commands.Register
{
    public class RegisterCommand : IRequest<bool>
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string OtpCode { get; set; } = null!;
    }
}
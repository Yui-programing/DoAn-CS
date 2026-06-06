using MediatR;

namespace TuneVault.Application.Features.Auth.Commands.Login
{
    public class LoginCommand : IRequest<string>
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
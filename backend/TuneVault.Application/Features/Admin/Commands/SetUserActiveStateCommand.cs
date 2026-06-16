using MediatR;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Admin.Commands
{
    public class SetUserActiveStateCommand : IRequest<bool>
    {
        public string UserId { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class SetUserActiveStateCommandHandler : IRequestHandler<SetUserActiveStateCommand, bool>
    {
        private readonly IUserRepository _userRepository;

        public SetUserActiveStateCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<bool> Handle(SetUserActiveStateCommand request, CancellationToken cancellationToken)
        {
            return await _userRepository.SetUserActiveStateAsync(request.UserId, request.IsActive);
        }
    }
}

using MediatR;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Admin.Commands
{
    public class UpdateUserRoleCommand : IRequest<bool>
    {
        public string UserId { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, bool>
    {
        private readonly IUserRepository _userRepository;

        public UpdateUserRoleCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<bool> Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken)
        {
            return await _userRepository.UpdateUserRoleAsync(request.UserId, request.Role);
        }
    }
}

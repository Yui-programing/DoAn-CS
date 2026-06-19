using MediatR;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Admin.Queries
{
    public class GetUsersQuery : IRequest<IEnumerable<AdminUserDto>>
    {
    }

    public class AdminUserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, IEnumerable<AdminUserDto>>
    {
        private readonly IUserRepository _userRepository;

        public GetUsersQueryHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<AdminUserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
        {
            var users = await _userRepository.GetAllUsersAsync();

            return users.Select(user => new AdminUserDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                FullName = user.Profile?.FullName ?? string.Empty,
                AvatarUrl = user.Profile?.AvatarUrl,
                Bio = user.Profile?.Bio,
                CreatedAt = user.CreatedAt
            });
        }
    }
}



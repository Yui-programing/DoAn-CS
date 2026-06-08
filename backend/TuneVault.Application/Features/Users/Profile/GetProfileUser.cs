using MediatR;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Users.Profile
{
    // Yêu cầu lấy thông tin profile, truyền vào UserId kiểu string lấy từ Token
    public class GetProfileQuery : IRequest<UserProfileDto>
    {
        public string UserId { get; set; } = string.Empty;
    }

    public class UserProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, UserProfileDto>
    {
        private readonly IUserRepository _userRepository;
        
        public GetProfileQueryHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        
        public async Task<UserProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
        {
            // 1. Tìm user trong DB theo UserId (kiểu string)
            var user = await _userRepository.GetProfileByUserIdAsync(request.UserId);
            
            if (user == null)
            {
                throw new Exception("Không tìm thấy người dùng");
            }
            
            // 2. Trả về thông tin profile cho Frontend
            return new UserProfileDto
            {
                FullName = user.FullName,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl
            };
        }
    }
}
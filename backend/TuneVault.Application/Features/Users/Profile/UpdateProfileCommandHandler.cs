using MediatR;
using TuneVault.Application.Repositories;
namespace TuneVault.Application.Features.Users.Profile;
// ==========================================
// NƠI XỬ LÝ LƯU DB (HANDLER)
// ==========================================

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public UpdateProfileCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetProfileByUserIdAsync(request.UserId);
        if (user == null)
            throw new Exception("Không tìm thấy người dùng");

        // Cập nhật thông tin
        user.FullName = request.FullName;
        user.Bio = request.Bio;
        user.AvatarUrl = request.AvatarUrl;
        user.IsPublic = request.IsPublic;

        // Lưu vào DB
        await _userRepository.UpdateProfileAsync(user);

        return true;
    }
}
using MediatR;
namespace TuneVault.Application.Features.Users.Profile
{
    // Yêu cầu cập nhật, chứa các trường Frontend gửi lên
    public class UpdateProfileCommand : IRequest<bool> // Trả về true nếu thành công
    {
        public Guid UserId { get; init; }
        public string FullName { get; set; } = null!;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsPublic { get; set; } = true;
    }
   

}

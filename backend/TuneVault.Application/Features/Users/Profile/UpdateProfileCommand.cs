using MediatR;
namespace TuneVault.Application.Features.Users.Profile
{
    // Yêu cầu cập nhật, chứa các trường Frontend gửi lên
    public class UpdateProfileCommand : IRequest<bool> // Trả về true nếu thành công
    {
        public string UserId { get; init; } = string.Empty; // Lấy từ Token
        public string FullName {get; set;} = string.Empty; // Lấy từ Body
        public string? Bio { get; set; } // Lấy từ Body
        public string? AvatarUrl { get; set; } // Lấy từ Body
    }
   

}
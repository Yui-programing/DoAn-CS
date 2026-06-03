using FluentValidation;
namespace TuneVault.Application.Features.Users.Profile;
// ==========================================
// ĐÂY LÀ PHẦN LUẬT KIỂM TRA (VALIDATOR)
// ==========================================
public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.Bio)
            .MaximumLength(500).WithMessage("Tiểu sử (Bio) không được vượt quá 500 ký tự.");

        RuleFor(x => x.AvatarUrl)
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .When(x => !string.IsNullOrEmpty(x.AvatarUrl)) // Chỉ kiểm tra link nếu có nhập
            .WithMessage("Đường dẫn ảnh đại diện không hợp lệ.");
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ tên không được để trống.")
            .MaximumLength(100).WithMessage("Họ tên không được vượt quá 100 ký tự.");
    }
}
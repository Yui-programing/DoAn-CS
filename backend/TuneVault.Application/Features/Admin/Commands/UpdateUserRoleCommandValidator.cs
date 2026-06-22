using FluentValidation;

namespace TuneVault.Application.Features.Admin.Commands
{
    public class UpdateUserRoleCommandValidator : AbstractValidator<UpdateUserRoleCommand>
    {
        public UpdateUserRoleCommandValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("UserId không được để trống.");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Role không được để trống.")
                .Must(role => role == "Admin" || role == "User" || role == "Artist")
                .WithMessage("Role không hợp lệ. Chỉ chấp nhận Admin, User, Artist.");
        }
    }
}

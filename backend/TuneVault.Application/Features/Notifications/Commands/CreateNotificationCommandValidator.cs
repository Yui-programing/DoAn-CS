using FluentValidation;

namespace TuneVault.Application.Features.Notifications.Commands
{
    public class CreateNotificationCommandValidator : AbstractValidator<CreateNotificationCommand>
    {
        public CreateNotificationCommandValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("UserId không được để trống.");

            RuleFor(x => x.PayloadJson)
                .NotEmpty().WithMessage("Dữ liệu thông báo (PayloadJson) không được để trống.");
        }
    }
}

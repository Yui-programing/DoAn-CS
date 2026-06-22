using FluentValidation;

namespace TuneVault.Application.Features.Auth.Commands.SendRegistrationOtp
{
    public class SendRegistrationOtpCommandValidator : AbstractValidator<SendRegistrationOtpCommand>
    {
        public SendRegistrationOtpCommandValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được để trống.")
                .EmailAddress().WithMessage("Email không hợp lệ.");
        }
    }
}

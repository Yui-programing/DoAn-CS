using FluentValidation;

namespace TuneVault.Application.Features.Auth.Commands.SendForgotPasswordOtp
{
    public class SendForgotPasswordOtpCommandValidator : AbstractValidator<SendForgotPasswordOtpCommand>
    {
        public SendForgotPasswordOtpCommandValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được để trống.")
                .EmailAddress().WithMessage("Email không hợp lệ.");
        }
    }
}

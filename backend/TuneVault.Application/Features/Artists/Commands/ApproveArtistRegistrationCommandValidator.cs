using FluentValidation;

namespace TuneVault.Application.Features.Artists.Commands
{
    public class ApproveArtistRegistrationCommandValidator : AbstractValidator<ApproveArtistRegistrationCommand>
    {
        public ApproveArtistRegistrationCommandValidator()
        {
            RuleFor(x => x.RegistrationId)
                .NotEmpty().WithMessage("ID Đăng ký không được để trống.");
        }
    }
}

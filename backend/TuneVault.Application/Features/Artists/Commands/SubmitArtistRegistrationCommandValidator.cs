using FluentValidation;

namespace TuneVault.Application.Features.Artists.Commands
{
    public class SubmitArtistRegistrationCommandValidator : AbstractValidator<SubmitArtistRegistrationCommand>
    {
        public SubmitArtistRegistrationCommandValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("UserId không được để trống.");

            RuleFor(x => x.StageName)
                .NotEmpty().WithMessage("Tên nghệ danh không được để trống.");

            RuleFor(x => x.IdCardUrl)
                .NotEmpty().WithMessage("URL thẻ CCCD/CMND không được để trống.");
        }
    }
}

using FluentValidation;

namespace TuneVault.Application.Features.Artists.Commands
{
    public class UpdateArtistBannerCommandValidator : AbstractValidator<UpdateArtistBannerCommand>
    {
        public UpdateArtistBannerCommandValidator()
        {
            RuleFor(x => x.ArtistId)
                .NotEmpty().WithMessage("ArtistId không được để trống.");

            RuleFor(x => x.BannerUrl)
                .NotEmpty().WithMessage("URL của Banner không được để trống.");
        }
    }
}

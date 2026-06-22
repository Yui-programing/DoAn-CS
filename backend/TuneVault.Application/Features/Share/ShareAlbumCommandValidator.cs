using FluentValidation;

namespace TuneVault.Application.Features.Share
{
    public class ShareAlbumCommandValidator : AbstractValidator<ShareAlbumCommand>
    {
        public ShareAlbumCommandValidator()
        {
            RuleFor(v => v.SenderId)
                .NotEmpty().WithMessage("SenderId không được để trống.");

            RuleFor(v => v.ReceiverId)
                .NotEmpty().WithMessage("ReceiverId không được để trống.");

            RuleFor(v => v.AlbumId)
                .NotEmpty().WithMessage("AlbumId không được để trống.");
        }
    }
}

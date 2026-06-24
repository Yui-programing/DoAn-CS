using FluentValidation;

namespace TuneVault.Application.Features.Medias.Commands.UploadMedia;

public class UploadMediaCommandValidator : AbstractValidator<UploadMediaCommand>
{
    public UploadMediaCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tiêu đề không được để trống.")
            .MaximumLength(255).WithMessage("Tiêu đề không được vượt quá 255 ký tự.");

        RuleFor(x => x.MediaFileName)
            .NotEmpty().WithMessage("Tên file media không được để trống.");

        RuleFor(x => x.ArtistId)
            .NotEmpty().WithMessage("ID nghệ sĩ không được để trống.");
    }
}

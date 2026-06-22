using FluentValidation;

namespace TuneVault.Application.Features.Medias.Commands
{
    public class ApproveMediaCommandValidator : AbstractValidator<ApproveMediaCommand>
    {
        public ApproveMediaCommandValidator()
        {
            RuleFor(x => x.MediaId)
                .NotEmpty().WithMessage("MediaId không được để trống.");
        }
    }
}

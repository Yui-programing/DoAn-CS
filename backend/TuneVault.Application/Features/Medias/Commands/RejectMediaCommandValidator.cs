using FluentValidation;

namespace TuneVault.Application.Features.Medias.Commands
{
    public class RejectMediaCommandValidator : AbstractValidator<RejectMediaCommand>
    {
        public RejectMediaCommandValidator()
        {
            RuleFor(x => x.MediaId)
                .NotEmpty().WithMessage("MediaId không được để trống.");

            RuleFor(x => x.Reason)
                .NotEmpty().WithMessage("Lý do từ chối không được để trống.");
        }
    }
}

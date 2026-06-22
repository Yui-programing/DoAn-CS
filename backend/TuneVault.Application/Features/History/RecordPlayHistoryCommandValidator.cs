using FluentValidation;

namespace TuneVault.Application.Features.History
{
    public class RecordPlayHistoryCommandValidator : AbstractValidator<RecordPlayHistoryCommand>
    {
        public RecordPlayHistoryCommandValidator()
        {
            RuleFor(x => x.MediaItemId)
                .NotEmpty().WithMessage("MediaItemId không được để trống.");
        }
    }
}

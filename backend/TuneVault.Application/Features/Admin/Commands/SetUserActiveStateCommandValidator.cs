using FluentValidation;

namespace TuneVault.Application.Features.Admin.Commands
{
    public class SetUserActiveStateCommandValidator : AbstractValidator<SetUserActiveStateCommand>
    {
        public SetUserActiveStateCommandValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("UserId không được để trống.");
        }
    }
}

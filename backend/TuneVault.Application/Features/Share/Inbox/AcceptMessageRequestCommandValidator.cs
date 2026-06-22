using FluentValidation;

namespace TuneVault.Application.Features.Share.Inbox
{
    public class AcceptMessageRequestCommandValidator : AbstractValidator<AcceptMessageRequestCommand>
    {
        public AcceptMessageRequestCommandValidator()
        {
            RuleFor(x => x.ReceiverId).NotEmpty();
            RuleFor(x => x.SenderId).NotEmpty();
        }
    }
}

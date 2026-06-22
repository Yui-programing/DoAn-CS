using FluentValidation;
using System;

namespace TuneVault.Application.Features.Notifications.Commands
{
    public class MarkAllAsReadCommandValidator : AbstractValidator<MarkAllAsReadCommand>
    {
        public MarkAllAsReadCommandValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("UserId không được để trống.");
        }
    }
}

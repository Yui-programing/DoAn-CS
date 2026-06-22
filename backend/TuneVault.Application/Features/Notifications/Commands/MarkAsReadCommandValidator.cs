using FluentValidation;
using System;

namespace TuneVault.Application.Features.Notifications.Commands
{
    public class MarkAsReadCommandValidator : AbstractValidator<MarkAsReadCommand>
    {
        public MarkAsReadCommandValidator()
        {
            RuleFor(x => x.NotificationId)
                .NotEmpty().WithMessage("NotificationId không được để trống.");
        }
    }
}

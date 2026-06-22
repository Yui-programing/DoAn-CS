using FluentValidation;
using System;
using TuneVault.Application.Features.SharedMedia.Commands.ShareMediaItem;

namespace TuneVault.Application.Features.Share
{
    public class SharedMediaItemCommandValidator : AbstractValidator<SharedMediaItemCommand>
    {
        public SharedMediaItemCommandValidator()
        {
            RuleFor(x => x.MediaItemId)
                .NotEmpty().WithMessage("ID Track không được để trống.");
        }
    }
}

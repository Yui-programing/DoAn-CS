using FluentValidation;
using System;

namespace TuneVault.Application.Features.Favorites.Commands.RemoveFavorite
{
    public class RemoveFavoriteCommandValidator : AbstractValidator<RemoveFavoriteCommand>
    {
        public RemoveFavoriteCommandValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("UserId không được để trống.");

            RuleFor(x => x.MediaItemId)
                .NotEmpty().WithMessage("MediaItemId không được để trống.");
        }
    }
}

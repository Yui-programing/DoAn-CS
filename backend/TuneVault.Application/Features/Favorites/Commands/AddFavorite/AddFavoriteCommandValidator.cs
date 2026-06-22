using FluentValidation;
using System;

namespace TuneVault.Application.Features.Favorites.Commands.AddFavorite
{
    public class AddFavoriteCommandValidator : AbstractValidator<AddFavoriteCommand>
    {
        public AddFavoriteCommandValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("UserId không được để trống.");

            RuleFor(x => x.MediaItemId)
                .NotEmpty().WithMessage("MediaItemId không được để trống.");
        }
    }
}

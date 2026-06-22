using FluentValidation;
using System;

namespace TuneVault.Application.Features.Share
{
    public class SharePlaylistCommandValidator : AbstractValidator<SharePlaylistCommand>
    {
        public SharePlaylistCommandValidator()
        {
            RuleFor(x => x.PlaylistId)
                .NotEmpty().WithMessage("ID Playlist không được để trống.");
        }
    }
}

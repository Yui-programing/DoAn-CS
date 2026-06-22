using FluentValidation;
using System;

namespace TuneVault.Application.Features.Playlists.Commands.RemovePlaylistTrack
{
    public class RemovePlaylistTrackCommandValidator : AbstractValidator<RemovePlaylistTrackCommand>
    {
        public RemovePlaylistTrackCommandValidator()
        {
            RuleFor(x => x.PlaylistId)
                .NotEmpty().WithMessage("ID Playlist không được để trống.");

            RuleFor(x => x.MediaItemId)
                .NotEmpty().WithMessage("ID Track không được để trống.");
        }
    }
}

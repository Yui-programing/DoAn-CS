using FluentValidation;
using System;

namespace TuneVault.Application.Features.Playlists.Commands.AddPlaylistTrack
{
    public class AddPlaylistTrackCommandValidator : AbstractValidator<AddPlaylistTrackCommand>
    {
        public AddPlaylistTrackCommandValidator()
        {
            RuleFor(x => x.PlaylistId)
                .NotEmpty().WithMessage("ID Playlist không được để trống.");

            RuleFor(x => x.MediaItemId)
                .NotEmpty().WithMessage("ID Track không được để trống.");
        }
    }
}

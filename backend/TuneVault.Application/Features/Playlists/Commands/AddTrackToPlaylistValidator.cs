using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;

namespace TuneVault.Application.Features.Playlists.Commands
{
    public class AddTrackToPlaylistValidator : AbstractValidator<AddTrackToPlaylistCommand>
    {
        public AddTrackToPlaylistValidator() 
        {
            RuleFor(x => x.PlaylistId)
                .NotEmpty().WithMessage("PlaylistId không được để trống.")
                .Must(id => id != Guid.Empty).WithMessage("PlaylistId không hợp lệ.");

            RuleFor(x => x.MediaItemId)
                .NotEmpty().WithMessage("MediaItemId không được để trống.")
                .Must(id => id != Guid.Empty).WithMessage("MediaItemId không hợp lệ.");
        }
    }
}

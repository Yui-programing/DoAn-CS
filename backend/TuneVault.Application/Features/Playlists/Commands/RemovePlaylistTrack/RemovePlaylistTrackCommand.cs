using MediatR;
using System;
using System.Collections.Generic;
using System.Text;


namespace TuneVault.Application.Features.Playlists.Commands.RemovePlaylistTrack
{
    public class RemovePlaylistTrackCommand: IRequest<Guid>
    {
        public Guid PlaylistId {  get; set; }
        public Guid MediaItemId { get; set; }

        public string UserId { get; set; } = null!;
    }
}

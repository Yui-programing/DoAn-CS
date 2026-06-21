using MediatR;
using System;
using System.Collections.Generic;
using System.Text;



namespace TuneVault.Application.Features.Playlists.Commands.AddPlaylistTrack
{
    public class AddPlaylistTrackCommand: IRequest<Guid>
    {
        public Guid PlaylistId { get; set; }
        public Guid MediaItemId { get; set; }
        public Guid UserId { get; set; }
        public DateTime AddedAt { get; set; }
    }
}



using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;


namespace TuneVault.Application.Features.Playlists.Commands.AddPlaylistTrack
{
    public class AddPlaylistTrackCommand: IRequest<Guid>
    {
        [JsonIgnore]
        public Guid PlaylistId { get; set; }
        public Guid MediaItemId { get; set; }
        public string UserId { get; set; } = null!;
        public DateTime AddedAt { get; set; }
    }
}

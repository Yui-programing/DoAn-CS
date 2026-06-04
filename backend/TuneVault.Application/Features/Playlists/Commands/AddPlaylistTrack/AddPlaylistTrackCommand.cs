using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Common;

namespace TuneVault.Application.Features.Playlists.Commands.AddPlaylistTrack
{
    public class AddPlaylistTrackCommand: IRequest<ApiResponseDto<Guid>>
    {
        public Guid PlaylistId { get; set; }
        public Guid MediaItemId { get; set; }
        public string UserId { get; set; } = null!;
        public DateTime AddedAt { get; set; }
    }
}

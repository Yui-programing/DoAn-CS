using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Playlists.Commands.ViewPlaylistTrack
{
    // Query yêu cầu lấy danh sách bài hát
    public class GetPlaylistTracksQuery : IRequest<IEnumerable<PlaylistTrackDto>>
    {
        public Guid PlaylistId { get; set; }
    }
}

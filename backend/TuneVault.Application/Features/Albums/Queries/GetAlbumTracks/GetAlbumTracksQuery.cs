using MediatR;
using System;
using System.Collections.Generic;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Albums.Queries.GetAlbumTracks
{
    public class GetAlbumTracksQuery : IRequest<IEnumerable<PlaylistTrackDto>>
    {
        public Guid AlbumId { get; set; }
    }
}

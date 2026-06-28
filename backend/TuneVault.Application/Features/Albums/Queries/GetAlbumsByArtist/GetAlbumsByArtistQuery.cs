using MediatR;
using System;
using System.Collections.Generic;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Albums.Queries.GetAlbumsByArtist
{
    public class GetAlbumsByArtistQuery : IRequest<IEnumerable<AlbumDto>>
    {
        public Guid ArtistId { get; set; }
    }
}

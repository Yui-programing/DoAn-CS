using MediatR;
using System;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Albums.Queries.GetAlbumById
{
    public class GetAlbumByIdQuery : IRequest<AlbumDto?>
    {
        public Guid AlbumId { get; set; }
    }
}

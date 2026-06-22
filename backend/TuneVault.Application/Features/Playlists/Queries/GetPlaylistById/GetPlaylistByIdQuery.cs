using MediatR;
using System;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Playlists.Queries.GetPlaylistById
{
    public class GetPlaylistByIdQuery : IRequest<MyPlaylistDto?>
    {
        public Guid PlaylistId { get; set; }
        public Guid UserId { get; set; }
    }
}

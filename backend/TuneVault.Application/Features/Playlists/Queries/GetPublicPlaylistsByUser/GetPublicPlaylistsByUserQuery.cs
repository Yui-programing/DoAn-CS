using MediatR;
using System;
using System.Collections.Generic;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Playlists.Queries.GetPublicPlaylistsByUser
{
    
    public class GetPublicPlaylistsByUserQuery : IRequest<IEnumerable<MyPlaylistDto>>
    {
        public Guid UserId { get; set; }
    }
}

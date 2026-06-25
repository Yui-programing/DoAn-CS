using MediatR;
using System;
using System.Collections.Generic;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Playlists.Queries.GetPublicPlaylistsByUser
{
    /// <summary>
    /// Query lấy danh sách playlist công khai của một user bất kỳ theo userId
    /// </summary>
    public class GetPublicPlaylistsByUserQuery : IRequest<IEnumerable<MyPlaylistDto>>
    {
        public Guid UserId { get; set; }
    }
}

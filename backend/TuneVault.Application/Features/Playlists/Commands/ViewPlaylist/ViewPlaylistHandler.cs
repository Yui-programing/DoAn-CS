using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Features.Playlists.Commands.ViewPlaylist;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Playlists.Queries.GetMyPlaylists;

public class GetMyPlaylistsQueryHandler : IRequestHandler<ViewPlaylistQuery, IEnumerable<MyPlaylistDto>>
{
    private readonly IPlaylistRepository _playlistRepository;

    public GetMyPlaylistsQueryHandler(IPlaylistRepository playlistRepository)
    {
        _playlistRepository = playlistRepository;
    }

    public async Task<IEnumerable<MyPlaylistDto>> Handle(ViewPlaylistQuery request, CancellationToken cancellationToken)
    {
        // Nhận DTO trực tiếp từ DB thông qua Dapper
        return await _playlistRepository.GetByOwnerIdAsync(request.OwnerId);
    }
}
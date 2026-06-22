using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Playlists.Commands.ViewPlaylistTrack
{
    public class GetPlaylistTracksQueryHandler : IRequestHandler<GetPlaylistTracksQuery, IEnumerable<PlaylistTrackDto>>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public GetPlaylistTracksQueryHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        public async Task<IEnumerable<PlaylistTrackDto>> Handle(GetPlaylistTracksQuery request, CancellationToken cancellationToken)
        {
            var hasAccess = await _playlistRepository.HasAccessAsync(request.PlaylistId, request.UserId);
            if (!hasAccess)
                return new List<PlaylistTrackDto>(); // Hoặc throw UnauthorizedAccessException
                
            return await _playlistRepository.GetTracksByPlaylistIdAsync(request.PlaylistId);
        }
    }
}

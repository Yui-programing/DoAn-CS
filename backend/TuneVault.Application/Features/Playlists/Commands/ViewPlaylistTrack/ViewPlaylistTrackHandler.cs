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
            return await _playlistRepository.GetTracksByPlaylistIdAsync(request.PlaylistId);
        }
    }
}

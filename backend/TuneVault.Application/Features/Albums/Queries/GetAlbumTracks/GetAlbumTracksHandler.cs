using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Albums.Queries.GetAlbumTracks
{
    public class GetAlbumTracksHandler : IRequestHandler<GetAlbumTracksQuery, IEnumerable<PlaylistTrackDto>>
    {
        private readonly IAlbumRepository _albumRepository;

        public GetAlbumTracksHandler(IAlbumRepository albumRepository)
        {
            _albumRepository = albumRepository;
        }

        public async Task<IEnumerable<PlaylistTrackDto>> Handle(GetAlbumTracksQuery request, CancellationToken cancellationToken)
        {
            return await _albumRepository.GetTracksByAlbumIdAsync(request.AlbumId);
        }
    }
}

using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Albums.Queries.GetAlbumsByArtist
{
    public class GetAlbumsByArtistHandler : IRequestHandler<GetAlbumsByArtistQuery, IEnumerable<AlbumDto>>
    {
        private readonly IAlbumRepository _albumRepository;

        public GetAlbumsByArtistHandler(IAlbumRepository albumRepository)
        {
            _albumRepository = albumRepository;
        }

        public async Task<IEnumerable<AlbumDto>> Handle(GetAlbumsByArtistQuery request, CancellationToken cancellationToken)
        {
            return await _albumRepository.GetAlbumsByArtistIdAsync(request.ArtistId);
        }
    }
}

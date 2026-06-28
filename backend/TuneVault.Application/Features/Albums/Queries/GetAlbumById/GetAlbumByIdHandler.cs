using MediatR;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Albums.Queries.GetAlbumById
{
    public class GetAlbumByIdHandler : IRequestHandler<GetAlbumByIdQuery, AlbumDto?>
    {
        private readonly IAlbumRepository _albumRepository;

        public GetAlbumByIdHandler(IAlbumRepository albumRepository)
        {
            _albumRepository = albumRepository;
        }

        public async Task<AlbumDto?> Handle(GetAlbumByIdQuery request, CancellationToken cancellationToken)
        {
            return await _albumRepository.GetAlbumByIdAsync(request.AlbumId);
        }
    }
}

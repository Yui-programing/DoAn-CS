using MediatR;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Playlists.Queries.GetPlaylistById
{
    public class GetPlaylistByIdHandler : IRequestHandler<GetPlaylistByIdQuery, MyPlaylistDto?>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public GetPlaylistByIdHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        public async Task<MyPlaylistDto?> Handle(GetPlaylistByIdQuery request, CancellationToken cancellationToken)
        {
            var hasAccess = await _playlistRepository.HasAccessAsync(request.PlaylistId, request.UserId);
            if (!hasAccess)
                return null; 

            return await _playlistRepository.GetByIdAsync(request.PlaylistId);
        }
    }
}

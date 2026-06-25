using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Playlists.Queries.GetPublicPlaylistsByUser
{
    /// <summary>
    /// Handler xử lý query lấy danh sách playlist công khai của một user
    /// </summary>
    public class GetPublicPlaylistsByUserHandler : IRequestHandler<GetPublicPlaylistsByUserQuery, IEnumerable<MyPlaylistDto>>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public GetPublicPlaylistsByUserHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        public async Task<IEnumerable<MyPlaylistDto>> Handle(GetPublicPlaylistsByUserQuery request, CancellationToken cancellationToken)
        {
            // Chỉ trả về các playlist đã đặt công khai (IsPublic = true)
            return await _playlistRepository.GetPublicByUserIdAsync(request.UserId);
        }
    }
}

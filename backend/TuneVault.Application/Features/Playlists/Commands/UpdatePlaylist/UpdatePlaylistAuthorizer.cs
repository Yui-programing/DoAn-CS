using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Common.Interfaces;
using TuneVault.Application.Common.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Playlists.Commands.UpdatePlaylist
{
    public class UpdatePlaylistAuthorizer : IAuthorizer<UpdatePlaylistCommand>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public UpdatePlaylistAuthorizer(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        public async Task<AuthorizationResult> AuthorizeAsync(UpdatePlaylistCommand request, CancellationToken cancellationToken)
        {
            var isOwner = await _playlistRepository.IsOwnerAsync(request.Id, request.OwnerId);
            if (!isOwner)
            {
                return AuthorizationResult.Fail("Bạn không có quyền cập nhật playlist này.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}

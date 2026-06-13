using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Common.Interfaces;
using TuneVault.Application.Common.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Playlists.Commands.RemovePlaylistTrack
{
    public class RemovePlaylistTrackAuthorizer : IAuthorizer<RemovePlaylistTrackCommand>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public RemovePlaylistTrackAuthorizer(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        public async Task<AuthorizationResult> AuthorizeAsync(RemovePlaylistTrackCommand request, CancellationToken cancellationToken)
        {
            var isOwner = await _playlistRepository.IsOwnerAsync(request.PlaylistId, request.UserId);
            if (!isOwner)
            {
                return AuthorizationResult.Fail("Bạn không có quyền xóa track khỏi playlist này.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}

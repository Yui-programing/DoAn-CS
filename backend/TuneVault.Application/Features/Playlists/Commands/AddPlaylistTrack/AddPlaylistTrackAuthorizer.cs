using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Common.Interfaces;
using TuneVault.Application.Common.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Playlists.Commands.AddPlaylistTrack
{
    public class AddPlaylistTrackAuthorizer : IAuthorizer<AddPlaylistTrackCommand>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public AddPlaylistTrackAuthorizer(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        public async Task<AuthorizationResult> AuthorizeAsync(AddPlaylistTrackCommand request, CancellationToken cancellationToken)
        {
            var isOwner = await _playlistRepository.IsOwnerAsync(request.PlaylistId, request.UserId);
            if (!isOwner)
            {
                return AuthorizationResult.Fail("Không có quyền để thêm track vào playlist.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}

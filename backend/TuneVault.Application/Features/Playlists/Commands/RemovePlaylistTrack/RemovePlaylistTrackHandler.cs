using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

using TuneVault.Application.Features.Playlists.Interfaces;

namespace TuneVault.Application.Features.Playlists.Commands.RemovePlaylistTrack
{
    public class RemovePlaylistTrackHandler : IRequestHandler<RemovePlaylistTrackCommand, Guid>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public RemovePlaylistTrackHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }
        public async Task<Guid> Handle(RemovePlaylistTrackCommand request, CancellationToken cancellationToken)
        {
            // 1. Authorization Check: Verify if the current user is the owner of the track
            var isOwner = await _playlistRepository.IsOwnerAsync(request.PlaylistId, request.UserId);
            if (!isOwner)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xóa track khỏi playlist này.");
                
            }

            var isMediaItemAdded = await _playlistRepository.IsMediaItemInPlaylistAsync(request.PlaylistId, request.MediaItemId);
            if (!isMediaItemAdded)
            {
                throw new InvalidOperationException("Track này không tồn tại trong playlist.");
            }

            // 3. Pass the entity down to the Infrastructure repository to run the raw SQL delete
            await _playlistRepository.RemoveTrackAsync(request.PlaylistId, request.MediaItemId);
            // 4. Return the exact wrapper response format you designed
            return request.PlaylistId;
        }
    }
}

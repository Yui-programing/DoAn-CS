using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Repositories;

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
            var isPlaylistDeleted = await _playlistRepository.IsPlaylistDeletedAsync(request.PlaylistId);
            if (isPlaylistDeleted)
            {
                throw new InvalidOperationException("Playlist này đã bị xóa, không thể xóa track.");
            }

            var isPlaylistEmpty = await _playlistRepository.IsPlaylistEmptyAsync(request.PlaylistId);
            if (isPlaylistEmpty)
            {
                throw new InvalidOperationException("Playlist này đã rỗng, không thể xóa track.");
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

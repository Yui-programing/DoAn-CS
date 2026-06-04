using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Common;
using TuneVault.Application.Features.Playlists.Interfaces;

namespace TuneVault.Application.Features.Playlists.Commands.RemovePlaylistTrack
{
    public class RemovePlaylistTrackHandler : IRequestHandler<RemovePlaylistTrackCommand, ApiResponseDto<Guid>>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public RemovePlaylistTrackHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }
        public async Task<ApiResponseDto<Guid>> Handle(RemovePlaylistTrackCommand request, CancellationToken cancellationToken)
        {
            // 1. Authorization Check: Verify if the current user is the owner of the track
            var isOwner = await _playlistRepository.IsOwnerAsync(request.PlaylistId, request.UserId);
            if (!isOwner)
            {
                return ApiResponseDto<Guid>.Fail(
                    new List<string> { "Không có quyền để xóa track khỏi playlist" },
                    "Xóa track khỏi playlist bị lỗi"
                );
            }

            var isMediaItemAdded = await _playlistRepository.IsMediaItemInPlaylistAsync(request.PlaylistId, request.MediaItemId);
            if (!isMediaItemAdded)
            {
                return ApiResponseDto<Guid>.Fail(
                    new List<string> { "Track không tồn tại trong playlist" },
                    "Xóa track khỏi playlist bị lỗi"
                );
            }

            // 3. Pass the entity down to the Infrastructure repository to run the raw SQL delete
            await _playlistRepository.RemoveTrackAsync(request.PlaylistId, request.MediaItemId);
            // 4. Return the exact wrapper response format you designed
            return ApiResponseDto<Guid>.Ok(request.PlaylistId, "Xóa track khỏi Playlist thành công!");
        }
    }
}

using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Features.Playlists.Interfaces;
using TuneVault.Application.Common;

namespace TuneVault.Application.Features.Playlists.Commands.RestorePlaylist
{
    public class RestorePlaylistHandler
    {
        private readonly IPlaylistRepository _playlistRepository;
        public RestorePlaylistHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }
        public async Task<ApiResponseDto<Guid>> Handle(RestorePlaylistCommand request, CancellationToken cancellationToken)
        {
            // 1. Authorization Check: Verify if the current user is the owner of the playlist
            var isOwner = await _playlistRepository.IsOwnerAsync(request.Id, request.OwnerId);
            if (!isOwner)
            {
                return ApiResponseDto<Guid>.Fail(
                    new List<string> { "Không có quyền để khôi phục playlist" },
                    "Restore playlist bị lỗi"
                );
            }
            // 2. Pass the entity down to the Infrastructure repository to run the raw SQL update
            await _playlistRepository.RestoreAsync(request.Id);
            // 3. Return the exact wrapper response format you designed
            return ApiResponseDto<Guid>.Ok(request.Id, "Khôi phục Playlist thành công!");
        }
    }
}

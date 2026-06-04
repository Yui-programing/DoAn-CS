using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Features.Playlists.Interfaces;
using TuneVault.Application.Common;
using MediatR;


namespace TuneVault.Application.Features.Playlists.Commands.DeletePlaylist
{
    public class DeletePlaylistHandler: IRequestHandler<DeletePlaylistCommand, ApiResponseDto<Guid>>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public DeletePlaylistHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        public async Task<ApiResponseDto<Guid>> Handle(DeletePlaylistCommand request, CancellationToken cancellationToken)
        {
            // 1. Authorization Check: Verify if the current user is the owner of the playlist
            var isOwner = await _playlistRepository.IsOwnerAsync(request.Id, request.OwnerId);
            if (!isOwner)
            {
                return ApiResponseDto<Guid>.Fail(
                    new List<string> { "Không có quyền để xóa playlist" },
                    "Delete playlist bị lỗi"
                );
            }
            // 2. Pass the playlist Id down to the Infrastructure repository to run the raw SQL delete (soft delete)
            await _playlistRepository.DeleteAsync(request.Id);
            // 3. Return the exact wrapper response format you designed
            return ApiResponseDto<Guid>.Ok(request.Id, "Xóa Playlist thành công!");
        }

    }
}

using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Common;
using TuneVault.Application.Features.Playlists.Interfaces;
using TuneVault.Domain.Entities;



namespace TuneVault.Application.Features.Playlists.Commands.AddPlaylistTrack
{
    public class AddPlaylistTrackHandler: IRequestHandler<AddPlaylistTrackCommand, ApiResponseDto<Guid>>
    {
        private readonly IPlaylistRepository _playlistRepository;
        public AddPlaylistTrackHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }
        public async Task<ApiResponseDto<Guid>> Handle(AddPlaylistTrackCommand request, CancellationToken cancellationToken)
        {
            // 1. Authorization Check: Verify if the current user is the owner of the track
            var isOwner = await _playlistRepository.IsOwnerAsync(request.PlaylistId, request.UserId);
            if (!isOwner)
            {
                return ApiResponseDto<Guid>.Fail(
                    new List<string> { "Không có quyền để thêm track vào playlist" },
                    "Thêm track vào playlist bị lỗi"
                );
            }

            var isMediaItemAdded = await _playlistRepository.IsMediaItemInPlaylistAsync(request.PlaylistId, request.MediaItemId);
            if(!isMediaItemAdded)
            {
                return ApiResponseDto<Guid>.Fail(
                    new List<string> { "Track đã tồn tại trong playlist" },
                    "Thêm track vào playlist bị lỗi"
                );
            }
            
            // 3. Pass the entity down to the Infrastructure repository to run the raw SQL insert
            await _playlistRepository.AddTrackAsync(request.PlaylistId,request.MediaItemId);
            // 4. Return the exact wrapper response format you designed
            return ApiResponseDto<Guid>.Ok(request.PlaylistId, "Thêm track vào Playlist thành công!");
        }

    }
}

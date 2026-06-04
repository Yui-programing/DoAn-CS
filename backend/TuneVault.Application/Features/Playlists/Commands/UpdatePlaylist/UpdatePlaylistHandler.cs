using FluentValidation.Validators;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Features.Playlists.Interfaces;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Domain.Entities;



namespace TuneVault.Application.Features.Playlists.Commands.UpdatePlaylist
{
    public class UpdatePlaylistHandler: IRequestHandler<UpdatePlaylistCommand, ApiResponseDto<Guid>>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public UpdatePlaylistHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        public async Task<ApiResponseDto<Guid>> Handle(UpdatePlaylistCommand request, CancellationToken cancellationToken)
        {
            // 1. Authorization Check: Verify if the current user is the owner of the playlist
            var isOwner = await _playlistRepository.IsOwnerAsync(request.Id, request.OwnerId);
            if (!isOwner)
            {
                // ✅ ĐÃ SỬA: Bọc chuỗi lỗi vào List<string> để khớp với định nghĩa của hàm Fail
                return ApiResponseDto<Guid>.Fail(
                    new List<string> { "Không có quyền để chỉnh sửa playlist" },
                    "Update playlist bị lỗi"
                );
            }
            // 2. Map command request data to your Domain Entity
            var playlist = new Playlist
            {
                Id = request.Id,
                Title = request.title,
                Description = request.description,
                IsPublic = request.isPublic,
                OwnerId = request.OwnerId,
            };
            // 3. Pass the entity down to the Infrastructure repository to run the raw SQL update
            await _playlistRepository.UpdateAsync(playlist);
            // 4. Return the exact wrapper response format you designed
            return ApiResponseDto<Guid>.Ok(request.Id, "Cập nhật Playlist thành công!");
        }
    }
}

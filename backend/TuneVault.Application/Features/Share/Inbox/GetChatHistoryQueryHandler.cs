using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Share.Inbox
{
    public class GetChatHistoryQueryHandler : IRequestHandler<GetChatHistoryQuery, IEnumerable<ChatHistoryItemDto>>
    {
        private readonly ISharedRepository _sharedRepository;
        private readonly IMediaItemRepository _mediaItemRepository;
        private readonly IPlaylistRepository _playlistRepository;
        private readonly IAlbumRepository _albumRepository;

        public GetChatHistoryQueryHandler(
            ISharedRepository sharedRepository,
            IMediaItemRepository mediaItemRepository,
            IPlaylistRepository playlistRepository,
            IAlbumRepository albumRepository)
        {
            _sharedRepository = sharedRepository;
            _mediaItemRepository = mediaItemRepository;
            _playlistRepository = playlistRepository;
            _albumRepository = albumRepository;
        }

        public async Task<IEnumerable<ChatHistoryItemDto>> Handle(GetChatHistoryQuery request, CancellationToken cancellationToken)
        {
            var shares = await _sharedRepository.GetChatHistoryAsync(request.CurrentUserId, request.OtherUserId);
            var result = new List<ChatHistoryItemDto>();

            if (shares == null)
                return result;

            foreach (var share in shares)
            {
                var dto = new ChatHistoryItemDto
                {
                    Id = share.Id,
                    SenderId = share.SenderId,
                    ReceiverId = share.ReceiverId,
                    Message = share.Message,
                    SharedAt = share.SharedAt,
                    MediaItemId = share.MediaItemId,
                    PlaylistId = share.PlaylistId,
                    AlbumId = share.AlbumId
                };

                if (share.MediaItemId.HasValue)
                {
                    var media = await _mediaItemRepository.GetByIdAsync(share.MediaItemId.Value);
                    if (media != null)
                    {
                        dto.AttachedMediaTitle = media.Title;
                        dto.AttachedMediaCoverUrl = media.CoverUrl;
                    }
                }
                else if (share.PlaylistId.HasValue)
                {
                    var playlist = await _playlistRepository.GetByIdAsync(share.PlaylistId.Value);
                    if (playlist != null)
                    {
                        dto.AttachedMediaTitle = playlist.Title;
                        
                    }
                }
                else if (share.AlbumId.HasValue)
                {
                    var album = await _albumRepository.GetAlbumByIdAsync(share.AlbumId.Value);
                    if (album != null)
                    {
                        dto.AttachedMediaTitle = album.Title;
                        dto.AttachedMediaCoverUrl = album.CoverImageUrl;
                    }
                }

                result.Add(dto);
            }

            return result;
        }
    }
}
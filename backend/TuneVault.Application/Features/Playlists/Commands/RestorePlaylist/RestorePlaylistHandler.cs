using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using TuneVault.Application.Repositories;


namespace TuneVault.Application.Features.Playlists.Commands.RestorePlaylist
{
    public class RestorePlaylistHandler: IRequestHandler<RestorePlaylistCommand, Guid>
    {
        private readonly IPlaylistRepository _playlistRepository;
        public RestorePlaylistHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }
        public async Task<Guid> Handle(RestorePlaylistCommand request, CancellationToken cancellationToken)
        {
            // 1. Authorization Check: Verify if the current user is the owner of the playlist
            var isOwner = await _playlistRepository.IsOwnerAsync(request.Id, request.OwnerId);
            if (!isOwner)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền khôi phục playlist này.");
            }
            // 2. Pass the entity down to the Infrastructure repository to run the raw SQL update
            await _playlistRepository.RestoreAsync(request.Id);
            // 3. Return the exact wrapper response format you designed
            return request.Id;
        }
    }
}

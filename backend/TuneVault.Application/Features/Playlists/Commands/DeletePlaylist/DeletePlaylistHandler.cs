using System;
using System.Collections.Generic;
using System.Text;

using MediatR;
using TuneVault.Application.Repositories;


namespace TuneVault.Application.Features.Playlists.Commands.DeletePlaylist
{
    public class DeletePlaylistHandler: IRequestHandler<DeletePlaylistCommand, Guid>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public DeletePlaylistHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        public async Task<Guid> Handle(DeletePlaylistCommand request, CancellationToken cancellationToken)
        {
            // 1. Pass the playlist Id down to the Infrastructure repository to run the raw SQL delete (soft delete)
            await _playlistRepository.DeleteAsync(request.Id);
            // 3. Return the exact wrapper response format you designed
            return request.Id;
        }

    }
}

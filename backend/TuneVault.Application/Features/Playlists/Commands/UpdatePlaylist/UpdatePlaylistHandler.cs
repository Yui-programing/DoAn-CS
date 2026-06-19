using FluentValidation.Validators;
using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using TuneVault.Domain.Entities;
using TuneVault.Application.Repositories;



namespace TuneVault.Application.Features.Playlists.Commands.UpdatePlaylist
{
    public class UpdatePlaylistHandler: IRequestHandler<UpdatePlaylistCommand, Guid>
    {
        private readonly IPlaylistRepository _playlistRepository;

        public UpdatePlaylistHandler(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        public async Task<Guid> Handle(UpdatePlaylistCommand request, CancellationToken cancellationToken)
        {
            // 1. Map command request data to your Domain Entity
            var playlist = new Playlist
            {
                Id = request.Id,
                Title = request.Title,
                Description = request.Description,
                IsPublic = request.IsPublic,
                OwnerId = request.OwnerId,
            };
            // 3. Pass the entity down to the Infrastructure repository to run the raw SQL update
            await _playlistRepository.UpdateAsync(playlist);
            // 4. Return the exact wrapper response format you designed
            return request.Id;
        }
    }
}

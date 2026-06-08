using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;

using TuneVault.Application.Features.Playlists.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Playlists.Commands.CreatePlaylist;

public class CreatePlaylistCommandHandler : IRequestHandler<CreatePlaylistCommand, Guid>
{
    private readonly IPlaylistRepository _playlistRepository;

    // We inject the interface, NOT the direct Dapper/DB connection
    public CreatePlaylistCommandHandler(IPlaylistRepository playlistRepository)
    {
        _playlistRepository = playlistRepository;
    }

    public async Task<Guid> Handle(CreatePlaylistCommand request, CancellationToken cancellationToken)
    {
        // 1. Map command request data to your Domain Entity
        var playlist = new Playlist
        {
            Id = Guid.NewGuid(), // Generate the target Guid
            Title = request.Title,
            Description = request.Description,
            IsPublic = request.IsPublic,
            OwnerId = request.OwnerId,
        };

        // 2. Pass the entity down to the Infrastructure repository to run the raw SQL insert
        var createdId = await _playlistRepository.CreateAsync(playlist);

        // 3. Return the exact response format you designed
        return request.Id;
    }
}
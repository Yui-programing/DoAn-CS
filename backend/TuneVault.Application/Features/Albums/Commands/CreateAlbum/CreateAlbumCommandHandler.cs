using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Albums.Commands.CreateAlbum
{
    public class CreateAlbumCommandHandler : IRequestHandler<CreateAlbumCommand, Guid>
    {
        private readonly IAlbumRepository _albumRepository;

        public CreateAlbumCommandHandler(IAlbumRepository albumRepository)
        {
            _albumRepository = albumRepository;
        }

        public async Task<Guid> Handle(CreateAlbumCommand request, CancellationToken cancellationToken)
        {
            var album = new Album
            {
                Title = request.Title,
                CoverImageUrl = request.CoverImageUrl,
                ReleaseDate = request.ReleaseDate,
                ArtistId = request.ArtistId
            };

            var albumId = await _albumRepository.CreateAlbumAsync(album);

            if (request.TrackIds != null && request.TrackIds.Count > 0)
            {
                await _albumRepository.UpdateMediaItemsAlbumAsync(albumId, album.Title, request.TrackIds, request.ArtistId);
            }

            return albumId;
        }
    }
}

using MediatR;
using System;

namespace TuneVault.Application.Features.Artists.Commands
{
    public class UpdateArtistBannerCommand : IRequest<bool>
    {
        public Guid ArtistId { get; set; }
        public string BannerUrl { get; set; } = null!;
    }
}

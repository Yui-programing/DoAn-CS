using MediatR;
using System;

namespace TuneVault.Application.Features.Artists.Commands
{
    public class SubmitArtistRegistrationCommand : IRequest<Guid>
    {
        public string UserId { get; set; } = string.Empty;
        public string StageName { get; set; } = string.Empty;
        public string? Genres { get; set; }
        public string IdCardUrl { get; set; } = string.Empty; // URL already uploaded to Cloudinary by Controller
    }
}

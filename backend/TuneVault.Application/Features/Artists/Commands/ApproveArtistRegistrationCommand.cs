using MediatR;
using System;

namespace TuneVault.Application.Features.Artists.Commands
{
    public class ApproveArtistRegistrationCommand : IRequest<bool>
    {
        public Guid RegistrationId { get; set; }
        public string? NewRole { get; set; } = "Artist";
    }
}

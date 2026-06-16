using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Artists.Commands
{
    public class SubmitArtistRegistrationCommandHandler : IRequestHandler<SubmitArtistRegistrationCommand, Guid>
    {
        private readonly IArtistRegistrationRepository _repo;

        public SubmitArtistRegistrationCommandHandler(IArtistRegistrationRepository repo)
        {
            _repo = repo;
        }

        public async Task<Guid> Handle(SubmitArtistRegistrationCommand request, CancellationToken cancellationToken)
        {
            var registration = new ArtistRegistration
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                StageName = request.StageName,
                Genres = request.Genres,
                IdCardUrl = request.IdCardUrl,
                Status = "Pending",
                SubmittedAt = DateTime.UtcNow
            };

            await _repo.AddAsync(registration);
            return registration.Id;
        }
    }
}

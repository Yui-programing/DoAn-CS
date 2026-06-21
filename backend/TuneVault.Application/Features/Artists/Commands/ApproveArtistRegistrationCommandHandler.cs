using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Artists.Commands
{
    public class ApproveArtistRegistrationCommandHandler : IRequestHandler<ApproveArtistRegistrationCommand, bool>
    {
        private readonly IArtistRegistrationRepository _registrationRepo;
        private readonly TuneVault.Application.Repositories.IUserRepository _userRepo;
        private readonly TuneVault.Application.Repositories.IArtistRepository _artistRepo;

        public ApproveArtistRegistrationCommandHandler(IArtistRegistrationRepository registrationRepo, TuneVault.Application.Repositories.IUserRepository userRepo, TuneVault.Application.Repositories.IArtistRepository artistRepo)
        {
            _registrationRepo = registrationRepo;
            _userRepo = userRepo;
            _artistRepo = artistRepo;
        }

        public async Task<bool> Handle(ApproveArtistRegistrationCommand request, CancellationToken cancellationToken)
        {
            var reg = await _registrationRepo.GetByIdAsync(request.RegistrationId);
            if (reg == null) return false;

            var updated = await _registrationRepo.UpdateStatusAsync(request.RegistrationId, "Approved", DateTime.UtcNow);
            if (!updated) return false;

            // Promote user role to Artist
            await _userRepo.UpdateUserRoleAsync(reg.UserId, request.NewRole ?? "Artist");

            // Fetch user profile to copy AvatarUrl and Bio
            var userProfile = await _userRepo.GetProfileByUserIdAsync(reg.UserId);

            // Create Artist profile mapping 1-1 with User
            var artist = new TuneVault.Domain.Entities.Artist
            {
                Id = reg.UserId,
                Name = reg.StageName,
                Bio = userProfile?.Bio,
                AvatarUrl = userProfile?.AvatarUrl,
                Genres = reg.Genres,
                BannerUrl = null, // Can be uploaded later by the artist
                VerifiedAt = DateTime.UtcNow
            };

            await _artistRepo.AddArtistAsync(artist);

            return true;
        }
    }
}

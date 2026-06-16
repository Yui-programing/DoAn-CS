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

        public ApproveArtistRegistrationCommandHandler(IArtistRegistrationRepository registrationRepo, TuneVault.Application.Repositories.IUserRepository userRepo)
        {
            _registrationRepo = registrationRepo;
            _userRepo = userRepo;
        }

        public async Task<bool> Handle(ApproveArtistRegistrationCommand request, CancellationToken cancellationToken)
        {
            var reg = await _registrationRepo.GetByIdAsync(request.RegistrationId);
            if (reg == null) return false;

            var updated = await _registrationRepo.UpdateStatusAsync(request.RegistrationId, "Approved", DateTime.UtcNow);
            if (!updated) return false;

            // Promote user role to Artist
            await _userRepo.UpdateUserRoleAsync(reg.UserId, request.NewRole ?? "Artist");
            return true;
        }
    }
}

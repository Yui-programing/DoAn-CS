using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Medias.Commands
{
    public class RejectMediaCommandHandler : IRequestHandler<RejectMediaCommand, bool>
    {
        private readonly IMediaItemRepository _mediaRepo;

        public RejectMediaCommandHandler(IMediaItemRepository mediaRepo)
        {
            _mediaRepo = mediaRepo;
        }

        public async Task<bool> Handle(RejectMediaCommand request, CancellationToken cancellationToken)
        {
            // We set status to Rejected. Optionally, could store reason somewhere.
            return await _mediaRepo.UpdateMediaItemStatusAsync(request.MediaId, "Rejected");
        }
    }
}

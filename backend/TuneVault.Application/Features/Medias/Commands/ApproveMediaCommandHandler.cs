using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Medias.Commands
{
    public class ApproveMediaCommandHandler : IRequestHandler<ApproveMediaCommand, bool>
    {
        private readonly IMediaItemRepository _mediaRepo;

        public ApproveMediaCommandHandler(IMediaItemRepository mediaRepo)
        {
            _mediaRepo = mediaRepo;
        }

        public async Task<bool> Handle(ApproveMediaCommand request, CancellationToken cancellationToken)
        {
            return await _mediaRepo.UpdateMediaItemStatusAsync(request.MediaId, "Approved");
        }
    }
}

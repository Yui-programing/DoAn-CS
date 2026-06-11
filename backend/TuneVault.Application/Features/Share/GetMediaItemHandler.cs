using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Application.Models;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Share
{
    public class GetMediaItemHandler: IRequestHandler<GetMediaItemQuery, IEnumerable<SharedMediaItemDto>>
    {
        private readonly ISharedRepository _shareRepository;
        public GetMediaItemHandler(ISharedRepository shareRepository)
        {
            _shareRepository = shareRepository;
        }
        public async Task<IEnumerable<SharedMediaItemDto>> Handle(GetMediaItemQuery request, CancellationToken cancellationToken)
        {
            return await _shareRepository.GetSharedMediaItemsByReceiverIdAsync(request.OwnerId);
        }
}
}

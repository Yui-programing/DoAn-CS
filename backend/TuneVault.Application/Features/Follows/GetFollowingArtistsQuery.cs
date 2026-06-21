using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Follows
{
    public class GetFollowingArtistsQuery : IRequest<IEnumerable<UserProfile>>
    {
        public Guid UserId { get; set; }
    }

    public class GetFollowingArtistsQueryHandler : IRequestHandler<GetFollowingArtistsQuery, IEnumerable<UserProfile>>
    {
        private readonly IFollowRepository _followRepository;

        public GetFollowingArtistsQueryHandler(IFollowRepository followRepository)
        {
            _followRepository = followRepository;
        }

        public async Task<IEnumerable<UserProfile>> Handle(GetFollowingArtistsQuery request, CancellationToken cancellationToken)
        {
            return await _followRepository.GetFollowingArtistsAsync(request.UserId);
        }
    }
}

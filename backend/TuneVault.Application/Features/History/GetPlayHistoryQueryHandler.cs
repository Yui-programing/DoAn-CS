using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.History;

public class GetPlayHistoryQueryHandler : IRequestHandler<GetPlayHistoryQuery, IEnumerable<PlayHistoryResultDto>>
{
    private readonly IPlayHistoryRepository _playHistoryRepository;

    public GetPlayHistoryQueryHandler(IPlayHistoryRepository playHistoryRepository)
    {
        _playHistoryRepository = playHistoryRepository;
    }

    public async Task<IEnumerable<PlayHistoryResultDto>> Handle(GetPlayHistoryQuery request, CancellationToken cancellationToken)
    {
        return await _playHistoryRepository.GetPlayHistoryAsync(request.UserId, request.Limit);
    }
}

using MediatR;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Repositories;

namespace TuneVault.Application.Features.Share.Inbox
{
    public class AcceptMessageRequestHandler : IRequestHandler<AcceptMessageRequestCommand, bool>
    {
        private readonly ISharedRepository _sharedRepository;

        public AcceptMessageRequestHandler(ISharedRepository sharedRepository)
        {
            _sharedRepository = sharedRepository;
        }

        public async Task<bool> Handle(AcceptMessageRequestCommand request, CancellationToken cancellationToken)
        {
            return await _sharedRepository.AcceptMessageRequestAsync(request.ReceiverId, request.SenderId);
        }
    }
}

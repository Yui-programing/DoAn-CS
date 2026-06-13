using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Common.Interfaces;

namespace TuneVault.Application.Common.Behaviors
{
    public class AuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly IEnumerable<IAuthorizer<TRequest>> _authorizers;

        public AuthorizationBehavior(IEnumerable<IAuthorizer<TRequest>> authorizers)
        {
            _authorizers = authorizers;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            if (_authorizers.Any())
            {
                foreach (var authorizer in _authorizers)
                {
                    var result = await authorizer.AuthorizeAsync(request, cancellationToken);
                    if (!result.IsAuthorized)
                    {
                        throw new UnauthorizedAccessException(result.FailureMessage);
                    }
                }
            }

            return await next();
        }
    }
}

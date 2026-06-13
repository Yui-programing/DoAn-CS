using System.Threading;
using System.Threading.Tasks;
using TuneVault.Application.Common.Models;

namespace TuneVault.Application.Common.Interfaces
{
    public interface IAuthorizer<in TRequest>
    {
        Task<AuthorizationResult> AuthorizeAsync(TRequest request, CancellationToken cancellationToken);
    }
}

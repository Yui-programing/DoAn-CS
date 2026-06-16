using MediatR;
using System;

namespace TuneVault.Application.Features.Medias.Commands
{
    public class RejectMediaCommand : IRequest<bool>
    {
        public Guid MediaId { get; set; }
        public string? Reason { get; set; }
    }
}

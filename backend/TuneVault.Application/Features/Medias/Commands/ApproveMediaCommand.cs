using MediatR;
using System;

namespace TuneVault.Application.Features.Medias.Commands
{
    public class ApproveMediaCommand : IRequest<bool>
    {
        public Guid MediaId { get; set; }
    }
}

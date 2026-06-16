using MediatR;
using System;

namespace TuneVault.Application.Features.History;
public class RecordPlayHistoryCommand : IRequest<bool>
{
    public string? UserId { get; set; }
    public Guid MediaItemId { get; set; }
}

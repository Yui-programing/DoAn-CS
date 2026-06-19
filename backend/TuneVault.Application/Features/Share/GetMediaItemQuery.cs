using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Share
{
    public class GetMediaItemQuery: IRequest<IEnumerable<SharedMediaItemDto>>
    {
        public Guid OwnerId { get; set; }    
    }
}



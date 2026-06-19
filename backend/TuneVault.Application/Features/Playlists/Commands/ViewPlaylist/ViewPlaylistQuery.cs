using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using TuneVault.Domain.Entities;
using TuneVault.Application.Models;

namespace TuneVault.Application.Features.Playlists.Commands.ViewPlaylist
{
    public class ViewPlaylistQuery : IRequest<IEnumerable<MyPlaylistDto>>
    {
        public Guid OwnerId { get; set; }
    }
}



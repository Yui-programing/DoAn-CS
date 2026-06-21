using MediatR;
using System;
using System.Collections.Generic;
using System.Text;


namespace TuneVault.Application.Features.Playlists.Commands.DeletePlaylist
{
    public class DeletePlaylistCommand: IRequest<Guid>
    {
        public Guid Id {  get; set; }

        public Guid OwnerId { get; set; }
        
 
    }
}



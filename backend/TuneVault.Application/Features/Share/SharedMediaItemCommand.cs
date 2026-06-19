using MediatR;
using System;

namespace TuneVault.Application.Features.SharedMedia.Commands.ShareMediaItem
{
    public class SharedMediaItemCommand : IRequest<Guid>
    {
        // Nh?ng thông tin này Controller s? t? di?n ng?m, Client không c?n g?i
        public Guid SenderId { get; set; }
        public Guid MediaItemId { get; set; } 

        // Nh?ng thông tin này Client ph?i g?i lên trong Body
        public Guid ReceiverId { get; set; }
        public string? Message { get; set; }
    }
}


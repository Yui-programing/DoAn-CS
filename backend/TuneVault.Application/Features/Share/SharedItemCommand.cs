using MediatR;
using System;

namespace TuneVault.Application.Features.SharedMedia.Commands.ShareMediaItem
{
    public class ShareMediaItemCommand : IRequest<Guid>
    {
        // Những thông tin này Controller sẽ tự điền ngầm, Client không cần gửi
        public string SenderId { get; set; } = string.Empty;
        public Guid MediaItemId { get; set; }

        // Những thông tin này Client phải gửi lên trong Body
        public string ReceiverId { get; set; } = string.Empty;
        public string? Message { get; set; }
    }
}
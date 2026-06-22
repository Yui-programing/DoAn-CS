using System;
using System.Collections.Generic;

namespace TuneVault.Application.Models
{
    public class InboxContactDto
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? LastMessage { get; set; }
        public DateTime LastMessageAt { get; set; }
        public bool IsUnread { get; set; }
    }

    public class InboxResultDto
    {
        public IEnumerable<InboxContactDto> MainInbox { get; set; } = new List<InboxContactDto>();
        public IEnumerable<InboxContactDto> MessageRequests { get; set; } = new List<InboxContactDto>();
    }
}

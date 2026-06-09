using System;
using System.Collections.Generic;
using System.Text;

namespace TuneVault.Application.Repositories
{
    public interface ISharedMediaRepository
    {
        Task<Guid> ShareItemAsync(Guid id, string senderId, string receiverId, Guid mediaItemId, string? message);
    }
}

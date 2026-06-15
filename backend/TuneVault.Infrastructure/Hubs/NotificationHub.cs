using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TuneVault.Infrastructure.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        // Server can call Clients.User(userId).SendAsync("ReceiveNotification", payload)
        // or client can call hub methods if needed in future.
    }
}

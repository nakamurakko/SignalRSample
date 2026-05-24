using Microsoft.AspNetCore.SignalR;

namespace SignalRServer.Hubs;

public class ChatHub : Hub
{

    public async Task SendMessage(string userName, string message)
    {
        await this.Clients.All.SendAsync("receivedMessage", userName, message);
    }

}

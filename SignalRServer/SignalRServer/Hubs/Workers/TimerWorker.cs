using Microsoft.AspNetCore.SignalR;

namespace SignalRServer.Hubs.Workers;

public sealed class TimerWorker : BackgroundService
{

    private readonly IHubContext<TimerHub> _hubContext;

    public TimerWorker(IHubContext<TimerHub> hubContext)
    {
        this._hubContext = hubContext;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await this._hubContext.Clients.All.SendAsync("sendCurrentDateTime", DateTime.Now.ToString());
            await Task.Delay(10000);
        }
    }

}

using SignalRServer.Hubs;
using SignalRServer.Hubs.Workers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddCors(action =>
{
    action.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:4200", // Angular 用
                    "http://localhost:5173" // React 用
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    );
});

builder.Services.AddSignalR();
builder.Services.AddHostedService<TimerWorker>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

app.MapHub<TimerHub>("/timer");
app.MapHub<ChatHub>("/chat");

app.Run();

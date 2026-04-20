using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Client;
using QuizAppka.Models;

namespace QuizAppka.Tests.Hubs;

public class PresenterHubTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public PresenterHubTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    private HubConnection BuildConnection()
    {
        var server = _factory.Server;
        return new HubConnectionBuilder()
            .WithUrl("http://localhost/hubs/presenter", o =>
            {
                o.Transports = HttpTransportType.WebSockets;
                o.SkipNegotiation = true;
                o.WebSocketFactory = async (ctx, ct) =>
                {
                    var ws = server.CreateWebSocketClient();
                    var uri = new UriBuilder(ctx.Uri) { Scheme = "ws" }.Uri;
                    return await ws.ConnectAsync(uri, ct);
                };
            })
            .Build();
    }

    [Fact]
    public async Task UpdateState_BroadcastsToAllClients()
    {
        var connection1 = BuildConnection();
        var connection2 = BuildConnection();

        PresenterStateDto? received = null;
        connection2.On<PresenterStateDto>("StateUpdated", s => received = s);

        await connection1.StartAsync();
        await connection2.StartAsync();

        await connection1.InvokeAsync("UpdateState", new PresenterStateDto("category-list"));

        await Task.Delay(200);

        Assert.NotNull(received);
        Assert.Equal("category-list", received.Screen);

        await connection1.DisposeAsync();
        await connection2.DisposeAsync();
    }

    [Fact]
    public async Task OnConnectedAsync_SendsCurrentState_ToLateJoiner()
    {
        var sender = BuildConnection();
        await sender.StartAsync();
        await sender.InvokeAsync("UpdateState", new PresenterStateDto("question-list", "cat1"));

        var receiver = BuildConnection();
        PresenterStateDto? received = null;
        receiver.On<PresenterStateDto>("StateUpdated", s => received = s);
        await receiver.StartAsync();

        await Task.Delay(200);

        Assert.NotNull(received);
        Assert.Equal("question-list", received.Screen);
        Assert.Equal("cat1", received.CategoryId);

        await sender.DisposeAsync();
        await receiver.DisposeAsync();
    }

    [Fact]
    public async Task UpdateState_ThrowsHubException_ForInvalidScreen()
    {
        var connection = BuildConnection();
        await connection.StartAsync();

        await Assert.ThrowsAsync<HubException>(() =>
            connection.InvokeAsync("UpdateState", new PresenterStateDto("invalid-screen")));

        await connection.DisposeAsync();
    }
}

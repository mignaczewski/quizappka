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

    [Fact]
    public async Task UpdateState_WithMemeRevealState_BroadcastsToAllClients()
    {
        var connection1 = BuildConnection();
        var connection2 = BuildConnection();

        PresenterStateDto? received = null;
        connection2.On<PresenterStateDto>("StateUpdated", s => received = s);

        await connection1.StartAsync();
        await connection2.StartAsync();

        var state = new PresenterStateDto(
            "question-detail", "cat1", "q4", new RevealState(MemeImageRevealed: true));
        await connection1.InvokeAsync("UpdateState", state);

        await Task.Delay(200);

        Assert.NotNull(received);
        Assert.Equal("question-detail", received.Screen);
        Assert.NotNull(received.RevealState);
        Assert.True(received.RevealState.MemeImageRevealed);

        await connection1.DisposeAsync();
        await connection2.DisposeAsync();
    }

    [Fact]
    public async Task OnConnectedAsync_SendsMemeRevealState_ToLateJoiner()
    {
        var sender = BuildConnection();
        await sender.StartAsync();
        await sender.InvokeAsync("UpdateState", new PresenterStateDto(
            "question-detail", "cat1", "q4", new RevealState(MemeImageRevealed: true)));

        var receiver = BuildConnection();
        PresenterStateDto? received = null;
        receiver.On<PresenterStateDto>("StateUpdated", s => received = s);
        await receiver.StartAsync();

        await Task.Delay(200);

        Assert.NotNull(received);
        Assert.NotNull(received.RevealState);
        Assert.True(received.RevealState.MemeImageRevealed);

        await sender.DisposeAsync();
        await receiver.DisposeAsync();
    }

    [Fact]
    public async Task UpdateState_WithSingingPianosBoxesRevealed_BroadcastsToAllClients()
    {
        var connection1 = BuildConnection();
        var connection2 = BuildConnection();

        PresenterStateDto? received = null;
        connection2.On<PresenterStateDto>("StateUpdated", s => received = s);

        await connection1.StartAsync();
        await connection2.StartAsync();

        var revealState = new RevealState(SingingPianosBoxesRevealed:
        [
            new RevealedBox("box1", true),
            new RevealedBox("box2", false),
            new RevealedBox("box3", false),
            new RevealedBox("box4", false),
            new RevealedBox("box5", false),
        ]);
        await connection1.InvokeAsync("UpdateState",
            new PresenterStateDto("question-detail", "cat1", "q5", revealState));

        await Task.Delay(200);

        Assert.NotNull(received);
        Assert.NotNull(received.RevealState);
        Assert.NotNull(received.RevealState.SingingPianosBoxesRevealed);
        Assert.Equal(5, received.RevealState.SingingPianosBoxesRevealed.Length);
        Assert.Equal("box1", received.RevealState.SingingPianosBoxesRevealed[0].Id);
        Assert.True(received.RevealState.SingingPianosBoxesRevealed[0].Revealed);
        Assert.Equal("box2", received.RevealState.SingingPianosBoxesRevealed[1].Id);
        Assert.False(received.RevealState.SingingPianosBoxesRevealed[1].Revealed);

        await connection1.DisposeAsync();
        await connection2.DisposeAsync();
    }

    [Fact]
    public async Task OnConnectedAsync_SendsSingingPianosBoxRevealState_ToLateJoiner()
    {
        var sender = BuildConnection();
        await sender.StartAsync();
        var revealState = new RevealState(SingingPianosBoxesRevealed:
        [
            new RevealedBox("box1", true),
            new RevealedBox("box2", false),
            new RevealedBox("box3", true),
            new RevealedBox("box4", false),
            new RevealedBox("box5", false),
        ]);
        await sender.InvokeAsync("UpdateState",
            new PresenterStateDto("question-detail", "cat1", "q5", revealState));

        var receiver = BuildConnection();
        PresenterStateDto? received = null;
        receiver.On<PresenterStateDto>("StateUpdated", s => received = s);
        await receiver.StartAsync();

        await Task.Delay(200);

        Assert.NotNull(received);
        Assert.NotNull(received.RevealState);
        var boxes = received.RevealState.SingingPianosBoxesRevealed;
        Assert.NotNull(boxes);
        Assert.Equal("box1", boxes[0].Id);
        Assert.True(boxes[0].Revealed);
        Assert.Equal("box2", boxes[1].Id);
        Assert.False(boxes[1].Revealed);
        Assert.Equal("box3", boxes[2].Id);
        Assert.True(boxes[2].Revealed);

        await sender.DisposeAsync();
        await receiver.DisposeAsync();
    }
}

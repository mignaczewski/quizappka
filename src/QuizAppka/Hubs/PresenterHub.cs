using Microsoft.AspNetCore.SignalR;
using QuizAppka.Models;
using QuizAppka.Services;

namespace QuizAppka.Hubs;

public class PresenterHub(IPresenterSessionStore store) : Hub
{
    private static readonly HashSet<string> ValidScreens =
        ["idle", "category-list", "question-list", "question-detail"];

    public override async Task OnConnectedAsync()
    {
        var current = store.CurrentState;
        if (current is not null)
        {
            await Clients.Caller.SendAsync("StateUpdated", current);
        }
        await base.OnConnectedAsync();
    }

    public async Task UpdateState(PresenterStateDto state)
    {
        if (!ValidScreens.Contains(state.Screen))
        {
            throw new HubException($"Invalid screen value: {state.Screen}");
        }

        store.SetState(state);
        await Clients.All.SendAsync("StateUpdated", state);
    }
}

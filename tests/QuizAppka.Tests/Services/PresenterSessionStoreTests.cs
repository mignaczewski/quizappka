using QuizAppka.Models;
using QuizAppka.Services;

namespace QuizAppka.Tests.Services;

public class PresenterSessionStoreTests
{
    [Fact]
    public void CurrentState_IsNull_Initially()
    {
        var store = new PresenterSessionStore();

        Assert.Null(store.CurrentState);
    }

    [Fact]
    public void SetState_UpdatesCurrentState()
    {
        var store = new PresenterSessionStore();
        var state = new PresenterStateDto("category-list");

        store.SetState(state);

        Assert.Equal(state, store.CurrentState);
    }

    [Fact]
    public void SetState_OverwritesPreviousState()
    {
        var store = new PresenterSessionStore();
        store.SetState(new PresenterStateDto("category-list"));
        var newState = new PresenterStateDto("question-list", "cat1");

        store.SetState(newState);

        Assert.Equal(newState, store.CurrentState);
    }

    [Fact]
    public async Task SetState_IsThreadSafe()
    {
        var store = new PresenterSessionStore();
        var tasks = Enumerable.Range(0, 100)
            .Select(i => Task.Run(() => store.SetState(new PresenterStateDto("idle"))))
            .ToArray();

        await Task.WhenAll(tasks);

        Assert.NotNull(store.CurrentState);
    }
}

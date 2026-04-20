using QuizAppka.Models;

namespace QuizAppka.Services;

public sealed class PresenterSessionStore : IPresenterSessionStore
{
    private readonly object _lock = new();
    private PresenterStateDto? _current;

    public PresenterStateDto? CurrentState
    {
        get { lock (_lock) { return _current; } }
    }

    public void SetState(PresenterStateDto state)
    {
        lock (_lock) { _current = state; }
    }
}

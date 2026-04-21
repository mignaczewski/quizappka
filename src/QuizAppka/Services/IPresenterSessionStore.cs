using QuizAppka.Models;

namespace QuizAppka.Services;

public interface IPresenterSessionStore
{
    PresenterStateDto? CurrentState { get; }
    void SetState(PresenterStateDto state);
}

namespace QuizAppka.Models;

public class ClosedQuestion : Question
{
    public AnswerOption[] Options { get; init; } = [];
}

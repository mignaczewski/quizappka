namespace QuizAppka.Models;

public class MemeQuestion : Question
{
    public string EntryImage { get; init; } = string.Empty;
    public string? RevealImage { get; init; }
    public AnswerOption[] Options { get; init; } = [];
}

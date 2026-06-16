using System.Text.Json.Serialization;

namespace QuizAppka.Models;

public class MemeQuestion : Question
{
    public string EntryImage { get; init; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? RevealImage { get; init; }

    public AnswerOption[] Options { get; init; } = [];

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? PresenterHint { get; init; }
}

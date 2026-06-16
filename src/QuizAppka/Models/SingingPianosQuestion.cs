using System.Text.Json.Serialization;

namespace QuizAppka.Models;

public class SingingPianosQuestion : Question
{
    public PianoBox[] Boxes { get; init; } = [];

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? PresenterHint { get; init; }
}

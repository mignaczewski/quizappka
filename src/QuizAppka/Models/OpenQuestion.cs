using System.Text.Json.Serialization;

namespace QuizAppka.Models;

public class OpenQuestion : Question
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? PresenterHint { get; init; }
}

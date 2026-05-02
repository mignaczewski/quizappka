using System.Text.Json.Serialization;

namespace QuizAppka.Models;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(OpenQuestion), "open")]
[JsonDerivedType(typeof(ClosedQuestion), "closed")]
[JsonDerivedType(typeof(ImageRebusQuestion), "image-rebus")]
[JsonDerivedType(typeof(MemeQuestion), "meme")]
[JsonDerivedType(typeof(SingingPianosQuestion), "singing-pianos")]
public abstract class Question
{
    public string Id { get; init; } = string.Empty;
    public string Prompt { get; init; } = string.Empty;
    public string? ValidationError { get; set; }
}

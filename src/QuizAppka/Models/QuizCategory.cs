namespace QuizAppka.Models;

public class QuizCategory
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public IReadOnlyList<Question> Questions { get; init; } = [];
}

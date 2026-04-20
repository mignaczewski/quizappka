namespace QuizAppka.Models;

public record PresenterStateDto(
    string Screen,
    string? CategoryId = null,
    string? QuestionId = null,
    RevealState? RevealState = null
);

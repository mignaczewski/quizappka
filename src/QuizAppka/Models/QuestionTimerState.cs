namespace QuizAppka.Models;

public record QuestionTimerState(
    string Status,
    int InitialDurationSeconds,
    int RemainingSeconds,
    string? LastUpdatedAtUtc = null
);

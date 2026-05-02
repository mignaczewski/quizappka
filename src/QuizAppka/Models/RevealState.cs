namespace QuizAppka.Models;

public record RevealState(
    bool? MemeImageRevealed = null,
    RevealedBox[]? SingingPianosBoxesRevealed = null
);

namespace QuizAppka.Models;

public record RevealState(
    bool? MemeImageRevealed = null,
    bool[]? SingingPianosBoxesRevealed = null
);

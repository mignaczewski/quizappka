namespace QuizAppka.Models;

public record RevealState(
    bool? MemeImageRevealed = null,
    PianoBoxReveal[]? SingingPianosBoxesRevealed = null
);

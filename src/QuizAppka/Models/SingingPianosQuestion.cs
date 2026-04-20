namespace QuizAppka.Models;

public class SingingPianosQuestion : Question
{
    public PianoBox[] Boxes { get; init; } = [];
}

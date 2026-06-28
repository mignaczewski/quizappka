namespace QuizAppka.Models;

public class ImageRebusQuestion : Question
{
    public string ImageRef { get; init; } = string.Empty;

    public string PresenterHint { get; set; } = string.Empty;
}

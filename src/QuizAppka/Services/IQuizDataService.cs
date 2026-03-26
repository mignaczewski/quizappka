using QuizAppka.Models;

namespace QuizAppka.Services;

public interface IQuizDataService
{
    IReadOnlyList<QuizCategory> GetCategories();
    QuizCategory? GetCategory(string id);
}

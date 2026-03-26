using Microsoft.AspNetCore.Mvc;
using QuizAppka.Models;
using QuizAppka.Services;

namespace QuizAppka.Controllers;

[ApiController]
[Route("api/quiz")]
public class QuizController : ControllerBase
{
    private readonly IQuizDataService _quizDataService;

    public QuizController(IQuizDataService quizDataService)
    {
        _quizDataService = quizDataService;
    }

    [HttpGet("categories")]
    public ActionResult<IEnumerable<CategorySummary>> GetCategories()
    {
        var categories = _quizDataService.GetCategories()
            .Select(c => new CategorySummary(c.Id, c.Name));
        return Ok(categories);
    }

    [HttpGet("categories/{id}")]
    public ActionResult<CategoryDetail> GetCategory(string id)
    {
        var category = _quizDataService.GetCategory(id);
        if (category is null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Category not found",
                Detail = $"No category with id '{id}' was found.",
                Status = StatusCodes.Status404NotFound,
            });
        }

        return Ok(new CategoryDetail(category.Id, category.Name, category.Questions));
    }
}

public record CategorySummary(string Id, string Name);
public record CategoryDetail(string Id, string Name, IReadOnlyList<Question> Questions);

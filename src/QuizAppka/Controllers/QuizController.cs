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

        var publicQuestions = category.Questions.Select(StripPresenterData).ToList();
        return Ok(new CategoryDetail(category.Id, category.Name, publicQuestions));
    }

    [HttpGet("presenter/categories/{id}")]
    public ActionResult<CategoryDetail> GetPresenterCategory(string id)
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

    private static Question StripPresenterData(Question question) => question switch
    {
        ClosedQuestion closed when closed.PresenterHint is not null
            => new ClosedQuestion { Id = closed.Id, Prompt = closed.Prompt, Title = closed.Title, Options = closed.Options },
        OpenQuestion open when open.PresenterHint is not null
            => new OpenQuestion { Id = open.Id, Prompt = open.Prompt, Title = open.Title },
        MemeQuestion meme when meme.PresenterHint is not null
            => new MemeQuestion { Id = meme.Id, Prompt = meme.Prompt, Title = meme.Title, EntryImage = meme.EntryImage, RevealImage = meme.RevealImage, Options = meme.Options },
        SingingPianosQuestion piano when piano.PresenterHint is not null
            => new SingingPianosQuestion { Id = piano.Id, Prompt = piano.Prompt, Title = piano.Title, Boxes = piano.Boxes },
        _ => question,
    };
}

public record CategorySummary(string Id, string Name);
public record CategoryDetail(string Id, string Name, IReadOnlyList<Question> Questions);

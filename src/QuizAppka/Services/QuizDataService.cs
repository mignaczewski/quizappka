using System.Text.Json;
using QuizAppka.Models;

namespace QuizAppka.Services;

public class QuizDataService : IQuizDataService
{
    private readonly IReadOnlyList<QuizCategory> _categories;

    public QuizDataService(IConfiguration configuration, ILogger<QuizDataService> logger, IWebHostEnvironment environment)
    {
        var dataDirectory = configuration["DataDirectory"]
            ?? Path.Combine(environment.ContentRootPath, "Data", "categories");

        _categories = LoadCategories(dataDirectory, logger);
    }

    public IReadOnlyList<QuizCategory> GetCategories() => _categories;

    public QuizCategory? GetCategory(string id) =>
        _categories.FirstOrDefault(c => c.Id == id);

    private static IReadOnlyList<QuizCategory> LoadCategories(string dataDirectory, ILogger<QuizDataService> logger)
    {
        if (!Directory.Exists(dataDirectory))
        {
            logger.LogWarning("Data directory not found: {DataDirectory}", dataDirectory);
            return [];
        }

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            AllowOutOfOrderMetadataProperties = true,
        };

        var categories = new List<QuizCategory>();
        var seenIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var file in Directory.GetFiles(dataDirectory, "*.json").OrderBy(f => f))
        {
            try
            {
                var json = File.ReadAllText(file);
                var category = JsonSerializer.Deserialize<QuizCategory>(json, options);

                if (category is null)
                {
                    logger.LogWarning("Failed to deserialize category file: {File}", file);
                    continue;
                }

                if (string.IsNullOrWhiteSpace(category.Id))
                {
                    logger.LogWarning("Category in file {File} has empty id; skipping", file);
                    continue;
                }

                if (!seenIds.Add(category.Id))
                {
                    logger.LogWarning("Duplicate category id '{CategoryId}' in file {File}; skipping", category.Id, file);
                    continue;
                }

                var validQuestions = FilterValidQuestions(category.Questions, category.Id, logger);

                if (validQuestions.Count == 0)
                {
                    logger.LogWarning("Category '{CategoryId}' has no valid questions; excluding from available categories", category.Id);
                    continue;
                }

                categories.Add(new QuizCategory
                {
                    Id = category.Id,
                    Name = category.Name,
                    Questions = validQuestions,
                });
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Error loading category file: {File}", file);
            }
        }

        logger.LogInformation(
            "Loaded {CategoryCount} categories with {TotalQuestions} total questions",
            categories.Count,
            categories.Sum(c => c.Questions.Count));

        return categories.AsReadOnly();
    }

    private static IReadOnlyList<Question> FilterValidQuestions(
        IReadOnlyList<Question> questions,
        string categoryId,
        ILogger<QuizDataService> logger)
    {
        var valid = new List<Question>();

        foreach (var question in questions)
        {
            if (string.IsNullOrWhiteSpace(question.Id) || string.IsNullOrWhiteSpace(question.Prompt))
            {
                logger.LogWarning(
                    "Question in category '{CategoryId}' has empty id or prompt; skipping",
                    categoryId);
                continue;
            }

            if (question is ClosedQuestion closed && closed.Options.Length < 2)
            {
                logger.LogWarning(
                    "Closed question '{QuestionId}' in category '{CategoryId}' has fewer than 2 options; skipping",
                    question.Id, categoryId);
                continue;
            }

            if (question is ImageRebusQuestion rebus && string.IsNullOrWhiteSpace(rebus.ImageRef))
            {
                logger.LogWarning(
                    "Image-rebus question '{QuestionId}' in category '{CategoryId}' has empty imageRef; skipping",
                    question.Id, categoryId);
                continue;
            }

            if (question is TimedOpenQuestion timedOpen && timedOpen.InitialDurationSeconds <= 0)
            {
                logger.LogWarning(
                    "Timed-open question '{QuestionId}' in category '{CategoryId}' has non-positive initialDurationSeconds; skipping",
                    question.Id, categoryId);
                continue;
            }

            valid.Add(question);
        }

        return valid.AsReadOnly();
    }
}

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QuizAppka.Models;
using QuizAppka.Services;

namespace QuizAppka.Tests.Services;

public class QuizDataServiceTests : IDisposable
{
    private readonly string _tempDir;
    private readonly ILogger<QuizDataService> _logger;

    public QuizDataServiceTests()
    {
        _tempDir = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
        Directory.CreateDirectory(_tempDir);
        _logger = new LoggerFactory().CreateLogger<QuizDataService>();
    }

    public void Dispose()
    {
        Directory.Delete(_tempDir, recursive: true);
    }

    private QuizDataService CreateService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["DataDirectory"] = _tempDir,
            })
            .Build();

        var env = new FakeWebHostEnvironment();
        return new QuizDataService(config, _logger, env);
    }

    private void WriteCategory(string id, string name, string questionsJson)
    {
        var json = $"{{\"id\":\"{id}\",\"name\":\"{name}\",\"questions\":{questionsJson}}}";
        File.WriteAllText(Path.Combine(_tempDir, $"{id}.json"), json);
    }

    [Fact]
    public void GetCategories_ReturnsLoadedCategories()
    {
        WriteCategory("cat1", "Category 1", """[{"id":"q1","type":"open","prompt":"Question?"}]""");

        var svc = CreateService();
        var cats = svc.GetCategories();

        Assert.Single(cats);
        Assert.Equal("cat1", cats[0].Id);
        Assert.Equal("Category 1", cats[0].Name);
    }

    [Fact]
    public void GetCategories_ExcludesCategoryWithZeroValidQuestions()
    {
        WriteCategory("empty-cat", "Empty", "[]");
        WriteCategory("valid-cat", "Valid", """[{"id":"q1","type":"open","prompt":"Hello?"}]""");

        var svc = CreateService();
        var cats = svc.GetCategories();

        Assert.Single(cats);
        Assert.Equal("valid-cat", cats[0].Id);
    }

    [Fact]
    public void GetCategories_ExcludesClosedQuestionsWithFewerThanTwoOptions()
    {
        const string questionsJson = "[{\"id\":\"q1\",\"type\":\"closed\",\"prompt\":\"?\",\"options\":[{\"id\":\"a\",\"text\":\"Only one\"}]},{\"id\":\"q2\",\"type\":\"open\",\"prompt\":\"Valid open question?\"}]";
        WriteCategory("cat1", "Cat", questionsJson);

        var svc = CreateService();
        var cats = svc.GetCategories();

        Assert.Single(cats);
        Assert.Single(cats[0].Questions);
        Assert.Equal("q2", cats[0].Questions[0].Id);
    }

    [Fact]
    public void GetCategories_ExcludesImageRebusWithEmptyImageRef()
    {
        const string questionsJson2 = "[{\"id\":\"q1\",\"type\":\"image-rebus\",\"prompt\":\"See image\",\"imageRef\":\"\"},{\"id\":\"q2\",\"type\":\"open\",\"prompt\":\"Valid?\"}]";
        WriteCategory("cat1", "Cat", questionsJson2);

        var svc = CreateService();
        var cats = svc.GetCategories();

        Assert.Single(cats);
        Assert.Single(cats[0].Questions);
        Assert.Equal("q2", cats[0].Questions[0].Id);
    }

    [Fact]
    public void GetCategories_ExcludesDuplicateCategoryIds()
    {
        var json = """{"id":"dup","name":"Duplicate","questions":[{"id":"q1","type":"open","prompt":"?"}]}""";
        File.WriteAllText(Path.Combine(_tempDir, "a-dup.json"), json);
        File.WriteAllText(Path.Combine(_tempDir, "b-dup.json"), json);

        var svc = CreateService();
        var cats = svc.GetCategories();

        Assert.Single(cats);
    }

    [Fact]
    public void GetCategory_ReturnsCategory_WhenExists()
    {
        WriteCategory("cat1", "Cat 1", """[{"id":"q1","type":"open","prompt":"?"}]""");

        var svc = CreateService();
        var cat = svc.GetCategory("cat1");

        Assert.NotNull(cat);
        Assert.Equal("cat1", cat.Id);
    }

    [Fact]
    public void GetCategory_ReturnsNull_WhenNotExists()
    {
        var svc = CreateService();
        var cat = svc.GetCategory("nonexistent");

        Assert.Null(cat);
    }

    // T026 — US5: SingingPianos with empty Boxes is included with ValidationError
    [Fact]
    public void GetCategories_IncludesSingingPianosWithEmptyBoxes_WithValidationError()
    {
        const string questionsJson = "[{\"id\":\"q1\",\"type\":\"singing-pianos\",\"prompt\":\"Piano?\",\"boxes\":[]},{\"id\":\"q2\",\"type\":\"open\",\"prompt\":\"Valid?\"}]";
        WriteCategory("cat1", "Cat", questionsJson);

        var svc = CreateService();
        var cats = svc.GetCategories();

        Assert.Single(cats);
        Assert.Equal(2, cats[0].Questions.Count);
        var piano = cats[0].Questions.Single(q => q.Id == "q1");
        Assert.NotNull(piano.ValidationError);
        Assert.Equal("No boxes defined", piano.ValidationError);
    }

    // T026 — US5: Meme with empty EntryImage is included with ValidationError
    [Fact]
    public void GetCategories_IncludesMemeWithEmptyEntryImage_WithValidationError()
    {
        const string questionsJson = "[{\"id\":\"q1\",\"type\":\"meme\",\"prompt\":\"Meme?\",\"entryImage\":\"\",\"revealImage\":\"reveal.jpg\",\"options\":[]},{\"id\":\"q2\",\"type\":\"open\",\"prompt\":\"Valid?\"}]";
        WriteCategory("cat1", "Cat", questionsJson);

        var svc = CreateService();
        var cats = svc.GetCategories();

        Assert.Single(cats);
        Assert.Equal(2, cats[0].Questions.Count);
        var meme = cats[0].Questions.Single(q => q.Id == "q1");
        Assert.NotNull(meme.ValidationError);
        Assert.Equal("Missing entry image", meme.ValidationError);
    }
}

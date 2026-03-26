using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using QuizAppka.Controllers;
using QuizAppka.Models;
using QuizAppka.Services;

namespace QuizAppka.Tests.Controllers;

public class QuizControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public QuizControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    private WebApplicationFactory<Program> CreateFactoryWithService(IQuizDataService service)
    {
        return _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove the existing singleton registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(IQuizDataService));
                if (descriptor != null)
                    services.Remove(descriptor);

                services.AddSingleton(service);
            });
        });
    }

    [Fact]
    public async Task GetCategories_Returns200_WithCategoryList()
    {
        var fakeService = new FakeQuizDataService(
        [
            new QuizCategory { Id = "cat1", Name = "Cat 1", Questions = [new OpenQuestion { Id = "q1", Prompt = "?" }] },
            new QuizCategory { Id = "cat2", Name = "Cat 2", Questions = [new OpenQuestion { Id = "q2", Prompt = "??" }] },
        ]);

        using var factory = CreateFactoryWithService(fakeService);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/quiz/categories");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var categories = await response.Content.ReadFromJsonAsync<CategorySummary[]>();
        Assert.NotNull(categories);
        Assert.Equal(2, categories.Length);
        Assert.Equal("cat1", categories[0].Id);
        Assert.Equal("Cat 1", categories[0].Name);
    }

    [Fact]
    public async Task GetCategories_Returns200_WithEmptyArray_WhenNoCategories()
    {
        var fakeService = new FakeQuizDataService([]);

        using var factory = CreateFactoryWithService(fakeService);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/quiz/categories");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var categories = await response.Content.ReadFromJsonAsync<CategorySummary[]>();
        Assert.NotNull(categories);
        Assert.Empty(categories);
    }

    [Fact]
    public async Task GetCategory_Returns200_WithCategoryDetail()
    {
        var fakeService = new FakeQuizDataService(
        [
            new QuizCategory
            {
                Id = "cat1",
                Name = "Cat 1",
                Questions =
                [
                    new OpenQuestion { Id = "q1", Prompt = "Open?" },
                ],
            },
        ]);

        using var factory = CreateFactoryWithService(fakeService);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/quiz/categories/cat1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetCategory_Returns404_WhenNotFound()
    {
        var fakeService = new FakeQuizDataService([]);

        using var factory = CreateFactoryWithService(fakeService);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/quiz/categories/unknown");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}

file class FakeQuizDataService : IQuizDataService
{
    private readonly IReadOnlyList<QuizCategory> _categories;

    public FakeQuizDataService(IReadOnlyList<QuizCategory> categories)
    {
        _categories = categories;
    }

    public IReadOnlyList<QuizCategory> GetCategories() => _categories;

    public QuizCategory? GetCategory(string id) =>
        _categories.FirstOrDefault(c => c.Id == id);
}

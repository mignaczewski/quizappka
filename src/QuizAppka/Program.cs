using QuizAppka.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<IQuizDataService, QuizDataService>();

var app = builder.Build();

app.UseStaticFiles();
app.MapControllers();
app.MapFallbackToFile("index.html");

await app.RunAsync();

public partial class Program { }

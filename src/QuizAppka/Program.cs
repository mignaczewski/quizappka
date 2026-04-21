using QuizAppka.Hubs;
using QuizAppka.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddSingleton<IQuizDataService, QuizDataService>();
builder.Services.AddSingleton<IPresenterSessionStore, PresenterSessionStore>();

var app = builder.Build();

app.UseStaticFiles();
app.MapControllers();
app.MapHub<PresenterHub>("/hubs/presenter");
app.MapFallbackToFile("index.html");

await app.RunAsync();


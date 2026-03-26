var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.QuizAppka>("quizapp");

builder.Build().Run();

# quizappka Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-21

## Active Technologies
- C# / .NET 10 (backend), TypeScript 5.8 / React 19 (frontend) + ASP.NET Core 10, React 19, MUI 7.3, React Router DOM 7.13, Vite 6.3 (002-question-list-navigation)
- JSON files (read-only category data loaded at startup, no runtime persistence) (002-question-list-navigation)
- No database. Server-side state is held in a singleton in-memory `IPresenterSessionStore` for the lifetime of the process. State is intentionally ephemeral — a server restart resets to idle. (003-presenter-mirroring-mode)
- C# / .NET 10 (backend — unchanged), TypeScript 5.8 / React 19 (frontend) + ASP.NET Core 10 (unchanged), React 19, MUI 7, React Router DOM 7, Vite 6, Vitest 4 + Testing Library (004-category-list-navigation)
- N/A — no data model changes; read-only JSON category data unchanged (004-category-list-navigation)
- Read-only JSON category files under `src/QuizAppka/Data/categories/`. No database. In-memory `PresenterSessionStore` singleton carries ephemeral reveal state for the lifetime of the process. (005-question-types-enhancements)
- C# / .NET 10 (backend), TypeScript / React 19 + Vite (frontend) + ASP.NET Core Web API, MUI (Material UI), Vitest + React Testing Library (frontend), xUnit + `WebApplicationFactory` (backend) (006-open-question-presenter-hint)
- JSON category files on disk (no database) (006-open-question-presenter-hint)

- .NET 10 (C# 13), TypeScript 5.x + ASP.NET Core 10, Microsoft.AspNetCore.SpaProxy, React 18+, Material UI v6+, Vite 5+, .NET Aspire (001-quiz-display-webapp)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

.NET 10 (C# 13), TypeScript 5.x: Follow standard conventions

## Recent Changes
- 006-open-question-presenter-hint: Added C# / .NET 10 (backend), TypeScript / React 19 + Vite (frontend) + ASP.NET Core Web API, MUI (Material UI), Vitest + React Testing Library (frontend), xUnit + `WebApplicationFactory` (backend)
- 005-question-types-enhancements: Added C# / .NET 10 (backend), TypeScript 5.8 / React 19 (frontend)
- 004-category-list-navigation: Added C# / .NET 10 (backend — unchanged), TypeScript 5.8 / React 19 (frontend) + ASP.NET Core 10 (unchanged), React 19, MUI 7, React Router DOM 7, Vite 6, Vitest 4 + Testing Library


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

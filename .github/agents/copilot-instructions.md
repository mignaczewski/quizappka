# quizappka Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-20

## Active Technologies
- C# / .NET 10 (backend), TypeScript 5.8 / React 19 (frontend) + ASP.NET Core 10, React 19, MUI 7.3, React Router DOM 7.13, Vite 6.3 (002-question-list-navigation)
- JSON files (read-only category data loaded at startup, no runtime persistence) (002-question-list-navigation)
- No database. Server-side state is held in a singleton in-memory `IPresenterSessionStore` for the lifetime of the process. State is intentionally ephemeral — a server restart resets to idle. (003-presenter-mirroring-mode)
- C# / .NET 10 (backend — unchanged), TypeScript 5.8 / React 19 (frontend) + ASP.NET Core 10 (unchanged), React 19, MUI 7, React Router DOM 7, Vite 6, Vitest 4 + Testing Library (004-category-list-navigation)
- N/A — no data model changes; read-only JSON category data unchanged (004-category-list-navigation)

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
- 004-category-list-navigation: Added C# / .NET 10 (backend — unchanged), TypeScript 5.8 / React 19 (frontend) + ASP.NET Core 10 (unchanged), React 19, MUI 7, React Router DOM 7, Vite 6, Vitest 4 + Testing Library
- 003-presenter-mirroring-mode: Added C# / .NET 10 (backend), TypeScript 5.8 / React 19 (frontend)
- 002-question-list-navigation: Added C# / .NET 10 (backend), TypeScript 5.8 / React 19 (frontend) + ASP.NET Core 10, React 19, MUI 7.3, React Router DOM 7.13, Vite 6.3


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

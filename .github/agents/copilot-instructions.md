# quizappka Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-06-16

## Active Technologies
- C# / .NET 10 (backend), TypeScript 5.8 / React 19 (frontend) + ASP.NET Core 10, React 19, MUI 7.3, React Router DOM 7.13, Vite 6.3 (002-question-list-navigation)
- JSON files (read-only category data loaded at startup, no runtime persistence) (002-question-list-navigation)
- No database. Server-side state is held in a singleton in-memory `IPresenterSessionStore` for the lifetime of the process. State is intentionally ephemeral — a server restart resets to idle. (003-presenter-mirroring-mode)
- C# / .NET 10 (backend — unchanged), TypeScript 5.8 / React 19 (frontend) + ASP.NET Core 10 (unchanged), React 19, MUI 7, React Router DOM 7, Vite 6, Vitest 4 + Testing Library (004-category-list-navigation)
- N/A — no data model changes; read-only JSON category data unchanged (004-category-list-navigation)
- Read-only JSON category files under `src/QuizAppka/Data/categories/`. No database. In-memory `PresenterSessionStore` singleton carries ephemeral reveal state for the lifetime of the process. (005-question-types-enhancements)
- C# / .NET 10 (backend), TypeScript / React 19 + Vite (frontend) + ASP.NET Core Web API, MUI (Material UI), Vitest + React Testing Library (frontend), xUnit + `WebApplicationFactory` (backend) (006-open-question-presenter-hint)
- JSON category files on disk (no database) (006-open-question-presenter-hint)
- TypeScript 5.8 / React 19.1 + MUI v7.3.9 (`@mui/material`), React Router DOM v7, Vite 6, Vitest 4 (007-quiz-layout-improvements)
- N/A — frontend-only layout change (007-quiz-layout-improvements)
- TypeScript 5.8.3 + React 19.1.0, React Router DOM 7.13, MUI 7.3.9, @microsoft/signalr 10.0.0 (009-usecallback-revealed-state)
- N/A — all state is in-memory React state; no server-side persistence of reveal state (009-usecallback-revealed-state)
- C# (.NET 10.0) / TypeScript 5.8.3 + ASP.NET Core 10.0, React 19.1.0, Material-UI 7.3.9, @microsoft/signalr 10.0.0, Vite 6.3.5 (009-question-title-universal-hint)
- JSON files in `src/QuizAppka/Data/categories/` (no database) (009-question-title-universal-hint)

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
- 009-question-title-universal-hint: Added C# (.NET 10.0) / TypeScript 5.8.3 + ASP.NET Core 10.0, React 19.1.0, Material-UI 7.3.9, @microsoft/signalr 10.0.0, Vite 6.3.5
- 009-usecallback-revealed-state: Added TypeScript 5.8.3 + React 19.1.0, React Router DOM 7.13, MUI 7.3.9, @microsoft/signalr 10.0.0
- 007-quiz-layout-improvements: Added TypeScript 5.8 / React 19.1 + MUI v7.3.9 (`@mui/material`), React Router DOM v7, Vite 6, Vitest 4


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

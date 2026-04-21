# Implementation Plan: Quiz Display Web Application

**Branch**: `001-quiz-display-webapp` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-quiz-display-webapp/spec.md`

## Summary

Build a read-only web application for presenting quiz questions to a live audience. Questions are predefined in JSON files organized into categories. The application supports three question types (open, closed, image rebus) and provides navigation controls for the presenter. The stack is a single .NET 10 project hosting both a REST API backend and a Vite + React + Material UI SPA, with SPA Proxy for development and a .NET Aspire AppHost for cloud-readiness.

## Technical Context

**Language/Version**: .NET 10 (C# 13), TypeScript 5.x  
**Primary Dependencies**: ASP.NET Core 10, Microsoft.AspNetCore.SpaProxy, React 18+, Material UI v6+, Vite 5+, .NET Aspire  
**Storage**: JSON files in `Data/categories/` (content root); `wwwroot/images/rebus/` for static images  
**Testing**: xUnit + WebApplicationFactory (backend), Vitest + React Testing Library (frontend), Playwright (E2E)  
**Target Platform**: Desktop/laptop web browsers (initial release)  
**Project Type**: Single .NET 10 web application hosting SPA; separate Aspire AppHost project for orchestration  
**Performance Goals**: First question displayed < 30 s (SC-001); navigation response < 1 s (SC-003)  
**Constraints**: Read-only data; no user authentication; no scoring or answer collection; JSON-only data source  
**Scale/Scope**: Single presenter, small live audience; up to tens of categories, up to hundreds of questions per category

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Contract scope**: ✅ Backend REST API (`GET /api/quiz/categories`, `GET /api/quiz/categories/{id}`) defined in [contracts/quiz-api.md](contracts/quiz-api.md). TypeScript mirror types defined in data-model.md. Static image serving via `app.UseStaticFiles()`.
- **Quality gates**:
  - Backend: `dotnet format --verify-no-changes`, `dotnet test`
  - Frontend: `npm run lint` (ESLint + TypeScript ESLint), `npm run type-check` (`tsc --noEmit`), `npm run test` (Vitest)
  - E2E: `npx playwright test`
- **Test strategy**: ✅ Defined before implementation — xUnit unit tests for `QuizDataService`, WebApplicationFactory integration tests for API endpoints, Vitest + RTL component tests for all three question type renderers and navigation, Playwright E2E for the full presenter flow (category selection → navigation → end of category).
- **Cross-layer validation**: ✅ WebApplicationFactory tests exercise the real DI container and file-loading path. Playwright tests run against the full running application.
- **Constitution exceptions**: None. All principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/001-quiz-display-webapp/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── quiz-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── QuizAppka/                      # ASP.NET Core 10 web project
│   ├── Controllers/
│   │   └── QuizController.cs       # GET /api/quiz/categories, GET /api/quiz/categories/{id}
│   ├── Models/
│   │   ├── Question.cs             # Abstract base with [JsonPolymorphic] attributes
│   │   ├── OpenQuestion.cs
│   │   ├── ClosedQuestion.cs
│   │   ├── ImageRebusQuestion.cs
│   │   ├── AnswerOption.cs
│   │   └── QuizCategory.cs
│   ├── Services/
│   │   ├── IQuizDataService.cs
│   │   └── QuizDataService.cs      # Singleton, loads JSON at startup
│   ├── Data/
│   │   └── categories/
│   │       └── *.json              # One JSON file per quiz category
│   ├── ClientApp/                  # Vite + React + TypeScript SPA
│   │   ├── vite.config.ts          # outDir: ../wwwroot; proxy: /api → backend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── types/
│   │       │   └── quiz.ts         # TypeScript mirror of backend models
│   │       ├── services/
│   │       │   └── quizApi.ts      # fetch wrappers for /api/quiz/*
│   │       ├── components/
│   │       │   ├── CategoryList.tsx
│   │       │   ├── QuestionDisplay.tsx  # Dispatcher: routes to correct type component
│   │       │   ├── OpenQuestion.tsx
│   │       │   ├── ClosedQuestion.tsx
│   │       │   ├── ImageRebusQuestion.tsx
│   │       │   └── NavigationBar.tsx
│   │       └── pages/
│   │           ├── HomePage.tsx    # Category selection
│   │           └── QuizPage.tsx    # Active quiz session
│   ├── wwwroot/
│   │   └── images/
│   │       └── rebus/              # Rebus question images (static)
│   ├── Program.cs
│   ├── appsettings.json
│   └── QuizAppka.csproj
│
└── QuizAppka.AppHost/              # .NET Aspire orchestration project
    ├── Program.cs                  # builder.AddProject<Projects.QuizAppka>(...)
    └── QuizAppka.AppHost.csproj

tests/
├── QuizAppka.Tests/                # Backend tests
│   ├── Services/
│   │   └── QuizDataServiceTests.cs
│   ├── Controllers/
│   │   └── QuizControllerTests.cs
│   └── QuizAppka.Tests.csproj
└── QuizAppka.E2E/                  # Playwright E2E tests
    ├── tests/
    │   ├── category-selection.spec.ts
    │   ├── question-display.spec.ts
    │   └── navigation.spec.ts
    └── package.json

QuizAppka.sln
```

**Structure Decision**: Single .NET project (Option 1 variant with SPA integration). Both `QuizAppka/` and `QuizAppka.AppHost/` are co-located under `src/`. The `ClientApp/` folder inside `QuizAppka/` is the React/Vite source; `wwwroot/` holds only build output and static assets. Tests are co-located under `tests/` at the solution root.

## Complexity Tracking

No constitution violations. No unjustified complexity.

# Implementation Plan: Open Question Presenter Hint

**Branch**: `006-open-question-presenter-hint` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-open-question-presenter-hint/spec.md`

## Summary

Add an optional `presenterHint` field to the open question type so the presenter can see hidden private text or a URL alongside the question prompt. The hint is present in the presenter API response and visible in the presenter UI; it is stripped from the public audience-facing API response and absent from the mirror view. The implementation directly mirrors the pattern already in place for `ClosedQuestion`.

## Technical Context

**Language/Version**: C# / .NET 10 (backend), TypeScript / React 19 + Vite (frontend)
**Primary Dependencies**: ASP.NET Core Web API, MUI (Material UI), Vitest + React Testing Library (frontend), xUnit + `WebApplicationFactory` (backend)
**Storage**: JSON category files on disk (no database)
**Testing**: Vitest + RTL (`npm test`) for frontend; xUnit (`dotnet test`) for backend
**Target Platform**: Web (browser SPA + ASP.NET Core server)
**Project Type**: Web application (frontend + backend, SPA served via SPA proxy)
**Performance Goals**: Equivalent to existing question rendering — no additional async work
**Constraints**: `presenterHint` must be serialized with `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]` (same as `ClosedQuestion`). The `StripPresenterData` method in `QuizController` must be extended to nullify the hint for `OpenQuestion` when serving the public route.
**Scale/Scope**: Minimal — one backend model field, one controller method extension, one TypeScript type field, one React component update, and tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- **Contract scope identified**: The `OpenQuestion` TypeScript interface (quiz.ts) and the `OpenQuestion` C# model both gain the optional `presenterHint` field. Two API routes are affected: `GET /api/quiz/categories/{id}` (strips hint) and `GET /api/quiz/presenter/categories/{id}` (includes hint). Contract documented in `contracts/quiz-api.md`.
- **Quality gates**: `dotnet build`, `dotnet test` (xUnit); `npm run lint`, `npm run test` (Vitest). All gates are present and enforced in CI.
- **Test strategy defined before implementation**: Backend — integration tests via `WebApplicationFactory` asserting hint absent from public response and present from presenter response (mirrors existing closed-question tests). Frontend — `OpenQuestion.test.tsx` component tests asserting hint renders for plain text and URL, and is absent when not defined.
- **Cross-layer integration validation**: The existing `WebApplicationFactory`-based integration tests exercise the real serialization pipeline (including `JsonIgnore` and `StripPresenterData`). The same path is exercised for `OpenQuestion` — no mock-only shortcut.
- **No constitution exceptions required.**

## Project Structure

### Documentation (this feature)

```text
specs/006-open-question-presenter-hint/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── quiz-api.md      ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
src/QuizAppka/
├── Models/
│   └── OpenQuestion.cs                        ← add presenterHint field
├── Controllers/
│   └── QuizController.cs                      ← extend StripPresenterData for OpenQuestion
└── ClientApp/src/
    ├── types/
    │   └── quiz.ts                            ← add presenterHint? field to OpenQuestion interface
    └── components/
        ├── OpenQuestion.tsx                   ← add hint rendering (mirrors ClosedQuestion)
        └── __tests__/
            └── OpenQuestion.test.tsx          ← add hint test cases

tests/QuizAppka.Tests/
└── Controllers/
    └── QuizControllerTests.cs                 ← add 2 tests: strip + include for OpenQuestion
```

**Structure Decision**: Option 2 (web application — backend + frontend) as the project is an ASP.NET Core + React SPA. No new files or projects are created; all changes are additive within existing files.

## Complexity Tracking

*No constitution violations to document.*

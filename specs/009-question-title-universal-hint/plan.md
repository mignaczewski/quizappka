# Implementation Plan: Question Title Field and Universal Presenter Hint

**Branch**: `009-question-title-universal-hint` | **Date**: 2026-06-16 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/009-question-title-universal-hint/spec.md`

## Summary

Extend all five question types with an optional `title` field displayed as the
primary label in the question list, replacing the current full-prompt display.
Extend `MemeQuestion` and `SingingPianosQuestion` with the `presenterHint`
pattern already implemented for `ClosedQuestion` (feature 005) and `OpenQuestion`
(feature 006). Both additions are backwards-compatible: new fields are optional
and absent from existing JSON data files, which remain valid without changes.

## Technical Context

**Language/Version**: C# (.NET 10.0) / TypeScript 5.8.3  
**Primary Dependencies**: ASP.NET Core 10.0, React 19.1.0, Material-UI 7.3.9, @microsoft/signalr 10.0.0, Vite 6.3.5  
**Storage**: JSON files in `src/QuizAppka/Data/categories/` (no database)  
**Testing**: xUnit 2.9.3 + Microsoft.AspNetCore.Mvc.Testing (backend); Vitest 4.1.1 + @testing-library/react 16.3.2 (frontend); Playwright 1.58.2 (E2E)  
**Target Platform**: Web application — browser SPA + ASP.NET Core API server  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: No new performance requirements — additive optional fields only  
**Constraints**: Backwards-compatible with existing JSON data files; new fields optional with null/undefined defaults  
**Scale/Scope**: 3 backend C# models modified, 1 controller method extended, 3 frontend TypeScript types extended, 4 frontend components modified, 2 new test cases in backend, multiple frontend component test extensions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Contracts**: Both API routes (`GET /api/quiz/categories/{id}` and `GET /api/quiz/presenter/categories/{id}`) are affected. Frontend TypeScript types in `quiz.ts` are the contract boundary. The public route must never return `presenterHint` for any question type; the presenter route returns all fields.
- **Quality gates**:
  - Backend: `dotnet test` in `tests/QuizAppka.Tests/`
  - Frontend lint: `npm run lint` in `src/QuizAppka/ClientApp/`
  - Frontend type-check: `npm run build` (Vite invokes `tsc`)
  - Frontend unit tests: `npm run test` (Vitest) in `src/QuizAppka/ClientApp/`
  - E2E: Playwright in `tests/QuizAppka.E2E/` (smoke confirmation)
- **Test strategy**:
  - Backend unit: Serialization round-trips for `title` on all five question types; serialization of `presenterHint` on `MemeQuestion` and `SingingPianosQuestion`; `StripPresenterData` correctly strips `presenterHint` from `MemeQuestion` and `SingingPianosQuestion` and preserves `title` on stripped instances.
  - Frontend component: `QuestionList` renders title when defined; renders truncated prompt fallback when title absent; renders type-label fallback when neither title nor prompt is available. `MemeQuestion` component renders hint in presenter mode, hides hint in mirror mode, shows nothing when hint absent. `SingingPianos` component same coverage.
  - Integration: Public API endpoint returns no `presenterHint` field for questions of any type; presenter endpoint returns `presenterHint` when defined.
- **Cross-layer**: Schema changes touch backend models, controller strip logic, and frontend TypeScript types in lockstep. No ambiguity: the contract is defined in `contracts/quiz-api.md` for this feature.
- **Constitution exceptions**: None required.

## Project Structure

### Documentation (this feature)

```text
specs/009-question-title-universal-hint/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── quiz-api.md      # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/QuizAppka/
├── Models/
│   ├── Question.cs                    ← add optional Title property
│   ├── MemeQuestion.cs                ← add optional PresenterHint property
│   └── SingingPianosQuestion.cs       ← add optional PresenterHint property
├── Controllers/
│   └── QuizController.cs              ← extend StripPresenterData for MemeQuestion, SingingPianosQuestion; preserve Title on stripped instances
└── ClientApp/src/
    ├── types/
    │   └── quiz.ts                    ← add title?: string to BaseQuestion; add presenterHint?: string to MemeQuestion and SingingPianosQuestion
    ├── components/
    │   ├── QuestionList.tsx           ← display title (with prompt/type-label fallback) instead of raw prompt
    │   ├── MemeQuestion.tsx           ← add presenterHint rendering (presenter mode only)
    │   └── SingingPianos.tsx          ← add presenterHint rendering (presenter mode only)
    └── components/__tests__/
        ├── QuestionList.test.tsx      ← new test file: title, fallback, type-label coverage
        ├── MemeQuestion.test.tsx      ← extend: hint in presenter mode, hidden in mirror mode, absent when undefined
        └── SingingPianos.test.tsx     ← extend: hint in presenter mode, hidden in mirror mode, absent when undefined

tests/QuizAppka.Tests/
├── Models/
│   └── QuestionSerializationTests.cs  ← extend: title field round-trip all types; presenterHint on MemeQuestion and SingingPianosQuestion
└── Controllers/
    └── QuizControllerTests.cs         ← extend: StripPresenterData for MemeQuestion and SingingPianosQuestion with presenterHint; title preserved on stripped instances
```

**Structure Decision**: Web application — frontend + backend (Option 2). No new project required; all changes are within the existing `QuizAppka` project and `QuizAppka.Tests` test project.

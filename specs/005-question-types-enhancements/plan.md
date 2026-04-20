# Implementation Plan: Question Types Enhancements

**Branch**: `005-question-types-enhancements` | **Date**: 2026-04-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-question-types-enhancements/spec.md`

## Summary

Extend the quiz presenter application with three independently deliverable enhancements: (1) an optional presenter-only hint field on existing `ClosedQuestion`s, invisible to mirror views; (2) a new `MemeQuestion` type with a two-image reveal mechanic broadcast in real time to all mirror views; (3) a new `SingingPianosQuestion` type with five independently revealable hidden-text boxes, also broadcast to mirrors. All reveal state is carried in the existing `PresenterStateDto` (extended with an optional `RevealState` field) and propagated through the existing SignalR `PresenterHub`. The backend extends its polymorphic JSON question model. The frontend adds two new question components, a presenter-hint display on `ClosedQuestion`, and a reveal-action mechanism that triggers SignalR state updates.

## Technical Context

**Language/Version**: C# / .NET 10 (backend), TypeScript 5.8 / React 19 (frontend)  
**Primary Dependencies**:
- Backend: ASP.NET Core 10 (SignalR built-in, already configured), `System.Text.Json` polymorphic deserialization (already in use via `[JsonPolymorphic]` / `[JsonDerivedType]` attributes)
- Frontend: `@microsoft/signalr` (already installed), React 19, MUI 7, React Router v7, Vitest 4 + @testing-library/react
- E2E: Playwright (existing)

**Storage**: Read-only JSON category files under `src/QuizAppka/Data/categories/`. No database. In-memory `PresenterSessionStore` singleton carries ephemeral reveal state for the lifetime of the process.  
**Testing**: xUnit + `WebApplicationFactory` (backend); Vitest + @testing-library/react (frontend); Playwright (E2E)  
**Target Platform**: Desktop browser (same as existing presenter + mirror views)  
**Project Type**: Web application — React/Vite SPA embedded in ASP.NET Core 10  
**Performance Goals**: Reveal propagation ≤ 1 second under local network conditions (SC-003, SC-004)  
**Constraints**: No new NuGet or npm packages required. Backend must remain backward-compatible: existing question types (`open`, `closed`, `image-rebus`) must deserialize and render without change. WebSocket-only SignalR transport remains enforced. The presenter hint MUST NOT appear in any response served to the mirror route.  
**Scale/Scope**: 3 new/modified backend model types, 1 extended DTO, 2 new frontend components, 1 modified component (`ClosedQuestion`), 1 modified page (`QuestionDetailPage`), 1 modified hub (`PresenterHub`), 1 new presenter-specific API endpoint

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Contract scope identified for frontend, backend, and shared schemas | **PASS** | API contract changes identified: new `GET /api/quiz/presenter/categories/{id}` strips hint-free behaviour from regular endpoint; `PresenterStateDto` extended with `RevealState`; new type discriminators `meme` and `singing-pianos` added to JSON polymorphism chain. Full contract documented in `contracts/quiz-api.md`. |
| Quality gates listed explicitly | **PASS** | Backend: `dotnet test` (all xUnit tests). Frontend: `npm run lint && npm run type-check && npm run test`. E2E: `npx playwright test`. All must be green before merge. |
| Test strategy defined before implementation | **PASS** | See Test Strategy section below. |
| Cross-layer changes include real integration validation, not only mocks | **PASS** | Backend integration tests use `WebApplicationFactory`; reveal-state propagation is tested through the SignalR hub with a real in-process client. E2E tests cover presenter reveal → mirror update for both new question types. |
| Any constitution exception documented | **PASS** | No exceptions required. |

### Test Strategy

| Layer | Tool | Coverage |
|-------|------|----------|
| Backend unit | xUnit | `ClosedQuestion` serialization with/without hint; `MemeQuestion` and `SingingPianosQuestion` round-trip serialization; `PresenterStateDto` with `RevealState` field; `PresenterStateDto` without `RevealState` (backward compat) |
| Backend integration | xUnit + `WebApplicationFactory` | `GET /api/quiz/categories/{id}` response never includes `presenterHint`; `GET /api/quiz/presenter/categories/{id}` response includes `presenterHint` on closed questions; `PresenterHub.UpdateState` with reveal state broadcasts to all clients; late-join mirror receives current reveal state |
| Frontend component | Vitest + @testing-library/react | `ClosedQuestion` renders hint in presenter context and hides hint in mirror context; `MemeQuestion` renders first image + options on load, second image after reveal; `SingingPianos` renders all boxes hidden, reveals individual box on click, leaves others hidden |
| Frontend integration | Vitest + @testing-library/react | `QuestionDetailPage` — reveal action calls hub `UpdateState` with correct reveal state; mirror `MirrorPage` receives `RevealState` from hub and shows correct image/box state |
| E2E | Playwright | Full meme reveal flow: presenter opens meme question → reveal action → mirror shows second image; full singing pianos flow: presenter opens question → clicks boxes one by one → mirror shows each box revealed in sequence; late-join test: connect mirror after partial reveal → mirror loads correct state |

**POST-DESIGN GATE RE-CHECK: PASS** — Design artifacts (data-model.md, contracts/quiz-api.md) confirm all boundaries are explicit, no new cross-layer ambiguity is introduced, and all test paths have a real integration path through `WebApplicationFactory` + SignalR in-process client.

## Project Structure

### Documentation (this feature)

```text
specs/005-question-types-enhancements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── quiz-api.md       # Phase 1 output — REST + SignalR contract updates
└── tasks.md             # Phase 2 output (/speckit.tasks command — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/QuizAppka/
├── Models/
│   ├── Question.cs                     # MODIFIED — add JsonDerivedType for meme + singing-pianos
│   ├── ClosedQuestion.cs               # MODIFIED — add optional PresenterHint property
│   ├── MemeQuestion.cs                 # NEW — entryImage, revealImage, options[]
│   ├── SingingPianosQuestion.cs        # NEW — five PianoBox items each with hidden text
│   ├── PianoBox.cs                     # NEW — id + hiddenText
│   └── PresenterStateDto.cs            # MODIFIED — add optional RevealState field
├── Controllers/
│   └── QuizController.cs               # MODIFIED — add presenter endpoint; strip hints from regular endpoint
└── Data/categories/
    └── sample-category.json            # MODIFIED — add sample data for new question types + hint

src/QuizAppka/ClientApp/src/
├── types/
│   └── quiz.ts                         # MODIFIED — add MemeQuestion, SingingPianosQuestion types; extend ClosedQuestion with optional presenterHint
├── components/
│   ├── ClosedQuestion.tsx              # MODIFIED — optionally render presenterHint when present
│   ├── MemeQuestion.tsx                # NEW — renders image + options; shows reveal button in presenter context; reacts to revealed state
│   ├── SingingPianos.tsx               # NEW — renders 5 boxes; box click reveals hidden text in presenter context; reacts to per-box reveal state
│   └── QuestionDisplay.tsx             # MODIFIED — add cases for meme + singing-pianos
├── pages/
│   └── QuestionDetailPage.tsx          # MODIFIED — pass reveal callbacks + current reveal state to question components; call hub UpdateState on reveal
├── services/
│   ├── quizApi.ts                      # MODIFIED — add fetchPresenterCategory for hint-inclusive responses
│   └── presenterHub.ts                 # unchanged
└── hooks/
    └── usePresenterSession.ts          # unchanged

tests/QuizAppka.Tests/
├── Controllers/
│   └── QuizControllerTests.cs          # MODIFIED — add tests for hint stripping + presenter endpoint
├── Hubs/
│   └── PresenterHubTests.cs            # MODIFIED — add tests for reveal-state broadcast + late-join with reveal state
└── Models/
    └── QuestionSerializationTests.cs   # NEW — round-trip tests for all question types including new discriminators

tests/QuizAppka.E2E/tests/
└── question-types.spec.ts              # NEW — E2E scenarios for meme reveal and singing pianos reveal
```

**Structure Decision**: Web application option (single .NET project with embedded React/Vite ClientApp). The existing question polymorphism, SignalR hub, and session store patterns are extended in-place; no new architectural layers are introduced.

## Complexity Tracking

> No violations — section intentionally empty.


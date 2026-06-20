# Implementation Plan: Timed Open Question

**Branch**: `010-timed-open-question` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-timed-open-question/spec.md`

## Summary

Introduce a new `timed-open` question type that preserves open-question behavior while adding synchronized timer functionality for presenter and mirror views. Timer lifecycle controls (start, pause/resume, reset) are presenter-driven and propagated through the existing SignalR `UpdateState` / `StateUpdated` contract via an extended `RevealState.timerState` payload, while static timer configuration is delivered through existing quiz API category payloads.

## Technical Context

**Language/Version**: C# (.NET 10), TypeScript 5.8.3, React 19.1.0  
**Primary Dependencies**:
- Backend: ASP.NET Core MVC + SignalR (`Microsoft.AspNetCore.SignalR`)
- Frontend: React Router DOM 7.13.2, MUI 7.3.9, `@microsoft/signalr` 10.0.0
- Testing: xUnit 2.9.3 + ASP.NET Core integration testing, Vitest 4.1.1 + Testing Library, Playwright 1.58.2
**Storage**: JSON category files for question configuration; in-memory presenter session store for live mirrored state  
**Testing**:
- Backend: `dotnet test tests/QuizAppka.Tests/QuizAppka.Tests.csproj`
- Frontend: `npm run lint`, `npm run type-check`, `npm run test` from `src/QuizAppka/ClientApp`
- E2E: `npx playwright test tests/question-types.spec.ts tests/mirroring.spec.ts` from `tests/QuizAppka.E2E`
**Target Platform**: Desktop browsers for presenter and mirror clients, ASP.NET Core backend hosting SPA and hub  
**Project Type**: Full-stack web application (single ASP.NET Core app with embedded React client)  
**Performance Goals**: Presenter timer actions are reflected in mirror UI within 1 second (per SC-001)  
**Constraints**: WebSocket SignalR transport only; single active presenter session; no DB persistence for timer state; unchanged behavior for non-timed `open` questions  
**Scale/Scope**: Cross-layer change touching question polymorphism, runtime state contracts, presenter/mirror UI, and automated tests across backend/frontend/E2E layers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Evaluation

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Shared Domain Contracts | PASS | Contract boundaries identified: quiz API question payload (`timed-open`) and SignalR state payload (`revealState.timerState`). |
| II. Quality Gates Are Non-Negotiable | PASS | Gates listed: backend tests, frontend lint/type-check/unit tests, and E2E suites relevant to mirroring/question types. |
| III. Test Strategy Before Merge | PASS | Strategy includes backend model/controller/hub tests, frontend component/page tests, and cross-layer E2E synchronization checks. |
| IV. Frontend-Backend Integration Confidence | PASS | Real presenter-to-mirror SignalR integration path is required and explicitly tested; not mock-only. |
| V. Maintainability Over Cleverness | PASS | Design extends existing `Question` discriminator and `RevealState` pattern instead of introducing a new protocol layer. |

### Post-Design Re-Evaluation

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Shared Domain Contracts | PASS | Contracts documented in `contracts/quiz-api.md` and `contracts/signalr-timer-state.md` with validation and failure behavior. |
| II. Quality Gates Are Non-Negotiable | PASS | `quickstart.md` enumerates backend, frontend, and E2E gate commands. |
| III. Test Strategy Before Merge | PASS | `data-model.md` impact matrix and `tasks.md` define per-story automated tests across layers. |
| IV. Frontend-Backend Integration Confidence | PASS | Late-join and live synchronization behavior covered through hub integration and mirror E2E test tasks. |
| V. Maintainability Over Cleverness | PASS | Timer runtime model is explicit and scoped to existing state envelope with clear lifecycle transitions. |

## Project Structure

### Documentation (this feature)

```text
specs/010-timed-open-question/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── quiz-api.md
│   └── signalr-timer-state.md
└── tasks.md
```

### Source Code (repository root)

```text
src/QuizAppka/
├── Models/
│   ├── Question.cs
│   ├── TimedOpenQuestion.cs
│   ├── RevealState.cs
│   └── QuestionTimerState.cs
├── Services/
│   └── QuizDataService.cs
├── Controllers/
│   └── QuizController.cs
└── Data/categories/
    └── sample-category.json

src/QuizAppka/ClientApp/src/
├── types/
│   ├── quiz.ts
│   └── mirror.ts
├── components/
│   ├── QuestionDisplay.tsx
│   ├── TimedOpenQuestion.tsx
│   └── __tests__/
│       ├── OpenQuestion.test.tsx
│       └── QuestionDisplay.test.tsx
└── pages/
    ├── QuestionDetailPage.tsx
    ├── MirrorPage.tsx
    └── __tests__/
        ├── QuestionDetailPage.test.tsx
        └── MirrorPage.test.tsx

tests/QuizAppka.Tests/
├── Models/QuestionSerializationTests.cs
├── Controllers/QuizControllerTests.cs
└── Hubs/PresenterHubTests.cs

tests/QuizAppka.E2E/tests/
├── question-types.spec.ts
└── mirroring.spec.ts
```

**Structure Decision**: Use existing single-project backend + embedded SPA architecture and extend current question and mirrored state patterns. This keeps changes local, understandable, and compatible with existing test and deployment workflows.

## Complexity Tracking

No constitution violations identified. No complexity exceptions required.

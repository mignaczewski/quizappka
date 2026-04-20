# Implementation Plan: Category List Navigation Access

**Branch**: `004-category-list-navigation` | **Date**: 2026-04-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-category-list-navigation/spec.md`

## Summary

Add a "Back to categories" navigation button to two existing presenter screens: the question list page and the question detail page. The route `/` (category list / `HomePage`) already exists. No backend changes are required. The implementation is two minor UI additions in existing page components plus corresponding test coverage.

## Technical Context

**Language/Version**: C# / .NET 10 (backend — unchanged), TypeScript 5.8 / React 19 (frontend)  
**Primary Dependencies**: ASP.NET Core 10 (unchanged), React 19, MUI 7, React Router DOM 7, Vite 6, Vitest 4 + Testing Library  
**Storage**: N/A — no data model changes; read-only JSON category data unchanged  
**Testing**: Vitest + React Testing Library (frontend component tests); xUnit (backend — no changes required)  
**Target Platform**: Desktop browser (same as existing presenter view)  
**Project Type**: Web application — React SPA served by ASP.NET Core 10  
**Performance Goals**: N/A — button render is instantaneous; no performance implications  
**Constraints**: No backend API contract changes; existing tests must remain passing; navigation must use React Router (no hard browser navigation)  
**Scale/Scope**: 2 page components modified (`QuestionListPage`, `QuestionDetailPage`), 2 test files updated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Contract scope**: The existing backend API (`GET /api/quiz/categories`, `GET /api/quiz/categories/{id}`) is unchanged. The frontend route `/` is already registered in `App.tsx`. No new endpoints or contract changes are introduced. The existing `contracts/quiz-api.md` from feature 001 remains valid.
- **Quality gates**: Frontend — ESLint, TypeScript strict type checks (`tsc --noEmit`), Vitest component tests. Backend — no changes; xUnit tests pass unchanged. Both suites must be green before merge.
- **Test strategy defined**: Component tests added to `QuestionListPage.test.tsx` and `QuestionDetailPage.test.tsx` verifying button presence and navigation trigger on each screen. Tests are defined before implementation (see research.md).
- **Cross-layer integration**: Feature is frontend-only; no new cross-layer boundary is introduced. The existing `/` route already serves `HomePage` (category list) and requires no backend wiring.
- **Complexity exceptions**: None. No new components, routes, hooks, or patterns are introduced.

**GATE RESULT: PASS — no constitution violations, no unjustified complexity.**

## Project Structure

### Documentation (this feature)

```text
specs/004-category-list-navigation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (no entity changes — confirms N/A)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
└── QuizAppka/
    └── ClientApp/
        └── src/
            └── pages/
                ├── QuestionListPage.tsx   # MODIFIED: add "Back to categories" button
                └── QuestionDetailPage.tsx # MODIFIED: add "Back to categories" button

tests/
└── QuizAppka.E2E/
    └── tests/
        └── (no E2E test changes required; component tests are sufficient)

src/
└── QuizAppka/
    └── ClientApp/
        └── src/
            └── pages/
                └── __tests__/
                    ├── QuestionListPage.test.tsx   # MODIFIED: add button presence + navigation tests
                    └── QuestionDetailPage.test.tsx # MODIFIED: add button presence + navigation tests
```

**Structure Decision**: Web application option. Backend unchanged. All changes are confined to two page components and their test files. No new components, routes, hooks, services, or backend files are created.

## Complexity Tracking

> No violations — section intentionally empty.

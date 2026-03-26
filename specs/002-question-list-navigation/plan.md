# Implementation Plan: Question List Navigation

**Branch**: `002-question-list-navigation` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-question-list-navigation/spec.md`

## Summary

Replace the current linear next/previous question navigation with a two-level flow: selecting a category opens a question list, and the presenter opens individual questions from that list with a back action to return. The change is frontend-only. No backend API changes are required. Additionally, upgrade the Aspire host from version 9 to version 13, and improve the UI layout to target desktop browser viewports rather than mobile.

## Technical Context

**Language/Version**: C# / .NET 10 (backend), TypeScript 5.8 / React 19 (frontend)  
**Primary Dependencies**: ASP.NET Core 10, React 19, MUI 7.3, React Router DOM 7.13, Vite 6.3  
**Storage**: JSON files (read-only category data loaded at startup, no runtime persistence)  
**Testing**: xUnit 2.9 (backend unit), Vitest 4.1 + Testing Library (frontend component), Playwright 1.58 (E2E)  
**Target Platform**: Desktop browser (Chromium; UI layout must suit widescreen viewports — the current mobile-oriented layout must be corrected)  
**Project Type**: Web application — React SPA served by ASP.NET Core 10  
**Performance Goals**: Question list renders and becomes interactive in under 1 second after category selection  
**Constraints**: No changes to the existing backend API contract; existing unit and integration tests must remain passing; Aspire host must be upgraded to version 13  
**Scale/Scope**: Small question sets per category (expected tens of questions); single concurrent presenter session

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Contract scope**: The existing backend API (`GET /api/quiz/categories`, `GET /api/quiz/categories/{id}`) is unchanged. Frontend consumes the same contract. No new endpoints are introduced. The quiz-api contract document is updated to reflect confirmed-unchanged status.
- **Quality gates**: Frontend — ESLint, TypeScript strict type checks, Vitest component tests, Playwright E2E tests. Backend — no changes, xUnit tests continue to run unchanged.
- **Test strategy defined**: Component tests for `QuestionListPage`, `QuestionDetailPage`, and updated routes. E2E tests for the full presenter flow: category selection → list → open question → back to list. Tests are defined before implementation begins (see research.md and quickstart.md).
- **Cross-layer integration**: This feature is frontend-only routing and UI. No new cross-layer boundary is introduced. Existing integration between frontend and backend API is preserved identically.
- **Complexity exceptions**: None. The Aspire 13 upgrade is a dependency bump with no architectural deviation.

**GATE RESULT: PASS — no constitution violations, no unjustified complexity.**

## Project Structure

### Documentation (this feature)

```text
specs/002-question-list-navigation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── quiz-api.md      # Phase 1 output (confirmed unchanged)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
└── QuizAppka/
    ├── QuizAppka.AppHost/
    │   └── QuizAppka.AppHost.csproj      # MODIFIED: Aspire 9 → 13 version bump
    ├── ClientApp/
    │   └── src/
    │       ├── App.tsx                   # MODIFIED: route table updated
    │       ├── App.css                   # MODIFIED: desktop layout overrides
    │       ├── index.css                 # MODIFIED: desktop layout baseline
    │       ├── components/
    │       │   ├── QuestionList.tsx      # NEW: renders list of questions for a category
    │       │   ├── CategoryList.tsx      # UNCHANGED
    │       │   ├── QuestionDisplay.tsx   # UNCHANGED
    │       │   ├── ClosedQuestion.tsx    # UNCHANGED
    │       │   ├── OpenQuestion.tsx      # UNCHANGED
    │       │   ├── ImageRebusQuestion.tsx # UNCHANGED
    │       │   └── NavigationBar.tsx     # REMOVED (replaced by list-based flow)
    │       └── pages/
    │           ├── HomePage.tsx          # UNCHANGED
    │           ├── QuestionListPage.tsx  # NEW: replaces QuizPage (question list view)
    │           └── QuestionDetailPage.tsx # NEW: individual question with back action
    │           # QuizPage.tsx            # DELETED (replaced by the two new pages)
    └── ... (all other backend files unchanged)

tests/
├── QuizAppka.E2E/
│   └── tests/
│       ├── category-selection.spec.ts    # MODIFIED: updated assertions for new flow
│       └── navigation.spec.ts            # MODIFIED: rewritten for list-based navigation
└── QuizAppka.Tests/
    └── (no changes required)
```

**Structure Decision**: Web application option. Backend is unchanged. Frontend uses flat React Router routes for the two new pages. The `QuizPage` is deleted and its responsibilities split into `QuestionListPage` (shows list) and `QuestionDetailPage` (shows single question with back navigation).

## Complexity Tracking

> No violations — section intentionally empty.

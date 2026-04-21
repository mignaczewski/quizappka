# Tasks: Open Question Presenter Hint

**Input**: Design documents from `/specs/006-open-question-presenter-hint/`
**Feature Branch**: `006-open-question-presenter-hint`
**Date**: 2026-04-21
**Prerequisites**: plan.md ✓ | spec.md ✓ | research.md ✓ | data-model.md ✓ | contracts/quiz-api.md ✓ | quickstart.md ✓

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no mutual dependencies)
- **[Story]**: Which user story this task belongs to (US1)
- All file paths are relative to the repository root

---

## Phase 1: Setup

**Purpose**: Confirm baseline state is stable before any change is made

- [ ] T001 Verify baseline build and tests pass: run `dotnet build` and `dotnet test` in repository root, and `npm test` in `src/QuizAppka/ClientApp/`

---

## Phase 3: User Story 1 — Open Question with Presenter-Only Hint (Priority: P1) 🎯 MVP

**Goal**: Add an optional `presenterHint` field to open questions so the presenter sees private text or a URL alongside the question prompt. The hint is absent from all mirror/audience-facing views. Behavior is identical to the existing hint on closed questions.

**Independent Test**: Load an open question with a `presenterHint` value via the presenter API endpoint, confirm the hint is present in the response and rendered in the presenter view; call the public endpoint for the same question and confirm `presenterHint` is absent from the response JSON entirely.

### Tests for User Story 1

> **Define and write these tests before implementation so they fail for the expected reason first.**

- [ ] T002 [P] [US1] Write failing backend integration tests: assert public endpoint strips presenterHint and presenter endpoint includes presenterHint for OpenQuestion in `tests/QuizAppka.Tests/Controllers/QuizControllerTests.cs`
- [ ] T003 [P] [US1] Write failing frontend component tests for OpenQuestion: hint absent when not set, plain-text hint renders with `data-testid="presenter-hint"`, https:// hint renders as `<Link>`, http:// hint renders as `<Link>` in `src/QuizAppka/ClientApp/src/components/__tests__/OpenQuestion.test.tsx`

### Implementation for User Story 1

- [ ] T004 [P] [US1] Add `PresenterHint` property with `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]` to `OpenQuestion` class in `src/QuizAppka/Models/OpenQuestion.cs`
- [ ] T005 [P] [US1] Add `presenterHint?: string` optional field to the `OpenQuestion` TypeScript interface in `src/QuizAppka/ClientApp/src/types/quiz.ts`
- [ ] T006 [US1] Extend `StripPresenterData` in `QuizController` to null-out `PresenterHint` on `OpenQuestion` (pattern-match alongside existing `ClosedQuestion` arm) in `src/QuizAppka/Controllers/QuizController.cs`
- [ ] T007 [US1] Update `OpenQuestion` component to render `presenterHint` — plain text as `<Typography data-testid="presenter-hint">` and URL (starts with `https://` or `http://`) as a `<Link target="_blank" rel="noopener noreferrer">` — mirroring `ClosedQuestion.tsx` exactly, in `src/QuizAppka/ClientApp/src/components/OpenQuestion.tsx`

**Checkpoint**: At this point US1 is fully functional. Run `dotnet test` and `npm test` — all tests added in T002 and T003 must now pass.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T008 Run full test suite (`dotnet test` + `npm run lint` + `npm test`) and confirm all checks pass with zero failures or lint errors

---

## Dependencies

```
T001 → (all other tasks require baseline to pass)
T002 independent of T003, T004, T005 (different files)
T003 independent of T002, T004, T005 (different files)
T004 → T006  (controller extension references the model)
T005 → T007  (component update references the TypeScript interface)
T006 independent of T007 (different files, different dependency chains)
T007 independent of T006 (different files, different dependency chains)
T006, T007 → T008
```

## Parallel Execution Examples

**Fastest path (two tracks after T001):**

```
Track A (backend):  T001 → T002 → T004 → T006 → T008
Track B (frontend): T001 → T003 → T005 → T007 → T008
```

Within Track A, T002 and T004 are in different files and can be worked simultaneously.
Within Track B, T003 and T005 are in different files and can be worked simultaneously.

## Implementation Strategy

**MVP scope**: This feature has a single user story (US1). The entire feature is the MVP.

**Recommended order for a single developer**:
1. T001 — confirm baseline
2. T002 + T004 together — add the backend test stubs and the model property so tests compile but fail
3. T006 — extend the controller; backend tests should now pass
4. T003 + T005 together — add frontend test cases and the TypeScript type change
5. T007 — update the component; frontend tests should now pass
6. T008 — final sweep

**Total task count**: 8  
**Tasks for User Story 1**: 6 (T002–T007)  
**Parallelizable tasks**: T002, T003, T004, T005 are all independently parallelizable  
**Independent test criteria**: US1 verifiable via `dotnet test` (2 new integration tests) + `npm test` (4 new component tests)  
**Suggested MVP scope**: All tasks — the feature is a single story and is already minimal

# Tasks: Question Title Field and Universal Presenter Hint

**Input**: Design documents from `specs/009-question-title-universal-hint/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/quiz-api.md ✅, quickstart.md ✅

**Tests**: Required — both stories change behaviour and alter frontend-backend contracts.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths are included in all descriptions

---

## Phase 1: Setup

**Purpose**: No new project setup needed — all changes are within the existing `QuizAppka` project and `QuizAppka.Tests` test project. This phase confirms the working branch.

- [X] T001 Confirm working branch is `009-question-title-universal-hint` and existing tests pass (`dotnet test tests/QuizAppka.Tests/` and `npm run test` in `src/QuizAppka/ClientApp/`)

**Checkpoint**: Green baseline — all existing tests pass before any changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TypeScript contract update that both user stories depend on. US1 needs `title?: string` on `BaseQuestion`; US2 needs `presenterHint?: string` on `MemeQuestion` and `SingingPianosQuestion`. These type changes must land first so component work in both stories is type-safe from the start.

**⚠️ CRITICAL**: No user story component work can begin until T002 is complete.

- [X] T002 Update `src/QuizAppka/ClientApp/src/types/quiz.ts`: add `title?: string` to `BaseQuestion`; add `presenterHint?: string` to `MemeQuestion`; add `presenterHint?: string` to `SingingPianosQuestion` (per `contracts/quiz-api.md` TypeScript Client Types Reference)

**Checkpoint**: TypeScript types updated — US1 and US2 component work can now begin in parallel.

---

## Phase 3: User Story 1 — Question List Shows Titles Instead of Full Content (Priority: P1) 🎯 MVP

**Goal**: The question list displays a concise `title` for each question (when defined), falling back to `prompt` then a type-label constant. Full question body content is never shown in the list.

**Independent Test**: Load a category whose questions mix titled and untitled entries across question types; confirm the list shows titles or fallbacks with no full body content visible and no blank entries.

### Tests for User Story 1 ⚠️

> Define and write these tests before implementation. Verify they fail for the expected reason before coding where practical.

- [X] T003 [P] [US1] Backend — extend `tests/QuizAppka.Tests/Models/QuestionSerializationTests.cs`: add round-trip tests confirming `Title` is serialized when non-null and absent from JSON when null, covering at least `OpenQuestion`, `ClosedQuestion`, `MemeQuestion`, `SingingPianosQuestion`, and `ImageRebusQuestion`
- [X] T004 [P] [US1] Frontend — create `src/QuizAppka/ClientApp/src/components/__tests__/QuestionList.test.tsx`: tests for (a) renders `title` when defined and does NOT render full `prompt`, (b) renders `prompt` when `title` is absent, (c) renders type-label constant when both `title` and `prompt` are empty/absent, (d) long title is rendered (CSS truncation — verify element text is present, not clipped by JS)

### Implementation for User Story 1

- [X] T005 [US1] Add `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? Title { get; init; }` to the abstract `Question` class in `src/QuizAppka/Models/Question.cs`
- [X] T006 [P] [US1] Fix `StripPresenterData` in `src/QuizAppka/Controllers/QuizController.cs`: add `Title = closed.Title` to the existing `ClosedQuestion` reconstruction arm; add `Title = open.Title` to the existing `OpenQuestion` reconstruction arm (correctness fix — title must survive stripping)
- [X] T007 [P] [US1] Replace `question.prompt` with a `getQuestionLabel(question)` helper in `src/QuizAppka/ClientApp/src/components/QuestionList.tsx`: helper returns `question.title` (if non-empty) → `question.prompt` (if non-empty) → type-label switch (`'meme'` → `'Meme Question'`, `'singing-pianos'` → `'Singing Pianos'`, `'image-rebus'` → `'Image Rebus'`, default → `question.type`)
- [X] T008 [P] [US1] Update `src/QuizAppka/Data/categories/sample-category.json`: add `"title"` fields to existing question entries to demonstrate the feature and exercise it manually

**Checkpoint**: US1 complete and independently testable. `dotnet test` passes. `npm run test` passes (including `QuestionList.test.tsx`). Question list shows titles in the running app.

---

## Phase 4: User Story 2 — Presenter Hint on All Question Types (Priority: P2)

**Goal**: `MemeQuestion` and `SingingPianosQuestion` gain an optional `presenterHint` field visible only in presenter view. The public API route never returns the field. Mirror view never renders it.

**Independent Test**: Load a meme question and a singing pianos question each with `presenterHint` defined in the JSON data file. In the presenter view, confirm the hint text (or clickable URL) is visible. Open a mirror view for the same question and confirm no hint is visible. Repeat with hint absent — no placeholder appears.

### Tests for User Story 2 ⚠️

> Define and write these tests before implementation. Verify they fail for the expected reason before coding where practical.

- [X] T009 [P] [US2] Backend — extend `tests/QuizAppka.Tests/Models/QuestionSerializationTests.cs`: add tests for `MemeQuestion` with `PresenterHint` (serializes and deserializes correctly) and without (hint absent from JSON); same for `SingingPianosQuestion`
- [X] T010 [P] [US2] Backend — extend `tests/QuizAppka.Tests/Controllers/QuizControllerTests.cs`: add tests for `StripPresenterData` with a `MemeQuestion` that has `PresenterHint` set (hint removed, all other fields including `Title` preserved); `MemeQuestion` without hint passes through unchanged; same for `SingingPianosQuestion`; also add regression tests for the Title-preservation fix: `ClosedQuestion` with both `Title` and `PresenterHint` set — verify stripped instance has `Title` and no `PresenterHint`; same for `OpenQuestion`
- [X] T011 [P] [US2] Frontend — extend `src/QuizAppka/ClientApp/src/components/__tests__/MemeQuestion.test.tsx`: add tests for (a) hint plain text visible when `displayMode` is default/presenter and hint is defined, (b) hint rendered as `<a>` link when hint is a URL, (c) hint absent when `displayMode='mirror'`, (d) no hint element when `presenterHint` is undefined
- [X] T012 [P] [US2] Frontend — extend `src/QuizAppka/ClientApp/src/components/__tests__/SingingPianos.test.tsx`: same four test cases as T011 for `SingingPianos` component

### Implementation for User Story 2

- [X] T013 [P] [US2] Add `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? PresenterHint { get; init; }` to `src/QuizAppka/Models/MemeQuestion.cs`
- [X] T014 [P] [US2] Add `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? PresenterHint { get; init; }` to `src/QuizAppka/Models/SingingPianosQuestion.cs`
- [X] T015 [US2] Extend `StripPresenterData` in `src/QuizAppka/Controllers/QuizController.cs`: add `MemeQuestion meme when meme.PresenterHint is not null` arm (reconstructs without hint, copies `Id`, `Prompt`, `Title`, `EntryImage`, `RevealImage`, `Options`); add `SingingPianosQuestion piano when piano.PresenterHint is not null` arm (reconstructs without hint, copies `Id`, `Prompt`, `Title`, `Boxes`) — depends on T006 being merged (Title fix) and T013, T014
- [X] T016 [P] [US2] Add presenter hint rendering to `src/QuizAppka/ClientApp/src/components/MemeQuestion.tsx`: render `<Typography data-testid="presenter-hint">` block (with `isUrl` check for link rendering) only when `displayMode !== 'mirror' && question.presenterHint` — follow exact pattern from `src/QuizAppka/ClientApp/src/components/ClosedQuestion.tsx`
- [X] T017 [P] [US2] Add presenter hint rendering to `src/QuizAppka/ClientApp/src/components/SingingPianos.tsx`: same hint block as T016, placed after the boxes grid
- [X] T018 [P] [US2] Update `src/QuizAppka/Data/categories/sample-category.json`: add `"presenterHint"` fields to at least one meme question and one singing-pianos question to exercise the feature manually

**Checkpoint**: US2 complete and independently testable. `dotnet test` passes. `npm run test` passes (all new and extended tests). In presenter view, hints visible for meme and singing-pianos. In mirror view, hints absent.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Goal**: Final validation pass across both stories and quality gate confirmation.

- [X] T019 [P] Run `npm run lint` in `src/QuizAppka/ClientApp/` — resolve any lint errors in all modified files (`quiz.ts`, `QuestionList.tsx`, `MemeQuestion.tsx`, `SingingPianos.tsx`, new test files)
- [X] T020 [P] Run `npm run build` in `src/QuizAppka/ClientApp/` — confirm TypeScript compilation is clean with no type errors
- [X] T021 Full regression: run `dotnet test tests/QuizAppka.Tests/` — all tests green; run `npm run test` in `src/QuizAppka/ClientApp/` — all tests green

---

## Dependencies

```
T001 (baseline green)
  └─ T002 (TypeScript types — shared foundation)
       ├─ T003 (BE serialization tests — US1)
       │    └─ T005 (Question.cs Title property)
       │         └─ T006 (StripPresenterData Title fix) ─────────────────────────────────┐
       ├─ T004 (FE QuestionList tests — US1)                                              │
       │    └─ T007 (QuestionList.tsx getQuestionLabel helper)                            │
       ├─ T008 (sample-category.json title fields — US1)                                  │
       ├─ T009 (BE hint serialization tests — US2)                                        │
       │    └─ T013 (MemeQuestion.cs PresenterHint)                                       │
       │    └─ T014 (SingingPianosQuestion.cs PresenterHint)                              │
       │         └─ T010 (BE StripPresenterData tests — US2)                              │
       │              └─ T015 (StripPresenterData new arms) ◄──── depends on T006 too ───┘
       ├─ T011 (FE MemeQuestion hint tests — US2)
       │    └─ T016 (MemeQuestion.tsx hint block)
       └─ T012 (FE SingingPianos hint tests — US2)
            └─ T017 (SingingPianos.tsx hint block)
                     T018 (sample-category.json hint fields — US2)
T019, T020 (lint + build — after all component changes)
T021 (final regression — after all above)
```

---

## Parallel Execution Examples

### US1 and US2 in parallel (after T002)

| Track A (US1) | Track B (US2) |
|---------------|---------------|
| T003 (BE title serialization tests) | T009 (BE hint serialization tests) |
| T005 (Question.cs Title property) | T013 (MemeQuestion.cs PresenterHint) |
| T006 (StripPresenterData Title fix) | T014 (SingingPianosQuestion.cs PresenterHint) |
| T004 (FE QuestionList tests) | T010 (BE StripPresenterData tests) |
| T007 (QuestionList.tsx helper) | T011 (FE MemeQuestion hint tests) |
| T008 (sample JSON titles) | T012 (FE SingingPianos hint tests) |
|  | T016 (MemeQuestion.tsx hint block) |
|  | T017 (SingingPianos.tsx hint block) |
|  | T018 (sample JSON hints) |

**Note**: T015 (`StripPresenterData` new arms) depends on both T006 (Track A) and T013+T014 (Track B) — merge both tracks before implementing T015.

---

## Implementation Strategy

**MVP scope**: User Story 1 alone (T001–T008) delivers immediate, visible improvement — the question list becomes navigable by title for all question types. US2 is independent and can ship in the same PR or separately.

**Suggested merge order**:
1. T001 (green baseline)
2. T002 (TypeScript types — unblocks both tracks)
3. T003–T008 in parallel (US1 complete)
4. T009–T018 in parallel where possible (US2 complete)
5. T015 after T006, T013, T014
6. T019–T021 (quality gates)

---

## Format Validation

All tasks follow the required checklist format:
- ✅ Start with `- [ ]`
- ✅ Sequential Task ID (T001–T021)
- ✅ `[P]` marker present on parallelizable tasks
- ✅ `[US1]` / `[US2]` label on all user story phase tasks
- ✅ Exact file paths in all descriptions
- ✅ Setup and foundational tasks have no story label

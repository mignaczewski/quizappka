---
description: "Task list for Question Types Enhancements"
---

# Tasks: Question Types Enhancements

**Input**: Design documents from `/specs/005-question-types-enhancements/`
**Branch**: `005-question-types-enhancements`
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Data Model**: [data-model.md](data-model.md) | **Contract**: [contracts/quiz-api.md](contracts/quiz-api.md)

**Tests**: Required — all three stories alter behavior and/or frontend-backend contracts.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend backend models and TypeScript types that all three stories depend on. No story work can begin until this phase is complete.

- [ ] T001 Add `[JsonDerivedType(typeof(MemeQuestion), "meme")]` and `[JsonDerivedType(typeof(SingingPianosQuestion), "singing-pianos")]` registrations to `src/QuizAppka/Models/Question.cs`
- [ ] T002 [P] Create `src/QuizAppka/Models/MemeQuestion.cs` with `EntryImage`, `RevealImage?`, and `Options` properties
- [ ] T003 [P] Create `src/QuizAppka/Models/SingingPianosQuestion.cs` with `Boxes` property
- [ ] T004 [P] Create `src/QuizAppka/Models/PianoBox.cs` with `Id` and `HiddenText` properties
- [ ] T005 [P] Create `src/QuizAppka/Models/RevealState.cs` with optional `MemeImageRevealed` and `SingingPianosBoxesRevealed` properties
- [ ] T006 Extend `src/QuizAppka/Models/PresenterStateDto.cs` with optional `RevealState? RevealState` field (depends on T005)
- [ ] T007 [P] Add `MemeQuestion`, `SingingPianosQuestion`, `PianoBox`, `RevealState`, and `StateUpdatedPayload` TypeScript interfaces to `src/QuizAppka/ClientApp/src/types/quiz.ts`; extend `ClosedQuestion` with optional `presenterHint`; extend the `Question` union type
- [ ] T008 [P] Add sample `meme`, `singing-pianos`, and `closed` (with hint) question entries to `src/QuizAppka/Data/categories/sample-category.json`

**Checkpoint**: Backend models compile; TypeScript types are valid with `npm run type-check`; new JSON data loads without error.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the API layer and `QuizDataService` so that new question types are served correctly and the hint-isolation boundary is established. All stories need the API to be working before their frontend work can be completed end-to-end.

- [ ] T009 Modify `src/QuizAppka/Controllers/QuizController.cs`: ensure the regular `GET /api/quiz/categories/{id}` response DTO never includes `presenterHint` on closed questions (strip via projection)
- [ ] T010 Add `GET /api/quiz/presenter/categories/{id}` endpoint to `src/QuizAppka/Controllers/QuizController.cs` that returns the full question data including `presenterHint` on closed questions (depends on T006)
- [ ] T011 [P] Add `fetchPresenterCategory(id)` function to `src/QuizAppka/ClientApp/src/services/quizApi.ts` that calls the new presenter endpoint

**Checkpoint**: `dotnet build` succeeds; both REST endpoints respond to manual requests; `presenterHint` absent from public endpoint, present in presenter endpoint.

---

## Phase 3: User Story 1 — Closed Question with Presenter-Only Hint (Priority: P1) 🎯 MVP

**Goal**: Presenter sees an optional hint (text or clickable URL) on closed questions; mirror sees nothing.

**Independent Test**: Load a closed question with `presenterHint` set. In presenter view, hint is visible. In mirror view (`/mirror`), hint is completely absent.

### Tests for User Story 1

- [ ] T012 [P] [US1] Add xUnit tests to `tests/QuizAppka.Tests/Controllers/QuizControllerTests.cs`: assert `GET /api/quiz/categories/{id}` response body does NOT contain `presenterHint` for a closed question that has one defined; assert `GET /api/quiz/presenter/categories/{id}` response body DOES contain it
- [ ] T013 [P] [US1] Add xUnit serialization tests to `tests/QuizAppka.Tests/Models/QuestionSerializationTests.cs`: round-trip `ClosedQuestion` with and without `PresenterHint`; confirm backward compat (no hint field in JSON → `PresenterHint` is null)
- [ ] T014 [P] [US1] Add Vitest component tests in `src/QuizAppka/ClientApp/src/components/__tests__/ClosedQuestion.test.tsx`: (a) when `presenterHint` is set on the question prop, hint text is rendered; (b) when `presenterHint` is absent, no hint element is rendered; (c) when hint looks like a URL, it renders as an `<a>` link

### Implementation for User Story 1

- [ ] T015 Add optional `PresenterHint` property to `src/QuizAppka/Models/ClosedQuestion.cs` (depends on T001 being merged; can be done in same commit)
- [ ] T016 [US1] Modify `src/QuizAppka/Components/__tests__/../components/ClosedQuestion.tsx`: accept optional `presenterHint` from the question prop and render it below the options list when non-empty; render as `<a>` link when the value starts with `http://` or `https://`; render nothing when absent (depends on T007, T014)
- [ ] T017 [US1] Modify `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`: switch from `fetchCategory` to `fetchPresenterCategory` for the question detail fetch so that `presenterHint` data is available in the presenter view (depends on T011)

**Checkpoint**: User Story 1 fully functional. `npm run test` green for T014. `dotnet test` green for T012 and T013. Manual: hint visible in presenter view, absent in mirror view.

---

## Phase 4: User Story 2 — Meme Question with Image Reveal (Priority: P2)

**Goal**: Presenter sees first image + answers, can reveal second image; all connected mirrors update simultaneously; late-joining mirrors see current state.

**Independent Test**: Load a meme question. Presenter view shows entry image and answer list. Click "Reveal Image". Entry image is replaced by reveal image in presenter view and all open mirror tabs. Navigate away and back — question resets to entry image.

### Tests for User Story 2

- [ ] T018 [P] [US2] Add xUnit serialization tests to `tests/QuizAppka.Tests/Models/QuestionSerializationTests.cs`: `MemeQuestion` round-trip with both images; `MemeQuestion` with `revealImage` absent; `PresenterStateDto` round-trip with `RevealState.MemeImageRevealed = true`; backward compat (`revealState` absent in payload → `null`)
- [ ] T019 [P] [US2] Add Vitest component tests in `src/QuizAppka/ClientApp/src/components/__tests__/MemeQuestion.test.tsx`: (a) entry image and options rendered; reveal image not in DOM; (b) when `isRevealed=true` prop, reveal image shown and entry image absent; (c) reveal button present when `revealImage` defined and `onReveal` callback provided; reveal button absent when `revealImage` is undefined; (d) clicking reveal button calls `onReveal` callback
- [ ] T020 [P] [US2] Add xUnit hub integration tests to `tests/QuizAppka.Tests/Hubs/PresenterHubTests.cs`: `UpdateState` with `RevealState { MemeImageRevealed: true }` is stored and broadcast to all connected clients; late-joining client receives state with `MemeImageRevealed: true`
- [ ] T021 [P] [US2] Add Playwright E2E test to `tests/QuizAppka.E2E/tests/question-types.spec.ts`: presenter opens meme question → entry image visible → click reveal → reveal image visible in presenter + mirror tab; late-join mirror after reveal shows reveal image

### Implementation for User Story 2

- [ ] T022 [US2] Create `src/QuizAppka/ClientApp/src/components/MemeQuestion.tsx`: accepts `question: MemeQuestion`, `isRevealed: boolean`, and `onReveal?: () => void` props; renders entry or reveal image per `isRevealed`; renders answer options list; renders "Reveal Image" MUI button when `revealImage` defined and `onReveal` provided (depends on T007, T019)
- [ ] T023 [US2] Modify `src/QuizAppka/ClientApp/src/components/QuestionDisplay.tsx`: add `case 'meme'` that renders `<MemeQuestion>` with `isRevealed` and `onReveal` props forwarded from parent (depends on T022)
- [ ] T024 [US2] Modify `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`: add local `revealState` React state; on meme reveal, invoke hub `UpdateState` with `revealState: { memeImageRevealed: true }`; pass `isRevealed` and `onReveal` down to `QuestionDisplay`; reset `revealState` to `null` in `usePresenterSession` mount call (depends on T006, T022, T023)
- [ ] T025 [US2] Modify `src/QuizAppka/ClientApp/src/pages/MirrorPage.tsx`: destructure `revealState` from the `StateUpdated` SignalR payload; pass `isRevealed` and a no-op `onReveal` (mirror can't trigger reveals) down through `QuestionDisplay` to `MemeQuestion` (depends on T007, T022, T023)

**Checkpoint**: User Story 2 fully functional. `npm run test` green for T019. `dotnet test` green for T018 and T020. E2E test T021 green. Manual: full reveal flow in presenter + mirror as specified.

---

## Phase 5: User Story 3 — Singing Pianos Question with Box Reveals (Priority: P3)

**Goal**: Presenter sees five hidden boxes and can reveal each independently by clicking; all mirror views update per-box in real time; late-joining mirrors receive current per-box reveal state.

**Independent Test**: Load a singing pianos question. All five boxes concealed. Click box 1 → box 1 text visible in presenter + mirror; boxes 2–5 still hidden. Continue clicking. Navigate away and back — all boxes reset.

### Tests for User Story 3

- [ ] T026 [P] [US3] Add xUnit serialization tests to `tests/QuizAppka.Tests/Models/QuestionSerializationTests.cs`: `SingingPianosQuestion` round-trip with 5 boxes; `PresenterStateDto` round-trip with `RevealState.SingingPianosBoxesRevealed = [true, false, true, false, false]`; 4-box edge case (fewer than 5 — deserializes without error)
- [ ] T027 [P] [US3] Add Vitest component tests in `src/QuizAppka/ClientApp/src/components/__tests__/SingingPianos.test.tsx`: (a) all 5 boxes render in hidden state on initial render; (b) clicking box N calls `onBoxReveal(n)` callback; (c) when `revealedBoxes[N]=true`, box N shows its hidden text; (d) clicking an already-revealed box does not fire callback; (e) when fewer than 5 boxes defined, missing slots render as disabled; (f) rendered without `onBoxReveal` (mirror mode) — boxes with `revealed=true` show text, clicking has no effect
- [ ] T028 [P] [US3] Add xUnit hub integration tests to `tests/QuizAppka.Tests/Hubs/PresenterHubTests.cs`: `UpdateState` with `SingingPianosBoxesRevealed = [true, false, false, false, false]` stored and broadcast; each subsequent box reveal updates all clients; late-joining mirror receives full current `SingingPianosBoxesRevealed` array
- [ ] T029 [P] [US3] Add Playwright E2E test to `tests/QuizAppka.E2E/tests/question-types.spec.ts`: presenter opens singing pianos question → boxes hidden → reveal box 1 → box 1 visible in mirror, box 2–5 hidden → reveal box 3 → box 3 visible in mirror → late-join mirror sees boxes 1 and 3 revealed

### Implementation for User Story 3

- [ ] T030 [US3] Create `src/QuizAppka/ClientApp/src/components/SingingPianos.tsx`: accepts `question: SingingPianosQuestion`, `revealedBoxes: boolean[]`, and `onBoxReveal?: (index: number) => void` props; renders exactly 5 MUI card/box elements; each hidden box shows a placeholder; each revealed box shows `hiddenText`; missing boxes rendered as disabled; clicking unrevealed box calls `onBoxReveal(index)` (depends on T007, T027)
- [ ] T031 [US3] Modify `src/QuizAppka/ClientApp/src/components/QuestionDisplay.tsx`: add `case 'singing-pianos'` that renders `<SingingPianos>` with `revealedBoxes` and `onBoxReveal` props forwarded from parent (depends on T030)
- [ ] T032 [US3] Modify `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`: extend `revealState` handling to support `singingPianosBoxesRevealed`; on box click, invoke hub `UpdateState` with updated `bool[]`; pass `revealedBoxes` and `onBoxReveal` down to `QuestionDisplay` (depends on T006, T030, T031)
- [ ] T033 [US3] Modify `src/QuizAppka/ClientApp/src/pages/MirrorPage.tsx`: pass `revealedBoxes` from `revealState.singingPianosBoxesRevealed` and a no-op `onBoxReveal` down through `QuestionDisplay` to `SingingPianos` (depends on T007, T030, T031)

**Checkpoint**: User Story 3 fully functional. `npm run test` green for T027. `dotnet test` green for T026 and T028. E2E test T029 green. Manual: per-box reveal syncs to all mirrors; late-join mirror shows correct partial reveal state.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, sample data completeness, and quality gate confirmation.

- [ ] T034 [P] Run full backend quality gate: `dotnet test tests/QuizAppka.Tests/QuizAppka.Tests.csproj` — all tests green
- [ ] T035 [P] Run full frontend quality gate: `npm run lint && npm run type-check && npm run test` from `src/QuizAppka/ClientApp` — all checks green
- [ ] T036 [P] Run E2E suite: `npx playwright test` from `tests/QuizAppka.E2E` — all scenarios green
- [ ] T037 Verify sample-category.json contains valid entries for all three new/modified question types and that the app loads without errors
- [ ] T038 Manual verification pass per quickstart.md: hint visible in presenter view and absent in mirror; meme reveal flow; singing pianos box reveal flow; navigation reset for both question types

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately; T002, T003, T004, T005, T007, T008 are fully parallel
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — blocks stories needing API
- **Phase 3 (US1)**: Depends on Phase 2. Independent of US2 and US3.
- **Phase 4 (US2)**: Depends on Phase 2. Independent of US1 and US3.
- **Phase 5 (US3)**: Depends on Phase 2. Independent of US1 and US2.
- **Phase 6 (Polish)**: Depends on all desired stories being complete.

### User Story Dependencies

| Story | Depends On | Independently Testable? |
|-------|------------|------------------------|
| US1 — Closed hint | Phase 2 complete | Yes — uses existing `ClosedQuestion` infrastructure |
| US2 — Meme reveal | Phase 2 complete | Yes — no dependency on US1 or US3 |
| US3 — Singing pianos | Phase 2 complete | Yes — no dependency on US1 or US2 |

### Parallel Opportunities Within Each Story

**US1**: T012, T013, T014 (tests) can all start in parallel once Phase 2 is done; T015 can start with T001; T016 depends on T015; T017 depends on T011.

**US2**: T018, T019 (tests) can start in parallel once Phase 2 done; T022 (component) and T020 (hub tests) in parallel; T023 after T022; T024 and T025 after T023.

**US3**: T026, T027 (tests) in parallel once Phase 2 done; T030 (component) and T028 (hub tests) in parallel; T031 after T030; T032 and T033 after T031.

### Suggested MVP Scope

Implement **Phase 1 + Phase 2 + Phase 3 (US1)** first. This delivers the presenter hint feature independently and validates that the foundational infrastructure (new models, presenter endpoint, hint stripping) is solid before layering on the more complex reveal mechanics.

### Implementation Strategy

1. **Phase 1** (models + types): Do T001–T008 together — small, fast, no UI; sets the foundation.
2. **Phase 2** (API): T009–T011 — backend endpoint work; verify with quick manual test.
3. **Phase 3 (US1) MVP**: Write tests T012–T014 first; implement T015–T017; confirm all tests pass.
4. **Phase 4 (US2)**: Write tests T018–T020; implement T022–T025; add E2E T021.
5. **Phase 5 (US3)**: Write tests T026–T028; implement T030–T033; add E2E T029.
6. **Phase 6**: Run all quality gates, confirm green, ship.

# Tasks: Code Refactoring for Predictability and Error Safety

**Input**: Design documents from `specs/008-refactor-error-proof/`
**Branch**: `008-refactor-error-proof`
**Prerequisites**: plan.md ✓ spec.md ✓ research.md ✓ data-model.md ✓ contracts/ ✓

**Tests**: Required — all stories change behavior, fix regressions, or alter a frontend-backend contract.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: New shared types and utilities that are blocking prerequisites for all user stories.

- [ ] T001 Create `RevealedBox` C# record in `src/QuizAppka/Models/RevealedBox.cs`
- [ ] T002 [P] Add `RevealedBox` TypeScript interface and update `RevealState` in `src/QuizAppka/ClientApp/src/types/quiz.ts`
- [ ] T003 [P] Add `validationError?: string | null` to all question types in `src/QuizAppka/ClientApp/src/types/quiz.ts`
- [ ] T004 [P] Create shared `isUrl` utility in `src/QuizAppka/ClientApp/src/utils/url.ts`

**Checkpoint**: Shared types and utilities available — all story phases can now begin

---

## Phase 2: Foundational (Breaking Contract Migration)

**Purpose**: Update the `RevealState` wire format in both layers — this is a breaking change that must land before any story using `RevealState` can be implemented or tested correctly.

**⚠️ CRITICAL**: Stories 1 and 4 (SingingPianos) depend on this phase being complete first.

- [ ] T005 Update `RevealState.cs` — change `bool[]?` to `RevealedBox[]?` in `src/QuizAppka/Models/RevealState.cs`
- [ ] T006 Update serialization test for new `RevealedBox[]` wire format in `tests/QuizAppka.Tests/Models/QuestionSerializationTests.cs`
- [ ] T007 Update hub integration test for new `RevealedBox[]` payload in `tests/QuizAppka.Tests/Hubs/PresenterHubTests.cs`

**Checkpoint**: Wire contract updated and validated by existing tests — story implementation can begin

---

## Phase 3: User Story 1 — Reliable State Updates During Piano Box Reveals (Priority: P1) 🎯 MVP

**Goal**: Fix the stale-closure bug in `QuestionDetailPage.onBoxReveal`, move the hub invoke out of the state updater, add `useCallback` to all component callbacks, and align `onBoxReveal` to the new `id`-based signature.

**Independent Test**: Rapidly reveal a piano box and a meme image in quick succession — both reveals are preserved in the final state. SignalR broadcast fires exactly once per committed state change (not inside the updater).

### Tests for User Story 1

- [ ] T008 [P] [US1] Update `SingingPianos.test.tsx` — update existing tests for new `revealedBoxes: RevealedBox[]` prop type and `onBoxReveal(id: string)` signature in `src/QuizAppka/ClientApp/src/components/__tests__/SingingPianos.test.tsx`
- [ ] T009 [P] [US1] Add `QuestionDetailPage` unit tests: verify `onBoxReveal` updater uses `currentReveal` (not stale closure), verify hub effect fires after state change (not inside updater), verify both piano and meme reveals coexist without overwriting each other in `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionDetailPage.test.tsx`

### Implementation for User Story 1

- [ ] T010 [US1] Update `SingingPianos.tsx` — change `revealedBoxes` prop to `RevealedBox[] | null | undefined`, change `onBoxReveal` to `(id: string) => void`, switch lookup from `revealedBoxes?.[index] === true` to `revealedBoxes?.find(r => r.id === box.id)?.revealed === true` in `src/QuizAppka/ClientApp/src/components/SingingPianos.tsx`
- [ ] T011 [US1] Fix `onBoxReveal` in `QuestionDetailPage` — replace `...revealState` with `...currentReveal` inside the state updater, update `currentBoxes` initialization to use `RevealedBox[]`, change callback signature from `(index: number)` to `(id: string)`, wrap in `useCallback([question])` in `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`
- [ ] T012 [US1] Remove hub invoke from inside `setRevealState` updater in `QuestionDetailPage` and add dedicated `useEffect([revealState, categoryId, questionId])` that broadcasts `revealState` to the hub in `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`
- [ ] T013 [US1] Fix `onReveal` (meme) in `QuestionDetailPage` — replace direct `revealState` read with functional updater `setRevealState(current => ({ ...current, memeImageRevealed: true }))`, wrap in `useCallback([])` in `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`
- [ ] T014 [US1] Wrap `handleBack` in `useCallback([navigate, categoryId])` in `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`

**Checkpoint**: US1 fully functional — stale closure eliminated, hub fires once per committed change, all callbacks memoized

---

## Phase 4: User Story 2 — Clear Error Feedback Instead of Infinite Spinners (Priority: P2)

**Goal**: All pages that require URL parameters show a visible error message when those parameters are absent. `MirrorPage` shows an error on hub connection failure instead of spinning indefinitely.

**Independent Test**: Navigate to `/quiz/` (no categoryId) and `/quiz/undefined/undefined` (missing IDs) — both show an `<Alert severity="error">` immediately. Open mirror page while hub is down — error message is visible.

### Tests for User Story 2

- [ ] T015 [P] [US2] Add `QuestionListPage` tests — verify error state and no spinner when `categoryId` is absent, in `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionListPage.test.tsx`
- [ ] T016 [P] [US2] Add `QuestionDetailPage` tests — verify error state and no spinner when `categoryId` or `questionId` is absent, in `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionDetailPage.test.tsx`
- [ ] T017 [P] [US2] Add `MirrorPage` test — verify error state rendered when hub connection fails, in `src/QuizAppka/ClientApp/src/pages/__tests__/MirrorPage.test.tsx`

### Implementation for User Story 2

- [ ] T018 [US2] Add missing-param guard to `QuestionDetailPage` `useEffect` — if `!categoryId`, call `setError('Missing category ID')` and `setLoading(false)` then return in `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`
- [ ] T019 [US2] Add missing-param guard to `QuestionListPage` `useEffect` — if `!categoryId`, call `setError('Missing category ID')` and `setLoading(false)` then return in `src/QuizAppka/ClientApp/src/pages/QuestionListPage.tsx`
- [ ] T020 [US2] Add `useCallback` to `onSelectQuestion` in `QuestionListPage` with deps `[navigate, categoryId]` in `src/QuizAppka/ClientApp/src/pages/QuestionListPage.tsx`
- [ ] T021 [US2] Add `error` state to `MirrorPage`, replace silent `.catch(() => {})` on `startPresenterHub()` with `.catch(err => setError(...))`, render `<Alert severity="error">` when error is set in `src/QuizAppka/ClientApp/src/pages/MirrorPage.tsx`

**Checkpoint**: US2 fully functional — no infinite spinners from missing params or connection failures

---

## Phase 5: User Story 3 — Mirror Viewers Receive Only Valid State Broadcasts (Priority: P2)

**Goal**: `usePresenterSession` guards against broadcasting when identifiers are empty strings, preventing mirror clients from receiving corrupted state on page mount with missing URL params.

**Independent Test**: Connect a mirror viewer, open `/quiz//` (empty categoryId) in presenter tab — mirror state does not update.

### Tests for User Story 3

- [ ] T022 [P] [US3] Update `usePresenterSession.test.tsx` — add tests verifying no `UpdateState` invoke fires when `categoryId` is an empty string, and that it does fire for valid non-empty params, in `src/QuizAppka/ClientApp/src/hooks/__tests__/usePresenterSession.test.tsx`

### Implementation for User Story 3

- [ ] T023 [US3] Add empty-param guard to `usePresenterSession.ts` — if `categoryId` is `''` or `questionId` is `''`, skip the hub invoke; guard applies only to fields that are present (not null) in `src/QuizAppka/ClientApp/src/hooks/usePresenterSession.ts`

**Checkpoint**: US3 fully functional — mirror never receives empty-ID state broadcasts

---

## Phase 6: User Story 4 — Consistent and Predictable Piano Box Interaction (Priority: P3)

**Goal**: A revealed piano box is always `disabled`, regardless of whether `onBoxReveal` is provided. The visual state and interactive behavior are consistent in both presenter and mirror modes.

**Independent Test**: Render `<SingingPianos>` with one pre-revealed box and no `onBoxReveal` — the revealed box has `disabled` attribute. Render with `onBoxReveal` provided — the revealed box is still `disabled`.

### Tests for User Story 4

- [ ] T024 [P] [US4] Add `SingingPianos.test.tsx` tests — verify `disabled` is `true` for revealed boxes both with and without `onBoxReveal` prop, verify unrevealed boxes are not disabled when `onBoxReveal` is provided, in `src/QuizAppka/ClientApp/src/components/__tests__/SingingPianos.test.tsx`

### Implementation for User Story 4

- [ ] T025 [US4] Fix `disabled` prop in `SingingPianos.tsx` — change `disabled={isRevealed && !onBoxReveal}` to `disabled={isRevealed}` in `src/QuizAppka/ClientApp/src/components/SingingPianos.tsx`

**Checkpoint**: US4 fully functional — piano button disabled state is always consistent with revealed state

---

## Phase 7: User Story 5 — Backend Validates All Question Types Before Serving (Priority: P3)

**Goal**: `SingingPianosQuestion` with empty `Boxes` and `MemeQuestion` with empty `EntryImage` are included in the question list with a `validationError` field set. The frontend `QuestionList` renders a visible error indicator for these questions.

**Independent Test**: Add a piano question with `"boxes": []` to a category JSON file, start the app, open the question list — the question appears with an error indicator visible without opening it.

### Tests for User Story 5

- [ ] T026 [P] [US5] Add `QuizDataServiceTests.cs` tests — verify `SingingPianosQuestion` with empty `Boxes` is included with `ValidationError = "No boxes defined"`, verify `MemeQuestion` with empty `EntryImage` is included with `ValidationError = "Missing entry image"`, in `tests/QuizAppka.Tests/Services/QuizDataServiceTests.cs`
- [ ] T027 [P] [US5] Add `QuestionList.test.tsx` component test — verify a question with `validationError` set renders an error indicator in `src/QuizAppka/ClientApp/src/components/__tests__/QuestionList.test.tsx`

### Implementation for User Story 5

- [ ] T028 [US5] Add `ValidationError { get; set; }` property to `Question.cs` in `src/QuizAppka/Models/Question.cs`
- [ ] T029 [US5] Add `SingingPianosQuestion` validation to `FilterValidQuestions` — if `piano.Boxes.Length == 0`, set `question.ValidationError = "No boxes defined"` and add to valid list in `src/QuizAppka/Services/QuizDataService.cs`
- [ ] T030 [US5] Add `MemeQuestion` validation to `FilterValidQuestions` — if `string.IsNullOrWhiteSpace(meme.EntryImage)`, set `question.ValidationError = "Missing entry image"` and add to valid list in `src/QuizAppka/Services/QuizDataService.cs`
- [ ] T031 [US5] Update `QuestionList.tsx` — render an MUI `<Chip label="Invalid" color="error" size="small">` next to any question where `question.validationError` is set in `src/QuizAppka/ClientApp/src/components/QuestionList.tsx`

**Checkpoint**: US5 fully functional — invalid piano and meme questions visible in list with error indicator

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Shared utility extraction, deduplication, and final quality gate validation.

- [ ] T032 [P] Replace local `isUrl` in `ClosedQuestion.tsx` with import from `src/QuizAppka/ClientApp/src/utils/url.ts`
- [ ] T033 [P] Replace local `isUrl` in `OpenQuestion.tsx` with import from `src/QuizAppka/ClientApp/src/utils/url.ts`
- [ ] T034 Run frontend type check and confirm zero errors: `cd src/QuizAppka/ClientApp && npx tsc --noEmit`
- [ ] T035 Run frontend lint and confirm zero warnings: `cd src/QuizAppka/ClientApp && npm run lint`
- [ ] T036 Run all frontend tests and confirm pass: `cd src/QuizAppka/ClientApp && npm run test`
- [ ] T037 Run all backend tests and confirm pass: `dotnet test`

---

## Dependencies

```
T001 (RevealedBox C#)
  └── T005 (RevealState.cs update)
        ├── T006 (serialization test update)
        └── T007 (hub test update)

T002 + T003 (RevealedBox + validationError TS types)
  ├── T008, T009 (US1 tests) → T010–T014 (US1 impl)
  ├── T024 (US4 test) → T025 (US4 impl)
  └── T027 (US5 QuestionList test) → T031 (US5 QuestionList impl)

T004 (url.ts utility)
  └── T032, T033 (ClosedQuestion + OpenQuestion update)

T028 (Question.cs ValidationError)
  └── T029, T030 (FilterValidQuestions piano + meme)
        └── T026 (QuizDataService tests)
```

**Independent story execution** (after Phase 1+2 complete):
- US1 (T008–T014) is independent of US2–US5
- US2 (T015–T021) is independent of US1, US3–US5
- US3 (T022–T023) is independent of all others
- US4 (T024–T025) is independent of US2, US3, US5
- US5 (T026–T031) is independent of US1–US4

**Parallel opportunities per story**:
- US1: T008 and T009 can run in parallel (different files)
- US2: T015, T016, T017 can run in parallel (different test files)
- US5: T026 and T027 can run in parallel (different layers); T029 and T030 can run in parallel (same file, different cases — coordinate)
- Phase 8: T032, T033 can run in parallel

---

## Implementation Strategy

**MVP scope**: Complete Phase 1 → Phase 2 → Phase 3 (US1) to deliver the highest-priority correctness fix with a working wire contract. The app is fully usable and correct for piano reveals after US1.

**Suggested delivery order**:
1. Phase 1 + 2 (setup + breaking contract) — atomic, land together
2. Phase 3 (US1) — highest priority fix, validates the new wire format end-to-end
3. Phase 4 + 5 (US2 + US3) — error UX improvements, can be done concurrently
4. Phase 6 (US4) — small, low-risk fix
5. Phase 7 (US5) — backend validation + UI indicator
6. Phase 8 (polish + quality gates)

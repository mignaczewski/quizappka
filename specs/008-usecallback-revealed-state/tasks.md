# Tasks: React Refactor — useCallback & Revealed State

**Input**: Design documents from `specs/008-usecallback-revealed-state/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/signalr-reveal-state.md ✓, quickstart.md ✓

**Tests**: Required — this feature changes component behaviour (revealed-box lookup), callback
signatures, and hub payload shape. All behaviour changes must be covered by automated tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Establish a green baseline before any changes are made

- [ ] T001 Verify full test suite passes before touching any files — run `npm test` in `src/QuizAppka/ClientApp` and confirm zero failures

---

## Phase 2: Foundational — Type Change (Blocking)

**Purpose**: Add `PianoBoxReveal` type and update `RevealState`. Every other task in this feature depends on this change being in place first.

**⚠️ CRITICAL**: No implementation or test update can begin until this phase is complete

- [X] T002 Add `PianoBoxReveal` interface (`{ id: string; revealed: boolean }`) and update `RevealState.singingPianosBoxesRevealed` from `boolean[] | null` to `PianoBoxReveal[] | null` in `src/QuizAppka/ClientApp/src/types/quiz.ts`

**Checkpoint**: Type foundation ready — US1 implementation and test updates can now begin

---

## Phase 3: User Story 1 — Singing Pianos uses identity-based revealed state (Priority: P1) 🎯 MVP

**Goal**: Replace positional `boolean[]` reveal tracking with `PianoBoxReveal[]` so each box is identified by its stable `PianoBox.id` instead of array index. Propagates through the full component tree and hub payload.

**Independent Test**: Render `SingingPianos` with `revealedBoxes={[{ id: 'box3', revealed: true }]}` and verify only the box with `id === 'box3'` shows hidden text; all other boxes show `?`.

### Tests for User Story 1 ⚠️

> Write these before implementation so they fail for the right reason first.

- [X] T003 [P] [US1] Update all `revealedBoxes` fixtures in `SingingPianos.test.tsx`
- [X] T004 [P] [US1] Update `singingPianosBoxesRevealed` fixture in `QuestionDisplay.test.tsx`

### Implementation for User Story 1

- [X] T005 [P] [US1] Update `SingingPianos.tsx`
- [X] T006 [P] [US1] Update `QuestionDisplay.tsx`
- [X] T007 [US1] Update `QuestionDetailPage.tsx`
- [X] T008 [US1] Add `onBoxReveal` state-logic tests to `QuestionDetailPage.test.tsx` — cover: clicking an unrevealed box creates `{ id, revealed: true }` entry; clicking an already-revealed box does not change state; hub `invoke` is called with the correct `PianoBoxReveal[]` payload in `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionDetailPage.test.tsx`

**Checkpoint**: User Story 1 fully functional and independently testable — run `npm test` to confirm all SingingPianos, QuestionDisplay, and onBoxReveal tests are green

---

## Phase 4: User Story 2 — Callback props are stable across re-renders (Priority: P2)

**Goal**: Wrap `onReveal` (meme image reveal) and `handleBack` in `useCallback` with minimal correct dependency arrays so child components do not re-render when the parent re-renders for unrelated reasons.

**Independent Test**: Render `QuestionDetailPage`, trigger an unrelated state change (e.g. simulate a loading flag flip), verify `onReveal` and `handleBack` references have not changed.

### Tests for User Story 2 ⚠️

- [X] T009 [US2] Add callback-stability tests to `QuestionDetailPage.test.tsx`

### Implementation for User Story 2

- [X] T010 [US2] Extract the inline `onReveal` handler from the JSX in `QuestionDetailPage.tsx` and wrap it in `useCallback` with dependency array `[revealState, categoryId, questionId]`; assign it to a named variable and pass it as the `onReveal` prop to `QuestionDisplay` in `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`
- [X] T011 [US2] Wrap `handleBack` in `useCallback` with dependency array `[categoryId, navigate]` in `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`

**Checkpoint**: User Stories 1 AND 2 should both work independently — run `npm test` to confirm all callback-stability tests pass

---

## Phase 5: User Story 3 — Full test suite green and quality gates pass (Priority: P3)

**Goal**: Confirm no regressions exist, all test fixtures reflect the new types, and all quality gates (type-check, lint) pass.

**Independent Test**: Run `npm test && npm run type-check && npm run lint` in `src/QuizAppka/ClientApp` with zero errors.

- [X] T012 [P] [US3] Audit `MirrorPage.test.tsx` for any fixtures using `singingPianosBoxesRevealed` and update them to `PianoBoxReveal[]` format if present in `src/QuizAppka/ClientApp/src/pages/__tests__/MirrorPage.test.tsx`
- [X] T013 [US3] Run full test suite and confirm zero failures: `npm test` in `src/QuizAppka/ClientApp`
- [X] T014 [US3] Run type-check and confirm zero TypeScript errors: `npm run type-check` in `src/QuizAppka/ClientApp`
- [X] T015 [US3] Run lint and confirm zero ESLint errors including `react-hooks/exhaustive-deps` rules: `npm run lint` in `src/QuizAppka/ClientApp`

**Checkpoint**: All quality gates pass — feature is ready for merge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 — can start immediately after T002
- **Phase 4 (US2)**: Depends on Phase 3 (T007 must be complete — same file in QuestionDetailPage.tsx)
- **Phase 5 (US3)**: Depends on Phases 3 and 4 being complete

### User Story Dependencies

- **US1 (P1)**: Can start after T002 (foundational type change)
- **US2 (P2)**: Can start after T007 (QuestionDetailPage.tsx onBoxReveal is already refactored so both changes are in the same file cleanly)
- **US3 (P3)**: Depends on US1 and US2 completion

### Within Phase 3 (US1)

- T003 and T004 are test-file updates — can run in parallel (different files)
- T005 and T006 are component updates — can run in parallel (different files)
- T007 depends on T005 and T006 (TypeScript will error until all three are consistent)
- T008 depends on T007 (tests the completed handler logic)

### Within Phase 4 (US2)

- T009 (writing tests) can be done before T010/T011 (TDD approach)
- T010 and T011 touch the same file — run sequentially

---

## Parallel Execution Examples

### Phase 3 (US1) parallel opportunities

```
# Run in parallel — test fixture updates (different files):
T003: Update SingingPianos.test.tsx fixtures
T004: Update QuestionDisplay.test.tsx fixture

# Run in parallel — component implementation (different files):
T005: Update SingingPianos.tsx (prop type + id lookup + call site)
T006: Update QuestionDisplay.tsx (onBoxReveal prop type)

# Then sequentially:
T007: Update QuestionDetailPage.tsx (handler + setState logic)
T008: Add state-logic tests to QuestionDetailPage.test.tsx
```

### Phase 4 (US2) parallel opportunity

```
# Write tests first (TDD), then implement:
T009: Write callback-stability tests  ← can write before T010/T011 are done
T010: Extract + wrap onReveal in useCallback
T011: Wrap handleBack in useCallback
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Phase 1: Verify green baseline (T001)
2. Phase 2: Type change (T002)
3. Phase 3: Full US1 — update types, component, prop interface, handler, tests (T003–T008)
4. **Validate**: All SingingPianos tests green, box reveal works by id
5. Stop here if US2 and US3 are deferred

### Full Delivery

1. Phase 1 → Phase 2 → Phase 3 (MVP) → validate
2. Phase 4 (US2) → validate callback stability
3. Phase 5 (US3) → confirm all quality gates pass → merge

---

## Notes

- `[P]` tasks touch different files and have no incomplete task dependencies
- `[US1]`/`[US2]`/`[US3]` labels map each task to its user story for traceability
- T007 is the most complex single task — the `setRevealState` updater logic must be idempotent (return current state unchanged when `boxId` is already revealed)
- The `useCallback` dep array for `onBoxReveal` must NOT include `revealState` — this is enforced by `eslint-plugin-react-hooks` and verified by T015
- Commit after each phase checkpoint to keep changes reviewable

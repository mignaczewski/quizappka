---
description: "Task list for Category List Navigation Access"
---

# Tasks: Category List Navigation Access

**Input**: Design documents from `/specs/004-category-list-navigation/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓

**Scope**: Pure frontend modification of two existing page components and their test files.
No new components, routes, hooks, services, or backend files are created.
No Setup or Foundational phases are required — all infrastructure already exists.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[US#]**: User story label (required for story phases)

---

## Phase 1: User Story 1 — Return to Category List from Question List (Priority: P1) 🎯 MVP

**Goal**: The question list screen gains a visible "Back to categories" button that navigates the presenter directly to `/` in a single step.

**Independent Test**: Open any category question list, click the button, verify the category list renders and a second category can be selected normally.

### Tests for User Story 1

> **Write these tests first — they MUST fail before the button is added.**

- [X] T001 [P] [US1] Add component test asserting the "Back to categories" button is present in the loaded state of `QuestionListPage` in `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionListPage.test.tsx`
- [X] T002 [P] [US1] Add component test asserting that clicking the "Back to categories" button navigates to `/` (category list route) in `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionListPage.test.tsx`

### Implementation for User Story 1

- [X] T003 [P] [US1] Add a MUI `Button variant="text"` with label "← Back to categories", `aria-label="Back to categories"`, and `onClick={() => navigate('/')}` at the top of the loaded content section in `src/QuizAppka/ClientApp/src/pages/QuestionListPage.tsx`

**Checkpoint**: `QuestionListPage` renders a working "Back to categories" button; T001 and T002 now pass.

---

## Phase 2: User Story 2 — Return to Category List from Question View (Priority: P1)

**Goal**: The question detail screen gains a "Back to categories" button above the existing "Back to questions" button, allowing the presenter to jump directly to the category list in a single step.

**Independent Test**: Open any question, click "Back to categories", verify the category list renders. Then re-open the question and click "Back to questions" to confirm that flow still works.

### Tests for User Story 2

> **Write these tests first — they MUST fail before the button is added.**

- [X] T004 [P] [US2] Add component test asserting the "Back to categories" button is present in the loaded state of `QuestionDetailPage` in `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionDetailPage.test.tsx`
- [X] T005 [P] [US2] Add component test asserting that clicking the "Back to categories" button navigates to `/` in `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionDetailPage.test.tsx`
- [X] T006 [P] [US2] Add regression test asserting that the existing "Back to questions" button is still present alongside the new button in `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionDetailPage.test.tsx`

### Implementation for User Story 2

- [X] T007 [P] [US2] Add a MUI `Button variant="text"` with label "← Back to categories", `aria-label="Back to categories"`, and `onClick={() => navigate('/')}` immediately above the existing "← Back to questions" button in `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`

**Checkpoint**: `QuestionDetailPage` renders both the new "Back to categories" button and the existing "Back to questions" button; T004, T005, and T006 now pass.

---

## Phase 3: User Story 3 — Consistent Navigation Controls Across Presenter Screens (Priority: P2)

**Goal**: Verify that the button label, aria-label, variant, and placement follow the same pattern in both `QuestionListPage` and `QuestionDetailPage`, so the navigation action is predictable and consistent for the presenter across both screens.

**Independent Test**: Read both components side-by-side and confirm button text, `aria-label`, and `variant` are identical. Run the full Vitest suite to confirm all navigation tests pass together.

- [X] T008 [US3] Review and align `aria-label`, button text, and `Button` variant between `QuestionListPage.tsx` and `QuestionDetailPage.tsx` — both MUST use `aria-label="Back to categories"` and label `← Back to categories`
- [X] T009 [US3] Run the full frontend test suite (`npm run test` in `src/QuizAppka/ClientApp`) and confirm all existing and new tests pass with no regressions

**Checkpoint**: All three user stories are independently functional. Category list navigation is available and consistent across both presenter screens.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T010 [P] Run TypeScript type check (`npx tsc --noEmit` in `src/QuizAppka/ClientApp`) and confirm zero type errors
- [X] T011 [P] Run ESLint (`npm run lint` in `src/QuizAppka/ClientApp`) and confirm zero lint warnings or errors
- [X] T012 Run manual walkthrough per `specs/004-category-list-navigation/quickstart.md` — verify all 9 manual verification steps pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)** and **Phase 2 (US2)**: No inter-dependencies — both can start immediately and run in parallel (different files throughout).
- **Phase 3 (US3)**: Depends on Phase 1 and Phase 2 being complete.
- **Phase 4 (Polish)**: Depends on Phase 3 completion.

### User Story Dependencies

- **US1 (P1)**: Fully independent — `QuestionListPage.tsx` and its test file only.
- **US2 (P1)**: Fully independent — `QuestionDetailPage.tsx` and its test file only.
- **US3 (P2)**: Depends on US1 and US2 — consistency check across both screens.

### Within Each User Story

- Tests (T001/T002, T004/T005/T006) MUST be written and verified to fail before the corresponding implementation task.
- Implementation tasks (T003, T007) succeed when the failing tests turn green.

### Parallel Opportunities

```
# US1 and US2 can be worked simultaneously after task generation:
Task T001 (US1 test)      ←→ Task T004 (US2 test)
Task T002 (US1 test)      ←→ Task T005 (US2 test)
Task T003 (US1 impl)      ←→ Task T006 (US2 regression test)
                          ←→ Task T007 (US2 impl)

# Within US1 — run tests T001 and T002 in parallel:
T001 (button is present)
T002 (button navigates to /)

# Within US2 — run tests T004, T005, T006 in parallel:
T004 (button is present)
T005 (button navigates to /)
T006 (regression: back to questions still present)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only — ~2 tasks)

1. Write T001, T002 (failing tests for QuestionListPage)
2. Implement T003 (button in QuestionListPage)
3. **STOP and VALIDATE**: T001 and T002 now green; manually verify button on the running app.
4. Merge or demo if ready.

### Incremental Delivery

1. Complete Phase 1 (US1) → Category navigation available from question list ✓
2. Complete Phase 2 (US2) → Category navigation available from question view ✓
3. Complete Phase 3 (US3) → Consistency confirmed ✓
4. Complete Phase 4 (Polish) → Lint, types, and manual walkthrough clean ✓

### Parallel Team Strategy

With two developers:
- Developer A: Phase 1 (US1) — `QuestionListPage.tsx` + test file
- Developer B: Phase 2 (US2) — `QuestionDetailPage.tsx` + test file
- Both merge; Developer A or B completes Phase 3 consistency check and Phase 4 polish.

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 12 |
| User Story 1 (P1) | 3 tasks |
| User Story 2 (P1) | 4 tasks |
| User Story 3 (P2) | 2 tasks |
| Polish | 3 tasks |
| Files modified | 4 (2 components, 2 test files) |
| Files created | 0 |
| Backend changes | None |
| Parallel opportunities | US1 and US2 fully independent; all tests within each story independent |
| Suggested MVP | Phase 1 (US1 only, 3 tasks) |

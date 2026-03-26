# Tasks: Question List Navigation

**Input**: Design documents from `/specs/002-question-list-navigation/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/quiz-api.md ✓, quickstart.md ✓

**Tests**: Required per constitution — behavior is changed and frontend routing is altered. Tests are defined per user story before implementation.

**Organization**: Tasks are grouped by user story. US1 (question list page) is independently testable and deliverable as MVP.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Aspire version upgrade and desktop layout CSS baseline. Neither blocks the other; both are independent of user story implementation.

- [ ] T001 Upgrade `Aspire.Hosting.AppHost` from `9.*` to `13.*` in `src/QuizAppka.AppHost/QuizAppka.AppHost.csproj`
- [ ] T002 [P] Apply desktop-first layout baseline in `src/QuizAppka/ClientApp/src/index.css`: set `min-width: 960px` on `body`, remove narrow mobile constraints so content fills a desktop viewport comfortably
- [ ] T003 [P] Remove mobile-centric legacy styles from `src/QuizAppka/ClientApp/src/App.css`: delete the unused Vite template classes (`.logo`, `.card`, `.read-the-docs` and their animations) that contribute to narrow/mobile appearance

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Remove the files and route entries that the new pages replace. Must complete before any user story page can be registered cleanly.

**⚠️ CRITICAL**: No user story page work can begin until this phase is complete.

- [ ] T004 Delete `src/QuizAppka/ClientApp/src/pages/QuizPage.tsx`; remove its `import` statement and the `/quiz/:categoryId` `<Route>` entry from `src/QuizAppka/ClientApp/src/App.tsx` so the route slot is free for the new page
- [ ] T005 [P] Delete `src/QuizAppka/ClientApp/src/components/NavigationBar.tsx` (no remaining consumers after QuizPage is removed)

**Checkpoint**: Old navigation files gone — ready to implement new pages.

---

## Phase 3: User Story 1 — Browse Questions in a Category (Priority: P1) 🎯 MVP

**Goal**: After selecting a category, the presenter sees a list of all questions in that category instead of jumping directly to the first question.

**Independent Test**: Select any category and confirm a list of question entries is rendered at `/quiz/:categoryId` with no question detail auto-opened.

### Tests for User Story 1 ⚠️

> Write these tests before their corresponding implementation tasks. Run them to confirm they fail for the right reason before coding.

- [ ] T006 [P] [US1] Write component tests for `QuestionList` verifying: all questions rendered as list entries, each entry shows question number and type badge, clicking an entry calls `onSelectQuestion` with the correct question id — create `src/QuizAppka/ClientApp/src/components/__tests__/QuestionList.test.tsx`
- [ ] T007 [P] [US1] Write component tests for `QuestionListPage` verifying: loading state shown while fetch is in flight, all questions from the category appear in the list, no question detail is auto-opened, error state shown when fetch fails — create `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionListPage.test.tsx`

### Implementation for User Story 1

- [ ] T008 [US1] Create `QuestionList` component in `src/QuizAppka/ClientApp/src/components/QuestionList.tsx`: accepts `questions: Question[]` and `onSelectQuestion: (questionId: string) => void`; renders an MUI `List` where each `ListItemButton` shows 1-based question number, a type badge (`open` / `closed` / `image rebus`), and a truncated prompt preview
- [ ] T009 [US1] Create `QuestionListPage` in `src/QuizAppka/ClientApp/src/pages/QuestionListPage.tsx`: reads `categoryId` from URL params via `useParams`, calls `fetchCategory(categoryId)`, manages `loading`/`error`/`category` state, renders the category name as heading and `QuestionList` with `onSelectQuestion` callback that navigates to `/quiz/${categoryId}/${questionId}`; wraps content in `Container maxWidth="lg"` for desktop layout
- [ ] T010 [US1] Register `/quiz/:categoryId` → `QuestionListPage` in `src/QuizAppka/ClientApp/src/App.tsx`: add import for `QuestionListPage` and add the route entry

### E2E Validation for User Story 1

- [ ] T011 [US1] Update `tests/QuizAppka.E2E/tests/category-selection.spec.ts`: replace the assertion "first question displayed" with assertion that the question list is displayed (e.g., multiple list items visible, no question detail heading present) after category selection

**Checkpoint**: US1 independently complete and testable — presenter sees a question list after category selection.

---

## Phase 4: User Story 2 — Open a Question from the List (Priority: P2)

**Goal**: The presenter selects a question entry from the list and the application displays its full content at `/quiz/:categoryId/:questionId`.

**Independent Test**: Navigate to `/quiz/:categoryId/:questionId` directly and verify the correct question content is rendered for all three question types.

### Tests for User Story 2 ⚠️

- [ ] T012 [P] [US2] Write component tests for `QuestionDetailPage` covering all three question types in `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionDetailPage.test.tsx`: open question shows prompt only (no options); closed question shows prompt and all answer options; image rebus question shows the image and prompt; loading state shown while fetch is in flight; error state shown when question id is not found in category

### Implementation for User Story 2

- [ ] T013 [US2] Create `QuestionDetailPage` in `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`: reads `categoryId` and `questionId` from URL params via `useParams`, calls `fetchCategory(categoryId)`, resolves `question` by `.find(q => q.id === questionId)`, manages `loading`/`error`/`category`/`question` state, renders `QuestionDisplay` for the resolved question with category name as heading; wraps content in `Container maxWidth="lg"` for desktop layout; shows error `Alert` if question is not found
- [ ] T014 [US2] Register `/quiz/:categoryId/:questionId` → `QuestionDetailPage` in `src/QuizAppka/ClientApp/src/App.tsx`: add import for `QuestionDetailPage` and add the route entry (must appear before or be ordered correctly alongside the list route)

**Checkpoint**: US1 + US2 independently complete — presenter can see the list and open any question.

---

## Phase 5: User Story 3 — Return to Question List from a Question (Priority: P3)

**Goal**: A clearly visible back action on the question detail page returns the presenter to the question list for the current category.

**Independent Test**: Open any question, activate the back action, and confirm `/quiz/:categoryId` is rendered with the same question list.

### Tests for User Story 3 ⚠️

- [ ] T015 [P] [US3] Add component test in `src/QuizAppka/ClientApp/src/pages/__tests__/QuestionDetailPage.test.tsx`: verify a back button is present; verify clicking it triggers navigation to `/quiz/:categoryId` (the list route)

### Implementation for User Story 3

- [ ] T016 [US3] Add back action to `QuestionDetailPage` in `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`: add an MUI `Button` labelled "Back to questions" (or equivalent) above the question content that calls `navigate('/quiz/${categoryId}')` when clicked

### E2E Validation for User Story 3

- [ ] T017 [US3] Rewrite `tests/QuizAppka.E2E/tests/navigation.spec.ts` to cover the new list-based flow: home → select category → expect question list → select a question → expect question detail → click back → expect question list again → select a different question → expect new question detail; remove the old previous/next/end-of-category assertions

**Checkpoint**: All three user stories complete — full presenter flow functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation that all layers build cleanly, existing tests pass, and the feature is merge-ready.

- [ ] T018 [P] Run `npm run build` in `src/QuizAppka/ClientApp` — TypeScript compilation and Vite build must succeed with zero errors; fix any type errors surfaced
- [ ] T019 [P] Run `dotnet build` in `src/QuizAppka.AppHost` after the Aspire 13 upgrade — build must succeed; restore packages if needed with `dotnet restore`
- [ ] T020 [P] Run `dotnet test` in `tests/QuizAppka.Tests` — all existing backend unit tests must pass with no regressions
- [ ] T021 Run `npm run test` in `src/QuizAppka/ClientApp` — all frontend component tests (existing + new) must pass; address any failures before marking complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001, T002, T003 can all start immediately in parallel
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user story page work
- **US1 (Phase 3)**: Depends on Phase 2 — can start independently after foundational
- **US2 (Phase 4)**: Depends on Phase 2 and Phase 3 (needs QuestionListPage + route to exist so the list can navigate to detail)
- **US3 (Phase 5)**: Depends on Phase 4 (QuestionDetailPage must exist before back button is added)
- **Polish (Phase 6)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Requires only Phase 2 complete — independently testable
- **US2 (P2)**: Requires US1 complete (QuestionListPage navigates to detail on question click)
- **US3 (P3)**: Requires US2 complete (QuestionDetailPage must exist to receive back button)

### Within Each Story

- Write tests before implementation (T006/T007 before T008/T009, T012 before T013, T015 before T016)
- Create components before pages that use them (T008 QuestionList before T009 QuestionListPage)
- Create pages before registering routes (T009 before T010, T013 before T014)
- Implement before updating E2E tests (implementation must be runnable for E2E verification)

### Parallel Opportunities

- T001, T002, T003 (Phase 1) — all in parallel
- T004, T005 (Phase 2) — after Phase 1, in parallel with each other
- T006, T007 (US1 tests) — in parallel with each other
- T018, T019, T020 (Phase 6) — all in parallel

---

## Parallel Execution Examples

### Phase 1 — All three setup tasks in parallel:
```
T001: Upgrade Aspire.Hosting.AppHost to 13.* in src/QuizAppka.AppHost/QuizAppka.AppHost.csproj
T002: Desktop CSS baseline in src/QuizAppka/ClientApp/src/index.css
T003: Remove mobile styles from src/QuizAppka/ClientApp/src/App.css
```

### Phase 3 — Write both US1 tests before implementation:
```
T006: src/QuizAppka/ClientApp/src/components/__tests__/QuestionList.test.tsx
T007: src/QuizAppka/ClientApp/src/pages/__tests__/QuestionListPage.test.tsx
```

### Phase 6 — All validation tasks in parallel:
```
T018: npm run build  (ClientApp)
T019: dotnet build   (QuizAppka.AppHost)
T020: dotnet test    (QuizAppka.Tests)
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (delete old files)
3. Complete Phase 3: US1 — QuestionList component + QuestionListPage + route
4. **STOP and VALIDATE**: Question list appears after category selection; T006, T007, T011 all pass
5. Demo to presenter — basic list navigation is live

### Incremental Delivery

1. Setup + Foundational → old navigation removed, desktop CSS applied
2. US1 → presenter sees question list → **MVP demo**
3. US2 → presenter can open any question
4. US3 → presenter can return from question to list → full flow complete
5. Polish → all quality gates pass → merge-ready

### Notes

- [P] tasks involve different files with no dependency on each other
- [US] label maps each task to its user story for traceability
- Commit after each logical group (e.g., after US1 tests + implementation, after US1 E2E update)
- Do not mark a user story complete until its component tests and E2E tests pass
- `QuizPage.tsx` and `NavigationBar.tsx` deletions (T004, T005) are irreversible — confirm Phase 1 setup tasks are committed first

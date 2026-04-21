# Tasks: Presenter Mirroring Mode

**Input**: Design documents from `/specs/003-presenter-mirroring-mode/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/signalr-hub.md ✓, quickstart.md ✓

**Tests**: Required per constitution — this feature adds real-time cross-layer behavior (SignalR hub, WebSocket transport, multi-client broadcast). Tests are defined per user story before their implementation tasks.

**Organization**: Tasks are grouped by user story. US1 (mirror route + late-join delivery) is independently testable and deliverable as MVP.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the two new dependencies required by the feature. Both are independent and can run in parallel.

- [X] T001 Install `@microsoft/signalr` npm package
- [X] T002 [P] Add `Microsoft.AspNetCore.SignalR.Client` NuGet package to `tests/QuizAppka.Tests/QuizAppka.Tests.csproj`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend SignalR infrastructure and shared TypeScript types that every user story depends on. MUST be complete before any user story implementation begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Create `PresenterStateDto` C# record in `src/QuizAppka/Models/PresenterStateDto.cs`
- [X] T004 [P] Create `IPresenterSessionStore` interface in `src/QuizAppka/Services/IPresenterSessionStore.cs`
- [X] T005 [P] Create `PresenterSessionStore` implementation in `src/QuizAppka/Services/PresenterSessionStore.cs`
- [X] T006 [P] Create `PresenterScreen` TypeScript discriminated union type in `src/QuizAppka/ClientApp/src/types/mirror.ts`
- [X] T007 Create `PresenterHub` SignalR hub class in `src/QuizAppka/Hubs/PresenterHub.cs`
- [X] T008 Register SignalR in `src/QuizAppka/Program.cs`

**Checkpoint**: Backend hub is live — `ws://localhost:{port}/hubs/presenter` accepts WebSocket connections.

---

## Phase 3: User Story 1 — Open a Mirror View (Priority: P1) 🎯 MVP

**Goal**: Opening `/mirror` in any browser tab immediately shows a read-only version of the presenter's current screen (category list, question list, or question detail), with all interactive navigation controls hidden. When no presenter session exists, a clear idle/waiting state is shown. A single button on the presenter homepage opens the mirror in a new tab.

**Independent Test**: With the app running, navigate the presenter to any screen, then open `/mirror` in a second tab — the mirror must show the same screen content without any Back, Previous, or Next buttons visible. Also verify that opening `/mirror` before any presenter navigation shows an idle/waiting message.

### Tests for User Story 1 ⚠️

> Write these tests before their corresponding implementation tasks. Confirm they fail for the right reason before coding.

- [X] T009 [P] [US1] Create `tests/QuizAppka.Tests/Services/PresenterSessionStoreTests.cs`
- [X] T010 [P] [US1] Create `tests/QuizAppka.Tests/Hubs/PresenterHubTests.cs`
- [X] T011 [P] [US1] Create `src/QuizAppka/ClientApp/src/pages/__tests__/MirrorPage.test.tsx`

### Implementation for User Story 1

- [X] T012 [P] [US1] Create `src/QuizAppka/ClientApp/src/services/presenterHub.ts`
- [X] T013 [US1] Create `src/QuizAppka/ClientApp/src/pages/MirrorPage.tsx`
- [X] T014 [US1] Register `/mirror` route in `src/QuizAppka/ClientApp/src/App.tsx`
- [X] T015 [P] [US1] Add an "Open Mirror" button to `src/QuizAppka/ClientApp/src/pages/HomePage.tsx`

**Checkpoint**: US1 independently complete and testable — T009/T010/T011 all pass; mirror route renders correct read-only screens; idle state shown when no session; mirror button visible on homepage.

---

## Phase 4: User Story 2 — Mirror Follows Presenter Navigation (Priority: P2)

**Goal**: Each time the presenter navigates to a different screen, all currently open mirror views update automatically within 1 second. No action is required from the mirror viewer.

**Independent Test**: Open the mirror in a second tab, then navigate the presenter through: homepage → select a category → select a question → click back. Verify the mirror updates to each screen step without the mirror viewer doing anything.

### Tests for User Story 2 ⚠️

> Write these tests before their corresponding implementation tasks.

- [X] T016 [P] [US2] Create `src/QuizAppka/ClientApp/src/hooks/__tests__/usePresenterSession.test.tsx`: mock `getPresenterHubConnection()` to return a fake connection object with a controllable `start()` and `invoke()` spy; verify the hook calls `connection.start()` on first render; verify the hook invokes `UpdateState` with `{ screen: 'category-list' }` when called with that state; verify the hook invokes `UpdateState` with `{ screen: 'question-list', categoryId: 'cat1' }` when called with that state and `categoryId` changes; verify the hook stops the connection on unmount
- [X] T017 [US2] Create `tests/QuizAppka.E2E/tests/mirroring.spec.ts` E2E test for US2 navigation chain: open presenter at `/`; open mirror at `/mirror` in a second page; verify mirror shows category list; click a category in presenter — verify mirror shows question list for that category; click a question in presenter — verify mirror shows that question's content without back/navigation buttons; click back in presenter — verify mirror returns to question list

### Implementation for User Story 2

- [X] T018 [US2] Create `src/QuizAppka/ClientApp/src/hooks/usePresenterSession.ts`
- [X] T019 [P] [US2] Modify `src/QuizAppka/ClientApp/src/pages/HomePage.tsx`
- [X] T020 [P] [US2] Modify `src/QuizAppka/ClientApp/src/pages/QuestionListPage.tsx`
- [X] T021 [P] [US2] Modify `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx`

**Checkpoint**: US2 complete — mirror follows presenter navigation in real time; T016 passes; T017 E2E test passes.

---

## Phase 5: User Story 3 — Multiple Simultaneous Mirror Views (Priority: P3)

**Goal**: Any number of mirror tabs open simultaneously all stay synchronized with the presenter. Closing one mirror does not affect others. A mirror opened mid-session immediately shows the presenter's current screen.

**Independent Test**: Open three mirror tabs simultaneously; navigate the presenter to a question; verify all three mirrors show that question. Close one mirror tab; navigate the presenter again; verify the remaining two mirrors update. Open a fourth mirror tab after the navigation; verify it immediately shows the current question without the presenter navigating again.

### Tests for User Story 3 ⚠️

> No new implementation files are required for this story — the hub's `Clients.All` broadcast and `OnConnectedAsync` late-join delivery (both implemented in Phase 2) already satisfy the behavior. These tasks add the E2E proof.

- [X] T022 [US3] Extend `tests/QuizAppka.E2E/tests/mirroring.spec.ts` with a multiple-mirrors test: open presenter at `/`; open three mirror pages simultaneously; navigate the presenter to a specific question; verify all three mirror pages show that question; close one mirror page; navigate the presenter to a different question; verify the remaining two mirror pages update to the new question
- [X] T023 [US3] Extend `tests/QuizAppka.E2E/tests/mirroring.spec.ts` with a late-join test: open presenter at `/`; navigate to a question; then open a new mirror page; verify the mirror immediately shows that question without any additional presenter navigation

**Checkpoint**: All three user stories complete — full mirroring feature functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm all quality gates pass across both layers before marking the feature merge-ready.

- [X] T024 [P] Run `dotnet test` from the repository root — all backend unit and integration tests including `PresenterSessionStoreTests` and `PresenterHubTests` must pass with no failures or skipped tests; fix any failures before continuing
- [X] T025 [P] Run `npm run lint && npm run type-check && npm run test` in `src/QuizAppka/ClientApp` — ESLint, TypeScript compilation, and Vitest must all report zero errors; `MirrorPage.test.tsx` and `usePresenterSession.test.tsx` must be included in the passing test run
- [X] T026 Run `npx playwright test` in `tests/QuizAppka.E2E` — `mirroring.spec.ts` (US2 navigation chain, US3 multiple mirrors, US3 late-join) plus all pre-existing specs must pass; fix any regressions in `category-selection.spec.ts` and `navigation.spec.ts` before declaring complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 and T002 can start immediately and in parallel
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user story work; T003/T004/T005/T006 can be done in parallel; T007 depends on T003/T004/T005; T008 depends on T007
- **US1 (Phase 3)**: Depends on Phase 2 complete — tests T009/T010/T011 can be written in parallel; T012 is [P] alongside tests; T013 depends on T012; T014 depends on T013; T015 is [P] with T012/T013/T014
- **US2 (Phase 4)**: Depends on US1 complete — T016/T017 in parallel; T018 after T016/T017; T019/T020/T021 in parallel after T018
- **US3 (Phase 5)**: Depends on US2 complete — T022 then T023 (sequential, same file)
- **Polish (Phase 6)**: Depends on all user story phases complete — T024 and T025 in parallel; T026 after T024 and T025

### User Story Dependencies

- **US1 (P1)**: Requires Phase 2 complete — independently testable from US2 and US3
- **US2 (P2)**: Requires US1 complete (mirror page must exist and be subscribed to `StateUpdated` for navigation tests to work)
- **US3 (P3)**: Requires US2 complete (presenter pages must emit state for multiple-mirror synchronization to be testable)

### Within Each Story

- Write tests before implementation (T009/T010/T011 before T012/T013/T014/T015)
- Create backend infrastructure before frontend consumers (Phase 2 before Phase 3 implementation)
- Register routes after creating the page component (T014 after T013)
- Hook must exist before page modifications that call it (T018 before T019/T020/T021)

### Parallel Opportunities per Phase

**Phase 1**: T001 and T002 in parallel (different package managers, different files)  
**Phase 2**: T003, T004, T005, T006 all in parallel (independent files, no cross-dependency)  
**Phase 3 tests**: T009, T010, T011 all in parallel (different test files)  
**Phase 3 implementation**: T012 and T015 in parallel (different files, no cross-dependency)  
**Phase 4 tests**: T016 and T017 in parallel (different files)  
**Phase 4 implementation**: T019, T020, T021 in parallel (different files, all depend only on T018)  
**Phase 6**: T024 and T025 in parallel  

---

## Parallel Execution Examples

### Phase 2 — All infrastructure in parallel:
```
T003: src/QuizAppka/Models/PresenterStateDto.cs
T004: src/QuizAppka/Services/IPresenterSessionStore.cs
T005: src/QuizAppka/Services/PresenterSessionStore.cs
T006: src/QuizAppka/ClientApp/src/types/mirror.ts
(then T007 PresenterHub.cs → T008 Program.cs)
```

### Phase 3 — Write all US1 tests before implementation:
```
T009: tests/QuizAppka.Tests/Services/PresenterSessionStoreTests.cs
T010: tests/QuizAppka.Tests/Hubs/PresenterHubTests.cs
T011: src/QuizAppka/ClientApp/src/pages/__tests__/MirrorPage.test.tsx
```

### Phase 4 — Modify all three presenter pages after hook is created:
```
T019: src/QuizAppka/ClientApp/src/pages/HomePage.tsx
T020: src/QuizAppka/ClientApp/src/pages/QuestionListPage.tsx
T021: src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx
```

---

## Implementation Strategy

### MVP (User Story 1 Only — 14 tasks)

1. Phase 1: T001, T002 (install dependencies)
2. Phase 2: T003–T008 (backend hub infrastructure + TypeScript types)
3. Phase 3: T009–T015 (tests + mirror page + route + open button)
4. **STOP AND VALIDATE**: Open `/mirror`, verify it shows the presenter's current screen (loaded from store on connect), verify navigation controls are absent, verify T009/T010/T011 all pass
5. Demo: presenter navigates to a question, opens mirror in new tab — audience sees the question without controls

### Incremental Delivery

1. Setup + Foundational (Phase 1–2) → SignalR hub live, types defined
2. US1 (Phase 3) → Mirror route works; idle state shown; late-join delivery confirmed → **MVP**
3. US2 (Phase 4) → Mirror follows every presenter navigation in real time → **Live sync**
4. US3 (Phase 5) → Multiple simultaneous mirrors verified by E2E → **Full feature**
5. Polish (Phase 6) → All quality gates pass → **Merge-ready**

### Notes

- `[P]` tasks are in different files with no inter-task dependency — safe to implement simultaneously
- `[USx]` label maps each task to its user story for traceability
- Commit after each story checkpoint before moving to the next priority
- Do not mark a user story complete until all its tests (unit, integration, and E2E where applicable) pass
- The `MirrorPage` must subscribe to `StateUpdated` **before** calling `connection.start()` — otherwise the late-join initial state event may fire before the handler is registered and be missed
- The `usePresenterSession` hook must guard against calling `invoke` on a connection that has not yet reached `Connected` state — start the connection first and await it if needed

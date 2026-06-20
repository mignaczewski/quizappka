# Tasks: Timed Open Question

**Input**: Design documents from `/specs/010-timed-open-question/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are required for this feature because behavior, contracts, and cross-layer synchronization change.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared fixtures and baseline scaffolding.

- [X] T001 Add timed-open sample question fixture in src/QuizAppka/Data/categories/sample-category.json
- [X] T002 [P] Add timed-open presenter test fixture setup in src/QuizAppka/ClientApp/src/pages/__tests__/QuestionDetailPage.test.tsx
- [X] T003 [P] Add timed-open mirror test fixture setup in src/QuizAppka/ClientApp/src/pages/__tests__/MirrorPage.test.tsx
- [X] T004 [P] Add timed-open E2E fixture references in tests/QuizAppka.E2E/tests/question-types.spec.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core model and contract wiring required by all stories.

**CRITICAL**: No user story work starts before this phase is complete.

- [X] T005 Add TimedOpenQuestion backend model in src/QuizAppka/Models/TimedOpenQuestion.cs
- [X] T006 Add timed-open polymorphic discriminator mapping in src/QuizAppka/Models/Question.cs
- [X] T007 Add timer runtime state model in src/QuizAppka/Models/QuestionTimerState.cs
- [X] T008 Extend RevealState with timerState in src/QuizAppka/Models/RevealState.cs
- [X] T009 Validate initialDurationSeconds rules in src/QuizAppka/Services/QuizDataService.cs
- [X] T010 [P] Add timed-open and timer state frontend types in src/QuizAppka/ClientApp/src/types/quiz.ts
- [X] T011 [P] Extend mirrored payload type for timerState in src/QuizAppka/ClientApp/src/types/mirror.ts
- [X] T012 [P] Add backend serialization coverage for timed-open and timerState in tests/QuizAppka.Tests/Models/QuestionSerializationTests.cs
- [X] T013 [P] Add API response coverage for timed-open endpoints in tests/QuizAppka.Tests/Controllers/QuizControllerTests.cs
- [X] T014 Add contract conformance verification assertions in tests/QuizAppka.Tests/Hubs/PresenterHubTests.cs

**Checkpoint**: Foundation complete. User stories can begin.

---

## Phase 3: User Story 1 - Run a Timed Open Question Live (Priority: P1) MVP

**Goal**: Presenter starts timed-open question and both presenter and mirror display the same running countdown.

**Independent Test**: Open timed-open question in presenter and mirror, start timer, verify both screens count down together and stop at zero.

### Tests for User Story 1

- [X] T015 [P] [US1] Add presenter timer-start and running-state tests in src/QuizAppka/ClientApp/src/pages/__tests__/QuestionDetailPage.test.tsx
- [X] T016 [P] [US1] Add mirror running-timer render tests from StateUpdated payload in src/QuizAppka/ClientApp/src/pages/__tests__/MirrorPage.test.tsx
- [X] T017 [P] [US1] Add hub integration test for running timer broadcast in tests/QuizAppka.Tests/Hubs/PresenterHubTests.cs
- [X] T018 [P] [US1] Add E2E start-and-sync flow test in tests/QuizAppka.E2E/tests/mirroring.spec.ts
- [X] T019 [P] [US1] Add automated <=1s mirror-sync assertion for timer start in tests/QuizAppka.E2E/tests/mirroring.spec.ts

### Implementation for User Story 1

- [X] T020 [P] [US1] Implement TimedOpenQuestion renderer in src/QuizAppka/ClientApp/src/components/TimedOpenQuestion.tsx
- [X] T021 [US1] Route timed-open question type in src/QuizAppka/ClientApp/src/components/QuestionDisplay.tsx
- [X] T022 [US1] Implement presenter start action and timer-state emit in src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx
- [X] T023 [US1] Implement mirror timed-open timer display from hub state in src/QuizAppka/ClientApp/src/pages/MirrorPage.tsx
- [X] T024 [US1] Ensure timed-open API payload inclusion on public and presenter routes in src/QuizAppka/Controllers/QuizController.cs

**Checkpoint**: US1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Control Timer During Facilitation (Priority: P2)

**Goal**: Presenter can pause, resume, and reset timer with synchronized mirror behavior.

**Independent Test**: Run timed-open timer, pause, resume, and reset; verify each transition appears correctly in mirror.

### Tests for User Story 2

- [X] T025 [P] [US2] Add presenter pause-resume-reset tests in src/QuizAppka/ClientApp/src/pages/__tests__/QuestionDetailPage.test.tsx
- [X] T026 [P] [US2] Add mirror paused-reset render tests in src/QuizAppka/ClientApp/src/pages/__tests__/MirrorPage.test.tsx
- [X] T027 [P] [US2] Add late-join replay tests for paused-reset states in tests/QuizAppka.Tests/Hubs/PresenterHubTests.cs
- [X] T028 [P] [US2] Add E2E pause-resume-reset synchronization test in tests/QuizAppka.E2E/tests/question-types.spec.ts
- [X] T029 [P] [US2] Add automated <=1s mirror-sync assertions for pause-resume-reset in tests/QuizAppka.E2E/tests/question-types.spec.ts

### Implementation for User Story 2

- [X] T030 [US2] Implement pause-resume timer transitions in src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx
- [X] T031 [US2] Implement reset-to-idle behavior in src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx
- [X] T032 [US2] Implement ended-state and zero-floor countdown behavior in src/QuizAppka/ClientApp/src/components/TimedOpenQuestion.tsx
- [X] T033 [US2] Add timer transition guards and invalid-state handling in src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx

**Checkpoint**: US1 and US2 are independently testable and integrated.

---

## Phase 5: User Story 3 - Preserve Existing Open Question Behavior (Priority: P3)

**Goal**: Existing open question behavior remains unchanged with no timer UI.

**Independent Test**: Run non-timed open question in presenter and mirror; verify no timer display and no timer controls.

### Tests for User Story 3

- [X] T034 [P] [US3] Add no-timer regression tests for open question component in src/QuizAppka/ClientApp/src/components/__tests__/OpenQuestion.test.tsx
- [X] T035 [P] [US3] Add open-routing regression tests in question display in src/QuizAppka/ClientApp/src/components/__tests__/QuestionDisplay.test.tsx
- [X] T036 [P] [US3] Add E2E non-timed-open no-controls regression test in tests/QuizAppka.E2E/tests/question-types.spec.ts

### Implementation for User Story 3

- [X] T037 [US3] Preserve open-question rendering path without timer UI in src/QuizAppka/ClientApp/src/components/OpenQuestion.tsx
- [X] T038 [US3] Ensure mirror ignores timerState for non-timed questions in src/QuizAppka/ClientApp/src/pages/MirrorPage.tsx
- [X] T039 [US3] Preserve public-route presenter-data stripping behavior for open questions in src/QuizAppka/Controllers/QuizController.cs

**Checkpoint**: All stories are independently functional.

---

## Phase 6: Polish and Cross-Cutting

**Purpose**: Close quality gaps and finalize evidence for release readiness.

- [X] T040 [P] Reconcile contracts with final implementation in specs/010-timed-open-question/contracts/quiz-api.md
- [X] T041 [P] Reconcile SignalR timer contract with final implementation in specs/010-timed-open-question/contracts/signalr-timer-state.md
- [X] T042 [P] Update quickstart with final validation evidence in specs/010-timed-open-question/quickstart.md
- [X] T043 Execute backend quality gate and record result in specs/010-timed-open-question/quickstart.md
- [X] T044 Execute frontend quality gates and record result in specs/010-timed-open-question/quickstart.md
- [X] T045 Execute E2E quality gates and record result in specs/010-timed-open-question/quickstart.md
- [ ] T046 Capture UAT first-attempt success metric evidence for SC-003 in specs/010-timed-open-question/quickstart.md

---

## Dependencies and Execution Order

### Phase Dependencies

- Setup (Phase 1): starts immediately.
- Foundational (Phase 2): depends on Setup completion and blocks story work.
- User Story Phases (Phase 3-5): depend on Foundational completion.
- Polish (Phase 6): depends on completion of all targeted user stories.

### User Story Dependencies

- US1 (P1): no dependency on other stories after Foundational; delivers MVP.
- US2 (P2): depends on US1 timer baseline behavior.
- US3 (P3): no functional dependency on US1/US2 beyond shared foundation; regression hardening story.

### Within Each User Story

- Tests first where practical, then implementation.
- Type/model updates before orchestration logic.
- Presenter behavior before mirror synchronization assertions.
- Story-specific checks pass before moving on.

---

## Parallel Opportunities

- Phase 1 tasks marked [P] run in parallel after T001.
- Phase 2 tasks T010-T013 run in parallel with model tasks once scaffolding starts.
- US1 tests T015-T019 run in parallel; T020 and T024 can run in parallel.
- US2 tests T025-T029 run in parallel; T030 and T032 can run in parallel.
- US3 tests T034-T036 run in parallel; T037-T039 can run in parallel where no file conflicts exist.
- Phase 6 tasks T040-T042 run in parallel; T043-T046 then run as validation sequence.

---

## Parallel Example: User Story 1

```bash
Task: T015 [US1] presenter timer-start tests
Task: T016 [US1] mirror running-timer tests
Task: T017 [US1] hub running broadcast tests
Task: T018 [US1] E2E start-and-sync test
Task: T019 [US1] <=1s sync assertion test
```

## Parallel Example: User Story 2

```bash
Task: T025 [US2] presenter pause-resume-reset tests
Task: T026 [US2] mirror paused-reset tests
Task: T027 [US2] late-join replay tests
Task: T028 [US2] E2E pause-resume-reset test
Task: T029 [US2] <=1s sync assertion tests
```

## Parallel Example: User Story 3

```bash
Task: T034 [US3] open-question no-timer component tests
Task: T035 [US3] question display open-route regression tests
Task: T036 [US3] E2E non-timed-open regression tests
```

---

## Implementation Strategy

### MVP First (US1)

1. Finish Phase 1 and Phase 2.
2. Implement US1 (Phase 3).
3. Validate US1 independently before moving on.

### Incremental Delivery

1. Deliver US1 for base timed-open capability.
2. Add US2 presenter control lifecycle.
3. Add US3 regression safety.
4. Finish polish and quality-gate evidence.

### Parallel Team Strategy

1. Team completes setup and foundational phases together.
2. Then split by story stream:
- Developer A: US1
- Developer B: US2
- Developer C: US3
3. Rejoin for Phase 6 final validation.

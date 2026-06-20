# Feature Specification: Timed Open Question

**Feature Branch**: `010-timed-open-question`  
**Created**: 2026-06-20  
**Status**: Draft  
**Input**: User description: "I want you to introduce new type of question that will be the same as open question but it should have timer. Timer should be visible for presenter and mirror view. Presenter should have actions to start, pause and reset timer."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run a Timed Open Question Live (Priority: P1)

As a presenter, I can run a timed variant of an open question during a live quiz round so participants and viewers can see a shared countdown while discussing or preparing answers.

**Why this priority**: This is the core user value: a new question type with visible timing behavior in live sessions.

**Independent Test**: Can be fully tested by opening a timed open question in presenter mode and mirror mode, starting the timer, and verifying that both views show the same running timer value.

**Acceptance Scenarios**:

1. **Given** a timed open question is active and its timer is not running, **When** the presenter starts the timer, **Then** the timer begins counting down and is visible in both presenter and mirror views.
2. **Given** a timed open question timer is running, **When** time reaches zero, **Then** both presenter and mirror views display that the timer has ended and stop decreasing.

---

### User Story 2 - Control Timer During Facilitation (Priority: P2)

As a presenter, I can pause and resume the timer to handle interruptions, and reset it to the original duration before restarting a question segment.

**Why this priority**: Presenter control is necessary for real-world facilitation and directly requested in the feature description.

**Independent Test**: Can be fully tested by running a timed open question, pausing the timer, confirming it stops, then resetting it and confirming the original duration is restored.

**Acceptance Scenarios**:

1. **Given** a timed open question timer is running, **When** the presenter pauses it, **Then** the remaining time value stops changing in both presenter and mirror views.
2. **Given** a timed open question timer is paused, **When** the presenter starts it again, **Then** countdown resumes from the paused value in both presenter and mirror views.
3. **Given** a timed open question timer has changed from its initial value, **When** the presenter resets it, **Then** the timer returns to the configured starting duration and remains stopped until started again.

---

### User Story 3 - Preserve Existing Open Question Behavior (Priority: P3)

As a quiz organizer, I can continue using existing open questions without timers, so introducing the timed variant does not change current question flow unexpectedly.

**Why this priority**: Preventing regression in existing open-question behavior protects current quizzes and reduces rollout risk.

**Independent Test**: Can be fully tested by running an existing non-timed open question and confirming no timer is shown and no timer controls appear.

**Acceptance Scenarios**:

1. **Given** a standard open question is active, **When** presenter and mirror views are displayed, **Then** no timer UI or timer controls are shown.

---

### Test Evidence Expectations

- Frontend automated tests must verify timer display and control states in presenter and mirror views for timed open questions, including start, pause, resume, reset, and timer completion states.
- Backend automated tests must verify question payload rules for timed open questions, including required initial duration and valid timer state transitions.
- Cross-layer integration tests must verify timer state changes initiated by presenter controls propagate consistently to mirror view updates.
- Manual verification may be used only for final visual polish checks; core timer behavior must remain covered by automation.

### Edge Cases

- Presenter selects reset while timer is already at its initial value: the timer remains at the initial value with no negative side effects.
- Presenter rapidly toggles start/pause multiple times: timer state remains consistent and does not skip or drift unexpectedly between views.
- Mirror view temporarily disconnects during countdown: on reconnect, it reflects current timer state and remaining time rather than stale values.
- Configured timer duration is zero or invalid: system prevents activation of an unusable timed open question and shows a clear validation error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support a new question type, Timed Open Question, with the same answering and display behavior as the existing open question plus a visible timer.
- **FR-002**: System MUST require each timed open question to define an initial timer duration greater than zero.
- **FR-003**: System MUST display the timer in presenter view whenever a timed open question is active.
- **FR-004**: System MUST display the same timer state and remaining time in mirror view whenever a timed open question is active.
- **FR-005**: Presenter MUST be able to start the timer for an active timed open question.
- **FR-006**: Presenter MUST be able to pause a running timer and later resume countdown from the paused value.
- **FR-007**: Presenter MUST be able to reset the timer to the configured initial duration.
- **FR-008**: System MUST stop countdown at zero and indicate that time has ended.
- **FR-009**: System MUST ensure timer state changes are synchronized between presenter and mirror views within the same live session.
- **FR-010**: System MUST keep existing non-timed open questions unchanged, including absence of timer display and timer controls.
- **FR-011**: System MUST define updated interaction contracts, validation rules, and failure behavior for timed open question timer actions and mirrored timer updates.
- **FR-012**: System MUST define and deliver automated frontend, backend, and cross-layer integration test coverage for this feature before merge.

### Key Entities

- **Timed Open Question**: A question that behaves like an open question and includes a required initial duration used for a live visible timer.
- **Timer State**: The shared runtime status for a timed open question, including whether it is idle, running, paused, or ended, and the current remaining time.
- **Timer Control Action**: A presenter-initiated command to start, pause/resume, or reset the timer for the currently active timed open question.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In automated integration tests, 100% of presenter timer actions (start, pause/resume, reset) are reflected in mirror view state within 1 second.
- **SC-002**: In automated tests, timed open questions complete countdown without showing negative time in 100% of timer completion scenarios.
- **SC-003**: In user acceptance testing, presenters successfully complete the start, pause, and reset control workflow on first attempt in at least 90% of test sessions.
- **SC-004**: Regression tests show 0 changes in behavior for existing non-timed open questions across all previously passing open-question scenarios.

## Assumptions

- Timed open questions are configured in existing quiz content the same way other question types are authored today; no new question authoring UI is required for this feature.
- Timer visibility in this feature is limited to presenter and mirror views, consistent with the request.
- Each live quiz session has at most one active question timer at a time.
- If a timer update cannot be delivered immediately due to temporary connectivity issues, the next successful synchronization event restores the current timer state.
- Frontend and backend CI runners can execute the required automated tests before merge.

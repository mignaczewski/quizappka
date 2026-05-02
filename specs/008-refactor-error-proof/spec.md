# Feature Specification: Code Refactoring for Predictability and Error Safety

**Feature Branch**: `008-refactor-error-proof`  
**Created**: 2026-05-02  
**Status**: Draft  
**Input**: User description: "I want to refactor some code to work more predictable and be more error proof."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reliable State Updates During Piano Box Reveals (Priority: P1)

A quiz presenter clicks to reveal a piano box. Simultaneously, the meme image reveal or other state changes may be in flight. The reveal must always reflect the actual latest state — no prior reveals should be silently overwritten regardless of timing or rapid user interactions.

**Why this priority**: This is a data-correctness bug. Silent state loss during live quiz sessions directly undermines the presenter experience and is invisible to the user until something visually wrong is noticed.

**Independent Test**: Can be fully tested by rapidly revealing a piano box and a meme image in quick succession and verifying both reveals are preserved in the final state.

**Acceptance Scenarios**:

1. **Given** a piano question is displayed with some boxes already revealed, **When** the presenter reveals another box, **Then** the updated state includes all previously revealed boxes plus the new one, with no prior state overwritten.
2. **Given** concurrent reveal operations are triggered rapidly, **When** each operation completes, **Then** each individual reveal is independently recorded and none is lost.
3. **Given** the app is running in strict/concurrent rendering mode, **When** a box reveal is triggered, **Then** the SignalR broadcast is sent exactly once per user action, not multiple times.

---

### User Story 2 - Clear Error Feedback Instead of Infinite Spinners (Priority: P2)

A user navigates to a question or category page via a malformed or incomplete URL (e.g., missing category ID). Instead of being stuck on a loading spinner indefinitely with no explanation, they see a clear message indicating the page cannot be loaded.

**Why this priority**: An infinite spinner with no feedback is a broken user experience that provides no recovery path. This affects both presenters and mirror viewers.

**Independent Test**: Can be fully tested by navigating to a question detail or question list page with no ID in the URL and verifying an error message is shown rather than a perpetual spinner.

**Acceptance Scenarios**:

1. **Given** a user opens a question list page with no category ID in the URL, **When** the page loads, **Then** an error message is displayed and the loading indicator is dismissed.
2. **Given** a user opens a question detail page with no question ID, **When** the page loads, **Then** an error message is displayed immediately rather than waiting indefinitely.
3. **Given** a mirror viewer's hub connection fails to establish, **When** the connection attempt completes with an error, **Then** a visible error message is shown and the loading indicator is dismissed.

---

### User Story 3 - Mirror Viewers Receive Only Valid State Broadcasts (Priority: P2)

When a presenter navigates to a question page, mirror viewers receive a real-time state update. This update should only be sent when valid context (category and question identifiers) is available — not when the page loads with incomplete parameters.

**Why this priority**: Broadcasting empty or invalid identifiers corrupts the mirror view for all connected audience members. Fixing this makes the mirroring feature reliable.

**Independent Test**: Can be fully tested by connecting a mirror viewer and navigating to a question page with missing URL parameters, verifying the mirror view does not update to an empty/invalid state.

**Acceptance Scenarios**:

1. **Given** a mirror viewer is connected, **When** a presenter opens a question page with missing URL parameters, **Then** the mirror view does not receive a state update.
2. **Given** a mirror viewer is connected, **When** a presenter opens a valid question page with all parameters present, **Then** the mirror view updates to reflect that question correctly.

---

### User Story 4 - Consistent and Predictable Piano Box Interaction (Priority: P3)

When a piano box has already been revealed, it should be visually non-interactive (disabled) regardless of whether a reveal handler is attached. The button's visual state and its interactive behavior must be consistent.

**Why this priority**: The current mismatch between visual appearance and actual behavior is confusing. A revealed box that appears clickable but silently does nothing violates user expectations.

**Independent Test**: Can be fully tested by displaying a piano question with some pre-revealed boxes and verifying the revealed boxes appear disabled in all display contexts (presenter view and mirror view).

**Acceptance Scenarios**:

1. **Given** a piano question with one pre-revealed box, **When** displayed in presenter mode, **Then** the revealed box appears visually disabled and cannot be interacted with.
2. **Given** a piano question with one pre-revealed box, **When** displayed in read-only mirror mode, **Then** the revealed box appears visually disabled consistently.

---

### User Story 5 - Backend Validates All Question Types Before Serving (Priority: P3)

The quiz data service validates all question types for structural integrity before they are served to clients. Serving a piano question with no boxes or a meme question with no entry image results in a clear exclusion or rejection, not silent empty-state rendering.

**Why this priority**: Invalid questions with structural problems (empty boxes, missing images) will be included in the question list but marked with a visible error indicator so the presenter is aware before attempting to display them. This gives content creators immediate feedback without silently hiding content.

**Independent Test**: Can be fully tested by loading a quiz file that contains a piano question with an empty boxes array and verifying the question is handled consistently with other invalid question types.

**Acceptance Scenarios**:

1. **Given** a quiz data file contains a piano question with no boxes defined, **When** the category is loaded, **Then** that question appears in the question list marked with a visible error indicator.
2. **Given** a quiz data file contains a meme question with no entry image defined, **When** the category is loaded, **Then** that question appears in the question list marked with a visible error indicator.
3. **Given** a question is marked with an error indicator, **When** the presenter views the question list, **Then** the error indicator is visible without needing to open the question.

---

### Test Evidence Expectations

- **User Story 1**: Unit tests for the `onBoxReveal` state updater verifying it uses the latest state snapshot, not a stale closure. Unit test verifying the SignalR call is not made inside the state updater. These are backend-logic tests (pure function tests, no rendering required).
- **User Story 2**: Unit/integration tests for page components verifying `isLoading` is set to `false` and an error message is rendered when URL parameters are absent. Tests for mirror page verifying error state is shown on connection failure.
- **User Story 3**: Unit tests for the presenter session hook verifying no broadcast is sent when identifiers are empty/undefined.
- **User Story 4**: Component-level tests for `SingingPianos` verifying that revealed boxes have `disabled=true` regardless of `onBoxReveal` presence.
- **User Story 5**: Unit tests for `FilterValidQuestions` covering `SingingPianosQuestion` (empty boxes) and `MemeQuestion` (missing entry image) cases.

### Edge Cases

- What happens when `revealedBoxes` has fewer entries than the number of boxes? System must not crash and must treat missing indices as unrevealed.
- How does the system handle a hub connection that drops mid-session? Error recovery path must be defined for mirror viewers.
- What happens when a category file is structurally malformed (not just an invalid question)? Out of scope — existing behavior is preserved.
- How are duplicate rapid reveal events handled when the SignalR call is moved outside the state updater? The latest confirmed state should be broadcast after the state update settles.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: State updates that depend on previous state MUST use the most recent state value available at the time the update is applied, not a value captured at callback creation time.
- **FR-002**: Operations that cause side effects (network calls, broadcasts) MUST NOT be triggered inside state update functions; they MUST be triggered after the state update is confirmed.
- **FR-003**: Pages that require URL parameters to load MUST transition to a visible error state (not a loading state) when those parameters are absent.
- **FR-004**: The mirror page MUST display a visible error message when the hub connection cannot be established, rather than showing an indefinite loading indicator.
- **FR-005**: Real-time state broadcasts to mirror viewers MUST only be sent when all required context identifiers are valid and non-empty.
- **FR-006**: A revealed piano box MUST be rendered in a disabled/non-interactive state regardless of whether a reveal callback is provided.
- **FR-007**: The backend question validation MUST apply structural checks to `SingingPianosQuestion` (non-empty boxes list) and `MemeQuestion` (non-empty entry image), consistent with validation already applied to other question types.
- **FR-008**: Shared utility logic (such as URL detection) that is duplicated across multiple components MUST be consolidated into a single shared location.
- **FR-009**: System MUST define automated test coverage for each corrected behaviour before merge, covering both the fixed path and the previously-broken path as a regression guard.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero cases where a piano box reveal silently overwrites a concurrent meme image reveal or other state change, verified by automated tests.
- **SC-002**: Zero cases of an infinite loading spinner caused by absent URL parameters — all such cases show a user-readable error message within the normal page load cycle.
- **SC-003**: Zero cases where mirror viewers receive a state broadcast containing empty or placeholder identifiers due to page mount with missing parameters.
- **SC-004**: All question types receive structural validation in the backend before being served — validated by at least one automated test per question type covering the invalid-structure path.
- **SC-005**: All identified fragile code patterns have corresponding automated regression tests that would catch a reintroduction of the bug.
- **SC-006**: No shared utility code (e.g., URL detection) exists in more than one file after the refactor.

## Assumptions

- The refactoring scope covers both the frontend (quiz display components and pages) and the backend question validation service.
- The target audience for error messages (e.g., "cannot load this page") is the presenter or developer, not end-audience members — so messages can be technical and brief.
- Existing automated test infrastructure (unit and component tests) is available and runnable; no new test framework needs to be introduced.
- Silent exclusion of invalid questions (current backend behavior for other types) is the desired behavior for newly validated question types unless clarification changes this.
- The SignalR hub connection retry / reconnection strategy is out of scope; only first-connect error handling is in scope.
- Mobile-specific layout and accessibility improvements are out of scope for this refactoring.

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]


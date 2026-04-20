# Feature Specification: Presenter Mirroring Mode

**Feature Branch**: `003-presenter-mirroring-mode`  
**Created**: 2026-03-26  
**Status**: Draft  
**Input**: User description: "Now something more difficult. I want to introduce mirroring mode. I want to have possibility to open new tab or browser window and enable mirroring view of presenter screen. Mirror version should also show same screen which presenter see like category list, question list or specific question but some elements may be hidden like navigation buttons etc. There can be multiple mirror views, all controlled by presenter view."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Open a Mirror View (Priority: P1)

The presenter wants to project the quiz content on a second screen — such as an audience monitor or projector — without exposing navigation controls. They open a dedicated mirror URL in a new browser tab or window. The mirror immediately shows the same content the presenter is currently viewing: the category list, the question list, or a displayed question.

**Why this priority**: Opening the mirror is the entry point for the entire feature. Without it no mirroring is possible. It is independently valuable because it already gives the audience a clean read-only view of the current state, even before live synchronization is in place.

**Independent Test**: Can be fully tested by opening the mirror URL while the presenter is on any screen and verifying the mirror shows the correct screen content with all navigation controls absent.

**Acceptance Scenarios**:

1. **Given** the presenter is viewing the category list, **When** a new browser tab opens the mirror URL, **Then** the mirror shows the same category list without any navigation controls.
2. **Given** the presenter is viewing the question list for a category, **When** a new browser tab opens the mirror URL, **Then** the mirror shows the same question list without any navigation controls.
3. **Given** the presenter is viewing a specific question, **When** a new browser tab opens the mirror URL, **Then** the mirror shows the same question content without any navigation controls.
4. **Given** the presenter has not yet selected a category (no active presentation), **When** the mirror URL is opened, **Then** the mirror shows a clearly communicative idle/waiting state rather than an error page.

---

### User Story 2 - Mirror Follows Presenter Navigation (Priority: P2)

When the presenter navigates between screens — from category list to question list, into a question, and back — all open mirror views update automatically to reflect the presenter's current screen without any manual action from the mirror side.

**Why this priority**: This is what makes the mirror useful during a live quiz session. A one-time static snapshot would require the mirror to be refreshed manually on every navigation step; live synchronization is the defining behavior of the feature.

**Independent Test**: Can be fully tested by opening a mirror view, navigating through at least three screens from the presenter view, and verifying the mirror updates to each new screen without the viewer taking any action.

**Acceptance Scenarios**:

1. **Given** a mirror is open showing the category list, **When** the presenter opens a category (transitions to the question list), **Then** the mirror shows the question list for that category.
2. **Given** a mirror is open showing the question list, **When** the presenter opens a specific question, **Then** the mirror shows that question's content.
3. **Given** a mirror is open showing a question, **When** the presenter navigates back to the question list, **Then** the mirror shows the question list.
4. **Given** a mirror is open and the presenter navigates back to the category list, **When** the navigation completes, **Then** the mirror shows the category list.

---

### User Story 3 - Multiple Simultaneous Mirror Views (Priority: P3)

Multiple browser tabs or windows can have the mirror URL open at the same time, all automatically synchronized with the presenter's current screen. This supports setups with multiple audience screens, projectors, or remote viewers watching from separate devices.

**Why this priority**: This story extends live synchronization to an arbitrary number of viewers. It enables richer presentation setups without requiring the presenter to manage each mirror individually, but it depends on User Story 2 being solid first.

**Independent Test**: Can be fully tested by opening three mirror tabs simultaneously and confirming all three reflect the same screen and update together when the presenter navigates.

**Acceptance Scenarios**:

1. **Given** three mirror views are open, **When** the presenter navigates to a question, **Then** all three mirrors show that question simultaneously.
2. **Given** multiple mirror views are open and one is closed, **When** the presenter navigates, **Then** the remaining mirrors still update correctly.
3. **Given** a new mirror view is opened after the presenter has already navigated to a question, **When** the mirror loads, **Then** it immediately shows the presenter's current screen rather than an idle state.

---

### Test Evidence Expectations

- User Story 1 requires component/rendering tests verifying the mirror route renders the correct view for each possible presenter state (idle, category list, question list, individual question) and that all navigation controls are absent from the mirror for every state. Frontend tests must confirm the mirror URL is reachable independently of the presenter view.
- User Story 2 requires state-synchronization integration tests confirming that presenter navigation events propagate to the mirror and the mirror's rendered content updates to match. End-to-end tests should cover the full presenter navigation chain (category list → question list → question → back to list) with at least one mirror view open throughout.
- User Story 3 requires tests with multiple simultaneous mirror instances verifying all update when the presenter navigates and that closing one mirror does not affect the others. A late-joining mirror test must confirm it receives the current state on load.
- All question types (open, closed, image rebus) must be verified to render correctly in the mirror view through automated tests.

### Edge Cases

- What happens if a mirror view is opened before the presenter has selected any category? The mirror must show a communicative idle/waiting state, not a blank page or error.
- What happens when a mirror tab loses network connectivity temporarily? The mirror must indicate the disconnected state and automatically recover synchronization when connectivity is restored, without the viewer needing to refresh.
- What happens if the presenter closes and reopens the presenter window? Existing mirror views must detect reconnection and resume synchronization automatically.
- What if the presenter and mirror are on a high-latency connection? Navigation changes must still arrive within the success criteria time bound, or the mirror must clearly indicate it is catching up.
- What if a question's associated image is unavailable? The mirror must degrade gracefully (same behavior as the presenter view for that question type).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a dedicated mirror route accessible in any browser tab or window that displays the mirrored presenter view.
- **FR-002**: The mirror view MUST display the same screen the presenter is currently viewing: category list, question list, or a specific question.
- **FR-003**: When the presenter navigates to a different screen, all currently open mirror views MUST update to reflect the new screen without requiring any action from the mirror viewer.
- **FR-004**: The mirror view MUST NOT display any interactive navigation controls present in the presenter view; hidden elements include at minimum: previous/next question buttons, back navigation button, and category selection controls.
- **FR-005**: The mirror view MUST be strictly read-only; any viewer interaction with the mirror MUST NOT trigger any state change in the presenter view or any other mirror view.
- **FR-006**: Multiple mirror views MUST be supported simultaneously with all open mirrors remaining synchronized with the presenter's current state.
- **FR-007**: A mirror view opened at any point during a presentation MUST immediately display the presenter's current screen state without the presenter needing to navigate again.
- **FR-008**: When no active presenter session exists, the mirror view MUST display a clearly communicative idle/waiting state rather than an error or blank page.
- **FR-009**: The system MUST define the communication model — including state representation, change propagation, and failure/recovery behavior — between the presenter view and all active mirror views as a design contract before implementation.
- **FR-010**: The system MUST define the automated test coverage required to verify mirror synchronization, navigation control hiding, idle state, and multiple simultaneous mirrors before merge.

### Key Entities

- **Presenter Session**: The active navigation state maintained by the presenter view, representing the screen currently shown (idle, category list, question list for a given category, or a specific question). This is the single source of truth that all mirror views observe.
- **Mirror View**: A passive, read-only consumer of the Presenter Session state. It observes state changes and renders the corresponding screen without navigation controls. Any number of mirror views may be open simultaneously, each independently connected to the same Presenter Session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A presenter can produce a working mirror view (open in a new tab or window) with a single action from the presenter interface.
- **SC-002**: All open mirror views reflect a presenter navigation change within 1 second under normal operating conditions on a local network.
- **SC-003**: At least 5 simultaneous mirror views remain fully synchronized with the presenter without any viewer experiencing visible lag or missed updates.
- **SC-004**: 100% of presenter navigation controls are absent from the mirror view, verified by automated tests across all supported screens.
- **SC-005**: A mirror view opened at any point during a live presentation immediately shows the current presenter screen, with no additional action required from the presenter.
- **SC-006**: Mirror views automatically recover synchronization within 5 seconds after a temporary network interruption, without requiring a manual page refresh from the viewer.

## Assumptions

- There is a single active presenter session at a time; the system does not need to support multiple concurrent independent presenters.
- Mirror viewers are passive audience members or secondary displays; they have no accounts, credentials, or permissions to manage.
- The mirror URL is a fixed, predictable route (e.g., `/mirror`); no per-session token or authentication step is required to open a mirror view.
- The presenter and all mirror views operate on the same local network or on the same device; supporting mirrors across public internet with arbitrary latency is out of scope for this version.
- All question types currently supported by the application (open, closed, image rebus) will be rendered in the mirror view using the same content presentation as the presenter view, minus navigation controls.
- The exact set of UI elements hidden in the mirror view (beyond navigation buttons) will be finalized during planning through a review of the current presenter UI; the specification defines the principle (all interactive navigation controls hidden) rather than an exhaustive pixel-level list.
- Mobile and responsive layout of the mirror view is out of scope for this version; the primary use case is a desktop or large-display browser used as a second screen.
- Frontend and backend CI environments can execute the required automated tests (unit, integration, end-to-end) before merge.

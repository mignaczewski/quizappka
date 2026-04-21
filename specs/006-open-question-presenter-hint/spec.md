# Feature Specification: Open Question Presenter Hint

**Feature Branch**: `006-open-question-presenter-hint`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "As a presenter i want to have hidden text also in open questions. It should behave same as in closed questions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open Question with Presenter-Only Hint (Priority: P1)

The presenter is running an open question round and wants a private note or reference URL visible only on their screen. The hint might be the expected answer, a scoring guide, or a source link. The audience-facing mirror view never shows this content — the behavior is identical to the already-implemented presenter hint on closed questions.

**Why this priority**: This is the sole deliverable of this feature. It brings open questions to parity with closed questions for presenter experience and requires no dependency on other unimplemented features.

**Independent Test**: Can be fully tested by loading an open question that has a presenter hint, verifying the hint is visible in the presenter view, and verifying that the same question rendered in any mirror view shows no trace of the hint text or URL.

**Acceptance Scenarios**:

1. **Given** an open question has a presenter hint (plain text), **When** the presenter opens that question, **Then** the hint is displayed visibly on the presenter's screen alongside the question content.
2. **Given** an open question has a presenter hint (URL), **When** the presenter views the question, **Then** the URL is rendered as a clickable link in the presenter view.
3. **Given** an open question has a presenter hint, **When** a mirror view displays the same question, **Then** the hint is completely absent from the mirror rendering.
4. **Given** an open question has no presenter hint defined, **When** the presenter views that question, **Then** no hint area or placeholder is shown — the layout is identical to the current open question display.

---

### Test Evidence Expectations

- Unit tests must confirm the open question data model correctly carries the optional presenter hint field and that the hint is included in the presenter-facing API response.
- Frontend component tests must verify the hint renders in the presenter view and is absent from the mirror view, covering both plain text and URL variants.
- Tests must confirm that open questions without a hint defined produce no visible hint area in any view.

### Edge Cases

- What happens when a presenter hint URL contains special characters or is malformed? The raw text should be displayed safely rather than causing a rendering error or broken link.
- What happens when a presenter hint is an empty string? It should be treated the same as no hint being defined — no hint area is shown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support an optional presenter-only hint field on open questions that accepts either plain text or a URL.
- **FR-002**: System MUST render the open question presenter hint in the presenter view when the hint is defined.
- **FR-003**: System MUST NOT transmit or render the open question presenter hint in any mirror view or audience-facing route.
- **FR-004**: System MUST treat an absent or empty presenter hint on an open question as equivalent — no hint area or placeholder is displayed.
- **FR-005**: System MUST render a URL presenter hint as a clickable link in the presenter view.
- **FR-006**: System MUST define updated data contracts for the open question type, including the optional presenter hint field and its validation rules.
- **FR-007**: System MUST provide automated test coverage for the open question presenter hint before merge.

### Key Entities

- **Open Question** (extended): Existing question type; gains an optional `presenterHint` field that holds either a plain text note or a URL; hidden from non-presenter views. This mirrors the `presenterHint` field already present on `ClosedQuestion`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The presenter hint on open questions is never visible in any mirror view in automated tests, covering 100% of defined hint rendering paths.
- **SC-002**: The open question presenter hint behavior is visually and functionally indistinguishable from the closed question presenter hint behavior, verified by side-by-side component tests.
- **SC-003**: Open questions without a hint defined produce no layout shift or empty hint placeholder in any view, verified by automated tests.

## Assumptions

- The presenter hint behavior already implemented for closed questions (feature 005) is complete and in a stable state; this feature extends that pattern rather than changing it.
- The `presenterHint` field is excluded from mirror/audience-facing API responses by the same serialization mechanism already used for closed questions (e.g., `JsonIgnore` on mirror route serialization, or a dedicated DTO that omits the field).
- Category data files (JSON) will be updated manually by the quiz author to include the new field; no in-app question editing UI is in scope.
- Frontend and backend CI runners can execute the required automated tests before merge.

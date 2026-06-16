# Feature Specification: Question Title Field and Universal Presenter Hint

**Feature Branch**: `009-question-title-universal-hint`  
**Created**: 2026-06-16  
**Status**: Draft  
**Input**: User description: "I want to do some modification in question types - I want to have presenter hint available in all kind of questions and it should be visible only to a presenter. I want to add to all questions title field that will be used to show on list. I dont want to show full question content on question list"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Question List Shows Titles Instead of Full Content (Priority: P1)

The presenter is browsing the question list and sees a clean, concise title for each question rather than a truncated or full copy of the question body. For complex question types (meme, singing pianos) that have no readable text body, the title gives the list a meaningful label. The presenter can quickly identify and navigate to any question by its title alone.

**Why this priority**: This change affects every question type and every list rendering path. It is the structural foundation for the title field and must be in place before any other story can be validated in the list context. Delivering this alone already improves usability for quizzes with many questions.

**Independent Test**: Can be fully tested by loading a category that contains questions with titles defined, rendering the question list, and confirming that each list entry shows the title text and not the full question body or image reference.

**Acceptance Scenarios**:

1. **Given** a question has a title defined, **When** the question list is rendered, **Then** the list entry shows the title text and not the full question body or image references.
2. **Given** a question has no title defined, **When** the question list is rendered, **Then** the list entry shows a truncated version of the question content as a fallback (e.g., first 60 characters of the text body, or the question type label for image-only types).
3. **Given** multiple question types are present in the same category, **When** the question list is rendered, **Then** every entry consistently shows a title or its fallback — no entry is blank or broken.
4. **Given** a question title is very long, **When** the question list is rendered, **Then** the title is truncated with an ellipsis to preserve list layout consistency.

---

### User Story 2 - Presenter Hint on All Question Types (Priority: P2)

The presenter is running a quiz that contains meme questions or singing pianos questions. Just as with closed and open questions, the presenter wants to have a private note or reference URL available on-screen during those question types — for example a scoring note, the intended answer, or a background link. The hint is never visible in mirror views or any audience-facing display.

**Why this priority**: Closed and open questions already support a presenter hint (features 005 and 006). This story extends the same established mechanic to the remaining question types — meme and singing pianos — completing the universal coverage requested. It does not change existing behavior for closed or open questions.

**Independent Test**: Can be fully tested by loading a meme question and a singing pianos question each with a presenter hint defined, verifying the hint renders in the presenter view for both types, and verifying that connected mirror views show no hint content.

**Acceptance Scenarios**:

1. **Given** a meme question has a presenter hint (plain text), **When** the presenter opens that question, **Then** the hint is displayed in the presenter view alongside the question content.
2. **Given** a meme question has a presenter hint (URL), **When** the presenter opens that question, **Then** the URL is rendered as a clickable link in the presenter view.
3. **Given** a meme question has a presenter hint, **When** a mirror view displays the same question, **Then** the hint is completely absent from the mirror rendering.
4. **Given** a singing pianos question has a presenter hint (plain text or URL), **When** the presenter opens that question, **Then** the hint is displayed in the presenter view.
5. **Given** a singing pianos question has a presenter hint, **When** a mirror view displays the same question, **Then** the hint is completely absent from the mirror rendering.
6. **Given** any question type has no presenter hint defined, **When** any view displays that question, **Then** no hint area or placeholder is shown.

---

### Test Evidence Expectations

- **User Story 1** requires unit tests on all question data models confirming the optional `title` field is present and correctly serialized. Frontend component tests must verify the question list renders the title for questions that have one defined, and the correct fallback for questions that do not.
- **User Story 2** requires unit tests confirming the `presenterHint` field is present on meme and singing pianos data models and included in presenter-facing API responses. Frontend component tests must verify the hint renders in the presenter view and is absent from the mirror view for both meme and singing pianos types, covering both text and URL variants.
- All tests must cover the no-hint / no-title edge cases to ensure no empty placeholders appear.

### Edge Cases

- What happens when a question has an empty string title? It should be treated as no title defined — the fallback display applies.
- What happens when a question has no readable text body (e.g., a meme question) and no title is defined? The fallback should show a meaningful label such as the question type name.
- What happens when a presenter hint URL contains special characters or is malformed? The raw text should be displayed safely rather than causing a rendering error.
- What happens when a presenter hint is an empty string? It should be treated the same as no hint — no hint area is shown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support an optional `title` field on all question types (closed, open, meme, singing pianos).
- **FR-002**: System MUST display the `title` field as the primary label for each question in the question list view.
- **FR-003**: When no `title` is defined, the question list MUST fall back to a truncated version of the question's text content; for question types with no text body, the fallback MUST be a human-readable type label.
- **FR-004**: System MUST NOT display full question body content in the question list view.
- **FR-005**: System MUST support an optional presenter-only hint field on meme questions, accepting either plain text or a URL.
- **FR-006**: System MUST support an optional presenter-only hint field on singing pianos questions, accepting either plain text or a URL.
- **FR-007**: System MUST render the presenter hint for meme and singing pianos questions in the presenter view when the hint is defined.
- **FR-008**: System MUST NOT transmit or render the presenter hint for meme or singing pianos questions in any mirror view or audience-facing route.
- **FR-009**: System MUST treat an absent or empty presenter hint on any question type as equivalent — no hint area or placeholder is displayed.
- **FR-010**: System MUST render a URL presenter hint as a clickable link in the presenter view for all question types.
- **FR-011**: System MUST define updated data contracts for all question types to include the optional `title` field and the optional `presenterHint` field where not already present.
- **FR-012**: System MUST provide automated test coverage for the `title` field display logic and the extended presenter hint behavior before merge.

### Key Entities

- **Question (all types)** (extended): All question types (closed, open, meme, singing pianos) gain an optional `title` field (plain text, short label) used exclusively in list contexts.
- **Meme Question** (extended): Gains an optional `presenterHint` field (plain text or URL) hidden from non-presenter views, matching the pattern already used for closed and open questions.
- **Singing Pianos Question** (extended): Gains an optional `presenterHint` field (plain text or URL) hidden from non-presenter views, matching the pattern already used for closed and open questions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The question list shows a title or meaningful fallback for 100% of questions across all question types, verified by automated tests covering each type.
- **SC-002**: Full question body content (text, image references, answer options) is never displayed in the question list view, verified by automated tests.
- **SC-003**: Presenter hints on meme and singing pianos questions are never visible in any mirror view in automated tests, covering 100% of defined hint rendering paths.
- **SC-004**: The presenter hint behavior on meme and singing pianos questions is functionally and visually consistent with the already-implemented behavior on closed and open questions, verified by component tests.
- **SC-005**: Questions without a title defined produce no blank or broken list entries — the fallback is always visible and meaningful, verified by automated tests.

## Assumptions

- The `presenterHint` field already implemented for closed questions (feature 005) and open questions (feature 006) is complete and stable; this feature extends the same pattern to the remaining question types without altering existing behavior.
- The `title` field is optional to maintain backwards compatibility with existing quiz data files that do not include it; no data migration is required.
- Category and question data files (JSON) will be updated manually by the quiz author to include the new `title` and `presenterHint` fields; no in-app question editing UI is in scope.
- The truncation length for the fallback question list label (when no title is defined) is a UI detail to be decided during implementation; the spec requires only that full content is not shown.
- The `presenterHint` field is excluded from mirror/audience-facing API responses by the same serialization mechanism already in use for closed and open questions (e.g., a dedicated DTO that omits the field).
- Frontend and backend CI runners can execute the required automated tests before merge.

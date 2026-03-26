# Feature Specification: Question List Navigation

**Feature Branch**: `002-question-list-navigation`  
**Created**: 2026-03-26  
**Status**: Draft  
**Input**: User description: "Current version of application assumes that after opening category it shows all questions in queue and presenter can move to next or previous question. What i want is to open list of all questions after choosing category. When question is opened i want to have possibility to go back to category list."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Questions in a Category (Priority: P1)

After selecting a category, the presenter sees a list of all questions belonging to that category before opening any individual question. Each entry in the list shows enough information to identify the question.

**Why this priority**: This is the core change requested — replacing the immediate question-display mode with an intermediate list view. Without this, the rest of the navigation improvements have no entry point.

**Independent Test**: Can be fully tested by selecting a category and confirming that a list of questions is shown instead of jumping directly to the first question, without needing to open any individual question.

**Acceptance Scenarios**:

1. **Given** the presenter has selected a category, **When** the category opens, **Then** the application displays a list of all questions in that category instead of showing the first question automatically.
2. **Given** the question list is displayed, **When** the presenter views it, **Then** each list entry shows at minimum a distinguishing label (e.g., question number and a preview of the question text or type).
3. **Given** a category contains questions of different types, **When** the list is displayed, **Then** all question types appear in the list without being filtered out.
4. **Given** a category contains only one question, **When** the category opens, **Then** the list still appears (with a single entry) rather than opening that question automatically.

---

### User Story 2 - Open a Question from the List (Priority: P2)

From the question list, the presenter selects a single question and the application displays its full content.

**Why this priority**: Selecting a question from the list is the natural continuation of User Story 1 and provides the same presentation capability as the previous direct-display flow.

**Independent Test**: Can be fully tested by selecting a category, picking any question from the list, and verifying the full question content is displayed correctly for open, closed, and image rebus types.

**Acceptance Scenarios**:

1. **Given** the question list is displayed, **When** the presenter selects a question, **Then** the application displays that question's full content.
2. **Given** a question is open-ended, **When** it is opened from the list, **Then** the audience sees only the prompt text without answer choices.
3. **Given** a question is closed, **When** it is opened from the list, **Then** the audience sees the prompt text and all answer choices.
4. **Given** a question is an image rebus, **When** it is opened from the list, **Then** the audience sees the associated image and any supporting prompt.

---

### User Story 3 - Return to Question List from a Question (Priority: P3)

While viewing a question, the presenter can navigate back to the question list for the current category without losing context.

**Why this priority**: The explicit back-navigation to the question list is the second key change requested. It gives the presenter full control over which question to show next rather than forcing linear progression.

**Independent Test**: Can be fully tested by opening a question and confirming that a back action returns the presenter to the question list with the same category still selected.

**Acceptance Scenarios**:

1. **Given** the presenter is viewing an individual question, **When** the presenter activates the back action, **Then** the application returns to the question list for the current category.
2. **Given** the presenter returns to the question list, **When** the list is shown, **Then** it displays the same set of questions as before (order and content unchanged).
3. **Given** the presenter returns to the question list and selects a different question, **When** that question is opened, **Then** its full content is displayed correctly.

---

### Test Evidence Expectations

- User Story 1 requires frontend component tests verifying that the category-opening flow renders a list view and not the first question, and integration tests confirming all question entries from the category data are present in the rendered list.
- User Story 2 requires rendering tests for each question type (open, closed, image rebus) when opened from the list, and frontend tests asserting the correct question content matches the selected entry.
- User Story 3 requires navigation/routing tests confirming the back action from a question view returns to the correct category list, and state-preservation tests ensuring the list is not reset or re-filtered after returning.
- All three stories benefit from end-to-end tests covering the full presenter flow: category selection → question list → open question → back to list → open another question.

### Edge Cases

- A category contains only one question; the list must still appear with one entry rather than auto-opening.
- The presenter navigates back to the question list and then selects the same question again; the question must open correctly.
- The presenter opens the application with a deep-linked URL pointing directly to a question; the back action should still return to the question list for that question's category.
- A category has a large number of questions; the list must remain scrollable and all entries must be accessible.
- An image rebus question in the list has a missing or unloadable image; the list entry should still appear and the question detail page should degrade gracefully.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: After selecting a category, the system MUST display a list of all questions belonging to that category before presenting any individual question.
- **FR-002**: Each entry in the question list MUST display at least the question number and a short identifying label (question text preview or question type indicator) to allow the presenter to distinguish between questions.
- **FR-003**: The question list MUST include questions of all supported types (open, closed, image rebus) without filtering.
- **FR-004**: The presenter MUST be able to open any question from the question list by selecting its list entry.
- **FR-005**: When a question is open, the system MUST provide a clearly visible back action that returns the presenter to the question list for the current category.
- **FR-006**: Returning to the question list MUST preserve the original, unmodified list of questions (same order, same entries as when the category was first opened).
- **FR-007**: The existing previous/next question navigation controls MUST be removed or replaced as part of this change, since navigation between questions now occurs through the question list flow.
- **FR-008**: The system MUST define automated test coverage verifying the question list renders correctly, individual questions open from the list, and the back action returns to the correct list.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A presenter can reach any individual question in a category within two interactions from the category selection screen (select category → select question).
- **SC-002**: A presenter can return from any open question to the category's question list within one interaction.
- **SC-003**: 100% of questions in a category appear in the question list with no entries missing or duplicated.
- **SC-004**: The question list loads and becomes interactive in under one second after a category is selected, under normal operating conditions.
- **SC-005**: All existing automated tests for question rendering and category selection continue to pass after this navigation change is applied.

## Assumptions

- The primary user is a presenter operating the application on a screen shared with an audience; audience members do not interact with the application directly.
- The question list view replaces the previous linear next/previous navigation entirely — there is no requirement to keep both modes available simultaneously.
- Question ordering in the list follows the order defined in the source category data file, consistent with the prior sequential display behavior.
- The scope of this change is limited to frontend navigation flow; no changes to the backend question data API or data format are required.
- The application already loads the full question set for a category when the category is selected, so displaying the list does not require additional data fetching beyond what already occurs.
- Frontend and backend CI runners can execute the required automated tests before merge.

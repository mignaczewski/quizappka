# Feature Specification: Quiz Question Presentation

**Feature Branch**: `[001-quiz-display-webapp]`  
**Created**: 2026-03-24  
**Status**: Draft  
**Input**: User description: "Build a web application that will present a set of quiz questions from different categories. Questions can be open, closed, or image rebuses. Questions will be predefined in json files. The main purpose of application will be to display them to people."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a Quiz Category (Priority: P1)

As a presenter, I want to choose a quiz category and start a question set so I can quickly display a prepared quiz session to an audience.

**Why this priority**: Without category selection and quiz start, the application cannot deliver its primary purpose of presenting questions.

**Independent Test**: Can be fully tested by loading available quiz data, selecting one category, and confirming the first question for that category is displayed without depending on other categories.

**Acceptance Scenarios**:

1. **Given** predefined quiz data contains multiple categories, **When** the presenter opens the application, **Then** the application shows the available categories in a form that can be selected.
2. **Given** a presenter selects a category with at least one question, **When** the quiz session starts, **Then** the first question from that category is displayed with its category context.
3. **Given** the selected category has no valid questions, **When** the presenter tries to start it, **Then** the application prevents the session from starting and explains that the category content is unavailable.

---

### User Story 2 - Display Different Question Types (Priority: P2)

As an audience member, I want each question to be shown in a format that matches its type so I can understand the prompt clearly.

**Why this priority**: The application must support the core quiz content types named in scope, otherwise a significant portion of the prepared question set cannot be presented correctly.

**Independent Test**: Can be fully tested by opening a prepared set containing one open question, one closed question, and one image rebus, then confirming each renders with the right information and without unsupported fields appearing.

**Acceptance Scenarios**:

1. **Given** the current question is open-ended, **When** it is displayed, **Then** the audience sees the prompt text without answer options.
2. **Given** the current question is closed, **When** it is displayed, **Then** the audience sees the prompt text and the predefined answer choices.
3. **Given** the current question is an image rebus, **When** it is displayed, **Then** the audience sees the associated image and any supporting prompt text needed to interpret it.

---

### User Story 3 - Move Through the Question Set (Priority: P3)

As a presenter, I want to move through the questions in order so I can run the quiz smoothly for a live audience.

**Why this priority**: Once a category is started and questions render correctly, controlled progression through the set completes the basic presentation flow.

**Independent Test**: Can be fully tested by starting a category with multiple questions and verifying that navigation advances and returns within that category while preserving the displayed question order.

**Acceptance Scenarios**:

1. **Given** a quiz session has started and more questions remain, **When** the presenter moves to the next question, **Then** the next question in sequence is displayed.
2. **Given** the presenter is not on the first question, **When** the presenter moves to the previous question, **Then** the prior question in sequence is displayed.
3. **Given** the presenter reaches the final question in the set, **When** the presenter attempts to continue, **Then** the application indicates the category is complete and does not skip beyond the available question list.

### Test Evidence Expectations

- User Story 1 requires backend or data-loading validation that only valid categories and question sets are exposed, frontend coverage for category selection and quiz start behavior, and an integration test proving the selected category opens the correct first question.
- User Story 2 requires rendering tests for open, closed, and rebus questions, validation tests for missing or incompatible fields in predefined question data, and accessibility checks that question text and images remain understandable to users.
- User Story 3 requires user-flow tests for previous and next navigation, boundary-condition tests for the first and last question, and an integration test proving question order is preserved from the source data through presentation.

### Edge Cases

- A category file exists but contains malformed entries for one or more questions.
- A question declares a type that the application does not support.
- A closed question has no answer options or too few options to present meaningfully.
- An image rebus references an image that cannot be loaded.
- A category contains only one question and navigation controls reach both boundaries immediately.
- No categories are available when the application starts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST load predefined quiz questions from JSON files organized into categories.
- **FR-002**: The system MUST present a list of available quiz categories before a session starts.
- **FR-003**: The presenter MUST be able to start a quiz session for a selected category.
- **FR-004**: The system MUST display questions in the order defined for the selected category.
- **FR-005**: The system MUST support three question types: open questions, closed questions, and image rebuses.
- **FR-006**: The system MUST display open questions as prompt-only content without answer options.
- **FR-007**: The system MUST display closed questions with their predefined answer options.
- **FR-008**: The system MUST display image rebus questions with their associated image content and any accompanying prompt text.
- **FR-009**: The presenter MUST be able to move to the next and previous question within the active category.
- **FR-010**: The system MUST prevent navigation beyond the first or last available question in a category.
- **FR-011**: The system MUST clearly communicate when a category cannot be started because its data is missing, invalid, or empty.
- **FR-012**: The system MUST clearly communicate when individual questions cannot be displayed because their required data is incomplete or invalid.
- **FR-013**: The system MUST define the contract changes, validation rules, and failure behavior for every affected frontend-backend interaction.
- **FR-014**: The system MUST define the automated test coverage required to verify the feature before merge.
- **FR-015**: The system MUST preserve a consistent presentation layout so the currently displayed question type is immediately understandable to viewers.

### Key Entities *(include if feature involves data)*

- **Quiz Category**: A named grouping of quiz questions that can be selected and presented as one session.
- **Question**: A single quiz prompt belonging to one category, including its display order, question type, and the content needed for presentation.
- **Question Type**: A classification that determines how a question is presented, limited in scope to open, closed, and image rebus.
- **Answer Option**: A predefined choice associated with a closed question.
- **Media Asset Reference**: The information needed to locate and display an image for a rebus question.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A presenter can open the application, select a category, and display the first question in under 30 seconds on first use.
- **SC-002**: 100% of valid predefined questions in the supported formats are displayed without missing required content during a full category run.
- **SC-003**: 95% of navigation actions between questions result in the next intended screen being shown in under 1 second during normal use.
- **SC-004**: 90% of test participants can correctly distinguish whether the displayed question is open, closed, or rebus without facilitator explanation.
- **SC-005**: Invalid or unusable category data is identified before presentation begins in 100% of tested failure scenarios, with a user-facing explanation.

## Assumptions

- The initial release is intended for presentation only and does not require collecting player answers, scoring, timing, or rankings.
- Quiz content is prepared outside the application and made available as JSON files before a session begins.
- Each question belongs to exactly one category and has a defined order within that category.
- Image rebus questions reference assets that are intended to be available to the application at presentation time.
- The first release targets desktop and laptop web browsers used by a presenter in front of an audience.
- Frontend and backend validation environments are available to run the required automated checks before merge.

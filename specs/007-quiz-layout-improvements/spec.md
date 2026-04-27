# Feature Specification: Quiz Layout Improvements

**Feature Branch**: `007-quiz-layout-improvements`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: User description: "Now it is time to improve layout of solution. I want quiz to be more readable and use display in effective way."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Audience Sees Questions on a Large Display (Priority: P1)

As an audience member watching the mirror view on a projector or large screen, I want question content to fill the display space effectively so that the text and images are clearly readable from a distance.

**Why this priority**: The mirror view is the primary interface seen by the audience during a live quiz session. If it is not readable from a distance, the core value of the application is lost.

**Independent Test**: Can be fully tested by opening the mirror view in a full-browser window and displaying each question type (open, closed, image rebus, meme, singing pianos). Each should fill the viewport with large, clearly readable content without scrolling or visual clutter.

**Acceptance Scenarios**:

1. **Given** the mirror page is displayed in a full-browser window, **When** a question-detail screen is active, **Then** the question prompt text is large enough to be read from at least 5 meters away (minimum `h3`-level heading equivalent).
2. **Given** the mirror page is showing a closed question, **When** the answer options appear, **Then** each option is visually distinct and legible at the same viewing distance as the prompt.
3. **Given** the mirror page is showing an image rebus question, **When** the image loads, **Then** the image fills as much of the available vertical and horizontal space as possible without being cropped.
4. **Given** the mirror page shows a question, **When** no presenter interaction is needed from the audience, **Then** no presenter-only controls (Back button, navigation arrows) are visible on the mirror view.

---

### User Story 2 - Question Display Uses Screen Space Effectively (Priority: P2)

As a presenter, I want each question type displayed in a visually clear, well-structured layout that maximizes screen real estate so that I can confidently present content on any screen size.

**Why this priority**: After readable typography, effective use of screen space ensures that content does not feel cramped, misaligned, or lost in empty white space.

**Independent Test**: Can be fully tested by navigating to the question-detail page for each question type and verifying content scales proportionally, with prompts visually dominant and options clearly structured.

**Acceptance Scenarios**:

1. **Given** a closed question is shown on the question-detail page, **When** the question loads, **Then** answer options are presented as visually differentiated blocks rather than a plain text list, making them easy to scan at a glance.
2. **Given** an image rebus question is shown, **When** the image loads, **Then** the image expands to use the majority of available vertical space rather than being capped at a fixed small height.
3. **Given** a singing-pianos question is shown, **When** the boxes are displayed, **Then** the boxes are arranged in a grid that fills available width and each box is large enough to read its revealed text clearly.
4. **Given** any question type is shown, **When** the prompt is rendered, **Then** the prompt text is visually dominant — larger and more prominent than supporting details like the presenter hint.

---

### User Story 3 - Presenter Navigation Is Clean and Efficient (Priority: P3)

As a presenter, I want the category and question list pages to present information clearly and without clutter so that I can find and start questions quickly during a live session.

**Why this priority**: The presenter's navigation speed directly affects the flow of a live quiz. Clean layout reduces cognitive load when selecting the next question under time pressure.

**Independent Test**: Can be fully tested by opening the home page and question list page, verifying that categories and questions are laid out in a scannable format with clear headings and well-spaced entries, and that back navigation is always visible without scrolling.

**Acceptance Scenarios**:

1. **Given** the home page is loaded, **When** categories are displayed, **Then** each category is presented as a clearly separated, tappable card or row with sufficient spacing to prevent accidental selection.
2. **Given** the question list page is loaded, **When** questions are listed, **Then** each entry shows the question number and a short readable summary with sufficient vertical spacing between entries.
3. **Given** the presenter is on any page, **When** navigating back to the previous screen, **Then** the back navigation control is clearly visible and accessible without scrolling.

---

### Test Evidence Expectations

- User Story 1 requires component rendering tests for each question type on the mirror view at a wide viewport (1920×1080), confirming typography scale and image sizing via structural assertions.
- User Story 2 requires component-level rendering tests confirming each question type uses block-level answer layouts, proportional image containers, and dominant prompt text size; and integration tests confirming the question-detail page applies updates consistently.
- User Story 3 requires rendering tests for the home page and question list page confirming category cards and question entries are separated and labeled, and that the back control is rendered without scroll-dependent positioning.
- Manual verification is required for subjective legibility at projector distances; automated tests cover structural and proportional correctness.

### Edge Cases

- What happens when a question prompt is very long (more than 200 characters)? The layout must not overflow or truncate in a way that hides content; text must wrap gracefully.
- What happens when a closed question has more than 6 answer options? The layout must remain readable without requiring the audience to scroll the mirror view.
- What happens when an image is portrait-oriented with a very tall aspect ratio? The layout must constrain height to avoid the image pushing other content off-screen.
- What happens when the mirror view is resized mid-session? Layout must reflow gracefully without content disappearing.
- What happens when no question is active on the mirror view (idle state)? The idle state must still be vertically centered and clearly readable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The mirror view MUST display question prompt text at a typographic scale equivalent to a large heading (at minimum two levels above body text) so it is legible from a distance.
- **FR-002**: The mirror view MUST display closed question answer options as visually separated, block-level elements rather than a plain inline list.
- **FR-003**: The mirror view MUST display images using the full available viewport width and as much available viewport height as possible while maintaining aspect ratio and preventing overflow.
- **FR-004**: The mirror view MUST NOT display presenter-only controls (navigation buttons, back links) that are not relevant to the audience.
- **FR-005**: The question-detail presenter page MUST display question prompts at a typographic scale clearly larger than body text, making the prompt visually dominant on the screen.
- **FR-006**: The question-detail presenter page MUST display closed question answer options as visually differentiated blocks consistent with the mirror view structure.
- **FR-007**: The singing-pianos question layout MUST arrange piano boxes in a grid that fills available width, with each box large enough to display revealed text without truncation.
- **FR-008**: The home page category list MUST present each category as a distinct, tappable card or clearly separated row with sufficient spacing to prevent accidental selection.
- **FR-009**: The question list page MUST display each question entry with its sequential number and a short readable summary with sufficient vertical spacing between entries.
- **FR-010**: The presenter hint MUST remain visible exclusively in the presenter view and MUST NOT appear on the mirror view, maintaining the existing visibility rule while adapting to the new layout.
- **FR-011**: The system MUST provide automated test coverage confirming layout structure for each affected question type and page before merge.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every question type rendered on the mirror view passes a structural rendering check confirming the prompt text node uses a typographic scale at least two levels above the default body size.
- **SC-002**: Image rebus and meme images on the mirror view occupy at least 70% of available viewport height when no competing content is present, confirmed by layout assertions.
- **SC-003**: A presenter navigating from the category list to a specific question can complete the navigation in under 10 seconds without searching for controls.
- **SC-004**: All existing automated tests continue to pass after layout changes are applied, confirming no behavioral regressions.
- **SC-005**: Closed question answer options on both the mirror and presenter views render as block-level elements, confirmed by automated rendering tests.

## Assumptions

- The primary display target is a widescreen monitor or projector at 1280×720 or higher resolution; mobile-specific layout is out of scope for this feature.
- Dark/light theme preferences are not changed by this feature; visual improvements are applied within the existing default light theme.
- The existing MUI (Material UI) component library remains the styling foundation; no new design system or CSS framework is introduced.
- Structural layout changes to existing components are the scope; animations, transitions, and motion effects are out of scope.
- The mirror view does not require a fullscreen API toggle as part of this feature; the browser's native fullscreen capability is sufficient for projector use.
- The presenter hint text remains exclusive to the presenter view and is not surfaced on the mirror view, consistent with existing behavior from feature 006.

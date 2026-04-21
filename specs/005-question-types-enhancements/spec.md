# Feature Specification: Question Types Enhancements

**Feature Branch**: `005-question-types-enhancements`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "As a presenter I want to adjust existing categories as follow: 1. closed questions: this kind of questions should have some hidden text or hidden url that is visible only in presenter mode. Also there should be some more question types like: 1. meme question - in entry state it should have one picture and list of possible answers, and presenter should be able to show second version of the picture (it replace in view the first version of image). 2. singing pianos - it is question when there are 5 boxes that has some hidden text, after presenter click on the box the hidden text becomes visible"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Closed Question with Presenter-Only Hint (Priority: P1)

The presenter is running a closed question round and wants to have a private note or reference URL visible only on the presenter's screen. The hint might be the answer explanation, a scoring note, or a link to the source material. The audience-facing mirror view never shows this content.

**Why this priority**: This enhances an already-existing question type with minimal scope. It directly addresses the presenter's need for private context during a live quiz round and delivers value as a standalone change with no dependencies on the new question types.

**Independent Test**: Can be fully tested by loading a closed question that has a presenter hint, verifying the hint is visible in the presenter view, and verifying the same question rendered in mirror view shows no trace of the hint text or URL.

**Acceptance Scenarios**:

1. **Given** a closed question has a presenter hint (text or URL), **When** the presenter opens that question, **Then** the hint is displayed visibly on the presenter's screen alongside the question content.
2. **Given** a closed question has a presenter hint, **When** a mirror view displays the same question, **Then** the hint is completely absent from the mirror rendering.
3. **Given** a closed question has no presenter hint defined, **When** the presenter views that question, **Then** no hint area or placeholder is shown — the layout is identical to the current closed question display.
4. **Given** a closed question has a presenter URL hint, **When** the presenter views the question, **Then** the URL is rendered as a clickable link in the presenter view.

---

### User Story 2 - Meme Question with Image Reveal (Priority: P2)

The presenter is running a meme-style round where participants see a picture paired with a list of possible answers. After the audience has had time to respond, the presenter reveals a second version of the same image (the "punchline") that replaces the first image in both the presenter view and all connected mirror views.

**Why this priority**: This is a new question type that enriches the quiz experience with a visual reveal mechanic. It depends on the existing question display infrastructure and the presenter mirroring already built in feature 003, but it does not depend on the closed-question hint change (P1) nor the Singing Pianos type (P3).

**Independent Test**: Can be fully tested by loading a meme question in presenter mode, confirming the first image and answer list are shown, clicking the reveal action, and confirming the second image replaces the first in both presenter and mirror views.

**Acceptance Scenarios**:

1. **Given** the presenter opens a meme question, **When** the question is first displayed, **Then** only the first image and the list of possible answers are shown; the second image is not visible anywhere.
2. **Given** the presenter is on a meme question in its initial state, **When** the presenter triggers the image reveal action, **Then** the second image replaces the first image in the presenter view.
3. **Given** one or more mirror views are open and the presenter triggers the image reveal on a meme question, **When** the reveal action completes, **Then** all mirror views simultaneously switch from the first image to the second image.
4. **Given** a mirror view connects after the presenter has already revealed the second image, **When** the mirror loads the question state, **Then** it immediately shows the second image rather than the first.
5. **Given** the presenter navigates away from a meme question and returns to it, **When** the question is displayed again, **Then** it resets to the initial state showing the first image.

---

### User Story 3 - Singing Pianos Question with Box Reveals (Priority: P3)

The presenter runs a "singing pianos" round where five boxes are shown, each concealing a piece of text (for example a lyric fragment, a word, or a fact). The presenter progressively reveals the hidden text in each box by clicking on it, building suspense and guiding the audience through the answer step by step. Each box reveal is independent — the presenter can reveal them in any order.

**Why this priority**: This is a new interactive question type with the most complex reveal mechanic. It depends on the same presenter interaction and mirroring infrastructure as the meme question, but its independent reveal-per-box design makes it more complex to implement and test.

**Independent Test**: Can be fully tested by loading a singing pianos question in presenter mode, confirming all five boxes show concealed content, clicking each box in turn, and verifying each reveal is visible in both presenter and mirror views while unrevealed boxes remain hidden.

**Acceptance Scenarios**:

1. **Given** the presenter opens a singing pianos question, **When** the question is first displayed, **Then** all five boxes show a visual placeholder and no hint of the hidden text is visible in any view.
2. **Given** the presenter clicks on box N (1–5), **When** the click is registered, **Then** only that box transitions to show its hidden text; all unrevealed boxes remain concealed.
3. **Given** box N has been revealed, **When** mirror views are displaying the same question, **Then** box N shows its text in the mirror and all other unrevealed boxes remain hidden in the mirror.
4. **Given** a mirror view connects after some boxes have already been revealed, **When** the mirror loads the question state, **Then** it shows exactly the same set of revealed and hidden boxes as the presenter view.
5. **Given** all five boxes have been revealed by the presenter, **When** any view displays the question, **Then** all five boxes show their text content.
6. **Given** the presenter navigates away from a singing pianos question and returns to it, **When** the question is displayed again, **Then** all boxes reset to the hidden/concealed state.

---

### Test Evidence Expectations

- **User Story 1** requires unit tests confirming the closed question data model correctly carries the optional hint field and that the hint is present in the presenter-facing API response. Frontend component tests must verify the hint renders in presenter view and is absent from mirror view for both text and URL hint variants.
- **User Story 2** requires frontend component tests for the meme question in both initial and revealed states. Integration tests must confirm the reveal action propagates through the presenter hub to all connected mirror clients. A late-join scenario test must confirm a mirror connecting after reveal sees the second image.
- **User Story 3** requires frontend component tests for the singing pianos question verifying each box can be individually revealed and that unrevealed boxes are visually hidden. Integration tests must confirm per-box reveal state is broadcast to mirrored views. A late-join test must confirm a new mirror receives the full current reveal state. All five boxes, including edge cases of the first and last box, must be covered by tests.
- All new question types must be verified to render correctly in both presenter view and mirror view through end-to-end tests.

### Edge Cases

- What happens when a meme question has only one image defined (no second image)? The reveal button or action should not be available, and no broken image placeholder should appear.
- What happens when a singing pianos question has fewer than five hidden texts defined? Missing boxes should be hidden entirely rather than shown as empty or broken placeholders.
- What happens when the presenter rapidly clicks reveal on multiple singing pianos boxes in quick succession? Each reveal must be processed independently; no reveal must be lost or overwrite another.
- What happens when a presenter hint URL in a closed question contains special characters or is malformed? The raw text should be displayed safely rather than causing a rendering error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support an optional presenter-only hint field on closed questions that accepts either plain text or a URL.
- **FR-002**: System MUST render the closed question presenter hint in the presenter view when the hint is defined.
- **FR-003**: System MUST NOT transmit or render the closed question presenter hint in any mirror view or audience-facing route.
- **FR-004**: System MUST support a new "meme" question type that contains two image references and a list of text-based answer options.
- **FR-005**: System MUST display a meme question in its initial state showing the first image and the answer options list, with the second image hidden.
- **FR-006**: System MUST provide the presenter with an explicit action to reveal the second image of a meme question.
- **FR-007**: System MUST replace the first image with the second image in all views (presenter and all connected mirrors) when the presenter triggers the image reveal on a meme question.
- **FR-008**: System MUST support a new "singing pianos" question type that contains exactly five boxes, each holding a hidden text value.
- **FR-009**: System MUST display all five singing pianos boxes in a concealed state when the question is first presented.
- **FR-010**: System MUST allow the presenter to reveal individual boxes in any order by interacting with each box; revealing one box MUST NOT affect the state of other boxes.
- **FR-011**: System MUST propagate every box reveal of a singing pianos question to all connected mirror views in real time.
- **FR-012**: System MUST restore meme and singing pianos questions to their initial state (first image shown, all boxes hidden) when the presenter navigates away from and returns to the question.
- **FR-013**: Mirror views connecting to an active session MUST receive the current reveal state of any question already in progress (meme second-image or singing pianos partially revealed boxes).
- **FR-014**: System MUST define updated data contracts for each new and modified question type, including validation rules for required vs optional fields.
- **FR-015**: System MUST provide automated test coverage for all new question types and the closed question hint before merge.

### Key Entities

- **Closed Question** (extended): Existing question type; gains an optional `presenterHint` field that holds either a plain text note or a URL; hidden from non-presenter views.
- **Meme Question** (new): Question type with two image references (`entryImage`, `revealImage`) and a list of text-based answer options; reveal state is a boolean (`isRevealed`).
- **Singing Pianos Question** (new): Question type containing exactly five boxes; each box has hidden text content; reveal state is tracked per box (five independent boolean flags).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All three enhancements (closed question hint, meme question, singing pianos question) are deliverable and testable independently without requiring the others.
- **SC-002**: The presenter hint on closed questions is never visible in any mirror view in automated tests, covering 100% of defined hint rendering paths.
- **SC-003**: The meme image reveal propagates to all connected mirror views in under one second under normal network conditions.
- **SC-004**: All five singing pianos box reveals propagate to mirror views individually and in under one second per reveal.
- **SC-005**: Mirror views joining an in-progress session display the correct current reveal state for meme questions and singing pianos questions on first load, verified by automated late-join tests.
- **SC-006**: Navigating away from and back to a meme or singing pianos question resets the question to its initial state in 100% of test executions.

## Assumptions

- The presenter mirroring infrastructure (SignalR hub, mirror route, state broadcasting) from feature 003 is already in place and will be extended rather than rebuilt.
- Answer options for the meme question are text-based only, consistent with the existing `ClosedQuestion` answer option format; no image-based answer options are in scope.
- The number of boxes in a singing pianos question is fixed at five; variable box counts are out of scope.
- Box reveal state and meme reveal state are session-scoped and not persisted to disk between application restarts.
- Category data files (JSON) will be updated manually by the quiz author to include the new fields; no in-app question editing UI is in scope.
- A meme question with a missing second image is treated as a configuration error; the reveal action is disabled rather than showing a broken image.
- Frontend and backend CI runners can execute the required automated tests before merge.

# Feature Specification: React Refactor — useCallback & Revealed State

**Feature Branch**: `008-usecallback-revealed-state`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "I want to refactor some code to work more predictable and be more error proof. To make UI more efficient I want you to use useCallback in methods that are passed to components to prevent rerendering. Also in singing pianos I want you to refactor revealed state to be array of objects {id: string number, revealed: boolean}. It will help to determine which box is revealed without hacks."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Singing Pianos revealed state uses identity-based objects (Priority: P1)

A presenter reveals individual piano boxes on the Singing Pianos question screen. Currently the application tracks which boxes are revealed via a positional boolean array (`boolean[]`), meaning the system correlates a box to its revealed status by relying on its array index. If the boxes were ever reordered or if an index is off by one, the wrong box appears revealed — a silent, hard-to-debug bug.

After this refactor the revealed state must be stored as a collection of objects that pair each box's own stable identifier with a boolean flag (`{ id: string | number, revealed: boolean }`). The component and the page both read and write this new structure exclusively.

**Why this priority**: Eliminates an index-coupling fragility that is the root cause of potential reveal mis-matches. All other changes in this feature depend on the new type being established first.

**Independent Test**: Can be fully tested by rendering `SingingPianos` with the new object-array prop and verifying that only boxes whose `id` matches a revealed entry show their hidden text, regardless of the order the revealed entries appear in.

**Acceptance Scenarios**:

1. **Given** a Singing Pianos question with 5 boxes, **When** `revealedBoxes` contains `[{ id: "box3", revealed: true }]`, **Then** only the box with `id === "box3"` shows its hidden text; all other boxes show `?`.
2. **Given** a revealed-box entry whose `revealed` flag is `false`, **When** the component renders, **Then** that box shows `?` even though its id appears in the array.
3. **Given** a presenter clicks an unrevealed box, **When** the reveal handler fires, **Then** a new entry `{ id: <boxId>, revealed: true }` is appended (or an existing entry is updated) and the change propagates to the hub and the mirror page.
4. **Given** a presenter clicks an already-revealed box, **When** the click event fires, **Then** no state change occurs and `onBoxReveal` is not called.
5. **Given** the mirror page receives an updated reveal state from the hub, **When** it renders `SingingPianos`, **Then** it uses the same object-array structure to determine which boxes are revealed.

---

### User Story 2 — Callback props are stable across re-renders (Priority: P2)

Callback functions created inline inside a parent component's render body produce a new function reference on every render. Child components that receive these as props will re-render unnecessarily even when nothing relevant has changed, causing visible flicker in complex question views and degrading overall UI responsiveness.

After this refactor, every function that is passed as a prop to a child component must be wrapped in `useCallback` with a minimal, correct dependency array so that its identity only changes when its dependencies genuinely change.

**Why this priority**: Builds on the stable state shape from Story 1. The `onBoxReveal` callback's dependency array must be corrected alongside the type change; doing it in isolation would leave the array pointing at an already-changed type.

**Independent Test**: Can be fully tested by verifying through unit tests that child components do not re-render when the parent re-renders for unrelated reasons (e.g., sibling state change).

**Acceptance Scenarios**:

1. **Given** `QuestionDetailPage` re-renders due to an unrelated state update, **When** `QuestionDisplay` receives the same `onReveal` and `onBoxReveal` props, **Then** neither callback has a new reference and child components do not re-render.
2. **Given** `onBoxReveal` is wrapped in `useCallback`, **When** its dependency array is defined, **Then** it must not include `revealState` directly because the updater uses the functional form of `setState` — including stale state in the deps array would cause unnecessary recreations.
3. **Given** `handleBack` is a navigation callback defined inside `QuestionDetailPage`, **When** it is passed as an `onClick` handler, **Then** it must be stable (wrapped in `useCallback`) with `[categoryId, navigate]` as dependencies.
4. **Given** the `onReveal` handler for meme questions is defined inline today, **When** it is extracted and wrapped in `useCallback`, **Then** it must carry the correct dependency array covering `revealState`, `categoryId`, `questionId`.

---

### User Story 3 — Existing behaviour is preserved and covered by automated tests (Priority: P3)

Any refactoring change risks introducing regressions. The existing test suite must be updated to reflect the new revealed-state type and extended to cover the callback-stability guarantees described above.

**Why this priority**: Validation layer. Without updated and green tests, the first two stories cannot be considered complete.

**Independent Test**: Run the full frontend test suite (`vitest`) and confirm zero failures after all changes are applied.

**Acceptance Scenarios**:

1. **Given** the `SingingPianos` component tests, **When** they run after the type change, **Then** all existing behaviour tests pass with the new `{ id, revealed }` object-array prop format.
2. **Given** new tests for callback stability are added, **When** the parent renders with an unchanged question and reveal state, **Then** the child does not re-render (verified via `vi.fn` render spy or `React.memo` wrapping in test).
3. **Given** the full test suite, **When** all changes are merged, **Then** no previously-passing test is broken.

---

### Test Evidence Expectations

- **Frontend unit tests** (`vitest` + React Testing Library):
  - `SingingPianos.test.tsx` must be updated to pass `revealedBoxes` as `{ id, revealed }[]` and assert by identity (box `id`) rather than by index.
  - New tests for `onBoxReveal` state logic in `QuestionDetailPage` must verify the correct object is produced and that the functional updater pattern does not require `revealState` in the dep array.
  - New render-count tests (using `vi.fn()` spies or `React.memo` wrappers) must confirm callbacks are not recreated unnecessarily.
- **No backend tests are required** — this change is entirely within the frontend React layer.
- Manual verification is not expected for green-field behaviour; automated coverage is sufficient.

### Edge Cases

- What happens when `revealedBoxes` is `null` or `undefined`? All boxes must default to unrevealed.
- What happens when a box `id` in `revealedBoxes` does not match any `PianoBox.id` in the question? That entry must be silently ignored; no runtime error.
- What happens when the same `id` appears multiple times in `revealedBoxes`? The last matching entry wins (or the first — the implementation must pick one rule and document it).
- What happens if `onBoxReveal` fires rapidly for the same box before the state update completes? The functional updater must handle idempotent reveals (re-revealing an already-revealed box changes nothing).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `RevealState` type's `singingPianosBoxesRevealed` field MUST change from `boolean[] | null` to `Array<{ id: string | number, revealed: boolean }> | null`.
- **FR-002**: The `SingingPianos` component's `revealedBoxes` prop MUST accept the new `Array<{ id: string | number, revealed: boolean }>` type and determine reveal status by matching `box.id` against the entries' `id` field, not by array index.
- **FR-003**: `QuestionDetailPage` MUST build and update `singingPianosBoxesRevealed` as an object array, adding or updating entries identified by box `id` when a box is revealed.
- **FR-004**: `QuestionDetailPage` MUST wrap `onBoxReveal` in `useCallback` with a dependency array that does NOT include `revealState` (the functional `setState` updater already captures the previous state safely).
- **FR-005**: `QuestionDetailPage` MUST wrap `onReveal` (the meme-image reveal handler) in `useCallback` with a dependency array that covers all values it closes over (`revealState`, `categoryId`, `questionId`).
- **FR-006**: `QuestionDetailPage` MUST wrap `handleBack` in `useCallback` with dependencies `[categoryId, navigate]`.
- **FR-007**: All existing `SingingPianos` unit tests MUST be updated to use the new prop format and continue to pass.
- **FR-008**: New unit tests MUST be added to verify that callback functions passed to child components do not change reference when the parent re-renders due to unrelated state changes.
- **FR-009**: The hub `UpdateState` call inside `onBoxReveal` MUST continue to send the full `RevealState` (including the updated `singingPianosBoxesRevealed` object array) to keep the mirror page in sync.
- **FR-010**: System MUST define the contract changes, validation rules, and failure behaviour for every affected frontend–backend interaction — specifically confirming that the hub payload shape change is backward-compatible or that the mirror page is updated in the same PR.
- **FR-011**: System MUST define the automated test coverage required to verify the feature before merge.

### Key Entities

- **RevealState**: Frontend-only state object tracking which question elements have been revealed. After this feature its `singingPianosBoxesRevealed` field holds an array of `{ id: string | number, revealed: boolean }` objects.
- **PianoBox**: Immutable data from the API describing a single piano box (`id: string`, `hiddenText: string`). Its `id` becomes the stable key used to match against revealed entries.
- **SingingPianosQuestion**: Question type composed of a prompt and an ordered list of `PianoBox` items. The component rendering it must match revealed entries by `PianoBox.id`, not by position.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Revealing a specific piano box by clicking it always shows the correct box's hidden text, verified by targeted unit tests matching on `box.id` rather than array position.
- **SC-002**: No child component re-renders when the parent's unrelated state changes, confirmed by at least one automated render-count test per callback.
- **SC-003**: Zero regressions — all tests that passed before the change continue to pass after.
- **SC-004**: The `onBoxReveal` callback's dependency array contains no direct reference to `revealState`, confirmed by code review and/or lint rule.
- **SC-005**: The mirror page continues to show the correct revealed boxes after a hub state update, validated by the existing hub-integration test or a new one.

## Assumptions

- The hub (`UpdateState`) payload is consumed only by the frontend mirror page; no backend persistence of `singingPianosBoxesRevealed` exists, so the shape change is purely a frontend concern and does not require an API version bump.
- `PianoBox.id` is stable and unique within a question — it will not change between renders or page reloads.
- The `id` type in `{ id: string | number, revealed: boolean }` will be constrained to `string` in practice (matching `PianoBox.id: string`), but the type definition allows `number` for forward compatibility.
- Mobile support and accessibility changes are out of scope for this refactor.
- The frontend CI runner can execute `vitest` before merge.

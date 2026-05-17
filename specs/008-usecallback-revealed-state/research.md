# Research: React Refactor — useCallback & Revealed State

**Date**: 2026-05-17  
**Feature branch**: `008-usecallback-revealed-state`

All decisions below were resolved through codebase inspection; no external research was required.

---

## Decision 1: Named type vs. inline for the revealed-box object

**Decision**: Introduce a named `PianoBoxReveal` interface in `types/quiz.ts`.

**Rationale**: The type `{ id: string, revealed: boolean }` is used in three places — the `RevealState` definition, the `SingingPianos` props interface, and the `QuestionDetailPage` state updater. A named interface prevents the three from drifting and makes intent explicit.

**Alternatives considered**:  
- Inline `{ id: string, revealed: boolean }[]` everywhere — rejected because duplicated inline types diverge silently.

---

## Decision 2: `id` field type — `string` only vs. `string | number`

**Decision**: Constrain `PianoBoxReveal.id` to `string` only.

**Rationale**: `PianoBox.id` is typed as `string` throughout the codebase (see `types/quiz.ts` and all JSON fixtures). There is no numeric id in the data model. Allowing `number` only widens the type unnecessarily and would require casts at call sites.

**Alternatives considered**:  
- `string | number` (as in the original spec suggestion) — rejected because `PianoBox.id` is always `string`; the union adds no value and obscures intent.

---

## Decision 3: Duplicate `id` entries in `revealedBoxes` — which wins?

**Decision**: First matching entry wins (standard `.find()` semantics).

**Rationale**: Duplicate IDs are an invalid state that should never occur. If they do, the first-entry-wins rule is deterministic, matches the standard `Array.prototype.find` behaviour, and produces no additional code. A "last wins" rule would require a `findLast` call.

**Alternatives considered**:  
- Last entry wins — rejected; requires `findLast` and is less idiomatic.
- Error/throw on duplicate — rejected; overly defensive for a purely frontend, in-memory state.

---

## Decision 4: `onBoxReveal` parameter signature change

**Decision**: Change `onBoxReveal(index: number)` to `onBoxReveal(boxId: string)`.

**Rationale**: The entire point of the refactor is to use stable identity (`PianoBox.id`) instead of positional index. Keeping `index` as the parameter and deriving `id` inside `QuestionDetailPage` would preserve the index dependency at the call site. Passing `boxId` directly makes the contract explicit all the way through the component tree (`SingingPianos` → `QuestionDisplay` → `QuestionDetailPage`).

**Alternatives considered**:  
- Keep `index` as parameter, look up `box.id` inside `QuestionDetailPage` — rejected; `QuestionDetailPage`'s `onBoxReveal` handler would then need `question` in its dependency array, which reintroduces a stale closure risk.

---

## Decision 5: `useCallback` dependency array for `onBoxReveal`

**Decision**: Dependency array is `[categoryId, questionId]` only — **not** `revealState`, **not** `question`.

**Rationale**:  
- The state updater uses the functional form `setRevealState(current => ...)`, so the current reveal state is read from the live `current` argument, not from a closure over `revealState`. Including `revealState` would cause the callback to be recreated on every box reveal, defeating the purpose.  
- `question` is no longer needed because the handler receives `boxId: string` directly — it no longer needs to look up box data.  
- `categoryId` and `questionId` are needed for the hub `UpdateState` invocation.

**Alternatives considered**:  
- Include `revealState` in deps — rejected; causes callback churn and was the existing bug.
- Include `question` in deps — rejected; not needed after signature change.

---

## Decision 6: `onReveal` (meme image reveal) dependency array

**Decision**: `[revealState, categoryId, questionId]`.

**Rationale**: Unlike `onBoxReveal`, the meme reveal handler reads `revealState` directly to spread it (`{ ...revealState, memeImageRevealed: true }`) outside the `setState` call, so `revealState` is a genuine closure dependency. Excluding it would cause a stale-state bug.

**Alternatives considered**:  
- Functional updater pattern (like `onBoxReveal`) — would also work and eliminate `revealState` from deps, but is a larger refactor. The current approach is correct and simpler.

---

## Decision 7: `handleBack` wrapping

**Decision**: Wrap in `useCallback` with `[categoryId, navigate]`.

**Rationale**: `handleBack` is passed as an `onClick` to a `Button` child. Without `useCallback`, a new function is created each render. `navigate` is stable (React Router guarantee), but `categoryId` is a parameter from `useParams`.

**Alternatives considered**:  
- Leave as inline arrow — rejected; inconsistent with the goal of stable callback props.

---

## Decision 8: Hub payload backward compatibility

**Decision**: No special versioning needed. Both sender and receiver are updated in the same PR.

**Rationale**: The SignalR hub is only used between `QuestionDetailPage` (sender) and `MirrorPage` (receiver). There is no server-side persistence. The type change in `types/quiz.ts` is the single source of truth for both. Running `tsc --noEmit` after the change is sufficient integration validation.

**Alternatives considered**:  
- Support both old `boolean[]` and new object-array shape simultaneously — rejected; adds unnecessary complexity when both sides are updated atomically.

---

## Decision 9: Idempotent reveal handling

**Decision**: If `boxId` is already in the revealed list with `revealed: true`, return the existing state unchanged from inside the `setState` updater (return `currentReveal` unmodified).

**Rationale**: React batches state updates; returning the same reference tells React not to re-render. This also means rapid double-clicks on the same box produce no extra hub invocations.

**Alternatives considered**:  
- Always push a new object (duplicate) and let the `find` pick the first — rejected; produces duplicate entries in the array over time.

---

## No Unknowns Remaining

All NEEDS CLARIFICATION items are resolved. Implementation may proceed.

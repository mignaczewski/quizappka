# Data Model: React Refactor — useCallback & Revealed State

**Date**: 2026-05-17  
**Feature branch**: `008-usecallback-revealed-state`

---

## Entities

### PianoBoxReveal *(new)*

Represents the revealed status of a single Singing Pianos box, keyed by the box's stable identity.

| Field     | Type      | Description |
|-----------|-----------|-------------|
| `id`      | `string`  | The `PianoBox.id` this entry corresponds to. Must match exactly one `PianoBox.id` in the question. |
| `revealed`| `boolean` | `true` if the box has been revealed; `false` if it is still hidden. |

**Validation rules**:
- `id` must be a non-empty string matching a known `PianoBox.id` in the current question.
- Unknown `id` values (no matching `PianoBox.id`) are silently ignored when rendering.
- If the same `id` appears more than once in the array, the **first** matching entry wins.
- Entries with `revealed: false` are treated identically to absent entries (box is unrevealed).

**State transitions**:
```
unrevealed (absent or { revealed: false })
  ──onBoxReveal(boxId)──▶  { id: boxId, revealed: true }
                                   │
                          (terminal — no un-reveal)
```

---

### RevealState *(modified)*

Tracks all reveal events for the currently displayed question. The `singingPianosBoxesRevealed` field changes type.

| Field                          | Type                        | Before         | After                      |
|--------------------------------|-----------------------------|----------------|----------------------------|
| `memeImageRevealed`            | `boolean \| null`           | unchanged      | unchanged                  |
| `singingPianosBoxesRevealed`   | `boolean[] \| null`         | positional     | `PianoBoxReveal[] \| null` |

**Constraints**:
- `singingPianosBoxesRevealed` is `null` or `undefined` until the first box is revealed.
- The array only grows (entries are appended or updated in-place); entries are never removed.
- The shape is shared between `QuestionDetailPage` (writer) and `MirrorPage` (reader) through the SignalR hub payload.

---

### SingingPianosQuestion *(unchanged)*

Existing type. Listed here for reference because `PianoBox.id` is the key that `PianoBoxReveal.id` must match.

| Field    | Type         | Notes |
|----------|--------------|-------|
| `id`     | `string`     | Question ID |
| `type`   | `'singing-pianos'` | Discriminant |
| `prompt` | `string`     | Display text |
| `boxes`  | `PianoBox[]` | Ordered list of boxes |

---

### PianoBox *(unchanged)*

| Field        | Type     | Notes |
|--------------|----------|-------|
| `id`         | `string` | Stable unique identifier — this is the key used in `PianoBoxReveal.id` |
| `hiddenText` | `string` | Text shown after reveal |

---

## Callback Signatures

These are not data model types but are part of the refactored interface surface. Documented here because the `onBoxReveal` signature change affects the prop contract of two components.

### `onBoxReveal` *(signature change)*

| | Before | After |
|-|--------|-------|
| Parameter | `index: number` | `boxId: string` |
| Semantics | "reveal box at position N" | "reveal box with this id" |
| Affected props | `SingingPianos.onBoxReveal`, `QuestionDisplay.onBoxReveal` | same |

### `onReveal` *(signature unchanged)*

`() => void` — triggers meme image reveal. No parameter change.

### `handleBack` *(no interface change)*

`() => void` — internal navigation handler, now wrapped in `useCallback`. Not exposed as a prop.

---

## Type Definitions (TypeScript)

```ts
// types/quiz.ts

export interface PianoBoxReveal {
  id: string;
  revealed: boolean;
}

export interface RevealState {
  memeImageRevealed?: boolean | null;
  singingPianosBoxesRevealed?: PianoBoxReveal[] | null;  // was: boolean[] | null
}
```

---

## Impact Matrix

| File | Change |
|------|--------|
| `src/types/quiz.ts` | Add `PianoBoxReveal`; update `RevealState.singingPianosBoxesRevealed` |
| `src/components/SingingPianos.tsx` | `revealedBoxes` prop: `boolean[]` → `PianoBoxReveal[]`; lookup by `id`; `onBoxReveal(box.id)` |
| `src/components/QuestionDisplay.tsx` | `onBoxReveal` prop type: `(index: number) => void` → `(boxId: string) => void` |
| `src/pages/QuestionDetailPage.tsx` | `onBoxReveal` handler signature; useCallback deps; add `useCallback` to `handleBack` and `onReveal` |
| `src/pages/MirrorPage.tsx` | No logic change; type propagates automatically via shared `RevealState` |
| `src/components/__tests__/SingingPianos.test.tsx` | All `revealedBoxes` fixtures updated to `PianoBoxReveal[]` |
| `src/components/__tests__/QuestionDisplay.test.tsx` | `singingPianosBoxesRevealed` fixture updated |
| `src/pages/__tests__/QuestionDetailPage.test.tsx` | New tests for box reveal state, callback stability |

# Contract: SignalR Hub — RevealState Payload

**Date**: 2026-05-17  
**Feature branch**: `008-usecallback-revealed-state`  
**Scope**: Frontend-only — the SignalR hub relays this payload from `QuestionDetailPage` (sender) to `MirrorPage` (receiver). There is no server-side persistence.

---

## Overview

The presenter hub method `UpdateState` is invoked by `QuestionDetailPage` whenever reveal state changes. The ASP.NET Core hub broadcasts the payload back to all connected mirror clients via the `StateUpdated` event. Both sides use the shared `RevealState` type from `src/types/quiz.ts`.

This contract documents the **shape change** introduced by this feature.

---

## Sender — `QuestionDetailPage`

### Hub method invoked

```
hub.invoke("UpdateState", payload)
```

### Payload shape (after this feature)

```ts
{
  screen: "question-detail",
  categoryId: string,
  questionId: string,
  revealState: {
    memeImageRevealed?: boolean | null,
    singingPianosBoxesRevealed?: Array<{
      id: string,       // PianoBox.id
      revealed: boolean
    }> | null
  }
}
```

### Change from previous shape

| Field | Before | After |
|-------|--------|-------|
| `singingPianosBoxesRevealed` | `boolean[]` | `Array<{ id: string, revealed: boolean }>` |

---

## Receiver — `MirrorPage`

### Hub event listened to

```
connection.on("StateUpdated", (payload: StateUpdatedPayload) => { ... })
```

### Processing

`MirrorPage` receives the full payload and stores it as `RevealState`. It passes `revealState.singingPianosBoxesRevealed` to `SingingPianos` via `QuestionDisplay`. The component performs a `.find()` on the array to determine which boxes to reveal.

No parsing or migration logic is needed — both sides share the same TypeScript type (`RevealState`), so the shape is enforced at compile time.

---

## Backward Compatibility

**Breaking change**: The field `singingPianosBoxesRevealed` changes from a positional boolean array to an identity-keyed object array. Old boolean-array payloads emitted by a previous browser session would be misread by the new `SingingPianos` component.

**Mitigation**: Both sender and receiver are updated atomically in this PR. No versioned hub is required. Because there is no server-side persistence, there are no stored payloads to migrate.

---

## Failure Modes

| Scenario | Behavior |
|----------|----------|
| Hub not connected | `invoke` throws; caught with `.catch(() => {})` — reveal state is still updated locally, hub update is best-effort |
| `singingPianosBoxesRevealed` is `null` or `undefined` | `SingingPianos` treats all boxes as unrevealed |
| Entry `id` in `singingPianosBoxesRevealed` does not match any `PianoBox.id` | Entry is silently ignored; no runtime error |
| `revealed: false` entry present | Box is treated as unrevealed (same as absent) |

---

## Validation

TypeScript compile check (`tsc --noEmit`) is the integration gate. Since both sender and receiver import `RevealState` from the same file, a type mismatch is a compile error. No additional runtime validation is performed on the hub payload.

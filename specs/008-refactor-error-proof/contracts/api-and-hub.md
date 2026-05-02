# API Contracts: Code Refactoring for Predictability and Error Safety

**Branch**: `008-refactor-error-proof` | **Date**: 2026-05-02

---

## 1. REST API — Category Detail Response (changed)

### Endpoint
`GET /api/quiz/categories/{id}`  
`GET /api/quiz/presenter/categories/{id}`

### Change
All question objects in the `questions` array now carry an optional `validationError` field. This field is absent (or `null`) for valid questions and contains a human-readable message for structurally incomplete questions.

**Before**:
```json
{
  "id": "cat1",
  "name": "Pianos",
  "questions": [
    { "type": "singing-pianos", "id": "q1", "prompt": "Name the tune", "boxes": [] }
  ]
}
```

**After**:
```json
{
  "id": "cat1",
  "name": "Pianos",
  "questions": [
    {
      "type": "singing-pianos",
      "id": "q1",
      "prompt": "Name the tune",
      "boxes": [],
      "validationError": "No boxes defined"
    }
  ]
}
```

### Affected question types and messages

| Type | Condition | `validationError` message |
|------|-----------|--------------------------|
| `singing-pianos` | `boxes` array is empty | `"No boxes defined"` |
| `meme` | `entryImage` is empty or missing | `"Missing entry image"` |

### Backward compatibility
- Questions that were previously excluded by `FilterValidQuestions` for other reasons (closed question with <2 options, image-rebus with empty imageRef) continue to be excluded and are not served.
- Questions without structural errors have no `validationError` field in the response (omitted when null).
- Clients that ignore unknown fields are not affected.

---

## 2. SignalR Hub — `RevealState` Wire Format (breaking change)

### Hub method: `UpdateState`
**Direction**: Presenter client → server → all clients (broadcast)

### Change
`singingPianosBoxesRevealed` in `RevealState` changes from a positional `boolean[]` to an array of objects keyed by box `id`.

**Before**:
```json
{
  "screen": "question-detail",
  "categoryId": "cat1",
  "questionId": "q1",
  "revealState": {
    "memeImageRevealed": null,
    "singingPianosBoxesRevealed": [true, false, true]
  }
}
```

**After**:
```json
{
  "screen": "question-detail",
  "categoryId": "cat1",
  "questionId": "q1",
  "revealState": {
    "memeImageRevealed": null,
    "singingPianosBoxesRevealed": [
      { "id": "box-1", "revealed": true },
      { "id": "box-2", "revealed": false },
      { "id": "box-3", "revealed": true }
    ]
  }
}
```

### RevealedBox object schema

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes — matches `PianoBox.id` |
| `revealed` | `boolean` | Yes |

### Affected clients
- **Presenter client** (`QuestionDetailPage.tsx`): sends updated format
- **Mirror client** (`MirrorPage.tsx`): receives and uses updated format
- **Late-joiner sync** (`PresenterHub.OnConnectedAsync`): broadcasts stored state in new format

### Migration
This is a same-repo, same-deployment breaking change. Frontend and backend are updated atomically. No migration path for external clients is required.

### Hub method: `UpdateState` — guard on empty params
The presenter client now guards against sending `UpdateState` when `categoryId` or `questionId` is empty. The server-side `PresenterHub.UpdateState` validation (screen allowlist, `HubException` on invalid screen) is unchanged.

---

## 3. No New Endpoints

No new REST endpoints are introduced. All changes are to the schema of existing responses and the wire format of an existing hub method.

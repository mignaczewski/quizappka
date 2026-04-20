# API Contract: Question Types Enhancements

**Feature**: Question Types Enhancements  
**Branch**: `005-question-types-enhancements`  
**Spec Reference**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014  
**Date**: 2026-04-20  
**Extends**: `001-quiz-display-webapp/contracts/quiz-api.md` (base REST contract), `003-presenter-mirroring-mode/contracts/signalr-hub.md` (SignalR contract)

---

## Overview

This document specifies the contract changes introduced by this feature:

1. `GET /api/quiz/categories/{id}` — **modified**: new question type discriminators added; `presenterHint` explicitly excluded.
2. `GET /api/quiz/presenter/categories/{id}` — **new**: presenter-only endpoint; includes `presenterHint` on closed questions.
3. **SignalR `UpdateState` hub method** — **modified**: `PresenterStateDto` payload gains an optional `revealState` field.
4. **SignalR `StateUpdated` hub event** — **modified**: same payload shape as above; broadcast to all clients including mirrors.

---

## Base URL

```
/api/quiz           ← public/mirror-safe (unchanged)
/api/quiz/presenter ← presenter-only (new base path)
```

---

## Modified: GET /api/quiz/categories/{id}

**Change**: The response now includes `meme` and `singing-pianos` question types in the `questions` array. `presenterHint` is NEVER included in this response, regardless of what is defined in the source data file.

### Success Response (200 OK) — updated question type discriminators

```json
{
  "id": "example-category",
  "name": "Example Category",
  "questions": [
    {
      "id": "q1",
      "type": "open",
      "prompt": "What year did World War II end?"
    },
    {
      "id": "q2",
      "type": "closed",
      "prompt": "Which country hosted the 2020 Summer Olympics?",
      "options": [
        { "id": "a", "text": "Japan" },
        { "id": "b", "text": "France" }
      ]
    },
    {
      "id": "q3",
      "type": "meme",
      "prompt": "What is this person feeling?",
      "entryImage": "meme-q3-entry.jpg",
      "revealImage": "meme-q3-reveal.jpg",
      "options": [
        { "id": "a", "text": "Confused" },
        { "id": "b", "text": "Excited" }
      ]
    },
    {
      "id": "q4",
      "type": "singing-pianos",
      "prompt": "Reveal the hidden words:",
      "boxes": [
        { "id": "box1", "hiddenText": "LOVE" },
        { "id": "box2", "hiddenText": "IS" },
        { "id": "box3", "hiddenText": "ALL" },
        { "id": "box4", "hiddenText": "YOU" },
        { "id": "box5", "hiddenText": "NEED" }
      ]
    }
  ]
}
```

**Updated question discriminator table**:

| `type` value | Additional fields | Notes |
|--------------|-------------------|-------|
| `"open"` | _(none)_ | Unchanged |
| `"closed"` | `options: AnswerOption[]` | `presenterHint` is ALWAYS absent from this endpoint |
| `"image-rebus"` | `imageRef: string` | Unchanged |
| `"meme"` | `entryImage: string`, `revealImage?: string`, `options: AnswerOption[]` | New; `revealImage` may be absent/null |
| `"singing-pianos"` | `boxes: PianoBox[]` | New; `boxes` array contains 0–5+ entries (spec: 5 expected) |

**PianoBox schema**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique within the question |
| `hiddenText` | `string` | Text shown when the box is revealed |

**Failure behavior**:
- Questions with unrecognized `type` values in the data file are silently excluded from the response (existing behavior, unchanged).
- A `meme` question with a missing or empty `entryImage` is silently excluded.
- A `singing-pianos` question with 0 boxes is silently excluded.
- A `singing-pianos` question with 1–4 boxes is included; the frontend renders missing box slots as disabled.

---

## New: GET /api/quiz/presenter/categories/{id}

Presenter-only endpoint. Returns the same structure as `GET /api/quiz/categories/{id}` **plus** the `presenterHint` field on any `closed` questions that have one defined.

### Request

```
GET /api/quiz/presenter/categories/{id}
Accept: application/json
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Category identifier (same as public endpoint) |

### Success Response (200 OK)

Same structure as `GET /api/quiz/categories/{id}` with one difference — `closed` questions may include the `presenterHint` field:

```json
{
  "id": "example-category",
  "name": "Example Category",
  "questions": [
    {
      "id": "q2",
      "type": "closed",
      "prompt": "Which country hosted the 2020 Summer Olympics?",
      "options": [
        { "id": "a", "text": "Japan" },
        { "id": "b", "text": "France" }
      ],
      "presenterHint": "Answer: Japan. Tokyo 2020 (held in 2021)."
    }
  ]
}
```

**Extended closed question fields**:

| Field | Type | Notes |
|-------|------|-------|
| `presenterHint` | `string` (optional) | Absent when no hint defined for the question; present only in this endpoint |

**All other question types** (`open`, `image-rebus`, `meme`, `singing-pianos`) are returned with the same fields as the public endpoint. Presenter hints are only defined on `closed` questions.

### Error Responses

| Status | Condition |
|--------|-----------|
| `404 Not Found` | Category does not exist or has no valid questions |
| `500 Internal Server Error` | Unexpected server error |

404 body shape is identical to the public endpoint.

---

## Modified: SignalR Hub — PresenterStateDto Payload

**Hub**: `/hubs/presenter`  
**Method**: `UpdateState` (presenter → server → all clients)  
**Event**: `StateUpdated` (server → all clients)

### Updated Payload Shape

The `PresenterStateDto` gains one optional field. All existing fields are unchanged.

```typescript
// TypeScript representation (used by frontend)
interface StateUpdatedPayload {
  screen: string;                      // unchanged — 'idle' | 'category-list' | 'question-list' | 'question-detail'
  categoryId?: string | null;          // unchanged
  questionId?: string | null;          // unchanged
  revealState?: RevealState | null;    // NEW — absent/null = no active reveal state
}

interface RevealState {
  memeImageRevealed?: boolean;             // true = reveal image shown; absent/null = entry image shown
  singingPianosBoxesRevealed?: boolean[];  // index 0–4 = box 1–5 revealed state; absent/null = all hidden
}
```

### Behavior Rules

1. **`revealState` may be omitted or `null`** — treated identically as "all reveal states are initial". Existing mirror clients that do not yet handle `revealState` degrade gracefully (they see a question but no reveal state logic, which is equivalent to the initial/unrevealed view).

2. **`memeImageRevealed`**: Present only on `question-detail` screen for a `meme` question. Absent for all other question types and screens.

3. **`singingPianosBoxesRevealed`**: Present only on `question-detail` screen for a `singing-pianos` question. When present, MUST be an array of exactly 5 booleans (index 0 = box 1, index 4 = box 5).

4. **Reset on navigation**: When the presenter navigates away from a question and `UpdateState` is called for the new screen, `revealState` is `null`. Any mirror receiving this update must reset local reveal UI state.

5. **Late-join state**: When a mirror client connects, `PresenterHub.OnConnectedAsync` sends the stored `PresenterStateDto` (including current `revealState`) to the newly connected client only. The mirror initializes directly to the current reveal state.

### Example: Meme question — initial display

```json
{
  "screen": "question-detail",
  "categoryId": "example-category",
  "questionId": "q3",
  "revealState": null
}
```

### Example: Meme question — after presenter reveals second image

```json
{
  "screen": "question-detail",
  "categoryId": "example-category",
  "questionId": "q3",
  "revealState": {
    "memeImageRevealed": true
  }
}
```

### Example: Singing pianos — after presenter reveals boxes 1 and 3

```json
{
  "screen": "question-detail",
  "categoryId": "example-category",
  "questionId": "q4",
  "revealState": {
    "singingPianosBoxesRevealed": [true, false, true, false, false]
  }
}
```

### Example: Presenter navigates back to question list (reveal state reset)

```json
{
  "screen": "question-list",
  "categoryId": "example-category",
  "questionId": null,
  "revealState": null
}
```

---

## Validation Rules Summary

| Endpoint / Method | Field | Rule | Failure Behavior |
|---|---|---|---|
| `GET /api/quiz/categories/{id}` | `type` discriminator | Must be one of: `open`, `closed`, `image-rebus`, `meme`, `singing-pianos` | Unknown types silently excluded |
| `GET /api/quiz/categories/{id}` | `closed.presenterHint` | MUST NOT appear in response | Stripped by response DTO projection |
| `GET /api/quiz/presenter/categories/{id}` | `closed.presenterHint` | Optional; included when defined | Absent = no hint; not an error |
| `meme.entryImage` | both endpoints | Non-empty string required | Question excluded from response if missing |
| `meme.revealImage` | both endpoints | Optional; may be absent/null | Reveal action disabled on frontend |
| `singing-pianos.boxes` | both endpoints | Array; expected 5 entries | < 5: frontend hides missing slots; > 5: first 5 used |
| `UpdateState` | `screen` | Must be one of: `idle`, `category-list`, `question-list`, `question-detail` | Hub throws `HubException` (unchanged) |
| `UpdateState` | `revealState.singingPianosBoxesRevealed` | When present, must have exactly 5 entries | Frontend enforces; server logs warning if violated |

---

## TypeScript Client Types Reference

```typescript
// src/QuizAppka/ClientApp/src/types/quiz.ts

export interface MemeQuestion extends BaseQuestion {
  type: 'meme';
  entryImage: string;
  revealImage?: string;
  options: AnswerOption[];
}

export interface SingingPianosQuestion extends BaseQuestion {
  type: 'singing-pianos';
  boxes: PianoBox[];
}

export interface PianoBox {
  id: string;
  hiddenText: string;
}

export interface ClosedQuestion extends BaseQuestion {
  type: 'closed';
  options: AnswerOption[];
  presenterHint?: string;    // only present in presenter-endpoint responses
}

export type Question =
  | OpenQuestion
  | ClosedQuestion
  | ImageRebusQuestion
  | MemeQuestion
  | SingingPianosQuestion;
```

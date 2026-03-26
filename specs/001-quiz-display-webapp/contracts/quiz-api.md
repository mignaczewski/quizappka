# API Contract: Quiz Data

**Feature**: Quiz Question Presentation  
**Branch**: `001-quiz-display-webapp`  
**Spec Reference**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-011, FR-012, FR-013  
**Date**: 2026-03-26

---

## Overview

The backend exposes a read-only REST API under `/api/quiz`. All endpoints return JSON. There is no authentication for this initial release (internal-use presenter tool).

The frontend SPA consumes these endpoints during the active quiz session. The backend is stateless; all navigation state lives in the browser.

---

## Base URL

```
/api/quiz
```

---

## Endpoints

---

### GET /api/quiz/categories

Returns the list of available quiz categories (only categories with at least one valid question).

#### Request

```
GET /api/quiz/categories
Accept: application/json
```

No query parameters. No request body.

#### Success Response

**Status**: `200 OK`

```json
[
  {
    "id": "history-101",
    "name": "World History"
  },
  {
    "id": "science-basics",
    "name": "Science Basics"
  }
]
```

**Schema**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique category identifier; stable across requests |
| `name` | `string` | Human-readable display name for the category |

**Notes**:
- Categories with zero valid questions are excluded from this response (FR-011).
- Order is determined by file discovery order (alphabetical by filename).
- Empty array `[]` is a valid response when no usable categories exist.

#### Error Responses

| Status | Condition |
|--------|-----------|
| `500 Internal Server Error` | Unexpected server error during data load |

---

### GET /api/quiz/categories/{id}

Returns a single category with its full ordered question list.

#### Request

```
GET /api/quiz/categories/{id}
Accept: application/json
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Category identifier as returned by `GET /api/quiz/categories` |

#### Success Response

**Status**: `200 OK`

```json
{
  "id": "history-101",
  "name": "World History",
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
        { "id": "b", "text": "France" },
        { "id": "c", "text": "United States" }
      ]
    },
    {
      "id": "q3",
      "type": "image-rebus",
      "prompt": "What concept do these symbols represent?",
      "imageRef": "rebus/history-101-q3.png"
    }
  ]
}
```

**Schema**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Category identifier |
| `name` | `string` | Human-readable display name |
| `questions` | `Question[]` | Ordered list of valid questions for this category |

**Question discriminator** — the `type` field determines which additional fields are present:

| `type` value | Additional fields | Description |
|--------------|-------------------|-------------|
| `"open"` | _(none)_ | Prompt-only question |
| `"closed"` | `options: AnswerOption[]` | Question with predefined choices |
| `"image-rebus"` | `imageRef: string` | Question with an associated image |

**AnswerOption schema**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique within the question |
| `text` | `string` | Display text for the option |

**ImageRef format**: Relative path fragment (e.g., `rebus/history-101-q3.png`). The frontend constructs the full image URL as `/images/{imageRef}`.

**Notes**:
- Questions are returned in the order defined in the source JSON file (FR-004).
- Only valid questions are included; invalid questions are silently excluded (FR-012) — the server does not expose invalid data.
- A category returned by `GET /categories` always has at least one question.

#### Error Responses

| Status | Condition |
|--------|-----------|
| `404 Not Found` | Category with the given `id` does not exist or has no valid questions |
| `500 Internal Server Error` | Unexpected server error |

**404 body**:
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Not Found",
  "status": 404,
  "detail": "Category 'history-101' was not found or is unavailable."
}
```

---

## Image Assets

Rebus question images are served as static files directly from the ASP.NET Core static file middleware.

```
GET /images/{imageRef}
```

| Path | Description |
|------|-------------|
| `/images/rebus/*.png` | Rebus question images |

- Served by `app.UseStaticFiles()` from `wwwroot/images/`.
- No API controller handles this path.
- HTTP 404 is returned if the image file does not exist; the frontend displays an error placeholder (FR-012).

---

## TypeScript Client Types

These types (in `ClientApp/src/types/quiz.ts`) must remain in sync with the backend response schemas:

```typescript
export interface CategorySummary {
  id: string;
  name: string;
}

export type QuestionType = 'open' | 'closed' | 'image-rebus';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
}

export interface OpenQuestion extends BaseQuestion { type: 'open'; }

export interface AnswerOption { id: string; text: string; }
export interface ClosedQuestion extends BaseQuestion {
  type: 'closed';
  options: AnswerOption[];
}

export interface ImageRebusQuestion extends BaseQuestion {
  type: 'image-rebus';
  imageRef: string;
}

export type AnyQuestion = OpenQuestion | ClosedQuestion | ImageRebusQuestion;

export interface CategoryDetail extends CategorySummary {
  questions: AnyQuestion[];
}
```

---

## Failure Modes

| Scenario | Backend Behavior | Frontend Behavior |
|----------|-----------------|-------------------|
| Data directory missing | 500 on startup | Not reached (app won't start) |
| All category files invalid | `GET /categories` returns `[]` | Home page shows "no categories" message |
| Requested category not found | `404 Not Found` | Error state shown, back button available |
| Image file missing | Static files 404 | `<img>` error event → placeholder displayed |
| Closed question has < 2 options | Question excluded at load | Question never appears in response |
| Unknown question type in JSON | Question excluded at load | Question never appears in response |

---

## Contract Ownership

| Layer | Owner |
|-------|-------|
| Response schema (C# models) | Backend `QuizAppka` project |
| TypeScript types | Frontend `ClientApp/src/types/quiz.ts` |
| Sync verification | Integration tests (WebApplicationFactory) + TypeScript type check (`tsc --noEmit`) |

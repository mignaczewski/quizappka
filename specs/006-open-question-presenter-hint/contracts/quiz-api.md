# API Contract: Quiz API — Open Question Presenter Hint

**Branch**: `006-open-question-presenter-hint` | **Date**: 2026-04-21  
**Affected routes**: `GET /api/quiz/categories/{id}` (public), `GET /api/quiz/presenter/categories/{id}` (presenter)

---

## Summary of Changes

The `OpenQuestion` object in the API response gains an optional `presenterHint`
field. The field is present **only** in the presenter route response. The public
(audience-facing) route never includes it.

---

## Affected Object: `OpenQuestion`

### Before (current contract)

```json
{
  "type": "open",
  "id": "string",
  "prompt": "string"
}
```

### After (this feature)

```json
{
  "type": "open",
  "id": "string",
  "prompt": "string",
  "presenterHint": "string"   // optional — present ONLY in presenter route response
}
```

**Field rules**:
- `presenterHint` is omitted (not present in JSON) when not configured in the
  data file, or when served by the public route.
- `presenterHint` is a UTF-8 string. Values beginning with `https://` or
  `http://` are treated as URLs by the frontend.
- An empty string must not be present in the data file; it must be omitted
  rather than set to `""`.

---

## Route: `GET /api/quiz/categories/{id}` (Public)

Used by: mirror view, audience-facing quiz display.

**Response shape for an open question** (unchanged from current — `presenterHint`
is never present):

```json
{
  "id": "cat1",
  "name": "Category Name",
  "questions": [
    {
      "type": "open",
      "id": "q1",
      "prompt": "What is the capital of France?"
    }
  ]
}
```

**Validation**: The `presenterHint` key MUST NOT appear in this response for any
open question, regardless of whether the data file contains the field.

---

## Route: `GET /api/quiz/presenter/categories/{id}` (Presenter)

Used by: presenter view (`QuestionDetailPage`, `QuestionListPage`).

**Response shape for an open question WITH a hint**:

```json
{
  "id": "cat1",
  "name": "Category Name",
  "questions": [
    {
      "type": "open",
      "id": "q1",
      "prompt": "What is the capital of France?",
      "presenterHint": "Answer: Paris. Source: https://en.wikipedia.org/wiki/Paris"
    }
  ]
}
```

**Response shape for an open question WITHOUT a hint** (unchanged from current):

```json
{
  "id": "cat1",
  "name": "Category Name",
  "questions": [
    {
      "type": "open",
      "id": "q1",
      "prompt": "What is the capital of France?"
    }
  ]
}
```

---

## Data File Schema (JSON category files)

The `presenterHint` field is added to the open question shape in category JSON
files. Example:

```json
{
  "id": "q1",
  "type": "open",
  "prompt": "What is the capital of France?",
  "presenterHint": "Answer: Paris"
}
```

The field is optional. Omit it entirely when no hint is needed.

---

## No Breaking Changes

- All existing open question consumers (mirror page, public quiz page) are
  unaffected: the public API route never returns the field, and the TypeScript
  interface defines it as `presenterHint?: string` (optional).
- The `type` discriminator (`"open"`) is unchanged.
- All other question types are unchanged.

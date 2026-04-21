# API Contract: Quiz API

**Feature**: 002-question-list-navigation  
**Date**: 2026-03-26  
**Status**: **CONFIRMED UNCHANGED** — this feature introduces no backend API changes.

---

## Summary

The question list navigation change is frontend-only. Both existing endpoints are consumed identically by the new page components. This document records the confirmed contract for implementation reference.

---

## Endpoints

### GET /api/quiz/categories

Returns the list of available quiz categories.

**Response: 200 OK**
```json
[
  { "id": "string", "name": "string" },
  ...
]
```

**Consumer**: `HomePage` via `fetchCategories()` in `quizApi.ts` — **unchanged**.

---

### GET /api/quiz/categories/{id}

Returns the full category including all questions.

**Path parameter**: `id` — category identifier matching `CategorySummary.id`

**Response: 200 OK**
```json
{
  "id": "string",
  "name": "string",
  "questions": [
    {
      "id": "string",
      "type": "open",
      "prompt": "string"
    },
    {
      "id": "string",
      "type": "closed",
      "prompt": "string",
      "options": [
        { "id": "string", "text": "string" }
      ]
    },
    {
      "id": "string",
      "type": "image-rebus",
      "prompt": "string",
      "imageRef": "string"
    }
  ]
}
```

**Response: 404 Not Found**
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Not Found",
  "status": 404,
  "detail": "Category with id '{id}' not found."
}
```

**Consumers**:
- `QuestionListPage` via `fetchCategory(categoryId)` — **new consumer, same contract**
- `QuestionDetailPage` via `fetchCategory(categoryId)`, then resolves question by `id` client-side — **new consumer, same contract**

---

## Static Asset: Images

Images for `image-rebus` questions are served at:
```
GET /images/{imageRef}
```

No change — `ImageRebusQuestion` component continues to use this path.

---

## Contract Ownership

| Concern | Owner |
|---|---|
| API contract definition | Backend (QuizController.cs) |
| TypeScript type alignment | Frontend (types/quiz.ts) |
| Contract consumed by | QuestionListPage, QuestionDetailPage, quizApi.ts |

---

## Breaking Change Declaration

None. This feature contains no breaking changes to the API contract.
</content>

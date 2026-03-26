# Data Model: Question List Navigation

**Feature**: 002-question-list-navigation  
**Date**: 2026-03-26

---

## Note on Scope

This feature is a **frontend-only navigation change**. No new backend entities, database tables, or API fields are introduced. The backend data model is unchanged. This document captures the frontend state model, page data dependencies, and the data flow for the new two-level navigation.

---

## Existing Domain Types (unchanged)

These types in `src/QuizAppka/ClientApp/src/types/quiz.ts` are used as-is:

| Type | Fields | Used By |
|---|---|---|
| `CategorySummary` | `id: string`, `name: string` | `HomePage` — category list |
| `CategoryDetail` | `id: string`, `name: string`, `questions: Question[]` | `QuestionListPage`, `QuestionDetailPage` |
| `Question` (union) | `id: string`, `type`, `prompt: string` + type-specific fields | `QuestionDisplay`, `QuestionList` |
| `OpenQuestion` | `type: 'open'` | `OpenQuestion` component |
| `ClosedQuestion` | `type: 'closed'`, `options: AnswerOption[]` | `ClosedQuestion` component |
| `ImageRebusQuestion` | `type: 'image-rebus'`, `imageRef: string` | `ImageRebusQuestion` component |
| `AnswerOption` | `id: string`, `text: string` | `ClosedQuestion` component |

---

## Frontend Page State Model

### QuestionListPage

**Route**: `/quiz/:categoryId`  
**Data source**: `fetchCategory(categoryId)` → `CategoryDetail`

| State Field | Type | Description |
|---|---|---|
| `category` | `CategoryDetail \| null` | Loaded category including all questions |
| `loading` | `boolean` | True while `fetchCategory` is in flight |
| `error` | `string \| null` | Error message if category fetch fails or category not found |

**State transitions**:
```
initial:   loading=true, category=null, error=null
on success: loading=false, category=CategoryDetail, error=null
on error:  loading=false, category=null, error="<message>"
```

**Navigation output**: On question selection → `navigate('/quiz/:categoryId/:questionId')`

---

### QuestionDetailPage

**Route**: `/quiz/:categoryId/:questionId`  
**Data source**: `fetchCategory(categoryId)` → `CategoryDetail`, then `.questions.find(q => q.id === questionId)`

| State Field | Type | Description |
|---|---|---|
| `category` | `CategoryDetail \| null` | Loaded category (needed to find the question and provide context) |
| `question` | `Question \| null` | Resolved question derived from category; null if not found |
| `loading` | `boolean` | True while `fetchCategory` is in flight |
| `error` | `string \| null` | Error if fetch fails or question id not found in category |

**State transitions**:
```
initial:   loading=true, category=null, question=null, error=null
on success (found):    loading=false, category=CategoryDetail, question=Question, error=null
on success (not found): loading=false, category=CategoryDetail, question=null, error="Question not found"
on fetch error:        loading=false, category=null, question=null, error="<message>"
```

**Navigation output**: Back action → `navigate('/quiz/:categoryId')` (returns to list)

---

## QuestionList Component Interface

**New component**: `src/QuizAppka/ClientApp/src/components/QuestionList.tsx`

```typescript
interface QuestionListProps {
  questions: Question[];
  onSelectQuestion: (questionId: string) => void;
}
```

Each list entry renders:
- Question number (1-based index within the list)
- Question type badge (`open` / `closed` / `image rebus`)
- Question prompt text (truncated if long)

---

## URL Structure (route parameters)

| Route | Params | Source of truth |
|---|---|---|
| `/quiz/:categoryId` | `categoryId` — matches `CategorySummary.id` | CategoryList navigation |
| `/quiz/:categoryId/:questionId` | `categoryId`, `questionId` — matches `Question.id` within that category | QuestionList selection |

---

## Re-evaluated Constitution Check (post-design)

- **Contract scope**: No changes to API contract confirmed (see [contracts/quiz-api.md](contracts/quiz-api.md)).
- **Quality gates**: TypeScript types fully covered by existing `quiz.ts` types. No new types required. Props interfaces defined for `QuestionList`.
- **Test strategy**: Component tests target `QuestionListPage`, `QuestionDetailPage`, and `QuestionList`. E2E tests target the full flow.
- **Integration**: The frontend continues to call the same two endpoints. No changes to serialization or contract.

**GATE RESULT: PASS — post-design constitution check confirmed.**
</content>

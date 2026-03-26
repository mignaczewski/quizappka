# Data Model: Quiz Display Web Application

**Feature**: Quiz Question Presentation  
**Branch**: `001-quiz-display-webapp`  
**Phase**: 1 – Design  
**Date**: 2026-03-26

---

## Entities

### QuizCategory

A named grouping of quiz questions that can be selected and run as one presentation session.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `id` | `string` | ✅ | Non-empty, unique across all categories |
| `name` | `string` | ✅ | Non-empty, display name shown to presenter |
| `questions` | `Question[]` | ✅ | Non-null; may be empty (triggers FR-011 "no valid questions") |

**Validation Rules**:
- A category with zero _valid_ questions after parsing is considered unavailable (FR-011).
- `id` must be unique within the loaded data set; duplicate IDs cause the later file to be discarded with a warning.

**State**: Categories are immutable after loading at startup. No mutable state lives on the category.

---

### Question _(abstract base)_

A single quiz prompt belonging to one category, with defined display order and content needed for presentation.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `id` | `string` | ✅ | Non-empty, unique within the category |
| `type` | `QuestionType` | ✅ | One of: `open`, `closed`, `image-rebus` |
| `prompt` | `string` | ✅ | Non-empty; the text shown to the audience |

**Discriminator**: `type` field drives JSON deserialization to the correct derived class.

---

### OpenQuestion _extends Question_

A question that shows prompt-only content, without answer choices.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| _(inherits base fields)_ | — | — | — |

No additional fields. If extra fields are present in the JSON they are ignored.

**Display**: Prompt text only (FR-006).

---

### ClosedQuestion _extends Question_

A question with predefined answer choices shown alongside the prompt.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| _(inherits base fields)_ | — | — | — |
| `options` | `AnswerOption[]` | ✅ | Must contain ≥ 2 items; empty or single-option closed questions are treated as invalid (FR-012) |

**Display**: Prompt + ordered list of answer options (FR-007).

**Edge case**: A closed question with fewer than 2 answer options cannot be presented meaningfully (see spec edge cases). The service marks it invalid and excludes it from the question list; the presenter sees a skip in question numbering with a logged warning.

---

### ImageRebusQuestion _extends Question_

A question that presents an image to the audience, with optional supporting prompt text.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| _(inherits base fields)_ | — | — | — |
| `imageRef` | `string` | ✅ | Relative path fragment (e.g., `rebus/q3.png`); non-empty |

**Display**: Image resolved at `/images/{imageRef}` + prompt text if non-empty (FR-008).

**Edge case**: If the referenced image cannot be loaded by the browser, the component falls back to an error placeholder and the prompt text remains visible (FR-012).

---

### AnswerOption

A single predefined choice for a closed question.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `id` | `string` | ✅ | Non-empty, unique within the parent question |
| `text` | `string` | ✅ | Non-empty, the display text for the option |

---

### QuestionType _(enum / discriminator string)_

| Value | Maps to |
|-------|---------|
| `"open"` | `OpenQuestion` |
| `"closed"` | `ClosedQuestion` |
| `"image-rebus"` | `ImageRebusQuestion` |

Unsupported `"type"` values cause the individual question to be excluded from the category with a logged warning. The category remains available if other questions are valid (FR-012).

---

## Relationships

```
QuizCategory  1 ──── * Question
ClosedQuestion 1 ──── 2..* AnswerOption
ImageRebusQuestion 1 ──── 1 imageRef (→ wwwroot/images/{imageRef})
```

---

## JSON File Layout

One JSON file per category, located at `Data/categories/{id}.json`:

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

---

## C# Model Hierarchy

```
Question (abstract)
├── OpenQuestion
├── ClosedQuestion
│   └── uses: AnswerOption[]
└── ImageRebusQuestion

QuizCategory
└── uses: Question[]
```

**Polymorphic deserialization** via `System.Text.Json` attributes:
```csharp
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(OpenQuestion), "open")]
[JsonDerivedType(typeof(ClosedQuestion), "closed")]
[JsonDerivedType(typeof(ImageRebusQuestion), "image-rebus")]
public abstract class Question
{
    public string Id { get; init; } = string.Empty;
    public string Prompt { get; init; } = string.Empty;
}
```

---

## TypeScript Type Mirror (Frontend)

The frontend types in `ClientApp/src/types/quiz.ts` mirror the backend model to ensure contract alignment:

```typescript
export type QuestionType = 'open' | 'closed' | 'image-rebus';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
}

export interface OpenQuestion extends Question {
  type: 'open';
}

export interface AnswerOption {
  id: string;
  text: string;
}

export interface ClosedQuestion extends Question {
  type: 'closed';
  options: AnswerOption[];
}

export interface ImageRebusQuestion extends Question {
  type: 'image-rebus';
  imageRef: string;
}

export type AnyQuestion = OpenQuestion | ClosedQuestion | ImageRebusQuestion;

export interface QuizCategory {
  id: string;
  name: string;
}

export interface QuizCategoryDetail extends QuizCategory {
  questions: AnyQuestion[];
}
```

---

## Validation Summary

| Rule | Scope | Behavior on Failure |
|------|-------|---------------------|
| Category `id` non-empty | Data load | Category discarded, warning logged |
| Category `name` non-empty | Data load | Category discarded, warning logged |
| Question `id` non-empty | Data load | Question excluded from category, warning logged |
| Unsupported `type` value | Data load | Question excluded, warning logged |
| `ClosedQuestion` has < 2 options | Data load | Question excluded, warning logged |
| `ImageRebusQuestion.imageRef` non-empty | Data load | Question excluded, warning logged |
| Image file not found in browser | Runtime / client | Error placeholder shown, prompt visible |
| Category has 0 valid questions | API response | Category excluded from `/categories` list |

---

## State Transitions

The application is presentation-only. The only runtime state is the **quiz session state** in the frontend:

```
[No Session]
    │ presenter selects category
    ▼
[Session Active: question index = 0]
    │ next →                ← prev
    ▼
[Session Active: question index = N]
    │ last question reached
    ▼
[Session Complete: end-of-category message shown]
```

**Backend is stateless** — all session state lives in the React frontend.

# Data Model: Open Question Presenter Hint

**Branch**: `006-open-question-presenter-hint` | **Date**: 2026-04-21

## Entity: OpenQuestion (extended)

The `OpenQuestion` type is extended with a single optional field. All other
fields are unchanged.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | Yes | Unique identifier within a category |
| `type` | `"open"` | Yes | JSON discriminator — unchanged |
| `prompt` | `string` | Yes | The question text shown to the audience |
| `presenterHint` | `string \| null` | No | Private note or URL visible only in the presenter view. Omitted from public API responses. |

### Validation Rules

- `presenterHint`, when defined, MUST be a non-empty string. An empty string is
  treated as absent — no hint is displayed and the field should be omitted from
  the JSON data file.
- There is no maximum length enforced at runtime; quiz authors are responsible
  for reasonable lengths.
- A `presenterHint` value is either a plain text note or a URL. URL detection is
  based on the `https://` or `http://` prefix.

### State Transitions

`presenterHint` is a static configuration value loaded from the JSON data file.
It has no runtime state transitions — it is either present or absent.

---

## Backend Model

```csharp
// src/QuizAppka/Models/OpenQuestion.cs  (after change)
public class OpenQuestion : Question
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? PresenterHint { get; init; }
}
```

The `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]` attribute
ensures the field is omitted from the public JSON response when its value is
`null` (which is the result of the `StripPresenterData` call in `QuizController`).

---

## Frontend Type

```typescript
// src/QuizAppka/ClientApp/src/types/quiz.ts  (after change)
export interface OpenQuestion extends BaseQuestion {
  type: 'open';
  presenterHint?: string;
}
```

The field is typed as optional (`?`) because:
- The public API endpoint never returns it.
- Even on the presenter endpoint it is absent when not configured in the data
  file.

---

## Stripping Mechanism (Controller)

The `StripPresenterData` method in `QuizController` is extended to handle
`OpenQuestion`:

```csharp
// src/QuizAppka/Controllers/QuizController.cs  (StripPresenterData after change)
private static Question StripPresenterData(Question question) => question switch
{
    ClosedQuestion closed when closed.PresenterHint is not null
        => new ClosedQuestion { Id = closed.Id, Prompt = closed.Prompt, Options = closed.Options },
    OpenQuestion open when open.PresenterHint is not null
        => new OpenQuestion { Id = open.Id, Prompt = open.Prompt },
    _ => question,
};
```

> Note: the exact implementation form (pattern match, if-chain) is a task-level
> decision. The contract is: public route never serializes `presenterHint` for
> open questions.

---

## Relationships

- `OpenQuestion` is a subtype of `Question` (polymorphic JSON via `type` discriminator).
- `OpenQuestion` instances are contained in `QuizCategory.Questions`.
- `CategoryDetail` is the DTO returned by both `/api/quiz/categories/{id}` and
  `/api/quiz/presenter/categories/{id}`; it holds `IReadOnlyList<Question>`.
- The `QuestionDisplay` component dispatches on `question.type` to select
  `OpenQuestion` component — no changes to this dispatch logic are needed.

# Data Model: Code Refactoring for Predictability and Error Safety

**Branch**: `008-refactor-error-proof` | **Date**: 2026-05-02

---

## Changed Models

### RevealedBox (new)

Replaces the positional `boolean[]` revealed state for piano boxes. Keyed by the box's stable `id` so reveal lookups are unambiguous regardless of array length or ordering.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Matches `PianoBox.id` |
| `revealed` | `boolean` | `true` when the presenter has revealed this box |

**TypeScript**:
```ts
export interface RevealedBox {
  id: string;
  revealed: boolean;
}
```

**C#** (`src/QuizAppka/Models/RevealedBox.cs`):
```csharp
namespace QuizAppka.Models;

public record RevealedBox(string Id, bool Revealed);
```

**Wire format** (camelCase JSON):
```json
{ "id": "box-1", "revealed": true }
```

---

### RevealState (changed)

`singingPianosBoxesRevealed` changes from a positional `boolean[]` to a named `RevealedBox[]`.

| Field | Old type | New type | Notes |
|-------|----------|----------|-------|
| `memeImageRevealed` | `boolean? / null` | unchanged | |
| `singingPianosBoxesRevealed` | `boolean[] / null` | `RevealedBox[] / null` | Breaking wire change |

**TypeScript** (`types/quiz.ts`):
```ts
export interface RevealState {
  memeImageRevealed?: boolean | null;
  singingPianosBoxesRevealed?: RevealedBox[] | null;   // was: boolean[] | null
}
```

**C#** (`src/QuizAppka/Models/RevealState.cs`):
```csharp
public record RevealState(
    bool? MemeImageRevealed = null,
    RevealedBox[]? SingingPianosBoxesRevealed = null    // was: bool[]?
);
```

---

### Question (changed)

`ValidationError` added to the base abstract class. Set by `FilterValidQuestions` for structurally incomplete questions that are included in the list rather than excluded.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | unchanged |
| `prompt` | `string` | unchanged |
| `validationError` | `string?` | New. `null` for valid questions; human-readable message for invalid ones |

**TypeScript** — added to the discriminated union base:
```ts
// All question types now carry:
validationError?: string | null;
```

**C#** (`src/QuizAppka/Models/Question.cs`):
```csharp
public abstract class Question
{
    public string Id { get; init; } = string.Empty;
    public string Prompt { get; init; } = string.Empty;
    public string? ValidationError { get; set; }    // new; set by FilterValidQuestions
}
```

**Serialization**: `ValidationError` is omitted from JSON when `null` (configure `DefaultIgnoreCondition = WhenWritingNull` if not already set, or handle in the frontend as `undefined`). Currently ASP.NET Core MVC uses camelCase by default; `ValidationError` → `validationError` in JSON.

---

## Validation Rules (backend)

`FilterValidQuestions` — updated rules:

| Question type | Existing rule | Change |
|--------------|--------------|--------|
| Any | Empty `id` or `prompt` → exclude | No change |
| `ClosedQuestion` | `options.Length < 2` → exclude | No change |
| `ImageRebusQuestion` | Empty `imageRef` → exclude | No change |
| `SingingPianosQuestion` | *(none)* | NEW: `boxes.Length == 0` → include with `ValidationError = "No boxes defined"` |
| `MemeQuestion` | *(none)* | NEW: `string.IsNullOrWhiteSpace(entryImage)` → include with `ValidationError = "Missing entry image"` |

---

## Component State Shape Changes

### SingingPianos — Props (changed)

| Prop | Old type | New type |
|------|----------|----------|
| `revealedBoxes` | `boolean[] \| null \| undefined` | `RevealedBox[] \| null \| undefined` |
| `onBoxReveal` | `(index: number) => void` | `(id: string) => void` |

**Lookup change**: `revealedBoxes?.[index] === true` → `revealedBoxes?.find(r => r.id === box.id)?.revealed === true`

### QuestionDetailPage — State (changed)

| State variable | Old behaviour | New behaviour |
|---------------|--------------|--------------|
| `revealState` | Stale closure in updater | Functional updater with `...currentReveal` |
| `onBoxReveal` | Hub invoke inside state updater | Functional updater only; hub synced via `useEffect` |
| `onBoxReveal` signature | `(index: number)` | `(id: string)` |
| `onReveal` | Reads stale `revealState` directly | Functional updater |
| Hub broadcast | Inside `setRevealState` updater | `useEffect([revealState, categoryId, questionId])` |

---

## Shared Utility

### url.ts (new)

```ts
// src/QuizAppka/ClientApp/src/utils/url.ts
export function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
```

Replaces the duplicated local `isUrl` in `ClosedQuestion.tsx` and `OpenQuestion.tsx`.

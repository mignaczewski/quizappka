# Data Model: Question Title Field and Universal Presenter Hint

**Branch**: `009-question-title-universal-hint`  
**Date**: 2026-06-16

## Backend Models (C#)

### `Question` (modified)

File: `src/QuizAppka/Models/Question.cs`

```csharp
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(OpenQuestion), "open")]
[JsonDerivedType(typeof(ClosedQuestion), "closed")]
[JsonDerivedType(typeof(ImageRebusQuestion), "image-rebus")]
[JsonDerivedType(typeof(MemeQuestion), "meme")]
[JsonDerivedType(typeof(SingingPianosQuestion), "singing-pianos")]
public abstract class Question
{
    public string Id { get; init; } = string.Empty;
    public string Prompt { get; init; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Title { get; init; }   // NEW — optional short label for question list
}
```

**Change**: One new optional property `Title`. Serialized only when non-null (`WhenWritingNull` guard). All five derived types inherit it automatically. No derived-type changes needed for `Title` alone.

**Validation rules**:
- `Title` is optional. Null and absent are equivalent.
- Empty string is treated as absent — frontend falls back to prompt.
- No maximum length enforced at the model layer; UI truncates with CSS ellipsis.

---

### `MemeQuestion` (modified)

File: `src/QuizAppka/Models/MemeQuestion.cs`

```csharp
public class MemeQuestion : Question
{
    public string EntryImage { get; init; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? RevealImage { get; init; }

    public AnswerOption[] Options { get; init; } = [];

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? PresenterHint { get; init; }   // NEW — presenter-only hint
}
```

**Change**: One new optional property `PresenterHint`. Follows the identical pattern used by `ClosedQuestion` and `OpenQuestion`.

---

### `SingingPianosQuestion` (modified)

File: `src/QuizAppka/Models/SingingPianosQuestion.cs`

```csharp
public class SingingPianosQuestion : Question
{
    public PianoBox[] Boxes { get; init; } = [];

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? PresenterHint { get; init; }   // NEW — presenter-only hint
}
```

**Change**: One new optional property `PresenterHint`.

---

### `QuizController.StripPresenterData` (modified)

File: `src/QuizAppka/Controllers/QuizController.cs`

```csharp
private static Question StripPresenterData(Question question) => question switch
{
    ClosedQuestion closed when closed.PresenterHint is not null
        => new ClosedQuestion
        {
            Id = closed.Id,
            Prompt = closed.Prompt,
            Title = closed.Title,      // preserve Title (was missing before this feature)
            Options = closed.Options
        },
    OpenQuestion open when open.PresenterHint is not null
        => new OpenQuestion
        {
            Id = open.Id,
            Prompt = open.Prompt,
            Title = open.Title         // preserve Title (was missing before this feature)
        },
    MemeQuestion meme when meme.PresenterHint is not null           // NEW arm
        => new MemeQuestion
        {
            Id = meme.Id,
            Prompt = meme.Prompt,
            Title = meme.Title,
            EntryImage = meme.EntryImage,
            RevealImage = meme.RevealImage,
            Options = meme.Options
        },
    SingingPianosQuestion piano when piano.PresenterHint is not null  // NEW arm
        => new SingingPianosQuestion
        {
            Id = piano.Id,
            Prompt = piano.Prompt,
            Title = piano.Title,
            Boxes = piano.Boxes
        },
    _ => question,
};
```

**Changes**:
- Existing `ClosedQuestion` and `OpenQuestion` arms updated to copy `Title`.
- Two new arms added for `MemeQuestion` and `SingingPianosQuestion`.
- Fall-through `_` arm unchanged — handles `ImageRebusQuestion` and questions without a hint.

---

## Frontend Types (TypeScript)

File: `src/QuizAppka/ClientApp/src/types/quiz.ts`

```typescript
export interface BaseQuestion {
  id: string;
  type: string;
  prompt: string;
  title?: string;   // NEW — optional short label used in question list
}

export interface MemeQuestion extends BaseQuestion {
  type: 'meme';
  entryImage: string;
  revealImage?: string;
  options: AnswerOption[];
  presenterHint?: string;   // NEW — only present in presenter-endpoint responses
}

export interface SingingPianosQuestion extends BaseQuestion {
  type: 'singing-pianos';
  boxes: PianoBox[];
  presenterHint?: string;   // NEW — only present in presenter-endpoint responses
}

// All other interfaces unchanged:
// OpenQuestion     — already has presenterHint?
// ClosedQuestion   — already has presenterHint?
// ImageRebusQuestion — no changes
```

**Impact**: Because `title` is on `BaseQuestion`, it is inherited by all five question type interfaces without any additional changes.

---

## Frontend Components

### `QuestionList.tsx` (modified)

File: `src/QuizAppka/ClientApp/src/components/QuestionList.tsx`

**Change**: Replace `question.prompt` with a `getQuestionLabel` helper that applies the title-first fallback chain.

```tsx
function getQuestionLabel(question: Question): string {
  if (question.title?.trim()) return question.title;
  if (question.prompt?.trim()) return question.prompt;
  // Type-label fallback for questions with no text body and no title
  switch (question.type) {
    case 'meme': return 'Meme Question';
    case 'singing-pianos': return 'Singing Pianos';
    case 'image-rebus': return 'Image Rebus';
    default: return question.type;
  }
}

// In the list item:
<ListItemText
  primary={getQuestionLabel(question)}
  slotProps={{
    primary: {
      noWrap: true,
      sx: { overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '2rem' },
    },
  }}
/>
```

**No change** to props interface, layout, or item interaction.

---

### `MemeQuestion.tsx` (modified)

File: `src/QuizAppka/ClientApp/src/components/MemeQuestion.tsx`

**Change**: Add presenter hint rendering, identical to the existing pattern in `ClosedQuestion.tsx`:

```tsx
{displayMode !== 'mirror' && question.presenterHint && (
  <Typography variant="body2" color="text.secondary" data-testid="presenter-hint">
    {isUrl(question.presenterHint) ? (
      <Link href={question.presenterHint} target="_blank" rel="noopener noreferrer">
        {question.presenterHint}
      </Link>
    ) : (
      question.presenterHint
    )}
  </Typography>
)}
```

The `isUrl` helper (already present in the file or imported from a shared util) and the `displayMode` prop (already accepted by this component) require no new additions.

---

### `SingingPianos.tsx` (modified)

File: `src/QuizAppka/ClientApp/src/components/SingingPianos.tsx`

**Change**: Same hint block as `MemeQuestion.tsx` above, placed after the boxes grid.

---

## Entity Summary Table

| Entity | Field added | Type | Required | Notes |
|--------|-------------|------|----------|-------|
| `Question` (all types) | `title` | `string?` | No | Optional short label for list display |
| `MemeQuestion` | `presenterHint` | `string?` | No | Presenter-only; stripped from public API |
| `SingingPianosQuestion` | `presenterHint` | `string?` | No | Presenter-only; stripped from public API |

## State Transitions

No new state transitions. `presenterHint` is static data; it is loaded from JSON at startup and never modified at runtime.

## Validation Rules Summary

| Field | Rule |
|-------|------|
| `title` | Optional; empty string treated as absent by frontend `getQuestionLabel` |
| `presenterHint` (all types) | Optional; empty string treated as absent by frontend conditional render |
| `presenterHint` in public API | Always absent — ensured by `StripPresenterData` reconstruction |
| `title` in public API | Present when defined — `StripPresenterData` must copy it when reconstructing stripped instances |

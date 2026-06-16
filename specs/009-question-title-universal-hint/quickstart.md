# Quickstart: Question Title Field and Universal Presenter Hint

**Branch**: `009-question-title-universal-hint`  
**Date**: 2026-06-16

## Overview

This feature makes two additive changes to the question data model:

1. **`title` field** — optional short label on all question types, displayed in the question list instead of the full prompt.
2. **`presenterHint` on meme and singing-pianos** — extends the existing hint pattern (already on closed and open questions) to the remaining two interactive question types.

Both fields are optional and backwards-compatible.

---

## Running the Application

```bash
# From repo root — start backend + frontend together via Aspire
dotnet run --project src/QuizAppka.AspireHost/QuizAppka.AspireHost.AppHost

# Or run backend only
dotnet run --project src/QuizAppka

# Frontend dev server (separate terminal, inside ClientApp)
cd src/QuizAppka/ClientApp
npm install
npm run dev
```

---

## Running Tests

### Backend tests
```bash
dotnet test tests/QuizAppka.Tests/
```

### Frontend tests (Vitest)
```bash
cd src/QuizAppka/ClientApp
npm run test          # run once
npm run test -- --watch   # watch mode
```

### Frontend lint + type-check
```bash
cd src/QuizAppka/ClientApp
npm run lint
npm run build         # also runs tsc
```

### E2E tests (Playwright)
```bash
cd tests/QuizAppka.E2E
npx playwright test
```

---

## Backend Changes

### 1. `Question.cs` — Add `Title` property

```csharp
// src/QuizAppka/Models/Question.cs
public abstract class Question
{
    public string Id { get; init; } = string.Empty;
    public string Prompt { get; init; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Title { get; init; }   // ADD THIS
}
```

### 2. `MemeQuestion.cs` — Add `PresenterHint` property

```csharp
// src/QuizAppka/Models/MemeQuestion.cs
public class MemeQuestion : Question
{
    public string EntryImage { get; init; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? RevealImage { get; init; }

    public AnswerOption[] Options { get; init; } = [];

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? PresenterHint { get; init; }   // ADD THIS
}
```

### 3. `SingingPianosQuestion.cs` — Add `PresenterHint` property

```csharp
// src/QuizAppka/Models/SingingPianosQuestion.cs
public class SingingPianosQuestion : Question
{
    public PianoBox[] Boxes { get; init; } = [];

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? PresenterHint { get; init; }   // ADD THIS
}
```

### 4. `QuizController.cs` — Extend `StripPresenterData`

```csharp
private static Question StripPresenterData(Question question) => question switch
{
    ClosedQuestion closed when closed.PresenterHint is not null
        => new ClosedQuestion
        {
            Id = closed.Id,
            Prompt = closed.Prompt,
            Title = closed.Title,      // ADD — was missing before
            Options = closed.Options
        },
    OpenQuestion open when open.PresenterHint is not null
        => new OpenQuestion
        {
            Id = open.Id,
            Prompt = open.Prompt,
            Title = open.Title         // ADD — was missing before
        },
    MemeQuestion meme when meme.PresenterHint is not null           // ADD NEW ARM
        => new MemeQuestion
        {
            Id = meme.Id,
            Prompt = meme.Prompt,
            Title = meme.Title,
            EntryImage = meme.EntryImage,
            RevealImage = meme.RevealImage,
            Options = meme.Options
        },
    SingingPianosQuestion piano when piano.PresenterHint is not null  // ADD NEW ARM
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

---

## Frontend Changes

### 5. `quiz.ts` — Add `title` to `BaseQuestion`; add `presenterHint` to `MemeQuestion` and `SingingPianosQuestion`

```typescript
// src/QuizAppka/ClientApp/src/types/quiz.ts
export interface BaseQuestion {
  id: string;
  type: string;
  prompt: string;
  title?: string;   // ADD THIS
}

export interface MemeQuestion extends BaseQuestion {
  type: 'meme';
  entryImage: string;
  revealImage?: string;
  options: AnswerOption[];
  presenterHint?: string;   // ADD THIS
}

export interface SingingPianosQuestion extends BaseQuestion {
  type: 'singing-pianos';
  boxes: PianoBox[];
  presenterHint?: string;   // ADD THIS
}
```

### 6. `QuestionList.tsx` — Display title with fallback

```tsx
// src/QuizAppka/ClientApp/src/components/QuestionList.tsx

function getQuestionLabel(question: Question): string {
  if (question.title?.trim()) return question.title;
  if (question.prompt?.trim()) return question.prompt;
  switch (question.type) {
    case 'meme': return 'Meme Question';
    case 'singing-pianos': return 'Singing Pianos';
    case 'image-rebus': return 'Image Rebus';
    default: return question.type;
  }
}

// Replace `question.prompt` with `getQuestionLabel(question)` in the ListItemText primary prop
<ListItemText
  primary={getQuestionLabel(question)}
  slotProps={{ primary: { noWrap: true, sx: { overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '2rem' } } }}
/>
```

### 7. `MemeQuestion.tsx` — Add presenter hint rendering

```tsx
// src/QuizAppka/ClientApp/src/components/MemeQuestion.tsx
// Add after the existing question content, before the closing fragment

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

The `isUrl` helper already exists in `ClosedQuestion.tsx`; extract it to a shared util or duplicate it in `MemeQuestion.tsx` (same pattern used in `OpenQuestion.tsx`).

### 8. `SingingPianos.tsx` — Add presenter hint rendering

Identical hint block as step 7 above, placed after the boxes grid.

---

## Data File Example

```json
{
  "id": "example",
  "name": "Example Category",
  "questions": [
    {
      "id": "q1",
      "type": "meme",
      "title": "Nick Young",
      "prompt": "What is Nick Young wondering?",
      "entryImage": "memes/nick-young.jpg",
      "revealImage": "memes/nick-young-reveal.jpg",
      "options": [{"id": "a", "text": "Why?"}],
      "presenterHint": "Source: Marvel meme template"
    },
    {
      "id": "q2",
      "type": "singing-pianos",
      "title": "Beatles Lyric",
      "prompt": "Reveal the hidden words:",
      "boxes": [
        {"id": "b1", "hiddenText": "LOVE"},
        {"id": "b2", "hiddenText": "IS"},
        {"id": "b3", "hiddenText": "ALL"},
        {"id": "b4", "hiddenText": "YOU"},
        {"id": "b5", "hiddenText": "NEED"}
      ],
      "presenterHint": "All You Need Is Love — The Beatles, 1967"
    }
  ]
}
```

---

## Test Coverage Guide

### Backend (xUnit) — `tests/QuizAppka.Tests/`

**`Models/QuestionSerializationTests.cs`** — extend with:
- `Question_WithTitle_SerializesAndDeserializesCorrectly` (one test per type, or parameterized)
- `Question_WithoutTitle_TitleIsAbsentFromJson` (verify `[JsonIgnore(WhenWritingNull)]` works)
- `MemeQuestion_WithPresenterHint_SerializesCorrectly`
- `MemeQuestion_WithoutPresenterHint_HintIsAbsentFromJson`
- `SingingPianosQuestion_WithPresenterHint_SerializesCorrectly`
- `SingingPianosQuestion_WithoutPresenterHint_HintIsAbsentFromJson`

**`Controllers/QuizControllerTests.cs`** — extend with:
- `StripPresenterData_MemeQuestion_WithHint_RemovesHintAndPreservesOtherFields`
- `StripPresenterData_MemeQuestion_WithHint_PreservesTitle`
- `StripPresenterData_MemeQuestion_WithoutHint_ReturnsSameInstance`
- `StripPresenterData_SingingPianos_WithHint_RemovesHintAndPreservesOtherFields`
- `StripPresenterData_ClosedQuestion_WithHint_NowPreservesTitle` (regression fix)
- `StripPresenterData_OpenQuestion_WithHint_NowPreservesTitle` (regression fix)

### Frontend (Vitest) — `src/QuizAppka/ClientApp/src/components/__tests__/`

**`QuestionList.test.tsx`** (new file):
- Renders `title` when question has one
- Renders `prompt` when no title
- Renders type-label when both title and prompt are absent/empty
- Does NOT render full prompt when title is defined

**`MemeQuestion.test.tsx`** — extend with:
- Renders hint text in presenter mode (no displayMode / displayMode='presenter')
- Renders hint as link when hint is a URL
- Does NOT render hint in mirror mode
- Does NOT render hint block when hint is undefined

**`SingingPianos.test.tsx`** — extend with same four cases as MemeQuestion above.

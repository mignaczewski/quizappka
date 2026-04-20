# Data Model: Question Types Enhancements

**Branch**: `005-question-types-enhancements` | **Date**: 2026-04-20

## Overview

This document describes the entities added or modified for this feature. It covers the backend C# models, the frontend TypeScript types, the in-memory session state extension, and the JSON data file shapes. No database schema is involved; persistence is through read-only JSON category files.

---

## Backend Models (C#)

### `Question` (modified)

File: `src/QuizAppka/Models/Question.cs`

```csharp
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(OpenQuestion), "open")]
[JsonDerivedType(typeof(ClosedQuestion), "closed")]
[JsonDerivedType(typeof(ImageRebusQuestion), "image-rebus")]
[JsonDerivedType(typeof(MemeQuestion), "meme")]              // NEW
[JsonDerivedType(typeof(SingingPianosQuestion), "singing-pianos")]  // NEW
public abstract class Question
{
    public string Id { get; init; } = string.Empty;
    public string Prompt { get; init; } = string.Empty;
}
```

**Change**: Two new `[JsonDerivedType]` registrations. Existing types are unaffected.

---

### `ClosedQuestion` (modified)

File: `src/QuizAppka/Models/ClosedQuestion.cs`

```csharp
public class ClosedQuestion : Question
{
    public AnswerOption[] Options { get; init; } = [];
    public string? PresenterHint { get; init; }    // NEW — optional; null when absent
}
```

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `Id` | `string` | yes | Inherited |
| `Prompt` | `string` | yes | Inherited |
| `Options` | `AnswerOption[]` | yes | One or more answer options |
| `PresenterHint` | `string?` | no | Plain text or URL; MUST NOT appear in regular category API responses |

**Validation rules**:
- `PresenterHint` may be `null` or absent from JSON — treated identically as "no hint".
- When present and non-empty, may be any UTF-8 string. Not validated as a conforming URL by the backend; frontend renders as plain text link if it looks like a URL.

---

### `MemeQuestion` (new)

File: `src/QuizAppka/Models/MemeQuestion.cs`

```csharp
public class MemeQuestion : Question
{
    public string EntryImage { get; init; } = string.Empty;
    public string? RevealImage { get; init; }
    public AnswerOption[] Options { get; init; } = [];
}
```

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `Id` | `string` | yes | Inherited |
| `Prompt` | `string` | yes | Inherited |
| `EntryImage` | `string` | yes | Filename or path for the initial/entry image (relative to `wwwroot/images/`) |
| `RevealImage` | `string?` | no | Filename or path for the reveal image; `null` disables the reveal action |
| `Options` | `AnswerOption[]` | yes | Text-based answer options (same shape as `ClosedQuestion`) |

**Validation rules**:
- `EntryImage` must be non-empty.
- `RevealImage` may be `null` or absent — treated as "no reveal available"; the reveal action is disabled in the presenter view.
- `Options` may be an empty array if the question has no multiple-choice options, but at least one option is expected in normal use.

**State transitions**:
```
[initial]  EntryImage shown, options visible, reveal action available (if RevealImage present)
           ↓  presenter triggers reveal
[revealed] RevealImage shown, options remain visible, reveal action hidden/disabled
           ↓  presenter navigates away
[reset]    → back to [initial] on next display
```

---

### `SingingPianosQuestion` (new)

File: `src/QuizAppka/Models/SingingPianosQuestion.cs`

```csharp
public class SingingPianosQuestion : Question
{
    public PianoBox[] Boxes { get; init; } = [];
}
```

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `Id` | `string` | yes | Inherited |
| `Prompt` | `string` | yes | Inherited |
| `Boxes` | `PianoBox[]` | yes | Expected to contain exactly 5 entries |

**Validation rules**:
- `Boxes` SHOULD contain exactly 5 entries. Fewer entries are tolerated — the frontend renders exactly 5 slots and hides missing ones as disabled placeholders. More than 5 entries: only the first 5 are rendered.
- Each `PianoBox.HiddenText` must be non-empty string for the box to be revealable; empty/null hidden text is treated as a disabled box.

---

### `PianoBox` (new)

File: `src/QuizAppka/Models/PianoBox.cs`

```csharp
public class PianoBox
{
    public string Id { get; init; } = string.Empty;
    public string HiddenText { get; init; } = string.Empty;
}
```

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `Id` | `string` | yes | Unique within the question; used as array index reference for reveal state |
| `HiddenText` | `string` | yes | Text revealed when the box is clicked |

---

### `RevealState` (new)

File: `src/QuizAppka/Models/PresenterStateDto.cs` (same file as DTO, or a new file)

```csharp
public record RevealState(
    bool? MemeImageRevealed = null,
    bool[]? SingingPianosBoxesRevealed = null
);
```

**Fields**:

| Field | Type | Notes |
|-------|------|-------|
| `MemeImageRevealed` | `bool?` | `true` = second image shown; `null` = initial state |
| `SingingPianosBoxesRevealed` | `bool[]?` | Array of exactly 5 booleans; index N = box N revealed; `null` = all hidden |

---

### `PresenterStateDto` (modified)

File: `src/QuizAppka/Models/PresenterStateDto.cs`

```csharp
public record PresenterStateDto(
    string Screen,
    string? CategoryId = null,
    string? QuestionId = null,
    RevealState? RevealState = null    // NEW — null when no active reveal state
);
```

**Change**: One new optional field `RevealState`. Existing consumers (mirrors that only read `Screen`, `CategoryId`, `QuestionId`) are unaffected; `RevealState` defaults to `null` and JSON-deserializes as `null` when absent. Backward-compatible.

---

## Frontend Types (TypeScript)

File: `src/QuizAppka/ClientApp/src/types/quiz.ts`

```typescript
export interface ClosedQuestion extends BaseQuestion {
  type: 'closed';
  options: AnswerOption[];
  presenterHint?: string;    // NEW — only present in presenter-facing API responses
}

export interface MemeQuestion extends BaseQuestion {   // NEW
  type: 'meme';
  entryImage: string;
  revealImage?: string;
  options: AnswerOption[];
}

export interface SingingPianosQuestion extends BaseQuestion {  // NEW
  type: 'singing-pianos';
  boxes: PianoBox[];
}

export interface PianoBox {  // NEW
  id: string;
  hiddenText: string;
}

export type Question =
  | OpenQuestion
  | ClosedQuestion
  | ImageRebusQuestion
  | MemeQuestion           // NEW
  | SingingPianosQuestion; // NEW
```

File: `src/QuizAppka/ClientApp/src/types/mirror.ts` (extended concept, may be part of quiz.ts)

```typescript
export interface RevealState {
  memeImageRevealed?: boolean;
  singingPianosBoxesRevealed?: boolean[];  // length 5
}

// PresenterScreen union is unchanged — RevealState travels inside the SignalR payload
export interface StateUpdatedPayload {
  screen: string;
  categoryId?: string | null;
  questionId?: string | null;
  revealState?: RevealState | null;   // NEW
}
```

---

## JSON Category Data Format

The category JSON files under `src/QuizAppka/Data/categories/` accept the following new shapes:

### Closed question with presenter hint

```json
{
  "id": "q-hint-example",
  "type": "closed",
  "prompt": "Which year was the treaty signed?",
  "options": [
    { "id": "a", "text": "1918" },
    { "id": "b", "text": "1945" }
  ],
  "presenterHint": "Answer: 1918. Source: https://example.com/treaty"
}
```

### Meme question

```json
{
  "id": "q-meme-example",
  "type": "meme",
  "prompt": "What is this person feeling?",
  "entryImage": "meme-entry.jpg",
  "revealImage": "meme-reveal.jpg",
  "options": [
    { "id": "a", "text": "Confused" },
    { "id": "b", "text": "Excited" },
    { "id": "c", "text": "Disappointed" }
  ]
}
```

### Singing pianos question

```json
{
  "id": "q-pianos-example",
  "type": "singing-pianos",
  "prompt": "Reveal the hidden words one by one:",
  "boxes": [
    { "id": "box1", "hiddenText": "LOVE" },
    { "id": "box2", "hiddenText": "IS" },
    { "id": "box3", "hiddenText": "ALL" },
    { "id": "box4", "hiddenText": "YOU" },
    { "id": "box5", "hiddenText": "NEED" }
  ]
}
```

---

## Entity Relationship Summary

```
Question (abstract, polymorphic)
├── OpenQuestion          — unchanged
├── ClosedQuestion        — extended with optional PresenterHint
├── ImageRebusQuestion    — unchanged
├── MemeQuestion          — new; uses AnswerOption[] (shared)
└── SingingPianosQuestion — new; uses PianoBox[] (new)

AnswerOption              — unchanged; shared by ClosedQuestion and MemeQuestion
PianoBox                  — new; used by SingingPianosQuestion

PresenterStateDto         — extended with optional RevealState
RevealState               — new; carries meme reveal bool and pianos boxes bool[5]
```

# API Contract: Quiz API — Question Title Field and Universal Presenter Hint

**Branch**: `009-question-title-universal-hint`  
**Date**: 2026-06-16  
**Affected endpoints**: `GET /api/quiz/categories/{id}`, `GET /api/quiz/presenter/categories/{id}`

---

## Summary of Changes

| Change | Scope |
|--------|-------|
| `title` field added to all question types | Both public and presenter endpoints |
| `presenterHint` added to `meme` questions | Presenter endpoint only |
| `presenterHint` added to `singing-pianos` questions | Presenter endpoint only |
| `presenterHint` on `closed` and `open` questions | No change — already present |
| `StripPresenterData` extended | Strips `presenterHint` from meme and singing-pianos; also fixes `title` propagation on all stripped types |

---

## GET /api/quiz/categories/{id} (public / mirror route)

### What changed

- All question objects MAY now include a `title` field when it is defined in the data file.
- `presenterHint` is NEVER present on any question type in this response (unchanged requirement, now also enforced for meme and singing-pianos).

### Updated question discriminator table

| `type` value | Additional fields | `title` | `presenterHint` |
|--------------|-------------------|---------|-----------------|
| `"open"` | _(none)_ | optional | NEVER |
| `"closed"` | `options: AnswerOption[]` | optional | NEVER |
| `"image-rebus"` | `imageRef: string` | optional | NEVER |
| `"meme"` | `entryImage: string`, `revealImage?: string`, `options: AnswerOption[]` | optional | NEVER |
| `"singing-pianos"` | `boxes: PianoBox[]` | optional | NEVER |

### Success Response (200 OK) — example showing title and no presenterHint

```json
{
  "id": "sample-category",
  "name": "Sample Category",
  "questions": [
    {
      "id": "q1",
      "type": "open",
      "title": "Capital of France",
      "prompt": "What is the capital of France?"
    },
    {
      "id": "q2",
      "type": "closed",
      "title": "Closest Planet",
      "prompt": "Which planet is closest to the Sun?",
      "options": [
        { "id": "a", "text": "Venus" },
        { "id": "b", "text": "Mercury" }
      ]
    },
    {
      "id": "q3",
      "type": "meme",
      "title": "Confused Nick Young",
      "prompt": "What does Nick Young think?",
      "entryImage": "memes/nick-young.jpg",
      "revealImage": "memes/nick-young-reveal.jpg",
      "options": [
        { "id": "a", "text": "Why?" }
      ]
    },
    {
      "id": "q4",
      "type": "singing-pianos",
      "title": "Song Fragments",
      "prompt": "Reveal the hidden words:",
      "boxes": [
        { "id": "box1", "hiddenText": "LOVE" },
        { "id": "box2", "hiddenText": "IS" },
        { "id": "box3", "hiddenText": "ALL" },
        { "id": "box4", "hiddenText": "YOU" },
        { "id": "box5", "hiddenText": "NEED" }
      ]
    }
  ]
}
```

**Note**: `title` fields are absent from questions that do not define them in the data file — no null placeholder is emitted.

---

## GET /api/quiz/presenter/categories/{id} (presenter route)

### What changed

- All question objects MAY now include a `title` field when it is defined.
- `presenterHint` is now returned for `meme` and `singing-pianos` questions when defined (in addition to `closed` and `open` which already worked).

### Updated question discriminator table

| `type` value | Additional fields | `title` | `presenterHint` |
|--------------|-------------------|---------|-----------------|
| `"open"` | _(none)_ | optional | optional |
| `"closed"` | `options: AnswerOption[]` | optional | optional |
| `"image-rebus"` | `imageRef: string` | optional | N/A — not supported |
| `"meme"` | `entryImage`, `revealImage?`, `options` | optional | optional (NEW) |
| `"singing-pianos"` | `boxes: PianoBox[]` | optional | optional (NEW) |

### Success Response (200 OK) — example showing title and presenterHint

```json
{
  "id": "sample-category",
  "name": "Sample Category",
  "questions": [
    {
      "id": "q1",
      "type": "open",
      "title": "Capital of France",
      "prompt": "What is the capital of France?",
      "presenterHint": "Answer: Paris"
    },
    {
      "id": "q3",
      "type": "meme",
      "title": "Confused Nick Young",
      "prompt": "What does Nick Young think?",
      "entryImage": "memes/nick-young.jpg",
      "revealImage": "memes/nick-young-reveal.jpg",
      "options": [
        { "id": "a", "text": "Why?" }
      ],
      "presenterHint": "This is about cognitive dissonance"
    },
    {
      "id": "q4",
      "type": "singing-pianos",
      "title": "Song Fragments",
      "prompt": "Reveal the hidden words:",
      "boxes": [
        { "id": "box1", "hiddenText": "LOVE" },
        { "id": "box2", "hiddenText": "IS" },
        { "id": "box3", "hiddenText": "ALL" },
        { "id": "box4", "hiddenText": "YOU" },
        { "id": "box5", "hiddenText": "NEED" }
      ],
      "presenterHint": "Beatles — All You Need Is Love"
    }
  ]
}
```

---

## Data File Schema (JSON category files)

Both new fields are optional. Existing files without them remain valid and load correctly.

```json
{
  "id": "my-category",
  "name": "My Category",
  "questions": [
    {
      "id": "q1",
      "type": "meme",
      "title": "Short title for list",
      "prompt": "Full question text shown on the quiz screen",
      "entryImage": "memes/example.jpg",
      "options": [{ "id": "a", "text": "Answer A" }],
      "presenterHint": "Scoring note or source URL for presenter only"
    }
  ]
}
```

| Field | Type | Required | Visible in public route | Visible in presenter route |
|-------|------|----------|------------------------|---------------------------|
| `title` | `string` | No | Yes (when defined) | Yes (when defined) |
| `presenterHint` | `string` | No | **Never** | Yes (when defined) |

---

## TypeScript Client Types Reference

File: `src/QuizAppka/ClientApp/src/types/quiz.ts`

```typescript
export interface BaseQuestion {
  id: string;
  type: string;
  prompt: string;
  title?: string;             // NEW — optional, used by QuestionList for display
}

export interface MemeQuestion extends BaseQuestion {
  type: 'meme';
  entryImage: string;
  revealImage?: string;
  options: AnswerOption[];
  presenterHint?: string;     // NEW — only present in presenter-endpoint responses
}

export interface SingingPianosQuestion extends BaseQuestion {
  type: 'singing-pianos';
  boxes: PianoBox[];
  presenterHint?: string;     // NEW — only present in presenter-endpoint responses
}

// OpenQuestion and ClosedQuestion already have presenterHint?: string — unchanged
// ImageRebusQuestion — unchanged
```

---

## No Breaking Changes

- All new fields are optional; absence from the JSON response is equivalent to `undefined` in TypeScript.
- The `type` discriminators are unchanged.
- All existing question consumers (mirror page, public quiz page) are unaffected: the public route never returns `presenterHint`, and the mirror component passes `displayMode=''mirror''` which suppresses hint rendering even if the field were somehow present.
- Existing JSON data files without `title` or `presenterHint` load and function identically to before.

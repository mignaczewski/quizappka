# Quickstart: Open Question Presenter Hint

**Branch**: `006-open-question-presenter-hint` | **Date**: 2026-04-21

## What This Feature Does

Adds an optional `presenterHint` field to open questions. When configured, the
hint appears in the presenter view alongside the question prompt. It is never
visible in the mirror/audience view. The behaviour is identical to the existing
presenter hint on closed questions.

---

## Files to Change

| File | Change |
|------|--------|
| `src/QuizAppka/Models/OpenQuestion.cs` | Add `PresenterHint` property with `[JsonIgnore(WhenWritingNull)]` |
| `src/QuizAppka/Controllers/QuizController.cs` | Extend `StripPresenterData` to null-out `PresenterHint` on `OpenQuestion` |
| `src/QuizAppka/ClientApp/src/types/quiz.ts` | Add `presenterHint?: string` to `OpenQuestion` interface |
| `src/QuizAppka/ClientApp/src/components/OpenQuestion.tsx` | Render hint (mirrors `ClosedQuestion.tsx`) |
| `src/QuizAppka/ClientApp/src/components/__tests__/OpenQuestion.test.tsx` | Add hint tests |
| `tests/QuizAppka.Tests/Controllers/QuizControllerTests.cs` | Add strip + include integration tests for open question |

---

## Backend Changes

### 1. `OpenQuestion.cs` — Add `PresenterHint`

```csharp
using System.Text.Json.Serialization;

namespace QuizAppka.Models;

public class OpenQuestion : Question
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? PresenterHint { get; init; }
}
```

### 2. `QuizController.cs` — Extend `StripPresenterData`

The existing method handles only `ClosedQuestion`. Extend it to also strip
`PresenterHint` from `OpenQuestion`:

```csharp
private static Question StripPresenterData(Question question) => question switch
{
    ClosedQuestion closed when closed.PresenterHint is not null
        => new ClosedQuestion { Id = closed.Id, Prompt = closed.Prompt, Options = closed.Options },
    OpenQuestion open when open.PresenterHint is not null
        => new OpenQuestion { Id = open.Id, Prompt = open.Prompt },
    _ => question,
};
```

---

## Frontend Changes

### 3. `quiz.ts` — Add `presenterHint` to `OpenQuestion` interface

```typescript
export interface OpenQuestion extends BaseQuestion {
  type: 'open';
  presenterHint?: string;
}
```

### 4. `OpenQuestion.tsx` — Render the hint

```tsx
import { Link, Typography } from '@mui/material';
import type { OpenQuestion as OpenQuestionType } from '../types/quiz';

interface Props {
  question: OpenQuestionType;
}

function isUrl(value: string): boolean {
  return value.startsWith('https://') || value.startsWith('http://');
}

export default function OpenQuestion({ question }: Props) {
  return (
    <>
      <Typography variant="h6">{question.prompt}</Typography>
      {question.presenterHint && (
        <Typography variant="body2" color="text.secondary" data-testid="presenter-hint" sx={{ mt: 1 }}>
          {isUrl(question.presenterHint) ? (
            <Link href={question.presenterHint} target="_blank" rel="noopener noreferrer">
              {question.presenterHint}
            </Link>
          ) : (
            question.presenterHint
          )}
        </Typography>
      )}
    </>
  );
}
```

---

## Test Changes

### 5. `OpenQuestion.test.tsx` — Add hint test cases

Add the following tests to the existing `describe('OpenQuestion', ...)` block:

```tsx
it('does not render hint section when presenterHint is absent', () => {
  render(<OpenQuestion question={{ id: 'q1', type: 'open', prompt: 'A question?' }} />);
  expect(screen.queryByTestId('presenter-hint')).not.toBeInTheDocument();
});

it('renders plain text presenterHint when provided', () => {
  render(<OpenQuestion question={{ id: 'q1', type: 'open', prompt: 'A question?', presenterHint: 'The answer is 42.' }} />);
  expect(screen.getByTestId('presenter-hint')).toBeInTheDocument();
  expect(screen.getByText('The answer is 42.')).toBeInTheDocument();
});

it('renders presenterHint as a link when it starts with https://', () => {
  render(<OpenQuestion question={{ id: 'q1', type: 'open', prompt: 'A question?', presenterHint: 'https://example.com/hint' }} />);
  const link = screen.getByRole('link');
  expect(link).toHaveAttribute('href', 'https://example.com/hint');
});

it('renders presenterHint as a link when it starts with http://', () => {
  render(<OpenQuestion question={{ id: 'q1', type: 'open', prompt: 'A question?', presenterHint: 'http://example.com/hint' }} />);
  const link = screen.getByRole('link');
  expect(link).toHaveAttribute('href', 'http://example.com/hint');
});
```

### 6. `QuizControllerTests.cs` — Add integration tests

```csharp
[Fact]
public async Task GetCategory_PublicEndpoint_StripsPresenterHintFromOpenQuestion()
{
    var fakeService = new FakeQuizDataService(
    [
        new QuizCategory
        {
            Id = "cat1",
            Name = "Cat 1",
            Questions =
            [
                new OpenQuestion { Id = "q1", Prompt = "Question?", PresenterHint = "Secret hint" },
            ],
        },
    ]);

    using var factory = CreateFactoryWithService(fakeService);
    var client = factory.CreateClient();

    var response = await client.GetAsync("/api/quiz/categories/cat1");

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    var json = await response.Content.ReadAsStringAsync();
    Assert.DoesNotContain("Secret hint", json, StringComparison.OrdinalIgnoreCase);
    Assert.DoesNotContain("presenterHint", json, StringComparison.OrdinalIgnoreCase);
}

[Fact]
public async Task GetPresenterCategory_IncludesPresenterHintInOpenQuestion()
{
    var fakeService = new FakeQuizDataService(
    [
        new QuizCategory
        {
            Id = "cat1",
            Name = "Cat 1",
            Questions =
            [
                new OpenQuestion { Id = "q1", Prompt = "Question?", PresenterHint = "Secret hint" },
            ],
        },
    ]);

    using var factory = CreateFactoryWithService(fakeService);
    var client = factory.CreateClient();

    var response = await client.GetAsync("/api/quiz/presenter/categories/cat1");

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    var json = await response.Content.ReadAsStringAsync();
    Assert.Contains("Secret hint", json, StringComparison.OrdinalIgnoreCase);
}
```

---

## Validation Commands

```bash
# Backend
dotnet build src/QuizAppka/QuizAppka.csproj
dotnet test tests/QuizAppka.Tests/QuizAppka.Tests.csproj

# Frontend
cd src/QuizAppka/ClientApp
npm run lint
npm test
```

---

## Data File Example

To add a presenter hint to an open question in a category JSON file:

```json
{
  "id": "q1",
  "type": "open",
  "prompt": "What is the capital of France?",
  "presenterHint": "Answer: Paris"
}
```

Omit `presenterHint` entirely for questions that have no hint.

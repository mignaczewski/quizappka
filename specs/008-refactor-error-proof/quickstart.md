# Quickstart: Code Refactoring for Predictability and Error Safety

**Branch**: `008-refactor-error-proof` | **Date**: 2026-05-02

---

## Prerequisites

- .NET 10 SDK
- Node.js 22+ / npm 10+
- VS Code (recommended) or any IDE with C# + TypeScript support

---

## Running Locally

```bash
# From repo root
cd src/QuizAppka
dotnet run
```

The SPA proxy starts Vite automatically (`npm run dev` inside `ClientApp/`). Open `https://localhost:{port}` — port is printed by dotnet on startup.

---

## Running Tests

### Frontend
```bash
cd src/QuizAppka/ClientApp
npm run test        # runs: vitest run (one-shot)
```

### Backend
```bash
cd tests/QuizAppka.Tests
dotnet test
```

### All tests from repo root
```bash
dotnet test
cd src/QuizAppka/ClientApp && npm run test
```

---

## Key Files Changed in This Feature

| File | What changed |
|------|-------------|
| `src/QuizAppka/Models/RevealedBox.cs` | NEW — `record RevealedBox(string Id, bool Revealed)` |
| `src/QuizAppka/Models/RevealState.cs` | `SingingPianosBoxesRevealed` type: `bool[]?` → `RevealedBox[]?` |
| `src/QuizAppka/Models/Question.cs` | Added `ValidationError` property |
| `src/QuizAppka/Services/QuizDataService.cs` | Added piano + meme validation in `FilterValidQuestions` |
| `src/QuizAppka/ClientApp/src/types/quiz.ts` | Added `RevealedBox`, updated `RevealState`, added `validationError` |
| `src/QuizAppka/ClientApp/src/utils/url.ts` | NEW — shared `isUrl` helper |
| `src/QuizAppka/ClientApp/src/components/SingingPianos.tsx` | New prop types, by-ID lookup, fixed `disabled` |
| `src/QuizAppka/ClientApp/src/components/ClosedQuestion.tsx` | Uses shared `isUrl` |
| `src/QuizAppka/ClientApp/src/components/OpenQuestion.tsx` | Uses shared `isUrl` |
| `src/QuizAppka/ClientApp/src/hooks/usePresenterSession.ts` | Guards against empty params |
| `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx` | Stale closure fix, `useCallback`, hub `useEffect` |
| `src/QuizAppka/ClientApp/src/pages/QuestionListPage.tsx` | Missing-param guard, `useCallback` |
| `src/QuizAppka/ClientApp/src/pages/MirrorPage.tsx` | Error state for connection failure |
| `tests/QuizAppka.Tests/Models/QuestionSerializationTests.cs` | Updated `RevealState` test for new type |
| `tests/QuizAppka.Tests/Services/QuizDataServiceTests.cs` | New piano + meme validation tests |

---

## Verifying the Breaking Wire Change

After running the app:

1. Open the presenter view and a mirror view in separate tabs.
2. Navigate to a `singing-pianos` question in the presenter.
3. Reveal a box — the mirror view should update instantly showing the same box revealed.
4. Verify revealed state persists correctly when revealing multiple boxes in succession.

---

## Checking ValidationError in Browser

1. Add a `singing-pianos` question with an empty `boxes: []` array to a JSON file in `Data/categories/`.
2. Start the app and open the question list for that category.
3. The question should appear in the list with a visible error indicator (e.g., a warning icon or text).
4. No infinite spinner or crash should occur.

# Quickstart: Question Types Enhancements

**Branch**: `005-question-types-enhancements` | **Date**: 2026-04-20

## Prerequisites

- .NET 10 SDK
- Node.js 22+ / npm
- The app running (either via Aspire host or directly — see existing quickstart)

---

## Run All Tests (must pass before merge)

### Backend

```powershell
cd src/QuizAppka
dotnet test ../../tests/QuizAppka.Tests/QuizAppka.Tests.csproj
```

### Frontend (lint + type check + component tests)

```powershell
cd src/QuizAppka/ClientApp
npm run lint
npm run type-check
npm run test
```

### E2E

```powershell
cd tests/QuizAppka.E2E
npx playwright test
```

---

## Try It: Closed Question Presenter Hint

1. Start the app.
2. Open the presenter view: `http://localhost:5173/`
3. Navigate to a category that contains a closed question with a `presenterHint` defined in its JSON file.
4. Open the question detail page.
5. **Verify**: The hint text (or clickable URL) appears below the answer options in the presenter view.
6. Open the mirror view in a new tab: `http://localhost:5173/mirror`
7. The mirror view shows the same question — **verify the hint is not visible anywhere** in the mirror.

**Sample JSON for a closed question with a hint** (add to any category file under `src/QuizAppka/Data/categories/`):

```json
{
  "id": "q-hint",
  "type": "closed",
  "prompt": "Which planet is closest to the Sun?",
  "options": [
    { "id": "a", "text": "Mercury" },
    { "id": "b", "text": "Venus" }
  ],
  "presenterHint": "Answer: Mercury. Venus is closer to Earth."
}
```

---

## Try It: Meme Question with Image Reveal

1. Add a meme question to a category JSON file (see below).
2. Place the two image files in `src/QuizAppka/wwwroot/images/`.
3. Start the app and navigate to the category containing the meme question.
4. Open the question detail page in the presenter view.
5. **Verify**: The entry image and answer options are shown; no reveal image visible.
6. Open `/mirror` in a second tab — verify mirror shows the entry image.
7. Click the **Reveal Image** button in the presenter view.
8. **Verify**: The reveal image replaces the entry image in both the presenter view and the mirror tab.
9. Navigate away and return to the question — **verify** it resets to the entry image.

**Sample JSON**:

```json
{
  "id": "q-meme",
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

---

## Try It: Singing Pianos Question

1. Add a singing pianos question to a category JSON file (see below).
2. Start the app and navigate to the category.
3. Open the question detail page in the presenter view.
4. **Verify**: Five boxes are shown, all in the hidden/concealed state; no hidden text is visible.
5. Open `/mirror` in a second tab — verify all five boxes are hidden in the mirror.
6. Click box 1 in the presenter view — **verify** box 1 reveals its text in both views; boxes 2–5 remain hidden.
7. Click boxes in any order; verify each reveal independently updates both views.
8. Navigate away and return — verify all boxes reset to hidden.

**Sample JSON**:

```json
{
  "id": "q-pianos",
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

## Key Files Changed

| File | Change |
|------|--------|
| `src/QuizAppka/Models/Question.cs` | Add two new `[JsonDerivedType]` registrations |
| `src/QuizAppka/Models/ClosedQuestion.cs` | Add optional `PresenterHint` property |
| `src/QuizAppka/Models/MemeQuestion.cs` | New model |
| `src/QuizAppka/Models/SingingPianosQuestion.cs` | New model |
| `src/QuizAppka/Models/PianoBox.cs` | New model |
| `src/QuizAppka/Models/PresenterStateDto.cs` | Add optional `RevealState` field |
| `src/QuizAppka/Controllers/QuizController.cs` | Add `/api/quiz/presenter/categories/{id}`; strip hint from public endpoint |
| `src/QuizAppka/Data/categories/sample-category.json` | Add sample data for new types |
| `src/QuizAppka/ClientApp/src/types/quiz.ts` | Add `MemeQuestion`, `SingingPianosQuestion`, `PianoBox` types; extend `ClosedQuestion`, add `RevealState` |
| `src/QuizAppka/ClientApp/src/components/ClosedQuestion.tsx` | Render `presenterHint` when present |
| `src/QuizAppka/ClientApp/src/components/MemeQuestion.tsx` | New component |
| `src/QuizAppka/ClientApp/src/components/SingingPianos.tsx` | New component |
| `src/QuizAppka/ClientApp/src/components/QuestionDisplay.tsx` | Add cases for `meme` and `singing-pianos` |
| `src/QuizAppka/ClientApp/src/pages/QuestionDetailPage.tsx` | Add reveal callbacks; call `UpdateState` with `revealState` |
| `src/QuizAppka/ClientApp/src/services/quizApi.ts` | Add `fetchPresenterCategory` for presenter endpoint |
| `tests/QuizAppka.Tests/Models/QuestionSerializationTests.cs` | New — round-trip serialization tests |
| `tests/QuizAppka.Tests/Controllers/QuizControllerTests.cs` | Add tests for hint stripping and presenter endpoint |
| `tests/QuizAppka.Tests/Hubs/PresenterHubTests.cs` | Add reveal-state broadcast and late-join tests |
| `tests/QuizAppka.E2E/tests/question-types.spec.ts` | New — E2E tests for meme + singing pianos flows |

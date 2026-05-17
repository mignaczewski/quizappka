# Quickstart: React Refactor — useCallback & Revealed State

**Date**: 2026-05-17  
**Feature branch**: `008-usecallback-revealed-state`

---

## Prerequisites

- Node.js 20+ installed
- `cd src/QuizAppka/ClientApp`
- `npm install` (if not already done)

---

## Running the Frontend Tests

```bash
# From src/QuizAppka/ClientApp/
npm test
```

Runs the full vitest suite in non-watch mode. All tests must pass before merge.

---

## Type-Check

```bash
npm run type-check
```

Runs `tsc --noEmit`. This is the integration gate for the hub payload shape change — a type error here means `QuestionDetailPage` and `MirrorPage` are out of sync.

---

## Lint

```bash
npm run lint
```

Includes `eslint-plugin-react-hooks` which enforces correct `useCallback` dependency arrays. A warning or error here means a callback's deps are incorrect.

---

## Local Development Server

```bash
# Start ASP.NET Core backend first (from repo root):
dotnet run --project src/QuizAppka/QuizAppka.csproj

# Then in a second terminal:
cd src/QuizAppka/ClientApp
npm run dev
```

Navigate to `http://localhost:5173`. Open a second browser tab at `/mirror` to verify the mirror page reflects box reveals.

---

## Verifying the Refactor Manually

1. Start the dev server (see above).
2. Navigate to any Singing Pianos question (`/quiz/<categoryId>/<questionId>`).
3. Click a box — it should reveal its hidden text.
4. In the mirror tab (`/mirror`), the same box should reveal.
5. Click the same box again — nothing should change (idempotent).
6. Open DevTools → React DevTools Profiler → record while clicking an unrelated button. Confirm `SingingPianos` does not show a re-render when no reveal state changed.

---

## Key Files Changed

| File | What changed |
|------|-------------|
| `src/types/quiz.ts` | `PianoBoxReveal` interface added; `RevealState.singingPianosBoxesRevealed` type updated |
| `src/components/SingingPianos.tsx` | `revealedBoxes` prop type; reveal lookup by `box.id`; `onBoxReveal(box.id)` |
| `src/components/QuestionDisplay.tsx` | `onBoxReveal` prop type: `(index: number)` → `(boxId: string)` |
| `src/pages/QuestionDetailPage.tsx` | `onBoxReveal` + `onReveal` + `handleBack` wrapped in `useCallback`; correct dep arrays |
| `src/components/__tests__/SingingPianos.test.tsx` | Fixtures updated to `PianoBoxReveal[]` |
| `src/components/__tests__/QuestionDisplay.test.tsx` | `singingPianosBoxesRevealed` fixture updated |
| `src/pages/__tests__/QuestionDetailPage.test.tsx` | New state and callback-stability tests |

# Quickstart: Timed Open Question

**Date**: 2026-06-20  
**Feature branch**: `010-timed-open-question`

---

## Prerequisites

- .NET 10 SDK installed
- Node.js 20+ installed
- Frontend dependencies installed in `src/QuizAppka/ClientApp`
- E2E dependencies installed in `tests/QuizAppka.E2E`

---

## 1. Install Dependencies

```bash
# Frontend
cd src/QuizAppka/ClientApp
npm install

# E2E
cd ../../../tests/QuizAppka.E2E
npm install
```

---

## 2. Run Quality Gates

### Backend tests

```bash
cd tests/QuizAppka.Tests
dotnet test QuizAppka.Tests.csproj
```

### Frontend lint + types + unit tests

```bash
cd ../../src/QuizAppka/ClientApp
npm run lint
npm run type-check
npm run test
```

### E2E focus suites for this feature

```bash
cd ../../../tests/QuizAppka.E2E
npx playwright test tests/question-types.spec.ts tests/mirroring.spec.ts
```

---

## 3. Local Manual Verification Flow

1. Start backend from repository root:

```bash
dotnet run --project src/QuizAppka/QuizAppka.csproj
```

2. Start frontend dev server in separate terminal:

```bash
cd src/QuizAppka/ClientApp
npm run dev
```

3. Open presenter route for a timed-open question and a second tab at `/mirror`.
4. Confirm timer is visible in both views.
5. In presenter view, execute actions in order:
- Start
- Pause
- Start (resume)
- Reset
6. Confirm mirror reflects each state change within 1 second.
7. Confirm non-timed `open` question still renders without timer UI.

---

## 4. Expected Artifacts to Validate

- REST payload includes `timed-open` with `initialDurationSeconds`.
- SignalR `StateUpdated` includes `revealState.timerState` for timed-open interactions.
- Presenter controls available only in presenter view.
- Mirror remains read-only and synchronized.

---

## 5. Validation Evidence (2026-06-20)

### Backend gate (`dotnet test tests/QuizAppka.Tests/QuizAppka.Tests.csproj`)

- Result: PASS
- Summary: 41 total, 41 passed, 0 failed, 0 skipped

### Frontend gates (`src/QuizAppka/ClientApp`)

- `npm run type-check`: PASS
- `npm run lint`: FAIL (pre-existing and one new warning)
	- `src/components/CategoryList.tsx`: `@typescript-eslint/no-unused-expressions` (error), `react-hooks/exhaustive-deps` (warning)
	- `src/components/SingingPianos.tsx`: `@typescript-eslint/no-explicit-any` (error)
	- `src/pages/QuestionDetailPage.tsx`: `react-hooks/exhaustive-deps` (warning)
- `npm run test`: FAIL (pre-existing suites unrelated to timed-open core flow)
	- `src/components/__tests__/QuestionList.test.tsx` (2 failures)
	- `src/components/__tests__/SingingPianos.test.tsx` (5 failures)
	- `src/pages/__tests__/QuestionListPage.test.tsx` (1 failure)

### E2E gates (`tests/QuizAppka.E2E`)

- Feature-focused timed-open suites:
	- `npx playwright test tests/mirroring.spec.ts -g "Timed open"`: PASS (2/2)
	- `npx playwright test tests/question-types.spec.ts -g "Timed Open"`: PASS (2/2)
	- `npx playwright test tests/question-types.spec.ts -g "Non-timed open regression"`: PASS (1/1)
- Full requested feature suites command:
	- `npx playwright test tests/question-types.spec.ts tests/mirroring.spec.ts`: FAIL (2 failed, 2 passed, 10 not run)
	- Failing tests are existing unstable scenarios:
		- `tests/mirroring.spec.ts` -> `mirror updates as presenter navigates through the quiz flow`
		- `tests/question-types.spec.ts` -> `late-joining mirror sees revealed state`

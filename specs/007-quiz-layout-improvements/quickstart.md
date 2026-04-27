# Quickstart: Quiz Layout Improvements

**Branch**: `007-quiz-layout-improvements`  
**Feature**: Frontend-only layout improvements — MUI Grid, typography scale, image fill, block-style options

---

## Prerequisites

- Node.js 20+ installed
- .NET 9 SDK installed (for backend/Aspire host if running full stack)
- `npm install` already run in `src/QuizAppka/ClientApp/`

---

## Run the Frontend Dev Server

```pwsh
cd src\QuizAppka\ClientApp
npm run dev
```

Open `http://localhost:5173` in a browser.

For the mirror view, open `http://localhost:5173/mirror` in a second browser window (or second screen).

---

## Run Frontend Tests

```pwsh
cd src\QuizAppka\ClientApp
npm run test
```

Runs all Vitest component and page tests. All tests should pass with no failures.

---

## Run Linting

```pwsh
cd src\QuizAppka\ClientApp
npm run lint
```

---

## Run Type Check

```pwsh
cd src\QuizAppka\ClientApp
npm run type-check
```

---

## Run Full Quality Gate (all three checks)

```pwsh
cd src\QuizAppka\ClientApp
npm run lint; npm run type-check; npm run test
```

All three commands must exit with code 0 before the feature is considered ready for merge.

---

## Manual Verification Checklist

After implementing the tasks in `tasks.md`, verify the following manually in a browser:

### Mirror View (`/mirror`)
- [ ] Open the mirror page in a maximised browser window (simulate projector).
- [ ] Use the presenter view to navigate to any **open question** — confirm prompt text is very large (h2-scale) and fills the screen.
- [ ] Navigate to a **closed question** — confirm prompt is large and each answer option appears as a distinct card block.
- [ ] Navigate to an **image rebus** — confirm the image fills most of the available height without cropping.
- [ ] Navigate to a **meme question** — confirm image fills height; confirm answer options are card blocks.
- [ ] Navigate to a **singing pianos** question — confirm boxes are arranged in a uniform 4-per-row grid with large labels.
- [ ] Confirm no Back buttons or presenter hint text is visible on the mirror view for any question type.

### Presenter View (`/quiz/:categoryId/:questionId`)
- [ ] Open a **closed question** — confirm prompt is noticeably larger than body text; options are card blocks.
- [ ] Open an **image rebus** — confirm image is larger than before but does not overflow the viewport.
- [ ] Confirm the presenter hint is still visible below the question when present.
- [ ] Confirm Back navigation buttons are visible and functional.
- [ ] Confirm the 10-column layout leaves a visible 1-column margin on each side.

### Category & Question List Pages
- [ ] Home page (`/`) — confirm categories are displayed with clear separation and the page uses the 10-column layout.
- [ ] Question list page — confirm question entries are numbered and have readable spacing.

---

## Key Files Changed

| File | Change |
|------|--------|
| `src/components/QuestionDisplay.tsx` | Adds `displayMode` prop, forwards to children |
| `src/components/OpenQuestion.tsx` | Typography scale from `displayMode`; hint hidden in mirror |
| `src/components/ClosedQuestion.tsx` | Block-style `Paper` options; typography from `displayMode` |
| `src/components/ImageRebusQuestion.tsx` | `vh`-based image height; `displayMode` typography |
| `src/components/MemeQuestion.tsx` | `vh`-based image height; block options; `displayMode` |
| `src/components/SingingPianos.tsx` | MUI `Grid` box layout; `displayMode` typography |
| `src/pages/HomePage.tsx` | Replaces `Container` with `Box` + `Grid size={10} offset={1}` |
| `src/pages/QuestionListPage.tsx` | Same Grid wrapper replacement |
| `src/pages/QuestionDetailPage.tsx` | Same Grid wrapper; no `displayMode` passed |
| `src/pages/MirrorPage.tsx` | Same Grid wrapper; passes `displayMode='mirror'` on question-detail |

# Quickstart: Question List Navigation

**Feature**: 002-question-list-navigation  
**Date**: 2026-03-26

---

## Prerequisites

- .NET 10 SDK
- Node.js 20+
- Playwright browsers installed for E2E tests

---

## Run the Application

```powershell
# Option A — via Aspire AppHost (recommended for development)
cd src/QuizAppka.AppHost
dotnet run

# Option B — run the web app directly
cd src/QuizAppka
dotnet run
# Then open: https://localhost:7001
```

The React SPA is served from `/wwwroot`. To develop frontend with hot reload:

```powershell
cd src/QuizAppka/ClientApp
npm install
npm run dev
# Vite proxies /api calls to https://localhost:7001
```

---

## Navigation Flow (new behavior after this feature)

1. Open the app → **Category List** (`/`)
2. Click a category → **Question List** (`/quiz/:categoryId`)
3. Click a question → **Question Detail** (`/quiz/:categoryId/:questionId`)
4. Click **Back** → returns to Question List (`/quiz/:categoryId`)

Previous/next buttons no longer exist.

---

## Run All Tests

### Frontend (component tests)
```powershell
cd src/QuizAppka/ClientApp
npm run test
# or for watch mode:
npm run test -- --watch
```

Key test files after this feature:
- `src/components/__tests__/QuestionList.test.tsx` — NEW
- `src/pages/__tests__/QuestionListPage.test.tsx` — NEW
- `src/pages/__tests__/QuestionDetailPage.test.tsx` — NEW
- `src/components/__tests__/QuestionDisplay.test.tsx` — unchanged

### Backend (unit tests)
```powershell
cd tests/QuizAppka.Tests
dotnet test
```

### End-to-End Tests (Playwright)
```powershell
# Ensure the application is running first (see above), then:
cd tests/QuizAppka.E2E
npx playwright test
# View report:
npx playwright show-report
```

Key E2E flows to verify:
1. Home → select category → question list displayed (not first question)
2. Question list → select question → question detail displayed
3. Question detail → back action → question list displayed with same entries
4. Question list → select different question → correct question displayed

---

## Validate TypeScript + Lint

```powershell
cd src/QuizAppka/ClientApp
npm run build   # TypeScript compile + Vite build; fails on type errors
npx eslint src  # Lint check
```

---

## Aspire 13 Upgrade Verification

After upgrading `Aspire.Hosting.AppHost` to `13.*`:

```powershell
cd src/QuizAppka.AppHost
dotnet restore
dotnet build
dotnet run
# Aspire dashboard should open at the displayed URL
```

---

## Development Notes

- `QuestionListPage` fetches the full category via `GET /api/quiz/categories/{id}` (same endpoint as before) and renders the `QuestionList` component.
- `QuestionDetailPage` fetches the same endpoint and resolves the question by `id` client-side — no new API endpoint.
- `NavigationBar.tsx` is deleted. If the file remains, delete it to avoid dead code.
- `QuizPage.tsx` is deleted and replaced by the two new pages.
- Desktop layout is enforced via `Container maxWidth="lg"` in page components and a `min-width` baseline in `index.css`.
</content>

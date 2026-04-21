# Quickstart: Category List Navigation Access

**Feature**: 004-category-list-navigation  
**Date**: 2026-04-20

---

## Prerequisites

- .NET 10 SDK
- Node.js 20+

---

## Run the Application

```powershell
# Option A — via Aspire AppHost (recommended for development)
cd src/QuizAppka.AspireHost/QuizAppka.AspireHost.AppHost
dotnet run

# Option B — run the web app directly
cd src/QuizAppka
dotnet run
# Then open: https://localhost:7001
```

To develop the frontend with hot reload:

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
   - New: click **← Back to categories** button → returns to Category List (`/`)
3. Click a question → **Question Detail** (`/quiz/:categoryId/:questionId`)
   - New: click **← Back to categories** button → returns directly to Category List (`/`)
   - Existing: click **← Back to questions** button → returns to Question List (`/quiz/:categoryId`)

---

## Run All Tests

### Frontend (component tests)
```powershell
cd src/QuizAppka/ClientApp
npm run test
# or for watch mode:
npm run test -- --watch
```

Key test files modified by this feature:
- `src/pages/__tests__/QuestionListPage.test.tsx` — MODIFIED: new button presence + navigation cases
- `src/pages/__tests__/QuestionDetailPage.test.tsx` — MODIFIED: new button presence + navigation cases

### Backend (unit tests — no changes expected)
```powershell
cd tests/QuizAppka.Tests
dotnet test
```

---

## Verifying the Feature Manually

1. Run the app.
2. Open the app at `/`.
3. Click any category — confirm the question list page loads.
4. Confirm a **"← Back to categories"** button is visible.
5. Click it — confirm you return to `/` (category list).
6. Click a category again, then click a question — confirm the question detail page loads.
7. Confirm both **"← Back to categories"** and **"← Back to questions"** buttons are visible.
8. Click **"← Back to categories"** — confirm you return directly to `/`.
9. Repeat step 6–7, click **"← Back to questions"** — confirm you return to the question list.

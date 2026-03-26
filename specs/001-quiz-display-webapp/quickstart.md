# Quickstart: Quiz Display Web Application

**Feature**: Quiz Question Presentation  
**Branch**: `001-quiz-display-webapp`  
**Date**: 2026-03-26

---

## Prerequisites

| Tool | Required Version | Check |
|------|-----------------|-------|
| .NET SDK | 10.0+ | `dotnet --version` |
| Node.js | 20+ LTS | `node --version` |
| npm | 10+ | `npm --version` |

> **Note**: .NET Aspire is included as a NuGet package (`Aspire.Hosting.AppHost`) — no workload installation required.

---

## Repository Structure

```
quizappka/
├── src/
│   ├── QuizAppka/                    # ASP.NET Core 10 web project
│   │   ├── ClientApp/                # Vite React TypeScript source
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Data/categories/          # Quiz JSON data files
│   │   ├── wwwroot/images/rebus/     # Rebus question images
│   │   └── QuizAppka.csproj
│   └── QuizAppka.AppHost/            # .NET Aspire orchestration project
│       └── QuizAppka.AppHost.csproj
├── tests/
│   ├── QuizAppka.Tests/              # Backend xUnit tests
│   └── QuizAppka.E2E/                # Playwright end-to-end tests
└── QuizAppka.sln
```

---

## Running in Development

### Option A: With Aspire (recommended)

```sh
cd src/QuizAppka.AppHost
dotnet run
```

Aspire launches the web application and opens the **Aspire Dashboard** (typically at `https://localhost:15888`). The dashboard shows service status, logs, and traces.

The SPA proxy automatically starts the Vite dev server (`npm run dev` inside `ClientApp/`).  
Open the application at the HTTPS URL shown in Aspire Dashboard (e.g., `https://localhost:7001`).

### Option B: Web project directly (without Aspire)

First, install frontend dependencies (once):

```sh
cd src/QuizAppka/ClientApp
npm install
```

Then start the backend:

```sh
cd src/QuizAppka
dotnet run
```

The SPA proxy starts Vite automatically. Watch the console for both URLs:
- Backend: `https://localhost:7001`
- Vite dev server: `http://localhost:5173` (proxied; you should access via the backend URL)

---

## Adding Quiz Content

### Adding a new category

1. Create a JSON file in `src/QuizAppka/Data/categories/`:

```json
{
  "id": "my-category",
  "name": "My Quiz Category",
  "questions": [
    {
      "id": "q1",
      "type": "open",
      "prompt": "What is the capital of France?"
    },
    {
      "id": "q2",
      "type": "closed",
      "prompt": "Which planet is closest to the Sun?",
      "options": [
        { "id": "a", "text": "Venus" },
        { "id": "b", "text": "Mercury" },
        { "id": "c", "text": "Earth" }
      ]
    }
  ]
}
```

2. Restart the application (data is loaded at startup).

### Adding images for rebus questions

1. Place image files in `src/QuizAppka/wwwroot/images/rebus/`.
2. Reference them in the JSON using a relative path fragment:

```json
{
  "id": "q3",
  "type": "image-rebus",
  "prompt": "What concept do these symbols represent?",
  "imageRef": "rebus/my-category-q3.png"
}
```

---

## Building for Production

```sh
# Build frontend first
cd src/QuizAppka/ClientApp
npm run build        # outputs to ../wwwroot (configured in vite.config.ts)

# Then publish backend
cd ../../..
dotnet publish src/QuizAppka/QuizAppka.csproj -c Release -o ./publish
```

The `publish/` directory contains a self-contained deployment. Run with:

```sh
./publish/QuizAppka
```

---

## Running Tests

### Backend unit + integration tests

```sh
cd tests/QuizAppka.Tests
dotnet test
```

### Frontend type check + component tests

```sh
cd src/QuizAppka/ClientApp
npm run type-check   # tsc --noEmit
npm run test         # vitest run
```

### End-to-end tests (Playwright)

Ensure the application is running before executing E2E tests.

```sh
# Install Playwright browsers (first time)
cd tests/QuizAppka.E2E
npx playwright install

# Run tests
npx playwright test
```

### All quality gates (CI equivalent)

```sh
# Backend
dotnet format --verify-no-changes src/QuizAppka/QuizAppka.csproj
dotnet test tests/QuizAppka.Tests/QuizAppka.Tests.csproj

# Frontend
cd src/QuizAppka/ClientApp
npm run lint
npm run type-check
npm run test

# E2E (requires running app)
cd ../../tests/QuizAppka.E2E
npx playwright test
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ASPNETCORE_ENVIRONMENT` | `Development` | Controls SPA proxy activation |
| `ASPNETCORE_URLS` | `https://localhost:7001` | Backend HTTPS binding |

The SPA proxy is active only when `ASPNETCORE_ENVIRONMENT=Development`.

---

## Troubleshooting

**Vite dev server does not start automatically**  
- Ensure `npm install` has been run in `ClientApp/`.
- Check that `SpaProxyLaunchCommand` in `src/QuizAppka/QuizAppka.csproj` matches the npm script name (`npm run dev`).

**HTTPS certificate errors in browser**  
```sh
dotnet dev-certs https --trust
```

**Categories not loading**  
- Verify JSON files are in `src/QuizAppka/Data/categories/` and follow the correct schema.
- Check application logs for parse warnings.
- Restart the application after adding new category files.

**Image not displaying (rebus question)**  
- Confirm the image file exists at `src/QuizAppka/wwwroot/images/{imageRef}`.
- Check the browser network tab for the correct URL being requested.

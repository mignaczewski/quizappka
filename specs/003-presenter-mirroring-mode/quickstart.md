# Quickstart: Presenter Mirroring Mode

**Feature**: 003-presenter-mirroring-mode  
**Branch**: `003-presenter-mirroring-mode`  
**Date**: 2026-03-26

---

## Prerequisites

- .NET 10 SDK
- Node.js 20+ with npm
- All dependencies restored:
  ```bash
  cd src/QuizAppka/ClientApp && npm install
  cd ../../../ && dotnet restore
  ```

---

## Running the Application

```bash
dotnet run --project src/QuizAppka/QuizAppka.csproj
```

The .NET host starts the backend and launches the Vite dev server automatically via the SPA proxy.

- **Presenter view**: http://localhost:5173 (or the port shown in the terminal)
- **Mirror view**: http://localhost:5173/mirror

Open both URLs simultaneously in separate browser windows or tabs to see mirroring in action.

---

## Development Workflow

### Backend changes (C#)

```bash
dotnet build src/QuizAppka
dotnet run --project src/QuizAppka
```

### Frontend changes (TypeScript/React)

Vite HMR is active during `dotnet run`. Edit any file under `src/QuizAppka/ClientApp/src/` and the browser refreshes automatically.

### Adding the `@microsoft/signalr` npm package

```bash
cd src/QuizAppka/ClientApp
npm install @microsoft/signalr
```

### Adding SignalR client NuGet for tests

```bash
dotnet add tests/QuizAppka.Tests/QuizAppka.Tests.csproj package Microsoft.AspNetCore.SignalR.Client
```

---

## Running Tests

### Backend unit + integration tests

```bash
dotnet test
```

Individual test filter:
```bash
dotnet test --filter "FullyQualifiedName~PresenterHub"
dotnet test --filter "FullyQualifiedName~PresenterSessionStore"
```

### Frontend unit tests

```bash
cd src/QuizAppka/ClientApp
npm run test
```

### Frontend type check and lint

```bash
cd src/QuizAppka/ClientApp
npm run type-check
npm run lint
```

### E2E tests (Playwright)

Ensure the app is running before executing E2E tests:

```bash
# Terminal 1
dotnet run --project src/QuizAppka

# Terminal 2
cd tests/QuizAppka.E2E
npx playwright test

# Run only mirroring tests
npx playwright test mirroring
```

---

## Key File Locations (Post-Implementation)

| File | Purpose |
|------|---------|
| `src/QuizAppka/Hubs/PresenterHub.cs` | SignalR hub — receives presenter state, stores it, broadcasts to all clients |
| `src/QuizAppka/Services/IPresenterSessionStore.cs` | Interface for the singleton state store |
| `src/QuizAppka/Services/PresenterSessionStore.cs` | Singleton in-memory state store; thread-safe read/write |
| `src/QuizAppka/Models/PresenterStateDto.cs` | C# record for the SignalR payload |
| `src/QuizAppka/Program.cs` | Registration: `AddSignalR()`, `MapHub<PresenterHub>("/hubs/presenter")` |
| `src/QuizAppka/ClientApp/src/services/presenterHub.ts` | Frontend hub connection factory (WebSocket only, auto-reconnect) |
| `src/QuizAppka/ClientApp/src/hooks/usePresenterSession.ts` | Hook for presenter pages to broadcast state on mount/param change |
| `src/QuizAppka/ClientApp/src/pages/MirrorPage.tsx` | Read-only mirror view; subscribes to SignalR; no navigation controls |
| `src/QuizAppka/ClientApp/src/App.tsx` | Adds `/mirror` route |
| `tests/QuizAppka.Tests/Hubs/PresenterHubTests.cs` | Hub integration tests |
| `tests/QuizAppka.Tests/Services/PresenterSessionStoreTests.cs` | Unit tests for the state store |
| `tests/QuizAppka.E2E/tests/mirroring.spec.ts` | End-to-end Playwright tests for full presenter+mirror flow |

---

## Manual Smoke Test

1. Start the app: `dotnet run --project src/QuizAppka`
2. Open **Tab A**: http://localhost:5173 (presenter — category list visible)
3. Open **Tab B**: http://localhost:5173/mirror (mirror — should immediately show the category list)
4. In Tab A, click any category — Tab B should update to the question list
5. In Tab A, click any question — Tab B should update to that question (no back button visible)
6. Open **Tab C**: http://localhost:5173/mirror — Tab C should immediately show the same question as Tab A/B
7. In Tab A, click ← Back — Tabs B and C should both return to the question list
8. Simulate disconnect: close Tab A, wait, reopen it — Tabs B and C should recover automatically

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Mirror stuck on idle state | Presenter hub connection not started | Check browser console for SignalR connection errors; verify `/hubs/presenter` responds to WebSocket upgrade |
| `WebSocket transport error` on mirror load | WebSocket blocked by reverse proxy or missing `UseWebSockets()` | Verify `app.UseWebSockets()` is called before `app.MapHub<PresenterHub>(...)` if using a standalone proxy |
| Mirror shows stale state after presenter navigates | `StateUpdated` event not subscribed | Check `MirrorPage.tsx` subscribes before calling `connection.start()` |
| Hub tests fail with "Cannot connect to WebSockets" | `WebApplicationFactory` not configured for WebSockets | Ensure `factory.Server.CreateWebSocketClient()` or `HttpMessageHandlerFactory` is used in `HubConnectionBuilder` options |

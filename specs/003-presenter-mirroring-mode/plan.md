# Implementation Plan: Presenter Mirroring Mode

**Branch**: `003-presenter-mirroring-mode` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/003-presenter-mirroring-mode/spec.md`

## Summary

Add a mirroring mode to the quiz presenter application. A dedicated `/mirror` route opens in any new browser tab or window and displays a read-only, navigation-control-free copy of whatever the presenter is currently viewing (category list, question list, or a specific question). The mirror stays synchronized with the presenter in real time via a **SignalR hub over WebSocket transport only** (no long polling fallback). Multiple simultaneous mirror views are supported. A singleton server-side state store enables late-joining mirrors to receive the current presenter state immediately on connection.

## Technical Context

**Language/Version**: C# / .NET 10 (backend), TypeScript 5.8 / React 19 (frontend)  
**Primary Dependencies**:
- Backend: ASP.NET Core SignalR (built-in to `Microsoft.AspNetCore.SignalR`, no additional NuGet package); `Microsoft.AspNetCore.SignalR.Client` for integration tests
- Frontend: `@microsoft/signalr` (npm) for the WebSocket-only hub client connection
- Frontend (existing): React Router v7, MUI v7, Vitest, @testing-library/react
- E2E: Playwright (existing)

**Storage**: No database. Server-side state is held in a singleton in-memory `IPresenterSessionStore` for the lifetime of the process. State is intentionally ephemeral — a server restart resets to idle.  
**Testing**: xUnit + `WebApplicationFactory` (backend); Vitest + @testing-library/react (frontend); Playwright (E2E)  
**Target Platform**: Desktop browser (Chrome/Edge/Firefox) on local network; ASP.NET Core on .NET 10  
**Project Type**: Web application (single .NET project with embedded React/Vite ClientApp)  
**Performance Goals**: Mirror latency ≤ 1 second under local network conditions (SC-002); ≥5 simultaneous mirrors without visible lag (SC-003)  
**Constraints**: WebSocket transport only — `HttpTransportType.WebSockets` enforced on the frontend client builder; no `SignalR.EnableDetailedErrors` enabled in production  
**Scale/Scope**: Single active presenter session; ≤10 simultaneous mirrors on local network

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Contract scope identified for frontend, backend, and shared schemas | **PASS** | SignalR hub contract (`contracts/signalr-hub.md`) documents all hub methods, events, payloads, and failure behavior for both presenter and mirror clients |
| Quality gates listed explicitly | **PASS** | Backend: `dotnet test`; Frontend: `npm run lint && npm run type-check && npm run test`; E2E: `npx playwright test` |
| Test strategy defined before implementation | **PASS** | See Test Strategy section below |
| Cross-layer changes include real integration validation, not only mocks | **PASS** | SignalR hub integration tests use `WebApplicationFactory` with a real SignalR client connected over WebSocket; E2E tests run full presenter + mirror flow |
| Any constitution exception documented | **PASS** | No exceptions required |

### Test Strategy

| Layer | Tool | Coverage |
|-------|------|----------|
| Backend unit | xUnit | `PresenterSessionStore`: state read/write, concurrent access; `PresenterHub.UpdateState` logic |
| Backend integration | xUnit + `WebApplicationFactory` + `HubConnection` | Hub accepts state from presenter client and broadcasts it to mirror client; late-join mirror receives current state on `OnConnectedAsync` |
| Frontend unit | Vitest + @testing-library/react | `MirrorPage` renders correct view for each `PresenterState` variant; navigation controls absent; idle state shown when no active session |
| Frontend unit | Vitest | `usePresenterSession` hook: emits correct state on mount/navigation for each presenter page |
| E2E | Playwright | Full flow: presenter navigates (category → question list → question → back); open mirror tab; verify it mirrors each step; open a second mirror tab and verify both update |

## Project Structure

### Documentation (this feature)

```text
specs/003-presenter-mirroring-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── signalr-hub.md   # Phase 1 output — SignalR hub contract
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/QuizAppka/
├── Hubs/
│   └── PresenterHub.cs          # NEW — SignalR hub; broadcasts PresenterStateDto; handles late-join
├── Services/
│   ├── IPresenterSessionStore.cs  # NEW — interface for current-state store
│   ├── PresenterSessionStore.cs   # NEW — singleton in-memory state store
│   ├── IQuizDataService.cs        # unchanged
│   └── QuizDataService.cs         # unchanged
├── Models/
│   └── PresenterStateDto.cs       # NEW — serialized hub payload (screen + optional ids)
├── Controllers/
│   └── QuizController.cs          # unchanged
└── Program.cs                     # MODIFIED — AddSignalR, MapHub, WebSocket transport policy

src/QuizAppka/ClientApp/src/
├── pages/
│   ├── MirrorPage.tsx             # NEW — read-only mirror view; subscribes to hub; no nav controls
│   ├── HomePage.tsx               # MODIFIED — emits state via usePresenterSession on mount
│   ├── QuestionListPage.tsx       # MODIFIED — emits state via usePresenterSession on mount
│   └── QuestionDetailPage.tsx     # MODIFIED — emits state via usePresenterSession on mount
├── services/
│   ├── quizApi.ts                 # unchanged
│   └── presenterHub.ts            # NEW — HubConnection factory (WebSocket only, auto-reconnect)
├── hooks/
│   └── usePresenterSession.ts     # NEW — hook used by presenter pages to broadcast state
└── App.tsx                        # MODIFIED — add /mirror route

tests/QuizAppka.Tests/
├── Hubs/
│   └── PresenterHubTests.cs       # NEW — hub integration tests via WebApplicationFactory
├── Services/
│   ├── PresenterSessionStoreTests.cs  # NEW — unit tests
│   └── QuizDataServiceTests.cs       # unchanged
└── Controllers/
    └── QuizControllerTests.cs         # unchanged

tests/QuizAppka.E2E/tests/
├── mirroring.spec.ts              # NEW — full presenter+mirror E2E flow
├── category-selection.spec.ts     # unchanged
└── navigation.spec.ts             # unchanged
```

**Structure Decision**: Single .NET project with embedded React/Vite frontend — matches the existing layout established in feature 001. New backend code follows the `Services/` and `Controllers/` conventions already in place, with a new `Hubs/` directory for SignalR hubs to maintain separation of concerns.

## Complexity Tracking

> No constitution gate violations — table not required.
